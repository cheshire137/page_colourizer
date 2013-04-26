var page_colourizer = {
  random_palette_url: 'http://www.colourlovers.com/api/palettes/random',

  load_random_palette: function(callback) {
    var req = new XMLHttpRequest();
    req.open("GET", this.random_palette_url, true);
    req.onload = function(e) {
      this.get_palette_data(e, callback);
    }.bind(this);
    req.send(null);
  },

  get_palette_data: function(e, callback) {
    var xml = e.target.responseXML;
    var hex_nodes = xml.querySelectorAll('hex');
    var title = xml.querySelector('title').textContent;
    var hex_codes = [];
    for (var i=0; i<hex_nodes.length; i++) {
      hex_codes[i] = '#' + hex_nodes[i].textContent;
    }
    callback({hex_codes: hex_codes, title: title});
  }
};

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.greeting == "load_random_palette") {
    page_colourizer.load_random_palette(function(palette_data) {
      sendResponse(palette_data);
      var hex_codes = palette_data.hex_codes;
      $('body').css('background-color', hex_codes[0], 'important');
      $('body, p, li, span, th, td, table, caption, legend').css('color', hex_codes[1], 'important');
      $('a').css('color', hex_codes[2], 'important');
    });
  } else {
    sendResponse({});
  }
});
