__webpack_require__.r(__webpack_exports__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./index.less */ './src/map/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _WebMap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./WebMap */ './src/map/WebMap.tsx');
/* harmony import */ const _NativeMap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./NativeMap */ './src/map/NativeMap.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');

// function WebMap() {
//   return null;
// }
const Map = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__.createComponent)({
  name: 'map',
  trackPageUpdateForIOS: _utils_system__WEBPACK_IMPORTED_MODULE_4__.isNativeComponent,
})(_utils_system__WEBPACK_IMPORTED_MODULE_4__.isNativeComponent ? _NativeMap__WEBPACK_IMPORTED_MODULE_3__.default : _WebMap__WEBPACK_IMPORTED_MODULE_2__.default);
/* harmony default export */ __webpack_exports__.default = (Map);
