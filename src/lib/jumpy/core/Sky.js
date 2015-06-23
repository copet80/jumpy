/**
 * Sky makes up the area that players can land on.
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
    const SPRITE_HEIGHT = 931;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function Sky() {
        ParallaxObject.call(this);
    }

    // Extends the parent class
    Sky.prototype = Object.create(ParallaxObject.prototype);

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(Sky.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Sprite width.
     * @type {string}
     */
    Sky.prototype.__defineGetter__("spriteWidth", function() {
        return SPRITE_WIDTH;
    });

    /**
     * Sprite height.
     * @type {string}
     */
    Sky.prototype.__defineGetter__("spriteHeight", function() {
        return SPRITE_HEIGHT;
    });

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize sprite.
     */
    Sky.prototype._initSprite = function() {
        var data = {
            framerate: 0,
            images: [
                SpriteDictionary.SPRITE_SKY
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

    return Sky;
});