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

  has_color: function(rgb_code) {
    if (rgb_code.substring(0, 4) == 'rgb(') {
      return true;
    }
    return rgb_code.substring(0, 5) == 'rgba(' &&
           rgb_code.substring(rgb_code.length - 3) != ' 0)';
  },

  get_colored_elements: function(prop, should_include) {
    var color_hash = {};
    var add_to_hash = function(key, el) {
      if (color_hash.hasOwnProperty(key)) {
        color_hash[key] = color_hash[key].concat([el]);
      } else {
        color_hash[key] = [el];
      }
    };
    $('*').each(function() {
      var el = $(this);
      var prop_value = el.css(prop);
      if (should_include(prop_value)) {
        add_to_hash(prop_value, el);
      }
    });
    return color_hash;
  },

  get_background_colored_elements: function() {
    return this.get_colored_elements('background-color', this.has_color);
  },

  get_text_colored_elements: function() {
    return this.get_colored_elements('color', this.has_color);
  },

  get_bordered_elements: function() {
    return this.get_colored_elements('border-color', this.has_color);
  },

  get_text_shadowed_elements: function() {
    var me = this;
    return this.get_colored_elements('text-shadow', function(prop_value) {
      if (prop_value == 'none') {
        return false;
      }
      var shadow_rgb = prop_value.split(')')[0] + ')';
      return me.has_color(shadow_rgb);
    });
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

  colourize_elements: function(hex_codes, el_hash, callback) {
    var num_colors = hex_codes.length;
    var color_index = Math.floor(Math.random() * num_colors);
    for (var orig_color in el_hash) {
      var new_color = hex_codes[color_index];
      var elements = el_hash[orig_color];
      for (var i=0; i<elements.length; i++) {
        var selector = $(elements[i]);
        callback(selector, new_color);
      }
      color_index = (color_index+1) % num_colors;
    }
  },

  get_background_color: function(el) {
    var background = el.css('background-color');
    if (background !== 'rgba(0, 0, 0, 0)') {
      return background;
    }
    if (el.is('body')) {
      return false;
    }
    return this.get_background_color(el.parent());
  },

  // See http://stackoverflow.com/a/3118280/38743
  y: function(rgb_code) {
    var split_code = this.split_rgb_code(rgb_code);
    var r = split_code[0], g = split_code[1], b = split_code[2];
    r = Math.pow(r / 255, 2.2);
    g = Math.pow(g / 255, 2.2);
    b = Math.pow(b / 255, 2.2);
    return 0.2126*r + 0.7151*g + 0.0721*b;
  },

  get_color_ratio: function(rgb_code1, rgb_code2) {
    return (this.y(rgb_code1) + 0.05) / (this.y(rgb_code2) + 0.05);
  },

  get_text_color_for_bg: function(rgb_bg) {
    var luminance = this.y(rgb_bg); // 1 = white, 0 = black
    if (luminance < 0.25) { // close to black background
      return 'rgb(255, 255, 255)';
    }
    if (luminance > 0.75) { // close to white background
      return 'rgb(0, 0, 0)';
    }
    if (luminance > 0.5) { // on the whiter side
      return this.scale_color(rgb_bg, -1 * luminance - 1);
    }
    return this.scale_color(rgb_bg, luminance + 1);
  },

  set_text_color_for_bg: function(el) {
    var rgb_bg = this.get_background_color(el);
    if (rgb_bg) {
      el.css('color', this.get_text_color_for_bg(rgb_bg), 'important');
    }
  },

  colourize_bg_elements: function(hex_codes) {
    var me = this;
    var bg_elements = this.get_background_colored_elements();
    this.colourize_elements(hex_codes, bg_elements, function(el, color) {
      el.css('background-color', color, 'important');
      el.css('background-image', 'none', 'important');
      me.set_text_color_for_bg(el);
    });
  },

  colourize_text_elements: function(hex_codes) {
    var me = this;
    var text_elements = this.get_text_colored_elements();
    this.colourize_elements(hex_codes, text_elements, function(el, color) {
      me.set_text_color_for_bg(el);
    });
  },

  colourize_border_elements: function(hex_codes) {
    var me = this;
    var border_elements = this.get_bordered_elements();
    this.colourize_elements(hex_codes, border_elements, function(el, color) {
      var rgb_bg = me.get_background_color(el);
      var border_color;
      if (rgb_bg) {
        border_color = me.scale_color(rgb_bg, -0.25);
      } else {
        border_color = color;
      }
      el.css('border-color', border_color, 'important');
    });
  },

  colourize_text_shadow_elements: function(hex_codes) {
    var me = this;
    var shadow_elements = this.get_text_shadowed_elements();
    this.colourize_elements(hex_codes, shadow_elements, function(el, color) {
      var shadow = el.css('text-shadow');
      var shadow_props = shadow.split(')')[1];
      var rgb_bg = me.get_background_color(el);
      var shadow_color;
      if (rgb_bg) {
        shadow_color = me.scale_color(rgb_bg, -0.5);
      } else {
        shadow_color = 'rgba(0, 0, 0, 0.3)';
      }
      el.css('text-shadow', shadow_color + shadow_props);
    });
  },

  colourize_page: function(palette_data) {
    var hex_codes = palette_data.hex_codes;
    this.colourize_bg_elements(hex_codes);
    this.colourize_text_elements(hex_codes);
    this.colourize_border_elements(hex_codes);
    this.colourize_text_shadow_elements(hex_codes);
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
