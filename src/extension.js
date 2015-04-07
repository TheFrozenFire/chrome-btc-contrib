var chromeBtcContrib;

(function() {
    'use strict';
    
    chromeBtcContrib = function(chrome, config) {
        this.chrome = chrome;
        
        if(config !== undefined) {
            this.config = config;
        }
    };
    var proto = chromeBtcContrib.prototype;
    
    proto.chrome = null;
    proto.oauth = null;
    
    proto.config = {
        coinbase: {
            access_token_url: '',
            authorize_url: '',
            client_id: '',
            client_secret: '',
            redirect_url: '',
            scope: []
        }
    };
    
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
            if(response && response.length > 0) {
                callback(true);
            } else {
                callback(false);
            }
        });
    };
    
    proto.enableOnTab = function(tabId) {
        var self = this;
        
        this.retrieveCoinbaseToken(function(token) {
            self.chrome.pageAction.show(tabId);
        });
    };
    
    proto.disableOnTab = function(tabId) {
        this.chrome.pageAction.hide(tabId);
    };
    
    proto.retrieveCoinbaseToken = function(callback) {
        var self = this;
    
        this.chrome.storage.sync.get({
            coinbase_auth_token: null,
            coinbase_refresh_token: null 
        }, function(data) {
            if(data.coinbase_auth_token !== null) {
                callback(data.coinbase_auth_token);
            } else if(data.coinbase_refresh_token !== null) {
                self.obtainCoinbaseToken(data.coinbase_refresh_token, 'refresh_token', callback, function() {
                    self.runOAuth(callback);
                });
            } else {
                self.runOAuth(callback);
            }
        });
    };
    
    proto.storeCoinbaseToken = function(access_token, refresh_token) {
        this.chrome.storage.sync.set({
            coinbase_auth_token: access_token,
            coinbase_refresh_token: refresh_token
        });
    };
    
    proto.deleteCoinbaseToken = function() {
        this.chrome.storage.sync.remove(['coinbase_auth_token', 'coinbase_refresh_token']);
    };
    
    proto.runOAuth = function(callback, fallback) {
        var self = this;
        var auth_params = [
            'response_type=code',
            'client_id=' + this.config.coinbase.client_id,
            'redirect_uri=' + this.config.coinbase.redirect_url,
            'scope=' + this.config.coinbase.scope.join('+'),
            'meta[send_limit_amount]=100',
            'meta[send_limit_currency]=USD'
        ];
    
        this.chrome.identity.launchWebAuthFlow(
            {
                url: this.config.coinbase.authorize_url + '?' + auth_params.join('&'),
                interactive: true,
            },
            function(redirect_url) {
                var code = self.parseParamFromURL(redirect_url, 'code');
                
                self.obtainCoinbaseToken(code, 'authorization_code', function(access_token) {
                    callback(access_token);
                }, fallback);
            }
        );
    };
    
    proto.obtainCoinbaseToken = function(code, type, callback, fallback) {
        var self = this;
        var req = new XMLHttpRequest(),
            request_url = this.config.coinbase.access_token_url,
            request_params;
        
        request_params = [
            'grant_type=' + type,
            'code=' + code,
            'redirect_uri=' + this.config.coinbase.redirect_url,
            'client_id=' + this.config.coinbase.client_id,
            'client_secret=' + this.config.coinbase.client_secret
        ];
        
        request_url += '?' + request_params.join('&');
        
        req.open('POST', request_url, true);
        req.onreadystatechange = function() {
            if(req.readyState == 4) {
                var response = JSON.parse(req.responseText);
                
                if(response.access_token === undefined && fallback !== undefined) {
                    fallback();
                }
                
                self.storeCoinbaseToken(response.access_token, response.refresh_token);
                
                callback(response.access_token);
            }
        };
        req.send();
    };
    
    proto.parseParamFromURL = function(url, param) {
        var parser = document.createElement('a'),
            searchObject = {},
            queries, split, i;
        // Let the browser do the work
        parser.href = url;
        // Convert query string to object
        queries = parser.search.replace(/^\?/, '').split('&');
        for( i = 0; i < queries.length; i++ ) {
            split = queries[i].split('=');
            searchObject[split[0]] = split[1];
        }
        
        return searchObject[param];
    };
}) ();
