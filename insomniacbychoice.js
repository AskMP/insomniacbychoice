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

	Insomniacbychoice = function () {

		var self = this;

		/***!Set all the appropriate methods for the viewer*/
        this.prototype = {

            $ : function (domElement) {

                // Check to see if the request is using a selector or DOM element
				if (typeof domElement === 'string') {

                    // Perform the appropriate action dependant upon the initial character
					switch (domElement.substring(0, 1)) {

                    // Use the class name selector instead of the query selector to get all dom elements of the class
					case '.':
						domElement = document.getElementsByClassName(domElement);
				        break;

                    // ID selectors are fairly straight forward
					case '#':
						domElement = document.getElementById(domElement.substring(1));
                        break;

                    // For all other requests, perform the new querySelector method which allows for an extensive ability
                    default:
                        domElement = document.querySelector(domElement);
					}

				}


                if (domElement && !domElement.length) {
                    domElement = [domElement];
                } else if (!domElement) {
                    domElement = [];
                }

                return domElement;
            },

            /***!Add Class to DOM element
             * Append a class to a dom element or dom elements
             * NOTES:
             * - Method uses modern dom selection and manipulation so it will not function in >IE10
             *  @param  (mixed) domElement  The dom element or selector to add the class to
             *  @param  (str)   className   The class to append to the element(s)
             *  @param  (fn)    callback    (Optional) Callback function to run upon completion
             */
			addClass : function (domElement, className, callback) {

                // Set for looping through the requested dom elements
                var i;

                // Capture the DOM element(s) as an array for processing
                domElement = self.$(domElement);

                // Loop through the requested dom elements
                for (i = 0; i < domElement.length; i = i + 1) {

                    // Using the modern DOM manipulation, check to see if the element contains the class already
                    if (!domElement[i].classList.contains(className)) {

                        // Add the class if it doesn’t already exist
                        domElement[i].classList.add(className);

                    }
                }

                // Perform a callback if supplied
                if (callback) {
                    callback();
                }

			},

            /***!Remove Class to DOM element
             * Remove a class to a dom element or dom elements
             * NOTES:
             * - Method uses modern dom selection and manipulation so it will not function in >IE10
             *  @param  (mixed) domElement  The dom element or selector to add the class to
             *  @param  (str)   className   The class to append to the element(s)
             *  @param  (fn)    callback    (Optional) Callback function to run upon completion
             */
            removeClass : function (domElement, className, callback) {
                var i;

                // Capture the DOM element(s) as an array for processing
                domElement = self.$(domElement);

                // Loop through the requested dom elements
                for (i = 0; i < domElement.length; i = i + 1) {

                    // Using the modern DOM manipulation, check to see if the element contains the class
                    if (domElement[i].classList.contains(className)) {

                        // Remove the class if it exists already
                        domElement[i].classList.remove(className);

                    }

                }

                // Perform a callback if supplied
                if (callback) {
                    callback();
                }
            },

            /***!HTTP Request for callbacks
            * Most API requests allow for a callback function within their URI,
            * this pulls the request and performs that function. Useful for many
            * calls and external calls. This should however be converted into a
            * request to the local server to perform the call for the user so as
            * to ensure that all requests contain an appropriate callback
            * function. This would also mean that the request could change to an
            * xmlHTTP request instead of a DOM loading function (which is used
            * to allow for cross site scripting).
            *   @param  (str)   url         The URL to request
            *   @param  (fn)    onSuccess   Callback function on successfully loading
            *   @param  (fn)    onError     Callback function an error
            */
            httpRequest : function (url, onSuccess, onError) {

                // Create the callback function name and dom element
                var callbackName = 'callback' + new Date().getTime(),
                    requestDom = document.createElement('script');

                // Setup a base error callback if one does not exist
                onError = onError || function () {};

                // Set the global callback function which will later be deleted
                Insomniacbychoice[callbackName] = onSuccess;

                // Add a callback for loading the script to run the callback
                requestDom.onload = function () {

                    // Remove the DOM element from the header
                    requestDom.parentNode.removeChild(requestDom);

                    // Delete the callback function
                    delete Insomniacbychoice[callbackName];

                };

                // Set the callback for erroring on loading the script
                requestDom.onerror = onError;

                // Check whether there are other URI variable or the callback is the first one
                url = (url.indexOf('?') !== -1) ? '&' : '?';

                // Append the callback function to the URL string
                requestDom.src = url += 'callback=Insomniacbychoice.' + callbackName;

                // Append the script tag to the bottom of the body
                document.getElementsByTagName('body')[0].appendChild(requestDom);

            }

		};

	};

    Insomniacbychoice = new Insomniacbychoice();

}())();