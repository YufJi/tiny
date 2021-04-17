
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/bridge */ "./src/utils/bridge.tsx");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/system */ "./src/utils/system.tsx");
/* harmony import */ var _shared_Media__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/Media */ "./src/bridge/shared/Media.tsx");




var g10150 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__["compareSystemVersion"])('10.1.50') >= 0;
var api50 = g10150 ? {
    getPosterFromVideoUrl: {}
} : {};
/* harmony default export */ __webpack_exports__["default"] = (function () {
    return Object.assign({ compressImage: {}, previewImage: _shared_Media__WEBPACK_IMPORTED_MODULE_3__["previewImage"],
        chooseImage: _shared_Media__WEBPACK_IMPORTED_MODULE_3__["chooseImage"], chooseVideo: {
            b: function b(opt) {
                if (typeof opt.sourceType === 'string') {
                    opt.sourceType = [opt.sourceType];
                }
                if (typeof opt.camera === 'string') {
                    opt.camera = [opt.camera];
                }
            },
            a: function a(res) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(res, {
                    errorCode: 'error',
                    errorDesc: 'errorMessage',
                    msg: 'errorMessage',
                    localId: 'apFilePath',
                    tempFilePath: 'apFilePath',
                    tempFile: 'apFilePath'
                });
                if (res.apFilePath) {
                    res.tempFilePath = res.apFilePath;
                }
                switch (res.error) {
                    case 0:
                        // ios 成功
                        delete res.error;
                        break;
                    case 1:
                        // ios 参数出错
                        res.error = 2; // 通用参数无效
                        break;
                    case 2:
                        // ios 用户取消
                        res.error = 10; // android 用户取消
                        break;
                    case 3:
                        // ios 操作失败
                        res.error = 11; // android 操作失败
                        break;
                    case 4:
                        // ios 数据处理失败
                        res.error = 12;
                        break;
                    default:
                }
            }
        }, saveImage: {
            b: function b(opt) {
                Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_1__["mapping"])(opt, {
                    url: 'src'
                });
                opt.showActionSheet = false;
                opt.cusHandleResult = true;
            }
        }, getImageInfo: {}, saveVideoToPhotosAlbum: {} }, api50);
});

