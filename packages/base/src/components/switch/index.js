__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ './node_modules/classnames/index.js');
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_3___default = /* #__PURE__ */__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ const _form_mixin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../form/mixin */ './src/form/mixin.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const _utils_system__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/system */ './src/utils/system.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./index.less */ './src/switch/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_7___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_7__);

const __rest = undefined && undefined.__rest || function (s, e) {
  const t = {};
  for (var p in s) {
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
  } if (s != null && typeof Object.getOwnPropertySymbols === 'function') {
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    }
  } return t;
};

const prefixCls = 'a-switch';
/* harmony default export */ __webpack_exports__.default = (Object(_framework_dev__WEBPACK_IMPORTED_MODULE_5__.createComponent)({
  name: 'switch',
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'Switch',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_4__.default],
  getDefaultProps: function getDefaultProps() {
    return {
      checked: false,
      valueProp: 'checked',
      controlled: false,
    };
  },
  onChange: function onChange(_ref) {
    const value = _ref.target.checked;
    const { controlled } = this.props;

    if (!controlled) {
      this.setState({
        value,
      });
    }
    if (this.props.onChange) {
      this.props.onChange(this.props.$mp.getNormalizedEvent('change', {
        detail: { value },
      }));
    }
  },
  render: function render() {
    let _classNames;
    let _classNames2;

    const _a = this.props;
    const { className } = _a;
    const { style } = _a;
    const { color } = _a;
    const { disabled } = _a;
    const { checked } = _a;
    const { onChange } = _a;
    const { valueProp } = _a;
    const { controlled } = _a;
    const restProps = __rest(_a, ['className', 'style', 'color', 'disabled', 'checked', 'onChange', 'valueProp', 'controlled']);
    const value = this.getCurrentValue();
    const wrapCls = classnames__WEBPACK_IMPORTED_MODULE_3___default()((_classNames = {}, _classNames[className] = true, _classNames[`${prefixCls}-android`] = _utils_system__WEBPACK_IMPORTED_MODULE_6__.isAndroid, _classNames));
    const fakeInputCls = classnames__WEBPACK_IMPORTED_MODULE_3___default()((_classNames2 = {}, _classNames2.checkbox = true, _classNames2['checkbox-disabled'] = disabled, _classNames2));
    const fakeStyle = style || {};
    if (color && value) {
      fakeStyle.backgroundColor = color;
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      'label',
      { className: wrapCls, role: 'switch', ...restProps },
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('input', { type: 'checkbox', className: `${prefixCls}-checkbox`, disabled, checked: value, onChange: this.onChange, value: value ? 'on' : 'off' }),
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: fakeInputCls, style: fakeStyle }),
    );
  },
})));
