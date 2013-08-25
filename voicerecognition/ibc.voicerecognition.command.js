/*global document */
/**
 * InsomniacByChoice Base Object
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var	Insomniacbychoice = Insomniacbychoice || {};

(function () {
	"use strict"; // Because we’re doing things right from the start ¬L¬`

    Insomniacbychoice.voicerecognition.Command = function (regExpString, callback) {

        var self = this, i;

        this.strGREP = [];
        this.successfulCallback = callback || function () {};

        this.prototype = {

            // Check to match the regular expression list and return a matching one
            checkRegularExpression : function (potentialCommand) {

                var i;

                // Compare to all expressions even if there is only 1
                for (i = 0; i < this.strGREP.length; i = i + 1) {
                    if (self.strGREP[i].test(potentialCommand)) {
                        return self.strGREP[i];
                    }
                }

                // No expressions matched so return false
                return false;

            },

            // Externally called function to compare requested command from
            isCurrent : function (potentialCommand) {

                // Check to see if there is a regular expression that matches
                var matchingRegExp = self.checkRegularExpression(potentialCommand);

                // If no regular expression matches, simply return false
                if (!matchingRegExp) {
                    return false;
                }

                // If there is a matching regular expression, return the result
                return self.successfulCallback(potentialCommand, matchingRegExp);

            }
        };

        // Upon loading the new command, add any string regular expressions to the list
        if (typeof regExpString === 'string') {
            self.strGREP.push(new RegExp(regExpString, 'gi'));
        }

        // If the regular expression supplied was an array, add each one
        if (typeof regExpString === 'object') {

            // Regular expression values come up as objects, this creates an array of it
            if (!regExpString.length) {
                self.strGREP = [regExpString];
            }

            // Loop for all passed expressions
            for (i = 0; i < regExpString.length; i = i + 1) {
                self.strGREP.push(regExpString[i]);
            }
        }

        return this;

    };

    /***!Sample command
     * Sample command sent to add as a demonstration
     */
    Insomniacbychoice.voicerecognition.availableCommands.push(new Insomniacbychoice.voiceregocnition.Command(
        [/(thank\syou|thanks|you\srock)/],
        function (commandString, matchingGREP) {

            // Respond with an appropriate response
            Insomniacbychoice.voicerecognition.textResponse("You're Welcome");

            // I know, it's not the correct variation of your, but it give a better vocal response
            Insomniacbychoice.voicerecognition.vocalResponse("your welcome");

            /***
             * Generally, you would add context for the next command here
             * but because gratitude is out of context, it is ignored here

                // Example context update
                insomniacbychoice.voicerecognition.context    = {
                    lastCommand	    : commandString,
                    commandType		: 'gratitude',
                    commandResult	: null
                };

             */

            // No need to continue to the next command after saying thank you
            return {
                passThru : false
            };
        }
    ));

}())();