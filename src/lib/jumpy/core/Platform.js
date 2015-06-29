/**
 * Platform makes up the area that players can land on.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/ParallaxObject",
    "jumpy/sprite/SpriteDictionary"
], function(createjs, GameConfig, ParallaxObject, SpriteDictionary) {
    // ===========================================
    //  Public Constants
    // ===========================================
    /**
     * Center platform index.
     * @type {number}
     */
    Platform.TYPE_CENTER = 0;

    /**
     * Right platform index.
     * @type {number}
     */
    Platform.TYPE_RIGHT = 1;

    /**
     * Left platform index.
     * @type {number}
     */
    Platform.TYPE_LEFT = 2;

    /**
     * @private
     * Sprite width.
     * @type {number}
     */
    Platform.SPRITE_WIDTH = 420;

    /**
     * @private
     * Sprite height.
     * @type {number}
     */
    Platform.SPRITE_HEIGHT = 160;

    // ===========================================
    //  public Members
    // ===========================================
    /**
     * @private
     * Current platform index.
     * @type {string}
     */
    Platform.prototype.index = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Current platform type.
     * @type {string}
     */
    Platform.prototype._type = null;

    /**
     * @private
     * Current sprite index.
     * @type {number}
     */
    Platform.prototype._currentSpriteIndex = 0;

    /**
     * @private
     * True to use sprite with overlaid hint, false otherwise.
     * @type {boolean}
     */
    Platform.prototype._showHint = false;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function Platform() {
        ParallaxObject.call(this);
        this.index = -1;
    }

    // Extends the parent class
    Platform.prototype = Object.create(ParallaxObject.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Sprite width.
     * @type {string}
     */
    Platform.prototype.__defineGetter__("spriteWidth", function() {
        return Platform.SPRITE_WIDTH;
    });

    /**
     * Sprite height.
     * @type {string}
     */
    Platform.prototype.__defineGetter__("spriteHeight", function() {
        return Platform.SPRITE_HEIGHT;
    });

    /**
     * Sprite width.
     * @type {string}
     */
    Platform.prototype.__defineGetter__("showHint", function() {
        return this._showHint;
    });
    /**
     * @private
     */
    Platform.prototype.__defineSetter__("showHint", function(value) {
        this._showHint = value;
        var offset = this._showHint ? 6 : 0;
        if (this.sprite.currentFrame !== (offset + this._currentSpriteIndex)) {
            this.sprite.gotoAndStop(offset + this._currentSpriteIndex);
        }
    });

    /**
     * Current platform type.
     * @type {string}
     */
    Platform.prototype.__defineGetter__("type", function() {
        return this._type;
    });
    /**
     * @private
     */
    Platform.prototype.__defineSetter__("type", function(value) {
        var rand = Math.rand || Math.random;
        this._type = value;
        switch (this._type) {
            case Platform.TYPE_CENTER:
                this._currentSpriteIndex = rand() < 0.5 ? 0 : 1;
                this.showHint = this._showHint;
                break;

            case Platform.TYPE_RIGHT:
                this._currentSpriteIndex = rand() < 0.5 ? 2 : 3;
                this.showHint = this._showHint;
                break;

            case Platform.TYPE_LEFT:
                this._currentSpriteIndex = rand() < 0.5 ? 4 : 5;
                this.showHint = this._showHint;
                break;
        }
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Generates a string representation of this object.
     *
     * @return {string} A string representation of this object.
     */
    Platform.prototype.toString = function() {
        return "[Platform(index:" + this.index + ", type:" + this.type + ")]";
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize sprite.
     */
    Platform.prototype._initSprite = function() {
        var data = {
            framerate: 0,
            images: [
                SpriteDictionary.SPRITE_PLATFORMS
            ],
            frames: {
                width: Platform.SPRITE_WIDTH,
                height: Platform.SPRITE_HEIGHT,
                regX: Platform.SPRITE_WIDTH * 0.5,
                regY: 0
            },
            animations: {}
        };
        this.sprite = new createjs.Sprite(new createjs.SpriteSheet(data));
        this.sprite.y = 0;
    };

    return Platform;
});