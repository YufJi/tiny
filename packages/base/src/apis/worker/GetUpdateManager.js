__webpack_require__.r(__webpack_exports__);
/* harmony import */ const _ap_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ap.worker */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/upperFirstChar */ './src/utils/upperFirstChar.tsx');

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_1__.compareSystemVersion)('10.1.35') >= 0;
const { callBridge } = _ap_worker__WEBPACK_IMPORTED_MODULE_0__.default;

function UpdateManager() {
  callBridge('registerUpdateManager');
}
let updateManager;
const managerProto = UpdateManager.prototype = {};
['checkForUpdate', 'updateReady', 'updateFailed'].forEach((event) => {
  const EventType = Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__.default)(event);
  managerProto[`on${EventType}`] = function (callback) {
    _ap_worker__WEBPACK_IMPORTED_MODULE_0__.default.onUserEventData(event, callback);
  };
  managerProto[`off${EventType}`] = function (callback) {
    _ap_worker__WEBPACK_IMPORTED_MODULE_0__.default.offUserEventData(event, callback);
  };
});
['applyUpdate'].forEach((m) => {
  managerProto[m] = function () {
    callBridge(m);
  };
});
const api = g10135 ? {
  getUpdateManager: function getUpdateManager() {
    if (updateManager) {
      return updateManager;
    }
    updateManager = new UpdateManager();
    return updateManager;
  },
} : {};
/* harmony default export */ __webpack_exports__.default = (api);
