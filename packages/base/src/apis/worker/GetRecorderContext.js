__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _ap_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap.worker */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_arrayBuffer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/arrayBuffer */ './src/utils/arrayBuffer.tsx');
/* harmony import */ const _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @alipay/mp/es/utils/EventEmitter */ '../mp/es/utils/EventEmitter.js');

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__.compareSystemVersion)('10.1.35') >= 0;
const g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__.compareSystemVersion)('10.1.38') >= 0;
const g10150 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__.compareSystemVersion)('10.1.50') >= 0;
const { callBridge } = _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default;

function RecorderManager() {
  if (g10138) {
    this.callBackMap = {};
    this.emitter = new _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_4__.default();
  }
}
let recorderManager;
const managerProto = RecorderManager.prototype = g10138 ? {
  _listen: function _listen(event, callback) {
    const { emitter } = this;

    emitter.on(event, callback);
    if (emitter.listenerCount(event) === 1 && !this.callBackMap[event]) {
      const listener = this.callBackMap[event] = function (e) {
        // onFrameRecorded 返回值要是个ArrayBuffer
        if (e.frameBuffer && typeof e.frameBuffer === 'string') {
          e.frameBuffer = Object(_utils_arrayBuffer__WEBPACK_IMPORTED_MODULE_3__.base64ToArrayBuffer)(e.frameBuffer);
        }
        emitter.emit(event, e);
      };
      _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.onUserEventData(event, listener);
    }
  },
  _unListen: function _unListen(event, callback) {
    const { emitter } = this;

    emitter.off(event, callback);
    if (emitter.listenerCount(event) === 0) {
      const listener = this.callBackMap[event];
      if (listener) {
        _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.offUserEventData(event, listener);
        delete this.callBackMap[event];
      }
    }
  },
} : {};
let recordEvents = ['Start', 'Stop', 'Error'];
if (g10150) {
  recordEvents = recordEvents.concat(['Pause', 'Resume']);
}
recordEvents.forEach((event) => {
  const EventType = `record${event}`;
  managerProto[`on${event}`] = function (callback) {
    _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.onUserEventData(EventType, callback);
  };
  managerProto[`off${event}`] = function (callback) {
    _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.offUserEventData(EventType, callback);
  };
});
if (g10138) {
  ['FrameRecorded'].forEach((event) => {
    managerProto[`on${event}`] = function (callback) {
      this._listen(`record${event}`, callback);
    };
    managerProto[`off${event}`] = function (callback) {
      this._unListen(`record${event}`, callback);
    };
  });
}
managerProto.start = function () {
  let params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  params = { format: 'aac', ...params };
  if (['aac', 'mp3'].indexOf(params.format) === -1) {
    throw new Error('format格式非法');
  }
  if (_utils_system__WEBPACK_IMPORTED_MODULE_2__.isAndroid && Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__.compareSystemVersion)('10.1.35') == 0) {
    callBridge('startAudioRecord', params, (res) => {
      if (res.error == 2001) {
        _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.emitUserEventData('recordError', res);
      }
    });
  } else {
    callBridge('startAudioRecord', params);
  }
};
let recordActions = ['stop'];
if (g10150) {
  recordActions = recordActions.concat(['pause', 'resume']);
}
recordActions.forEach((action) => {
  managerProto[action] = function () {
    const params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    callBridge(`${action}AudioRecord`, params);
  };
});
const api = g10135 ? {
  getRecorderManager: function getRecorderManager() {
    if (recorderManager) {
      return recorderManager;
    }
    recorderManager = new RecorderManager();
    return recorderManager;
  },
} : {};
/* harmony default export */ __webpack_exports__.default = (api);
