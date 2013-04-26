var page_colourizer = {
  random_palette_url: 'http://www.colourlovers.com/api/palettes/random',

  load_random_palette: function(callback) {
    var req = new XMLHttpRequest();
    req.open("GET", this.random_palette_url, true);
    req.onload = function(e) {
      this.get_hex_codes(e, callback);
    }.bind(this);
    req.send(null);
  },

  get_hex_codes: function(e, callback) {
    var hex_nodes = e.target.responseXML.querySelectorAll('hex');
    var hex_codes = [];
    for (var i=0; i<hex_nodes.length; i++) {
      hex_codes[i] = '#' + hex_nodes[i].textContent;
    }
    console.log(hex_codes);
    callback(hex_codes);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  page_colourizer.load_random_palette(function(hex_codes) {
    for (var i = 0; i < hex_codes.length; i++) {
      var div = document.createElement('div');
      div.style.backgroundColor = hex_codes[i];
      div.className = 'color-box';
      document.body.appendChild(div);
    }
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendRequest(tab.id, {greeting: "hello"}, function(response) {
        alert(response.farewell);
      });
    });
  });
//   chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
//    if (request.action == "getDOM")
//      sendResponse({dom: document.body.innerHTML});
//    else
//      sendResponse({}); // Send nothing..
//   });
});

// chrome.tabs.getSelected(null, function (tab) {
//   chrome.tabs.sendRequest(tab.id, { action: "getDOM" }, function (response) {
//     alert(response.dom);
//   });
// });
