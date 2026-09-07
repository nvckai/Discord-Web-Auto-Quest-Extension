(function() {
  'use strict';

  if (window.__DISCORD_QUEST_RUNNING) return;
  window.__DISCORD_QUEST_RUNNING = true;

  function waitForWebpack(timeout) {
    timeout = timeout || 25000;

    return new Promise(function(resolve, reject) {
      var start = Date.now();

      function check() {
        if (Date.now() - start > timeout) {
          reject(new Error('webpack not found within ' + timeout + 'ms'));
          return;
        }

        if (typeof window.webpackChunkdiscord_app === 'undefined') {
          setTimeout(check, 300 + Math.random() * 200);
          return;
        }

        try {
          var jq = window.$;
          delete window.$;

          var wp = window.webpackChunkdiscord_app.push([[Symbol()], {}, function(r) { return r; }]);
          window.webpackChunkdiscord_app.pop();

          if (jq) window.$ = jq;

          if (!wp || !wp.c || Object.keys(wp.c).length < 10) {
            setTimeout(check, 300 + Math.random() * 200);
            return;
          }

          resolve(wp);
        } catch (e) {
          setTimeout(check, 300 + Math.random() * 200);
        }
      }

      check();
    });
  }

  function findModule(wp, filter) {
    for (var key in wp.c) {
      var mod = wp.c[key];
      if (!mod || !mod.exports) continue;
      var exp = mod.exports;
      if (exp.A && filter(exp.A)) return exp.A;
      if (exp.Ay && filter(exp.Ay)) return exp.Ay;
      if (exp.ZP && filter(exp.ZP)) return exp.ZP;
      if (exp.default && filter(exp.default)) return exp.default;
      if (filter(exp)) return exp;
    }
    return null;
  }

  function findStore(wp, method) {
    return findModule(wp, function(m) {
      return m.__proto__ && typeof m.__proto__[method] === 'function';
    });
  }

  function findAPI(wp) {
    var keys = ['Bo', 'tn', 'aj'];

    var wrapper = findModule(wp, function(m) {
      for (var i = 0; i < keys.length; i++) {
        if (m[keys[i]] && typeof m[keys[i]].get === 'function') return true;
      }
      return false;
    });

    if (!wrapper) return null;

    for (var i = 0; i < keys.length; i++) {
      if (wrapper[keys[i]]) return wrapper[keys[i]];
    }

    return wrapper;
  }

  function postMessage(type, data) {
    try {
      window.dispatchEvent(new CustomEvent('DISCORD_QUEST_COMPLETER', { detail: { type: type, data: data } }));
    } catch (e) {}
  }

  function getActiveQuests(QuestsStore) {
    var supportedTasks = ['WATCH_VIDEO', 'PLAY_ON_DESKTOP', 'PLAY_ON_DESKTOP_V2', 'STREAM_ON_DESKTOP', 'PLAY_ACTIVITY', 'WATCH_VIDEO_ON_MOBILE'];
    var now = Date.now();
    var result = [];
    var quests = QuestsStore.quests;

    if (quests && typeof quests.values === 'function') {
      quests = Array.from(quests.values());
    } else if (!Array.isArray(quests)) {
      return result;
    }

    for (var i = 0; i < quests.length; i++) {
      var q = quests[i];
      if (!q || !q.config) continue;
      if (new Date(q.config.expiresAt).getTime() <= now) continue;
      if (!q.userStatus || !q.userStatus.enrolledAt) continue;
      if (q.userStatus.completedAt) continue;

      var cfg = q.config.taskConfig || q.config.taskConfigV2;
      if (!cfg || !cfg.tasks) continue;

      var supported = false;
      for (var t = 0; t < supportedTasks.length; t++) {
        if (cfg.tasks[supportedTasks[t]] != null) { supported = true; break; }
      }
      if (!supported) continue;

      result.push(q);
    }

    return result;
  }

  function initQuestState(quest) {
    var cfg = quest.config.taskConfig || quest.config.taskConfigV2;
    var supportedTasks = ['WATCH_VIDEO', 'PLAY_ON_DESKTOP', 'PLAY_ON_DESKTOP_V2', 'STREAM_ON_DESKTOP', 'PLAY_ACTIVITY', 'WATCH_VIDEO_ON_MOBILE'];
    var taskType = null;

    for (var i = 0; i < supportedTasks.length; i++) {
      if (cfg && cfg.tasks && cfg.tasks[supportedTasks[i]] != null) {
        taskType = supportedTasks[i];
        break;
      }
    }

    var taskData = taskType && cfg ? cfg.tasks[taskType] : null;
    var target = taskData && taskData.target ? taskData.target : 0;
    var progress = 0;

    if (quest.userStatus && quest.userStatus.progress) {
      var pt = quest.userStatus.progress[taskType];
      if (pt && pt.value) progress = pt.value;
    }
    if (!progress && quest.userStatus) {
      progress = quest.userStatus.streamProgressSeconds || 0;
    }

    return {
      quest: quest,
      taskType: taskType,
      target: target,
      progress: progress,
      completed: progress >= target,
      questName: quest.config.messages ? (quest.config.messages.questName || quest.id) : quest.id
    };
  }

  function sleep(ms) {
    return new Promise(function(r) { setTimeout(r, ms); });
  }

  function jitter(base, range) {
    return base + Math.random() * range;
  }

  async function processVideo(quest, api, target, progress, notify) {
    var current = progress;

    while (current < target) {
      var step = 1.5 + Math.random() * 4;
      var next = Math.min(target, current + step);

      try {
        var res = await api.post({
          url: '/quests/' + quest.id + '/video-progress',
          body: { timestamp: next }
        });

        current = next;

        notify({ progress: Math.floor(current), completed: current >= target });

        var completedAt = res.body ? res.body.completed_at : null;
        if (completedAt || current >= target) {
          await sleep(jitter(500, 1500));
          await api.post({
            url: '/quests/' + quest.id + '/video-progress',
            body: { timestamp: target }
          });
          notify({ progress: target, completed: true });
          return;
        }
      } catch (e) {
        console.warn('[Quest ' + quest.id + '] video error:', e.message);
        await sleep(jitter(5000, 10000));
      }

      await sleep(jitter(3000, 4000));
    }
  }

  async function processHeartbeat(quest, taskType, target, progress, api, channelStore, guildChannelStore, currentUserId, notify) {
    var current = progress;
    var isActivity = taskType === 'PLAY_ACTIVITY';
    var streamKey;

    if (isActivity) {
      var appId = quest.config && quest.config.application && quest.config.application.id;
      var suffix = currentUserId || quest.id || Math.floor(Math.random() * 99999);
      streamKey = appId ? appId + ':' + suffix : 'activity:' + quest.id + ':' + suffix;
    } else {
      var channelId = null;
      try {
        if (channelStore && typeof channelStore.getSortedPrivateChannels === 'function') {
          var priv = channelStore.getSortedPrivateChannels();
          if (priv && priv[0]) channelId = priv[0].id;
        }
      } catch (e) {}

      if (!channelId && guildChannelStore) {
        try {
          var allGuilds = guildChannelStore.getAllGuilds ? guildChannelStore.getAllGuilds() : {};
          var guilds = Object.values(allGuilds);
          for (var i = 0; i < guilds.length; i++) {
            if (guilds[i] && guilds[i].VOCAL && guilds[i].VOCAL.length > 0) {
              channelId = guilds[i].VOCAL[0].channel.id;
              break;
            }
          }
        } catch (e) {}
      }

      var suffix = currentUserId || Math.floor(Math.random() * 99999);
      streamKey = channelId
        ? 'call:' + channelId + ':' + suffix
        : 'call:' + quest.id + ':' + suffix;
    }

    var retries = 0;

    while (current < target) {
      try {
        var res = await api.post({
          url: '/quests/' + quest.id + '/heartbeat',
          body: { stream_key: streamKey, terminal: false }
        });

        retries = 0;

        var serverProgress = 0;
        if (res.body && res.body.progress && res.body.progress[taskType]) {
          serverProgress = res.body.progress[taskType].value || 0;
        }
        current = serverProgress;

        notify({ progress: Math.floor(current), completed: current >= target });

        if (current >= target) {
          await sleep(jitter(1000, 2000));
          await api.post({
            url: '/quests/' + quest.id + '/heartbeat',
            body: { stream_key: streamKey, terminal: true }
          });
          notify({ progress: target, completed: true });
          return;
        }
      } catch (e) {
        retries++;
        console.warn('[Quest ' + quest.id + '] heartbeat error (attempt ' + retries + '):', e.message);

        if (retries >= 5) {
          notify({ progress: Math.floor(current), completed: false });
          return;
        }

        await sleep(jitter(retries * 10000, 5000));
      }

      var baseDelay = 30000;
      if (taskType && taskType.startsWith('WATCH_VIDEO')) baseDelay = 5000;
      else if (taskType === 'PLAY_ACTIVITY') baseDelay = 15000;
      await sleep(jitter(baseDelay, 15000));
    }
  }

  async function run(wp) {
    var version = window.__QUEST_VERSION || 'unknown';
    try { delete window.__QUEST_VERSION; } catch (e) {}
    console.info('[Discord Auto Quest] v' + version + ' initializing...');

    var QuestsStore = findStore(wp, 'getQuest');
    var ChannelStore = findStore(wp, 'getAllThreadsForParent');
    var GuildChannelStore = findModule(wp, function(m) { return typeof m.getSFWDefaultChannel === 'function'; });
    var api = findAPI(wp);

    if (!QuestsStore || !api) {
      console.warn('[Discord Auto Quest] stores missing (quests=' + !!QuestsStore + ', api=' + !!api + ')');
      return;
    }

    var currentUserId = null;
    try {
      var UserStore = findStore(wp, 'getCurrentUser');
      if (UserStore) {
        var user = UserStore.getCurrentUser();
        if (user) currentUserId = user.id;
      }
    } catch (e) {}

    var active = getActiveQuests(QuestsStore).map(initQuestState);
    if (active.length === 0) {
      console.info('[Discord Auto Quest] no active quests found');
      return;
    }

    postMessage('QUEST_LIST', active.map(function(q) {
      return {
        id: q.quest.id,
        name: q.questName,
        progress: Math.floor(q.progress),
        target: q.target,
        completed: q.completed
      };
    }));

    await sleep(jitter(1000, 2000));

    for (var i = 0; i < active.length; i++) {
      var q = active[i];
      if (q.completed) continue;

      try {
        var notify = function(state) {
          postMessage('QUEST_UPDATE', {
            id: q.quest.id,
            name: q.questName,
            progress: state.progress,
            target: q.target,
            completed: state.completed
          });
        };

        var isVideo = q.taskType && q.taskType.indexOf('WATCH_VIDEO') === 0;

        if (isVideo) {
          await processVideo(q.quest, api, q.target, q.progress, notify);
        } else {
          await processHeartbeat(q.quest, q.taskType, q.target, q.progress, api, ChannelStore, GuildChannelStore, currentUserId, notify);
        }
      } catch (e) {
        console.error('[Quest ' + q.quest.id + '] ' + q.questName + ' failed:', e.message);
        notify({ progress: Math.floor(q.progress), completed: false });
      }

      if (i < active.length - 1) {
        await sleep(jitter(5000, 10000));
      }
    }

    console.info('[Discord Auto Quest] finished processing ' + active.length + ' quest(s)');
  }

  waitForWebpack()
    .then(run)
    .catch(function(e) {
      console.error('[Discord Auto Quest] webpack init failed:', e.message);
      window.__DISCORD_QUEST_RUNNING = false;
    });
})();
