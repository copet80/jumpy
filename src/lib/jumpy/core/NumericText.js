/**
 * Sky makes up the area that players can land on.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary"
], function(createjs, GameConfig, SpriteDictionary) {

    // ===========================================
    //  Private Constants
    // ===========================================
    /**
     * Maximum number of digits.
     * @type {number}
     */
    const NUM_DIGITS = 8;

    /**
     * @private
     * Sprite width.
     * @type {number}
     */
    const SPRITE_WIDTH = 40;

    /**
     * @private
     * Sprite height.
     * @type {number}
     */
    const SPRITE_HEIGHT = 40;

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    NumericText.prototype.clip = null;

    // ===========================================
    //  Private Members
    // ===========================================
    /**
     * @private
     * Array of digit sprites.
     * @type {ParallaxObject[]}
     */
    NumericText.prototype._digits = null;

    /**
     * Digits container.
     * @type {createjs.Container}
     */
    NumericText.prototype._digitsContainer = null;

    /**
     * @private
     * Current numeric value.
     * @type {number}
     */
    NumericText.prototype._value = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function NumericText() {
        this._initClip();
        this._initObjects();
    }

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * Numeric value.
     * @type {number}
     */
    NumericText.prototype.__defineGetter__("value", function() {
        return this._value;
    });
    /**
     * @private
     */
    NumericText.prototype.__defineSetter__("value", function(value) {
        if (this._value != value) {
            this._value = value;
            this.refresh();
        }
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Invalidates the character.
     */
    NumericText.prototype.invalidate = function() {
        var success = true;

        if (this._digits) {
            this._digits.forEach(function(digit) {
                if (digit.width === 0) {
                    success = false;
                }
            });
        }

        return success;
    };

    /**
     * Refresh display to show the numeric value with digit sprites.
     */
    NumericText.prototype.refresh = function() {
        var i = -1;
        var valueString = this._value.toString();
        var valueLen = valueString.length;
        var digitsLen = this._digits.length;
        var digit;
        this._digitsContainer.x = valueLen * SPRITE_WIDTH * 0.35 * -0.5;
        while (++i < digitsLen) {
            digit = this._digits[i];
            if (i < valueLen) {
                digit.gotoAndStop(valueString[i]);
                digit.visible = true;
            } else {
                digit.visible = false;
            }
        }
    };

    /**
     * Resets the component.
     */
    NumericText.prototype.reset = function() {
        this.value = 0;
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize clip.
     */
    NumericText.prototype._initClip = function() {
        this.clip = new createjs.Container();
        this.clip.mouseEnabled = this.clip.mouseChildren = false;

        this._digitsContainer = new createjs.Container();
        this._digitsContainer.mouseEnabled = this._digitsContainer.mouseChildren = false;
        this.clip.addChild(this._digitsContainer);
    };

    /**
     * @private
     * Initialize objects.
     */
    NumericText.prototype._initObjects = function() {
        this._digits = [];

        var data = {
            framerate: 0,
            images: [
                SpriteDictionary.SPRITE_DIGITS
            ],
            frames: {
                width: SPRITE_WIDTH,
                height: SPRITE_HEIGHT,
                regX: SPRITE_WIDTH * 0.5,
                regY: SPRITE_HEIGHT * 0.5
            },
            animations: {}
        };
        var j = 10;
        while (--j >= 0) {
            data.animations[j] = {frames: [j]};
        }
        var digit;
        var i = -1;
        var len = NUM_DIGITS;
        while (++i < len) {
            digit = new createjs.Sprite(new createjs.SpriteSheet(data));
            digit.x = i * SPRITE_WIDTH * 0.35;
            this._digits.push(digit);
            this._digitsContainer.addChild(digit);
        }

        this.value = 0;

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    return NumericText;
});