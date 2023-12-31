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
    "jumpy/net/ConnectionManager",
    "jumpy/screens/TitleScreen",
    "jumpy/screens/HUDScreen",
    "jumpy/screens/EndResultScreen",
    "jumpy/core/GameConfig",
    "jumpy/core/Game"
], function(
    createjs,
    SpriteDictionary, SoundDictionary, SoundManager, ConnectionManager,
    TitleScreen, HUDScreen, EndResultScreen,
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
    var __endResultScreen;
    var __stage;
    var __assetsLoader;
    var __soundManager;
    var __connectionManager;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function MainApplication() {
        Math.rand = new Math.seedrandom();
        createjs.Ticker.setFPS(GameConfig.FPS);
        document.onkeydown = onDocumentKeyDown;
        __soundManager = SoundManager.getInstance();
        __soundManager.isSoundOn = GameConfig.DEFAULT_SOUND_ON;
        __soundManager.isMusicOn = GameConfig.DEFAULT_MUSIC_ON;
        __connectionManager = ConnectionManager.getInstance();
        __connectionManager.on(ConnectionManager.CONNECTION_SUCCESS, onConnectionSuccess);
        __connectionManager.on(ConnectionManager.CONNECTION_ERROR, onConnectionError);
        __connectionManager.on(ConnectionManager.GAME_START, onGameStart);
        __connectionManager.on(ConnectionManager.GAME_END, onGameEnd);
        __connectionManager.on(ConnectionManager.GAME_START_TIME_RECEIVED, onGameStartTimeReceived);
        __connectionManager.on(ConnectionManager.GAME_END_TIME_RECEIVED, onGameEndTimeReceived);
        __connectionManager.on(ConnectionManager.WAIT_FOR_OTHERS, onWaitForOthers);
        __connectionManager.on(ConnectionManager.PEER_ADD, onPeerAdd);
        __connectionManager.on(ConnectionManager.PEER_REMOVE, onPeerRemove);
        __connectionManager.on(ConnectionManager.PEER_PLATFORM, onPeerPlatform);
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
        window.onerror = function() {
            self.location = '/index.html';
        };

        // initialize screens
        __titleScreen = new TitleScreen("titleScreen");
        __titleScreen.on(TitleScreen.PLAY_CLICK, onTitleScreenPlayClick);
        __titleScreen.clip.visible = false;

        // initialize the game
        __game = new Game(__stage);
        __stage.addChild(__game.clip);
        __game.clip.visible = false;
        __game.on(Game.MY_CHARACTER_JUMP, onMyCharacterJump);
        __game.on(Game.MY_ANIMAL_CHANGE, onMyAnimalChange);
        __game.on(Game.MY_RANK_CHANGE, onMyRankChange);

        // initialize HUD screen
        __hudScreen = new HUDScreen("hudScreen");
        __stage.addChild(__hudScreen.clip);
        __hudScreen.clip.visible = false;

        // initialize end result screen
        __endResultScreen = new EndResultScreen("endResultScreen");
        __endResultScreen.on(EndResultScreen.BACK_TO_TITLE_CLICK, onEndResultScreenBackToTitleClick);
        __endResultScreen.on(EndResultScreen.SMASH_SCREEN, onEndResultScreenSmashScreen);
        __stage.addChild(__endResultScreen.clip);
        __endResultScreen.clip.visible = false;

        // make sure title screen is on top
        __stage.addChild(__titleScreen.clip);

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
        var isEndResultScreenValidated = __endResultScreen.invalidate();
        if (!isGameValidated
            || !isTitleScreenValidated
            || !isHUDScreenValidated
            || !isEndResultScreenValidated) {
            setTimeout(ready, GameConfig.INVALIDATE_DELAY);
            return;
        }

        __stage.removeChild(__progressBar);
        __stage.removeChild(__progressLabel);
        showTitleScreen();
        __connectionManager.animalId = __game.currentAnimalId;
        __connectionManager.connect();
        document.onkeyup = onCharacterSelectChange;
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
     * Show title screen.
     */
    function showTitleScreen() {
        __titleScreen.reset();
        __titleScreen.clip.visible = true;
        __titleScreen.resume();
        __hudScreen.clip.visible = false;
        __hudScreen.reset();
        __hudScreen.pause();
        __game.reset();
        __game.clip.visible = true;
        __game.pause();
        __endResultScreen.clip.visible = false;
        __endResultScreen.reset();
        __endResultScreen.pause();

        __soundManager.stopSounds();
        if (!__soundManager.isPlayingMusic(SoundDictionary.MUSIC_TITLE)) {
            __soundManager.playMusic(SoundDictionary.MUSIC_TITLE);
        }
    }

    /**
     * @private
     * Show game screen.
     */
    function activateGameScreen() {
        __titleScreen.clip.visible = false;
        __titleScreen.pause();
        __hudScreen.clip.visible = true;
        __hudScreen.reset();
        __hudScreen.resume();
        __game.resume(__titleScreen.gameStartTime);
        __endResultScreen.clip.visible = false;
        __endResultScreen.reset();
        __endResultScreen.pause();

        if (!__soundManager.isPlayingMusic(SoundDictionary.MUSIC_BACKGROUND)) {
            __soundManager.playMusic(SoundDictionary.MUSIC_BACKGROUND);
        }
    }

    /**
     * @private
     * Show end result screen.
     * @param {string{}} animalIdsMapping Animal ID mapping by peer ID.
     * @param {string} myPeerId My current peer ID.
     * @param {string[]} ranks Peer ID array in order of the ranks.
     */
    function showEndResultScreen(animalIdsMapping, myPeerId, ranks) {
        __titleScreen.clip.visible = false;
        __titleScreen.pause();
        __hudScreen.clip.visible = false;
        __hudScreen.reset();
        __hudScreen.pause();
        __game.pause();
        __endResultScreen.clip.visible = true;
        __endResultScreen.reset();
        __endResultScreen.resume();
        __endResultScreen.showRanks(animalIdsMapping, myPeerId, ranks);

        __soundManager.stopMusic();
    }

    /**
     * @private
     * Resumes game loop.
     */
    function resume() {
        createjs.Ticker.addEventListener("tick", update);
    }

    /**
     * @private
     * Pauses game loop.
     */
    function pause() {
        createjs.Ticker.removeEventListener("tick", update);
    }

    /**
     * @private
     * Game loop.
     */
    function update(event) {
        __game.update();
        if (!__hudScreen.isPaused) {
            __hudScreen.update();
        }
        if (__endResultScreen.clip.visible) {
            __endResultScreen.update();
        }
        if (__titleScreen.clip.visible) {
            __titleScreen.update();
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
        resume();
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
        __connectionManager.join();
        __titleScreen.showWaiting();
    }

    /**
     * @private
     */
    function onEndResultScreenBackToTitleClick(event) {
        showTitleScreen();
        __connectionManager.animalId = __game.currentAnimalId;
        __connectionManager.connect();
    }

    /**
     * @private
     */
    function onEndResultScreenSmashScreen(event) {
        // shake the game screen
        __game.shake = 5;
        createjs.Tween.get(__game).to({ shake: 0 }, 2000, createjs.Ease.sineOut);

        // shake the end result screen
        __endResultScreen.shake = 5;
        createjs.Tween.get(__endResultScreen).to({ shake: 0 }, 2000, createjs.Ease.sineOut);
    }

    /**
     * @private
     */
    function onDocumentKeyDown(event) {
        switch (event.keyCode) {
            // ESC key
            case 27:
                break;

            // LEFT key
            case 37:
                break;

            // UP key
            case 38:
                break;

            // RIGHT key
            case 39:
                break;
        }
        if (__game) {
            __game.handleDocumentKeyDown(event);
        }
        if (__titleScreen) {
            __titleScreen.handleDocumentKeyDown(event);
        }
        if (__endResultScreen) {
            __titleScreen.handleDocumentKeyDown(event);
        }
    }

    /**
     * @private
     */
    function onConnectionSuccess(event) {
        if (__titleScreen.clip.visible) {
            __titleScreen.showPlayButton();
        }}

    /**
     * @private
     */
    function onConnectionError(event) {
        if (__titleScreen.clip.visible) {
            __titleScreen.showConnectionError();
        } else if (!__game.isPaused) {
            showTitleScreen();
            __titleScreen.showConnectionError();
        }
    }

    /**
     * @private
     */
    function onGameStart(event) {
        activateGameScreen();
    }

    /**
     * @private
     */
    function onGameEnd(event) {
        showEndResultScreen(event.animalIdsMapping, event.myPeerId, event.ranks);
    }

    /**
     * @private
     */
    function onGameStartTimeReceived(event) {
        if (__titleScreen.clip.visible) {
            __titleScreen.gameStartTime = event.gameStartTime;
            __titleScreen.timeDiff = event.timeDiff;
            __titleScreen.showStarting();
        }
        __hudScreen.timeDiff = event.timeDiff;
        __game.seed = event.gameStartTime;
    }

    /**
     * @private
     */
    function onGameEndTimeReceived(event) {
        __hudScreen.gameEndTime = event.gameEndTime;
    }

    /**
     * @private
     */
    function onWaitForOthers(event) {
        if (__titleScreen.clip.visible) {
            __titleScreen.showWaiting();
        }
    }

    /**
     * @private
     */
    function onCharacterSelectChange(event) {
        if (__game) {
            __game.selectCharacter(event);
        }
    }

    /**
     * @private
     */
    function onPeerAdd(event) {
        __game.addPeer(event.peerId, event.animalId);
    }

    /**
     * @private
     */
    function onPeerRemove(event) {
        __game.removeCharacterById(event.peerId);
    }

    /**
     * @private
     */
    function onPeerPlatform(event) {
        __game.updateTargetPlatformIndex(event.peerId, event.platformIndex);
    }

    /**
     * @private
     */
    function onMyCharacterJump(event) {
        __hudScreen.score = event.score;
        __connectionManager.updateScore(event.score);
        __connectionManager.updatePlatformIndex(event.platformIndex);
    }

    /**
     * @private
     */
    function onMyAnimalChange(event) {
        __connectionManager.animalId = __game.currentAnimalId;
    }

    /**
     * @private
     */
    function onMyRankChange(event) {
        if (__hudScreen.clip.visible) {
            __hudScreen.rank = __game.currentRank;
        }
    }

    return MainApplication;
});