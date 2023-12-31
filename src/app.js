/**
 * Application entry point / wrapper class.
 *
 * @author Anthony Tambrin
 */

// Enable the passage of the 'this' object through the JavaScript timers
var __nativeST__ = window.setTimeout, __nativeSI__ = window.setInterval;
window.setTimeout = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
    var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
    return __nativeST__(vCallback instanceof Function ? function () {
        vCallback.apply(oThis, aArgs);
    } : vCallback, nDelay);
};
window.setInterval = function (vCallback, nDelay /*, argumentToPass1, argumentToPass2, etc. */) {
    var oThis = this, aArgs = Array.prototype.slice.call(arguments, 2);
    return __nativeSI__(vCallback instanceof Function ? function () {
        vCallback.apply(oThis, aArgs);
    } : vCallback, nDelay);
};

// RequireJS configuration
require.config({
    baseUrl: "lib",
    shim: {
        createjs : {
            exports: "createjs"
        }
    },
    paths: {
        createjs: "createjs",
        jumpy: "jumpy"
    }
});

// Start main application
define([
    "jumpy/MainApplication"
], function(MainApplication) {
    new MainApplication();
});