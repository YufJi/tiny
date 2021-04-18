
__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const react_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-dom */ './node_modules/react-dom/index.js');
/* harmony import */ const react_dom__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const _form_mixin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../form/mixin */ './src/form/mixin.tsx');
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! classnames */ './node_modules/classnames/index.js');
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_5___default = /* #__PURE__ */__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_6___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./index.less */ './src/slider/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_8___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_8__);


const prefixCls = 'a-slider';
function noop() {}
const Slider = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_3__.createComponent)({
  name: 'slider',
})(create_react_class__WEBPACK_IMPORTED_MODULE_6___default()({
  displayName: 'Slider',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_4__.default],
  getDefaultProps: function getDefaultProps() {
    return {
      min: 0,
      max: 100,
      step: 1,
      disabled: false,
      value: 0,
      showValue: false,
      onChange: noop,
      onChanging: noop,
    };
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    if (!('value' in this.props || 'min' in this.props || 'max' in this.props)) {
      return;
    }
    const { value } = this.props;

    const prevValue = this.state.value;
    if (prevProps.value === value) {
      return;
    }
    let nextValue = value !== undefined ? value : prevValue;
    nextValue = this.trimAlignValue(nextValue, this.props);
    if (prevValue !== nextValue) {
      this.setState({
        value: nextValue,
      });
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.removeDocumentEvents();
  },
  addDocumentTouchEvents: function addDocumentTouchEvents() {
    this.detachEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_7__.default)(document, {
      touchmove: this.onTouchMove,
      touchend: this.onTouchEnd,
    });
  },
  removeDocumentEvents: function removeDocumentEvents() {
    if (this.detachEvents) {
      this.detachEvents.remove();
    }
  },

  // 获取step精度，例如0.25的精度为2
  getPrecision: function getPrecision(step) {
    const stepString = `${step}`;
    let precision = 0;
    if (stepString.indexOf('.') >= 0) {
      precision = stepString.length - stepString.indexOf('.') - 1;
    }
    return precision;
  },
  trimAlignValue: function trimAlignValue(v) {
    const nextProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    const mergedProps = { ...this.props, ...nextProps };
    let val = v;
    if (v < mergedProps.min) {
      val = mergedProps.min;
    }
    if (v > mergedProps.max) {
      val = mergedProps.max;
    }
    const closestPoint = Math.round((val - mergedProps.min) / mergedProps.step) * mergedProps.step + mergedProps.min;
    return parseFloat(closestPoint.toFixed(this.getPrecision(mergedProps.step)));
  },
  calcValueByPos: function calcValueByPos(position) {
    const pixelOffset = position - this.sliderRef.getBoundingClientRect().left;
    const _props = this.props;
    const { min } = _props;
    const { max } = _props;

    const sliderLength = this.sliderRef.getBoundingClientRect().width;
    const ratio = Math.abs(Math.max(pixelOffset, 0) / sliderLength);
    const calcValue = ratio * (max - min) + min;
    return this.trimAlignValue(calcValue);
  },
  pauseEvent: function pauseEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  },
  onSliderTouchStart: function onSliderTouchStart(e) {
    let position = e.touches[0].pageX;
    if (e.target !== Object(react_dom__WEBPACK_IMPORTED_MODULE_2__.findDOMNode)(this.handleRef)) {
      this.dragOffset = 0;
    } else {
      const coords = e.target.getBoundingClientRect();
      const handlePosition = coords.left + coords.width * 0.5;
      position = handlePosition;
      this.dragOffset = position - handlePosition;
    }
    const value = this.calcValueByPos(position);
    if (value !== this.state.value) {
      this.onChanging(value);
    }
    this.addDocumentTouchEvents();
    this.pauseEvent(e);
  },
  onTouchMove: function onTouchMove(e) {
    const oldValue = this.state.value;

    const position = e.touches[0].pageX;
    const value = this.calcValueByPos(position - this.dragOffset);
    this.pauseEvent(e);
    if (value !== oldValue) {
      this.onChanging(value);
    }
  },
  onChanging: function onChanging(value) {
    const _this = this;

    this.setState({
      value,
    }, () => {
      const e = _this.props.$mp.getNormalizedEvent('changing', {
        detail: { value: _this.state.value },
      });
      _this.props.onChanging(e);
    });
  },
  onTouchEnd: function onTouchEnd() {
    this.removeDocumentEvents();
    const e = this.props.$mp.getNormalizedEvent('change', {
      detail: { value: this.state.value },
    });
    this.props.onChange(e);
  },
  saveSliderRef: function saveSliderRef(slider) {
    this.sliderRef = slider;
  },
  render: function render() {
    let _classNames;
    const _this2 = this;

    const _props2 = this.props;
    const { className } = _props2;
    const { style } = _props2;
    const { id } = _props2;
    const { min } = _props2;
    const { max } = _props2;
    const { disabled } = _props2;
    const { showValue } = _props2;
    const { activeColor } = _props2;
    const { backgroundColor } = _props2;
    const { trackSize } = _props2;
    const { handleSize } = _props2;
    const { handleColor } = _props2;
    const { value } = this.state;

    const sliderCls = classnames__WEBPACK_IMPORTED_MODULE_5___default()((_classNames = {}, _classNames[`${prefixCls}-content`] = true, _classNames[`${prefixCls}-disabled`] = disabled, _classNames));
    const offset = (value - min) / (max - min) * 100;
    const trackStyle = { width: `${offset}%` };
    const railStyle = {};
    const handleStyle = { left: `${offset}%` };
    if (activeColor) {
      trackStyle.backgroundColor = activeColor;
      handleStyle.borderColor = activeColor;
    }
    if (backgroundColor) {
      railStyle.backgroundColor = backgroundColor;
    }
    if (trackSize) {
      trackStyle.height = +trackSize;
      railStyle.height = +trackSize;
    }
    if (handleSize) {
      handleStyle.width = +handleSize;
      handleStyle.height = +handleSize;
      handleStyle.marginLeft = -handleSize / 2;
      handleStyle.marginTop = -(handleSize - (trackSize || 4)) / 2;
    }
    if (handleColor) {
      handleStyle.backgroundColor = handleColor;
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      'div',
      { className, id, style },
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { className: `${prefixCls}-wrapper` },
        react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
          'div',
          { ref: this.saveSliderRef, className: sliderCls, onTouchStart: disabled ? noop : this.onSliderTouchStart },
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: `${prefixCls}-rail`, style: railStyle }),
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: `${prefixCls}-track`, style: trackStyle }),
          react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: `${prefixCls}-handle`,
            style: handleStyle,
            ref: function ref(h) {
              return _this2.handleRef = h;
            } }),
        ),
      ),
      showValue && react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { className: `${prefixCls}-presentation` },
        value,
      ),
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (Slider);
