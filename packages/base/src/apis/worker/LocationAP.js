__webpack_require__.r(__webpack_exports__);
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _shared_Location__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/Location */ './src/bridge/shared/Location.tsx');

/* harmony default export */ __webpack_exports__.default = (function () {
  return {
    getLocation: Object(_shared_Location__WEBPACK_IMPORTED_MODULE_2__.getLocation)(Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.getStartupParams)().appId),
    openLocation: _shared_Location__WEBPACK_IMPORTED_MODULE_2__.openLocation,
    chooseLocation: {
      m: 'beehiveGetPOI',
      b: function b(opt) {
        opt.sendBtnText = '选择';
      },
      a: function a(res) {
        if (res.error) {
          return;
        }
        if (res.poiId) {
          // 只有一个的时候
          res.address = res.snippet;
          res.name = res.title;
        } else if (_utils_system__WEBPACK_IMPORTED_MODULE_0__.isAndroid) {
          res.address = res.snippet;
          res.name = '';
        } else {
          res.address = res.title;
          res.name = '';
        }
        delete res.snippet;
        delete res.title;
        if (res.latLonPoint) {
          res.latitude = res.latLonPoint.latitude;
          res.longitude = res.latLonPoint.longitude;
          delete res.latLonPoint;
        }
      },
    },
  };
});
