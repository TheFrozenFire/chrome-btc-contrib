var coinbaseClient;

(function() {
    'use strict';
    
    coinbaseClient = function(chrome, config) {
        this.chrome = chrome;
    };
    var proto = coinbaseClient.prototype;
    
    proto.chrome = null;
    
    proto.config = {
        api_url: null,
        access_token_url: null,
        authorize_url: null,
        client_id: null,
        client_secret: null,
        redirect_url: null,
        scope: []
    };
    
    proto.retrieveToken = function(callback) {
        var self = this;
    
        this.chrome.storage.sync.get({
            coinbase_auth_token: null,
            coinbase_refresh_token: null 
        }, function(data) {
            if(data.coinbase_auth_token !== null) {
                callback(data.coinbase_auth_token);
            } else if(data.coinbase_refresh_token !== null) {
                self.obtainToken(data.coinbase_refresh_token, 'refresh_token', callback, function() {
                    self.runOAuth(callback);
                });
            } else {
                self.runOAuth(callback);
            }
        });
    };
    
    proto.storeToken = function(access_token, refresh_token) {
        this.chrome.storage.sync.set({
            coinbase_auth_token: access_token,
            coinbase_refresh_token: refresh_token
        });
    };
    
    proto.deleteToken = function() {
        this.chrome.storage.sync.remove(['coinbase_auth_token', 'coinbase_refresh_token']);
    };
    
    proto.runOAuth = function(callback, fallback) {
        var self = this;
        var auth_params = [
            'response_type=code',
            'client_id=' + this.config.client_id,
            'redirect_uri=' + this.config.redirect_url,
            'scope=' + this.config.scope.join('+'),
            'meta[send_limit_amount]=100',
            'meta[send_limit_currency]=USD'
        ];
    
        this.chrome.identity.launchWebAuthFlow(
            {
                url: this.config.authorize_url + '?' + auth_params.join('&'),
                interactive: true,
            },
            function(redirect_url) {
                var code = self.parseParamFromURL(redirect_url, 'code');
                
                self.obtainToken(code, 'authorization_code', function(access_token) {
                    callback(access_token);
                }, fallback);
            }
        );
    };
    
    proto.obtainToken = function(code, type, callback, fallback) {
        var self = this;
        var req = new XMLHttpRequest(),
            request_url = this.config.access_token_url,
            request_params;
        
        request_params = [
            'grant_type=' + type,
            'code=' + code,
            'redirect_uri=' + this.config.redirect_url,
            'client_id=' + this.config.client_id,
            'client_secret=' + this.config.client_secret
        ];
        
        request_url += '?' + request_params.join('&');
        
        req.open('POST', request_url, true);
        req.onreadystatechange = function() {
            if(req.readyState == 4) {
                var response = JSON.parse(req.responseText);
                
                if(response.access_token === undefined && fallback !== undefined) {
                    fallback();
                }
                
                self.storeToken(response.access_token, response.refresh_token);
                
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
