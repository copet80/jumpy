/**
 * Sky makes up the area that players can land on.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/NumericText",
    "jumpy/sprite/SpriteDictionary"
], function(createjs, GameConfig, NumericText, SpriteDictionary) {

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    RankText.prototype.clip = null;

    // ===========================================
    //  Private Members
    // ===========================================
    /**
     * @private
     * Rank text.
     * @type {NumericText}
     */
    RankText.prototype._rank = null;

    /**
     * Rank unit counter.
     * @type {createjs.Sprite}
     */
    RankText.prototype._counter = null;

    /**
     * @private
     * Current rank value.
     * @type {number}
     */
    RankText.prototype._value = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function RankText() {
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
    RankText.prototype.__defineGetter__("value", function() {
        return this._value;
    });
    /**
     * @private
     */
    RankText.prototype.__defineSetter__("value", function(value) {
        if (this._rank.value != value) {
            this._rank.value = value;
            var valueString = value.toString();
            var lastDigit = valueString[valueString.length - 1];
            switch (lastDigit) {
                case '1': this._counter.gotoAndStop(0); break;
                case '2': this._counter.gotoAndStop(1); break;
                case '3': this._counter.gotoAndStop(2); break;
                default: this._counter.gotoAndStop(3); break;
            }
            this._counter.visible = value !== 0;
        }
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Invalidates the character.
     */
    RankText.prototype.invalidate = function() {
        var success = true;

        if (this._counter) {
            if (this._counter.width === 0) {
                success = false;
            }
        }

        return success;
    };

    /**
     * Resets the component.
     */
    RankText.prototype.reset = function() {
        this.value = 0;
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize clip.
     */
    RankText.prototype._initClip = function() {
        this.clip = new createjs.Container();
        this.clip.mouseEnabled = this.clip.mouseChildren = false;
    };

    /**
     * @private
     * Initialize objects.
     */
    RankText.prototype._initObjects = function() {
        this._rank = new NumericText();
        this.clip.addChild(this._rank.clip);

        var data = {
            framerate: 0,
            images: [
                SpriteDictionary.SPRITE_COUNTERS
            ],
            frames: {
                width: 40,
                height: 40,
                regX: 40 * 0.5,
                regY: 40 * 0.5
            },
            animations: {}
        };
        var j = 4;
        while (--j >= 0) {
            data.animations[j] = {frames: [j]};
        }
        this._counter = new createjs.Sprite(new createjs.SpriteSheet(data));
        this._counter.x = 7;
        this._counter.y = -7;
        this.clip.addChild(this._counter);

        this.value = 0;

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    return RankText;
});