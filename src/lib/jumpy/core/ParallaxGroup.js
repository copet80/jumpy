/**
 * Manages parallax objects and pool them. Assumes viewport dimension to be defined in GameConfig.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/ParallaxObject"
], function(createjs, GameConfig, ParallaxObject) {
    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    ParallaxGroup.prototype.clip = null;

    // ===========================================
    //  Private Members
    // ===========================================
    /**
     * Class of the parallax object to create.
     * @type {function}
     */
    ParallaxGroup.prototype._objectClass = null;

    /**
     * List of parallax objects.
     * @type {ParallaxObject[]}
     */
    ParallaxGroup.prototype._objects = null;

    /**
     * Parallax objects count.
     * @type {number}
     */
    ParallaxGroup.prototype._objectsCount = null;

    /**
     * Moving speed, can be negative values.
     * @type {number}
     */
    ParallaxGroup.prototype._speed = null;

    /**
     * Current _step value.
     * @type {number}
     */
    ParallaxGroup.prototype._step = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {function} objectClass Class of the parallax object to create.
     * @param {number} speed Moving speed, can be negative values.
     */
    function ParallaxGroup(objectClass, speed) {
        this._objectClass = objectClass;
        this._speed = speed;
        if (isNaN(this._speed)) {
            this._speed = 1;
        }
        this._initClip();
        this._initObjects();
    }

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Moving speed, can be negative values.
     * @type {number}
     */
    ParallaxGroup.prototype.__defineGetter__("speed", function() {
        return this._speed;
    });
    /**
     * @private
     */
    ParallaxGroup.prototype.__defineSetter__("speed", function(value) {
        this._speed = value;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Invalidates the object.
     */
    ParallaxGroup.prototype.invalidate = function() {
    };

    /**
     * Updates position and state of the objects.
     */
    ParallaxGroup.prototype.update = function(step) {
        if (!isNaN(step)) {
            this._step = step;
        }
        var scrollValue = this._step * this._speed;
        var i = this._objectsCount;
        var object;
        while (--i >= 0) {
            object = this._objects[i];
            object.y = ((scrollValue + object.spriteHeight * i) % (Math.max(object.spriteHeight, GameConfig.VIEWPORT_HEIGHT) * 2)) - object.spriteHeight;
            object.update();
        }
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize clip.
     */
    ParallaxGroup.prototype._initClip = function() {
        this.clip = new createjs.Container();
        this.clip.mouseEnabled = this.clip.mouseChildren = false;
        this.clip.addChild(this.sprite);

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    /**
     * @private
     * Initialize objects.
     */
    ParallaxGroup.prototype._initObjects = function() {
        this._objects = [];

        var sample = new this._objectClass();
        var requiredCount = Math.max(Math.floor((GameConfig.VIEWPORT_HEIGHT * 2) / sample.spriteHeight), 1) + 1;
        var i = requiredCount;
        var object;
        while (--i >= 0) {
            object = new this._objectClass();
            object.x = GameConfig.VIEWPORT_HALF_WIDTH;
            object.y = 0;
            this._objects.push(object);
            this.clip.addChild(object.clip);
        }
        this._objectsCount = this._objects.length;
        this.update();
    };

    return ParallaxGroup;
});