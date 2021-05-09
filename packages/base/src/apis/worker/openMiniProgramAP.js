__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'default', () => { return openMiniProgramAP; });
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _shared_getNavigateToMiniProgramOptions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/getNavigateToMiniProgramOptions */ './src/bridge/shared/getNavigateToMiniProgramOptions.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');

let lastAppId;
const saveLastAppid = function saveLastAppid(options) {
  if (options.referrerInfo && !options.referrerInfo._back) {
    lastAppId = options.referrerInfo.appId;
  }
};
_framework_dev__WEBPACK_IMPORTED_MODULE_0__.EventHub.addListener('foreground', saveLastAppid);
_framework_dev__WEBPACK_IMPORTED_MODULE_0__.EventHub.addListener('launch', saveLastAppid);
function openMiniProgramAP(ap) {
  return {
    navigateToMiniProgram: {
      d: function d(opt, cb) {
        ap.callBridge('navigateToMiniProgram', Object(_shared_getNavigateToMiniProgramOptions__WEBPACK_IMPORTED_MODULE_1__.default)(Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__.getStartupParams)().appId, opt), cb);
      },
    },
    navigateBackMiniProgram: {
      d: function d(opt, cb) {
        if (lastAppId) {
          const referrerInfo = {
            _back: 1,
            appId: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__.getStartupParams)().appId,
          };
          if (opt.extraData) {
            referrerInfo.extraData = opt.extraData;
          }
          const params = {
            appId: lastAppId,
            param: {
              referrerInfo: JSON.stringify(referrerInfo),
            },
          };
          if (!_utils_system__WEBPACK_IMPORTED_MODULE_2__.isAndroid) {
            params.closeCurrentApp = true;
          }
          ap.callBridge('navigateBackMiniProgram', params, cb);
          lastAppId = null;
        }
      },
    },
  };
}
