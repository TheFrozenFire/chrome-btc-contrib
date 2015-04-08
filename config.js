coinbase.config.api_url = 'https://api.coinbase.com/v1';
coinbase.config.client_id = '9c73ed3d7a9ecc729c386fd41454950d193e1a5f6b32691f4f8b01e94a0f8e99';
coinbase.config.client_secret = 'dc87ad190bd9f1e2440d3aa1c4f5e167914257b2d9ef2ba98758ac28f04ff29a';
coinbase.config.authorize_url = 'https://www.coinbase.com/oauth/authorize';
coinbase.config.access_token_url = 'https://www.coinbase.com/oauth/token';
coinbase.config.redirect_url = 'https://' + chrome.runtime.id + '.chromiumapp.org/coinbase';
coinbase.config.scope = [
    'user',
    'balance',
    'send'
];
