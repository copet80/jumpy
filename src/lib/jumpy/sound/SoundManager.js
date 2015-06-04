/**
 * Sound manager provides convenient methods for playing music and spatial sound effects.
 *
 * @author Anthony Tambrin
 */
define([
    "createjs",
    "jumpy/core/GameConfig"
], function(createjs, GameConfig) {
    // ===========================================
    //  Singleton
    // ===========================================
    var instance = null;

    // ===========================================
    //  Public Members
    // ===========================================
    /**
     * True if music is on, false otherwise.
     * @type {boolean}
     */
    SoundManager.prototype.isMusicOn = null;

    /**
     * True if sound is on, false otherwise.
     * @type {boolean}
     */
    SoundManager.prototype.isSoundOn = null;

    // ===========================================
    //  Protected Members
    // ===========================================
    /**
     * @private
     * Instance of the current music playing.
     * @type {boolean}
     */
    SoundManager.prototype._currentMusic;

    /**
     * @private
     * True if music is on, false otherwise.
     * @type {boolean}
     */
    SoundManager.prototype._isMusicOn = null;

    /**
     * @private
     * True if sound is on, false otherwise.
     * @type {boolean}
     */
    SoundManager.prototype._isSoundOn = null;

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @constructor
     * Creates an instance of this class.
     */
    function SoundManager() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one SoundManager, use SoundManager.getInstance()");
        }

        this._isMusicOn = true;
        this._isSoundOn = true;
    }

    /**
     * Gets singleton instance.
     * @return SoundManager singleton.
     */
    SoundManager.getInstance = function() {
        if (instance === null) {
            instance = new SoundManager();
        }
        return instance;
    };

    // ===========================================
    //  Getters / Setters
    // ===========================================
    /**
     * True if music is on, false otherwise.
     * @type {boolean}
     */
    SoundManager.prototype.__defineGetter__("isMusicOn", function() {
        return this._isMusicOn;
    });
    /**
     * @private
     */
    SoundManager.prototype.__defineSetter__("isMusicOn", function(value) {
        this._isMusicOn = value;
    });

    /**
     * True if sound is on, false otherwise.
     * @type {boolean}
     */
    SoundManager.prototype.__defineGetter__("isSoundOn", function() {
        return this._isSoundOn;
    });
    /**
     * @private
     */
    SoundManager.prototype.__defineSetter__("isSoundOn", function(value) {
        this._isSoundOn = value;
    });

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * Stops current music and play the new one because there should only be one music playing.
     *
     * @param {string} musicId ID of the music to play, must already be pre-loaded to work.
     */
    SoundManager.prototype.playMusic = function(musicId) {
        if (this._currentMusic) this._currentMusic.stop();
        this._currentMusic = createjs.Sound.play(musicId, {loop: -1, volume: 0.4});
        if (!this.isMusicOn) this._currentMusic.pause();
    };

    /**
     * Checks if music with a specific ID is playing.
     *
     * @param {boolean} True if the music with that ID is playing, false otherwise.
     */
    SoundManager.prototype.isPlayingMusic = function(musicId) {
        if (this._currentMusic) return this._currentMusic.src === musicId;
        return false;
    };

    /**
     * Resumes currently playing music.
     */
    SoundManager.prototype.resumeMusic = function() {
        if (this._currentMusic) this._currentMusic.resume();
    };

    /**
     * Pauses currently playing music.
     */
    SoundManager.prototype.pauseMusic = function() {
        if (this._currentMusic) this._currentMusic.pause();
    };

    /**
     * Stops currently playing music.
     */
    SoundManager.prototype.stopMusic = function() {
        if (this._currentMusic) this._currentMusic.stop();
    };

    /**
     * Stops all currently playing sounds.
     */
    SoundManager.prototype.stopSounds = function() {
        var position = 0;
        if (this._currentMusic) {
            position = this._currentMusic.getPosition();
        }
        createjs.Sound.stop();
        // resume music
        if (this._currentMusic && this.isMusicOn) {
            this._currentMusic.play({offset: position});
        }
    };

    /**
     * Plays a sound.
     *
     * @param {string} soundId ID of the sound to play, must already be pre-loaded to work.
     * @return {createjs.SoundInstance} Instance of the sound being played.
     */
    SoundManager.prototype.playSound = function(soundId) {
        if (!this.isSoundOn) return null;
        return createjs.Sound.play(soundId);
    };

    /**
     * Plays a 3D sound based on the position of the object.
     *
     * @param {string} soundId ID of the sound to play, must already be pre-loaded to work.
     * @param {number} sourceX X position of the source of the sound.
     * @param {number} sourceY Y position of the source of the sound.
     * @param {number} listenerX X position of the listener of the sound.
     * @param {number} listenerY Y position of the listener of the sound.
     * @param {int} loop Number of times the sound should loop, set to -1 to loop forever, default is 0 (no loop).
     * @return {createjs.SoundInstance} Instance of the sound being played.
     */
    SoundManager.prototype.playSpatialSound = function(soundId, sourceX, sourceY, listenerX, listenerY, loop) {
        if (!this.isSoundOn) return null;
        if (typeof(loop) === "undefined") loop = 0;
        var volume = 0.5 + (GameConfig.VIEWPORT_HALF_HEIGHT + (sourceY - listenerY)) / GameConfig.VIEWPORT_HALF_WIDTH * 0.5;
        if (volume > 1) {
            volume = 1 - (volume - 1);
        }
        var pan = (sourceX - listenerX) / GameConfig.VIEWPORT_HALF_WIDTH;
        if (pan < -1) {
            pan = -1;
            volume += pan;
        } else if (pan > 1) {
            pan = 1;
            volume -= pan;
        }
        return createjs.Sound.play(soundId, {volume: volume, pan: pan, loop: loop});
    };

    return SoundManager;
});