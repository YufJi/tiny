
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @alipay/mp/es/utils/EventEmitter */ "../mp/es/utils/EventEmitter.js");
/* harmony import */ var _ap_worker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ap.worker */ "./src/bridge/ap.worker.tsx");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/system */ "./src/utils/system.tsx");
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../framework/dev */ "./src/framework/dev.tsx");





var g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_3__["compareSystemVersion"])('10.1.35') >= 0;
var callBridge = _ap_worker__WEBPACK_IMPORTED_MODULE_2__["default"].callBridge;

function createWorker(url) {
    var worker = new Worker();
    callBridge('createWorker', Object.assign({ scriptPath: url }, worker._getParams()));
    return worker;
}
var id = 0;
function Worker() {
    this.id = String(++id);
    this.callBackMap = {};
    this.emitter = new _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__["default"]();
}
Worker.prototype = {
    _getParams: function _getParams() {
        return {
            bizIdentifier: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_4__["getStartupParams"])().appId,
            workerId: this.id
        };
    },
    _unListen: function _unListen(type, callback) {
        var emitter = this.emitter;

        emitter.off(type, callback);
        if (emitter.listenerCount(type) === 0) {
            var listener = this.callBackMap[type];
            if (listener) {
                _ap_worker__WEBPACK_IMPORTED_MODULE_2__["default"].offUserEventData(type, listener);
                delete this.callBackMap[type];
            }
        }
    },
    _listen: function _listen(type, callback) {
        var _this = this;

        var emitter = this.emitter;

        emitter.on(type, callback);
        if (emitter.listenerCount(type) === 1 && !this.callBackMap[type]) {
            var listener = this.callBackMap[type] = function () {
                var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                if (data.workerId === _this.id) {
                    emitter.emit(type, data.message);
                }
            };
            _ap_worker__WEBPACK_IMPORTED_MODULE_2__["default"].onUserEventData(type, listener);
        }
    },
    postMessage: function postMessage(message) {
        callBridge('multiWorkerPostMessage', Object.assign({ message: message }, this._getParams()));
    },
    onMessage: function onMessage(callback) {
        this._listen('multiWorkerMessage', callback);
    },
    offMessage: function offMessage(callback) {
        this._unListen('multiWorkerMessage', callback);
    },
    terminate: function terminate() {
        var _this2 = this;

        callBridge('multiWorkerTerminate', Object.assign({}, this._getParams()));
        Object.keys(this.callBackMap).forEach(function (k) {
            _ap_worker__WEBPACK_IMPORTED_MODULE_2__["default"].offUserEvent(k, _this2.callBackMap[k]);
        });
    }
};
var api35 = g10135 ? {
    createWorker: createWorker
} : {};
/* harmony default export */ __webpack_exports__["default"] = (Object.assign({}, api35));

