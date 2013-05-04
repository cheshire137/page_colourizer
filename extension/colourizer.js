/*
 * Copyright 2013 Sarah Vessels
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var page_colourizer = {
  random_palette_url: 'http://www.colourlovers.com/api/palettes/random',
  top_palette_url: 'http://www.colourlovers.com/api/palettes/top',
  new_palette_url: 'http://www.colourlovers.com/api/palettes/new',

  random_pattern_url: 'http://www.colourlovers.com/api/patterns/random',
  top_pattern_url: 'http://www.colourlovers.com/api/patterns/top',
  new_pattern_url: 'http://www.colourlovers.com/api/patterns/new',

  garbage_collect: function(open_tabs, callback) {
    var me = this;
    var open_tab_ids = [];
    for (var i=0; i<open_tabs.length; i++) {
      open_tab_ids[i] = parseInt(open_tabs[i].id, 10);
    }
    chrome.storage.local.get('colourizer_data', function(data) {
      var all_tab_data = data.colourizer_data || {};
      for (var stored_tab_id in all_tab_data) {
        stored_tab_id = parseInt(stored_tab_id, 10);
        // If we have data for a tab that is no longer open, delete it.
        if (open_tab_ids.indexOf(stored_tab_id) < 0) {
          delete all_tab_data[stored_tab_id];
        }
      }
      chrome.storage.local.set({'colourizer_data': all_tab_data}, function() {
        callback();
      });
    });
  },

  delete_info_for_tab: function(tab_id, callback) {
    chrome.storage.local.get('colourizer_data', function(data) {
      var all_tab_data = data.colourizer_data || {};
      delete all_tab_data[tab_id];
      chrome.storage.local.set({'colourizer_data': all_tab_data}, function() {
        callback();
      });
    });
  },

  store_info_for_tab: function(tab_id, tab_data, callback) {
    chrome.storage.local.get('colourizer_data', function(data) {
      var all_tab_data = data.colourizer_data || {};
      all_tab_data[tab_id] = tab_data;
      chrome.storage.local.set({'colourizer_data': all_tab_data}, function() {
        callback();
      });
    });
  },

  store_info: function(tab_id, data, callback) {
    var type = data.is_pattern ? 'pattern' : 'palette';
    data = {id: data.id, index: parseInt(data.index, 10), type: type,
            hex_codes: data.hex_codes, title: data.title, url: data.url,
            image_url: data.image_url, user_name: data.user_name};
    this.store_info_for_tab(tab_id, data, callback);
  },

  get_stored_info: function(tab_id, callback) {
    chrome.storage.local.get('colourizer_data', function(data) {
      all_tab_data = data.colourizer_data || {};
      callback(all_tab_data[tab_id]);
    });
  },

  get_palette_url: function(opts) {
    if (opts.selection_method != 'top_colors' &&
        opts.selection_method != 'new_colors') {
      return this.random_palette_url;
    }
    var params = '?orderCol=dateCreated' +
                 '&sortBy=DESC' +
                 '&numResults=1' +
                 '&resultOffset=' + Math.round(Math.random() * 1000);
    if (opts.selection_method == 'top_colors') {
      return this.top_palette_url + params;
    }
    return this.new_palette_url + params;
  },

  get_pattern_url: function(opts) {
    if (opts.selection_method != 'top_colors' &&
        opts.selection_method != 'new_colors') {
      return this.random_pattern_url;
    }
    var params = '?orderCol=dateCreated' +
                 '&sortBy=DESC' +
                 '&numResults=1' +
                 '&resultOffset=' + Math.round(Math.random() * 1000);
    if (opts.selection_method == 'top_colors') {
      return this.top_pattern_url + params;
    }
    return this.new_pattern_url + params;
  },

  get_color_sources: function(callback) {
    var me = this;
    chrome.storage.sync.get('colourizer_options', function(opts) {
      opts = opts.colourizer_options || {};
      var sources = [];
      if (opts.color_source != 'patterns_only') {
        sources = sources.concat([
          {is_pattern: false, url: me.get_palette_url(opts)}
        ]);
      }
      if (opts.color_source == 'palettes_and_patterns' ||
          opts.color_source == 'patterns_only') {
        sources = sources.concat([
          {is_pattern: true, url: me.get_pattern_url(opts)}
        ]);
      }
      callback(sources);
    });
  },

  get_color_source: function(callback) {
    this.get_color_sources(function(sources) {
      callback(sources[Math.floor(Math.random() * sources.length)]);
    });
  },

  load_cl_url: function(url, is_pattern, callback) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    var me = this;
    req.onload = function(e) {
      me.extract_cl_data_from_xml(e, is_pattern, callback);
    }.bind(this);
    req.send(null);
  },

  load_random_cl_data: function(callback) {
    var me = this;
    this.get_color_source(function(source) {
      me.load_cl_url(source.url, source.is_pattern, callback);
    });
  },

  extract_cl_data_from_xml: function(e, is_pattern, callback) {
    var xml = e.target.responseXML;
    var hex_nodes = xml.querySelectorAll('hex');
    var title = xml.querySelector('title').textContent;
    var url = xml.querySelector('url').textContent;
    var image_url = xml.querySelector('imageUrl').textContent;
    var user_name = xml.querySelector('userName').textContent;
    var id = xml.querySelector('id').textContent;
    var hex_codes = [];
    for (var i=0; i<hex_nodes.length; i++) {
      hex_codes[i] = '#' + hex_nodes[i].textContent;
    }
    callback({hex_codes: hex_codes, title: title, url: url,
              image_url: image_url, user_name: user_name, id: id,
              is_pattern: is_pattern, index: 0});
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
      if (should_include(el, prop_value)) {
        add_to_hash(prop_value, el);
      }
    });
    return color_hash;
  },

  get_background_colored_elements: function() {
    var me = this;
    return this.get_colored_elements('background', function(el, prop_value) {
      var rgb_code = prop_value.split(')')[0] + ')';
      if (me.has_color(rgb_code)) {
        return true;
      }
      var has_bg_image = prop_value.indexOf('url(') !== -1;
      var text_indent = parseInt(el.css('text-indent').replace(/px$/, ''), 10);
      var has_neg_text_indent = text_indent < 0;
      var has_bg_position = el.css('background-position') !== '0% 0%';
      // Common to have images that replace text with a negative text-indent,
      // so assume background image with negative text indent means it's a logo
      // and we should leave it alone.
      return has_bg_image && !has_neg_text_indent && !has_bg_position;
    });
  },

  get_text_colored_elements: function() {
    var me = this;
    return this.get_colored_elements('color', function(el, prop_value) {
      return me.has_color(prop_value);
    });
  },

  get_bordered_elements: function() {
    var me = this;
    return this.get_colored_elements('border-color', function(el, prop_value) {
      return me.has_color(prop_value);
    });
  },

  get_text_shadowed_elements: function() {
    var me = this;
    return this.get_colored_elements('text-shadow', function(el, prop_value) {
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

  colourize_elements: function(hex_codes, el_hash, idx, callback) {
    var num_colors = hex_codes.length;
    for (var orig_color in el_hash) {
      var new_color = hex_codes[idx];
      var elements = el_hash[orig_color];
      for (var i=0; i<elements.length; i++) {
        var selector = $(elements[i]);
        callback(selector, new_color);
      }
      idx = (idx + 1) % num_colors;
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

  parent_has_same_background_color: function(el, color) {
    var parent = el.parent();
    if (parent) {
      var parent_bg = this.get_background_color(parent);
      return parent_bg !== undefined && parent_bg == color;
    }
    return false;
  },

  colourize_bg_elements: function(hex_codes, idx) {
    var me = this;
    var elements = this.get_background_colored_elements();
    this.colourize_elements(hex_codes, elements, idx, function(el, color) {
      el.css('background-color', color, 'important');
      color = el.css('background-color');
      if (me.parent_has_same_background_color(el, color)) {
        color = me.scale_color(color, 0.5);
        el.css('background-color', color, 'important');
      }
      el.css('background-image', 'none', 'important');
      me.set_text_color_for_bg(el);
    });
  },

  colourize_text_elements: function(hex_codes, idx) {
    var me = this;
    var elements = this.get_text_colored_elements();
    this.colourize_elements(hex_codes, elements, idx, function(el, color) {
      me.set_text_color_for_bg(el);
    });
  },

  colourize_border_elements: function(hex_codes, idx) {
    var me = this;
    var elements = this.get_bordered_elements();
    this.colourize_elements(hex_codes, elements, idx, function(el, color) {
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

  colourize_text_shadow_elements: function(hex_codes, idx) {
    var me = this;
    var elements = this.get_text_shadowed_elements();
    this.colourize_elements(hex_codes, elements, idx, function(el, color) {
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

  set_bg_image: function(data) {
    if (data.is_pattern) {
      $('body').css('background-image', 'url("' + data.image_url + '")',
                    'important').
                css('background-repeat', 'repeat', 'important').
                css('background-position', 'left top', 'important');
    }
  },

  colourize_page: function(data) {
    var hex_codes = data.hex_codes;
    var idx = data.index;
    this.colourize_bg_elements(hex_codes, idx);
    this.colourize_text_elements(hex_codes, idx);
    this.colourize_border_elements(hex_codes, idx);
    this.colourize_text_shadow_elements(hex_codes, idx);
    this.set_bg_image(data);
  },

  on_popup_opened: function(tab_id, data_callback) {
    var me = this;
    this.get_stored_info(tab_id, function(stored_data) {
      if (stored_data) {
        data_callback(stored_data);
        me.colourize_page(stored_data);
      } else {
        me.load_random_cl_data(function(new_data) {
          new_data.index = 0;
          data_callback(new_data);
          me.colourize_page(new_data);
          me.store_info(tab_id, new_data, function() {
            // no-op
          });
        });
      }
    });
  },

  on_new_colors_requested: function(tab_id, callback) {
    var me = this;
    this.load_random_cl_data(function(data) {
      me.colourize_page(data);
      me.store_info(tab_id, data, function() {
        callback(data);
      });
    });
  },

  shuffle_colors: function(tab_id, callback) {
    var me = this;
    this.get_stored_info(tab_id, function(data) {
      data.index = (data.index + 1) % data.hex_codes.length;
      me.colourize_page(data);
      me.store_info(tab_id, data, function() {
        callback();
      });
    });
  },

  on_tab_updated: function(tab_id, callback) {
    var me = this;
    chrome.storage.sync.get('colourizer_options', function(opts) {
      opts = opts.colourizer_options || {};
      if (opts.colour_frenzy) {
        me.on_new_colors_requested(tab_id, function(data) {
          callback();
        });
      }
    });
  },

  on_tab_closed: function(tab_id, callback) {
    this.delete_info_for_tab(tab_id, callback);
  }
};

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.greeting == 'popup_opened') {
    page_colourizer.on_popup_opened(request.tab_id, function(data) { sendResponse(data);
    });
  } else if (request.greeting == 'shuffle_colors') {
    page_colourizer.shuffle_colors(request.tab_id, function() {
      sendResponse();
    });
  } else if (request.greeting == 'new_colors') {
    page_colourizer.on_new_colors_requested(request.tab_id, function(data) {
      sendResponse(data);
    });
  } else if (request.greeting == 'tab_updated') {
    page_colourizer.on_tab_updated(request.tab_id, function() {
      sendResponse();
    });
  } else if (request.greeting == 'tab_closed') {
    page_colourizer.on_tab_closed(request.tab_id, function() {
      sendResponse();
    });
  } else if (request.greeting == 'garbage_collect') {
    page_colourizer.garbage_collect(request.tabs, function() {
      sendResponse();
    });
  } else {
    sendResponse({});
  }
});
