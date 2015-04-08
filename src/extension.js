var chromeBtcContrib;

(function() {
    'use strict';
    
    chromeBtcContrib = function(chrome, coinbase, config) {
        this.chrome = chrome;
        this.coinbase = coinbase;
        
        if(config !== undefined) {
            this.config = config;
        }
    };
    var proto = chromeBtcContrib.prototype;
    
    proto.chrome = null;
    proto.coinbase = null;
    
    proto.config = {};
    
    proto.initialize = function() {
        var self = this;
        var chrome = this.chrome;
        
        chrome.webNavigation.onCompleted.addListener(function(details) {
            self.navigated(details);
        });
        
        chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
            switch(message.sender) {
                case 'popup':
                    self.handlePopupMessage(message, sender, sendResponse);
                    break;
            }
            
            return true;
        });
    };
    
    proto.handlePopupMessage = function(message, sender, sendResponse) {
        var self = this;
        
        switch(message.method) {
            case 'account':
                this.coinbase.get('/users/self', {}, function(response) {
                    sendResponse(response);
                });
                break;
            case 'send-monies':
                this.doInCurrentTab(function(tab) {
                    self.retrieveTabAddresses(tab.id, function(addresses) {
                        var address;
                        
                        if(!(addresses.length > 0)) {
                            sendResponse({ success: false, errors: ['No address available'] });
                            return;
                        }
                        
                        address = addresses[0];
                        
                        self.coinbase.post('/transactions/send_money', {
                            transaction: {
                                to: address,
                                amount_string: '0.05',
                                amount_currency_iso: 'USD'
                            }
                        }, function(response) {
                            sendResponse(response);
                        });
                    });
                });
                break;
        }
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
    
    proto.retrieveTabAddresses = function(tabId, callback) {
        this.chrome.tabs.sendMessage(tabId, { method: 'meta', name: 'btc-address' }, {}, callback);
    };
    
    proto.isTabSupported = function(tabId, callback) {
        this.retrieveTabAddresses(tabId, function(response) {
            if(response && response.length > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
    };
    
    proto.enableOnTab = function(tabId) {
        var self = this;
        
        this.coinbase.retrieveToken(function(token) {
            self.chrome.pageAction.show(tabId);
        });
    };
    
    proto.disableOnTab = function(tabId) {
        this.chrome.pageAction.hide(tabId);
    };
    
    proto.doInCurrentTab = function(callback) {
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function (tabArray) {
            callback(tabArray[0]);
        });
    }
}) ();
