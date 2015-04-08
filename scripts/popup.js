document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({
        sender: 'popup',
        method: 'account'
    }, {}, function(response) {
        document.getElementById('user-info').innerHTML = JSON.stringify(response.user);
    });
    
    document.getElementById('send-monies').onclick = function() {
        var self = this;
    
        this.setAttribute('disabled', 'true');
    
        chrome.runtime.sendMessage({
            sender: 'popup',
            method: 'send-monies'
        }, {}, function(response) {
            self.setAttribute('disabled', 'false');
            console.log(response);
            if(response.success !== undefined && response.success) {
            }
        });
    };
});
