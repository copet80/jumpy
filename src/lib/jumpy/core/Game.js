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
     * Dispatched when my character jumps.
     * @type {string}
     */
    Game.MY_CHARACTER_JUMP = "myCharacterJump";

    /**
     * Dispatched when I change my animal.
     * @type {string}
     */
    Game.MY_ANIMAL_CHANGE = "myAnimalChange";

    // ===========================================
    //  Public Members
    // =======================================
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
     * The character that the player is controlling.
     * @type {Character}
     */
    Game.prototype._myCharacter = null;

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
     * Platforms seed.
     * @type {number}
     */
    Game.prototype._seed = 0;

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

    /**
     * @private
     * Shake value (radius distance offset from [0, 0] position).
     * @type {number}
     */
    Game.prototype._shake = 0;

    /**
     * @private
     * Number of consecutive missed jump.
     * @type {number}
     */
    Game.prototype._jumpMissCount = 0;

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
        return this._myCharacter.animalId;
    });
    /**
     * @private
     */
    Game.prototype.__defineSetter__("currentAnimalId", function(value) {
        this._myCharacter.animalId = value;
    });

    /**
     * Unique ID of the currently chosen team.
     * @type {string}
     */
    Game.prototype.__defineGetter__("shake", function() {
        return this._shake;
    });
    /**
     * @private
     */
    Game.prototype.__defineSetter__("shake", function(value) {
        this._shake = value;
        this.clip.x = this._shake * Math.random();
        this.clip.y = this._shake * Math.random();
    });

    /**
     * Platforms seed.
     * @type {number}
     */
    Game.prototype.__defineGetter__("seed", function() {
        return this._seed;
    });
    /**
     * @private
     */
    Game.prototype.__defineSetter__("seed", function(value) {
        this._seed = value;
        if (this._platforms) {
            this._platforms.seed = this._seed;
        }
        if (this._myCharacter) {
            this._resetCharacter(this._myCharacter);
        }
        this.update(true);
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
        this._initPlatforms();
        this._initCharacters();

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
        this.update(true);
        if (this._myCharacter) {
            this._resetCharacter(this._myCharacter);
        }
        this._platforms.showHint(0);
        this.resume();
    };

    /**
     * Pauses the game.
     */
    Game.prototype.pause = function() {
        this._isPaused = true;
    };

    /**
     * Resumes the game.
     */
    Game.prototype.resume = function() {
        this._isPaused = false;
    };

    /**
     * Updates peer's target platform index.
     * @param {string} peerId Peer ID to update.
     * @param {number} platformIndex Platform index.
     */
    Game.prototype.updateTargetPlatformIndex = function(peerId, platformIndex) {
        var character = this._charactersById[peerId];
        if (character) {
            character.targetPlatformIndex = platformIndex;
        }
    };

    /**
     * Main loop logic.
     * @param {boolean} forceUpdate Set to true to force update.
     */
    Game.prototype.update = function(forceUpdate) {
        if (!this.clip.visible) return;

        if (this._currentStep < 0) {
            this._currentStep = 0;
        }
        this._sky.update(this._currentStep);
        this._treeTrunk.update(this._currentStep);
        this._platforms.update(this._currentStep, forceUpdate);

        var i = this._characters.length;
        var character;
        while (--i >= 0) {
            character = this._characters[i];
            if (character !== this._myCharacter && character.targetPlatformIndex > character.currentPlatformIndex) {
                this.jumpToPlatform(character, character.currentPlatformIndex + 1);
            }
            character.y = this._currentStep - character.ry + character.y0;
            character.update();
        }
    };

    /**
     * Jumps to a particular platform.
     *
     * @param {Character} character Character to make jump for.
     * @param {number} platformIndex Index of the platform to jump to.
     */
    Game.prototype.jumpToPlatform = function(character, platformIndex) {
        if (createjs.Tween.hasActiveTweens(character)) {
            return;
        }
        var step = platformIndex * Platform.SPRITE_HEIGHT;

        if (character === this._myCharacter) {
            createjs.Tween.get(this).to({
                _currentStep: step
            }, GameConfig.JUMP_SUCCESS_DURATION, createjs.Ease.sineInOut);
        }

        var targetX = this._getRandomPositionOnPlatform(this._platforms.getPlatformType(platformIndex));
        character.jump();
        character.scaleX = targetX < character.x ? -1 : 1;
        character.update();
        createjs.Tween.get(character, {
                onChange: function(event) {
                    if (event.currentTarget.position === GameConfig.JUMP_SUCCESS_DURATION) {
                        return;
                    }
                    var jumpProgress = event.currentTarget.position / GameConfig.JUMP_SUCCESS_DURATION;
                    character.ry = ((platformIndex - 1 + jumpProgress) * Platform.SPRITE_HEIGHT) +
                        (Math.sin(jumpProgress * Math.PI) * GameConfig.CHARACTER_SPRITE_HEIGHT * 2);
                }.bind(this)
            })
            .to({
                x: targetX
            }, GameConfig.JUMP_SUCCESS_DURATION, createjs.Ease.sineOut)
            .call(function() {
                character.ry = step;
                character.y = character.y0;
                character.update();
                character.idle();
            }.bind(this));
    };

    /**
     * Plays jump missed sequence.
     *
     * @param {Character} character Character to make jump for.
     */
    Game.prototype.jumpMissed = function(character) {
        var targetX = this._getRandomPositionOnPlatform(this._platforms.getPlatformType(this._platformIndex));
        character.jump();
        character.scaleX = targetX < character.x ? -1 : 1;
        character.update();
        createjs.Tween.get(character, {
                onChange: function(event) {
                    character.ry =
                        this._currentStep +
                        Math.sin(event.currentTarget.position / GameConfig.JUMP_FAIL_DURATION * Math.PI) *
                        GameConfig.CHARACTER_SPRITE_HEIGHT * 3;
                }.bind(this)
            })
            .to({
                x: targetX
            }, GameConfig.JUMP_FAIL_DURATION, createjs.Ease.sineOut)
            .call(function() {
                character.y = character.y0;
                character.update();
                character.idle();
            }.bind(this));
    };

    /**
     * Adds a peer into the game.
     * @param {string} peerId
     * @param {string} animalId
     */
    Game.prototype.addPeer = function(peerId, animalId) {
        var character = new Character(peerId);
        character.animalId = animalId;
        this._resetCharacter(character);
        this.addCharacter(character);
    };

    /**
     * Adds a character into the game.
     * @param {Character} character Character to add.
     */
    Game.prototype.addCharacter = function(character) {
        if (character && !this._charactersById[character.id]) {
            this._characters.push(character);
            this._charactersById[character.id] = character;
            this._charactersContainer.addChild(character.clip);
        }
    };

    /**
     * Removes a character into the game.
     * @param {string} id ID of the character to remove.
     */
    Game.prototype.removeCharacterById = function(id) {
        if (id && this._charactersById[id]) {
            var i = this._characters.length;
            while (--i >= 0) {
                if (this._characters[i].id === id) {
                    this._characters.splice(i, 1);
                    break;
                }
            }
            this._charactersContainer.removeChild(this._charactersById[id].clip);
            delete this._charactersById[id];
        }
    };

    // ===========================================
    //  Private Methods
    // ===========================================
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
        this._platforms = new PlatformGroup(this._seed);
        this._platformsContainer.addChild(this._platforms.clip);
    };

    /**
     * @private
     * Initializes characters.
     */
    Game.prototype._initCharacters = function() {
        this._characters = [];
        this._charactersById = {};
        this._myCharacter = new Character('myCharacter', true);
        this._myCharacter.animalId = GameConfig.ANIMALS[Math.floor(Math.random() * GameConfig.ANIMALS.length)];
        this._resetCharacter(this._myCharacter);
        this.addCharacter(this._myCharacter);
    };

    /**
     * @private
     * Resets character and its position to the first platform.
     * @param {Character} character Character to reset.
     */
    Game.prototype._resetCharacter = function(character) {
        character.x = this._getRandomPositionOnPlatform(this._platforms.getPlatformType(0));
        character.y0 = character.y = GameConfig.VIEWPORT_HEIGHT - Platform.SPRITE_HEIGHT * 0.72;
        character.ry = 0;
        character.update();
        character.idle();
    };

    /**
     * @private
     * Gets random X position based on platform type.
     *
     * @param {number} platformType Platform type.
     * @returns {number} X coordinate.
     */
    Game.prototype._getRandomPositionOnPlatform = function(platformType) {
        switch (platformType) {
            case Platform.TYPE_LEFT:
                return GameConfig.CHARACTER_SPRITE_WIDTH +
                       (Math.random() * (GameConfig.VIEWPORT_WIDTH - GameConfig.CHARACTER_SPRITE_WIDTH) * 0.25);

            case Platform.TYPE_CENTER:
                return (GameConfig.VIEWPORT_WIDTH - GameConfig.CHARACTER_SPRITE_WIDTH) * 0.375 +
                       (Math.random() * (GameConfig.VIEWPORT_WIDTH * 0.25 - GameConfig.CHARACTER_SPRITE_WIDTH));

            case Platform.TYPE_RIGHT:
                return (GameConfig.VIEWPORT_WIDTH - GameConfig.CHARACTER_SPRITE_WIDTH) * 0.75 +
                       (Math.random() * (GameConfig.VIEWPORT_WIDTH * 0.25 - GameConfig.CHARACTER_SPRITE_WIDTH));
        }
        return 0;
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
            GameConfig.VIEWPORT_HALF_HEIGHT,
            GameConfig.VIEWPORT_HALF_WIDTH,
            GameConfig.VIEWPORT_HALF_HEIGHT,
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
        this._playSound(SoundDictionary.SOUND_JUMP, character.x, character.y);
    };

    /**
     * Handles document key down.
     */
    Game.prototype.handleDocumentKeyDown = function(event) {
        if (this._isPaused) {
            // change character
            var animalIndex;
            switch (event.keyCode) {
                // LEFT key
                case 37:
                    animalIndex = GameConfig.ANIMALS.indexOf(this._myCharacter.animalId);
                    if (--animalIndex < 0) {
                        animalIndex = GameConfig.ANIMALS.length - 1;
                    }
                    this._myCharacter.animalId = GameConfig.ANIMALS[animalIndex];
                    this.dispatchEvent(new createjs.Event(Game.MY_ANIMAL_CHANGE));
                    break;

                // RIGHT key
                case 39:
                    animalIndex = GameConfig.ANIMALS.indexOf(this._myCharacter.animalId);
                    if (++animalIndex >= GameConfig.ANIMALS.length) {
                        animalIndex = 0;
                    }
                    this._myCharacter.animalId = GameConfig.ANIMALS[animalIndex];
                    this.dispatchEvent(new createjs.Event(Game.MY_ANIMAL_CHANGE));
                    break;
            }
            return;
        }

        // ignore if still jumping
        if (createjs.Tween.hasActiveTweens(this._myCharacter)) {
            return;
        }

        var jumpSuccess = 0;
        var nextPlatformType = this._platforms.getPlatformType(this._platformIndex + 1);
        switch (event.keyCode) {
            // LEFT key
            case 37: jumpSuccess = nextPlatformType === Platform.TYPE_LEFT ? 1 : 2; break;
            // UP key
            case 38: jumpSuccess = nextPlatformType === Platform.TYPE_CENTER ? 1 : 2; break;
            // RIGHT key
            case 39: jumpSuccess = nextPlatformType === Platform.TYPE_RIGHT ? 1 : 2; break;
        }

        if (jumpSuccess === 1) {
            this._jumpMissCount = 0;
            this._playJumpSound(this._myCharacter);
            this.jumpToPlatform(this._myCharacter, ++this._platformIndex);

            var event = new createjs.Event(Game.MY_CHARACTER_JUMP);
            event.platformIndex = this._platformIndex;
            event.score = this._platformIndex * Platform.SPRITE_HEIGHT;
            this.dispatchEvent(event);
        } else if (jumpSuccess === 2) {
            if (++this._jumpMissCount >= 3) {
                this._platforms.showHint(this._platformIndex);
                this._jumpMissCount = 0;
            }
            this._playJumpSound(this._myCharacter);
            this.jumpMissed(this._myCharacter);
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

    return Game;
});