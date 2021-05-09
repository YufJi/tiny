__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./api */ './src/web-view/embed/api.tsx');
/* harmony import */ const _utils_bridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/bridge */ './src/utils/bridge.tsx');
/* harmony import */ const _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/objectKeys */ './src/utils/objectKeys.tsx');

const promise = new Promise(((resolve) => {
  if (window.JSBridge) {
    resolve();
  } else {
    document.addEventListener('JSBridgeReady', resolve);
  }
}));
let id = 0;
const callPool = {};
const g = self;
const noop = function noop() {};
const handleParamsBeforeCall = function handleParamsBeforeCall(param, apiName) {
  const newParam = { ...param };
  const apiConfig = _api__WEBPACK_IMPORTED_MODULE_1__.API[apiName];
  const callbackParam = {
    success: newParam.success || noop,
    fail: newParam.fail || noop,
    complete: newParam.complete || noop,
  };
  delete newParam.success;
  delete newParam.fail;
  delete newParam.complete;
  if (apiConfig && apiConfig.b) {
    apiConfig.b(newParam);
  }
  return {
    newParam,
    callbackParam,
    apiName: apiConfig.m ? apiConfig.m : apiName,
  };
};
const my = {
  call: function call() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    promise.then(() => {
      let _g$JSBridge;

      (_g$JSBridge = g.JSBridge).call.apply(_g$JSBridge, args);
    });
  },
  postMessage: function postMessage(detail) {
    promise.then(() => {
      const postDta = {
        type: 'message',
        detail,
      };
      g.JSBridge.call('postWebViewMessage', postDta);
    });
  },
  getEnv: function getEnv(callback) {
    // 代表注入了JSBridge
    if (navigator.userAgent.indexOf('Nebula') === -1) {
      if (callback) {
        callback({ miniprogram: false });
      }
    } else {
      promise.then(() => {
        g.JSBridge.call('getEmbedWebViewEnv', (res) => {
          if (callback) {
            callback(res);
          }
        });
      });
    }
  },
  startShare: function startShare() {
    const webViewShareParam = {
      type: 'webViewShare',
    };
    g.JSBridge.call('postWebViewMessage', webViewShareParam);
  },
};
_api__WEBPACK_IMPORTED_MODULE_1__.workerAPI.forEach((apiName) => {
  my[apiName] = function (param) {
    promise.then(() => {
      const newParam = { ...param };
      if (newParam.success || newParam.complete || newParam.fail) {
        callPool[++id] = { ...newParam };
        delete newParam.success;
        delete newParam.complete;
        delete newParam.fail;
      }
      g.JSBridge.call('postWebViewMessage', {
        type: apiName,
        callback: id,
        param: newParam,
      });
    });
  };
});
Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__.default)(_api__WEBPACK_IMPORTED_MODULE_1__.API).forEach((apiName) => {
  const apiConfig = _api__WEBPACK_IMPORTED_MODULE_1__.API[apiName] || {};
  const hasCallback = apiConfig.callback !== false;
  my[apiName] = function (param) {
    const paramObj = handleParamsBeforeCall(param, apiName);
    promise.then(() => {
      if (apiConfig.d) {
        apiConfig.d(paramObj.newParam);
      } else if (param === undefined) {
        g.JSBridge.call(paramObj.apiName);
      } else {
        const callBridge = g.JSBridge.call.bind(g.JSBridge, paramObj.apiName, paramObj.newParam);
        const cb = function cb(originRes) {
          const res = originRes;
          if (apiConfig.a) {
            apiConfig.a(res);
          }
          Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_2__.apCallback)(paramObj.callbackParam, res);
        };
        hasCallback ? callBridge(cb) : callBridge();
      }
    });
  };
});
document.addEventListener('onToWebViewMessage', (e) => {
  const _e$data = e.data;
  const { callback } = _e$data;
  const { res } = _e$data;

  if (res.type === 'response') {
    if (callPool[callback]) {
      Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_2__.apCallback)(callPool[callback], res.res);
      delete callPool[callback];
    }
  } else if (res.type === 'message') {
    if (my.onMessage) {
      my.onMessage(JSON.parse(res.data));
    }
  }
});
/* harmony default export */ __webpack_exports__.default = (my);
