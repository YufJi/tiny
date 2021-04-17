

import invalidNavigateTo from './invalidNavigateTo';
import bridge from '@hulk/mp-core/es/bridge';
import { getCurrentPageImpl, $global } from '../framework/dev';
import ap from './ap';
import api from './api'; // 加载api
import { compareSystemVersion, SDKVersion, logSystemInfo } from '../utils/system';
import upperFirstChar from '../utils/upperFirstChar';
import objectKeys from '../utils/objectKeys';
import extraAPIMap from '../utils/extraAPIMap';
import loadExtraRes from '../utils/loadExtraRes';
import {
  CUSTOM_WORKER_ERROR,
} from '../utils/errorCodes';
import reportError from '../utils/reportError';
import getCurrentViewId from '../utils/getCurrentViewId';
import { apCallback } from '../utils/bridge';
import canIUse from './worker/canIUse';
import createSelectorQuery from './worker/createSelectorQuery';
import CanvasAPI from './worker/canvas/CanvasAPI';

const { callBridge, callBridgeSync, callInternalAPI, callInternalAPISync } = ap;

const g10135 = compareSystemVersion('10.1.35') >= 0;
const api10135 = g10135 ? {
  // createCameraContext: function createCameraContext(element) {
  //   return new _worker_CameraContext__WEBPACK_IMPORTED_MODULE_6__.default({
  //     element,
  //     page: getCurrentPageImpl(),
  //   });
  // },
  // createLivePlayerContext: function createLivePlayerContext(element) {
  //   return new _worker_LivePlayerContext__WEBPACK_IMPORTED_MODULE_8__.default({
  //     element,
  //     page: getCurrentPageImpl(),
  //   });
  // },
  // createLivePusherContext: function createLivePusherContext(element) {
  //   return new _worker_LivePusherContext__WEBPACK_IMPORTED_MODULE_9__.default({
  //     element,
  //     page: getCurrentPageImpl(),
  //   });
  // },
  // createLottieContext: function createLottieContext(element) {
  //   return new _worker_LottieContext__WEBPACK_IMPORTED_MODULE_10__.default({
  //     element,
  //     page: getCurrentPageImpl(),
  //   });
  // },
} : {};

const g = self;
const { mpRuntimeConfig = {} } = g;

const callBlacklist = ['openInBrowser', 'internalAPI'];

