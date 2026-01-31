(function() {
  'use strict';
  
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data?.source !== 'QUEST_EXTENSION_POLYFILL') return;
    try {
      chrome.runtime.sendMessage(event.data.payload, () => {
         if (chrome.runtime.lastError) console.error('Bridge Error:', chrome.runtime.lastError);
      });
    } catch (err) {
      console.error('Bridge failed:', err);
    }
  });

  try {
    chrome.runtime.sendMessage({ action: 'injectScript', file: 'quest-home.js', world: 'ISOLATED' });
  } catch (e) {
    console.error('Request failed:', e);
  }
})();
