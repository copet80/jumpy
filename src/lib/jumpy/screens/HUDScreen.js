/**
 * HUD screen shows indicator on players.
 *
 * @author Anthony Tambrin
 */
define([
    "./BaseScreen",
    "jumpy/core/GameConfig",
    "jumpy/sprite/SpriteDictionary"
], function(
    BaseScreen,
    GameConfig, SpriteDictionary
) {
    // ===========================================
    //  Event Types
    // ===========================================

    // ===========================================
    //  Private Constants
    // ===========================================

    // ===========================================
    //  Protected Members
    // ===========================================

    // ===========================================
    //  Constructor
    // ===========================================
    /**
     * @inheritDoc
     */
    function HUDScreen(id) {
        BaseScreen.call(this, id);
    }

    // Extends the parent class
    HUDScreen.prototype = Object.create(BaseScreen.prototype);

    // ===========================================
    //  Public Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    HUDScreen.prototype.invalidate = function() {
        var success = BaseScreen.prototype.invalidate.call(this);

        // TODO

        return success;
    };

    /**
     * Resets the states of all elements.
     */
    HUDScreen.prototype.reset = function() {
        // TODO
    };

    // ===========================================
    //  Protected Methods
    // ===========================================
    /**
     * @inheritDoc
     */
    HUDScreen.prototype._initClip = function() {
        BaseScreen.prototype._initClip.call(this);

        // TODO
    };

    // ===========================================
    //  Events
    // ===========================================

    return HUDScreen;
});