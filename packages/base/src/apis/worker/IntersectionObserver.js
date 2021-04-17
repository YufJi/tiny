
__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');


let intersectionObserverId = 0;
const observerCallbackObj = {};
function IntersectionObserver(options, page) {
  this.intersectionObserverId = `pageMonitor-${intersectionObserverId++}`;
  this.options = { thresholds: [0],
    initialRatio: 0,
    selectAll: false,
    ...options };
  this.relativeInfo = [];
  this.disconnected = false;
  this.page = page;
}
IntersectionObserver.prototype = {
  relativeToViewport: function relativeToViewport(margins) {
    this.relativeInfo.push({
      selector: null,
      margins,
    });
    return this;
  },
  relativeTo: function relativeTo(selector, margins) {
    this.relativeInfo.push({
      selector,
      margins,
    });
    return this;
  },
  observe: function observe(targetSelector, callback) {
    if (this.disconnected) {
      console.warn('已经取消监听');
      return;
    }
    observerCallbackObj[this.intersectionObserverId] = callback;
    this.page.callRemote('bridge', 'addIntersectionObserver', {
      intersectionObserverId: this.intersectionObserverId,
      options: this.options,
      relativeInfo: this.relativeInfo,
      targetSelector,
    });
  },
  disconnect: function disconnect() {
    if (!this.disconnected) {
      this.page.callRemote('bridge', 'removeIntersectionObserver', this.intersectionObserverId);
      delete observerCallbackObj[this.intersectionObserverId];
      this.disconnected = true;
    }
  },
};
/* harmony default export */ __webpack_exports__.default = ({
  createIntersectionObserver: function createIntersectionObserver(options) {
    const page = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.getCurrentPageImpl)();
    return new IntersectionObserver(options, page);
  },
  _fireIntersectionObserver: function _fireIntersectionObserver(res) {
    if (res && typeof observerCallbackObj[res.intersectionObserverId] === 'function') {
      observerCallbackObj[res.intersectionObserverId](res.info);
    }
  },
});
