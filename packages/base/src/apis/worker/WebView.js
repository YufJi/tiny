__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'default', () => { return WebView; });
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _utils_getCurrentViewId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/getCurrentViewId */ './src/utils/getCurrentViewId.tsx');

const { callBridge } = _ap__WEBPACK_IMPORTED_MODULE_1__.default;

function WebView(bridge) {
  _ap__WEBPACK_IMPORTED_MODULE_1__.default.on('nbcomponent.webview.onFromMessage', (e) => {
    const naviApis = ['navigateTo', 'navigateBack', 'switchTab', 'reLaunch', 'redirectTo', 'getLocation'];
    const { viewId } = e;
    const _e$data = e.data;
    const { callback } = _e$data;
    const { type } = _e$data;
    const { param } = _e$data;
    const { element } = _e$data;

    if (naviApis.indexOf(type) > -1) {
      const newParam = { ...param,
        complete: function complete(res) {
          _ap__WEBPACK_IMPORTED_MODULE_1__.default.callBridge('NBComponent.sendMessage', {
            actionType: 'postMessage',
            viewId,
            element,
            data: {
              callback,
              res: {
                type: 'response',
                res,
              },
            },
          });
        } };
      bridge[type](newParam);
    }
    if (type === 'webViewShare') {
      callBridge('startShare', {
        bizType: 'H5App_DD',
        sendEvent: true,
      });
    }
  });
  bridge.createWebViewContext = function (element) {
    const viewId = Object(_utils_getCurrentViewId__WEBPACK_IMPORTED_MODULE_2__.default)();
    return {
      postMessage: function postMessage(data) {
        _ap__WEBPACK_IMPORTED_MODULE_1__.default.callBridge('NBComponent.sendMessage', {
          actionType: 'postMessage',
          viewId,
          element,
          data: {
            res: {
              type: 'message',
              data: JSON.stringify(data),
            },
          },
        });
      },
    };
  };
}
