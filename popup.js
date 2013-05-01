var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-40563451-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(tab.id, {greeting: "load_random_palette"}, function(palette_data) {
      var hex_codes = palette_data.hex_codes;
      var link = $('<a href="' + palette_data.url + '">' + palette_data.title + '</a>');
      link.click(function() {
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
      });
      var h1 = $('<h1></h1>').append(link);
      var img = $('<img alt="' + palette_data.title.replace(/"/g, "'") + '">');
      img.attr('src', palette_data.image_url);
      img.css('width', '228px');
      img.css('height', '161px');
      link.append(img);
      var h2 = $('<h2>by ' + palette_data.user_name + '</h2>');
      $('body').append(h1).append(h2);
    });
  });
});
