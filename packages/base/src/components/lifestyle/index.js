__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _shared_Loading__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/Loading */ './src/shared/Loading.tsx');
/* harmony import */ const _shared_Button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/Button */ './src/shared/Button.tsx');
/* harmony import */ const _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/callInternalAPI */ './src/utils/callInternalAPI.tsx');
/* harmony import */ const _utils_callBridge__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/callBridge */ './src/utils/callBridge.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./index.less */ './src/lifestyle/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_8__);

const prefixCls = 'a-lifestyle';
const requestLoadingStyle = {
  width: 20,
  height: 20,
};
const btnLoadingStyle = {
  width: 10,
  height: 10,
};
let current = null;
const Lifestyle = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.createComponent)({
  name: 'lifestyle',
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'Lifestyle',
  getInitialState: function getInitialState() {
    current = current || this;
    return {
      loading: true,
      btnLoading: true,
      error: '',
      name: 'test',
      followed: false,
      icon: 'https://gw.alipayobjects.com/zos/rmsportal/pGVdjcoWrmDEBDRnhsCc.jpg',
    };
  },
  componentDidMount: function componentDidMount() {
    if (current !== this) {
      return;
    }
    this.syncStatus();
    this.documentEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_7__.default)(document, {
      resume: this.syncStatus,
    });
    // 查看生活号
    this.logSpmExpoOrClick('a192.b8091.c19417', 'exposure');
  },
  componentWillUnmount: function componentWillUnmount() {
    current = null;
    if (this.documentEvents) {
      this.documentEvents.remove();
    }
  },
  logSpmExpoOrClick: function logSpmExpoOrClick(spmId, actionId) {
    // 'exposure'
    // 'clicked'
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('remoteLog', {
      type: 'monitor',
      bizType: 'TINYAPP',
      logLevel: 2,
      param1: Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.getCurrentPageImpl)().getPagePath(),
      spmId,
      actionId,
    });
  },
  syncStatus: function syncStatus() {
    const _this = this;

    const { publicId } = this.props;

    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('getLifestyleInfo', {
      publicId,
    }, (res) => {
      if ('error' in res) {
        console.log(res);
        // 不显示
        _this.setState({
          loading: false,
          btnLoading: false,
          error: true,
        });
      } else {
        if (res.logo) {
          res.logo = res.logo.replace(/\[pixelWidth\]/g, '128');
        }
        _this.setState({
          loading: false,
          btnLoading: false,
          followed: res.isFollowed,
          icon: res.logo,
          name: `${res.name} - 生活号`,
        });
      }
    });
  },
  addFollow: function addFollow() {
    const _this2 = this;

    const _props = this.props;
    const { publicId } = _props;
    const { onFollow } = _props;
    const { $mp } = _props;

    this.setState({
      btnLoading: true,
    });
    // 点击关注
    this.logSpmExpoOrClick('a192.b8091.c19417.d35174', 'clicked');
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('addFollow', {
      publicId,
      sourceId: 'tinyApp',
    }, (res) => {
      let followed = false;
      if (res.success === 'true') {
        followed = true;
        if (onFollow) {
          onFollow($mp.getNormalizedEvent('follow'));
        }
      }
      _this2.setState({
        btnLoading: false,
        followed,
      });
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('toast', { content: followed ? '关注成功' : '关注失败' });
    });
  },
  jumpToLifestyle: function jumpToLifestyle() {
    const { publicId } = this.props;
    // 点击查看

    this.logSpmExpoOrClick('a192.b8091.c19417.d35175', 'clicked');
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_5__.default)('startApp', {
      appId: '20000042',
      param: {
        publicBizType: 'LIFE_APP',
        publicId,
        sourceId: 'tinyApp',
      },
    });
  },
  jump: function jump(e) {
    const _this3 = this;

    e.stopPropagation();
    if (this.state.followed) {
      this.jumpToLifestyle();
    } else {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_6__.default)('confirm', {
        title: '提示',
        message: '确认关注此生活号?',
        okButton: '关注',
      }, (res) => {
        if (res.ok === true) {
          _this3.addFollow();
          // 二次确认框-关注
          _this3.logSpmExpoOrClick('a192.b8091.c19417.d35176', 'clicked');
        } else {
          // 二次确认框-取消
          _this3.logSpmExpoOrClick('a192.b8091.c19417.d35177', 'clicked');
        }
      });
    }
  },
  render: function render() {
    if (current !== this) {
      return null;
    }
    const _state = this.state;
    const { loading } = _state;
    const { followed } = _state;
    const { name } = _state;
    const { icon } = _state;
    const { error } = _state;
    const { btnLoading } = _state;

    if (error) {
      return null;
    }
    if (loading) {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { className: `${prefixCls} ${prefixCls}-loading` },
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_shared_Loading__WEBPACK_IMPORTED_MODULE_3__.default, { style: requestLoadingStyle }),
      );
    }
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
      'div',
      { className: prefixCls, onClick: this.jumpToLifestyle },
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { className: `${prefixCls}-name-wrap` },
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('img', { src: icon, className: `${prefixCls}-icon` }),
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
          'span',
          { className: `${prefixCls}-name` },
          name,
        ),
      ),
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { className: `${prefixCls}-btn-wrap` },
        btnLoading ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_shared_Loading__WEBPACK_IMPORTED_MODULE_3__.default, { style: btnLoadingStyle }) : react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
          _shared_Button__WEBPACK_IMPORTED_MODULE_4__.default,
          { className: `a-button ${prefixCls}-btn`, activeClassName: 'a-button-active', type: 'ghost', onClick: this.jump },
          followed ? '查看' : '关注',
        ),
      ),
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (Lifestyle);
