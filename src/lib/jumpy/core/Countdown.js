/**
 * Countdown class.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/MovingObject",
    "jumpy/sprite/SpriteDictionary",
    "jumpy/sound/SoundDictionary",
    "jumpy/sound/SoundManager"
], function(createjs, GameConfig, MovingObject, SpriteDictionary, SoundDictionary, SoundManager) {

    // ===========================================
    //  Private Constants
    // ===========================================
    /**
     * @private
     * Sprite width.
     * @type {number}
     */
    const SPRITE_WIDTH = 100;

    /**
     * @private
     * Sprite height.
     * @type {number}
     */
    const SPRITE_HEIGHT = 100;

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Sprite}
     */
    Countdown.prototype.clip = null;

    /**
     * Countdown sprite container.
     * @type {createjs.Container}
     */
    Countdown.prototype.sprite = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Value between 0 - 99.
     * @type {number}
     */
    Countdown.prototype._value = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {string} id Unique ID for this object.
     */
    function Countdown(id) {
        if (typeof(id) === "undefined") id = "";
        this._initSprite();
        this.value = 99;
    }

    // Extends the parent class
    Countdown.prototype = Object.create(MovingObject.prototype);

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(Countdown.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * ID of the animal this character is represented by.
     * @type {string}
     */
    Countdown.prototype.__defineGetter__("value", function() {
        return this._value;
    });
    /**
     * @private
     */
    Countdown.prototype.__defineSetter__("value", function(value) {
        if (value < 0) value = 0;
        else if (value > 99) value = 99;
        if (this._value !== value) {
            if (value < 10) {
                SoundManager.getInstance().playSound(SoundDictionary.SOUND_COUNTDOWN_TICK);
                createjs.Tween.removeTweens(this.clip);
                this.clip.scaleX = this.clip.scaleY = 2;
                createjs.Tween.get(this.clip)
                    .to({ scaleX: 1, scaleY: 1 }, 400, createjs.Ease.sineOut);
            } else {
                this.clip.scaleX = this.clip.scaleY = 1;
            }
        }
        this._value = value;
        this.sprite.gotoAndStop(this._value);
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Invalidates the character.
     */
    Countdown.prototype.invalidate = function() {
        var success = true;

        if (this.sprite) {
            if (this.sprite.width === 0) {
                success = false;
            }
        }

        return success;
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize sprite animation.
     */
    Countdown.prototype._initSprite = function() {
        this.clip = new createjs.Container();

        // transform effect sprite
        var data = {
            framerate: 0,
            images: [
                SpriteDictionary.SPRITE_COUNTDOWN
            ],
            frames: {
                width: SPRITE_WIDTH,
                height: SPRITE_HEIGHT,
                regX: SPRITE_WIDTH * 0.5,
                regY: SPRITE_HEIGHT * 0.5
            },
            animations: {}
        };
        var i = 100;
        while (--i >= 0) {
            data.animations[i] = {frames: [i]};
        }

        this.sprite = new createjs.Sprite(new createjs.SpriteSheet(data));
        this.clip.addChild(this.sprite);

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    return Countdown;
});