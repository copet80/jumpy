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
    PlatformGroup.prototype._seed = null;

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
     * Gets platform type by platform index.
     * @param {number} platformIndex Platform index.
     * @returns {number} Platform type.
     */
    PlatformGroup.prototype.getPlatformType = function(platformIndex) {
        var nextPlatform = this._objects.filter(function(platform) {
            return platform.y > GameConfig.VIEWPORT_HEIGHT - Platform.SPRITE_HEIGHT * 2 &&
                   platform.y < GameConfig.VIEWPORT_HEIGHT - Platform.SPRITE_HEIGHT * 1;
        })[0];
        return nextPlatform.type;
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @inheritDoc
     * Changes platform type based on seed.
     */
    PlatformGroup.prototype.postObjectUpdate = function(object, index) {
        var pageIndex = Math.floor(object.ry / this._boundHeight);
        Math.seedrandom(this.seed.toString() + pageIndex.toString() + index.toString());
        object.type = Math.floor(Math.random() * 3);
    };

    return PlatformGroup;
});