/*global require */
/**
 * InsomniacByChoice Broadcast Server
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var Insomniacbychoice   = Insomniacbychoice || {},
    gravatar            = require('gravatar'),
    MongoClient         = require('mongodb').MongoClient,
    format              = require('util').format;

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`

    Insomniacbychoice.broadcastServer = function (config) {

        var self = this;

        this.io                 = require('socket.io');
        this.mongoDatabase      = 'ibcBroadcast';
        this.broadcaster        = null;
        this.channelID          = null;
        this.channelName        = 'Untitled Channel';
        this.administrators     = [];
        this.moderators         = [];
        this.viewers            = [];
        this.limbo              = [];
        this.gravatarConfig     = {
            s: '72',    // Size
            r: 'pg',    // Rating (g, pg, r, x)
            d: '404'    // Default for none
        };

        config = config || {};

        this.config = {
            port : config.port || '8890'
        };

        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {

            /***!Initialize the server
             * Create the base tokens and setup the broadcast server.
             */
            initialize :
                function () {

                    self.io.listen(self.config.port);

                    // Basic connection events
                    self.io.on('connection', self.newConnection);
                    self.io.on('disconnect', self.dropConnection);

                    // All assigning and revoking processes will require administrative level access to perform actions
                    self.io.on('assignModerator', self.assignModerator);
                    self.io.on('assignbroadcaster', self.assignBroadcaster);
                    self.io.on('assignAdministrator', self.assignAdministrator);
                    self.io.on('revokeModerator', self.revokeModerator);

                },

            /***!Initiate a new connection when a viewer connects
             * Create a unique handshake for the viewer.
             *  @param  (socket)  Socket connection of the new viewer
             */
            newConnection :
                function (socketConnection) {
                    self.limbo[socketConnection.id] = socketConnection;
                    socketConnection.emit('handshake', {greeting: 'Hello!'});

                    // User related events
                    socketConnection.on('loginAttempt', function (potentialViewer) {

                         /***********************************************************
                         * Should be using Socket.IO’s native authorization method  *
                         * https://github.com/LearnBoost/socket.io/wiki/Authorizing *
                         ************************************************************/

                        // Ensure that the appropriate values are set for the potential user
                        if (typeof potentialViewer !== 'object' || !potentialViewer.email || !potentialViewer.password) {
                            socketConnection.emit('error', {message: 'Invalid login format. Object is required with “email” and “password” keys.'});
                        }

                        // Check the credentials of the user via the email and password
                        self.validateUserCredentials(potentialViewer, socketConnection);

                    });

                    socketConnection.on('registrationAttempt', self.processRegistration);
                    socketConnection.on('updateViewerProfile', self.updateViewerProfile);
                },

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
                function (potentialRegistrant) {},

            validateUserCredentials :
                function (potentialViewer, socketConnection) {

                    MongoClient.connect('mongodb://127.0.0.1:27017/' + self.mongoDatabase, function (err, db) {

                        if (err) {
                            throw err;
                        }

                        var collection = db.collection('registered_members');

                        collection.find({ email : potentialViewer.email, password : potentialViewer.password }, function (err, items) {

                            if (err) {
                                throw err;
                            }

                            // If the user is invalid, emit the appropriate error
                            if (!items || items.length === 0) {
                                socketConnection.emit('error', {message: 'Invalid login format. Object is required with “email” and “password” keys.'});

                                // Otherwise, process the user
                            } else {

                                self.processLogin(potentialViewer, socketConnection);

                            }
                        });

                    });

                },

            /***!Process a viewer login
             * Check the user to the database and login the user
             *   @param (obj)    potentialUser
             */
            processLogin :
                function (validUser, socketConnection) {

                    // Delete the limbo item
                    delete self.limbo[socketConnection.id];

                    // Create the viewer item
                    self.viewers[socketConnection.id] = socketConnection;

                    if (validUser.alias) {
                        /****************************
                         * Broadcast new viewer bio *
                         ****************************/

                        self.io.broadcast.emit('newViewer', {
                            alias       : validUser.alias,
                            given_name  : (validUser.allowName) ? validUser.given_name : null,
                            family_name : (validUser.allowName) ? validUser.family_name : null,
                            gravatar    : self.captureGravatar(validUser.email)
                        });

                    } else {

                        socketConnection.emit('requestAlias', {message : 'What shall we call you?'});

                    }

                },

            /***!Update the viewer details
             * Update any details of the viewer just as name, twitter or password
             *   @param (obj)    viewerDetails
             */
            updateViewerProfile :
                function (viewerDetails) {},

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
                function (messageStr, from, to) {},

            captureGravatar :
                function (email) {
                    return gravatar.url(email, self.gravatarConfig);
                }

        };

        // Initialize the object
        this.initialize();

        return this;

    };

}())();