__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_3___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/callInternalAPI */ './src/utils/callInternalAPI.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./index.less */ './src/cdp/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_8__);

let id = 0;
const cacheCdpId = {};
const g10150 = false; // compareSystemVersion('10.1.50') >= 0;
const Cdp = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.createComponent)({
  name: 'cdp',
})(create_react_class__WEBPACK_IMPORTED_MODULE_3___default()({
  displayName: 'Cdp',
  getDefaultProps: function getDefaultProps() {
    return {
      spaceCode: '',
      extInfo: {},
      immediately: false,
      style: {},
      enableNative: false,
    };
  },
  getInitialState: function getInitialState() {
    this.appId = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getStartupParams)().appId;
    this.objectId = '';
    this.useNewNaitveCdp = _utils_system__WEBPACK_IMPORTED_MODULE_7__.isNativeComponent && g10150 && this.props.enableNative;
    return {
      error: false,
      cdpInfo: {},
      height: 1,
    };
  },
  componentDidMount: function componentDidMount() {
    const _this = this;

    this.cdpEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
      'nbcomponent.image.bindtap': this.onTap,
      'nbcomponent.cdp.cdpRenderSuccess': this.onCdpRenderSuccess,
      'nbcomponent.cdp.cdpRenderFail': this.onCdpRenderFail,
      'nbcomponent.cdp.stopAnimation': this.onCdpStopAnimation,
      'nbcomponent.cdp.startAnimation': this.onCdpStartAnimation,
    });
    if (this.useNewNaitveCdp) {
      if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isAndroid && !cacheCdpId[this.getId()]) {
        this.readyForRender = false;
        this.detachCdpReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__.default)(document, {
          'nbcomponent.canrender': this.onNativeReady,
        });
      } else {
        this.readyForRender = true;
        this.renderCdp();
      }
      return;
    }
    const { width } = window.getComputedStyle(this.root);
    this.setState({
      width: parseInt(width),
    });
    this.queryCdpSuccess = true;
    this.queryCdp();
    this.queryTimer = setTimeout(() => {
      _this.queryCdpSuccess = false;
      _this.setState({
        error: true,
      });
      _this.onQueryCdpFail();
    }, 2000);
  },
  componentDidUpdate: function componentDidUpdate() {
    if (this.useNewNaitveCdp) {
      this.renderCdp();
      return;
    }
    const { $mp } = this.props;
    const { cdpInfo } = this.state;

    if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isNativeComponent && cdpInfo.spaceObjectList && cdpInfo.spaceObjectList.length > 0) {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.render', {
        version: '2.0',
        element: this.getId(),
        data: {
          src: $mp.getNormalizedSrc(cdpInfo.spaceObjectList[0].hrefUrl),
        },
      });
      document.dispatchEvent(new CustomEvent('pageReRender', {}));
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.detachCdpReady) {
      this.detachCdpReady.remove();
    }
    if (this.cdpEvents) {
      this.cdpEvents.remove();
    }
    if (this.useNewNaitveCdp) {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.remove', {
        element: this.getId(),
      });
      return;
    }
    const { spaceCode } = this.props;
    const { cdpInfo } = this.state;

    if (this.objectId !== '') {
      Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('cdpFeedback', {
        spaceCode,
        objectId: this.objectId,
        behavior: 'CLOSE',
      });
    }
    if (_utils_system__WEBPACK_IMPORTED_MODULE_7__.isNativeComponent && cdpInfo.spaceObjectList && cdpInfo.spaceObjectList.length > 0) {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.remove', {
        element: this.getId(),
      });
    }
    if (this.queryTimer) {
      clearTimeout(this.queryTimer);
      this.queryTimer = null;
    }
  },
  logSpmExpoOrClick: function logSpmExpoOrClick(spmId, actionId) {
    const { spaceCode } = this.props;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('remoteLog', {
      type: 'monitor',
      bizType: 'TINYAPP',
      logLevel: 2,
      param1: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.getCurrentPageImpl)().getPagePath(),
      param4: `spaceCode=${spaceCode}`,
      spmId,
      actionId,
    });
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheCdpId[this.getId()] = true;
      this.renderCdp();
    }
  },
  onQueryCdpFail: function onQueryCdpFail() {
    const _props = this.props;
    const { $mp } = _props;
    const { onRenderFail } = _props;

    if (onRenderFail) {
      onRenderFail($mp.getNormalizedEvent('renderFail'));
    }
  },
  onQueryCdpScuccess: function onQueryCdpScuccess() {
    const _props2 = this.props;
    const { $mp } = _props2;
    const { onRenderSuccess } = _props2;

    if (onRenderSuccess) {
      onRenderSuccess($mp.getNormalizedEvent('renderSuccess'));
    }
  },
  onTap: function onTap(_ref) {
    const { element } = _ref.data;
    const { id } = _ref.target;

    if (element === this.getId() || id === this.getId()) {
      const { cdpInfo } = this.state;
      const { spaceCode } = this.props;

      const link = cdpInfo.spaceObjectList[0].actionUrl;
      Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('cdpFeedback', {
        spaceCode,
        objectId: this.objectId,
        behavior: 'CLICK',
      });
      this.logSpmExpoOrClick('a192.b7491.c18251.d32993', 'clicked');
      if (link.indexOf('alipays://platformapi/startapp') === 0) {
        let aEl = document.createElement('a');
        aEl.href = link;
        aEl.click();
        aEl = null;
      } else if (link.indexOf('http') === -1) {
        Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('startApp', {
          appId: '20000067',
          param: {
            url: link,
          },
        });
      }
    }
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_cdp_${++id}`;
    return this.id;
  },
  queryCdp: function queryCdp() {
    const _this2 = this;

    const _props3 = this.props;
    const { spaceCode } = _props3;
    const { extInfo } = _props3;

    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('getCdpSpaceInfo', {
      spaceCode,
      extInfo,
      immediately: false,
      multiCallback: true,
    }, (res) => {
      if (!res.error && res.spaceObjectList && res.spaceObjectList.length > 0) {
        const { tinyAppid } = res.spaceObjectList[0].bizExtInfo;
        if (tinyAppid && tinyAppid.indexOf(_this2.appId) === -1) {
          _this2.doFail();
        } else if (_this2.queryCdpSuccess) {
          clearTimeout(_this2.queryTimer);
          _this2.queryTimer = null;
          _this2.objectId = res.spaceObjectList[0].objectId;
          _this2.setState({
            cdpInfo: res,
          });
          _this2.logSpmExpoOrClick('a192.b7491.c18251.d32993', 'exposure');
          _this2.onQueryCdpScuccess();
          Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('cdpFeedback', {
            spaceCode,
            objectId: _this2.objectId,
            behavior: 'SHOW',
          });
        }
      } else {
        _this2.doFail();
      }
    });
  },
  doFail: function doFail() {
    clearTimeout(this.queryTimer);
    this.queryTimer = null;
    this.onQueryCdpFail();
    this.setState({
      error: true,
    });
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachCdpReady) {
      this.detachCdpReady.remove();
      this.detachCdpReady = null;
    }
  },
  renderCdp: function renderCdp() {
    if (!this.readyForRender || !_utils_system__WEBPACK_IMPORTED_MODULE_7__.isNativeComponent) {
      return;
    }
    this.clearRenderDelay();
    const _props4 = this.props;
    const { spaceCode } = _props4;
    const { extInfo } = _props4;
    const { immediately } = _props4;

    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('NBComponent.render', {
      element: this.getId(),
      data: {
        spaceCode,
        extInfo,
        immediately,
      },
    });
  },
  onCdpRenderSuccess: function onCdpRenderSuccess(_ref2) {
    const _this3 = this;

    const _ref2$data = _ref2.data;
    const { element } = _ref2$data;
    const { height } = _ref2$data;
    const _props5 = this.props;
    const { onRenderSuccess } = _props5;
    const { $mp } = _props5;

    if (onRenderSuccess && element === this.getId()) {
      this.setState({
        height,
      }, () => {
        _this3.renderCdp();
      });
      onRenderSuccess($mp.getNormalizedEvent('renderSuccess'));
    }
  },
  onCdpRenderFail: function onCdpRenderFail(_ref3) {
    const { element } = _ref3.data;
    const _props6 = this.props;
    const { onRenderFail } = _props6;
    const { $mp } = _props6;

    if (onRenderFail && element === this.getId()) {
      onRenderFail($mp.getNormalizedEvent('renderFail'));
    }
  },
  onCdpStopAnimation: function onCdpStopAnimation(_ref4) {
    const { element } = _ref4.data;
    const _props7 = this.props;
    const { onAnimationStop } = _props7;
    const { $mp } = _props7;

    if (onAnimationStop && element === this.getId()) {
      onAnimationStop($mp.getNormalizedEvent('animationStop'));
    }
  },
  onCdpStartAnimation: function onCdpStartAnimation(_ref5) {
    const { element } = _ref5.data;
    const _props8 = this.props;
    const { onAnimationStart } = _props8;
    const { $mp } = _props8;

    if (onAnimationStart && element === this.getId()) {
      onAnimationStart($mp.getNormalizedEvent('animationStart'));
    }
  },
  saveRoot: function saveRoot(root) {
    this.root = root;
  },
  render: function render() {
    const _state = this.state;
    const { cdpInfo } = _state;
    const { width } = _state;
    const { error } = _state;
    const { height } = _state;
    const _props9 = this.props;
    const { style } = _props9;
    const { className } = _props9;
    const { id } = _props9;
    const { $mp } = _props9;

    if (error) {
      return null;
    }
    if (this.useNewNaitveCdp) {
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'object',
        { className: `${className} nbcomponentanimation-${this.getId()}`, style: { ...style, height: `${height}px` }, id, type: 'application/view', role: 'application' },
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('param', { name: 'type', value: 'cdp' }),
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('param', { name: 'id', value: this.getId() }),
      );
    }
    // 还没有返回有效数据
    if (!(cdpInfo.spaceObjectList && cdpInfo.spaceObjectList.length > 0)) {
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { style: { ...style, height: '1px' }, className: `${className}`, id: this.getId(), ref: this.saveRoot });
    }
    const cdpItem = cdpInfo.spaceObjectList[0];
    const cdpWidth = cdpItem.bizExtInfo.picWidth;
    const cdpHeight = cdpItem.bizExtInfo.picHeight;
    const { hrefUrl } = cdpItem;
    // 初始时知道了dom的宽度，等比例计算出高度
    const domHeight = (cdpHeight / cdpWidth * width).toFixed(2);
    // 当前运行环境不支持native渲染
    if (!_utils_system__WEBPACK_IMPORTED_MODULE_7__.isNativeComponent) {
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('img', { style: { ...style, height: `${domHeight}px` }, className, onClick: this.onTap, id: this.getId(), ref: this.saveRoot, src: $mp.getNormalizedSrc(hrefUrl) });
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { style: { ...style, height: `${domHeight}px` }, className: `nbcomponent ${className}`, id: this.getId(), 'nbcomponent-type': 'image', ref: this.saveRoot });
  },
}));
/* harmony default export */ __webpack_exports__.default = (Cdp);
