/*global window, SpeechSynthesisUtterance, setInterval, clearInterval, console */
/**
 * InsomniacByChoice Voice Recognition
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var Insomniacbychoice = Insomniacbychoice || {};

// Check for the voice recognition capabilities
var SpeechRecognition = window.webkitSpeechRecognition || false;

// Check for the speech recognition capabilities
var speechSynthesis = window.speechSynthesis || false;

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`

    Insomniacbychoice.voicerecognition = function () {

        var self = this;

        this.ears               = null;
        this.voice              = null;
        this.listening          = false;
        this.currentlyListening = false;
        this.hearingAid         = null;
        this.pausedListening    = false;
        this.canListen          = false;
        this.canSpeak           = false;
        this.utterance          = null;
        this.domElements        = {
            recognizedPhrase: false,
            responseMessage : false,
            statusIndicator    : false
        };
        this.availableCommands  = [];
        this.context            = {
            lastCommand     : null,
            commandType     : null,
            commandResult   : null
        };

        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {

            // Setup the speech recognition server and check if the browser can speak
            initialize : function () {

                // Only activate listening if it is available
                if (SpeechRecognition) {

                    // Use the current global variable so as to add for more browsers easily later
                    self.ears = new SpeechRecognition();

                    // Confirm that the browser can hear and parse speech
                    self.canListen = true;

                    // Assign the speech callbacks to the appropriate equivalents
                    self.ears.onstart   = self.onStartListening;
                    self.ears.onend     = self.onEndListening;
                    self.ears.onerror   = self.onErrorListening;
                    self.ears.onresult  = self.onListenResult;

                }

                // Only activate speech sythesis if it is available
                if (speechSynthesis) {

                    // Use the current global variable so as to add for more browsers easily
                    self.voice = speechSynthesis;

                    // Confirm that the browser can speak
                    self.canSpeak = true;

                }

            },

            // Commence listening and setup the interval check
            beginListening : function () {

                // Confirm that the ears should be listening
                self.listening = true;

                // Setup  a check to see if the ears are listening
                self.hearingAid = setInterval(self.validateListening, 250);

            },

            // End listening and clear the interval check
            stopListening : function () {

                // Confirm that the browser shouldn't be listening
                self.listening = false;

                // Clear the interval
                clearInterval(self.hearingAid);

                // Stop listening
                self.ears.stop();

            },

            // Voice recognition does not always remain on, this checks to ensure that it should be but isn't, that it re-enables
            validateListening : function () {

                // Check to see if the ears are currently listening as well as SHOULD be
                if (self.listening === true && self.currentlyListening === false) {

                    // Ignore activating if listening is currently paused
                    if (self.pausedListening !== true) {

                        // Activate the ears
                        self.ears.start();

                    }

                }

            },

            // Start listing callback
            onStartListening : function () {

                // Confirm that the browser is currently listening
                self.currentlyListening = true;

                // If a status indicator exists, append an active class
                if (self.domElements.statusIndicator) {
                    Insomniacbychoice.addClass(self.domElements.statusIndicator, 'active');
                }

            },

            // End listening callback
            onEndListening : function () {

                // Confirm that the browser is currently not listening
                self.currentlyListening = false;

                // If a status indicator exists, delete the active class
                if (self.domElements.statusIndicator) {
                    Insomniacbychoice.removeClass(self.domElements.statusIndicator, 'active');
                }

            },

            // Start speech callback
            onUtteranceStart : function () {

                // Pause the listening
                self.pausedListening = true;

                // Stop listing momentarily
                self.ears.stop();
            },

            // End speech callback
            onUtteranceEnd : function () {

                // Unpause listening
                self.pauseListening = false;

                // Reset the utterance variable
                self.utterance = null;

            },

            // Error listening or getting response
            onErrorListening : function (errorMessage) {
                // Need to populate with error switch case
                if (errorMessage) {

                    //Perform an action here
                    console.log(errorMessage);

                }

            },

            // Recognized literation callback
            onListenResult : function (response) {

                // Variable for looping through result possibilities
                var i;

                // Loop through the results until the final one is found
                for (i = response.resultIndex; i < response.results.length; i + 1) {

                    // Process onl the final recognized text
                    if (response.results[i].isFinal) {
                        self.parseLiteration(response.results[i][0].transcript);
                    }
                }
            },

            // Perform the parsing of the literation
            parseLiteration : function (literation) {

                // Set the variables required for parsing
                var foundCommand = false,
                    matchingCommand,
                    c;

                // Loop through the available commands to see if they match
                for (c = 0; c < self.availableCommands.length; c = c + 1) {

                    // Check if the current command matches
                    matchingCommand = self.availableCommands[c].isCommand(literation);

                    // Perform a check whether to continue passing through other commands
                    if (matchingCommand) {

                        // Confirm that a command was found
                        foundCommand = true;

                        // Unless the command specifically states to continue, halt processing
                        if (matchingCommand.passThru !== true) {
                            break;
                        }

                    }

                }

                // Update the UI for the recognized command
                if (foundCommand === false) {
                    self.updateResponseDOM('');
                } else {
                    self.updateResponseDOM(literation);
                }
            },

            // Enter HTML messages into the DOM element of what was heard
            updateResponseDOM : function (htmlMessage) {

                // Only enter the content if the dom element exists
                if (self.domElements.recognizedPhrase) {
                    self.domElements.recognizedPhrase.innerHTML(htmlMessage);
                }

            },

            // Enter an HTML message into the response DOM element
            textResponse : function (messageString) {

                // Only enter the content if the dom element exists
                if (self.domElements.responseMessage) {
                    self.domElements.responseMessage.innerHTML(messageString);
                }

            },

            // Perform a vocal response if requested
            vocalResponse : function (literation) {

                // If the browser doesn't have the ability to speak, simply return
                if (self.canSpeak !== true) {
                    return;
                }

                // Setup the voice synthesis utterance object
                self.utterance = new SpeechSynthesisUtterance();

                // Update the utterance with the appropriate settings
                self.utterance.text = literation;
                self.utterance.lang = 'en-US';

                // Add callbacks to the utterance
                self.utterance.onstart = self.onUtteranceStart;
                self.utterance.onend = self.onUtteranceEnd;

                // Begin speaking
                self.voice.speak(self.utterance);

            }

        };

        // Perform the initialization
        this.initialize();

        return this;

    };

    Insomniacbychoice.voicerecognition = new Insomniacbychoice.voicerecognition();

}())();