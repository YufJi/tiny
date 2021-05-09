__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');

const __rest = undefined && undefined.__rest || function (s, e) {
  const t = {};
  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  } if (s != null && typeof Object.getOwnPropertySymbols === 'function') {
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }
  } return t;
};

const { callInternalAPI } = _ap__WEBPACK_IMPORTED_MODULE_3__.default;

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__.compareSystemVersion)('10.1.35') >= 0;

const _getStartupParams = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.getStartupParams)();
const { appId } = _getStartupParams;

const callFn = function callFn(opt, cb) {
  callInternalAPI('mprpc', {
    operationType: 'com.alipay.openapi.jsapi.invoke',
    requestData: [{ appId, ...opt }],
  }, cb);
};
const noop = function noop() {};
const api = {};
if (g10135) {
  ['getOpenUserInfo', 'getPhoneNumber', 'getIDNumber'].forEach((method) => {
    api[method] = function (params) {
      const _params$success = params.success;
      const success = _params$success === undefined ? noop : _params$success;
      const _params$fail = params.fail;
      const fail = _params$fail === undefined ? noop : _params$fail;
      const _params$complete = params.complete;
      const complete = _params$complete === undefined ? noop : _params$complete;
      const rest = __rest(params, ['success', 'fail', 'complete']);

      callFn({ method, ...rest }, (res) => {
        if (res.error !== undefined) {
          if (fail) {
            fail(res);
          }
        } else if (success) {
          success(res);
        }
        if (complete) {
          complete(res);
        }
      });
    };
  });
}
/* harmony default export */ __webpack_exports__.default = (api);
