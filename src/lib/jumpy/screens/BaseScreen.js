/**
 * Base class for all screens.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig"
], function(createjs, GameConfig) {
    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Unique ID for the screen.
     * @type {string}
     */
    BaseScreen.prototype.id = null;

    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    BaseScreen.prototype.clip = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {string} id Unique ID for the screen.
     */
    function BaseScreen(id) {
        this.id = id;
        this.clip = new createjs.Container();
        // this is so that event delegates can find its way back to the origin object
        this.clip.ref = this;
        this._initClip();
        this._addListeners();
    }

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(BaseScreen.prototype);

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Generates a string representation of this object.
     *
     * @return {string} A string representation of this object.
     */
    BaseScreen.prototype.toString = function() {
        return "[BaseScreen(id:" + this.id + ")]";
    };

    /**
     * Invalidates the screen.
     *
     * @return {boolean} True if invalidated, false otherwise.
     */
    BaseScreen.prototype.invalidate = function() {
        return true;
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * Initialize clip elements.
     */
    BaseScreen.prototype._initClip = function() {
        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    /**
     * Add event listeners.
     */
    BaseScreen.prototype._addListeners = function() {
    };

    return BaseScreen;
});