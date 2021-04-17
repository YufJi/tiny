
__webpack_require__.r(__webpack_exports__);
/* harmony import */ const _utils_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/types */ './src/utils/types.tsx');
/* harmony import */ const _utils_bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/bridge */ './src/utils/bridge.tsx');
/* harmony import */ const _wrapNamespace__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../wrapNamespace */ './src/bridge/wrapNamespace.tsx');


/* harmony default export */ __webpack_exports__.default = (function (ap) {
  const { callBridge } = ap;

  const api = {
    tradePay: {},
    getUserInfo: {
      a: function a(res) {
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(res, {
          iconUrl: 'avatar',
        });
      },
    },
    getAuthCode: {
      b: function b(opt) {
        if (typeof opt.scopes === 'string') {
          opt.scopeNicks = [opt.scopes];
        } else if (Object(_utils_types__WEBPACK_IMPORTED_MODULE_0__.isArray)(opt.scopes)) {
          opt.scopeNicks = opt.scopes;
        } else {
          opt.scopeNicks = ['auth_base'];
        }
        delete opt.scopes;
      },
      a: function a(res) {
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(res, {
          authcode: 'authCode',
        });
      },
    },
    getAuthUserInfo: {
      a: function a(res) {
        Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__.mapping)(res, {
          nick: 'nickName',
          userAvatar: 'avatar',
        });
      },
    },
    startZMVerify: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'zm-service',
          param: JSON.stringify({
            zmType: 'zm-verify',
            bizNo: opt.bizNo,
          }),
        }, cb);
      },
    },
    ARScan: {
      d: function d(_opt, cb) {
        callBridge('startApp', {
          appId: '10000007',
          param: {
            selectedTab: 'ar',
            showOthers: 'YES',
            clientVersion: '10.0.8',
          },
        }, cb);
      },
    },
    addCardAuth: {
      d: function d(opt, cb) {
        callBridge('startBizService', {
          name: 'add-card',
          param: JSON.stringify({
            url: opt.url,
          }),
        }, cb);
      },
    },
    openSetting: {},
    getSetting: {},
  };
  return Object(_wrapNamespace__WEBPACK_IMPORTED_MODULE_2__.default)(api);
});
