__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @alipay/mp/es/utils/EventEmitter */ '../mp/es/utils/EventEmitter.js');
/* harmony import */ const _ap_worker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ap.worker */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_3__.compareSystemVersion)('10.1.35') >= 0;
const { callBridge } = _ap_worker__WEBPACK_IMPORTED_MODULE_2__.default;

function createWorker(url) {
  const worker = new Worker();
  callBridge('createWorker', { scriptPath: url, ...worker._getParams() });
  return worker;
}
let id = 0;
function Worker() {
  this.id = String(++id);
  this.callBackMap = {};
  this.emitter = new _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__.default();
}
Worker.prototype = {
  _getParams: function _getParams() {
    return {
      bizIdentifier: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_4__.getStartupParams)().appId,
      workerId: this.id,
    };
  },
  _unListen: function _unListen(type, callback) {
    const { emitter } = this;

    emitter.off(type, callback);
    if (emitter.listenerCount(type) === 0) {
      const listener = this.callBackMap[type];
      if (listener) {
        _ap_worker__WEBPACK_IMPORTED_MODULE_2__.default.offUserEventData(type, listener);
        delete this.callBackMap[type];
      }
    }
  },
  _listen: function _listen(type, callback) {
    const _this = this;

    const { emitter } = this;

    emitter.on(type, callback);
    if (emitter.listenerCount(type) === 1 && !this.callBackMap[type]) {
      const listener = this.callBackMap[type] = function () {
        const data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (data.workerId === _this.id) {
          emitter.emit(type, data.message);
        }
      };
      _ap_worker__WEBPACK_IMPORTED_MODULE_2__.default.onUserEventData(type, listener);
    }
  },
  postMessage: function postMessage(message) {
    callBridge('multiWorkerPostMessage', { message, ...this._getParams() });
  },
  onMessage: function onMessage(callback) {
    this._listen('multiWorkerMessage', callback);
  },
  offMessage: function offMessage(callback) {
    this._unListen('multiWorkerMessage', callback);
  },
  terminate: function terminate() {
    const _this2 = this;

    callBridge('multiWorkerTerminate', { ...this._getParams() });
    Object.keys(this.callBackMap).forEach((k) => {
      _ap_worker__WEBPACK_IMPORTED_MODULE_2__.default.offUserEvent(k, _this2.callBackMap[k]);
    });
  },
};
const api35 = g10135 ? {
  createWorker,
} : {};
/* harmony default export */ __webpack_exports__.default = ({ ...api35 });
