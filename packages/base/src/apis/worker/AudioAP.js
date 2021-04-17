
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/bridge */ "./src/utils/bridge.tsx");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/system */ "./src/utils/system.tsx");



var g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__["compareSystemVersion"])('10.1.38') >= 0;
var api38 = g10138 ? {
    getAvailableAudioSources: {}
} : {};
function handleResultSuccess(res, mappingError, successValue) {
    if (!('error' in res) && res.success === successValue) {
        res.error = mappingError;
    }
    delete res.success;
    return res;
}
/* harmony default export */ __webpack_exports__["default"] = (function (ap) {
    var callBridge = ap.callBridge;

    var _MEDIA_BUSINESS = 'apm-h5';
    var getBAPSI = {
        isListening: false,
        lastState: 2,
        on: function on() {
            callBridge('startMonitorBackgroundAudio');
            if (!getBAPSI.isListening) {
                getBAPSI.isListening = true;
                ap.on('getBackgroundAudioPlayedStateInfo', getBAPSI.listener);
            }
        },
        off: function off() {
            ap.off('getBackgroundAudioPlayedStateInfo', getBAPSI.listener);
            callBridge('stopMonitorBackgroundAudio');
            getBAPSI.isListening = false;
        },
        listener: function listener(evt) {
            var data = evt.data || {};
            var state = data.status;
            var triggerEvent ;
            switch (state) {
                case 0:
                    triggerEvent = 'backgroundAudioPause';
                    break;
                case 1:
                    triggerEvent = 'backgroundAudioPlay';
                    break;
                case 2:
                    triggerEvent = 'backgroundAudioStop';
                    break;
                default:
                    triggerEvent = undefined;
            }
            if (triggerEvent && state !== getBAPSI.lastState) {
                ap.emit(triggerEvent);
                getBAPSI.lastState = state;
            }
        }
    };
    return Object.assign({ startRecord: {
            m: 'startAudioRecord',
            b: function b(opt) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(opt, {
                    maxDuration: 'maxRecordTime%f',
                    minDuration: 'minRecordTime%f'
                }, {
                    maxDuration: opt.maxDuration || 60,
                    minDuration: opt.minDuration || 1
                });
                opt.business = _MEDIA_BUSINESS;
            },
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    tempFilePath: 'apFilePath',
                    identifier: 'apFilePath'
                });
            }
        }, stopRecord: {
            m: 'stopAudioRecord'
        }, cancelRecord: {
            m: 'cancelAudioRecord'
        }, playVoice: {
            m: 'startPlayAudio',
            b: function b(opt) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(opt, {
                    filePath: 'identifier'
                });
                opt.business = _MEDIA_BUSINESS;
            },
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    identifier: 'filePath'
                });
            }
        }, pauseVoice: {
            m: 'pauseAudioPlay'
        }, resumeVoice: {
            m: 'resumeAudioPlay'
        }, stopVoice: {
            m: 'stopAudioPlay'
        }, playBackgroundAudio: {
            b: function b(opt) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(opt, {
                    url: 'audioDataUrl%s',
                    title: 'audioName%s',
                    singer: 'singerName%s',
                    describe: 'audioDescribe%s',
                    logo: 'audioLogoUrl%s',
                    cover: 'coverImgUrl%s'
                });
                opt.business = _MEDIA_BUSINESS;
            },
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    describe: 'errorMessage'
                });
                handleResultSuccess(res, 12, 0);
            }
        }, pauseBackgroundAudio: {
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    describe: 'errorMessage'
                });
                handleResultSuccess(res, 12, 0);
            }
        }, stopBackgroundAudio: {
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    describe: 'errorMessage'
                });
                handleResultSuccess(res, 12, 0);
            }
        }, seekBackgroundAudio: {
            b: function b(opt) {
                opt.business = _MEDIA_BUSINESS;
                opt.position = Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["toType"])('%f', opt.position);
            },
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    describe: 'errorMessage'
                });
                handleResultSuccess(res, 12, 0);
            }
        }, getBackgroundAudioPlayerState: {
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    audioDataUrl: 'url',
                    describe: 'errorMessage'
                });
                handleResultSuccess(res, 12, 0);
            }
        }, onBackgroundAudioPlay: {
            b: function b() {
                getBAPSI.on();
            }
        }, offBackgroundAudioPlay: {}, onBackgroundAudioPause: {
            b: function b() {
                getBAPSI.on();
            }
        }, offBackgroundAudioPause: {}, onBackgroundAudioStop: {
            b: function b() {
                getBAPSI.on();
            }
        }, offBackgroundAudioStop: {} }, api38);
});

