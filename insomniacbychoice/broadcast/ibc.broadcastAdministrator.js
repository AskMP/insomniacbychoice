/*global io */
/**
 * InsomniacByChoice Broadcast Administrator
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var Insomniacbychoice = Insomniacbychoice || {};

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`

    Insomniacbychoice.broadcasterAdministrator = function (config) {

        var self = this;

        this.serverURL      = config.serverURL || '';

        this.connection     = io.connect(this.serverURL);
        this.broadcaster    = null;
        this.channelID      = null;
        this.moderators     = [];
        this.viewers        = [];

        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {

            initialize :
                function () {},

            assignModerator :
                function (viewerID) {
                    self.connection.emit('assignModerator', {viewerID: viewerID});
                },

            revokeModerator :
                function (viewerID) {
                    self.connection.emit('revokeModerator', {viewerID: viewerID});
                }

        };

        return this;

    };

}())();