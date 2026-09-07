(function() {
  'use strict';

  var UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Discord/1.0.0 Chrome/120.0.0.0 Electron/28.0.0 Safari/537.36';

  function define(obj, prop, value) {
    try {
      Object.defineProperty(obj, prop, { get: function() { return value; }, configurable: true });
    } catch (e) {}
  }

  try {
    define(navigator, 'userAgent', UA);
    define(navigator, 'appVersion', '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Discord/1.0.0 Chrome/120.0.0.0 Electron/28.0.0 Safari/537.36');
    define(navigator, 'appName', 'Netscape');
    define(navigator, 'appCodeName', 'Mozilla');
    define(navigator, 'product', 'Gecko');
    define(navigator, 'productSub', '20100101');
    define(navigator, 'vendor', 'Google Inc.');
    define(navigator, 'vendorSub', '');
    define(navigator, 'platform', 'Win32');
    define(navigator, 'oscpu', 'Windows NT 10.0; Win64; x64');
    define(navigator, 'language', 'en-US');
    define(navigator, 'languages', ['en-US', 'en']);
    define(navigator, 'cookieEnabled', true);
    define(navigator, 'pdfViewerEnabled', true);
    define(navigator, 'onLine', true);
    define(navigator, 'hardwareConcurrency', 8);
    define(navigator, 'deviceMemory', 8);
    define(navigator, 'maxTouchPoints', 0);

    try {
      Object.defineProperty(navigator, 'webdriver', { get: function() { return undefined; }, configurable: true });
    } catch (e) {}

    try {
      Object.defineProperty(navigator, 'plugins', {
        get: function() {
          var arr = [
            { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format', length: 1 },
            { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '', length: 1 },
            { name: 'Native Client', filename: 'internal-nacl-plugin', description: '', length: 1 }
          ];
          arr.item = function(i) { return this[i] || null; };
          arr.namedItem = function(n) { for (var i = 0; i < this.length; i++) { if (this[i].name === n) return this[i]; } return null; };
          arr.refresh = function() {};
          return arr;
        },
        configurable: true
      });
    } catch (e) {}

    try {
      Object.defineProperty(navigator, 'mimeTypes', {
        get: function() {
          var arr = [
            { type: 'application/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: navigator.plugins[0] },
            { type: 'text/pdf', suffixes: 'pdf', description: 'Portable Document Format', enabledPlugin: navigator.plugins[0] }
          ];
          arr.item = function(i) { return this[i] || null; };
          arr.namedItem = function(n) { for (var i = 0; i < this.length; i++) { if (this[i].type === n) return this[i]; } return null; };
          return arr;
        },
        configurable: true
      });
    } catch (e) {}

    try {
      Object.defineProperty(navigator, 'permissions', {
        get: function() {
          return {
            query: function(p) {
              var denied = ['clipboard-read', 'clipboard-write', 'persistent-storage', 'background-sync', 'nfc', 'display-capture'];
              var state = denied.indexOf(p.name) >= 0 ? 'denied' : 'prompt';
              return Promise.resolve({ state: state, onchange: null });
            }
          };
        },
        configurable: true
      });
    } catch (e) {}

    try {
      if (navigator.mediaDevices) {
        Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', {
          get: function() { return function() {
            return Promise.resolve([
              { deviceId: '', kind: 'audioinput', label: '', groupId: '' },
              { deviceId: '', kind: 'audiooutput', label: '', groupId: '' },
              { deviceId: '', kind: 'videoinput', label: '', groupId: '' }
            ]);
          };},
          configurable: true
        });
      }
    } catch (e) {}

    try {
      if (navigator.connection) {
        define(navigator.connection, 'effectiveType', '4g');
        define(navigator.connection, 'rtt', 100);
        define(navigator.connection, 'downlink', 10);
        define(navigator.connection, 'saveData', false);
      }
    } catch (e) {}

    try {
      if (window.screen) {
        define(screen, 'width', 1920);
        define(screen, 'height', 1080);
        define(screen, 'availWidth', 1920);
        define(screen, 'availHeight', 1040);
        define(screen, 'colorDepth', 24);
        define(screen, 'pixelDepth', 24);
        define(screen, 'orientation', { type: 'landscape-primary', angle: 0 });
      }
    } catch (e) {}

    try {
      if (window.history && window.history.length === 1) {
        Object.defineProperty(history, 'length', { get: function() { return 3; }, configurable: true });
      }
    } catch (e) {}

    try {
      if (navigator.userAgentData) {
        var uaData = {
          brands: [
            { brand: 'Google Chrome', version: '120' },
            { brand: 'Chromium', version: '120' },
            { brand: 'Not.A/Brand', version: '24' }
          ],
          mobile: false,
          platform: 'Windows',
          getHighEntropyValues: function(hints) {
            var result = {
              brands: this.brands,
              mobile: false,
              platform: 'Windows'
            };
            for (var i = 0; i < hints.length; i++) {
              switch (hints[i]) {
                case 'architecture': result.architecture = 'x64'; break;
                case 'bitness': result.bitness = '64'; break;
                case 'model': result.model = ''; break;
                case 'platformVersion': result.platformVersion = '10.0'; break;
                case 'uaFullVersion': result.uaFullVersion = '120.0.0.0'; break;
                case 'fullVersionList': result.fullVersionList = this.brands; break;
              }
            }
            return Promise.resolve(result);
          },
          toJSON: function() { return { brands: this.brands, mobile: false, platform: 'Windows' }; }
        };
        Object.defineProperty(navigator, 'userAgentData', {
          get: function() { return uaData; },
          configurable: true
        });
      }
    } catch (e) {}

    console.info('[Discord Auto Quest] enhanced fingerprint override active');
  } catch (e) {
    console.warn('[Discord Auto Quest] fingerprint override error:', e.message);
  }
})();
