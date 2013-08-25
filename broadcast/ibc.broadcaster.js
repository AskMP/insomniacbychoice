/**
 * InsomniacByChoice Broadcaster
 *   @contributors:       „
 *       Matthew Potter c|_|
 */

// Set The global variable base
var insomniacbychoice = insomniacbychoice || {};

(function () {
    'use strict'; // Because we’re doing things right from the start ¬L¬`
    
    insomniacbychoice.broadcaster = function (config) {
        
        var self = this;
        
        config = config || {};
        
        /***!Set all the appropriate methods for the viewer*/
        this.prototype = {
            
            newViewer      : function () {},
            removeViewer   : function () {},
            banViewer      : function () {},
            send           : function () {}
            
        };
        
        return this;
        
    };

}())();