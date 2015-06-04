/**
 * A lightweight 2-dimensional point data holder for fast processing.
 *
 * @author Anthony Tambrin
 */
define(function() {
    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * X position.
     * @type {number}
     */
    Point2D.prototype.x = 0;

    /**
     * Y position.
     * @type {number}
     */
    Point2D.prototype.y = 0;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {number} x Starting X position.
     * @param {number} y Starting Y position.
     */
    function Point2D(x, y) {
        if (typeof(x) === "undefined") x = 0;
        if (typeof(y) === "undefined") y = 0;
        this.x = x;
        this.y = y;
    }

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Generates a string representation of this object.
     *
     * @return {string} A string representation of this object.
     */
    Point2D.prototype.toString = function() {
        return "[Point2D(x:" + this.x + ", y:" + this.y + ")]";
    };

    return Point2D;
});