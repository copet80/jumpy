/**
 * Title screen shows game logo and a play button.
 *
 * @author Anthony Tambrin
 */
define([
    "./BaseScreen",
    "jumpy/core/GameConfig",
    "jumpy/core/Countdown",
    "jumpy/sprite/SpriteDictionary",
    "jumpy/sound/SoundDictionary",
    "jumpy/sound/SoundManager",
    "jumpy/controls/Button"
], function(BaseScreen, GameConfig, Countdown, SpriteDictionary, SoundDictionary, SoundManager, Button) {
    // ===========================================
    //  Event Types
    // ===========================================
    /**
     * Dispatched when play button is clicked.
     * @type {string}
     */
    TitleScreen.PLAY_CLICK = "playClick";

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * The time when the next game session will start in milliseconds. This is used only for showing countdown
     * and not to determine when the game actually starts. The admin will mandate the actual start action.
     * @type {number}
     */
    TitleScreen.prototype.gameStartTime = null;

    /**
     * The difference between global time and client time.
     * @type {number}
     */
    TitleScreen.prototype.timeDiff = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Game logo.
     * @type {createjs.Bitmap}
     */
    TitleScreen.prototype._logo = null;

    /**
     * @private
     * Play button.
     * @type {Button}
     */
    TitleScreen.prototype._btnPlay = null;

    /**
     * @private
     * Connecting message.
     * @type {createjs.Bitmap}
     */
    TitleScreen.prototype._connectingMessage = null;

    /**
     * @private
     * Connection error message.
     * @type {createjs.Bitmap}
     */
    TitleScreen.prototype._connectionErrorMessage = null;

    /**
     * @private
     * Waiting message.
     * @type {createjs.Bitmap}
     */
    TitleScreen.prototype._waitingMessage = null;

    /**
     * @private
     * Starting game message.
     * @type {createjs.Bitmap}
     */
    TitleScreen.prototype._startingMessage = null;

    /**
     * @private
     * Change character message.
     * @type {createjs.Bitmap}
     */
    TitleScreen.prototype._changeCharacterMessage = null;

    /**
     * @private
     * Countdown counter.
     * @type {Countdown}
     */
    TitleScreen.prototype._countdown = null;

    /**
     * @private
     * Loop state, paused or not.
     * @type {boolean}
     */
    TitleScreen.prototype._isPaused = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @inheritDoc
     */
    function TitleScreen(id) {
        BaseScreen.call(this, id);
    }

    // Extends the parent class
    TitleScreen.prototype = Object.create(BaseScreen.prototype);

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    TitleScreen.prototype.invalidate = function() {
        var success = BaseScreen.prototype.invalidate.call(this);

        if (this._logo) {
            if (this._logo.width === 0) {
                success = false;
            }
            this._logo.regX = this._logo.image.width * 0.5;
            this._logo.regY = this._logo.image.height * 0.5;
            this._logo.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._logo.y = GameConfig.VIEWPORT_HEIGHT * 0.2;
        }
        if (this._btnPlay) {
            if (!this._btnPlay.invalidate()) {
                success = false;
            }
            this._btnPlay.clip.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._btnPlay.clip.y = GameConfig.VIEWPORT_HEIGHT * 0.55;
        }
        if (this._connectingMessage) {
            if (this._connectingMessage.width === 0) {
                success = false;
            }
            this._connectingMessage.regX = this._connectingMessage.image.width * 0.5;
            this._connectingMessage.regY = this._connectingMessage.image.height * 0.5;
            this._connectingMessage.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._connectingMessage.y = GameConfig.VIEWPORT_HEIGHT * 0.55;
        }
        if (this._connectionErrorMessage) {
            if (this._connectionErrorMessage.width === 0) {
                success = false;
            }
            this._connectionErrorMessage.regX = this._connectionErrorMessage.image.width * 0.5;
            this._connectionErrorMessage.regY = this._connectionErrorMessage.image.height * 0.5;
            this._connectionErrorMessage.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._connectionErrorMessage.y = GameConfig.VIEWPORT_HEIGHT * 0.55;
        }
        if (this._waitingMessage) {
            if (this._waitingMessage.width === 0) {
                success = false;
            }
            this._waitingMessage.regX = this._waitingMessage.image.width * 0.5;
            this._waitingMessage.regY = this._waitingMessage.image.height * 0.5;
            this._waitingMessage.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._waitingMessage.y = GameConfig.VIEWPORT_HEIGHT * 0.55;
        }
        if (this._startingMessage) {
            if (this._startingMessage.width === 0) {
                success = false;
            }
            this._startingMessage.regX = this._startingMessage.image.width * 0.5;
            this._startingMessage.regY = this._startingMessage.image.height * 0.5;
            this._startingMessage.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._startingMessage.y = GameConfig.VIEWPORT_HEIGHT * 0.55;
        }
        if (this._countdown) {
            if (!this._countdown.invalidate()) {
                success = false;
            }
            this._countdown.clip.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._countdown.clip.y = GameConfig.VIEWPORT_HEIGHT * 0.66;
        }
        if (this._changeCharacterMessage) {
            if (this._changeCharacterMessage.width === 0) {
                success = false;
            }
            this._changeCharacterMessage.regX = this._changeCharacterMessage.image.width * 0.5;
            this._changeCharacterMessage.regY = this._changeCharacterMessage.image.height * 0.5;
            this._changeCharacterMessage.x = GameConfig.VIEWPORT_HALF_WIDTH;
            this._changeCharacterMessage.y = GameConfig.VIEWPORT_HEIGHT - this._changeCharacterMessage.image.height * 0.7;
        }

        return success;
    };

    /**
     * Resets the screen.
     */
    TitleScreen.prototype.reset = function() {
        this._btnPlay.clip.visible = false;
        this._connectingMessage.visible = true;
        this._connectionErrorMessage.visible = false;
        this._waitingMessage.visible = false;
        this._startingMessage.visible = false;
        this._countdown.clip.visible = false;

        createjs.Tween.removeTweens(this._logo);
        createjs.Tween.removeTweens(this._btnPlay.clip);
        this._logo.rotation = 0;
        this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 1;
    };

    /**
     * Pauses the screen.
     */
    TitleScreen.prototype.pause = function() {
        this._isPaused = true;
        createjs.Tween.removeTweens(this._logo);
        createjs.Tween.removeTweens(this._btnPlay.clip);
        this._logo.rotation = 0;
        this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 1;
    };

    /**
     * Resumes the screen.
     */
    TitleScreen.prototype.resume = function() {
        this._isPaused = false;

        createjs.Tween.removeTweens(this._logo);
        createjs.Tween.removeTweens(this._btnPlay.clip);
        this._logo.rotation = 0;
        this._btnPlay.clip.scaleX = this._btnPlay.clip.scaleY = 1;

        createjs.Tween.get(this._logo, { loop: true })
            .to({ rotation: 5 }, 1000, createjs.Ease.sineInOut)
            .to({ rotation: 0 }, 1000, createjs.Ease.sineInOut);

        createjs.Tween.get(this._btnPlay.clip, { loop: true })
            .to({ scaleX: 1.1, scaleY: 1.1 }, 500, createjs.Ease.sineInOut)
            .to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.sineInOut);
    };

    /**
     * Shows play button.
     */
    TitleScreen.prototype.showPlayButton = function() {
        this._btnPlay.clip.visible = true;
        this._connectingMessage.visible = false;
        this._connectionErrorMessage.visible = false;
        this._waitingMessage.visible = false;
        this._startingMessage.visible = false;
        this._countdown.clip.visible = false;
    };

    /**
     * Shows connection error message.
     */
    TitleScreen.prototype.showConnectionError = function() {
        this._btnPlay.clip.visible = false;
        this._connectingMessage.visible = false;
        this._connectionErrorMessage.visible = true;
        this._waitingMessage.visible = false;
        this._startingMessage.visible = false;
        this._countdown.clip.visible = false;
    };

    /**
     * Shows waiting for other players message.
     */
    TitleScreen.prototype.showWaiting = function() {
        this._btnPlay.clip.visible = false;
        this._connectingMessage.visible = false;
        this._connectionErrorMessage.visible = false;
        this._waitingMessage.visible = true;
        this._startingMessage.visible = false;
        this._countdown.clip.visible = false;
    };

    /**
     * Shows starting game message.
     */
    TitleScreen.prototype.showStarting = function() {
        this._btnPlay.clip.visible = false;
        this._connectingMessage.visible = false;
        this._connectionErrorMessage.visible = false;
        this._waitingMessage.visible = false;
        this._startingMessage.visible = true;
        this._countdown.clip.visible = true;
    };

    /**
     * Main loop logic.
     */
    TitleScreen.prototype.update = function() {
        if (this._isPaused) {
            return;
        }

        if (typeof(this.gameStartTime) !== 'undefined' && !isNaN(this.gameStartTime)) {
            var now = new Date().getTime() + this.timeDiff;
            this._countdown.value = Math.floor((this.gameStartTime - now) * 0.001);
        }
    };

    /**
     * Handles document key down.
     */
    TitleScreen.prototype.handleDocumentKeyDown = function(event) {
        if (this._isPaused) {
            return;
        }
        switch (event.keyCode) {
            // ENTER key
            case 13:
            // SPACE key
            case 32:
                if (this._btnPlay.clip.visible) {
                    SoundManager.getInstance().playSound(SoundDictionary.SOUND_BUTTON_CLICK);
                    this.dispatchEvent(new createjs.Event(TitleScreen.PLAY_CLICK));
                }
                break;
        }
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    TitleScreen.prototype._initClip = function() {
        BaseScreen.prototype._initClip.call(this);

        // logo
        this._logo = new createjs.Bitmap(SpriteDictionary.BITMAP_LOGO);
        this.clip.addChild(this._logo);

        // start button
        this._btnPlay = new Button("btnPlay", SpriteDictionary.BITMAP_PLAY_BUTTON);
        this._btnPlay.ref = this;
        this.clip.addChild(this._btnPlay.clip);

        // connecting message
        this._connectingMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_CONNECTING_TEXT);
        this.clip.addChild(this._connectingMessage);

        // connection error message
        this._connectionErrorMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_CONNECTION_PROBLEM_TEXT);
        this.clip.addChild(this._connectionErrorMessage);

        // waiting message
        this._waitingMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_WAITING_TEXT);
        this.clip.addChild(this._waitingMessage);

        // starting message
        this._startingMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_STARTING_TEXT);
        this.clip.addChild(this._startingMessage);

        // countdown counter
        this._countdown = new Countdown();
        this.clip.addChild(this._countdown.clip);

        // change character message
        this._changeCharacterMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_CHANGE_CHARACTER_TEXT);
        this.clip.addChild(this._changeCharacterMessage);

        this.reset();
    };

    /**
     * @inheritDoc
     */
    TitleScreen.prototype._addListeners = function() {
        BaseScreen.prototype._addListeners.call(this);
        this._btnPlay.on(Button.CLICK, onPlayButtonClick);
    };

    // ===========================================
    //  Events
    // ===========================================
    /**
     * @private
     */
    function onPlayButtonClick(event) {
        event.currentTarget.ref.dispatchEvent(new createjs.Event(TitleScreen.PLAY_CLICK));
    }

    return TitleScreen;
});