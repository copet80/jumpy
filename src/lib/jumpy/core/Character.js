/**
 * Character class.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/SpriteSheetConfig",
    "jumpy/sprite/SpriteDictionary"
], function(createjs, GameConfig, SpriteSheetConfig, SpriteDictionary) {
    // ===========================================
    //  Event Types
    // ===========================================
    /**
     * Dispatched when jump is performed.
     * @type {string}
     */
    Character.JUMP = "jump";

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Sprite}
     */
    Character.prototype.clip = null;

    /**
     * Character sprite container.
     * @type {createjs.Container}
     */
    Character.prototype.sprite = null;

    /**
     * Reference to player indicator object to avoid looping twice.
     * @type {createjs.Sprite}
     */
    Character.prototype.playerIndicatorRef = null;

    // ===========================================
    //  Protected Members
    // ===========================================

    /**
     * @private
     * True if jumping, false otherwise.
     * @type {boolean}
     */
    Character.prototype._isJumping = null;

    /**
     * @private
     * ID of the animal this character is represented by.
     * @type {string}
     */
    Character.prototype._animalId = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {string} id Unique ID for this object.
     */
    function Character(id) {
        if (typeof(id) === "undefined") id = "";
        this._isJumping = false;
        this._initSprite();
    }

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(Character.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * ID of the animal this character is represented by.
     * @type {string}
     */
    Character.prototype.__defineGetter__("animalId", function() {
        return this._animalId;
    });
    /**
     * @private
     */
    Character.prototype.__defineSetter__("animalId", function(value) {
        this._animalId = value;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Invalidates the character.
     */
    Character.prototype.invalidate = function() {
        this.sprite.stop();
    };

    // ===========================================
    //  Getters / Setters
    // ===========================================

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Main loop logic.
     *
     * @param {number} deltaTime Time passed since last tick.
     * @param {SteeredObject[]} objects The moving objects to flock in.
     * @param {int} length Flock item count (passed in rather than calculated for performance).
     * @param {number} x X position to flock to (optional).
     * @param {number} y Y position to flock to (optional).
     */
    Character.prototype.update = function(deltaTime, objects, length, x, y) {
        var now = new Date().getTime();

        if (this.clip) {
            this.clip.x = this.x;
            this.clip.y = this.y;
        }
        if (this.playerIndicatorRef) {
            this.playerIndicatorRef.x = this.x;
            this.playerIndicatorRef.y = this.y;
        }
    };

    /**
     * Pauses animation.
     */
    Character.prototype.pauseAnimation = function() {
        this.sprite.stop();
    };

    /**
     * Resumes playing animation.
     */
    Character.prototype.resumeAnimation = function() {
        this.sprite.play();
    };

    /**
     * Play animation state.
     *
     * @param {string} animationId Unique ID of the animation to play.
     */
    Character.prototype.animate = function(animationId) {
        this.sprite.gotoAndPlay(this._animalId + "_" + animationId);
    };

    /**
     * Switches animal.
     *
     * @param {string} animalId New animal ID the character should be represented by.
     */
    Character.prototype.switchTeam = function(animalId) {
        createjs.Tween.removeTweens(this);
        this._animalId = animalId;
        this._isJumping = false;
        this.invalidate();
    };

    /**
     * Jumps to a platform.
     *
     * @param {number} platformIndex Platform index to jump to.
     * @see Platform.TYPE_CENTER
     * @see Platform.TYPE_LEFT
     * @see Platform.TYPE_RIGHT
     */
    Character.prototype.jump = function(platformIndex) {
        this._isJumping = true;

        this.dispatchEvent(new createjs.Event(Character.JUMP));
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize sprite animation.
     */
    Character.prototype._initSprite = function() {
        // character sprite
        var data = SpriteSheetConfig.getInstance().CHARACTER;

        this.sprite = new createjs.Sprite(new createjs.SpriteSheet(data));
        this.sprite.ref = this;

        this.clip = new createjs.Container();
        this.clip.mouseEnabled = this.clip.mouseChildren = false;
        this.clip.addChild(this.sprite);

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    return Character;
});