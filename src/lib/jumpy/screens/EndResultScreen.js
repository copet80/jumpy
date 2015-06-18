/**
 * End result screen shows game end results.
 *
 * @author Anthony Tambrin
 */
define([
    "./BaseScreen",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary",
    "jumpy/controls/Button"
], function(
    BaseScreen,
    GameConfig,
    SpriteDictionary,Button
) {
    // ===========================================
    //  Event Types
    // ===========================================
    /**
     * Dispatched when play button is clicked.
     * @type {string}
     */
    EndResultScreen.PLAY_CLICK = "playClick";

    /**
     * Dispatched when 1st, 2nd, or 3rd text landed on the screen.
     * @type {string}
     */
    EndResultScreen.SMASH_SCREEN = "smashScreen";

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Play button.
     * @type {Button}
     */
    EndResultScreen.prototype._btnPlay = null;

    /**
     * @private
     * Combined 1st, 2nd, 3rd text shown on lose.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._ranksText = null;

    /**
     * @private
     * Winning 1st text.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._rank1stText = null;

    /**
     * @private
     * Winning 2nd text.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._rank2ndText = null;

    /**
     * @private
     * Winning 3rd text.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._rank3rdText = null;

    /**
     * @private
     * Better luck text.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._betterLuckText = null;

    /**
     * @private
     * Oops text.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._oopsText = null;

    /**
     * @private
     * Well done text.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._wellDoneText = null;

    /**
     * @private
     * "You came..." text.
     * @type {createjs.Bitmap}
     */
    EndResultScreen.prototype._youCameText = null;

    /**
     * @private
     * Loop state, paused or not.
     * @type {boolean}
     */
    EndResultScreen.prototype._isPaused = null;

    /**
     * @private
     * Shake value (radius distance offset from [0, 0] position).
     * @type {number}
     */
    EndResultScreen.prototype._shake = 0;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @inheritDoc
     */
    function EndResultScreen(id) {
        BaseScreen.call(this, id);
    }

    // Extends the parent class
    EndResultScreen.prototype = Object.create(BaseScreen.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Unique ID of the currently chosen team.
     * @type {string}
     */
    EndResultScreen.prototype.__defineGetter__("shake", function() {
        return this._shake;
    });
    /**
     * @private
     */
    EndResultScreen.prototype.__defineSetter__("shake", function(value) {
        this._shake = value;
        this.clip.x = this._shake * Math.random();
        this.clip.y = this._shake * Math.random();
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    EndResultScreen.prototype.invalidate = function() {
        var success = BaseScreen.prototype.invalidate.call(this);

        if (this._btnPlay) {
            if (!this._btnPlay.invalidate()) {
                success = false;
            }
            this._btnPlay.clip.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._btnPlay.clip.y = GameConfig.VIEWPORT_HEIGHT * 0.75;
        }
        if (this._wellDoneText) {
            if (this._wellDoneText.width === 0) {
                success = false;
            }
            this._wellDoneText.regX = this._wellDoneText.image.width * 0.5;
            this._wellDoneText.regY = this._wellDoneText.image.height * 0.5;
            this._wellDoneText.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._wellDoneText.y = GameConfig.VIEWPORT_HEIGHT * 0.2;
        }
        if (this._youCameText) {
            if (this._youCameText.width === 0) {
                success = false;
            }
            this._youCameText.regX = this._youCameText.image.width * 0.5;
            this._youCameText.regY = this._youCameText.image.height * 0.5;
            this._youCameText.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._youCameText.y = GameConfig.VIEWPORT_HEIGHT * 0.3;
        }
        if (this._rank1stText) {
            if (this._rank1stText.width === 0) {
                success = false;
            }
            this._rank1stText.regX = this._rank1stText.image.width * 0.5;
            this._rank1stText.regY = this._rank1stText.image.height * 0.5;
            this._rank1stText.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._rank1stText.y = GameConfig.VIEWPORT_HEIGHT * 0.48;
        }
        if (this._rank2ndText) {
            if (this._rank1stText.width === 0) {
                success = false;
            }
            this._rank2ndText.regX = this._rank2ndText.image.width * 0.5;
            this._rank2ndText.regY = this._rank2ndText.image.height * 0.5;
            this._rank2ndText.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._rank2ndText.y = GameConfig.VIEWPORT_HEIGHT * 0.48;
        }
        if (this._rank3rdText) {
            if (this._rank3rdText.width === 0) {
                success = false;
            }
            this._rank3rdText.regX = this._rank3rdText.image.width * 0.5;
            this._rank3rdText.regY = this._rank3rdText.image.height * 0.5;
            this._rank3rdText.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._rank3rdText.y = GameConfig.VIEWPORT_HEIGHT * 0.48;
        }

        return success;
    };

    /**
     * Resets the states of all elements.
     */
    EndResultScreen.prototype.reset = function() {
        this._btnPlay.clip.visible = false;
        this._rank1stText.visible = false;
        this._rank2ndText.visible = false;
        this._rank3rdText.visible = false;
        this._ranksText.visible = false;
        this._wellDoneText.visible = false;
        this._youCameText.visible = false;
        this._oopsText.visible = false;
        this._betterLuckText.visible = false;

        createjs.Tween.removeTweens(this._rank1stText);
        createjs.Tween.removeTweens(this._rank2ndText);
        createjs.Tween.removeTweens(this._rank3rdText);
        createjs.Tween.removeTweens(this._ranksText);
        createjs.Tween.removeTweens(this._wellDoneText);
        createjs.Tween.removeTweens(this._youCameText);
        createjs.Tween.removeTweens(this._oopsText);
        createjs.Tween.removeTweens(this._betterLuckText);
        createjs.Tween.removeTweens(this._btnPlay.clip);

        this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 1;
        this._rank1stText.scaleX = this._rank1stText.scaleY = 1;
        this._rank2ndText.scaleX = this._rank2ndText.scaleY = 1;
        this._rank3rdText.scaleX = this._rank3rdText.scaleY = 1;
        this._ranksText.scaleX = this._ranksText.scaleY = 1;
        this._wellDoneText.scaleX = this._wellDoneText.scaleY = 1;
        this._youCameText.scaleX = this._youCameText.scaleY = 1;
        this._oopsText.scaleX = this._oopsText.scaleY = 1;
        this._betterLuckText.scaleX = this._betterLuckText.scaleY = 1;
    };

    /**
     * Pauses the screen.
     */
    EndResultScreen.prototype.pause = function() {
        this._isPaused = true;

        if (this._btnPlay.clip.visible && !createjs.Tween.hasActiveTweens(this._btnPlay.clip)) {
            createjs.Tween.removeTweens(this._btnPlay.clip);
            this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 1;
        }
    };

    /**
     * Resumes the screen.
     */
    EndResultScreen.prototype.resume = function() {
        this._isPaused = false;

        if (this._btnPlay.clip.visible && !createjs.Tween.hasActiveTweens(this._btnPlay.clip)) {
            createjs.Tween.removeTweens(this._btnPlay.clip);
            this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 1;
            createjs.Tween.get(this._btnPlay.clip, { loop: true })
                .to({ scaleX: 1.1, scaleY: 1.1 }, 500, createjs.Ease.sineInOut)
                .to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.sineInOut);
        }
    };

    /**
     * Shows win/lose and ranks.
     * @param {string} myPeerId My peer ID.
     * @param {string[]} Peer ID array in order of the ranks.
     */
    EndResultScreen.prototype.showRanks = function(myPeerId, ranks) {
        var myRank = ranks.indexOf(myPeerId);
        switch (myRank) {
            case 0: this._showWin1st(); break;
            case 1: this._showWin2nd(); break;
            case 2: this._showWin3rd(); break;
            default: this._showLose(); break;
        }
    };

    /**
     * Main loop logic.
     */
    EndResultScreen.prototype.update = function() {
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
    EndResultScreen.prototype._initClip = function() {
        BaseScreen.prototype._initClip.call(this);

        this._btnPlay = new Button("btnPlay", SpriteDictionary.BITMAP_PLAY_AGAIN_BUTTON);
        this._btnPlay.ref = this;
        this.clip.addChild(this._btnPlay.clip);

        this._rank1stText = new createjs.Bitmap(SpriteDictionary.BITMAP_1ST_TEXT);
        this.clip.addChild(this._rank1stText);

        this._rank2ndText = new createjs.Bitmap(SpriteDictionary.BITMAP_2ND_TEXT);
        this.clip.addChild(this._rank2ndText);

        this._rank3rdText = new createjs.Bitmap(SpriteDictionary.BITMAP_3RD_TEXT);
        this.clip.addChild(this._rank3rdText);

        this._ranksText = new createjs.Bitmap(SpriteDictionary.BITMAP_1_2_3_TEXT);
        this.clip.addChild(this._ranksText);

        this._wellDoneText = new createjs.Bitmap(SpriteDictionary.BITMAP_WELL_DONE_TEXT);
        this.clip.addChild(this._wellDoneText);

        this._youCameText = new createjs.Bitmap(SpriteDictionary.BITMAP_YOU_CAME_TEXT);
        this.clip.addChild(this._youCameText);

        this._oopsText = new createjs.Bitmap(SpriteDictionary.BITMAP_OOPS_TEXT);
        this.clip.addChild(this._oopsText);

        this._betterLuckText = new createjs.Bitmap(SpriteDictionary.BITMAP_LUCK_TEXT);
        this.clip.addChild(this._betterLuckText);

        this.reset();
    };

    /**
     * @inheritDoc
     */
    EndResultScreen.prototype._addListeners = function() {
        BaseScreen.prototype._addListeners.call(this);
        this._btnPlay.on(Button.CLICK, onPlayButtonClick);
    };

    /**
     * @private
     */
    EndResultScreen.prototype._showWin = function(winText) {
        this.reset();

        this._wellDoneText.scaleX = this._wellDoneText.scaleY = 0;
        this._wellDoneText.visible = true;
        createjs.Tween.get(this._wellDoneText)
            .wait(500)
            .to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.elasticOut);

        this._youCameText.scaleX = this._youCameText.scaleY = 0;
        this._youCameText.visible = true;
        createjs.Tween.get(this._youCameText)
            .wait(1000)
            .to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.elasticOut);

        winText.scaleX = winText.scaleY = 20;
        winText.visible = true;
        winText.alpha = 0;
        createjs.Tween.get(winText)
            .wait(1500)
            .to({ scaleX: 1, scaleY: 1, alpha: 1 }, 1000, createjs.Ease.quartIn)
            .call(function() {
                this.dispatchEvent(new createjs.Event(EndResultScreen.SMASH_SCREEN));
            }.bind(this));

        this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 0;
        this._btnPlay.clip.visible = true;
        createjs.Tween.get(this._btnPlay.clip)
            .wait(3000)
            .to({ scaleX: 1, scaleY: 1 }, 1000, createjs.Ease.elasticOut)
            .call(function() {
                createjs.Tween.removeTweens(this._btnPlay.clip);
                this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 1;
                createjs.Tween.get(this._btnPlay.clip, { loop: true })
                    .to({ scaleX: 1.1, scaleY: 1.1 }, 500, createjs.Ease.sineInOut)
                    .to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.sineInOut);
            }.bind(this));
    };

    /**
     * @private
     */
    EndResultScreen.prototype._showWin1st = function() {
        this._showWin(this._rank1stText);
    };

    /**
     * @private
     */
    EndResultScreen.prototype._showWin2nd = function() {
        this._showWin(this._rank2ndText);
    };

    /**
     * @private
     */
    EndResultScreen.prototype._showWin3rd = function() {
        this._showWin(this._rank3rdText);
    };

    /**
     * @private
     */
    EndResultScreen.prototype._showLose = function(ranks) {
        this._showWin();
    };

    // ===========================================
    //  Events
    // ===========================================
    /**
     * @private
     */
    function onPlayButtonClick(event) {
        event.currentTarget.ref.dispatchEvent(new createjs.Event(EndResultScreen.PLAY_CLICK));
    }

    return EndResultScreen;
});