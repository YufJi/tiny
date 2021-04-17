
// /* harmony import */ const _worker_AudioAP__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./worker/AudioAP */ './src/bridge/worker/AudioAP.tsx');
// /* harmony import */ const _worker_BluetoothAP__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./worker/BluetoothAP */ './src/bridge/worker/BluetoothAP.tsx');
// /* harmony import */ const _worker_DeviceAP__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./worker/DeviceAP */ './src/bridge/worker/DeviceAP.tsx');
// /* harmony import */ const _worker_FaceVerifyAP__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./worker/FaceVerifyAP */ './src/bridge/worker/FaceVerifyAP.tsx');
// /* harmony import */ const _worker_LocationAP__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./worker/LocationAP */ './src/bridge/worker/LocationAP.tsx');
// /* harmony import */ const _worker_MediaAP__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./worker/MediaAP */ './src/bridge/worker/MediaAP.tsx');
// /* harmony import */ const _worker_NetworkAP__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./worker/NetworkAP */ './src/bridge/worker/NetworkAP.tsx');
// /* harmony import */ const _worker_OpenAP__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./worker/OpenAP */ './src/bridge/worker/OpenAP.tsx');
// /* harmony import */ const _worker_StorageAP__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./worker/StorageAP */ './src/bridge/worker/StorageAP.tsx');
// /* harmony import */ const _worker_UIAP__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./worker/UIAP */ './src/bridge/worker/UIAP.tsx');
// /* harmony import */ const _worker_BizAP__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./worker/BizAP */ './src/bridge/worker/BizAP.tsx');
// /* harmony import */ const _worker_EventAP__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./worker/EventAP */ './src/bridge/worker/EventAP.tsx');
// /* harmony import */ const _worker_FileAP__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./worker/FileAP */ './src/bridge/worker/FileAP.tsx');
// /* harmony import */ const _worker_IoTAP__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./worker/IoTAP */ './src/bridge/worker/IoTAP.tsx');
// /* harmony import */ const _worker_AIAP__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./worker/AIAP */ './src/bridge/worker/AIAP.tsx');
// /* harmony import */ const _worker_BizCustomAP__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./worker/BizCustomAP */ './src/bridge/worker/BizCustomAP.tsx');
// /* harmony import */ const _worker_OptionMenuItemAP__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./worker/OptionMenuItemAP */ './src/bridge/worker/OptionMenuItemAP.tsx');
// /* harmony import */ const _worker_EnvAp__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./worker/EnvAp */ './src/bridge/worker/EnvAp.tsx');
// /* harmony import */ const _worker_openMiniProgramAP__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./worker/openMiniProgramAP */ './src/bridge/worker/openMiniProgramAP.tsx');
// /* harmony import */ const _worker_FavoriteAP__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./worker/FavoriteAP */ './src/bridge/worker/FavoriteAP.tsx');

import UIAP from './worker/UIAP';

import ap from './ap';
import objectKeys from '../utils/objectKeys';

function _isSyncAPI(apiName) {
  return (/\w+Sync$/.test(apiName)
  );
}
const api = {};
const JSAPI = {
  // internal app
  rpc: {
    allowAbort: true,
  },
  // ...Object(_worker_AudioAP__WEBPACK_IMPORTED_MODULE_2__.default)(ap),
  // ...Object(_worker_BluetoothAP__WEBPACK_IMPORTED_MODULE_3__.default)(),
  // ...Object(_worker_DeviceAP__WEBPACK_IMPORTED_MODULE_4__.default)(ap),
  // ...Object(_worker_LocationAP__WEBPACK_IMPORTED_MODULE_6__.default)(),
  // ...Object(_worker_MediaAP__WEBPACK_IMPORTED_MODULE_7__.default)(),
  // ...Object(_worker_NetworkAP__WEBPACK_IMPORTED_MODULE_8__.default)(),
  // ...Object(_worker_OpenAP__WEBPACK_IMPORTED_MODULE_9__.default)(ap),
  // ...Object(_worker_StorageAP__WEBPACK_IMPORTED_MODULE_10__.default)(ap),
  ...UIAP(ap),
  // ...Object(_worker_BizAP__WEBPACK_IMPORTED_MODULE_12__.default)(ap),
  // ...Object(_worker_EventAP__WEBPACK_IMPORTED_MODULE_13__.default)(ap),
  // ...Object(_worker_FileAP__WEBPACK_IMPORTED_MODULE_14__.default)(),
  // ...Object(_worker_IoTAP__WEBPACK_IMPORTED_MODULE_15__.default)(),
  // ...Object(_worker_AIAP__WEBPACK_IMPORTED_MODULE_16__.default)(),
  // ...Object(_worker_BizCustomAP__WEBPACK_IMPORTED_MODULE_17__.default)(),
  // ...Object(_worker_OptionMenuItemAP__WEBPACK_IMPORTED_MODULE_18__.default)(),
  // ...Object(_worker_EnvAp__WEBPACK_IMPORTED_MODULE_19__.default)(),
  // ...Object(_worker_openMiniProgramAP__WEBPACK_IMPORTED_MODULE_20__.default)(ap),
  // ...Object(_worker_FaceVerifyAP__WEBPACK_IMPORTED_MODULE_5__.default)(ap),
  // ...Object(_worker_FavoriteAP__WEBPACK_IMPORTED_MODULE_21__.default)(),
};

ap.injectAPI(JSAPI);

objectKeys(JSAPI).forEach((apiName) => {
  const apiConfig = JSAPI[apiName];
  let apiNS = api;
  const { ns } = apiConfig;
  const { topNS } = apiConfig;

  const syncFn = function syncFn(...args) {
    return ap.callSync.apply(null, [apiName].concat(args));
  };
  const asyncFn = function asyncFn(...args) {
    return ap.call.apply(null, [apiName].concat(args));
  };
  const fn = _isSyncAPI(apiName) ? syncFn : asyncFn;
  if (ns) {
    apiNS = apiNS[ns] = apiNS[ns] || {};
    if (topNS) {
      api[apiName] = fn;
    }
    apiNS[apiName] = fn;
  } else {
    api[apiName] = fn;
  }
});
export default api;
