/**
 * TreeTrunk makes up the area that players can land on.
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
    const SPRITE_WIDTH = 64;

    /**
     * @private
     * Sprite height.
     * @type {number}
     */
    const SPRITE_HEIGHT = 160;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function TreeTrunk() {
        ParallaxObject.call(this);
    }

    // Extends the parent class
    TreeTrunk.prototype = Object.create(ParallaxObject.prototype);

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(TreeTrunk.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Sprite width.
     * @type {string}
     */
    TreeTrunk.prototype.__defineGetter__("spriteWidth", function() {
        return SPRITE_WIDTH;
    });

    /**
     * Sprite height.
     * @type {string}
     */
    TreeTrunk.prototype.__defineGetter__("spriteHeight", function() {
        return SPRITE_HEIGHT;
    });

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize sprite.
     */
    TreeTrunk.prototype._initSprite = function() {
        var data = {
            framerate: 0,
            images: [
                SpriteDictionary.SPRITE_TREE_TRUNK
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

    return TreeTrunk;
});