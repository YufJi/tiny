
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _ap_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ap.worker */ "./src/bridge/ap.worker.tsx");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/system */ "./src/utils/system.tsx");
/* harmony import */ var _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/upperFirstChar */ "./src/utils/upperFirstChar.tsx");



var g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_1__["compareSystemVersion"])('10.1.35') >= 0;
var callBridge = _ap_worker__WEBPACK_IMPORTED_MODULE_0__["default"].callBridge;

function UpdateManager() {
    callBridge('registerUpdateManager');
}
var updateManager ;
var managerProto = UpdateManager.prototype = {};
['checkForUpdate', 'updateReady', 'updateFailed'].forEach(function (event) {
    var EventType = Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__["default"])(event);
    managerProto['on' + EventType] = function (callback) {
        _ap_worker__WEBPACK_IMPORTED_MODULE_0__["default"].onUserEventData(event, callback);
    };
    managerProto['off' + EventType] = function (callback) {
        _ap_worker__WEBPACK_IMPORTED_MODULE_0__["default"].offUserEventData(event, callback);
    };
});
['applyUpdate'].forEach(function (m) {
    managerProto[m] = function () {
        callBridge(m);
    };
});
var api = g10135 ? {
    getUpdateManager: function getUpdateManager() {
        if (updateManager) {
            return updateManager;
        }
        updateManager = new UpdateManager();
        return updateManager;
    }
} : {};
/* harmony default export */ __webpack_exports__["default"] = (api);

