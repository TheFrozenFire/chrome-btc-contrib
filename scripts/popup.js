document.addEventListener('DOMContentLoaded', function() {
    chrome.runtime.sendMessage({
        sender: 'popup',
        method: 'account'
    }, {}, function(response) {
        document.getElementById('user-info').innerHTML = JSON.stringify(response.user);
    });
});
