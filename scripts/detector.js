var detector;

(function() {
    'use strict';
    
    detector = function(chrome) {
        this.chrome = chrome;
    };
    var proto = detector.prototype;
    
    proto.chrome = null;
    
    proto.initialize = function() {
        var self = this;
    
        this.chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            self.messageHandler(message, sender, sendResponse);
        });
    };
    
    proto.messageHandler = function(message, sender, sendResponse) {
        switch(message.method) {
            case "meta":
                var values = this.findMetaValues(message.name);
                sendResponse(values);
                break;
            default:
                sendResponse(null);
                break;
        }
    };
    
    proto.findMetaValues = function(name) {
        var meta,
            values = [],
            i;
        
        meta = document.getElementsByTagName('meta');
        
        for(i = 0; i < meta.length; i++) {
            if(meta[i].getAttribute("name") == name) {
                values.push(meta[i].getAttribute("content"));
            }
        }
        
        return values;
    };
}) ();

(new detector(chrome)).initialize();
