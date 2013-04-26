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
      $('body').append(h1);
      for (var i = 0; i < hex_codes.length; i++) {
        var div = $('<div class="color-box"></div>');
        div.css('background-color', hex_codes[i]);
        $('body').append(div);
      }
    });
  });
});
