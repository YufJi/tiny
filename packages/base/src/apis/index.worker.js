import { $global, getCurrentPageImpl } from '@/core/framework/';
import { compareSystemVersion, SDKVersion, logSystemInfo } from '@/utils/system';
import upperFirstChar from '@/utils/upperFirstChar';
import objectKeys from '@/utils/objectKeys';
import extraAPIMap from '@/utils/extraAPIMap';
import loadExtraRes from '@/utils/loadExtraRes';
import {
  CUSTOM_WORKER_ERROR,
} from '@/utils/errorCodes';
import reportError from '@/utils/reportError';
import { apCallback } from '@/utils/bridge';

import NavigationAPI from './NavigationAPI';
import listen from './listen';
import callRender from './callRender';

import ap from './ap';
import canIUse from './worker/canIUse';
import createSelectorQuery from './worker/createSelectorQuery';
import CanvasAPI from './worker/canvas/CanvasAPI';
import Animation from './worker/Animation';

const { 
  callBridge, 
  callBridgeSync, 
  callInternalAPI, 
  callInternalAPISync,
} = ap;

const g = self;

const bridge = {
  renderTarget: 'web',
  on(name, fn) {
    ap.onUserEvent(name, fn);
    return {
      remove: function remove() {
        ap.offUserEvent(name, fn);
      },
    };
  },
  // for test
  emit(...args) {
    ap.emitUserEvent.call(ap, ...args);
  },
  call(...args) {
    callBridge.call(ap, ...args);
  },
  callSync(...args) {
    callBridgeSync.call(ap, ...args);
  },
  ...NavigationAPI,
  // for internal call render
  postMessage(data) {
    callRender('fireMessage', {
      args: [data],
    });
  },
  createAnimation(config = {}) {
    return new Animation(config);
  },
  pageScrollTo(...args) {
    callRender('pageScrollTo', {
      args,
    });
  },

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
  canIUse(name) {
    return canIUse(bridge, name);
  },
  createSelectorQuery,
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
  ...CanvasAPI,
  // createMapContext(element) {
  //   return new _worker_MapContext__WEBPACK_IMPORTED_MODULE_7__.default({
  //     element,
  //     page: getCurrentPageImpl(),
  //   });
  // },
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
};

listen(ap, bridge);

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
          console.error(`API mp.${item} not found`);
        }
      }
    },
  });
});

logSystemInfo();
$global.bridge = bridge;

export default bridge;
