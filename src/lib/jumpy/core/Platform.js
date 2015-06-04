/**
 * Platform makes up the area that players can land on.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary"
], function(createjs, GameConfig, SpriteDictionary) {
    // ===========================================
    //  Public Constants
    // ===========================================
    /**
     * Trunk platform type.
     * @type {number}
     */
    Platform.TYPE_TRUNK = 0;

    /**
     * Center platform index.
     * @type {number}
     */
    Platform.TYPE_CENTER = 1;

    /**
     * Right platform index.
     * @type {number}
     */
    Platform.TYPE_RIGHT = 2;

    /**
     * Left platform index.
     * @type {number}
     */
    Platform.TYPE_LEFT = 3;

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
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    Platform.prototype.clip = null;

    /**
     * Sprite object.
     * @type {createjs.Sprite}
     */
    Platform.prototype.sprite = null;

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
     * @param {string} teamId ID of the team the platform should represent.
     */
    function Platform(type) {
        this._initSprite();
        this.type = type;
    }

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(Platform.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Current team ID.
     * @type {string}
     */
    Platform.prototype.__defineGetter__("type", function() {
        return this._type;
    });
    Platform.prototype.__defineSetter__("type", function(value) {
        this._type = value;
        switch (this._type) {
            case Platform.TYPE_TRUNK:
                this.sprite.gotoAndStop(6);
                break;

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
        this.clip = new createjs.Container();

        var data = {
            framerate: 5,
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
        this.clip.addChild(this.sprite);

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    return Platform;
});