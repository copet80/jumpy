/**
 * Base class for all controls.
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
     * Unique ID for the control.
     * @type {string}
     */
    BaseControl.prototype.id = null;

    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    BaseControl.prototype.clip = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {string} id Unique ID for the screen.
     */
    function BaseControl(id) {
        this.id = id;
        this.clip = new createjs.Container();
        this.clip.name = id + "Container";
        // this is so that event delegates can find its way back to the origin object
        this.clip.ref = this;
        this._initClip();
        this._addListeners();
    }

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(BaseControl.prototype);

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Generates a string representation of this object.
     *
     * @return {string} A string representation of this object.
     */
    BaseControl.prototype.toString = function() {
        return "[BaseControl(id:" + this.id + ")]";
    };

    /**
     * Invalidates the control.
     *
     * @return {boolean} True if invalidated, false otherwise.
     */
    BaseControl.prototype.invalidate = function() {
        return true;
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * Initialize clip elements.
     */
    BaseControl.prototype._initClip = function() {
        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    /**
     * Add event listeners.
     */
    BaseControl.prototype._addListeners = function() {
    };

    return BaseControl;
});