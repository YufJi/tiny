
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ap_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap.worker */ "./src/bridge/ap.worker.tsx");

var __rest = undefined && undefined.__rest || function (s, e) {
    var t = {};
    for (var p in s) {
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    }if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }return t;
};

var ANIMATIONEND = 'nbcomponent.map.animationEnd';
var translateMarkerId = 0;
function MapContext(params) {
    Object.assign(this, params);
}
function callAction(action, params) {
    var _this = this;

    _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].call('NBComponent.sendMessage', Object.assign({}, params, { element: this.element, actionType: action, viewId: this.page.getViewId() }));
    if (action === 'translateMarker') {
        if (typeof params.animationEnd === 'function') {
            var AnimationEndCallback = function AnimationEndCallback(e) {
                var viewId = e.viewId;
                var _e$data = e.data,
                    element = _e$data.element,
                    translateMarkerId = _e$data.translateMarkerId;

                if (_this.page.getViewId() === viewId && _this.element === element && params.data.translateMarkerId === translateMarkerId) {
                    params.animationEnd();
                    _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].off(ANIMATIONEND, AnimationEndCallback);
                }
            };
            _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].on(ANIMATIONEND, AnimationEndCallback);
        }
    }
}
var contextPrototype = MapContext.prototype = {
    getCenterLocation: function getCenterLocation(params) {
        callAction.call(this, 'getCenterLocation', params);
    },
    setProps: function setProps(props) {
        _ap_worker__WEBPACK_IMPORTED_MODULE_1__["default"].callBridge('NBComponent.render', {
            element: this.element,
            viewId: this.page.getViewId(),
            data: Object.assign({}, props, { timestamp: new Date().getTime() })
        });
    },
    moveToLocation: function moveToLocation() {
        callAction.call(this, 'moveToLocation');
    }
};
function noop() {}
['gestureEnable', 'showsScale', 'showsCompass', 'showRoute', 'clearRoute', 'updateComponents', 'translateMarker'].forEach(function (action) {
    contextPrototype[action] = function mapAction(params) {
        var _a = params || {},
            _a$success = _a.success,
            success = _a$success === undefined ? noop : _a$success,
            _a$fail = _a.fail,
            fail = _a$fail === undefined ? noop : _a$fail,
            _a$complete = _a.complete,
            complete = _a$complete === undefined ? noop : _a$complete,
            _a$animationEnd = _a.animationEnd,
            animationEnd = _a$animationEnd === undefined ? noop : _a$animationEnd,
            rest = __rest(_a, ["success", "fail", "complete", "animationEnd"]);
        var extraParams = {};
        if (action === 'translateMarker' && animationEnd !== noop) {
            extraParams.animationEnd = animationEnd;
            rest['translateMarkerId'] = translateMarkerId++;
        }
        callAction.call(this, action, Object.assign({ data: rest, success: success,
            fail: fail,
            complete: complete }, extraParams));
    };
});
/* harmony default export */ __webpack_exports__["default"] = (MapContext);

