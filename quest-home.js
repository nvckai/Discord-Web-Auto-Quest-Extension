(function() {
  'use strict';

  var isPanelExpanded = false;
  var expandButtonRef;
  var questStateCache = new Map();

  var STYLES = {
    button: 'position:fixed;bottom:20px;right:20px;z-index:10000;background:white;color:black;border:none;border-radius:10px;padding:8px 16px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.1);transition:all 0.3s ease;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;display:flex;align-items:center;gap:4px;font-size:14px;font-weight:600;width:180px;',
    icon: 'width:15px;height:15px;',
    text: 'flex:1;text-align:center;',
    expandButton: 'background:rgba(218,218,218,0.1);border:1px solid #eeededff;border-radius:4px;color:black;cursor:pointer;font-size:12px;padding:2px 7px;margin-left:4px;transition:transform 0.3s ease;transform:rotate(0deg);',
    panel: 'position:fixed;bottom:65px;right:20px;z-index:9999;background:black;color:white;border-radius:10px;padding:16px;width:250px;box-shadow:0 8px 24px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;',
    questList: 'margin-bottom:5px;max-height:200px;overflow-y:auto;',
    questItem: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;',
    questName: 'flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-right:8px;color:#eee;',
    questProgress: 'font-family:monospace;color:#aaa;font-size:12px;'
  };

  function createQuestButton() {
    if (!window.location.pathname.includes('/quest-home')) {
      removeElements();
      return;
    }

    if (document.getElementById('DiscordQuestButton')) return;

    var button = document.createElement('div');
    button.id = 'DiscordQuestButton';
    button.style.cssText = STYLES.button;

    var icon = document.createElement('img');
    icon.src = 'https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d8014ea898f3a4b2156c_Symbol.svg';
    icon.alt = 'Quest Icon';
    icon.style.cssText = STYLES.icon;
    button.appendChild(icon);

    var textLabel = document.createElement('span');
    textLabel.textContent = 'Running Quests';
    textLabel.style.cssText = STYLES.text;
    button.appendChild(textLabel);

    var expandButton = document.createElement('button');
    var arrowIcon = document.createElement('img');
    arrowIcon.src = 'https://pic.onlinewebfonts.com/thumbnails/icons_378683.svg';
    arrowIcon.style.cssText = 'width:10px;height:10px;display:block;pointer-events:none;';
    expandButton.appendChild(arrowIcon);
    expandButton.style.cssText = STYLES.expandButton + 'padding:4px;display:flex;align-items:center;justify-content:center;';
    expandButton.addEventListener('click', function(e) {
      e.stopPropagation();
      togglePanel();
    });
    button.appendChild(expandButton);
    expandButtonRef = expandButton;

    button.addEventListener('mouseenter', function() {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    });

    button.addEventListener('mouseleave', function() {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    });

    button.addEventListener('click', function() { handleButtonClick(button, textLabel, icon, expandButton); });

    document.body.appendChild(button);

    if (isPanelExpanded) createExpandedPanel();
  }

  function handleButtonClick(button, textLabel, icon, expandButton) {
    var elements = { button: button, textLabel: textLabel, icon: icon, expandButton: expandButton };

    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
      updateButtonState(elements, 'Extension Error');
      return;
    }

    chrome.runtime.sendMessage({ action: 'executeQuestCode' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error('[Discord Auto Quest] sendMessage error:', chrome.runtime.lastError.message);
        updateButtonState(elements, 'Error');
      } else if (response && response.success) {
        updateButtonState(elements, 'Code Executed');
      } else {
        var errMsg = (response && response.error) ? response.error : 'Unknown';
        console.warn('[Discord Auto Quest] execution failed:', errMsg);
        updateButtonState(elements, 'Failed');
      }
    });
  }

  function updateButtonState(elements, message) {
    var b = elements.button;
    var t = elements.textLabel;
    var i = elements.icon;
    var e = elements.expandButton;

    var states = {
      'Extension Error': { bg: 'black', color: 'white', invert: true },
      'Error': { bg: 'black', color: 'white', invert: true },
      'Failed': { bg: '#ff4444', color: 'white', invert: true },
      'Code Executed': { bg: 'black', color: 'white', invert: true }
    };

    var state = states[message] || { bg: 'black', color: 'white', invert: true };

    t.textContent = message;
    b.style.background = state.bg;
    b.style.color = state.color;

    if (state.invert) {
      i.style.filter = 'brightness(0) invert(1)';
      e.style.filter = 'brightness(0) invert(1)';
    }

    setTimeout(function() {
      t.textContent = 'Running Quests';
      b.style.background = 'white';
      b.style.color = 'black';
      i.style.filter = '';
      e.style.filter = '';
    }, 2500);
  }

  function createExpandedPanel() {
    if (document.getElementById('DiscordQuestPanel')) return;

    var panel = document.createElement('div');
    panel.id = 'DiscordQuestPanel';
    panel.style.cssText = STYLES.panel;

    var questListContainer = document.createElement('div');
    questListContainer.id = 'DiscordQuestList';
    questListContainer.style.cssText = STYLES.questList;

    if (questStateCache.size > 0) {
      questStateCache.forEach(function(quest) { updateQuestItemUI(questListContainer, quest); });
    }

    panel.appendChild(questListContainer);

    var title = document.createElement('h3');
    title.textContent = 'Discord ID | Auto Quest';
    title.style.cssText = 'margin:0 0 12px 0;font-size:16px;font-weight:bold;border-top:1px solid #333;padding-top:12px;';
    panel.appendChild(title);

    var credit = document.createElement('p');
    credit.style.cssText = 'margin:0;font-size:14px;color:#ccc;';
    credit.innerHTML = 'Credits by <a href="https://github.com/nvckai/Discord-Web-Auto-Quest-Extension" target="_blank" style="color:#fff;font-weight:bold;text-decoration:none;">6Together9</a>';
    panel.appendChild(credit);

    document.body.appendChild(panel);
  }

  window.addEventListener('DISCORD_QUEST_COMPLETER', function(e) {
    var data = e.detail;
    if (!data) return;

    var listContainer = document.getElementById('DiscordQuestList');

    if (data.type === 'QUEST_LIST') {
      questStateCache.clear();
      data.data.forEach(function(q) { questStateCache.set(q.id, q); });
      if (listContainer) {
        listContainer.innerHTML = '';
        data.data.forEach(function(q) { updateQuestItemUI(listContainer, q); });
      }
    } else if (data.type === 'QUEST_UPDATE') {
      questStateCache.set(data.data.id, data.data);
      if (listContainer) { updateQuestItemUI(listContainer, data.data); }
    }
  });

  function updateQuestItemUI(container, quest) {
    var item = document.getElementById('quest-item-' + quest.id);
    var done = quest.completed;

    if (!item) {
      item = document.createElement('div');
      item.id = 'quest-item-' + quest.id;
      item.style.cssText = STYLES.questItem;

      var nameSpan = document.createElement('span');
      nameSpan.style.cssText = STYLES.questName;
      nameSpan.title = quest.name;
      nameSpan.textContent = quest.name;
      item.appendChild(nameSpan);

      var progressSpan = document.createElement('span');
      progressSpan.id = 'quest-progress-' + quest.id;
      progressSpan.style.cssText = STYLES.questProgress;
      item.appendChild(progressSpan);

      container.appendChild(item);
    }

    var progressSpan = document.getElementById('quest-progress-' + quest.id);
    if (progressSpan) {
      progressSpan.textContent = done ? 'DONE' : Math.floor(quest.progress) + '/' + quest.target;
      progressSpan.style.color = done ? '#43b581' : '#aaa';
    }
    item.style.opacity = done ? '0.5' : '1';
  }

  function removeElements() {
    var b = document.getElementById('DiscordQuestButton');
    if (b) b.remove();
    var p = document.getElementById('DiscordQuestPanel');
    if (p) p.remove();
  }

  function togglePanel() {
    isPanelExpanded = !isPanelExpanded;
    if (expandButtonRef) {
      expandButtonRef.style.transform = isPanelExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    if (isPanelExpanded) {
      createExpandedPanel();
    } else {
      var p = document.getElementById('DiscordQuestPanel');
      if (p) p.remove();
    }
  }

  function init() {
    createQuestButton();

    var lastUrl = window.location.href;
    new MutationObserver(function() {
      var currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        createQuestButton();
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