Object.assign(bridge, {

  SDKVersion,
  // for canvas web
  __emit(...args) {
    ap.emit.apply(ap, args);
  },
  preloadResource(res) {
    if (typeof fetch === 'function' && res.indexOf('alipay.kylinbridge') === -1) {
      fetch(res);
    }
  },
  getExtConfigSync() {
    return g.mpAppJson && g.mpAppJson.app && g.mpAppJson.app.ext;
  },
  navigateTo(params) {
    if (invalidNavigateTo(params)) {
      return;
    }
    bridge.navigateTo({ ...params, viewId: getCurrentViewId() });
  },
  canIUse(name) {
    return canIUse(bridge, name);
  },
  ...CanvasAPI,
  createSelectorQuery,
  // ..._worker_MiniServiceAPI__WEBPACK_IMPORTED_MODULE_21__.default,
  // ..._worker_setOptionMenuAPI__WEBPACK_IMPORTED_MODULE_25__.default,
  // ..._worker_GetAuthorizeAPI__WEBPACK_IMPORTED_MODULE_17__.default,
  // ..._worker_GetRecorderContext__WEBPACK_IMPORTED_MODULE_15__.default,
  // ..._worker_GetUpdateManager__WEBPACK_IMPORTED_MODULE_16__.default,
  // ..._worker_FileSystemManager__WEBPACK_IMPORTED_MODULE_29__.default,
  // ..._worker_IntersectionObserver__WEBPACK_IMPORTED_MODULE_27__.default,
    // ..._worker_EnvAPI__WEBPACK_IMPORTED_MODULE_23__.default,
  // ..._worker_CustomWorkerAPI__WEBPACK_IMPORTED_MODULE_24__.default,
  // ..._worker_WebsocketAPI__WEBPACK_IMPORTED_MODULE_22__.default,
  // ..._worker_NetworkAPI__WEBPACK_IMPORTED_MODULE_28__.default,
    // ..._worker_AudioAPI__WEBPACK_IMPORTED_MODULE_14__.default,
  // ..._worker_VideoAPI__WEBPACK_IMPORTED_MODULE_13__.default,
  // ..._worker_TrackerAPI__WEBPACK_IMPORTED_MODULE_11__.default,
  loadFontFace(params) {
    const { page } = params;

    let config;
    if (page) {
      config = {
        viewId: page.$viewId,
      };
    }

    const { success, fail, complete, ...data } = params;

    (page || getCurrentPageImpl()).callRemote('bridge', 'loadFontFace', data, (res) => {
      success && success(res);
      complete && complete(res);
    }, (error) => {
      fail && fail(error);
      complete && complete(error);
    });
  },
  // createMapContext(element) {
  //   return new _worker_MapContext__WEBPACK_IMPORTED_MODULE_7__.default({
  //     element,
  //     page: getCurrentPageImpl(),
  //   });
  // },
  stopPullDownRefresh(params = {}) {
    let config;
    const { page } = params;

    if (page) {
      config = {
        viewId: page.$viewId,
      };
    }
    callBridge('restorePullToRefresh', config);
    apCallback(params);
  },
  hideKeyboard(params = {}) {
    let config;
    const { page } = params;

    if (page) {
      config = {
        viewId: page.$viewId,
      };
    }
    // custom keyboard
    callInternalAPI('hideCustomKeyBoard', config);
    (page || getCurrentPageImpl()).callRemote('bridge', 'hideKeyboard');
  },
  ...api,
  ...api10135,
  __reportFrameworkPerf: function __reportFrameworkPerf(loadTime) {
    callInternalAPI('onAppPerfEvent', {
      state: 'workerFrameworkLoaded',
      loadTime,
    });
  },
  reportCustomError(error) {
    reportError(CUSTOM_WORKER_ERROR, {
      col: error.column,
      line: error.line,
      msg: error.message,
      url: error.sourceURL,
      error: {
        column: error.column,
        line: error.line,
        message: error.message,
        sourceURL: error.sourceURL,
      },
    });
  },
  call(name, _params = {}, _callback) {
    if (name === 'reportData' && _params && _params.spm && typeof _params.spm === 'object') {
      callBridge('pageMonitor', {
        actionType: 'end',
      });
    }
    if (mpRuntimeConfig.blacklistAPI === false || callBlacklist.indexOf(name) === -1) {
      let params = _params;
      let callback = _callback;
      if (typeof params === 'function') {
        callback = params;
        params = {};
      }
      const newParams = { ...params };
      if (newParams.page) {
        newParams.viewId = newParams.page.$viewId;
        delete newParams.page;
      }
      if (newParams.success) {
        delete newParams.success;
      }
      if (newParams.fail) {
        delete newParams.fail;
      }
      if (newParams.complete) {
        delete newParams.complete;
      }
      callBridge(name, newParams, (res) => {
        if (res && res.error) {
          if (params.fail) {
            params.fail(res);
          }
        } else if (params.success) {
          params.success(res);
        }
        if (params.complete) {
          params.complete(res);
        }
        if (callback) {
          callback(res);
        }
      });
    }
  },
});

// Object(_worker_WebView__WEBPACK_IMPORTED_MODULE_26__.default)(bridge);
objectKeys(extraAPIMap).forEach((item) => {
  const APIName = item.split('.');
  const ns = APIName.length === 2 ? APIName[0] : undefined;
  const realAPIName = APIName.length === 2 ? APIName[1] : APIName[0];
  let targetBridge = bridge;
  if (ns) {
    targetBridge = bridge[ns] || {};
  }
  Object.defineProperty(targetBridge, realAPIName, {
    enumerable: true,
    value: function value(params) {
      const extraAPIName = upperFirstChar(realAPIName);
      if (g[`MP${extraAPIName}`]) {
        g[`MP${extraAPIName}`](params, {
          callBridge,
          callBridgeSync,
        });
      } else {
        loadExtraRes(extraAPIMap[item]);
        if (g[`MP${extraAPIName}`]) {
          g[`MP${extraAPIName}`](params, {
            callBridge,
            callBridgeSync,
          });
        } else {
          console.error(`API my.${item} not found`);
        }
      }
    },
  });
});
// bridge = Object(_worker_logAPI__WEBPACK_IMPORTED_MODULE_18__.default)(bridge);
logSystemInfo();
$global.bridge = bridge;

export default bridge;
