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
     * @private
     * Class of the parallax object to create.
     * @type {function}
     */
    ParallaxGroup.prototype._objectClass = null;

    /**
     * @private
     * List of parallax objects.
     * @type {ParallaxObject[]}
     */
    ParallaxGroup.prototype._objects = null;

    /**
     * @private
     * Parallax objects count.
     * @type {number}
     */
    ParallaxGroup.prototype._objectsCount = null;

    /**
     * @private
     * Moving speed, can be negative values.
     * @type {number}
     */
    ParallaxGroup.prototype._speed = null;

    /**
     * @private
     * Current step value.
     * @type {number}
     */
    ParallaxGroup.prototype._step = null;

    /**
     * @private
     * Bound height before object wraps.
     * @type {number}
     */
    ParallaxGroup.prototype._boundHeight = null;

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
            object.ry = scrollValue + object.spriteHeight * i;
            object.y = (object.ry % this._boundHeight) - object.spriteHeight;
            if (object.y < -object.spriteHeight) {
                object.y += this._boundHeight;
            }
            this.postObjectUpdate(object, i);
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
        var requiredCount = Math.max(Math.floor((GameConfig.VIEWPORT_HEIGHT + sample.spriteHeight) / sample.spriteHeight), 1) + 1;
        this._boundHeight = Math.ceil(GameConfig.VIEWPORT_HEIGHT / sample.spriteHeight) * sample.spriteHeight + sample.spriteHeight;
        var i = requiredCount;
        var object;
        while (--i >= 0) {
            object = new this._objectClass();
            object.x = object.rx = GameConfig.VIEWPORT_HALF_WIDTH;
            object.y = object.ry = 0;
            this._objects.push(object);
            this.clip.addChild(object.clip);
        }
        this._objectsCount = this._objects.length;
        this.update();
    };

    /**
     * Post processing on object after update loop.
     * @param {ParallaxObject} object Object affected.
     * @param {number} index Index of the object in the loop.
     */
    ParallaxGroup.prototype.postObjectUpdate = function(object, index) {
        // Specific implementation is done on the child classes.
    };

    return ParallaxGroup;
});