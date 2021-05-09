__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./index.less */ './src/progress/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_3___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_3__);

const prefixCls = 'a-progress';
/* harmony default export */ __webpack_exports__.default = (Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__.createComponent)({
  name: 'progress',
})(create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  statics: {
    getDerivedStateFromProps: function getDerivedStateFromProps(props, state) {
      const { active } = props;
      const { percent } = props;

      let width;
      if (state.lastActive !== active && active) {
        width = 0;
      } else {
        width = `${percent}%`;
      }
      return {
        lastActive: active,
        width,
      };
    },
  },
  displayName: 'Progress',
  getInitialState: function getInitialState() {
    return {};
  },
  componentDidMount: function componentDidMount() {
    if (this.props.active) {
      this.updateWidth();
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    if (this.props.active !== prevProps.active && this.props.active) {
      this.updateWidth();
    }
  },
  updateWidth: function updateWidth() {
    const _this = this;

    setTimeout(() => {
      _this.setState({ width: `${_this.props.percent}%` });
    }, 10);
  },
  render: function render() {
    const _props = this.props;
    const { className } = _props;
    const { style } = _props;
    const { id } = _props;
    const { showInfo } = _props;
    const _props$percent = _props.percent;
    const percent = _props$percent === undefined ? 0 : _props$percent;
    const { strokeWidth } = _props;
    const { color } = _props;
    const { activeColor } = _props;
    const { backgroundColor } = _props;

    const outerStyle = backgroundColor ? { backgroundColor } : {};
    const barStyle = {
      borderColor: activeColor || color,
      width: this.state.width,
    };
    if (strokeWidth) {
      barStyle.borderBottomWidth = `${strokeWidth}px`;
    }
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
      'div',
      { className, style, id },
      react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { className: `${prefixCls}-container` },
        react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
          'div',
          { style: outerStyle, className: `${prefixCls}-outer`, role: 'progressbar', 'aria-valuenow': percent, 'aria-valuemin': 0, 'aria-valuemax': 100 },
          react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('div', { className: `${prefixCls}-bar`, style: barStyle }),
        ),
      ),
      showInfo && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
        'div',
        { role: 'presentation', className: `${prefixCls}-info` },
        `${percent}%`,
      ),
    );
  },
})));
