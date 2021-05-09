__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ './node_modules/react-dom/index.js');
/* harmony import */ const react_dom__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');

let id = 0;
const cacheWebViewId = {};
const WebView = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_3__.createComponent)({
  name: 'web-view',
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'WebView',
  getDefaultProps: function getDefaultProps() {
    return {
      enableWK: true,
    };
  },
  componentDidMount: function componentDidMount() {
    this.documentEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(document, {
      'nbcomponent.webview.onFromMessage': this.onMessage,
    });
    if (_utils_system__WEBPACK_IMPORTED_MODULE_6__.isAndroid && !cacheWebViewId[this.getId()]) {
      this.readyForRender = false;
      this.detachWebViewReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(document, {
        'nbcomponent.canrender': this.onNativeReady,
      });
    } else {
      this.readyForRender = true;
      this.renderWebView();
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    this.renderWebView();
  },
  componentWillUnmount: function componentWillUnmount() {
    this.clearRenderDelay();
    document.body.removeChild(this.webview_container);
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_4__.default)('NBComponent.remove', {
      element: this.getId(),
    });
    this.documentEvents.remove();
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachWebViewReady) {
      this.detachWebViewReady.remove();
      this.detachWebViewReady = null;
    }
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_webview_${++id}`;
    return this.id;
  },
  getWebViewContainer: function getWebViewContainer() {
    if (this.webview_container) {
      return this.webview_container;
    }
    this.webview_container = document.createElement('div');
    document.body.appendChild(this.webview_container);
    return this.webview_container;
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheWebViewId[this.getId()] = true;
      this.renderWebView();
    }
  },
  renderWebView: function renderWebView() {
    if (!this.readyForRender) {
      return;
    }
    this.clearRenderDelay();
    const _props = this.props;
    const { src } = _props;
    const { enableWK } = _props;
    const { appId } = _props;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_4__.default)('NBComponent.render', {
      element: this.getId(),
      props: {
        src,
        appId,
        enableWK,
      },
    });
  },
  onMessage: function onMessage(res) {
    const _res$data = res.data;
    const { type } = _res$data;
    const { element } = _res$data;
    const { onMessage } = this.props;

    if (this.id === element && type === 'message' && onMessage) {
      onMessage(this.props.$mp.getNormalizedEvent('message', {
        detail: res.data.detail,
      }));
    }
  },
  render: function render() {
    if (!_utils_system__WEBPACK_IMPORTED_MODULE_6__.isNativeComponent) {
      return react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.createPortal(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        null,
        '\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301web-view\u7EC4\u4EF6',
      ), this.getWebViewContainer());
    }
    return react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.createPortal(react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
      'object',
      { className: `nbcomponentanimation-${this.getId()}`,
        type: 'application/view',
        role: 'application',
        style: {
          position: 'fixed',
          top: '0px',
          left: '0px',
          bottom: '0px',
          right: '0px',
          width: '100%',
          height: '100%',
        } },
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'type', value: 'web-view' }),
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'id', value: this.getId() }),
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'appId', value: this.props.appId }),
    ), this.getWebViewContainer());
  },
}));
/* harmony default export */ __webpack_exports__.default = (WebView);
