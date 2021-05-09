__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);

function MapContext(params) {
  Object.assign(this, params);
}
function callAction(action, params) {
  let _page;

  const args = [`refComponents.${this.element}`, action];
  if (params) {
    const { success } = params;
    const { fail } = params;
    const { complete } = params;

    args.push((ret) => {
      if (success) {
        success(ret);
      }
      if (complete) {
        complete(ret);
      }
    }, (ret) => {
      if (fail) {
        fail(ret);
      }
      if (complete) {
        complete(ret);
      }
    });
  }
  (_page = this.page).callRemote.apply(_page, args);
}
const contextPrototype = MapContext.prototype = {
  getCenterLocation: function getCenterLocation(params) {
    callAction.call(this, 'getCenterLocation', params);
  },
};
['moveToLocation', 'gestureEnable', 'showsScale', 'showsCompass', 'showRoute', 'clearRoute'].forEach((action) => {
  // 这几个方法无 success, fail, complete callback
  contextPrototype[action] = function mapAction(params) {
    this.page.callRemote(`refComponents.${this.element}`, action, params);
  };
});
/* harmony default export */ __webpack_exports__.default = (MapContext);
