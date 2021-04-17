
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

function LivePusherContext(params) {
    Object.assign(this, params);
}
var contextPrototype = LivePusherContext.prototype = {};
function callAction(action, params) {
    _ap__WEBPACK_IMPORTED_MODULE_1__["default"].call('NBComponent.sendMessage', Object.assign({}, params, { element: this.element, actionType: action, viewId: this.page.getViewId() }));
}
function noop() {}
['start', 'stop', 'pause', 'resume', 'switchCamera', 'snapshot', 'toggleTorch'].forEach(function (action) {
    contextPrototype[action] = function cameraAction(params) {
        var _a = params || {},
            _a$success = _a.success,
            success = _a$success === undefined ? noop : _a$success,
            _a$fail = _a.fail,
            fail = _a$fail === undefined ? noop : _a$fail,
            _a$complete = _a.complete,
            complete = _a$complete === undefined ? noop : _a$complete,
            rest = __rest(_a, ["success", "fail", "complete"]);
        callAction.call(this, action, {
            data: rest,
            success: success,
            fail: fail,
            complete: complete
        });
    };
});
/* harmony default export */ __webpack_exports__["default"] = (LivePusherContext);

