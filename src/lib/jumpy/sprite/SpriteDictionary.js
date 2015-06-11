/**
 * Keeps data repository of all sprites used in the game.
 *
 * @author Anthony Tambrin
 */
define([
    "jumpy/core/GameConfig"
], function(GameConfig) {
    // ===========================================
    //  Constants
    // ===========================================
    // Sprites
    SpriteDictionary.SPRITE_CHARACTER = "assets/sprites/character.png";
    SpriteDictionary.SPRITE_PLATFORMS = "assets/sprites/platforms.png";
    SpriteDictionary.SPRITE_COUNTDOWN = "assets/sprites/countdown.png";
    SpriteDictionary.SPRITE_SKY = "assets/sprites/sky.png";
    SpriteDictionary.SPRITE_TREE_TRUNK = "assets/sprites/tree-trunk.png";

    // Bitmaps
    SpriteDictionary.BITMAP_PLAY_BUTTON = "assets/bitmaps/button-play.png";
    SpriteDictionary.BITMAP_LOGO = "assets/bitmaps/logo.png";
    SpriteDictionary.BITMAP_WAITING_TEXT = "assets/bitmaps/text-waiting.png";
    SpriteDictionary.BITMAP_CONNECTING_TEXT = "assets/bitmaps/text-connecting.png";
    SpriteDictionary.BITMAP_CONNECTION_PROBLEM_TEXT = "assets/bitmaps/text-connection-problem.png";

    SpriteDictionary.SPRITES = [
        SpriteDictionary.SPRITE_CHARACTER,
        SpriteDictionary.SPRITE_PLATFORMS,
        SpriteDictionary.SPRITE_COUNTDOWN,
        SpriteDictionary.SPRITE_SKY,
        SpriteDictionary.SPRITE_TREE_TRUNK
    ];

    SpriteDictionary.BITMAPS = [
        SpriteDictionary.BITMAP_PLAY_BUTTON,
        SpriteDictionary.BITMAP_LOGO,
        SpriteDictionary.BITMAP_WAITING_TEXT,
        SpriteDictionary.BITMAP_CONNECTING_TEXT,
        SpriteDictionary.BITMAP_CONNECTION_PROBLEM_TEXT
    ];

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function SpriteDictionary() {
    }

    return SpriteDictionary;
});