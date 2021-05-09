__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _view_View__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../view/View */ './src/view/View.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_4___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ const _bridge_shared_getNavigateToMiniProgramOptions__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../bridge/shared/getNavigateToMiniProgramOptions */ './src/bridge/shared/getNavigateToMiniProgramOptions.tsx');

const Navigator = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_3__.createComponent)({
  pure: false,
  name: 'navigator',
})(create_react_class__WEBPACK_IMPORTED_MODULE_4___default()({
  displayName: 'Navigator',
  navigate: function navigate(api, params) {
    Object(_framework_dev__WEBPACK_IMPORTED_MODULE_3__.getCurrentPageImpl)().callRemote('bridge', api, params);
  },
  go: function go() {
    const _props = this.props;
    const { openType } = _props;
    const { url } = _props;
    const { delta } = _props;
    const { target } = _props;
    const { appId } = _props;
    const { $mp } = _props;
    const { bridge } = $mp;

    if (target === 'miniProgram' && appId) {
      bridge.call('navigateToMiniProgram', Object(_bridge_shared_getNavigateToMiniProgramOptions__WEBPACK_IMPORTED_MODULE_5__.default)(appId, this.props));
      return;
    }
    let apiName = 'navigateTo';
    if (openType === 'redirect') {
      apiName = 'redirectTo';
    } else if (openType === 'switchTab') {
      apiName = 'switchTab';
    } else if (openType === 'reLaunch') {
      apiName = 'reLaunch';
    } else if (openType === 'navigateBack') {
      apiName = 'navigateBack';
    } else if (openType === 'exit') {
      bridge.call('exitApp');
      return;
    }
    if (url) {
      this.navigate(apiName, { url, delta });
    }
  },
  render: function render() {
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      _view_View__WEBPACK_IMPORTED_MODULE_2__.default,
      { ...this.props, onTap: this.go, 'aria-label': '\u70B9\u51FB\u8DF3\u8F6C' },
      this.props.children,
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (Navigator);
