/**
 * InsomniacByChoice Broadcast Administrator
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var insomniacbychoice = insomniacbychoice || {};

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`
    
    ibc.broadcasterAdministrator = function (config) {
        
        var self = this;
        
        this.connection     = null;
        
        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {
            
            assignModerator : function (viewerID) {},
            revokeModerator : function (viewerID) {}

        };
        
        return this;
        
    };

}())();