__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'API', () => { return API; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'workerAPI', () => { return workerAPI; });
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _bridge_shared_UI__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../bridge/shared/UI */ './src/bridge/shared/UI.tsx');
/* harmony import */ const _bridge_shared_Media__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../bridge/shared/Media */ './src/bridge/shared/Media.tsx');
/* harmony import */ const _bridge_shared_Network__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../bridge/shared/Network */ './src/bridge/shared/Network.tsx');
/* harmony import */ const _bridge_shared_Location__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../bridge/shared/Location */ './src/bridge/shared/Location.tsx');
/* harmony import */ const _bridge_shared_BizCustomAP__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../bridge/shared/BizCustomAP */ './src/bridge/shared/BizCustomAP.tsx');
/* harmony import */ const _bridge_shared_Storage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../bridge/shared/Storage */ './src/bridge/shared/Storage.tsx');

const g = self;
var API = { alert: _bridge_shared_UI__WEBPACK_IMPORTED_MODULE_1__.alert,
  showLoading: _bridge_shared_UI__WEBPACK_IMPORTED_MODULE_1__.showLoading,
  hideLoading: _bridge_shared_UI__WEBPACK_IMPORTED_MODULE_1__.hideLoading,
  previewImage: _bridge_shared_Media__WEBPACK_IMPORTED_MODULE_2__.previewImage,
  chooseImage: _bridge_shared_Media__WEBPACK_IMPORTED_MODULE_2__.chooseImage,
  getNetworkType: _bridge_shared_Network__WEBPACK_IMPORTED_MODULE_3__.getNetworkType,
  openLocation: _bridge_shared_Location__WEBPACK_IMPORTED_MODULE_4__.openLocation,
  openTaobao: Object(_bridge_shared_BizCustomAP__WEBPACK_IMPORTED_MODULE_5__.openTaobao)(() => {
    return g.JSBridge.call;
  }),
  tradePay: {},
  getLocation: Object(_bridge_shared_Location__WEBPACK_IMPORTED_MODULE_4__.getLocation)(g.JSBridge.startupParams.parentAppId),
  ...Object(_bridge_shared_Storage__WEBPACK_IMPORTED_MODULE_6__.default)() };
var workerAPI = ['navigateTo', 'navigateBack', 'switchTab', 'reLaunch', 'redirectTo'];
