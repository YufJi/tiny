__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, 'default', () => { return logAPI; });
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _alipay_mp_es_utils_throttle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @alipay/mp/es/utils/throttle */ '../mp/es/utils/throttle.js');
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_escapeLogParams__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/escapeLogParams */ './src/utils/escapeLogParams.tsx');
/* harmony import */ const _utils_LogBizType__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/LogBizType */ './src/utils/LogBizType.tsx');
/* harmony import */ const _utils_objectKeys__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../utils/objectKeys */ './src/utils/objectKeys.tsx');

const { callBridge } = _ap__WEBPACK_IMPORTED_MODULE_2__.default;
const { callInternalAPI } = _ap__WEBPACK_IMPORTED_MODULE_2__.default;

const SDKVersionParam = `SDKVersion=${_utils_system__WEBPACK_IMPORTED_MODULE_3__.SDKVersion}`;
const g = self;
let callLogLevel = 'digest'; // 默认 none
let exceptionLogLevel = 'all'; // 默认 all
let pendingData = {};
function pushData(apiName, type) {
  const key = `my.${apiName}.call`;
  pendingData[key] = pendingData[key] || { call: 0, success: 0 };
  pendingData[key][type] = pendingData[key][type] + 1;
}
function remoteLog(params) {
  callBridge('remoteLog', params);
}
callInternalAPI('getConfig4Mp', { key: 'tinyApLogLevel' }, function () {
  const res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (res.configKey) {
    let config;
    try {
      config = JSON.parse(res.configKey);
    } catch (e) {
      console.error(e);
    }
    if (config) {
      callLogLevel = config.apicall || callLogLevel;
      exceptionLogLevel = config.exception || exceptionLogLevel;
    }
  }
});
function logCall(apiName) {
  pushData(apiName, 'call');
  flushData();
}
function logSuccess(apiName) {
  pushData(apiName, 'success');
  flushData();
}
function logFail(apiName, params, res) {
  const type = 'behavior';
  const actionId = 'event';
  const seedId = `my.${apiName}.fail`;
  switch (exceptionLogLevel) {
    case 'digest':
      remoteLog({
        bizType: _utils_LogBizType__WEBPACK_IMPORTED_MODULE_5__.TAC,
        type,
        actionId,
        seedId,
        param4: SDKVersionParam,
      });
      break;
    case 'all':
      remoteLog({
        bizType: _utils_LogBizType__WEBPACK_IMPORTED_MODULE_5__.TAC,
        type,
        actionId,
        seedId,
        param2: Object(_utils_escapeLogParams__WEBPACK_IMPORTED_MODULE_4__.default)(params),
        param3: Object(_utils_escapeLogParams__WEBPACK_IMPORTED_MODULE_4__.default)(res),
        param4: SDKVersionParam,
      });
    default:
  }
}
var flushData = function flushData() {
  const type = 'behavior';
  const actionId = 'event';
  const seedId = 'jsapi_call_result';
  const param2 = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_6__.default)(pendingData).map((key) => {
    const _pendingData$key = pendingData[key];
    const { call } = _pendingData$key;
    const { success } = _pendingData$key;

    return `${key}(${call}$${success})`;
  }).join('|');
  pendingData = {};
  remoteLog({
    bizType: _utils_LogBizType__WEBPACK_IMPORTED_MODULE_5__.TAC,
    type,
    actionId,
    seedId,
    param2,
    param4: SDKVersionParam,
  });
};
flushData = Object(_alipay_mp_es_utils_throttle__WEBPACK_IMPORTED_MODULE_1__.default)(flushData, 500);
function skipReportError(res) {
  return res.error && res.error < 0;
}
function logToIDE(apiName, res) {
  if (g.__mpRemoteDebug && Object(_utils_system__WEBPACK_IMPORTED_MODULE_3__.compareSystemVersion)('10.1.35') >= 0) {
    callInternalAPI('tinyAppStandardLog', {
      category: 'error',
      message: res.errorMessage || res.errorMsg || res.error,
      description: res.errorMessage || res.errorMsg || res.error,
      logId: `JSAPI_${apiName}_${res.error}`,
      output: 'ide',
    });
  }
}
function logAPI(bridge) {
  const ignoreList = ['canIUse', 'postMessage', 'call', 'createAnimation', 'createMapContext', 'pageScrollTo', 'createCanvasContext', 'createAudioContext', 'createVideoContext', 'reportAnalytics', 'on', 'emit'];
  return Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_6__.default)(bridge).reduce((newBridge, key) => {
    if (ignoreList.indexOf(key) === -1 && typeof bridge[key] === 'function') {
      newBridge[key] = function api() {
        let params = arguments.length <= 0 ? undefined : arguments[0];
        if (typeof params !== 'object') {
          return bridge[key].apply(bridge, arguments);
        }
        const logParams = { ...params };
        delete logParams.fail;
        delete logParams.success;
        logCall(key);
        // 同步接口
        if (/^.+Sync$/.test(key)) {
          const res = bridge[key].call(bridge, params) || {};
          if (res.error || res.errorMessage) {
            if (skipReportError(res)) {
              return res;
            }
            logFail(key, logParams, res);
            logToIDE(key, res);
          } else {
            logSuccess(key);
          }
          return res;
        }
        params = params || {};
        const origSuccess = params.success;
        params.success = function success() {
          const res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          logSuccess(key);
          if (typeof origSuccess === 'function') {
            origSuccess(res);
          }
        };
        const origFail = params.fail;
        params.fail = function fail() {
          const res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

          if (!skipReportError(res)) {
            logFail(key, logParams, res);
            logToIDE(key, res);
          }
          if (typeof origFail === 'function') {
            origFail(res);
          }
        };
        return bridge[key](params);
      };
    } else {
      newBridge[key] = bridge[key];
    }
    return newBridge;
  }, {});
}
