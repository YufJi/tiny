__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'default', () => { return FavoriteAP; });
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _utils_bridge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/bridge */ './src/utils/bridge.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');

const { callBridge } = _ap__WEBPACK_IMPORTED_MODULE_2__.default;

const g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_4__.compareSystemVersion)('10.1.38') >= 0;
const g10150 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_4__.compareSystemVersion)('10.1.50') >= 0;
function getAppId() {
  return Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.getStartupParams)().appId;
}
function FavoriteAP() {
  const api = {
    isFavorite: {
      a: function a(res) {
        if (res.error) {
          // 不展示网关等错误信息，统一错误码为-1
          res.error = -1;
          delete res.errorMessage;
        } else {
          // 只返回isFavorite: true/false
          delete res.success;
          delete res.resultCode;
          delete res.resultMsg;
          Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_3__.mapping)(res, {
            hasKeep: 'isFavorite',
          });
        }
      },
      d: function d(_opt, cb) {
        callBridge('tinyRpc', {
          type: 'queryIsFavorite',
          requestData: [{
            appId: getAppId(),
          }],
        }, cb);
      },
    },
    addToFavorite: {
      a: function a(res) {
        // 只返回success: true/false
        delete res.resultMsg;
        delete res.resultCode;
      },

      m: 'add2Favorite',
    },
    removeFromFavorite: {
      d: function d(_opt, cb) {
        const appId = getAppId();
        callBridge('tinyRpc', {
          type: 'undoFavorite',
          requestData: [{
            appId,
            appIds: [appId],
          }],
        }, cb);
      },
      a: function a(res) {
        if (res.error) {
          // 不展示网关等错误信息，统一错误码为-1
          res.error = -1;
          delete res.errorMessage;
        } else {
          // success回调只显示success: true/false
          delete res.resultCode;
          delete res.resultMsg;
        }
      },
    },
  };
  const api10138 = g10138 ? {
    isFavorite: {
      a: function a(res) {
        if (res.error) {
          // 不展示网关等错误信息，统一错误码为-1
          res.error = -1;
          delete res.errorMessage;
        } else {
          // 只返回isFavorite: true/false
          delete res.success;
          delete res.resultCode;
          delete res.resultMsg;
          Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_3__.mapping)(res, {
            hasKeep: 'isFavorite',
          });
        }
      },
      d: function d(_opt, cb) {
        callBridge('queryIsFavorite', {}, cb);
      },
    },
    addToFavorite: {
      b: function b(opt) {
        opt.callSource = 'developer';
      },
      a: function a(res) {
        // 只返回success: true/false
        delete res.resultMsg;
        delete res.resultCode;
      },

      m: 'add2Favorite',
    },
    removeFromFavorite: {
      d: function d(_opt, cb) {
        callBridge('cancelKeepFavorite', {}, cb);
      },
      a: function a(res) {
        if (res.error) {
          // 不展示网关等错误信息，统一错误码为-1
          res.error = -1;
          delete res.errorMessage;
        } else {
          // success回调只显示success: true/false
          delete res.resultCode;
          delete res.resultMsg;
        }
      },
    },
    onFavorite: {},
    offFavorite: {},
  } : {};
  const api50 = g10150 ? {
    onInternalFavorite: {
      start: function start() {
        callBridge('favoriteNotify', {
          action: 'addFavoriteNotification',
        });
      },
    },
    offInternalFavorite: {
      end: function end() {
        callBridge('favoriteNotify', {
          action: 'removeFavoriteNotification',
        });
      },
    },
  } : {};
  return { ...api, ...api10138, ...api50 };
}
