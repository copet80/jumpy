/**
 * Game engine.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary",
    "jumpy/sound/SoundManager",
    "jumpy/sound/SoundDictionary",
    "jumpy/core/ParallaxGroup",
    "jumpy/core/TreeTrunk",
    "jumpy/core/Sky",
    "jumpy/core/PlatformGroup",
    "jumpy/core/Platform",
    "jumpy/core/Character"
], function(
    createjs, GameConfig, SpriteDictionary, SoundManager, SoundDictionary,
    ParallaxGroup, TreeTrunk, Sky, PlatformGroup, Platform, Character
) {
    // ===========================================
    //  Event Types
    // ===========================================
    /**
     * Dispatched when a character jumps.
     * @type {string}
     */
    Game.CHARACTER_JUMP = "characterJump";

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * Clip object to add to the stage.
     * @type {createjs.Container}
     */
    Game.prototype.clip = null;

    /**
     * True if game is interactable, false if already ended.
     * @type {boolean}
     */
    Game.prototype.isActive = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Array of characters.
     * @type {array}
     */
    Game.prototype._characters = null;

    /**
     * @private
     * Dictionary of characters keyed by character ID.
     * @type {object}
     */
    Game.prototype._charactersById = null;

    /**
     * @private
     * Platforms group.
     * @type {PlatformGroup}
     */
    Game.prototype._platforms = null;

    /**
     * @private
     * Sky.
     * @type {ParallaxGroup}
     */
    Game.prototype._sky = null;

    /**
     * @private
     * Tree trunk.
     * @type {ParallaxGroup}
     */
    Game.prototype._treeTrunk = null;

    /**
     * @private
     * Container Y position.
     * @type {number}
     */
    Game.prototype._containerY = null;

    /**
     * @private
     * Game state, paused or not.
     * @type {boolean}
     */
    Game.prototype._isPaused = null;

    /**
     * @private
     * Stage object reference.
     * @type {createjs.Stage}
     */
    Game.prototype._stage = null;

    /**
     * @private
     * Current step value.
     * @type {number}
     */
    Game.prototype._currentStep = null;

    /**
     * @private
     * Current platform index.
     * @type {number}
     */
    Game.prototype._platformIndex = null;

    /**
     * @private
     * Characters container.
     * @type {createjs.Container}
     */
    Game.prototype._charactersContainer = null;

    /**
     * @private
     * Platforms container.
     * @type {createjs.Container}
     */
    Game.prototype._platformsContainer = null;

    /**
     * @private
     * Game backdrop container.
     * @type {createjs.Container}
     */
    Game.prototype._backdropContainer = null;

    // ===========================================
    //  Temporary Variables
    // ===========================================
    var __character;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     *
     * @param {createjs.Stage} stage Main stage object for drawing.
     */
    function Game(stage) {
        this.isActive = false;
        this._isPaused = true;
        this.clip = new createjs.Container();
        this.clip.mouseEnabled = this.clip.mouseChildren = false;
        this._containerY = 0;
        this._currentStep = 0;
        this._platformIndex = 0;
        this._stage = stage;
        this._stage.ref = this;
        this._currentAnimalId = GameConfig.ANIMALS[0];
    }

    // Extends createjs EventDispatcher
    createjs.EventDispatcher.initialize(Game.prototype);

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * True if the game is paused, false otherwise.
     * @type {boolean}
     */
    Game.prototype.__defineGetter__("isPaused", function() {
        return this._isPaused;
    });

    /**
     * Array of all characters.
     * @type {array}
     */
    Game.prototype.__defineGetter__("characters", function() {
        return this._characters;
    });

    /**
     * Container Y position.
     * @type {number}
     */
    Game.prototype.__defineGetter__("containerY", function() {
        return this._containerY;
    });

    /**
     * Unique ID of the currently chosen team.
     * @type {string}
     */
    Game.prototype.__defineGetter__("currentAnimalId", function() {
        return this._currentAnimalId;
    });
    /**
     * @private
     */
    Game.prototype.__defineSetter__("currentAnimalId", function(value) {
        this._currentAnimalId = value;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Initializes game engine. Should be called from outside.
     */
    Game.prototype.init = function() {
        this._initContainers();
        this._initBackdrop();
        this._initCharacters();
        this._initPlatforms();

        // delay invalidate so to make sure all assets are loaded with correct dimensions
        setTimeout.call(this, this.invalidate, GameConfig.INVALIDATE_DELAY);
    };

    /**
     * Invalidates all game elements.
     */
    Game.prototype.invalidate = function() {
        return true;
    };

    /**
     * Resets the game.
     */
    Game.prototype.reset = function() {
        this._containerY = 0;
        this._currentStep = 0;
        this._platformIndex = 0;
        this.isActive = true;

        this.resume();
    };

    /**
     * Pauses the game.
     */
    Game.prototype.pause = function() {
        this._isPaused = true;
        this._pauseAnimations();
        this._pauseSounds();
    };

    /**
     * Resumes the game.
     */
    Game.prototype.resume = function() {
        this._isPaused = false;
        this._resumeAnimations();
        this._resumeSounds();
    };

    /**
     * Main loop logic.
     *
     * @param {number} deltaTime Time passed since last tick.
     */
    Game.prototype.update = function(deltaTime) {
        if (!this.clip.visible) return;
        if (this._isPaused) return;

        if (this._currentStep < 0) {
            this._currentStep = 0;
        }
        this._sky.update(this._currentStep);
        this._treeTrunk.update(this._currentStep);
        this._platforms.update(this._currentStep);
    };

    /**
     * Jumps to a particular step.
     */
    Game.prototype.jumpTo = function(step) {
        createjs.Tween.get(this).to({
            _currentStep: step
        }, GameConfig.JUMP_SUCCESS_DURATION, createjs.Ease.sineInOut);
    };

    /**
     * @private
     * Initializes graphics containers.
     */
    Game.prototype._initContainers = function() {
        this._charactersContainer = new createjs.Container();
        this._platformsContainer = new createjs.Container();
        this._backdropContainer = new createjs.Container();

        this._charactersContainer.mouseEnabled = this._charactersContainer.mouseChildren = false;
        this._platformsContainer.mouseEnabled = this._platformsContainer.mouseChildren = false;
        this._backdropContainer.mouseEnabled = true;

        this.clip.addChild(this._backdropContainer);
        this.clip.addChild(this._platformsContainer);
        this.clip.addChild(this._charactersContainer);
    };

    /**
     * @private
     * Initializes game backdrop.
     */
    Game.prototype._initBackdrop = function() {
        this._sky = new ParallaxGroup(Sky, 0.25);
        this._backdropContainer.addChild(this._sky.clip);

        this._treeTrunk = new ParallaxGroup(TreeTrunk);
        this._backdropContainer.addChild(this._treeTrunk.clip);
    };

    /**
     * @private
     * Initializes platforms.
     */
    Game.prototype._initPlatforms = function() {
        this._platforms = new PlatformGroup();
        this._platformsContainer.addChild(this._platforms.clip);

        // TODO
    };

    /**
     * @private
     * Initializes characters.
     */
    Game.prototype._initCharacters = function() {
        this._characters = {};
        this._charactersById = {};

        // TODO
    };

    /**
     * @private
     * Pauses all animations.
     */
    Game.prototype._pauseAnimations = function() {
        // TODO
    };

    /**
     * @private
     * Resumes all animations.
     */
    Game.prototype._resumeAnimations = function() {
        // TODO
    };

    /**
     * @private
     * Pauses all sounds.
     */
    Game.prototype._pauseSounds = function() {
        // TODO
    };

    /**
     * @private
     * Resumes all sounds.
     */
    Game.prototype._resumeSounds = function() {
        // TODO
    };

    /**
     * @private
     * Initializes inputs.
     */
    Game.prototype._initInput = function() {
        this._stage.addEventListener("stagemousedown", onStageClick);
    };

    /**
     * @private
     * Plays a 3D sound.
     *
     * @param {string} soundId ID of the sound to play, must already be pre-loaded to work.
     * @param {number} x X position of the source of the sound.
     * @param {number} y Y position of the source of the sound.
     * @return {createjs.SoundInstance} Instance of the sound being played.
     */
    Game.prototype._playSound = function(soundId, x, y, loop) {
        if (typeof(loop) === "undefined") loop = 0;
        return SoundManager.getInstance().playSpatialSound(
            soundId,
            x,
            y,
            GameConfig.VIEWPORT_HALF_WIDTH,
            -this._containerY + GameConfig.VIEWPORT_HALF_HEIGHT,
            loop
        );
    };

    /**
     * @private
     * Plays jump sound for the character.
     *
     * @param {Character} character Character to play the attack sound for.
     */
    Game.prototype._playJumpSound = function(character) {
        this._playSound(SoundDictionary.SOUND_JUMP, character.x, character.y, loop);
    };

    /**
     * Handles document key down.
     */
    Game.prototype.handleDocumentKeyDown = function(event) {
        // ignore if still jumping
        if (createjs.Tween.hasActiveTweens(this)) {
            return;
        }

        var jumpSuccess = false;
        var nextPlatformType = this._platforms.getPlatformType(this._platformIndex + 1);
        switch (event.keyCode) {
            // LEFT key
            case 37:
                jumpSuccess = nextPlatformType === Platform.TYPE_LEFT;
                break;

            // UP key
            case 38:
                jumpSuccess = nextPlatformType === Platform.TYPE_CENTER;
                break;

            // RIGHT key
            case 39:
                jumpSuccess = nextPlatformType === Platform.TYPE_RIGHT;
                break;
        }

        if (jumpSuccess) {
            this.jumpTo(++this._platformIndex * Platform.SPRITE_HEIGHT);
        }
    };

    // ===========================================
    //  Event Handlers
    // ===========================================
    /**
     * @private
     */
    function onStageClick(event) {
        var self = event.currentTarget.ref;
        if (!self.clip.visible) return;
        if (!self.isActive) return;
        if (self._isPaused) return;

        // TODO
    }

    /**
     * @private
     */
    function onCharacterJump(event) {
        var character = event.currentTarget;
        // TODO
    }

    return Game;
});