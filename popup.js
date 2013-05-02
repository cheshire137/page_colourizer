var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-40563451-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var colourizer_popup = {
  get_favorite_link: function(palette_data) {
    var p = $('<p class="btn-container"></p>');
    var url = 'http://www.colourlovers.com/op/add/favorite/p/' +
              palette_data.palette_id;
    var link = $('<a href="' + url + '"></a>');
    link.addClass('btn');
    var span = $('<span>Favorite</span>');
    link.append(span);
    return p.append(link);
  },

  get_love_link: function(palette_data) {
    var p = $('<p class="btn-container"></p>');
    var url = 'http://www.colourlovers.com/ajax/add/score/p/' +
              palette_data.palette_id;
    var link = $('<a href="#" data-url="' + url + '" data-redirect="' +
                 palette_data.url + '"></a>');
    link.addClass('btn');
    var span = $('<span>Love</span>');
    link.append(span);
    return p.append(link);
  },

  on_popup_link_click: function() {
    var a = $(this);
    var url = a.attr('href');
    if (url == '#') {
      url = a.attr('data-url');
      var req = new XMLHttpRequest();
      req.open("GET", url, true);
      req.onload = function(e) {
        chrome.tabs.create({url: a.attr('data-redirect')});
      }.bind(this);
      req.send(null);
    } else {
      chrome.tabs.create({url: url});
    }
    return false;
  },

  get_popup_title: function(palette_data) {
    var title = $('<span>' + palette_data.title + '</span>');
    var link = $('<a href="' + palette_data.url + '"></a>');
    link.append(title);
    var img = $('<img alt="' + palette_data.title.replace(/"/g, "'") + '">');
    img.attr('src', palette_data.image_url);
    img.css('width', '228px');
    img.css('height', '161px');
    link.append(img);
    return $('<h1></h1>').append(link);
  },

  get_palette_creator: function(palette_data) {
    var url = 'http://www.colourlovers.com/lover/' + palette_data.user_name;
    var link = $('<a href="' + url + '">by ' + palette_data.user_name + '</a>');
    return $('<h2></h2>').append(link);
  },

  populate_popup: function(palette_data) {
    $('body').append(this.get_popup_title(palette_data)).
              append(this.get_palette_creator(palette_data)).
              append(this.get_favorite_link(palette_data)).
              append(this.get_love_link(palette_data));
    $('body a').click(this.on_popup_link_click);
  }
};

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(
      tab.id,
      {greeting: "load_random_palette"},
      function(palette_data) {
        colourizer_popup.populate_popup(palette_data);
      }
    );
  });
});
