
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ "./node_modules/babel-runtime-loose/helpers/extends.js");
/* harmony import */ var babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ "./node_modules/create-react-class/index.js");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var zscroller__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! zscroller */ "./node_modules/zscroller/es/DOMScroller.js");




var prefixCls = 'a-picker-view-picker';
var Picker = create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
    statics: {
        Item: function Item() {},
        getDerivedStateFromProps: function getDerivedStateFromProps(props) {
            if ('selectedValue' in props) {
                return {
                    selectedValue: props.selectedValue
                };
            }
            return null;
        }
    },
    getInitialState: function getInitialState() {
        var selectedValueState ;
        var _props = this.props,
            selectedValue = _props.selectedValue,
            defaultSelectedValue = _props.defaultSelectedValue,
            children = _props.children;

        if (selectedValue !== undefined) {
            selectedValueState = selectedValue;
        } else if (defaultSelectedValue !== undefined) {
            selectedValueState = defaultSelectedValue;
        } else {
            var childrenArray = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(children);
            selectedValueState = childrenArray && childrenArray[0] && childrenArray[0].props.value;
        }
        return {
            selectedValue: selectedValueState
        };
    },
    componentDidMount: function componentDidMount() {
        var _refs = this.refs,
            content = _refs.content,
            indicator = _refs.indicator,
            mask = _refs.mask,
            component = _refs.component;

        var rootHeight = component.getBoundingClientRect().height;
        // https://github.com/react-component/m-picker/issues/18
        var itemHeight = this.itemHeight = indicator.getBoundingClientRect().height;
        var length = Math.floor((rootHeight - itemHeight) / 2);
        content.style.padding = length + 'px 0';
        indicator.style.top = length + 'px';
        mask.style.backgroundSize = '100% ' + length + 'px';
        if (content) {
            var children = content.children || [];
            for (var i = 0; i < children.length; i++) {
                var node = children[i];
                node.style.height = itemHeight + 'px';
                node.style.lineHeight = itemHeight + 'px';
            }
        }
        this.zscroller = new zscroller__WEBPACK_IMPORTED_MODULE_3__["default"](content, {
            scrollingX: false,
            snapping: true,
            locking: false,
            penetrationDeceleration: 0.1,
            minVelocityToKeepDecelerating: 0.5,
            scrollingComplete: this.scrollingComplete
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
        var children = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(this.props.children);
        for (var i = 0, len = children.length; i < len; i++) {
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
        var _zscroller$scroller$g = this.zscroller.scroller.getValues(),
            top = _zscroller$scroller$g.top;

        if (top >= 0) {
            this.doScrollingComplete(top);
        }
    },
    doScrollingComplete: function doScrollingComplete(top) {
        var index = top / this.itemHeight;
        var floor = Math.floor(index);
        if (index - floor > 0.5) {
            index = floor + 1;
        } else {
            index = floor;
        }
        var children = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(this.props.children);
        index = Math.min(index, children.length - 1);
        var child = children[index];
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
                    selectedValue: selectedValue
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
        var children = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.toArray(this.props.children);
        return children && children[0] && children[0].props.value;
    },
    render: function render() {
        var props = this.props;
        var itemStyle = props.itemStyle,
            _props$indicatorStyle = props.indicatorStyle,
            indicatorStyle = _props$indicatorStyle === undefined ? {} : _props$indicatorStyle,
            _props$indicatorClass = props.indicatorClassName,
            indicatorClassName = _props$indicatorClass === undefined ? '' : _props$indicatorClass,
            children = props.children,
            _props$maskClassName = props.maskClassName,
            maskClassName = _props$maskClassName === undefined ? '' : _props$maskClassName,
            _props$maskStyle = props.maskStyle,
            maskStyle = _props$maskStyle === undefined ? {} : _props$maskStyle;
        var selectedValue = this.state.selectedValue;

        var itemClassName = prefixCls + '-item';
        var selectedItemClassName = itemClassName + ' ' + prefixCls + '-item-selected';
        var map = function map(item) {
            var _item$props = item.props,
                _item$props$className = _item$props.className,
                className = _item$props$className === undefined ? '' : _item$props$className,
                style = _item$props.style,
                value = _item$props.value;

            var styleFromIndicator = indicatorStyle.height && {
                height: indicatorStyle.height,
                lineHeight: indicatorStyle.height
            };
            return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
                'div',
                { style: Object.assign({}, itemStyle, style, styleFromIndicator), className: (selectedValue === value ? selectedItemClassName : itemClassName) + ' ' + className, key: value },
                item.children || item.props.children
            );
        };
        // compatibility for preact
        var items = react__WEBPACK_IMPORTED_MODULE_1___default.a.Children ? react__WEBPACK_IMPORTED_MODULE_1___default.a.Children.map(children, map) : [].concat(children).map(map);
        return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
            'div',
            { className: prefixCls + ' ' + (props.className || ''), ref: 'component', style: props.style },
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: prefixCls + '-mask ' + maskClassName, style: maskStyle, ref: 'mask' }),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement('div', { className: prefixCls + '-indicator ' + indicatorClassName, ref: 'indicator', style: indicatorStyle }),
            react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
                'div',
                { className: prefixCls + '-content', ref: 'content' },
                items
            )
        );
    }
});
/* harmony default export */ __webpack_exports__["default"] = (Picker);

