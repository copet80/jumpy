/**
 * Title screen shows game logo and a play button.
 *
 * @author Anthony Tambrin
 */
define([
    "./BaseScreen",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary",
    "jumpy/controls/Button"
], function(BaseScreen, GameConfig, SpriteDictionary, Button) {
    // ===========================================
    //  Event Types
    // ===========================================
    /**
     * Dispatched when play button is clicked.
     * @type {string}
     */
    TitleScreen.PLAY_CLICK = "playClick";

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

        return success;
    };

    /**
     * Pauses the screen.
     */
    TitleScreen.prototype.pause = function() {
        createjs.Tween.removeTweens(this._logo);
        createjs.Tween.removeTweens(this._btnPlay.clip);
    };

    /**
     * Resumes the screen.
     */
    TitleScreen.prototype.resume = function() {
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
    };

    /**
     * Shows connection error message.
     */
    TitleScreen.prototype.showConnectionError = function() {
        this._btnPlay.clip.visible = false;
        this._connectingMessage.visible = false;
        this._connectionErrorMessage.visible = true;
        this._waitingMessage.visible = false;
    };

    /**
     * Shows connection error message.
     */
    TitleScreen.prototype.showWaiting = function() {
        this._btnPlay.clip.visible = false;
        this._connectingMessage.visible = false;
        this._connectionErrorMessage.visible = false;
        this._waitingMessage.visible = true;
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
        this._btnPlay.clip.visible = false;
        this.clip.addChild(this._btnPlay.clip);

        // connecting message
        this._connectingMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_CONNECTING_TEXT);
        this.clip.addChild(this._connectingMessage);

        // connection error message
        this._connectionErrorMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_CONNECTION_PROBLEM_TEXT);
        this._connectionErrorMessage.visible = false;
        this.clip.addChild(this._connectionErrorMessage);

        // waiting message
        this._waitingMessage = new createjs.Bitmap(SpriteDictionary.BITMAP_WAITING_TEXT);
        this._waitingMessage.visible = false;
        this.clip.addChild(this._waitingMessage);
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