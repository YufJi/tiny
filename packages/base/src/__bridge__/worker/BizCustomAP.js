
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _shared_BizCustomAP__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/BizCustomAP */ "./src/bridge/shared/BizCustomAP.tsx");
/* harmony import */ var _ap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ap */ "./src/bridge/ap.worker.tsx");
/* harmony import */ var _wrapNamespace__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../wrapNamespace */ "./src/bridge/wrapNamespace.tsx");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/system */ "./src/utils/system.tsx");
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../framework/dev */ "./src/framework/dev.tsx");






var g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_4__["compareSystemVersion"])('10.1.35') >= 0;
var v10135Api = {};
if (g10135) {
    v10135Api = {
        cancelFollowLifestyle: {
            ns: 'ap',
            m: 'removeFollow'
        },
        isFollowLifestyle: {
            ns: 'ap',
            m: 'getPPFollowStatus',
            b: function b(opt) {
                opt.publicIds = [opt.publicId];
            },
            a: function a(res, opt) {
                var publicId = opt.publicId;
                res.followed = res[publicId] && res[publicId] === 'followed';
            }
        }
    };
}
/* harmony default export */ __webpack_exports__["default"] = (function () {
    var api = Object(_wrapNamespace__WEBPACK_IMPORTED_MODULE_3__["default"])({
        openTaobao: Object(_shared_BizCustomAP__WEBPACK_IMPORTED_MODULE_1__["openTaobao"])(function () {
            return _ap__WEBPACK_IMPORTED_MODULE_2__["default"].callBridge;
        })
    });
    return Object.assign({}, api, { navigateToFinance: {
            d: function d(opt) {
                opt.appId = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_5__["getStartupParams"])().appId;
                var callInternalAPI = _ap__WEBPACK_IMPORTED_MODULE_2__["default"].callInternalAPI;

                callInternalAPI('startApp', {
                    appId: '68687205',
                    param: {
                        url: '/www/index.html?options=' + encodeURIComponent(JSON.stringify(opt))
                    }
                });
            },

            ns: 'ap'
        }, navigateToAlipayPage: {
            ns: 'ap'
        } }, v10135Api);
});

