__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _alipay_mp_es_utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @alipay/mp/es/utils/log */ '../mp/es/utils/log.js');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../framework/dev */ './src/framework/dev.tsx');
/* harmony import */ const _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/trackerStore */ './src/utils/trackerStore.tsx');
/* harmony import */ const _utils_getData__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/getData */ './src/utils/getData.tsx');
/* harmony import */ const _utils_startsWith__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../utils/startsWith */ './src/utils/startsWith.tsx');
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_escapeLogParams__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/escapeLogParams */ './src/utils/escapeLogParams.tsx');
/* harmony import */ const _utils_LogBizType__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/LogBizType */ './src/utils/LogBizType.tsx');
/* harmony import */ const _utils_objectKeys__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/objectKeys */ './src/utils/objectKeys.tsx');

const { callBridge } = _ap__WEBPACK_IMPORTED_MODULE_6__.default;

const APP_KEY = '$APP.';
const trackerDataBuffer = _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerDataBuffer = {};
let trackerBridge;
// default
_utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled = true;
function getParam4(data) {
  return Object(_utils_escapeLogParams__WEBPACK_IMPORTED_MODULE_8__.default)({ ...data, SDKVersion: _utils_system__WEBPACK_IMPORTED_MODULE_7__.SDKVersion, appId: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)().appId });
}
function pushConfigToPage(_ref) {
  const { page } = _ref;

  if (page) {
    const pagePath = page.getPagePath();
    const currentPageConfig = getAnalysisConfigByPage(pagePath);
    if (page.trackerConfig !== currentPageConfig) {
      page.trackerConfig = currentPageConfig;
      Object(_alipay_mp_es_utils_log__WEBPACK_IMPORTED_MODULE_1__.debug)('framework', '[WORKER] push trackerConfig to page:', pagePath, currentPageConfig);
      page.callRemote('bridge', 'setTrackerConfig', currentPageConfig);
    }
  }
}
function getTrackerConfigAPI(fn) {
  if (2 > 11) {
    _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled = true;
    _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerConfig = [{
      eventCode: 'test',
      eventTarget: [{
        action: 'report',
        page: 'pages/1/index',
        trigger: 'click',
        element: '#outer1',
        data: {
          'data-el': '$DATASET.el',
          'app-name': '$APP.globalData.name',
          'page-name': 'pageName',
          pageTime: '$PAGE_TIME',
          appTime: '$APP_TIME',
          currentPage: '$CURRENT_PAGE',
          lastPage: '$LAST_PAGE',
        },
      }],
    }];
    fn(_utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerConfig);
    return;
  }

  const _getStartupParams = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)();
  const { appId } = _getStartupParams;

  callBridge('trackerConfig', {
    requestType: 'isTrackerEnable',
    params: {
      appId,
    },
  }, function () {
    const result = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    Object(_alipay_mp_es_utils_log__WEBPACK_IMPORTED_MODULE_1__.debug)('framework', '[WORKER] isTrackerEnable', result);
    if (result.error) {
      _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled = true;
    } else {
      _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled = result.enable || false;
    }
    callBridge('trackerConfig', {
      requestType: 'queryTrackerConfig',
      params: {
        appId,
      },
    }, function () {
      const res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // null??
      if (res && !res.error) {
        Object(_alipay_mp_es_utils_log__WEBPACK_IMPORTED_MODULE_1__.default)('framework: getTrackerConfig', res);
        const _res$config = res.config;
        const config = _res$config === undefined ? [] : _res$config;
        const _res$env = res.env;
        const env = _res$env === undefined ? 'release' : _res$env;

        _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerConfig = config;
        _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnv = env;
        fn(_utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled ? config : []);
      }
    });
  });
}
function startGetTrackerConfig() {
  getTrackerConfigAPI((trackerConfig) => {
    startMonitorConfig(trackerConfig);
  });
}
_framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.prependListener('launch', startGetTrackerConfig);
_ap__WEBPACK_IMPORTED_MODULE_6__.default.on('afterShare', (event) => {
  _framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.emit('afterShare', {
    page: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)(),
    event,
  });
});
_ap__WEBPACK_IMPORTED_MODULE_6__.default.on('onShare', () => {
  _framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.emit('share', {
    page: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)(),
  });
});
const unSubscribeAnalysisListeners = {};
let launched = false;
function startMonitorConfig(trackerConfig) {
  // getCurrentPageImpl may be null
  pushConfigToPage({ page: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)() });
  const types = {};
  trackerConfig.forEach((event) => {
    event.eventTarget.forEach((eventTarget) => {
      const { trigger } = eventTarget;

      if (trigger !== 'click') {
        types[trigger] = types[trigger] || [];
        types[trigger].push({
          eventCode: event.eventCode,
          eventTarget,
        });
      }
    });
  });
  Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_10__.default)(unSubscribeAnalysisListeners).forEach((k) => {
    unSubscribeAnalysisListeners[k].remove();
    delete unSubscribeAnalysisListeners[k];
  });
  Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_10__.default)(types).forEach((k) => {
    const events = types[k];
    if (events && events.length) {
      const commonReport = function commonReport() {
        const _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        const { page } = _ref2;
        const { params } = _ref2;

        events.forEach((_ref3) => {
          const { eventCode } = _ref3;
          const { eventTarget } = _ref3;

          // specified page
          const pageConfig = eventTarget.page;
          if (pageConfig !== 'ANY_PAGE' && pageConfig && page && page.getPagePath() !== pageConfig) {
            return;
          }
          const args = [page, eventCode, {
            dataConfig: eventTarget.data,
            params: { ...params, $appTrigger: k },
          }];
          if (eventTarget.action === 'collect') {
            let _trackerBridge;

            (_trackerBridge = trackerBridge).collectTrackerData.apply(_trackerBridge, args);
          } else if (eventTarget.action === 'report') {
            let _trackerBridge2;

            (_trackerBridge2 = trackerBridge).reportTrackerData.apply(_trackerBridge2, args);
          }
        });
      };

      const report = function report() {
        const _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        const { page } = _ref4;

        commonReport({ page });
      };

      if (k === 'launch') {
        if (!launched) {
          report();
          launched = true;
        }
      } else if (k === 'afterShare') {
        unSubscribeAnalysisListeners[k] = _framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.prependListener(k, function () {
          const _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          const { page } = _ref5;
          const { event } = _ref5;

          commonReport({
            page,
            params: {
              shareResult: event.data.shareResult,
            },
          });
        });
      } else {
        unSubscribeAnalysisListeners[k] = _framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.prependListener(k, report);
      }
    }
  });
}
_ap__WEBPACK_IMPORTED_MODULE_6__.default.on('onTrackerConfigChange', (res) => {
  const trackerConfig = res && res.data && res.data.config || [];
  _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerConfig = trackerConfig;
  // clear cache
  pagesConfigCache = {};
  Object(_alipay_mp_es_utils_log__WEBPACK_IMPORTED_MODULE_1__.default)('framework: onTrackerConfigChange', res);
  startMonitorConfig(_utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled ? trackerConfig : []);
});
_ap__WEBPACK_IMPORTED_MODULE_6__.default.on('onTrackerEnableChange', function () {
  const res = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const { enable } = res;

  _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled = enable;
  Object(_alipay_mp_es_utils_log__WEBPACK_IMPORTED_MODULE_1__.default)('framework: onTrackerEnableChange', res);
  startMonitorConfig(enable ? _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerConfig : []);
});
var pagesConfigCache = {};
function getAnalysisConfigByPage(pagePath) {
  const { trackerConfig } = _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default;
  const { trackerEnabled } = _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default;

  if (!trackerConfig || !trackerEnabled) {
    return undefined;
  }
  if (pagePath in pagesConfigCache) {
    return pagesConfigCache[pagePath];
  }
  let pageConfig;
  trackerConfig.forEach((event) => {
    let pageEvent;
    const pageEvent2 = {
      eventCode: event.eventCode,
      eventTarget: [],
    };
    const { eventTarget } = event;
    eventTarget.forEach((target) => {
      let targetPage = target.page || '';
      if (targetPage.charAt(0) === '/') {
        targetPage = targetPage.slice(1);
      }
      if ((targetPage === pagePath || targetPage === 'ANY_PAGE') && target.trigger === 'click') {
        pageEvent = pageEvent2;
        pageEvent.eventTarget.push(target);
      }
    });
    if (pageEvent) {
      pageConfig = pageConfig || [];
      pageConfig.push(pageEvent);
    }
  });
  pagesConfigCache[pagePath] = pageConfig;
  return pageConfig;
}
_framework_dev__WEBPACK_IMPORTED_MODULE_2__.EventHub.prependListener('enterPage', pushConfigToPage);
trackerBridge = {
  collectTrackerData: function collectTrackerData(pageOrPageId, eventCode, _ref6) {
    const { dataConfig } = _ref6;
    const _ref6$params = _ref6.params;
    const params = _ref6$params === undefined ? {} : _ref6$params;

    if (!_utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled) {
      return;
    }
    const app = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getAppImpl)();
    const page = pageOrPageId && pageOrPageId.getId ? pageOrPageId : app.getPageById(pageOrPageId) || Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)();
    if (!page) {
      return;
    }
    const pageDataConfig = {};
    const appDataConfig = {};
    const now = Date.now();
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_10__.default)(dataConfig).forEach((k) => {
      const c = dataConfig[k];
      if (c === '$PAGE_TIME') {
        params[k] = now - page.$loadTime;
        return;
      }
      if (c === '$APP_TIME') {
        params[k] = now - app.$launchTime;
        return;
      }
      if (c === '$CURRENT_PAGE') {
        params[k] = page.getPagePath();
        return;
      }
      if (c === '$LAST_PAGE') {
        params[k] = page.fromPage && page.fromPage.getPagePath();
        return;
      }
      if (Object(_utils_startsWith__WEBPACK_IMPORTED_MODULE_5__.default)(c, APP_KEY)) {
        appDataConfig[k] = c.slice(APP_KEY.length);
      } else {
        pageDataConfig[k] = c;
      }
    });
    const data = Object(_utils_getData__WEBPACK_IMPORTED_MODULE_4__.default)(page.publicInstance.data, pageDataConfig);
    const appData = Object(_utils_getData__WEBPACK_IMPORTED_MODULE_4__.default)(app.publicInstance.globalData, appDataConfig);
    trackerDataBuffer[eventCode] = { ...trackerDataBuffer[eventCode], ...data, ...params, ...appData };
  },
  reportTrackerData: function reportTrackerData(pageOrPageId, eventCode, _ref7) {
    const { dataConfig } = _ref7;
    const { params } = _ref7;

    if (!_utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled) {
      return;
    }
    trackerBridge.collectTrackerData(pageOrPageId, eventCode, {
      dataConfig,
      params,
    });
    const trackData = trackerDataBuffer[eventCode];

    const _getStartupParams2 = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)();
    const { appId } = _getStartupParams2;

    callBridge('remoteLog', {
      bizType: Object(_utils_LogBizType__WEBPACK_IMPORTED_MODULE_9__.APP_BIZ)(),
      seedId: eventCode,
      actionId: 'event',
      param4: getParam4(trackData),
    });
    callBridge('trackerConfig', {
      requestType: 'triggerUpload',
      params: {
        appId,
        env: _utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnv,
      },
    });
    Object(_alipay_mp_es_utils_log__WEBPACK_IMPORTED_MODULE_1__.debug)('framework', '[WORKER] reportTrackerData', eventCode, trackData, appId);
    trackerDataBuffer[eventCode] = {};
  },
};
/* harmony default export */ __webpack_exports__.default = ({
  reportAnalytics: function reportAnalytics(eventName, data) {
    if (_utils_trackerStore__WEBPACK_IMPORTED_MODULE_3__.default.trackerEnabled) {
      callBridge('remoteLog', {
        spmId: eventName,
        param4: getParam4(data),
        type: 'behavior',
        bizType: Object(_utils_LogBizType__WEBPACK_IMPORTED_MODULE_9__.APP_BIZ)(),
        actionId: 'event',
        logLevel: 1,
      });
    }
  },

  $trackerAPI: trackerBridge,
});
