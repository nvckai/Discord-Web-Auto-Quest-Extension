const BASE_URL = 'https://raw.githubusercontent.com/nvckai/Discord-Web-Auto-Quest-Extension/main/';

chrome.runtime.onInstalled.addListener(() => console.info('Discord Auto Quest Loader Installed'));

const injectScript = async (tabId, filename, world = 'MAIN') => {
  try {
    const res = await fetch(`${BASE_URL}${filename}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const code = await res.text();

    const args = world === 'ISOLATED' 
      ? [`(function() {
          if (!window.chrome) window.chrome = {};
          if (!window.chrome.runtime) window.chrome.runtime = {};
          window.chrome.runtime.sendMessage = function(msg, cb) {
            window.postMessage({ source: 'QUEST_EXTENSION_POLYFILL', payload: msg }, '*');
            if (cb) setTimeout(() => cb({success: true}), 0);
          };
        })();\n\n${code}`] 
      : [code];

    chrome.scripting.executeScript({
      target: { tabId },
      func: (c) => {
        const s = document.createElement('script');
        s.textContent = c;
        (document.head || document.documentElement).appendChild(s);
        s.remove();
      },
      args,
      world: 'MAIN'
    }).catch(e => e.message?.includes('Frame with ID 0') || console.error(`Injection failed: ${filename}`, e));
  } catch (e) {
    console.error(`Fetch failed: ${filename}`, e);
  }
};

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (!sender.tab?.id) return sendResponse({ success: false, error: 'No tab ID' });

  if (req.action === 'injectScript') {
    injectScript(sender.tab.id, req.file, req.world);
  } else if (req.action === 'executeQuestCode') {
    injectScript(sender.tab.id, 'quest-code.js', 'MAIN');
    sendResponse({ success: true });
  }
  return true;
});
