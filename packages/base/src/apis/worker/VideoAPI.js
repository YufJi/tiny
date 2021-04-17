
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../framework/dev */ "./src/framework/dev.tsx");

function VideoContext(id, page) {
    this.id = id;
    this.page = page;
}
var proto = VideoContext.prototype;
['play', 'pause', 'seek', 'stop', 'mute', 'playbackRate', 'requestFullScreen', 'exitFullScreen', 'showStatusBar', 'hideStatusBar'].forEach(function (method) {
    proto[method] = function run() {
        var _page;

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        (_page = this.page).callRemote.apply(_page, ['refComponents.' + this.id, method].concat(args));
    };
});
/* harmony default export */ __webpack_exports__["default"] = ({
    createVideoContext: function createVideoContext(id) {
        return new VideoContext(id, Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])());
    }
});

