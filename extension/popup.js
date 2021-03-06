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

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-40563451-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var colourizer_popup = {
  set_favorite_link: function(data) {
    var url = 'http://www.colourlovers.com/op/add/favorite/p/' +
              data.id;
    $('a#favorite-link').unbind('click').click(function() {
      chrome.tabs.create({url: url});
      return false;
    });
    $('#favorite-container').fadeIn().css('display', 'inline-block');
  },

  set_love_link: function(data) {
    var context = data.is_pattern ? 'n' : 'p';
    var url = 'http://www.colourlovers.com/ajax/add/score/' + context + '/' +
              data.id;
    var me = this;
    $('a#love-link').unbind('click').click(function() {
      var req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.onload = function(e) {
        chrome.tabs.create({url: data.url});
      }.bind(me);
      req.send(null);
      return false;
    });
    $('#love-container').fadeIn().css('display', 'inline-block');
  },

  set_popup_title: function(data) {
    $('h1 a span#title').text(data.title);
    $('h1 a').attr('href', data.url);
    $('h1 a img').attr('alt', data.title.replace(/"/g, "'")).
                  attr('src', data.image_url).
                  attr('width', data.is_pattern ? '200' : '228').
                  attr('height', data.is_pattern ? '200' : '161');
    $('h1 span#type').text(data.is_pattern ? 'Pattern' : 'Palette');
    $('h1, .options-container').fadeIn();
  },

  set_palette_creator: function(data) {
    var url = 'http://www.colourlovers.com/lover/' + data.user_name;
    $('h2 a').attr('href', url).text('by ' + data.user_name);
    $('h2').fadeIn();
  },

  send_shuffle_colors_request: function(tab, callback) {
    chrome.tabs.sendRequest(tab.id,
                            {greeting: 'shuffle_colors', tab_id: tab.id},
                            callback);
  },

  send_new_colors_request: function(tab, callback) {
    chrome.tabs.sendRequest(tab.id, {greeting: 'new_colors', tab_id: tab.id},
                            callback);
  },

  on_shuffle_colors_clicked: function(link, tab) {
    if (link.hasClass('disabled')) {
      return;
    }
    link.addClass('disabled');
    $('#spinner').show();
    this.send_shuffle_colors_request(tab, function() {
      link.removeClass('disabled');
      $('#spinner').hide();
    });
  },

  on_new_colors_clicked: function(link, tab) {
    if (link.hasClass('disabled')) {
      return;
    }
    link.addClass('disabled');
    $('#spinner').show();
    var me = this;
    this.send_new_colors_request(tab, function(data) {
      me.populate_popup(tab, data);
      link.removeClass('disabled');
      $('#spinner').hide();
    });
  },

  setup_shuffle_colors_button: function(tab) {
    var me = this;
    $('a#shuffle-colors').unbind('click').click(function() {
      me.on_shuffle_colors_clicked($(this), tab);
      return false;
    });
  },

  setup_new_colors_button: function(tab) {
    var me = this;
    $('a#new-colors').unbind('click').click(function() {
      me.on_new_colors_clicked($(this), tab);
      return false;
    });
  },

  setup_options_link: function() {
    $('a#options-link').unbind('click').blur().click(function() {
      chrome.tabs.create({url: chrome.extension.getURL("options.html")});
      return false;
    });
  },

  populate_popup: function(tab, data) {
    this.set_popup_title(data);
    this.set_palette_creator(data);
    this.set_favorite_link(data);
    this.set_love_link(data);
    this.setup_shuffle_colors_button(tab);
    this.setup_new_colors_button(tab);
    this.setup_options_link();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getSelected(null, function(tab) {
    // Remove any stored data for tabs that no longer exist.
    chrome.tabs.getAllInWindow(null, function(tabs) {
      chrome.tabs.sendRequest(
        tab.id,
        {greeting: 'garbage_collect', tabs: tabs},
        function() {
          // no-op
        }
      );
    });
    chrome.tabs.sendRequest(
      tab.id,
      {greeting: 'popup_opened', tab_id: tab.id},
      function(data) {
        colourizer_popup.populate_popup(tab, data);
      }
    );
  });
});
