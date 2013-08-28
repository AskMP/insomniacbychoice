/**
 * InsomniacByChoice Broadcaster
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var Insomniacbychoice = Insomniacbychoice || {};

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`

    Insomniacbychoice.broadcaster = function (config) {

        var self = this;

        this.viewers        = [];
        this.administrators = [];
        this.channelID      = null;

        config = config || {};

        /***!Set all the appropriate methods for the viewer
         */
        this.prototype = {

            /***!Capture input media of the broadcaster
             * Capture the video and audio inputs of the broadcaster
             *   @param (obj)    config     Details of the capturing; video size, audio, etc…
             */
            captureUserMedia :
                function (config) {
                    config = config || {};
                },

            /***!Add a new viewer connection to the pool
             * Append new viewer to the existing viewer list.
             *   @param (obj)    viewer     Thew viewer basic details to add
             */
            newViewer :
                function (viewer) {
                    if (!viewer) {
                        return;
                    }
                },

            /***!Remove viewer connection from the pool
             * Removes the viewer ID from the list of connected peers
             *   @param (str)    viewerID   The viewer’s ID string
             */
            removeViewer :
                function (viewerID) {
                    if (!viewerID && !self.viewers[viewerID]) {
                        return;
                    }
                },

            /***!Ban a user from connecting
             * Add the viewer ID to a list of banned users
             *   @param (str)    viewerID   The viewer’s ID string
             */
            banViewer :
                function (viewerID) {
                    if (!viewerID && !self.viewers[viewerID]) {
                        return;
                    }
                },

            /***!Begin broadcasting stream
             * Initializer of the broadcast
             */
            broadcastStream :
                function () {}

        };

        return this;

    };

}())();