/**
 * Main application.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/sprite/SpriteDictionary",
    "jumpy/sound/SoundDictionary",
    "jumpy/sound/SoundManager",
    "jumpy/screens/TitleScreen",
    "jumpy/screens/HUDScreen",
    "jumpy/core/GameConfig",
    "jumpy/core/Game"
], function(
    createjs,
    SpriteDictionary, SoundDictionary, SoundManager,
    TitleScreen, HUDScreen,
    GameConfig, Game
) {
    // ===========================================
    //  Private Members
    // ===========================================
    var __progressBar;
    var __progressLabel;
    var __game;
    var __titleScreen;
    var __hudScreen;
    var __stage;
    var __assetsLoader;
    var __soundManager;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function MainApplication() {
        createjs.Ticker.setFPS(GameConfig.FPS);
        document.onkeydown = onDocumentKeyDown;
        __soundManager = SoundManager.getInstance();
        __soundManager.isSoundOn = GameConfig.DEFAULT_SOUND_ON;
        __soundManager.isMusicOn = GameConfig.DEFAULT_MUSIC_ON;
        loadAssets();
    }

    // ===========================================
    //  Private Methods
    // ===========================================
    /**
     * @private
     * Loads all assets.
     */
    function loadAssets() {
        // initialize main components
        __stage = new createjs.Stage("mainCanvas");

        // add loading progress
        __progressBar = new createjs.Shape();
        __progressBar.graphics.beginLinearGradientFill(["#fff200", "#ffd204"], [0, 1], 0, 0, 0, 20);
        __progressBar.graphics.drawRect(0, 0, GameConfig.VIEWPORT_WIDTH - 20, 20);
        __progressBar.graphics.endFill();
        __progressBar.x = 10;
        __progressBar.y = GameConfig.VIEWPORT_HEIGHT - 40;
        __progressBar.scaleX = 0;
        __progressLabel = new createjs.Text("Loading... 0%", "normal 14px Courier", "#ffc000");
        __progressLabel.textAlign = "center";
        __progressLabel.x = GameConfig.VIEWPORT_WIDTH * 0.5;
        __progressLabel.y = __progressBar.y - 18;
        __stage.addChild(__progressBar);
        __stage.addChild(__progressLabel);
        __stage.update();

        // initialize assets loader
        __assetsLoader = new createjs.LoadQueue();
        __assetsLoader.installPlugin(createjs.Sound);
        __assetsLoader.addEventListener("progress", onAssetsLoadProgress);
        __assetsLoader.addEventListener("complete", onAssetsLoadComplete);

        // load assets
        loadGraphics();
        loadSounds();
    }

    /**
     * @private
     * Initializes everything.
     */
    function init() {
        // initialize screens
        __titleScreen = new TitleScreen("titleScreen");
        __titleScreen.on(TitleScreen.PLAY_CLICK, onTitleScreenPlayClick);
        __stage.addChild(__titleScreen.clip);
        __titleScreen.clip.visible = false;

        // initialize the game and HUD
        __game = new Game(__stage);
        __stage.addChild(__game.clip);
        __game.clip.visible = false;

        __hudScreen = new HUDScreen("hudScreen");
        __stage.addChild(__hudScreen.clip);
        __hudScreen.clip.visible = false;

        // needs delay for button positioning
        setTimeout(ready, GameConfig.INVALIDATE_DELAY);
    }

    /**
     * @private
     * Sets the game to be ready and playable by removing the loading and showing the title screen.
     */
    function ready() {
        // re-validate
        var isGameValidated = __game.invalidate();
        var isTitleScreenValidated = __titleScreen.invalidate();
        var isHUDScreenValidated = __hudScreen.invalidate();
        if (!isGameValidated
            || !isTitleScreenValidated
            || !isHUDScreenValidated) {
            setTimeout(ready, GameConfig.INVALIDATE_DELAY);
            return;
        }

        __stage.removeChild(__progressBar);
        __stage.removeChild(__progressLabel);
        showTitleScreen();
    }

    /**
     * @private
     * Loads sprite bitmap assets.
     */
    function loadGraphics() {
        __assetsLoader.loadManifest(getLoadManifestFromDictionary(SpriteDictionary.BITMAPS));
        __assetsLoader.loadManifest(getLoadManifestFromDictionary(SpriteDictionary.SPRITES));
    }

    /**
     * @private
     * Loads sound assets.
     */
    function loadSounds() {
        __assetsLoader.loadManifest(getLoadManifestFromDictionary(SoundDictionary.MUSICS));
        __assetsLoader.loadManifest(getLoadManifestFromDictionary(SoundDictionary.SOUNDS));
    }

    /**
     * @private
     * Builds load manifest from dictionary.
     *
     * @param {string[]} files Array of file paths.
     */
    function getLoadManifestFromDictionary(files) {
        var manifest = [];
        var i = -1;
        var len = files.length;
        var filePath;
        while (++i < len) {
            filePath = files[i];
            manifest.push({
                id: filePath,
                src: filePath
            });
        }
        return manifest;
    }

    /**
     * @private
     * Initializes game.
     */
    function initGame() {
        __game.init(new GameConfig());
    }

    /**
     * @private
     * Restarts game.
     */
    function restartGame() {
        __game.reset();
        __game.resume();
        __titleScreen.clip.visible = false;
        __hudScreen.reset();
        __hudScreen.clip.visible = true;
        __game.clip.visible = true;

        __soundManager.stopSounds();
        __soundManager.playMusic(SoundDictionary.MUSIC_BACKGROUND);
    }

    /**
     * @private
     * Show title screen.
     */
    function showTitleScreen() {
        __titleScreen.clip.visible = true;
        __hudScreen.clip.visible = false;
        __hudScreen.reset();
        __game.clip.visible = false;
        __game.isPaused = true;

        __soundManager.stopSounds();
        if (!__soundManager.isPlayingMusic(SoundDictionary.MUSIC_TITLE)) {
            __soundManager.playMusic(SoundDictionary.MUSIC_TITLE);
        }
    }

    /**
     * @private
     * Game loop.
     */
    function update(event) {
        if (!__game.isPaused) {
            __game.update(event.delta);
        }
        __stage.update(event);
    }

    // ===========================================
    //  Event Handlers
    // ===========================================
    /**
     * @private
     */
    function onAssetsLoadComplete(event) {
        init();
        initGame();
    }

    /**
     * @private
     */
    function onAssetsLoadProgress(event) {
        __progressBar.scaleX = event.progress;
        __progressLabel.text = "Loading... " + Math.floor(event.progress * 100) + "%";
        __stage.update();
    }

    /**
     * @private
     */
    function onTitleScreenPlayClick(event) {
        // TODO
    }

    /**
     * @private
     */
    function onDocumentKeyDown(event) {
        console.log(event.keyCode);
        switch (event.keyCode) {
            // ESC key
            case 27:
                break;
        }
    }

    return MainApplication;
});