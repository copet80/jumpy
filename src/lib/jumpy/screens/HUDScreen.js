/**
 * HUD screen shows indicator on players.
 *
 * @author Anthony Tambrin
 */
define([
    "./BaseScreen",
    "jumpy/core/GameConfig",
    "jumpy/core/Countdown",
    "jumpy/core/NumericText",
    "jumpy/core/RankText",
    "jumpy/sprite/SpriteDictionary"
], function(
    BaseScreen,
    GameConfig,
    Countdown,
    NumericText,
    RankText,
    SpriteDictionary
) {
    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * The time when the game session will end in milliseconds. This is used only for showing countdown
     * and not to determine when the game actually ends.
     * @type {number}
     */
    HUDScreen.prototype.gameEndTime = null;

    /**
     * The difference between global time and client time.
     * @type {number}
     */
    HUDScreen.prototype.timeDiff = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Time text.
     * @type {createjs.Bitmap}
     */
    HUDScreen.prototype._timeText = null;

    /**
     * @private
     * Countdown counter.
     * @type {Countdown}
     */
    HUDScreen.prototype._countdown = null;

    /**
     * @private
     * Score label text.
     * @type {createjs.Bitmap}
     */
    HUDScreen.prototype._scoreText = null;

    /**
     * @private
     * Score value digits.
     * @type {NumericText}
     */
    HUDScreen.prototype._score = null;

    /**
     * @private
     * Rank label text.
     * @type {createjs.Bitmap}
     */
    HUDScreen.prototype._rankText = null;

    /**
     * @private
     * Rank value.
     * @type {RankText}
     */
    HUDScreen.prototype._rank = null;

    /**
     * @private
     * Loop state, paused or not.
     * @type {boolean}
     */
    HUDScreen.prototype._isPaused = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @inheritDoc
     */
    function HUDScreen(id) {
        BaseScreen.call(this, id);
    }

    // Extends the parent class
    HUDScreen.prototype = Object.create(BaseScreen.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Score value.
     * @type {number}
     */
    HUDScreen.prototype.__defineGetter__("score", function() {
        return this._score.value;
    });
    /**
     * @private
     */
    HUDScreen.prototype.__defineSetter__("score", function(value) {
        if (this._score.value !== value) {
            this._score.value = value;
        }
    });

    /**
     * Score value.
     * @type {number}
     */
    HUDScreen.prototype.__defineGetter__("rank", function() {
        return this._rank.value;
    });
    /**
     * @private
     */
    HUDScreen.prototype.__defineSetter__("rank", function(value) {
        if (this._rank.value !== value) {
            this._rank.value = value;
        }
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    HUDScreen.prototype.invalidate = function() {
        var success = BaseScreen.prototype.invalidate.call(this);

        if (this._timeText) {
            if (this._timeText.width === 0) {
                success = false;
            }
            this._timeText.regX = this._timeText.image.width * 0.5;
            this._timeText.regY = 0;
            this._timeText.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._timeText.y = 10;
        }
        if (this._countdown) {
            if (!this._countdown.invalidate()) {
                success = false;
            }
            this._countdown.clip.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._countdown.clip.y = this._timeText.image.height + 15;
        }
        if (this._scoreText) {
            if (this._scoreText.width === 0) {
                success = false;
            }
            this._scoreText.regX = this._scoreText.image.width * 0.5;
            this._scoreText.regY = 0;
            this._scoreText.x = GameConfig.VIEWPORT_WIDTH * 0.85;
            this._scoreText.y = 20;
        }
        if (this._score) {
            if (!this._score.invalidate()) {
                success = false;
            }
            this._score.clip.x = GameConfig.VIEWPORT_WIDTH * 0.85 + 5;
            this._score.clip.y = this._scoreText.image.height + 30;
        }
        if (this._rankText) {
            if (this._rankText.width === 0) {
                success = false;
            }
            this._rankText.regX = this._rankText.image.width * 0.5;
            this._rankText.regY = 0;
            this._rankText.x = GameConfig.VIEWPORT_WIDTH * 0.15;
            this._rankText.y = 20;
        }
        if (this._rank) {
            if (!this._rank.invalidate()) {
                success = false;
            }
            this._rank.clip.x = GameConfig.VIEWPORT_WIDTH * 0.15 + 5;
            this._rank.clip.y = this._rankText.image.height + 30;
        }

        return success;
    };

    /**
     * Resets the states of all elements.
     */
    HUDScreen.prototype.reset = function() {
        this.rank = 1;
    };

    /**
     * Pauses the screen.
     */
    HUDScreen.prototype.pause = function() {
        this._isPaused = true;
    };

    /**
     * Resumes the screen.
     */
    HUDScreen.prototype.resume = function() {
        this._isPaused = false;
    };

    /**
     * Main loop logic.
     */
    HUDScreen.prototype.update = function() {
        if (this._isPaused) {
            return;
        }

        if (typeof(this.gameEndTime) !== 'undefined' && !isNaN(this.gameEndTime)) {
            var now = new Date().getTime() + this.timeDiff;
            this._countdown.value = Math.floor((this.gameEndTime - now) * 0.001);
        }
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    HUDScreen.prototype._initClip = function() {
        BaseScreen.prototype._initClip.call(this);

        // time text
        this._timeText = new createjs.Bitmap(SpriteDictionary.BITMAP_TIME_TEXT);
        this.clip.addChild(this._timeText);

        // countdown counter
        this._countdown = new Countdown();
        this.clip.addChild(this._countdown.clip);

        // score label text
        this._scoreText = new createjs.Bitmap(SpriteDictionary.BITMAP_SCORE_TEXT);
        this.clip.addChild(this._scoreText);

        // score value
        this._score = new NumericText();
        this.clip.addChild(this._score.clip);

        // rank label text
        this._rankText = new createjs.Bitmap(SpriteDictionary.BITMAP_RANK_TEXT);
        this.clip.addChild(this._rankText);

        // rank value
        this._rank = new RankText();
        this.clip.addChild(this._rank.clip);

        this.rank = 1;
    };

    // ===========================================
    //  Events
    // ===========================================

    return HUDScreen;
});