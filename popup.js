document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(tab.id, {greeting: "load_random_palette"}, function(response) {
      var hex_codes = response.hex_codes;
      for (var i = 0; i < hex_codes.length; i++) {
        var div = document.createElement('div');
        div.style.backgroundColor = hex_codes[i];
        div.className = 'color-box';
        document.body.appendChild(div);
      }
    });
  });
});
