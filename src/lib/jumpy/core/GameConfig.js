/**
 * Game configuration data container.
 *
 * @author Anthony Tambrin
 */
define([
    "jumpy/core/Point2D"
], function(Point2D) {
    // ===========================================
    //  Public Constants
    // ===========================================
    /**
     * Frame per second.
     * @type {int}
     */
    GameConfig.FPS = 30;

    /**
     * Delay time before invalidate kicks in.
     * @type {int}
     */
    GameConfig.INVALIDATE_DELAY = 100;

    /**
     * Viewable area width.
     * @type {number}
     */
    GameConfig.VIEWPORT_WIDTH = 420;

    /**
     * Viewable area height.
     * @type {number}
     */
    GameConfig.VIEWPORT_HEIGHT = 760;

    /**
     * Viewable area half width.
     * @type {number}
     */
    GameConfig.VIEWPORT_HALF_WIDTH = GameConfig.VIEWPORT_WIDTH * 0.5;

    /**
     * Viewable area half height.
     * @type {number}
     */
    GameConfig.VIEWPORT_HALF_HEIGHT = GameConfig.VIEWPORT_HEIGHT * 0.5;

    /**
     * Character sprite width.
     * @type {number}
     */
    GameConfig.CHARACTER_SPRITE_WIDTH = 40;

    /**
     * Character sprite height.
     * @type {number}
     */
    GameConfig.CHARACTER_SPRITE_HEIGHT = 40;

    /**
     * Set to true to start game with sound on.
     * @type {boolean}
     */
    GameConfig.DEFAULT_SOUND_ON = true;

    /**
     * Set to true to start game with music on.
     * @type {boolean}
     */
    GameConfig.DEFAULT_MUSIC_ON = true;

    /**
     * Successful jump animation duration.
     * @type {boolean}
     */
    GameConfig.JUMP_SUCCESS_DURATION = 250;

    /**
     * Failed jump animation duration.
     * @type {boolean}
     */
    GameConfig.JUMP_FAIL_DURATION = 500;

    /**
     * Animal IDs.
     * @type {object[]}
     */
    GameConfig.ANIMALS = [
        "Bat",
        "Brown Bear",
        "Cat",
        "Crocodile",
        "Duck",
        "Elephant",
        "Fox",
        "Frog",
        "Hamster",
        "Hippo",
        "Horse",
        "Koala",
        "Lion",
        "Monkey",
        "Moose",
        "Panda",
        "Parrot",
        "Penguin",
        "Pig",
        "Polar Bear",
        "Rabbit",
        "Rhino",
        "Shark",
        "Sheep",
        "Snow Owl",
        "Tiger",
        "Walrus",
        "Wolf"
    ];

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function GameConfig() {
    }

    return GameConfig;
});