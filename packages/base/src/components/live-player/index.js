__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./index.less */ './src/live-player/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_6__);

let id = 0;
const cacheLivePlayerId = {};
const LivePlayer = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.createComponent)({
  name: 'live-player',
  trackPageUpdateForIOS: true,
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'LivePlayer',
  getDefaultProps: function getDefaultProps() {
    return {
      src: undefined,
      mode: 'live',
      autoplay: false,
      muted: false,
      orientation: 'vertical',
      objectFit: 'contain',
      backgroundMute: false,
      minCache: 1,
      maxCache: 3,
      onStateChange: function onStateChange() {},
      onNetStatus: function onNetStatus() {},
      onFullscreenChange: function onFullscreenChange() {},
      onError: function onError() {},
    };
  },
  componentDidMount: function componentDidMount() {
    // android bug
    if (_utils_system__WEBPACK_IMPORTED_MODULE_3__.isAndroid && !cacheLivePlayerId[this.getId()]) {
      this.readyForRender = false;
      this.detachLivePlayerReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
        'nbcomponent.canrender': this.onNativeReady,
      });
    } else {
      this.readyForRender = true;
      this.renderLivePlayer();
    }
    this.detachEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
      'nbcomponent.live-player.onChangeState': this.onStateChange,
      'nbcomponent.live-player.onTimeUpdate': this.onNetStatus,
      'nbcomponent.live-player.onFullscreenChange': this.onFullscreenChange,
      'nbcomponent.live-player.onError': this.onError,
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    this.renderLivePlayer();
  },
  componentWillUnmount: function componentWillUnmount() {
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__.default)('NBComponent.remove', {
      element: this.getId(),
    });
    this.detachEvents.remove();
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheLivePlayerId[this.getId()] = true;
      this.renderLivePlayer();
    }
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachLivePlayerReady) {
      this.detachLivePlayerReady.remove();
      this.detachLivePlayerReady = null;
    }
  },
  renderLivePlayer: function renderLivePlayer() {
    if (!this.readyForRender || !_utils_system__WEBPACK_IMPORTED_MODULE_3__.isNativeComponent) {
      return;
    }
    this.clearRenderDelay();
    const { src } = this;
    const { mode } = this;
    const { autoplay } = this;
    const { muted } = this;
    const { orientation } = this;
    const { objectFit } = this;
    const { backgroundMute } = this;
    const { minCache } = this;
    const { maxCache } = this;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_5__.default)('NBComponent.render', {
      element: this.getId(),
      data: {
        src,
        mode,
        autoplay,
        muted,
        orientation,
        objectFit,
        backgroundMute,
        minCache,
        maxCache,
      },
    });
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_live_player_${++id}`;
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
  onFullscreenChange: function onFullscreenChange(e) {
    const _e$data3 = e.data;
    const { element } = _e$data3;
    const { direction } = _e$data3;
    const { fullScreen } = _e$data3;
    const _props3 = this.props;
    const { onFullscreenChange } = _props3;
    const { $mp } = _props3;

    if (this.getId() === element) {
      if (onFullscreenChange) {
        onFullscreenChange($mp.getNormalizedEvent('fullscreenChange', {
          detail: {
            direction,
            fullScreen,
          },
        }));
      }
    }
  },
  onError: function onError(e) {
    const _e$data4 = e.data;
    const { element } = _e$data4;
    const { errMsg } = _e$data4;
    const { errCode } = _e$data4;
    const _props4 = this.props;
    const { onError } = _props4;
    const { $mp } = _props4;

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
    const _props5 = this.props;
    const { style } = _props5;
    const { className } = _props5;
    const { id } = _props5;

    if (!_utils_system__WEBPACK_IMPORTED_MODULE_3__.isNativeComponent) {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { className, style, id },
        '\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301live-player\u7EC4\u4EF6',
      );
    }
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
      'object',
      { className: `${className} nbcomponentanimation-${this.getId()}`, style, id, type: 'application/view', role: 'application' },
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'type', value: 'live-player' }),
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', { name: 'id', value: this.getId() }),
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (LivePlayer);
