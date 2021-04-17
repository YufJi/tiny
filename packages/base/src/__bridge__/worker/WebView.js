
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return WebView; });
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap */ "./src/bridge/ap.worker.tsx");
/* harmony import */ var _utils_getCurrentViewId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/getCurrentViewId */ "./src/utils/getCurrentViewId.tsx");



var callBridge = _ap__WEBPACK_IMPORTED_MODULE_1__["default"].callBridge;

function WebView(bridge) {
    _ap__WEBPACK_IMPORTED_MODULE_1__["default"].on('nbcomponent.webview.onFromMessage', function (e) {
        var naviApis = ['navigateTo', 'navigateBack', 'switchTab', 'reLaunch', 'redirectTo', 'getLocation'];
        var viewId = e.viewId;
        var _e$data = e.data,
            callback = _e$data.callback,
            type = _e$data.type,
            param = _e$data.param,
            element = _e$data.element;

        if (naviApis.indexOf(type) > -1) {
            var newParam = Object.assign({}, param, {
                complete: function complete(res) {
                    _ap__WEBPACK_IMPORTED_MODULE_1__["default"].callBridge('NBComponent.sendMessage', {
                        actionType: 'postMessage',
                        viewId: viewId,
                        element: element,
                        data: {
                            callback: callback,
                            res: {
                                type: 'response',
                                res: res
                            }
                        }
                    });
                }
            });
            bridge[type](newParam);
        }
        if (type === 'webViewShare') {
            callBridge('startShare', {
                bizType: 'H5App_DD',
                sendEvent: true
            });
        }
    });
    bridge.createWebViewContext = function (element) {
        var viewId = Object(_utils_getCurrentViewId__WEBPACK_IMPORTED_MODULE_2__["default"])();
        return {
            postMessage: function postMessage(data) {
                _ap__WEBPACK_IMPORTED_MODULE_1__["default"].callBridge('NBComponent.sendMessage', {
                    actionType: 'postMessage',
                    viewId: viewId,
                    element: element,
                    data: {
                        res: {
                            type: 'message',
                            data: JSON.stringify(data)
                        }
                    }
                });
            }
        };
    };
}

