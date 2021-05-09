__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @alipay/mp/es/utils/EventEmitter */ '../mp/es/utils/EventEmitter.js');
/* harmony import */ const _utils_bridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/bridge */ './src/utils/bridge.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../utils/objectKeys */ './src/utils/objectKeys.tsx');
/* harmony import */ const query_string__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! query-string */ './node_modules/query-string/index.js');
/* harmony import */ const query_string__WEBPACK_IMPORTED_MODULE_5___default = /* #__PURE__ */__webpack_require__.n(query_string__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ const _ap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../ap */ './src/bridge/ap.worker.tsx');
/* harmony import */ const _util__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../util */ './src/bridge/util.tsx');

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_3__.compareSystemVersion)('10.1.35') >= 0;
const { callBridge } = _ap__WEBPACK_IMPORTED_MODULE_6__.default;

const emitter = new _alipay_mp_es_utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__.default();
function stringUrl(params) {
  return query_string__WEBPACK_IMPORTED_MODULE_5___default.a.stringify(params);
}
function buildUrl(url, params) {
  let qs = params;
  if (typeof params === 'object') {
    qs = stringUrl(params);
  }
  if (!/\?/.test(url)) {
    qs = `?${qs}`;
  } else if (!/&$/.test(url) && !/\?$/.test(url)) {
    qs = `&${qs}`;
  }
  return url + qs;
}
function addBase64Head(base64, mimeType) {
  if (base64 && mimeType) {
    base64 = `data:${mimeType};base64,${base64}`;
  }
  return base64;
}
function normalizeErrorCode(res) {
  // 错误码强制转成数字
  if (typeof res.error === 'string') {
    res.error = parseInt(res.error, 10);
  }
  // 处理 error: 0 的情况，error 为 0 表示成功
  if (res.error === 0) {
    delete res.error;
    delete res.errorMessage;
  }
  return res;
}
function _isLocalId(localId) {
  return (/^[a-z0-9|]+$/i.test(localId)
  );
}
const API = {
  downloadFile: {
    b: function b(opt, ctx) {
      opt.downloadTaskId = ctx.taskId;
      Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_2__.mapping)(opt, {
        headers: 'header',
      });
    },
    a: function a(res) {
      Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_2__.mapping)(res, {
        tempFilePath: 'apFilePath',
        errorCode: 'error',
      });
      delete res.tempFilePath;
    },
    c: function c(ctx) {
      // c for cancel
      callBridge('operateDownloadTask', {
        downloadTaskId: ctx.taskId,
        operationType: 'abort',
      });
    },

    p: 'downloadTask',
  },
  uploadFile: {
    b: function b(opt, ctx) {
      opt.uploadTaskId = ctx.taskId;
      Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_2__.mapping)(opt, {
        headers: 'header',
        fileName: 'name',
        fileType: 'type',
      });
      if (_isLocalId(opt.filePath)) {
        opt.localId = opt.filePath;
        delete opt.filePath;
      }
    },
    a: function a(res) {
      if (res.error === 2) {
        res.error = 11;
      }
    },
    c: function c(ctx) {
      callBridge('operateUploadTask', {
        uploadTaskId: ctx.taskId,
        operationType: 'abort',
      });
    },

    p: 'uploadTask',
  },
};
if (g10135) {
  Object.assign(API, {
    request: {
      /**
             * 接口可直接传入一个字符串（opt.url）
             * 参数 opt.data 支持对象，会转成 queryString
             * 入参改造 opt.dataType => opt.responseType，
             * opt.dataType 支持 json|text|base64，json 时会对返回数据调用一次 JSON.parse
             */
      b: function b(opt, ctx) {
        opt.requestTaskId = ctx.taskId;
        const get = 'GET';
        // method 默认 'GET'
        opt.method = (opt.method || get).toUpperCase();
        // dataType 默认 'json'
        opt.dataType = (opt.dataType || 'json').toLowerCase();
        opt.responseType = opt.dataType;
        // 处理 responseType，非 base64 全当 text 对待
        opt.responseType = opt.responseType !== 'base64' ? 'text' : 'base64';
        // 处理 contentType，并强制 headers 为 object
        const headers = opt.headers = opt.headers || {};
        const contentType = headers['content-type'] = headers['content-type'] || 'application/json';
        let data;
        if (typeof opt.data === 'undefined') {
          data = '';
        } else if (typeof opt.data !== 'string') {
          if (contentType.indexOf('application/x-www-form-urlencoded') > -1) {
            data = stringUrl(opt.data);
          } else if (contentType.indexOf('application/json') > -1) {
            data = JSON.stringify(opt.data);
          } else {
            data = typeof opt.data === 'object' ? JSON.stringify(opt.data) : opt.data.toString();
          }
        } else {
          data = opt.data;
        }
        // 处理 GET 时，手动拼装上 queryString
        if (opt.method === get) {
          opt.url = buildUrl(opt.url, opt.data);
        }
        opt.data = data;
        // 处理 android headers 转换为 JSONArray 格式
        if (_utils_system__WEBPACK_IMPORTED_MODULE_3__.isAndroid) {
          const androidHeaders = [];
          Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__.default)(opt.headers).forEach((header) => {
            const androidHeader = {};
            androidHeader[header] = opt.headers[header];
            androidHeaders.push(androidHeader);
          });
          opt.headers = androidHeaders;
        }
      },
      a: function a(res, opt) {
        // 处理 json
        if (opt.dataType === 'json' && res.data) {
          try {
            res.data = JSON.parse(res.data);
          } catch (e) {
            res.error = 14;
            res.errorMessage = 'JSON parse data error';
            return;
          }
        }
        // 处理 base64
        if (opt.dataType === 'base64' && res.data && res.headers) {
          res.data = addBase64Head(res.data, res.headers['Content-Type']);
        }
        // 处理错误
        if ('status' in res) {
          const status = `${res.status}`;
          if (/^[45]/.test(status)) {
            res.error = 19;
            res.errorMessage = 'http status error';
          }
        }
      },
      c: function c(ctx) {
        callBridge('operateRequestTask', {
          requestTaskId: ctx.taskId,
          operationType: 'abort',
        });
      },
    },
  });
}
['downloadTask', 'uploadTask'].forEach((key) => {
  _ap__WEBPACK_IMPORTED_MODULE_6__.default.onUserEvent(`${key}StateChange`, (e) => {
    const { downloadTaskId, uploadTaskId, ...rest } = e.data;
    const taskId = key === 'downloadTask' ? downloadTaskId : uploadTaskId;
    emitter.emit(`${key}${taskId}progressUpdate`, rest);
  });
});
const NetworkAPI = {};
objectKeys(API).forEach((apiName) => {
  const apiConfig = API[apiName] || {};
  let taskId = 0;
  NetworkAPI[apiName] = function (param = {}) {
    taskId += 1;

    const { success, fail, complete, ...rest } = param;
    let _callback;
    let callReturned;
    if (apiConfig && apiConfig.b) {
      apiConfig.b(rest, { taskId });
    }
    const callback = function callback(resolve, reject) {
      return function (originRes) {
        if (callReturned) {
          return;
        }
        callReturned = true;

        const _handleCallbackParams = Object(_util__WEBPACK_IMPORTED_MODULE_7__.handleCallbackParams)({ success, fail, complete }, resolve, reject);
        const newSuccess = _handleCallbackParams.success;
        const newFail = _handleCallbackParams.fail;

        let res = originRes || {};
        if (apiConfig.a) {
          apiConfig.a(res, rest);
        }
        res = normalizeErrorCode(res);
        if (apiConfig.p) {
          emitter.off(`${apiConfig.p}${taskId}progressUpdate`);
        }
        if (res && res.error) {
          newFail(res);
        } else {
          newSuccess(res);
        }
      };
    };
    const promise = new Promise(((resolve, reject) => {
      _callback = callback(resolve, reject);
    }));
    callBridge(apiName, rest, _callback);
    let mixins = {
      abort: function abort() {
        if (apiConfig.c) {
          apiConfig.c({ taskId });
        }
        _callback({
          error: 9,
          errorMessage: `${apiName}:fail abort`,
        });
      },
    };
    if (apiConfig.p) {
      mixins = {
        ...mixins,
        onProgressUpdate: function onProgressUpdate(handler) {
          emitter.on(`${apiConfig.p}${taskId}progressUpdate`, handler);
        },
      };
    }
    return Object.assign(promise, mixins);
  };
});

export default NetworkAPI;
