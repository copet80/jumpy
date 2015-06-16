/**
 * HUD screen shows indicator on players.
 *
 * @author Anthony Tambrin
 */
define([
    "./BaseScreen",
    "jumpy/core/GameConfig",
    "jumpy/core/Countdown",
    "jumpy/sprite/SpriteDictionary"
], function(
    BaseScreen,
    GameConfig,
    Countdown,
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
            this._timeText.y = 15;
        }
        if (this._countdown) {
            if (!this._countdown.invalidate()) {
                success = false;
            }
            this._countdown.clip.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._countdown.clip.y = this._timeText.image.height + 20;
        }

        return success;
    };

    /**
     * Resets the states of all elements.
     */
    HUDScreen.prototype.reset = function() {
        // TODO
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
    };

    // ===========================================
    //  Events
    // ===========================================

    return HUDScreen;
});