/**
 * Sprite sheet data configuration.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary"
], function(createjs, GameConfig, SpriteDictionary) {
    // ===========================================
    //  Public Constants
    // ===========================================
    // Animation IDs
    SpriteSheetConfig.IDLE = "idle";
    SpriteSheetConfig.JUMP = "jump";
    SpriteSheetConfig.LAND = "land";

    // ===========================================
    //  Public Members
    // ===========================================
    SpriteSheetConfig.prototype.CHARACTER = null;

    // ===========================================
    //  Singleton
    // ===========================================
    var instance = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function SpriteSheetConfig() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one SpriteSheetConfig, use SpriteSheetConfig.getInstance()");
        }

        var data = {
            framerate: 8,
            images: [
                SpriteDictionary.SPRITE_CHARACTER
            ],
            frames: {
                width: GameConfig.CHARACTER_SPRITE_WIDTH,
                height: GameConfig.CHARACTER_SPRITE_HEIGHT,
                regX: GameConfig.CHARACTER_SPRITE_WIDTH * 0.5,
                regY: GameConfig.CHARACTER_SPRITE_HEIGHT
            },
            animations: {}
        };

        // fill in team-specific animations
        var i = GameConfig.ANIMALS.length;
        var animal;
        var numSpritesPerCharacter = 5;
        var offset;
        while (--i >= 0) {
            animal = GameConfig.ANIMALS[i];
            offset = i * numSpritesPerCharacter;
            data.animations[animal + "_" + SpriteSheetConfig.IDLE] = {
                frames: [
                    offset + 0,
                    offset + 1
                ],
                speed: 0.5,
                next: animal + "_" + SpriteSheetConfig.IDLE
            };
            data.animations[animal + "_" + SpriteSheetConfig.JUMP] = {
                frames: [
                    offset + 2
                ],
                next: animal + "_" + SpriteSheetConfig.JUMP
            };
            data.animations[animal + "_" + SpriteSheetConfig.LAND] = {
                frames: [
                    offset + 3,
                    offset + 4
                ],
                next: animal + "_" + SpriteSheetConfig.IDLE
            };
        }
        this.CHARACTER = data;
    }

    /**
     * Gets singleton instance.
     * @return SpriteSheetConfig singleton.
     */
    SpriteSheetConfig.getInstance = function() {
        if (instance === null) {
            instance = new SpriteSheetConfig();
        }
        return instance;
    };

    return SpriteSheetConfig;
});