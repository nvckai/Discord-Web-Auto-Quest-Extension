chrome.runtime.onInstalled.addListener(function() {
  console.info('[Discord Auto Quest] installed');
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'getVersion') {
    sendResponse({ version: chrome.runtime.getManifest().version });
    return false;
  }

  if (request.action === 'executeQuestCode') {
    if (!sender.tab || !sender.tab.id) {
      sendResponse({ success: false, error: 'No tab ID' });
      return false;
    }

    var manifest = chrome.runtime.getManifest();

    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: function(v) { window.__QUEST_VERSION = v; },
      args: [manifest.version],
      world: 'MAIN'
    }).then(function() {
      return chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        files: ['quest-code.js'],
        world: 'MAIN'
      });
    }).then(function() {
      sendResponse({ success: true });
    }).catch(function(error) {
      console.error('[Discord Auto Quest] injection failed:', error.message);
      sendResponse({ success: false, error: error.message });
    });

    return true;
  }
});
