__webpack_require__.r(__webpack_exports__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _InnerAudioContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InnerAudioContext */ './src/bridge/worker/InnerAudioContext.tsx');

function AudioContext(id, page) {
  this.id = id;
  this.page = page;
}
const proto = AudioContext.prototype;
['play', 'pause', 'seek', 'setSrc'].forEach((method) => {
  proto[method] = function run() {
    let _page;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (_page = this.page).callRemote.apply(_page, [`refComponents.${this.id}`, method].concat(args));
  };
});
let backgroundAudioManager;
/* harmony default export */ __webpack_exports__.default = ({
  createInnerAudioContext: function createInnerAudioContext() {
    return new _InnerAudioContext__WEBPACK_IMPORTED_MODULE_1__.default({
      writes: {
        src: {
          v: function v(value) {
            return typeof value !== 'string' || value.length === 0;
          },
        },
        startTime: {
          v: function v(value) {
            return typeof value !== 'number';
          },
        },
        autoplay: {
          v: function v(value) {
            return typeof value !== 'boolean';
          },
        },
        loop: {
          v: function v(value) {
            return typeof value !== 'boolean';
          },
        },
        obeyMuteSwitch: {
          v: function v(value) {
            return typeof value !== 'boolean';
          },
        },
        volume: {
          v: function v(value) {
            return typeof value !== 'number' || value < 0 || value > 1;
          },
        },
      },
      reads: ['duration', 'currentTime', 'paused', 'buffered'],
      type: 'ForegroundAudio',
    });
  },
  getBackgroundAudioManager: function getBackgroundAudioManager() {
    if (backgroundAudioManager) {
      return backgroundAudioManager;
    }
    backgroundAudioManager = new _InnerAudioContext__WEBPACK_IMPORTED_MODULE_1__.default({
      writes: {
        src: {
          v: function v(value) {
            return typeof value !== 'string' || value.length === 0;
          },
        },
        startTime: {
          v: function v(value) {
            return typeof value !== 'number';
          },
        },
        title: {},
        epname: {},
        singer: {},
        coverImgUrl: {},
        webUrl: {},
      },
      reads: ['duration', 'currentTime', 'paused', 'buffered'],
      type: 'BackgroundAudio',
    });
    return backgroundAudioManager;
  },
  createAudioContext: function createAudioContext(id) {
    return new AudioContext(id, Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__.getCurrentPageImpl)());
  },
});
