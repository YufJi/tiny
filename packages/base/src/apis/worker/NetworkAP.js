__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const query_string__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! query-string */ './node_modules/query-string/index.js');
/* harmony import */ const query_string__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(query_string__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/objectKeys */ './src/utils/objectKeys.tsx');
/* harmony import */ const _shared_Network__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/Network */ './src/bridge/shared/Network.tsx');

const g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_2__.compareSystemVersion)('10.1.35') >= 0;
const api10135 = g10135 ? {
  sendMtop: {},
  getTBCode: {},
  setTBSessionInfo: {},
  getTBSessionInfo: {},
} : {};
function stringUrl(params) {
  return query_string__WEBPACK_IMPORTED_MODULE_1___default.a.stringify(params);
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
const AIEventForGT = false ? undefined : {};
/* harmony default export */ __webpack_exports__.default = (function () {
  return { ...AIEventForGT,
    httpRequest: {
      allowAbort: true,
      /**
             * 接口可直接传入一个字符串（opt.url）
             * 参数 opt.data 支持对象，会转成 queryString
             * 入参改造 opt.dataType => opt.responseType，
             * opt.dataType 支持 json|text|base64，json 时会对返回数据调用一次 JSON.parse
             */
      b: function b(opt) {
        const get = 'GET';
        // method 默认 'GET'
        opt.method = (opt.method || get).toUpperCase();
        // dataType 默认 'json'
        opt.dataType = (opt.dataType || 'json').toLowerCase();
        opt.responseType = opt.dataType;
        // 强制 headers 为 object
        opt.headers = opt.headers || {};
        // 如果 data 是对象，则转成 queryString，
        if (typeof opt.data === 'object') {
          const { headers } = opt;
          const contentType = headers['Content-Type'] || headers['content-type'];
          if (/^application\/json\b/i.test(contentType) && opt.method === 'POST') {
            opt.data = JSON.stringify(opt.data);
          } else {
            opt.data = stringUrl(opt.data);
          }
        }
        // 所以要处理 GET 时，手动拼装上 queryString
        if (opt.method === get && typeof opt.data === 'string') {
          opt.url = buildUrl(opt.url, opt.data);
        }
        // 处理 responseType，非 base64 全当 text 对待
        opt.responseType = opt.responseType !== 'base64' ? 'text' : 'base64';
        // 处理 android headers 转换为 JSONArray 格式
        if (_utils_system__WEBPACK_IMPORTED_MODULE_2__.isAndroid) {
          const androidHeaders = [];
          Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__.default)(opt.headers).forEach((header) => {
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
    },
    sendSocketMessage: {},
    closeSocket: {},
    onSocketOpen: {},
    offSocketOpen: {},
    onSocketMessage: {},
    offSocketMessage: {},
    onSocketError: {},
    offSocketError: {},
    onSocketClose: {},
    offSocketClose: {},
    getNetworkType: _shared_Network__WEBPACK_IMPORTED_MODULE_4__.getNetworkType,
    onNetworkStatusChange: {
      m: 'h5NetworkChange',
      a: function a(res) {
        delete res.NBPageUrl;
      },
    },
    offNetworkStatusChange: {
      m: 'h5NetworkChange',
    },
    ...api10135 };
});
