document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(tab.id, {greeting: "load_random_palette"}, function(palette_data) {
      var hex_codes = palette_data.hex_codes;
      var h1 = document.createElement('h1');
      h1.appendChild(document.createTextNode(palette_data.title));
      document.body.appendChild(h1);
      for (var i = 0; i < hex_codes.length; i++) {
        var div = document.createElement('div');
        div.style.backgroundColor = hex_codes[i];
        div.className = 'color-box';
        document.body.appendChild(div);
      }
    });
  });
});
