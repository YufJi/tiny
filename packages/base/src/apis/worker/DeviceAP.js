
__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _utils_bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/bridge */ './src/utils/bridge.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');


const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_3__.compareSystemVersion)('10.1.35') >= 0;
const g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_3__.compareSystemVersion)('10.1.38') >= 0;
/* harmony default export */ __webpack_exports__.default = (function (ap) {
  const { callBridge } = ap;

  const api35 = g10135 ? {
    startWifi: {},
    stopWifi: {},
    connectWifi: {},
    getWifiList: {},
    setWifiList: {},
    getConnectedWifi: {},
    onGetWifiList: {},
    offGetWifiList: {},
    onWifiConnected: {},
    offWifiConnected: {},
    onMemoryWarning: {
      start: function start() {
        callBridge('startMonitorMemoryWarning');
      },
    },
    offMemoryWarning: {
      end: function end() {
        callBridge('stopMonitorMemoryWarning');
      },
    },
    vibrateLong: {},
    vibrateShort: {},
    getHCEState: {},
    startHCE: {},
    stopHCE: {},
    onHCEMessage: {},
    offHCEMessage: {},
    sendHCEMessage: {},
  } : {};

  const api38 = g10138 ? {
    getBatteryInfo: {},
    getBatteryInfoSync: {
      m: 'getBatteryInfo',
    },
    onDeviceMotionChange: {
      start: function start() {
        callBridge('startDeviceMotionListening', {
          interval: 'ui',
        });
      },
    },
    offDeviceMotionChange: {
      end: function end() {
        callBridge('stopDeviceMotionListening');
      },
    },
  } : {};

    // interval unit: seconds
  const defaultInterval = 0.5;
  const brightnessData = {
    initialized: false,
    changed: false,
    origiBrightness: 0,
    newBrightness: 0,
  };
  const initBrightness = function initBrightness() {
    if (brightnessData.initialized) {
      return;
    }
    const foreground = function foreground() {
      if (brightnessData.changed) {
        callBridge('setScreenBrightness', {
          brightness: brightnessData.newBrightness,
        });
      }
    };
    const background = function background() {
      if (brightnessData.changed) {
        callBridge('setScreenBrightness', {
          brightness: brightnessData.origiBrightness,
        });
      }
    };
    _framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.addListener('foreground', foreground);
    _framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.addListener('background', background);
    callBridge('getScreenBrightness', {}, (res) => {
      if (res.brightness) {
        // 初始化
        brightnessData.initialized = true;
        brightnessData.origiBrightness = res.brightness;
        brightnessData.newBrightness = res.brightness;
      }
    });
  };
  const addEventCalAPI = _utils_system__WEBPACK_IMPORTED_MODULE_3__.isIOS ? {
    addEventCal: {},
  } : {};
  return { 
    addPhoneContact: {},
    getSystemInfoSync: {
      d: function d(opt) {
        return ap.callSync('getSystemInfo', opt);
      },
    },
    onGyroscopeChange: {
      start: function start() {
        callBridge('watchShake', {
          monitorGyroscope: true,
          interval: 'ui',
        });
      },
    },
    offGyroscopeChange: {
      end: function end() {
        callBridge('watchShake', { monitorGyroscope: false });
      },
    },
    onAccelerometerChange: {
      start: function start() {
        callBridge('watchShake', {
          monitorAccelerometer: true,
          interval: defaultInterval,
        });
      },
      a: function a(evt) {
        const res = {};
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(res, {
          x: 'x',
          y: 'y',
          z: 'z',
        }, typeof evt.data === 'object' ? evt.data : evt);
        return res;
      },
    },
    offAccelerometerChange: {
      end: function end() {
        callBridge('watchShake', { monitorAccelerometer: false });
      },
    },
    onCompassChange: {
      start: function start() {
        callBridge('watchShake', {
          monitorCompass: true,
          interval: defaultInterval,
        });
      },
      a: function a(evt) {
        const res = {};
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(res, {
          direction: 'direction%d',
        }, typeof evt.data === 'object' ? evt.data : evt);
        return res;
      },
    },
    offCompassChange: {
      end: function end() {
        callBridge('watchShake', { monitorCompass: false });
      },
    },
    getServerTime: {},
    makePhoneCall: {
      d: function d(opt) {
        let url = 'tel:';
        url += opt.number;
        callBridge('openInBrowser', { url });
      },
    },
    vibrate: {},
    watchShake: {},
    rsa: {},
    sendSMS: {
      a: function a(res) {
        if (res.status) {
          switch (res.status) {
            case 'Success':
              res = {};
              break;
            case 'Failed':
              res.error = 21;
              res.errorMessage = '发送失败';
              break;
            case 'Canceled':
              res.error = 22;
              res.errorMessage = '用户取消发送';
              break;
            default:
          }
          delete res.status;
        }
      },
    },
    setKeepScreenOn: {
      b: function b(opt) {
        opt.actionType = opt.keepScreenOn ? 'disable' : 'enable';
      },
      d: function d(opt, cb) {
        callBridge('setScreenAutolock', opt, cb);
      },
    },
    setClipboard: {},
    getClipboard: {},
    scan: {
      b: function b(opt) {
        if (g10138) {
          const actionTypes = ['scanAndRpc', 'scan'];
          if (!opt.actionType) {
            opt.actionType = opt.needPath === true ? 'scanAndRpc' : 'scan';
          }
          if (actionTypes.indexOf(opt.actionType) < 0) {
            opt.actionType = 'scan';
          }
        }
        opt.type = opt.type || 'qr';
      },
      a: function a(res) {
        if (res.qrCode || res.barCode) {
          res.code = res.qrCode || res.barCode;
        }
        delete res.codeContent;
        delete res.codeType;
        delete res.imageChannel;
      },
    },
    getSystemInfo: {
      a: function a(res) {
        const pixelRatio = 'pixelRatio';
        const windowWidth = 'windowWidth';
        const windowHeight = 'windowHeight';
        const language = 'language';
        if (!('error' in res)) {
          res[pixelRatio] = Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.toType)('%f', res[pixelRatio]);
          res[windowWidth] = Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.toType)('%d', res[windowWidth]);
          res[language] = (res[language] || '').replace(/\s?\w+\/((?:\w|-)+)$/, '$1');
          res[windowHeight] = Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.toType)('%d', res[windowHeight]);
        }
      },
    },
    setScreenBrightness: {
      b: function b(opt) {
        if (typeof opt.brightness === 'number') {
          initBrightness();
        }
      },
      a: function a(res, _opt, opt) {
        if (!('error' in res)) {
          brightnessData.changed = true;
          brightnessData.newBrightness = opt.brightness;
        }
      },
    },
    getScreenBrightness: {},
    ...api35,
    ...addEventCalAPI,
    ...api38 };
});
