/**
 * Standard clickable button control.
 *
 * @author Anthony Tambrin
 */
define([
    "./BaseControl",
    "jumpy/sound/SoundDictionary",
    "jumpy/sound/SoundManager"
], function(BaseControl, SoundDictionary, SoundManager) {
    // ===========================================
    //  Event Types
    // ===========================================
    /**
     * Dispatched when button is clicked.
     * @type {string}
     */
    Button.CLICK = "click";

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Button backgroundPath.
     * @type {string}
     */
    Button.prototype.backgroundPath = null;

    /**
     * Button iconPath.
     * @type {string}
     */
    Button.prototype.iconPath = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Background bitmap.
     * @type {createjs.Bitmap}
     */
    Button.prototype._background = null;

    /**
     * @private
     * Icon bitmap.
     * @type {createjs.Bitmap}
     */
    Button.prototype._icon = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @inheritDoc
     */
    function Button(id, backgroundPath, iconPath) {
        this.backgroundPath = backgroundPath;
        this.iconPath = iconPath;

        BaseControl.call(this, id);
    }

    // Extends the parent class
    Button.prototype = Object.create(BaseControl.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Button width.
     * @type {number}
     */
    Button.prototype.__defineGetter__("width", function() {
        if (this._background) return this._background.image.width;
        else if (this._icon) return this._icon.image.width;
        return 0;
    });

    /**
     * Button height.
     * @type {number}
     */
    Button.prototype.__defineGetter__("height", function() {
        if (this._background) return this._background.image.height;
        else if (this._icon) return this._icon.image.height;
        return 0;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    Button.prototype.invalidate = function() {
        var success = BaseControl.prototype.invalidate.call(this);

        if (this._background) {
            if (this._background.image.width === 0) {
                success = false;
            }
            this._background.regX = this._background.image.width * 0.5;
            this._background.regY = this._background.image.height * 0.5;
        }
        if (this._icon) {
            if (this._icon.image.width === 0) {
                success = false;
            }
            this._icon.regX = this._icon.image.width * 0.5;
            this._icon.regY = this._icon.image.height * 0.5;
        }

        return success;
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    Button.prototype._initClip = function() {
        BaseControl.prototype._initClip.call(this);

        // background path
        if (this.backgroundPath) {
            this._background = new createjs.Bitmap(this.backgroundPath);
            this.clip.addChild(this._background);
        }

        // icon path
        if (this.iconPath) {
            this._icon = new createjs.Bitmap(this.iconPath);
            this.clip.addChild(this._icon);
        }

        this.clip.mouseEnabled = true;
        this.clip.mouseChildren = false;
    };

    /**
     * @inheritDoc
     */
    Button.prototype._addListeners = function() {
        BaseControl.prototype._addListeners.call(this);
        this.clip.on("click", this._onClipClick);
        this.clip.on("mousedown", this._onClipMouseDown);
        this.clip.on("pressup", this._onClipMouseUp);
    };

    // ===========================================
    //  Event Handlers
    // ===========================================
    /**
     * @private
     */
    Button.prototype._onClipClick = function(event) {
        event.stopPropagation();
        event.currentTarget.ref.dispatchEvent(new createjs.Event(Button.CLICK));
    };

    /**
     * @private
     */
    Button.prototype._onClipMouseUp = function(event) {
        event.currentTarget.ref.clip.scaleX = event.currentTarget.ref.clip.scaleY = 1;
    };

    /**
     * @private
     */
    Button.prototype._onClipMouseDown = function(event) {
        event.stopPropagation();
        event.currentTarget.ref.clip.scaleX = event.currentTarget.ref.clip.scaleY = 1.2;
        SoundManager.getInstance().playSound(SoundDictionary.SOUND_BUTTON_CLICK);
    };

    return Button;
});