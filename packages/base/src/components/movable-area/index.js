__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./index.less */ './src/movable-area/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_3___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_3__);

const MovableArea = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_1__.createComponent)({
  name: 'movable-area',
})(create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'MovableArea',
  render: function render() {
    const _props = this.props;
    const { className } = _props;
    const { id } = _props;
    const { style } = _props;
    const { children } = _props;

    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(
      'div',
      { className, style, id, 'data-component': 'movable-area' },
      children,
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (MovableArea);
