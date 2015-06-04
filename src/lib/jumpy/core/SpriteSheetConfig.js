/**
 * Sprite sheet data configuration.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary",
    "jumpy/core/Character"
], function(createjs, GameConfig, SpriteDictionary, Character) {
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
                ]
            };
            data.animations[animal.id + "_" + SpriteSheetConfig.JUMP] = {
                frames: [
                    offset + 2
                ]
            };
            data.animations[animal.id + "_" + SpriteSheetConfig.LAND] = {
                frames: [
                    offset + 3,
                    offset + 4
                ]
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