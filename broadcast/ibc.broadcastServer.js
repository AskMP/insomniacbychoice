/**
 * InsomniacByChoice Broadcast Server
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var Insomniacbychoice = Insomniacbychoice || {};

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`

    Insomniacbychoice.broadcastServer = function (config) {

        var self = this;

        config = config || {};

        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {

            /***!Initialize the server
             * Create the base tokens and setup the broadcast server.
             */
            initialize :
                function () {},

            /***!Initiate a new connection when a viewer connects
             * Create a unique handshake for the viewer.
             *  @param  (socket)  Socket connection of the new viewer
             */
            newConnection :
                function (socketConnection) {},

            /***!Drop connection
             * Action performed upon a socket dropped connection. This includes
             * cleanup and removal from the global room and chat as well as
             * sending a notification to all current viewers.
             *  @param  (socket)  Socket connection of the dropped viewer
             */
            dropConnection :
                function (socketConnection) {},

            /***!Process a new registrant
             * Performs a check of the potential registrant and adds
             * the viewer to the database upon successfully verifying.
             *   @param (obj)    potentialRegistrant
             *   @param (str)    password
             */
            processRegistration :
                function (potentialRegistrant, password) {},

            /***!Process a viewer login
             * Check the user to the database and login the user
             *   @param (str)    username
             *   @param (str)    password
             */
            processLogin :
                function (username, password) {},

            /***!Assign a moderator
             * Convert a viewer moderator level permissions
             *  @param  (str)   viewerID    The viewerID of the new moderator
             */
            assignModerator :
                function (viewerID) {},

            /***!Revoke a moderator
             * Revoke a viewer’s moderation level permissions
             *  @param  (str)   viewerID    The viewerID of the old moderator
             */
            revokeModerator :
                function (viewerID) {},

            /***!Send an action
             * Send an action to the global or to a specific viewer
             *  @param  (str)   action  The action to send
             *  @param  (obj)   vars    (optional) Any variable to send along with the action
             *  @param  (arr)   to      (optional) An array of those to receive the action
             */
            sendAction :
                function (action, vars, to) {},

            /***!Assign an administrator
             * Convert a viewer moderator level permissions
             *  @param  (str)   viewerID    The viewerID of the new moderator
             */
            assignAdministrator :
                function (viewerID) {},

            /***!Revoke an administrator
             * Revoke a viewer’s moderation level permissions
             *  @param  (str)   viewerID    The viewerID of the old moderator
             */
            assignBroadcaster :
                function (viewerID) {},

            /***!Process a chat message
             * Receive a chat message from a user to broadcast
             *  @param  (str)   messageStr  Message to transmit
             *  @param  (str)   from        The sender ID string
             */
            chatMessage :
                function (messageStr, from) {},

            /***!Process a direct message
            * Receive and process a direct message.
            *   @param  (str)   messageStr  Message to transmit
            *   @param  (str)   from        The sender ID string
            *   @param  (str)   to          The receiver ID string
            */
            directMessage :
                function (messageStr, from, to) {}

        };

        // Initialize the object
        this.initialize(config);

        return this;

    };

}())();