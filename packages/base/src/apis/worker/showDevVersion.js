__webpack_require__.r(__webpack_exports__);
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');

let count = 0;
let lastTime = 0;
_ap__WEBPACK_IMPORTED_MODULE_0__.default.on('titleClick', () => {
  const now = Date.now();
  if (now - lastTime < 250) {
    count++;
    if (count === 5) {
      count = 0;
      _ap__WEBPACK_IMPORTED_MODULE_0__.default.callBridge('alert', {
        title: `${_utils_system__WEBPACK_IMPORTED_MODULE_2__.SDKVersion}`,
        message: `${Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.getStartupParams)().version || Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.getStartupParams)().appVersion || '-'}`,
      });
    }
  } else {
    count = 0;
  }
  lastTime = now;
});
