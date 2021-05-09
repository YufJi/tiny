__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./index.less */ './src/live-pusher/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_6__);

let id = 0;
const cacheLivePusherId = {};
const LivePusher = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.createComponent)({
  name: 'live-pusher',
  trackPageUpdateForIOS: true,
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'LivePusher',
  getDefaultProps: function getDefaultProps() {
    return {
      url: '',
      mode: 'RTC',
      autopush: false,
      muted: false,
      enableCamera: true,
      autoFocus: true,
      orientation: false,
      beauty: 0,
      whiteness: 0,
      aspect: '9:16',
      minBitrate: 200,
      maxBitrate: 1000,
      waitingImage: undefined,
      waitingImageHash: undefined,
      zoom: false,
      backgroundMute: false,
      onStateChange: function onStateChange() {},
      onNetStatus: function onNetStatus() {},
      onError: function onError() {},
    };
  },
  componentDidMount: function componentDidMount() {
    // android bug
    if (_utils_system__WEBPACK_IMPORTED_MODULE_3__.isAndroid && !cacheLivePusherId[this.getId()]) {
      this.readyForRender = false;
      this.detachLivePusherReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
        'nbcomponent.canrender': this.onNativeReady,
      });
    } else {
      this.readyForRender = true;
      this.renderLivePusher();
    }
    this.detachEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
      'nbcomponent.live-pusher.onChangeState': this.onStateChange,
      'nbcomponent.live-pusher.onTimeUpdate': this.onNetStatus,
      'nbcomponent.live-pusher.onError': this.onError,
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    this.renderLivePusher();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.detachLivePusherReady) {
      this.detachLivePusherReady.remove();
    }
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__.default)('NBComponent.remove', {
      element: this.getId(),
    });
    this.detachEvents.remove();
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheLivePusherId[this.getId()] = true;
      this.renderLivePusher();
    }
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachLivePusherReady) {
      this.detachLivePusherReady.remove();
      this.detachLivePusherReady = null;
    }
  },
  renderLivePusher: function renderLivePusher() {
    if (!this.readyForRender || !_utils_system__WEBPACK_IMPORTED_MODULE_3__.isNativeComponent) {
      return;
    }
    this.clearRenderDelay();
    const { url } = this;
    const { mode } = this;
    const { autopush } = this;
    const { muted } = this;
    const { enableCamera } = this;
    const { autoFocus } = this;
    const { orientation } = this;
    const { beauty } = this;
    const { whiteness } = this;
    const { aspect } = this;
    const { minBitrate } = this;
    const { maxBitrate } = this;
    const { waitingImage } = this;
    const { waitingImageHash } = this;
    const { zoom } = this;
    const { backgroundMute } = this;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__.default)('NBComponent.render', {
      element: this.getId(),
      data: {
        url,
        mode,
        autopush,
        muted,
        enableCamera,
        autoFocus,
        orientation,
        beauty,
        whiteness,
        aspect,
        minBitrate,
        maxBitrate,
        waitingImage,
        waitingImageHash,
        zoom,
        backgroundMute,
      },
    });
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_live_pusher_${++id}`;
    return this.id;
  },
  onChangeState: function onChangeState(e) {
    const _e$data = e.data;
    const { element } = _e$data;
    const { code } = _e$data;
    const _props = this.props;
    const { onChangeState } = _props;
    const { $mp } = _props;

    if (this.getId() === element) {
      if (onChangeState) {
        onChangeState($mp.getNormalizedEvent('changeState', {
          detail: {
            code,
          },
        }));
      }
    }
  },
  onNetStatus: function onNetStatus(e) {
    const _e$data2 = e.data;
    const { element } = _e$data2;
    const { info } = _e$data2;
    const _props2 = this.props;
    const { onNetStatus } = _props2;
    const { $mp } = _props2;

    if (this.getId() === element) {
      if (onNetStatus) {
        onNetStatus($mp.getNormalizedEvent('netStatus', {
          detail: {
            info,
          },
        }));
      }
    }
  },
  onError: function onError(e) {
    const _e$data3 = e.data;
    const { element } = _e$data3;
    const { errMsg } = _e$data3;
    const { errCode } = _e$data3;
    const _props3 = this.props;
    const { onError } = _props3;
    const { $mp } = _props3;

    if (this.getId() === element) {
      if (onError) {
        onError($mp.getNormalizedEvent('error', {
          detail: {
            errMsg,
            errCode,
          },
        }));
      }
    }
  },
  render: function render() {
    const _props4 = this.props;
    const { style } = _props4;
    const { className } = _props4;
    const { id } = _props4;

    if (!_utils_system__WEBPACK_IMPORTED_MODULE_3__.isNativeComponent) {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { className, style, id },
        '\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301live-pusher\u7EC4\u4EF6',
      );
    }
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
      'object',
      { className: `${className} nbcomponentanimation-${this.getId()}`, style, id, type: 'application/view', role: 'application' },
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'type', value: 'live-pusher' }),
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'id', value: this.getId() }),
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (LivePusher);
