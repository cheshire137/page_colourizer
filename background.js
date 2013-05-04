chrome.tabs.onUpdated.addListener(function(tab_id, change_info) {
  if (change_info.status === 'complete') {
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.sendRequest(
        tab.id,
        {greeting: 'tab_updated', tab_id: tab.id},
        function(data) {
          console.log(data);
        }
      );
    });
  }
});
