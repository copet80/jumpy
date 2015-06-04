/**
 * Keeps data repository of all sounds and music used in the game.
 *
 * @author Anthony Tambrin
 */
define(function() {
    // ===========================================
    //  Constants
    // ===========================================
    // Music
    SoundDictionary.MUSIC_TITLE = "assets/music/intro.mp3";
    SoundDictionary.MUSIC_BACKGROUND = "assets/music/game.mp3";

    // Sound Effects
    SoundDictionary.SOUND_JUMP = "assets/sounds/jump.mp3";
    SoundDictionary.SOUND_BUTTON_CLICK = "assets/sounds/button-click.mp3";

    SoundDictionary.MUSICS = [
        SoundDictionary.MUSIC_TITLE,
        SoundDictionary.MUSIC_BACKGROUND
    ];

    SoundDictionary.SOUNDS = [
        SoundDictionary.SOUND_JUMP,
        SoundDictionary.SOUND_BUTTON_CLICK
    ];

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function SoundDictionary() {
    }

    return SoundDictionary;
});