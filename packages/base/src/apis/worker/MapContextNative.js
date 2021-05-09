__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _ap_worker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap.worker */ './src/bridge/ap.worker.tsx');

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

const ANIMATIONEND = 'nbcomponent.map.animationEnd';
let translateMarkerId = 0;
function MapContext(params) {
  Object.assign(this, params);
}
function callAction(action, params) {
  const _this = this;

  _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.call('NBComponent.sendMessage', { ...params, element: this.element, actionType: action, viewId: this.page.getViewId() });
  if (action === 'translateMarker') {
    if (typeof params.animationEnd === 'function') {
      const AnimationEndCallback = function AnimationEndCallback(e) {
        const { viewId } = e;
        const _e$data = e.data;
        const { element } = _e$data;
        const { translateMarkerId } = _e$data;

        if (_this.page.getViewId() === viewId && _this.element === element && params.data.translateMarkerId === translateMarkerId) {
          params.animationEnd();
          _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.off(ANIMATIONEND, AnimationEndCallback);
        }
      };
      _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.on(ANIMATIONEND, AnimationEndCallback);
    }
  }
}
const contextPrototype = MapContext.prototype = {
  getCenterLocation: function getCenterLocation(params) {
    callAction.call(this, 'getCenterLocation', params);
  },
  setProps: function setProps(props) {
    _ap_worker__WEBPACK_IMPORTED_MODULE_1__.default.callBridge('NBComponent.render', {
      element: this.element,
      viewId: this.page.getViewId(),
      data: { ...props, timestamp: new Date().getTime() },
    });
  },
  moveToLocation: function moveToLocation() {
    callAction.call(this, 'moveToLocation');
  },
};
function noop() {}
['gestureEnable', 'showsScale', 'showsCompass', 'showRoute', 'clearRoute', 'updateComponents', 'translateMarker'].forEach((action) => {
  contextPrototype[action] = function mapAction(params) {
    const _a = params || {};
    const _a$success = _a.success;
    const success = _a$success === undefined ? noop : _a$success;
    const _a$fail = _a.fail;
    const fail = _a$fail === undefined ? noop : _a$fail;
    const _a$complete = _a.complete;
    const complete = _a$complete === undefined ? noop : _a$complete;
    const _a$animationEnd = _a.animationEnd;
    const animationEnd = _a$animationEnd === undefined ? noop : _a$animationEnd;
    const rest = __rest(_a, ['success', 'fail', 'complete', 'animationEnd']);
    const extraParams = {};
    if (action === 'translateMarker' && animationEnd !== noop) {
      extraParams.animationEnd = animationEnd;
      rest.translateMarkerId = translateMarkerId++;
    }
    callAction.call(this, action, { data: rest,
      success,
      fail,
      complete,
      ...extraParams });
  };
});
/* harmony default export */ __webpack_exports__.default = (MapContext);
