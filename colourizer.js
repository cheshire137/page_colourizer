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
    var url = xml.querySelector('url').textContent;
    var image_url = xml.querySelector('imageUrl').textContent;
    var user_name = xml.querySelector('userName').textContent;
    var hex_codes = [];
    for (var i=0; i<hex_nodes.length; i++) {
      hex_codes[i] = '#' + hex_nodes[i].textContent;
    }
    callback({hex_codes: hex_codes, title: title, url: url, image_url: image_url,
              user_name: user_name});
  },

  has_background_color: function(background) {
    if (background.substring(0, 4) == 'rgb(') {
      return true;
    }
    return background.substring(0, 5) == 'rgba(' &&
           background.substring(background.length - 3) != ' 0)';
  },

  get_background_elements: function() {
    var bg_hash = {};
    var me = this;
    $('*').each(function() {
      var el = $(this);
      var background = el.css('background-color');
      if (me.has_background_color(background)) {
        if (bg_hash.hasOwnProperty(background)) {
          bg_hash[background] = bg_hash[background].concat([el]);
        } else {
          bg_hash[background] = [el];
        }
      }
    });
    return bg_hash;
  },

  get_random_color: function(hex_codes) {
    var index = Math.floor(Math.random() * hex_codes.length);
    return hex_codes[index];
  },

  split_rgb_code: function(rgb_code) {
    var parts = rgb_code.split(', ');
    var r = parseInt(parts[0].split('(')[1], 10);
    var g = parseInt(parts[1], 10);
    var b = parseInt(parts[2].split(')')[0], 10);
    return [r, g, b];
  },

  constrain_rgb: function(piece) {
    piece = piece > 255 ? 255 : piece;
    piece = piece < 0 ? 0 : piece;
    return Math.round(piece);
  },

  scale_color: function(rgb_code, scale) {
    var split_code = this.split_rgb_code(rgb_code);
    var r = split_code[0], g = split_code[1], b = split_code[2];
    r += (255 * scale) * (r / (r + g + b));
    r = this.constrain_rgb(r);
    g += (255 * scale) * (g / (r + g + b));
    g = this.constrain_rgb(g);
    b += (255 * scale) * (b / (r + g + b));
    b = this.constrain_rgb(b);
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  },

  colourize_page: function(palette_data) {
    var hex_codes = palette_data.hex_codes;
    var bg_hash = this.get_background_elements();
    for (var orig_color in bg_hash) {
      var new_color = this.get_random_color(hex_codes);
      var elements = bg_hash[orig_color];
      for (var i=0; i<elements.length; i++) {
        var selector = $(elements[i]);
        selector.css('background-color', new_color, 'important');
        var rgb_bg = selector.css('background-color');
        selector.css('color', this.scale_color(rgb_bg, 0.5), 'important');
      }
    }
  }
};

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.greeting == "load_random_palette") {
    page_colourizer.load_random_palette(function(palette_data) {
      sendResponse(palette_data);
      page_colourizer.colourize_page(palette_data);
    });
  } else {
    sendResponse({});
  }
});
