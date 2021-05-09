__webpack_require__.r(__webpack_exports__);
/* harmony import */ const _component_MultiPicker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./component/MultiPicker */ './src/picker-view/component/MultiPicker.tsx');
/* harmony import */ const _component_Picker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component/Picker */ './src/picker-view/component/Picker.tsx');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _form_mixin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../form/mixin */ './src/form/mixin.tsx');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_5___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./index.less */ './src/picker-view/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_6___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_6__);

const PickerView = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_4__.createComponent)({
  pure: false,
  name: 'picker-view',
})(create_react_class__WEBPACK_IMPORTED_MODULE_5___default()({
  displayName: 'PickerView',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_3__.default],
  onChange: function onChange(value) {
    this.setState({
      value,
    });
    if (this.props.onChange) {
      this.props.onChange(this.props.$mp.getNormalizedEvent('change', {
        detail: {
          value,
        },
      }));
    }
  },
  render: function render() {
    const _this = this;

    const { props } = this;
    const indicatorStyle = this.props.$mp.getNormalizedStyle({
      style: props.indicatorStyle,
    });
    const maskStyle = this.props.$mp.getNormalizedStyle({
      style: props.maskStyle,
    });
    const children = react__WEBPACK_IMPORTED_MODULE_2___default.a.Children.map(this.props.children, (col) => {
      const items = react__WEBPACK_IMPORTED_MODULE_2___default.a.Children.map(col.props.children, (item, index) => {
        return react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(
          _component_Picker__WEBPACK_IMPORTED_MODULE_1__.default.Item,
          { value: index, style: _this.props.$mp.getNormalizedStyle(item.props), className: item.props.className },
          item.props.children,
        );
      });
      const colStyle = _this.props.$mp.getNormalizedStyle(col.props);
      // 避免和 ide 的 a-picker 冲突，导致 ide 样式问题
      return react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(
        _component_Picker__WEBPACK_IMPORTED_MODULE_1__.default,
        { className: col.props.className, style: colStyle, indicatorClassName: props.indicatorClass, indicatorStyle, maskClassName: props.maskClass, maskStyle },
        items,
      );
    });
    return react__WEBPACK_IMPORTED_MODULE_2___default.a.createElement(
      _component_MultiPicker__WEBPACK_IMPORTED_MODULE_0__.default,
      { selectedValue: this.state.value, onValueChange: this.onChange, id: props.id, className: props.className, style: props.style },
      children,
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (PickerView);
