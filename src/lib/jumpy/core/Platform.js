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

    // ===========================================
    //  Private Constants
    // ===========================================
    /**
     * @private
     * Sprite width.
     * @type {number}
     */
    const SPRITE_WIDTH = 420;

    /**
     * @private
     * Sprite height.
     * @type {number}
     */
    const SPRITE_HEIGHT = 160;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Current platform type.
     * @type {string}
     */
    Platform.prototype._type = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {string} type Platform type.
     * @see TYPE_TRUNK
     * @see TYPE_CENTER
     * @see TYPE_RIGHT
     * @see TYPE_LEFT
     */
    function Platform(type) {
        ParallaxObject.call(this);
        this.type = type;
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
        return SPRITE_WIDTH;
    });

    /**
     * Sprite height.
     * @type {string}
     */
    Platform.prototype.__defineGetter__("spriteHeight", function() {
        return SPRITE_HEIGHT;
    });

    /**
     * Current platform type.
     * @type {string}
     */
    Platform.prototype.__defineGetter__("type", function() {
        return this._type;
    });
    Platform.prototype.__defineSetter__("type", function(value) {
        this._type = value;
        switch (this._type) {
            case Platform.TYPE_CENTER:
                this.sprite.gotoAndStop(Math.random() < 0.5 ? 0 : 1);
                break;

            case Platform.TYPE_RIGHT:
                this.sprite.gotoAndStop(Math.random() < 0.5 ? 2 : 3);
                break;

            case Platform.TYPE_LEFT:
                this.sprite.gotoAndStop(Math.random() < 0.5 ? 4 : 5);
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
        return "[Platform(type:" + this.type + ")]";
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
                width: SPRITE_WIDTH,
                height: SPRITE_HEIGHT,
                regX: SPRITE_WIDTH * 0.5,
                regY: 0
            },
            animations: {}
        };
        this.sprite = new createjs.Sprite(new createjs.SpriteSheet(data));
        this.sprite.y = 0;
    };

    return Platform;
});