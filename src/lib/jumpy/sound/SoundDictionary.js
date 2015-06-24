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
    SoundDictionary.SOUND_BUTTON_CLICK = "assets/sounds/button-click.wav";
    SoundDictionary.SOUND_COUNTDOWN_TICK = "assets/sounds/countdown-tick.mp3";
    SoundDictionary.SOUND_EXPLODE_SMASH = "assets/sounds/explode-smash.mp3";
    SoundDictionary.SOUND_WIN = "assets/sounds/win.mp3";
    SoundDictionary.SOUND_LOSE = "assets/sounds/lose.mp3";

    SoundDictionary.MUSICS = [
        SoundDictionary.MUSIC_TITLE,
        SoundDictionary.MUSIC_BACKGROUND
    ];

    SoundDictionary.SOUNDS = [
        SoundDictionary.SOUND_JUMP,
        SoundDictionary.SOUND_BUTTON_CLICK,
        SoundDictionary.SOUND_COUNTDOWN_TICK,
        SoundDictionary.SOUND_EXPLODE_SMASH,
        SoundDictionary.SOUND_WIN,
        SoundDictionary.SOUND_LOSE
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