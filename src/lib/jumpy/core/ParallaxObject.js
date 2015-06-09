/**
 * Base class for parallax objects.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/MovingObject"
], function(createjs, GameConfig, MovingObject) {

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    ParallaxObject.prototype.clip = null;

    /**
     * Sprite object.
     * @type {createjs.Sprite}
     */
    ParallaxObject.prototype.sprite = null;

    /**
     * Real X position.
     * @type {number}
     */
    ParallaxObject.prototype.rx = null;

    /**
     * Real Y position.
     * @type {number}
     */
    ParallaxObject.prototype.ry = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function ParallaxObject() {
        MovingObject.call(this);
        this.rx = 0;
        this.ry = 0;
        this._initClip();
    }

    // Extends the parent class
    ParallaxObject.prototype = Object.create(MovingObject.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Sprite width.
     * @type {string}
     */
    ParallaxObject.prototype.__defineGetter__("spriteWidth", function() {
        return 0;
    });

    /**
     * Sprite height.
     * @type {string}
     */
    ParallaxObject.prototype.__defineGetter__("spriteHeight", function() {
        return 0;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Invalidates the object.
     */
    ParallaxObject.prototype.invalidate = function() {
    };

    /**
     * Updates position and state of the object.
     */
    ParallaxObject.prototype.update = function() {
        if (this.clip) {
            this.clip.x = this.x;
            this.clip.y = this.y;
        }
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize clip.
     */
    ParallaxObject.prototype._initClip = function() {
        this._initSprite();
        this.clip = new createjs.Container();
        this.clip.mouseEnabled = this.clip.mouseChildren = false;
        this.clip.addChild(this.sprite);

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    /**
     * @private
     * Initialize sprite.
     */
    ParallaxObject.prototype._initSprite = function() {
    };

    return ParallaxObject;
});