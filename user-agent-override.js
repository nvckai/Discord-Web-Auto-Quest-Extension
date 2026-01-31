(function() {
  'use strict';
  try {
    chrome.runtime.sendMessage({ action: 'injectScript', file: 'user-agent-override.js', world: 'MAIN' });
    console.info('[Discord Auto Quest] Requested remote User-Agent override script');
  } catch (error) {
    console.error('[Discord Auto Quest] Failed to request remote script:', error);
  }
})();
