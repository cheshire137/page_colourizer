chrome.tabs.onUpdated.addListener(function(tab_id, change_info) {
  if (change_info.status === 'complete') {
    chrome.tabs.sendRequest(
      tab_id,
      {greeting: 'tab_updated', tab_id: tab_id},
      function() {
        // We got a response, so Colour Frenzy mode must be enabled. Go ahead
        // and remove any stored data for tabs that no longer exist.
        chrome.tabs.getAllInWindow(null, function(tabs) {
          chrome.tabs.sendRequest(
            tab_id,
            {greeting: 'garbage_collect', tabs: tabs},
            function() {
              // no-op
            }
          );
        });
      }
    );
  }
});
chrome.tabs.onRemoved.addListener(function(closed_tab_id, remove_info) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.sendRequest(
      tab.id,
      {greeting: 'tab_closed', tab_id: closed_tab_id},
      function() {
        // no-op
      }
    );
  });
});
