__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _alipay_mp_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @alipay/mp/es/framework/startupParams */ '../mp/es/framework/startupParams/index.js');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_4__.compareSystemVersion)('10.1.35') >= 0;
const g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_4__.compareSystemVersion)('10.1.38') >= 0;
const noop = function noop() {};
const miniServiceCallbackList = {};
function isMiniService() {
  return Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getAppImpl)().launchOptions.scene === 'miniService';
}
function getAppId() {
  const startupParams = Object(_alipay_mp_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_3__.getStartupParams)();
  // host miniProgram appId
  return isMiniService() ? startupParams.parentAppId : startupParams.appId;
}
function getSourceId() {
  const startupParams = Object(_alipay_mp_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_3__.getStartupParams)();
  return isMiniService() ? startupParams.appId : undefined;
}
function getOptions(config, referrerInfo) {
  const source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const { serviceId } = config;
  const { servicePage } = config;

  return { serviceId,
    servicePage,
    ...source,
    params: {
      referrerInfo: JSON.stringify(referrerInfo),
    } };
}
function storeCallback(config) {
  miniServiceCallbackList[config.serviceId] = {
    success: config.success || noop,
    fail: config.fail || noop,
    complete: config.complete || noop,
  };
}
function navigate(config, doNavigate) {
  doNavigate(config);
  storeCallback(config);
}
const api = {
  navigateToMiniService: function navigateToMiniService(config) {
    if (!isMiniService() || isMiniService() && g10135) {
      navigate(config, (params) => {
        const referrerInfo = {
          appId: getAppId(),
          sourceServiceId: getSourceId(),
          data: params.extraData,
        };
        _ap__WEBPACK_IMPORTED_MODULE_1__.default.callBridge('navigateToMiniService', getOptions(params, referrerInfo));
      });
    } else {
      throw new Error(`miniService can't navigateTo miniService ${config.serviceId}`);
    }
  },
  navigateBackFromMiniService: function navigateBackFromMiniService() {
    const data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _ap__WEBPACK_IMPORTED_MODULE_1__.default.callBridge('navigateBackFromMiniService', {
      data,
    });
  },
};
if (g10138) {
  api.startMiniService = function startMiniService() {
    const config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    navigate(config, (params) => {
      const { parentAppId } = params;
      const { sourceId } = params;
      const data = params.extraData;

      const referrerInfo = {
        appId: parentAppId || getAppId(),
        sourceServiceId: sourceId || getSourceId(),
        data,
      };
      _ap__WEBPACK_IMPORTED_MODULE_1__.default.callInternalAPI('startMiniService', getOptions(params, referrerInfo, { parentAppId, sourceId }));
    });
  };
}
_ap__WEBPACK_IMPORTED_MODULE_1__.default.on('onMiniServiceMessage', (e) => {
  const ev = e.data;
  const callbackObj = miniServiceCallbackList[ev.serviceId];
  if (callbackObj) {
    const customParams = {
      action: ev.action,
      data: ev.data,
    };
    if (ev.error) {
      customParams.error = ev.error;
      customParams.errorMessage = ev.errorMessage || '', callbackObj.fail(customParams);
    } else {
      callbackObj.success(customParams);
    }
    callbackObj.complete(customParams);
    delete miniServiceCallbackList[ev.serviceId];
  } else {
    throw new Error(`not find callback for ${ev.serviceId}`);
  }
});
/* harmony default export */ __webpack_exports__.default = (api);
