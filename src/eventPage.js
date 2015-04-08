var extension,
    coinbase;

(function() {
    'use strict';
    
    coinbase = new coinbaseClient(chrome);
    
    extension = new chromeBtcContrib(chrome, coinbase);
    extension.initialize();
}) ();
