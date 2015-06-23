/**
 * Manages collection of platforms that players can jump onto.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/ParallaxGroup",
    "jumpy/core/Platform"
], function(createjs, GameConfig, ParallaxGroup, Platform) {

    // ===========================================
    //  Private Members
    // ===========================================
    /**
     * @private
     * Seed number for the random platform generation.
     * @type {number}
     */
    PlatformGroup.prototype._seed = 0;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function PlatformGroup(seed) {
        if (isNaN(seed)) {
            seed = 0;
        }
        this.seed = seed;
        ParallaxGroup.call(this, Platform);
    }

    // Extends the parent class
    PlatformGroup.prototype = Object.create(ParallaxGroup.prototype);

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(PlatformGroup.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Seed number for the random platform generation.
     * @type {number}
     */
    PlatformGroup.prototype.__defineGetter__("seed", function() {
        return this._seed;
    });
    /**
     * @private
     */
    PlatformGroup.prototype.__defineSetter__("seed", function(value) {
        this._seed = value;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Gets type of the platform based on the platform index.
     * @param {number} index Platform index.
     * @returns {number} Platform type.
     */
    PlatformGroup.prototype.getPlatformType = function(index) {
        Math.rand = new Math.seedrandom(this.seed.toString() + index.toString());
        return Math.floor(Math.rand() * 3);
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @inheritDoc
     * Changes platform type based on seed.
     */
    PlatformGroup.prototype.postObjectUpdate = function(object, index, forceUpdate) {
        var pageIndex = Math.floor(object.ry / this._boundHeight);
        var platformIndex = pageIndex * this._objects.length + index;
        if (object.index !== platformIndex || forceUpdate) {
            object.index = platformIndex;
            object.type = this.getPlatformType(platformIndex);
        }
    };

    return PlatformGroup;
});