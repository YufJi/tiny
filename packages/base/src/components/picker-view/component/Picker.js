__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const zscroller__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! zscroller */ './node_modules/zscroller/es/DOMScroller.js');

const prefixCls = 'a-picker-view-picker';
const Picker = create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  statics: {
    Item: function Item() {},
    getDerivedStateFromProps: function getDerivedStateFromProps(props) {
      if ('selectedValue' in props) {
        return {
          selectedValue: props.selectedValue,
        };
      }
      return null;
    },
  },
  getInitialState: function getInitialState() {
    let selectedValueState;
    const _props = this.props;
    const { selectedValue } = _props;
    const { defaultSelectedValue } = _props;
    const { children } = _props;

    if (selectedValue !== undefined) {
      selectedValueState = selectedValue;
    } else if (defaultSelectedValue !== undefined) {
      selectedValueState = defaultSelectedValue;
    } else {
      const childrenArray = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(children);
      selectedValueState = childrenArray && childrenArray[0] && childrenArray[0].props.value;
    }
    return {
      selectedValue: selectedValueState,
    };
  },
  componentDidMount: function componentDidMount() {
    const _refs = this.refs;
    const { content } = _refs;
    const { indicator } = _refs;
    const { mask } = _refs;
    const { component } = _refs;

    const rootHeight = component.getBoundingClientRect().height;
    // https://github.com/react-component/m-picker/issues/18
    const itemHeight = this.itemHeight = indicator.getBoundingClientRect().height;
    const length = Math.floor((rootHeight - itemHeight) / 2);
    content.style.padding = `${length}px 0`;
    indicator.style.top = `${length}px`;
    mask.style.backgroundSize = `100% ${length}px`;
    if (content) {
      const children = content.children || [];
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        node.style.height = `${itemHeight}px`;
        node.style.lineHeight = `${itemHeight}px`;
      }
    }
    this.zscroller = new zscroller__WEBPACK_IMPORTED_MODULE_3__.default(content, {
      scrollingX: false,
      snapping: true,
      locking: false,
      penetrationDeceleration: 0.1,
      minVelocityToKeepDecelerating: 0.5,
      scrollingComplete: this.scrollingComplete,
    });
    this.zscroller.setDisabled(this.props.disabled);
    this.zscroller.scroller.setSnapSize(0, itemHeight);
    this.select(this.state.selectedValue);
  },
  shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
    return this.state.selectedValue !== nextState.selectedValue || this.props.children !== nextProps.children;
  },
  componentDidUpdate: function componentDidUpdate() {
    this.zscroller.setDisabled(this.props.disabled);
    this.zscroller.reflow();
    this.select(this.state.selectedValue);
  },
  componentWillUnmount: function componentWillUnmount() {
    this.zscroller.destroy();
  },
  select: function select(value) {
    const children = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(this.props.children);
    for (let i = 0, len = children.length; i < len; i++) {
      if (children[i].props.value === value) {
        this.selectByIndex(i);
        return;
      }
    }
    this.selectByIndex(0);
  },
  selectByIndex: function selectByIndex(index) {
    if (index < 0 || index >= react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.count(this.props.children) || !this.itemHeight) {
      return;
    }
    this.zscroller.scroller.scrollTo(0, index * this.itemHeight, false);
  },
  scrollingComplete: function scrollingComplete() {
    const _zscroller$scroller$g = this.zscroller.scroller.getValues();
    const { top } = _zscroller$scroller$g;

    if (top >= 0) {
      this.doScrollingComplete(top);
    }
  },
  doScrollingComplete: function doScrollingComplete(top) {
    let index = top / this.itemHeight;
    const floor = Math.floor(index);
    if (index - floor > 0.5) {
      index = floor + 1;
    } else {
      index = floor;
    }
    const children = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(this.props.children);
    index = Math.min(index, children.length - 1);
    const child = children[index];
    if (child) {
      this.fireValueChange(child.props.value);
    } else if (console.warn) {
      console.warn('child not found', children, index);
    }
  },
  fireValueChange: function fireValueChange(selectedValue) {
    if (selectedValue !== this.state.selectedValue) {
      if (!('selectedValue' in this.props)) {
        this.setState({
          selectedValue,
        });
      }
      if (this.props.onValueChange) {
        this.props.onValueChange(selectedValue);
      }
    }
  },
  getValue: function getValue() {
    if ('selectedValue' in this.props) {
      return this.props.selectedValue;
    }
    const children = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(this.props.children);
    return children && children[0] && children[0].props.value;
  },
  render: function render() {
    const { props } = this;
    const { itemStyle } = props;
    const _props$indicatorStyle = props.indicatorStyle;
    const indicatorStyle = _props$indicatorStyle === undefined ? {} : _props$indicatorStyle;
    const _props$indicatorClass = props.indicatorClassName;
    const indicatorClassName = _props$indicatorClass === undefined ? '' : _props$indicatorClass;
    const { children } = props;
    const _props$maskClassName = props.maskClassName;
    const maskClassName = _props$maskClassName === undefined ? '' : _props$maskClassName;
    const _props$maskStyle = props.maskStyle;
    const maskStyle = _props$maskStyle === undefined ? {} : _props$maskStyle;
    const { selectedValue } = this.state;

    const itemClassName = `${prefixCls}-item`;
    const selectedItemClassName = `${itemClassName} ${prefixCls}-item-selected`;
    const map = function map(item) {
      const _item$props = item.props;
      const _item$props$className = _item$props.className;
      const className = _item$props$className === undefined ? '' : _item$props$className;
      const { style } = _item$props;
      const { value } = _item$props;

      const styleFromIndicator = indicatorStyle.height && {
        height: indicatorStyle.height,
        lineHeight: indicatorStyle.height,
      };
      return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { style: { ...itemStyle, ...style, ...styleFromIndicator }, className: `${selectedValue === value ? selectedItemClassName : itemClassName} ${className}`, key: value },
        item.children || item.props.children,
      );
    };
    // compatibility for preact
    const items = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children ? react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.map(children, map) : [].concat(children).map(map);
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      'div',
      { className: `${prefixCls} ${props.className || ''}`, ref: 'component', style: props.style },
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: `${prefixCls}-mask ${maskClassName}`, style: maskStyle, ref: 'mask' }),
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: `${prefixCls}-indicator ${indicatorClassName}`, ref: 'indicator', style: indicatorStyle }),
      react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
        'div',
        { className: `${prefixCls}-content`, ref: 'content' },
        items,
      ),
    );
  },
});
/* harmony default export */ __webpack_exports__.default = (Picker);
