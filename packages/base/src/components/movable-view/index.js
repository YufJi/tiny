__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _alipay_mp_es_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @alipay/mp/es/mixins/BasicEventMixin */ '../mp/es/mixins/BasicEventMixin.js');
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_4___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/upperFirstChar */ './src/utils/upperFirstChar.tsx');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./index.less */ './src/movable-view/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_7___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_7__);

function createTouchList() {
  const _this = this;

  const touchList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  const list = touchList && [].slice.call(touchList, 0) || [];
  return list.map((item) => {
    return {
      // or consider dpr
      x: item.pageX - _this.baseX,
      y: item.pageY - _this.baseY,
      identifier: item.identifier,
    };
  });
}
function createTap(nativeEvent, defaultCreateTap) {
  const _defaultCreateTap = defaultCreateTap(nativeEvent);
  const { detail } = _defaultCreateTap;

  detail.x = detail.pageX - this.baseX;
  detail.y = detail.pageY - this.baseY;
  return {
    detail,
  };
}
function getOnEvent(e) {
  return `on${Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_6__.default)(e)}`;
}
const MovableView = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_3__.createComponent)({
  name: 'movable-view',
})(create_react_class__WEBPACK_IMPORTED_MODULE_4___default()({
  displayName: 'MovableView',
  mixins: [Object(_alipay_mp_es_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_2__.default)({
    createTouchList,
    createTap,
  })],
  getDefaultProps: function getDefaultProps() {
    return {
      x: 0,
      y: 0,
      direction: 'none',
      disabled: false,
    };
  },
  componentDidMount: function componentDidMount() {
    this.initMovableView();
    this.MovableViewEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(this.root, {
      click: this.handleTap,
      touchstart: this.handleTouchStart,
      touchmove: this.handleTouchMove,
      touchend: this.handleTouchEnd,
      touchcancel: this.handleTouchCancel,
    });
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    const _props = this.props;
    const { x } = _props;
    const { y } = _props;
    const { direction } = _props;

    if (prevProps.x !== x || prevProps.y !== y || prevProps.direction !== direction) {
      this.initMovableView('');
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.MovableViewEvents.remove();
  },
  initMovableView: function initMovableView(source) {
    const _props2 = this.props;
    const { x } = _props2;
    const { y } = _props2;
    const { direction } = _props2;

    this.canXMove = !(direction !== 'horizontal' && direction !== 'all');
    this.canYMove = !(direction !== 'vertical' && direction !== 'all');
    this.calculateMaxTranslateVal();
    this.baseX = x;
    this.baseY = y;
    this.translateX = x;
    this.translateY = y;
    this.setTransform(x, y, 1, source);
  },
  checkParentIsValid: function checkParentIsValid() {
    return this.root.parentNode.dataset.component === 'movable-area';
  },
  calculateMaxTranslateVal: function calculateMaxTranslateVal() {
    const { parentNode } = this.root;
    const parentWidth = parentNode.offsetWidth;
    const parentHeight = parentNode.offsetHeight;
    const rootWidth = this.root.offsetWidth;
    const rootHeight = this.root.offsetHeight;
    // 容器宽度大于movable-view宽度
    if (parentWidth >= rootWidth) {
      this.maxTranslateX = parentWidth - rootWidth;
      this.minTranslateX = 0;
      // 容器宽度大于movable-view宽度，移动范围必须包含容器
    } else {
      this.maxTranslateX = 0;
      this.minTranslateX = parentWidth - rootWidth;
    }
    // 同上
    if (parentHeight >= rootHeight) {
      this.maxTranslateY = parentHeight - rootHeight;
      this.minTranslateY = 0;
    } else {
      this.maxTranslateY = 0;
      this.minTranslateY = parentHeight - rootHeight;
    }
  },
  fireTapAndTouchEvent: function fireTapAndTouchEvent(srcEvent, eventType) {
    const onType = getOnEvent(eventType);
    this[onType](srcEvent);
  },
  handleTap: function handleTap(e) {
    this.fireTapAndTouchEvent(e, 'tap');
  },
  handleTouchStart: function handleTouchStart(srcEvent) {
    this.fireTapAndTouchEvent(srcEvent, 'touchStart');
    const { disabled } = this.props;

    if (disabled || !this.checkParentIsValid()) {
      return;
    }
    // 禁止冒泡到 movable-area
    // e.stopPropagation();
    // e.preventDefault();
    if (this.canXMove) {
      this.baseX = this.translateX;
    }
    if (this.canYMove) {
      this.baseY = this.translateY;
    }
    const _srcEvent$touches$ = srcEvent.touches[0];
    const { pageX } = _srcEvent$touches$;
    const { pageY } = _srcEvent$touches$;

    this.startX = pageX;
    this.startY = pageY;
    this.firstMoveDirection = null;
    this.root.style.willChange = 'transform';
    this.isTouching = true;
  },
  handleTouchMove: function handleTouchMove(srcEvent) {
    const _props3 = this.props;
    const { disabled } = _props3;
    const { direction } = _props3;

    this.fireTapAndTouchEvent(srcEvent, 'touchMove');
    if (!disabled && this.checkParentIsValid() && this.isTouching) {
      // 禁止冒泡到 movable-area
      // e.stopPropagation();
      const _srcEvent$changedTouc = srcEvent.changedTouches[0];
      const { pageX } = _srcEvent$changedTouc;
      const { pageY } = _srcEvent$changedTouc;
      // 计算手势方向，首次move保存，知道end释放

      if (this.firstMoveDirection === null) {
        const xDist = Math.abs(this.startX - pageX) || 0;
        const yDist = Math.abs(this.startY - pageY) || 0;
        if (xDist > yDist) {
          this.firstMoveDirection = 'htouchmove';
        } else if (xDist < yDist) {
          this.firstMoveDirection = 'vtouchmove';
        }
      }
      if (this.canXMove) {
        this.translateX = this.translateX + pageX - this.startX;
        this.startX = pageX;
      }
      if (this.canYMove) {
        this.translateY = this.translateY + pageY - this.startY;
        this.startY = pageY;
      }
      if (this.firstMoveDirection === 'htouchmove' && direction === 'horizontal' || this.firstMoveDirection === 'vtouchmove' && direction === 'vertical' || direction === 'all') {
        srcEvent.preventDefault();
        this.setTransform(this.translateX, this.translateY, 1, 'touch');
      }
      // hTouchMove、vTouchMove暂时不暴露，touchMove事件需要包装ev，包含touchs信息，1.10版本暂不需要，具体实现待讨论
      // if (this.firstMoveDirection === 'htouchmove' && onHTouchMove) {
      //   this.fireTapAndTouchEvent(srcEvent, 'hTouchMove');
      // }
      //
      // if (this.firstMoveDirection === 'vtouchmove' && onVTouchMove) {
      //   this.fireTapAndTouchEvent(srcEvent, 'vTouchMove');
      // }
    }
  },
  handleTouchEnd: function handleTouchEnd(srcEvent) {
    this.fireTapAndTouchEvent(srcEvent, 'touchEnd');
    const _props4 = this.props;
    const { disabled } = _props4;
    const { $mp } = _props4;
    const { onChangeEnd } = _props4;

    if (disabled || !this.checkParentIsValid()) {
      return;
    }
    // 禁止冒泡到 movable-area
    // e.stopPropagation();
    this.startX = 0;
    this.startY = 0;
    this.isTouching = false;
    if (onChangeEnd) {
      onChangeEnd($mp.getNormalizedEvent('changeEnd', {
        detail: {
          x: this.translateX,
          y: this.translateY,
        },
      }));
    }
  },
  handleTouchCancel: function handleTouchCancel(srcEvent) {
    this.fireTapAndTouchEvent(srcEvent, 'touchCancel');
  },
  setTransform: function setTransform(x, y) {
    const scale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    const source = arguments[3];
    const _props5 = this.props;
    const { onChange } = _props5;
    const { $mp } = _props5;

    this.translateX = Math.min(this.maxTranslateX, x);
    this.translateX = Math.max(this.translateX, this.minTranslateX);
    this.translateY = Math.min(this.maxTranslateY, y);
    this.translateY = Math.max(this.translateY, this.minTranslateY);
    if (onChange && source !== undefined && (this.baseX !== this.translateX || this.baseY !== this.translateY)) {
      this.baseX = this.translateX;
      this.baseY = this.translateY;
      const changeEvt = $mp.getNormalizedEvent('change', {
        detail: {
          x: this.translateX,
          y: this.translateY,
          source: 'touch',
        },
      });
      onChange(changeEvt);
    }
    const transformVal = `translateX(${this.translateX}px) translateY(${this.translateY}px) translateZ(0px) scale(${scale})`;
    this.root.style.transform = transformVal;
    this.root.style.webkitTransform = transformVal;
  },
  saveRef: function saveRef(root) {
    this.root = root;
  },
  render: function render() {
    const _props6 = this.props;
    const { className } = _props6;
    const { id } = _props6;
    const { style } = _props6;
    const { children } = _props6;
    const { onTap } = _props6;
    const { catchTap } = _props6;

    let clickable = {};
    if (onTap || catchTap) {
      clickable = {
        'data-clickable': true,
      };
    }
    return react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(
      'div',
      { className, style, id, ref: this.saveRef, ...clickable },
      children,
    );
  },
}));
/* harmony default export */ __webpack_exports__.default = (MovableView);
