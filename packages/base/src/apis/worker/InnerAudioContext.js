
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ap_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap.worker */ "./src/bridge/ap.worker.tsx");
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../framework/dev */ "./src/framework/dev.tsx");
/* harmony import */ var _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @alipay/mp/es/utils/EventEmitter */ "../mp/es/utils/EventEmitter.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/objectKeys */ "./src/utils/objectKeys.tsx");





var callBridge = _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].callBridge,
    callBridgeSync = _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].callBridgeSync;

var id = 0;
function InnerAudioContext(_ref) {
    var _this = this;

    var writes = _ref.writes,
        reads = _ref.reads,
        type = _ref.type;

    this.id = String(++id);
    this.callBackMap = {};
    this.writes = writes;
    this.reads = reads;
    this.type = type;
    this.emitter = new _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_3__["default"]();
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(this.writes).forEach(function (r) {
        Object.defineProperty(_this, r, {
            set: function set(v) {
                var _option;

                if (this.writes[r].v && this.writes[r].v(v)) {
                    return;
                }
                this['_' + r] = v;
                callBridge('set' + this.type + 'Option', Object.assign({}, this._getParams(), { option: (_option = {}, _option[r] = v, _option) }));
            },
            get: function get() {
                if ('_' + r in this) {
                    return this['_' + r];
                }
                return callBridgeSync('get' + this.type + 'Option', Object.assign({}, this._getParams(), { optionName: r }))[r];
            }
        });
    });
    this.reads.forEach(function (r) {
        Object.defineProperty(_this, r, {
            get: function get() {
                return callBridgeSync('get' + this.type + 'Option', Object.assign({}, this._getParams(), { optionName: r }))[r];
            }
        });
    });
}
var innerProto = InnerAudioContext.prototype = {
    _getParams: function _getParams() {
        return {
            bizIdentifier: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__["getStartupParams"])().appId,
            audioPlayerID: this.id
        };
    },
    _listen: function _listen(type, callback) {
        var _this2 = this;

        var emitter = this.emitter;

        emitter.on(type, callback);
        if (emitter.listenerCount() === 1) {
            callBridge('startMonitor' + this.type, this._getParams());
        }
        if (emitter.listenerCount(type) === 1 && !this.callBackMap[type]) {
            var listener = this.callBackMap[type] = function (e) {
                var _e$data = e.data,
                    data = _e$data === undefined ? {} : _e$data;

                if (!data.audioPlayerID || data.audioPlayerID === _this2.id) {
                    emitter.emit(type, e);
                }
            };
            _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].onUserEvent(type, listener);
        }
    },
    _unListen: function _unListen(type, callback) {
        var emitter = this.emitter;

        emitter.off(type, callback);
        if (emitter.listenerCount(type) === 0) {
            var listener = this.callBackMap[type];
            if (listener) {
                _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].offUserEvent(type, listener);
                delete this.callBackMap[type];
            }
        }
        if (emitter.listenerCount() === 0) {
            callBridge('stopMonitor' + this.type, this._getParams());
        }
    }
};
['Canplay', 'Play', 'Pause', 'Stop', 'Ended', 'TimeUpdate', 'Prev', 'Next', 'Error', 'Waiting', 'Seeking', 'Seeked'].forEach(function (event) {
    innerProto['on' + event] = function (callback) {
        this._listen('on' + this.type + event, callback);
    };
    innerProto['off' + event] = function (callback) {
        this._unListen('on' + this.type + event, callback);
    };
});
['play', 'pause', 'stop', 'destroy'].forEach(function (m) {
    innerProto[m] = function () {
        // const playBackgroundAudio = m === 'play' && this.type === 'BackgroundAudio';
        callBridge('' + m + this.type, Object.assign({ playWithNoParam: true }, this._getParams()));
    };
});
var oDestroy = innerProto.destroy;
innerProto.destroy = function () {
    var _this3 = this;

    oDestroy.call(this);
    callBridge('stopMonitor' + this.type, this._getParams());
    Object.keys(this.callBackMap).forEach(function (k) {
        _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].offUserEvent(k, _this3.callBackMap[k]);
    });
};
innerProto.seek = function (position) {
    callBridge('seek' + this.type, Object.assign({}, this._getParams(), { position: position }));
};
/* harmony default export */ __webpack_exports__["default"] = (InnerAudioContext);

