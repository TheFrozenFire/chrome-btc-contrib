var chromeBtcContrib;

(function() {
    'use strict';
    
    chromeBtcContrib = function(chrome) {
        this.chrome = chrome;
    };
    var proto = chromeBtcContrib.prototype;
    
    proto.chrome = null;
    
    proto.initialize = function() {
        var self = this;
        var chrome = this.chrome;
        
        chrome.webNavigation.onCompleted.addListener(function(details) {
            self.navigated(details);
        });
    };
    
    proto.navigated = function(details) {
        var self = this;
        
        this.isTabSupported(details.tabId, function(tabSupported) {
            if(tabSupported) {
                self.enableOnTab(details.tabId);
            } else {
                self.disableOnTab(details.tabId);
            }
        });
    };
    
    proto.isTabSupported = function(tabId, callback) {
        this.chrome.tabs.sendMessage(tabId, { method: 'meta', name: 'btc-address' }, {}, function(response) {
            if(response.length > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
    };
    
    proto.enableOnTab = function(tabId) {
        this.chrome.pageAction.show(tabId);
    };
    
    proto.disableOnTab = function(tabId) {
        this.chrome.pageAction.hide(tabId);
    };
}) ();
