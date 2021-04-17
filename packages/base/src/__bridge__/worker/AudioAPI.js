
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/dev */ "./src/framework/dev.tsx");
/* harmony import */ var _InnerAudioContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./InnerAudioContext */ "./src/bridge/worker/InnerAudioContext.tsx");


function AudioContext(id, page) {
    this.id = id;
    this.page = page;
}
var proto = AudioContext.prototype;
['play', 'pause', 'seek', 'setSrc'].forEach(function (method) {
    proto[method] = function run() {
        var _page;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        (_page = this.page).callRemote.apply(_page, ['refComponents.' + this.id, method].concat(args));
    };
});
var backgroundAudioManager ;
/* harmony default export */ __webpack_exports__["default"] = ({
    createInnerAudioContext: function createInnerAudioContext() {
        return new _InnerAudioContext__WEBPACK_IMPORTED_MODULE_1__["default"]({
            writes: {
                src: {
                    v: function v(value) {
                        return 'string' != typeof value || 0 === value.length;
                    }
                },
                startTime: {
                    v: function v(value) {
                        return 'number' != typeof value;
                    }
                },
                autoplay: {
                    v: function v(value) {
                        return 'boolean' != typeof value;
                    }
                },
                loop: {
                    v: function v(value) {
                        return 'boolean' != typeof value;
                    }
                },
                obeyMuteSwitch: {
                    v: function v(value) {
                        return 'boolean' != typeof value;
                    }
                },
                volume: {
                    v: function v(value) {
                        return 'number' != typeof value || value < 0 || value > 1;
                    }
                }
            },
            reads: ['duration', 'currentTime', 'paused', 'buffered'],
            type: 'ForegroundAudio'
        });
    },
    getBackgroundAudioManager: function getBackgroundAudioManager() {
        if (backgroundAudioManager) {
            return backgroundAudioManager;
        }
        backgroundAudioManager = new _InnerAudioContext__WEBPACK_IMPORTED_MODULE_1__["default"]({
            writes: {
                src: {
                    v: function v(value) {
                        return 'string' != typeof value || 0 === value.length;
                    }
                },
                startTime: {
                    v: function v(value) {
                        return 'number' != typeof value;
                    }
                },
                title: {},
                epname: {},
                singer: {},
                coverImgUrl: {},
                webUrl: {}
            },
            reads: ['duration', 'currentTime', 'paused', 'buffered'],
            type: 'BackgroundAudio'
        });
        return backgroundAudioManager;
    },
    createAudioContext: function createAudioContext(id) {
        return new AudioContext(id, Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])());
    }
});

