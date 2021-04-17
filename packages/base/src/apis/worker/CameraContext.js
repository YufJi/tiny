
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap */ "./src/bridge/ap.worker.tsx");

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};

function noop() {}
function CameraContext(params) {
    var _this = this;

    Object.assign(this, params);
    this.cameraRecordTimer = null;
    this.doTimeoutCallback = function () {
        if (_this.cameraRecordTimer) {
            clearTimeout(_this.cameraRecordTimer);
            _this.cameraRecordTimer = null;
        }
        _this.stopRecord({
            success: _this.timeoutCallback
        });
    };
}
var contextPrototype = CameraContext.prototype = {};
function callAction(action, params) {
    _ap__WEBPACK_IMPORTED_MODULE_1__["default"].call('NBComponent.sendMessage', Object.assign({}, params, { element: this.element, actionType: action, viewId: this.page.getViewId() }));
}
contextPrototype.startRecord = function cameraAction(params) {
    var _this2 = this;

    var _a = params || {},
        _a$success = _a.success,
        success = _a$success === undefined ? noop : _a$success,
        _a$fail = _a.fail,
        fail = _a$fail === undefined ? noop : _a$fail,
        _a$complete = _a.complete,
        complete = _a$complete === undefined ? noop : _a$complete,
        _a$timeoutCallback = _a.timeoutCallback,
        timeoutCallback = _a$timeoutCallback === undefined ? noop : _a$timeoutCallback,
        rest = __rest(_a, ["success", "fail", "complete", "timeoutCallback"]);
    this.timeoutCallback = timeoutCallback;
    clearTimeout(this.cameraRecordTimer);
    this.cameraRecordTimer = setTimeout(function () {
        _this2.doTimeoutCallback();
    }, 30000);
    callAction.call(this, 'startRecord', {
        data: rest,
        success: success,
        fail: fail,
        complete: complete
    });
};
['takePhoto', 'stopRecord'].forEach(function (action) {
    contextPrototype[action] = function cameraAction(params) {
        var _a = params || {},
            _a$success2 = _a.success,
            success = _a$success2 === undefined ? noop : _a$success2,
            _a$fail2 = _a.fail,
            fail = _a$fail2 === undefined ? noop : _a$fail2,
            _a$complete2 = _a.complete,
            complete = _a$complete2 === undefined ? noop : _a$complete2,
            rest = __rest(_a, ["success", "fail", "complete"]);
        if (action === 'stopRecord') {
            clearTimeout(this.cameraRecordTimer);
        }
        callAction.call(this, action, {
            data: rest,
            success: success,
            fail: fail,
            complete: complete
        });
    };
});
/* harmony default export */ __webpack_exports__["default"] = (CameraContext);

