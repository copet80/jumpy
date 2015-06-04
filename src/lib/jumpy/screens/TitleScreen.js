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
     * Play button.
     * @type {Button}
     */
    TitleScreen.prototype._btnPlay = null;

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

        if (this._btnPlay) {
            if (!this._btnPlay.invalidate()) {
                success = false;
            }
            this._btnPlay.clip.x = GameConfig.VIEWPORT_WIDTH * 0.5;
            this._btnPlay.clip.y = GameConfig.VIEWPORT_HEIGHT * 0.85;
        }

        return success;
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    TitleScreen.prototype._initClip = function() {
        BaseScreen.prototype._initClip.call(this);

        // start button
        this._btnPlay = new Button("btnPlay", SpriteDictionary.BITMAP_PLAY_BUTTON);
        this._btnPlay.ref = this;
        this.clip.addChild(this._btnPlay.clip);
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