/**
 * InsomniacByChoice Broadcast Viewer
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var insomniacbychoice = insomniacbychoice || {};

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`
    
    insomniacbychoice.viewer = function () {
        
        var self = this;
        
        this.connection     = null; // The server socket connection
        this.bannedViewers  = [];   // Array of banned userIDs
        this.preferences    = {     // Preferences to save to the session
            allowDM : false
        };
        this.viewerID       = null;
        this.profile        = {
            given_name  : null, // Optional
            family_name : null, // Optional
            twitter     : null, // Optional
            email       : null, // Required
            alias       : null  // Required
        };
        
        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {
        
            /***!Register a new user with the server
             * Send a registration to the server for current and future broadcasts.
             * Once the user is verified as new, the user will be automatically logged in.
             *
             *   @param  (obj) profileData   Profile data of the user, must contain email and alias
             *   @param  (str) password      The password to assign to the email address login
             */
            registerUser :
                function (profileData, password) {},
            
            /***!Process the registration response
             * Process the response form the server when sending a registration requst.
             *
             *   @param  (obj) response      The server response regarding the registrant
             */
            processRegistration :
                function (response) {},
            
            /***!Create a local storage session
             * In case of a browser crash, refresh required or another day, store the user
             * profile data within local storage for convenience.
             */
            setLocalUser :
                function () {},
            
            /***!Check for local storage session
             * If there is an existing local storage session, use that to initiate
             * the primary login credentials for the user so they simply need to 
             * put in a password.
             */
            getLocalUser :
                function () {},
            
            /***!Login to the server
             * Peform the server login using the email and password.
             *   @param  (str)   email       The email / username of the viewer
             *   @param  (str)   password    The password of the viewer
             */
            loginUser :
                function (email, password) {},
            
            /***!Connect to the broadcast server location
             * Initialize the server connection and begin authorization.
             */
            connect :
                function () {},
            
            /***!Disconnect from the broadcast server
             * Likely not going to be used often.
             */
            disconnect :
                function () {},
            
            /***!Receive a global chat message
             * Receive a chat message from another viewer, administrator or broadcaster.
             *   @param  (obj)   message    The message details from the server
             */
            receiveChat :
                function (message) {},
            
            /***!Send a global chat message
             * Send a chat message to the global room.
             *   @param  (str)   message     The message to send to the global chat
             */
            sendChat :
                function (messageString) {},
            
            /***!Receive a direct chat message
             * Receive a direct message from another viewer, administrator or broadcaster.
             *   @param  (obj)   message    The message details from the server
             */
            receiveMessage :
                function (message) {},
            
            /***!Send a direct message
             * Send a chat message to the global room.
             *   @param  (str)   toViewer    The alias of the member to send a message to
             *   @param  (str)   message     The message to send to the global chat
             */
            sendMessage :
                function (toViewer, messageString) {},
            
            /***!Ban a particular viewer
             * Ban a particular user from chat or any direct messages.
             * NOTES:
             * - Moderator new bans apply globally
             * - Banning of administrators or broadcasters are ignored
             *   @param  (str)   viewer      ID string or alias of the viewer to ban
             */
            banViewer :
                function (viewer) {},
            
            /***!Remove message
             * Redact a particular message.
             *   @param  (str)   messageID   ID string of the message to remove
             */
            removeMessage :
                function (messageID) {},
            
            /***!Append New Viewer
             * Append new viewer to the existing viewer list.
             *   @param (obj)    viewer      Thew viewer basic details to add
             */
            addViewer :
                function (viewer) {},
            
            /***!Remove Viewer
             * Remove viewer from the existing viewer list.
             *   @param (str)    viewer      The viewer ID of alias to remove
             */
            removeViewer :
                function (viewer) {},
            
            /***!Receive Stream
             * Receive a stream from the broadcaster
             *   @param (obj)    stream      Stream data (TBD)
             */
            receiveStream :
                function (stream) {}
            
        };
        
        return this;
        
    };

}())();