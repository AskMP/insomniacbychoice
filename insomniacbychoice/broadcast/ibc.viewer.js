/**
 * InsomniacByChoice Broadcast Viewer
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var Insomniacbychoice = Insomniacbychoice || {};

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`

    Insomniacbychoice.viewer = function () {

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

    	this. initialize = function () {
        		
        		self.connection = io.connect('http://broadcast.htmltoronto.ca:8890');
        		
        		self.connection.on('handshake', self.loginUser('matthew@htmltoronto.ca', ''));
        		
    		},
    	
        /***!Register a new user with the server
         * Send a registration to the server for current and future broadcasts.
         * Once the user is verified as new, the user will be automatically logged in.
         *
         *   @param  (obj) profileData   Profile data of the user, must contain email and alias
         *   @param  (str) password      The password to assign to the email address login
         */
        this.registerUser = function (profileData, password) {},

        /***!Process the registration response
         * Process the response form the server when sending a registration requst.
         *
         *   @param  (obj) response      The server response regarding the registrant
         */
        this.processRegistration = function (response) {},

        /***!Create a local storage session
         * In case of a browser crash, refresh required or another day, store the user
         * profile data within local storage for convenience.
         */
        this.setLocalUser = function () {},

        /***!Check for local storage session
         * If there is an existing local storage session, use that to initiate
         * the primary login credentials for the user so they simply need to
         * put in a password.
         */
        this.getLocalUser = function () {},

        /***!Login to the server
         * Peform the server login using the email and password.
         *   @param  (str)   email       The email / username of the viewer
         *   @param  (str)   password    The password of the viewer
         */
        this.loginUser = function (email, password) {
                self.connection.emit('loginAttempt', {email: email, password: password, alias: 'HTMLTO'});
                self.connection.on('loginError', function(message){
	                alert(message.message);
                });
            },

        /***!Connect to the broadcast server location
         * Initialize the server connection and begin authorization.
         */
        this.connect = function () {},

        /***!Disconnect from the broadcast server
         * Likely not going to be used often.
         */
        this.disconnect = function () {},

        /***!Receive a global chat message
         * Receive a chat message from another viewer, administrator or broadcaster.
         *   @param  (obj)   message    The message details from the server
         */
        this.receiveChat = function (message) {},

        /***!Send a global chat message
         * Send a chat message to the global room.
         *   @param  (str)   message     The message to send to the global chat
         */
        this.sendChat = function (messageString) {},

        /***!Receive a direct chat message
         * Receive a direct message from another viewer, administrator or broadcaster.
         *   @param  (obj)   message    The message details from the server
         */
        this.receiveMessage = function (message) {},

        /***!Send a direct message
         * Send a chat message to the global room.
         *   @param  (str)   toViewer    The alias of the member to send a message to
         *   @param  (str)   message     The message to send to the global chat
         */
        this.sendMessage = function (toViewer, messageString) {},

        /***!Ban a particular viewer
         * Ban a particular user from chat or any direct messages.
         * NOTES:
         * - Moderator new bans apply globally
         * - Banning of administrators or broadcasters are ignored
         *   @param  (str)   viewer      ID string or alias of the viewer to ban
         */
        this.banViewer = function (viewer) {},

        /***!Remove message
         * Redact a particular message.
         *   @param  (str)   messageID   ID string of the message to remove
         */
        this.removeMessage = function (messageID) {},

        /***!Append New Viewer
         * Append new viewer to the existing viewer list.
         *   @param (obj)    viewer      Thew viewer basic details to add
         */
        this.addViewer = function (viewer) {},

        /***!Remove Viewer
         * Remove viewer from the existing viewer list.
         *   @param (str)    viewer      The viewer ID of alias to remove
         */
        this.removeViewer = function (viewer) {},

        /***!Receive Stream
         * Receive a stream from the broadcaster
         *   @param (obj)    stream      Stream data (TBD)
         */
        this.receiveStream = function (stream) {}
        
        this.initialize();

        return this;

    };

}());