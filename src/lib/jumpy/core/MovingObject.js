/**
* Base class for moving objects.
*
* @author Anthony Tambrin
*/
define([
], function() {

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * X position.
     * @type {number}
     */
    MovingObject.prototype.x = null;

    /**
     * Y position.
     * @type {number}
     */
    MovingObject.prototype.y = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Unique ID of this object.
     * @type {number}
     */
    MovingObject.prototype._id = "";

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {string} id Unique ID of the object.
     */
    function MovingObject(id) {
        if (typeof(id) === "undefined" || id.length === 0) id = "" + Math.floor(Math.random() * 9999999);
        this._id = id;

        this.x = 0;
        this.y = 0;
    }

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Unique ID of this object.
     * @type {string}
     */
    MovingObject.prototype.__defineGetter__("id", function() {
        return this._id;
    });
    /**
     * @private
     */
    MovingObject.prototype.__defineSetter__("id", function(value) {
        this._id = value;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Handles all basic motion.
     * Should be called on each frame update.
     */
    MovingObject.prototype.update = function() {
    };

    /**
     * Generates a string representation of this object.
     *
     * @return {string} A string representation of this object.
     */
    MovingObject.prototype.toString = function() {
        return "[MovingObject(id:" + this._id + ", x:" + this.x + ", y:" + this.y + ")]";
    };

    return MovingObject;
});