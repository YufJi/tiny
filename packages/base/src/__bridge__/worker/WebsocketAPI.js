
__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @alipay/mp/es/utils/EventEmitter */ '../mp/es/utils/EventEmitter.js');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');

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


const { callBridge } = _ap__WEBPACK_IMPORTED_MODULE_1__.default;

let id = 0;
function SocketTask() {
  this.id = String(++id);
  this.callBackMap = {};
  this.type = 'SocketTask';
  this.emitter = new _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_2__.default();
}
const proto = SocketTask.prototype = {
  _getParams: function _getParams() {
    return {
      bizIdentifier: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_3__.getStartupParams)().appId,
      socketTaskID: this.id,
    };
  },
  _listen: function _listen(type, callback) {
    const _this = this;

    const { emitter } = this;

    emitter.on(type, callback);
    if (emitter.listenerCount(type) === 1 && !this.callBackMap[type]) {
      const listener = this.callBackMap[type] = function (e) {
        const _e$data = e.data;
        const data = _e$data === undefined ? {} : _e$data;

        if (data.socketTaskID === _this.id) {
          emitter.emit(type, e);
        }
      };
      _ap__WEBPACK_IMPORTED_MODULE_1__.default.onUserEvent(type, listener);
    }
  },
  _unListen: function _unListen(type, callback) {
    const { emitter } = this;

    emitter.off(type, callback);
    if (emitter.listenerCount(type) === 0) {
      const listener = this.callBackMap[type];
      if (listener) {
        _ap__WEBPACK_IMPORTED_MODULE_1__.default.offUserEvent(type, listener);
        delete this.callBackMap[type];
      }
    }
  },
  __doAction: function __doAction(opt, m) {
    const _a = handleCallbackParams(opt);
    const { success } = _a;
    const { fail } = _a;
    const rest = __rest(_a, ['success', 'fail']);
    const cb = function cb(res) {
      res = normalizeErrorCode(res);
      if (res && res.error) {
        fail(res);
      } else {
        success(res);
      }
    };
    callBridge(m, { ...rest, ...this._getParams() }, cb);
  },
  send: function send(opt) {
    this.__doAction(opt, 'sendSocketMessage');
  },
  close: function close(opt) {
    this.__doAction(opt, 'closeSocket');
  },
};
['Close', 'Error', 'Message', 'Open'].forEach((event) => {
  proto[`on${event}`] = function (callback) {
    this._listen(`on${this.type}${event}`, callback);
  };
  proto[`off${event}`] = function (callback) {
    this._unListen(`on${this.type}${event}`, callback);
  };
});
function noop() {}
var handleCallbackParams = function handleCallbackParams(params) {
  const _params$success = params.success;
  const success = _params$success === undefined ? noop : _params$success;
  const _params$fail = params.fail;
  const fail = _params$fail === undefined ? noop : _params$fail;
  const _params$complete = params.complete;
  const complete = _params$complete === undefined ? noop : _params$complete;
  const rest = __rest(params, ['success', 'fail', 'complete']);

  const newSuccess = function newSuccess(ret) {
    success(ret);
    complete(ret);
  };
  const newFail = function newFail(ret) {
    fail(ret);
    complete(ret);
  };
  return { success: newSuccess, fail: newFail, ...rest };
};
function normalizeErrorCode(res) {
  // 错误码强制转成数字
  if (typeof res.error === 'string') {
    res.error = parseInt(res.error, 10);
  }
  // 处理 error: 0 的情况，error 为 0 表示成功
  if (res.error === 0) {
    delete res.error;
    delete res.errorMessage;
  }
  return res;
}
/* harmony default export */ __webpack_exports__.default = ({
  connectSocket: function connectSocket(opt) {
    const _a = handleCallbackParams(opt);
    const { success } = _a;
    const { fail } = _a;
    const rest = __rest(_a, ['success', 'fail']);
    const cb = function cb(res) {
      res = normalizeErrorCode(res);
      if (res && res.error) {
        fail(res);
      } else {
        success(res);
      }
    };
    if (!opt.multiple) {
      callBridge('connectSocket', rest, cb);
      return;
    }
    const socketTask = new SocketTask();
    callBridge('connectSocket', { ...rest, ...socketTask._getParams() }, cb);
    return socketTask;
  },
});
