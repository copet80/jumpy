/**
 * Character class.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/core/SpriteSheetConfig",
    "jumpy/core/MovingObject",
    "jumpy/core/Platform",
    "jumpy/sprite/SpriteDictionary"
], function(createjs, GameConfig, SpriteSheetConfig, MovingObject, Platform, SpriteDictionary) {
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

    /**
     * Target platform index.
     * @type {number}
     */
    Character.prototype.targetPlatformIndex = 0;

    /**
     * True if my character, false otherwise.
     * @type {boolean}
     */
    Character.prototype.isMe = false;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * ID of the animal this character is represented by.
     * @type {string}
     */
    Character.prototype._animalId = null;

    /**
     * @private
     * Current animation state.
     * @type {string}
     */
    Character.prototype._currentAnimationState = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {string} id Unique ID for this object.
     */
    function Character(id, isMe) {
        this.isMe = isMe;
        MovingObject.call(this, id);
        this._initSprite();
    }

    // Extends the parent class
    Character.prototype = Object.create(MovingObject.prototype);

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
        this.animate(this._currentAnimationState);
    });

    /**
     * Scale X.
     * @type {number}
     */
    Character.prototype.__defineGetter__("scaleX", function() {
        return this.sprite.scaleX;
    });
    /**
     * @private
     */
    Character.prototype.__defineSetter__("scaleX", function(value) {
        this.sprite.scaleX = value;
    });

    /**
     * Current platform index based on the current position.
     * @type {number}
     */
    Character.prototype.__defineGetter__("currentPlatformIndex", function() {
        return Math.floor(this.ry / Platform.SPRITE_HEIGHT);
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Invalidates the character.
     */
    Character.prototype.invalidate = function() {
    };

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
        this.invalidate();
    };

    /**
     * Plays idle animation.
     */
    Character.prototype.idle = function() {
        this._currentAnimationState = SpriteSheetConfig.IDLE;
        this.animate(this._currentAnimationState);
    };

    /**
     * Plays jump animation.
     */
    Character.prototype.jump = function() {
        this._currentAnimationState = SpriteSheetConfig.JUMP;
        this.animate(this._currentAnimationState);
    };

    /**
     * Plays land animation.
     */
    Character.prototype.land = function() {
        this._currentAnimationState = SpriteSheetConfig.LAND;
        this.animate(this._currentAnimationState);
    };

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Initialize sprite animation.
     */
    Character.prototype._initSprite = function() {
        this.clip = new createjs.Container();
        this.clip.mouseEnabled = this.clip.mouseChildren = false;

        // character sprite
        this.sprite = new createjs.Sprite(new createjs.SpriteSheet(SpriteSheetConfig.getInstance().CHARACTER));
        this.sprite.ref = this;
        this.clip.addChild(this.sprite);

        // me bubble sprite
        if (this.isMe) {
            this.bubbleSprite = new createjs.Sprite(new createjs.SpriteSheet({
                framerate: 0,
                images: [
                    SpriteDictionary.BITMAP_YOU_BUBBLE
                ],
                frames: {
                    width: 77,
                    height: 47,
                    regX: 20,
                    regY: 47
                },
                animations: {}
            }));
            this.bubbleSprite.x = 15;
            this.bubbleSprite.y = -GameConfig.CHARACTER_SPRITE_HEIGHT + 5;
            this.clip.addChild(this.bubbleSprite);
        }

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    return Character;
});