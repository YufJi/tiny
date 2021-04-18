
__webpack_require__.r(__webpack_exports__);
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! babel-runtime/helpers/extends */ './node_modules/babel-runtime-loose/helpers/extends.js');
/* harmony import */ const babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! classnames */ './node_modules/classnames/index.js');
/* harmony import */ const classnames__WEBPACK_IMPORTED_MODULE_3___default = /* #__PURE__ */__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ const _framework_dev__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/framework/ */ './src/framework/dev.tsx');
/* harmony import */ const _utils_addEvents__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/addEvents */ './src/utils/addEvents.tsx');
/* harmony import */ const _alipay_mp_es_framework_utils_unit__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @alipay/mp/es/framework/utils/unit */ '../mp/es/framework/utils/unit.js');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./index.less */ './src/swiper/index.less');
/* harmony import */ const _index_less__WEBPACK_IMPORTED_MODULE_7___default = /* #__PURE__ */__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_7__);

import React from 'react';
import createReactClass from 'create-react-class';
import { createComponent, getCurrentPageImpl } from '@/framework/';

const prefixCls = 'a-swiper';
export default createComponent({
  pure: false,
  name: 'swiper',
})(createReactClass({
  displayName: 'Swiper',
  getDefaultProps: function getDefaultProps() {
    return {
      indicatorDots: false,
      vertical: false,
      autoplay: false,
      circular: false,
      current: 0,
      interval: 5000,
      duration: 500,
      previousMargin: '0px',
      nextMargin: '0px',
    };
  },
  getInitialState: function getInitialState() {
    this.filterChildrenAndReturnCount();
    const _props = this.props;
    const { previousMargin } = _props;
    const { nextMargin } = _props;

    return {
      current: this.props.current,
      left: 0,
      top: 0,
      previousMargin: this.handleMarginUnit(previousMargin),
      nextMargin: this.handleMarginUnit(nextMargin),
    };
  },
  componentDidMount: function componentDidMount() {
    const _this = this;

    const { current } = this.state;

    const slideCount = this.filterChildrenAndReturnCount();
    if (current !== 0 && current <= slideCount && current >= 0) {
      this.goToSlide(current);
    }
    if (this.props.autoplay) {
      this.startAutoplay();
    }
    this.documentEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(document, {
      resume: function resume() {
        if (_this.props.autoplay) {
          _this.startAutoplay();
        }
      },
      pause: function pause() {
        if (_this.props.autoplay) {
          _this.stopAutoplay();
        }
      },
    });
    if (this.SlidesRef) {
      this.slidesTouchEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(this.SlidesRef, {
        touchmove: this.onSwiperNativeTouchMove,
      });
    }
    this.adjustHeight();
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    this.adjustHeight();
    const _props2 = this.props;
    const { current } = _props2;
    const { autoplay } = _props2;
    const { interval } = _props2;
    const { previousMargin } = _props2;
    const { nextMargin } = _props2;

    if (current !== prevProps.current && current !== this.state.current) {
      this.shouldHasTransitionDuration = true;
      this.goToSlide(current);
    }
    // 用户代码在onLoad中异步设置 slideCount。此时autoplay为true，需要触发startAutoplay
    if (autoplay === prevProps.autoplay && autoplay && !this.autoplayID) {
      this.startAutoplay();
    }
    if (autoplay !== prevProps.autoplay) {
      if (autoplay) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    }
    // 改变interval之后需要重新播放
    if (interval !== prevProps.interval && autoplay) {
      this.stopAutoplay();
      this.startAutoplay();
    }
    if (previousMargin !== prevProps.previousMargin) {
      this.setState({
        previousMargin: this.handleMarginUnit(previousMargin),
      });
    }
    if (nextMargin !== prevProps.nextMargin) {
      this.setState({
        nextMargin: this.handleMarginUnit(nextMargin),
      });
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.slidesEvents) {
      this.slidesEvents.remove();
      this.slidesEvents = null;
    }
    if (this.slidesTouchEvents) {
      this.slidesTouchEvents.remove();
      this.slidesTouchEvents = null;
    }
    if (this.documentEvents) {
      this.documentEvents.remove();
    }
    this.stopAutoplay();
  },
  adjustHeight: function adjustHeight() {
    const firstSlide = this.SlidesRef && this.SlidesRef.childNodes[0];
    if (!this.props.vertical && firstSlide && firstSlide.childNodes[0]) {
      const wrapHeight = parseInt(window.getComputedStyle(this.SwiperWrap).height);
      const firstSlideChildHeight = parseInt(window.getComputedStyle(firstSlide.childNodes[0]).height);
      if (wrapHeight !== firstSlideChildHeight) {
        this.SwiperWrap.style.height = `${firstSlideChildHeight}px`;
      }
    }
  },
  handleMarginUnit: function handleMarginUnit(margin) {
    let val = margin;
    if (margin.indexOf('rpx') >= 0) {
      val = Object(_alipay_mp_es_framework_utils_unit__WEBPACK_IMPORTED_MODULE_6__.rpx)(parseInt(margin) * 2);
    }
    return val;
  },

  // 过滤无效的child并且返回child个数
  filterChildrenAndReturnCount: function filterChildrenAndReturnCount() {
    const { children } = this.props;

    if (this.cacheChildren === children && this.cacheSlideCount !== undefined) {
      return this.cacheSlideCount;
    }
    const customChildren = [];
    React.Children.forEach(children, (item) => {
      // 值为null时需要剔除
      if (item) {
        customChildren.push(item);
      }
    });
    this.cacheChildren = children;
    this.cacheSlideCount = customChildren.length;
    this.handledChildren = customChildren;
    return this.cacheSlideCount;
  },
  saveSwiperWrap: function saveSwiperWrap(SwiperWrap) {
    this.SwiperWrap = SwiperWrap;
  },
  saveSlidesContainer: function saveSlidesContainer(SwiperContainer) {
    this.SwiperContainer = SwiperContainer;
  },
  saveSlidesRef: function saveSlidesRef(SlidesRef) {
    this.SlidesRef = SlidesRef;
  },
  autoplayIterator: function autoplayIterator() {
    const { current } = this.state;
    const { circular, duration, vertical } = this.props;

    const slideCount = this.filterChildrenAndReturnCount();
    this.touchmoving = false;
    // this.SlidesRef.childNodes[0] 可能会为undefined 难道动态删除了children??
    if (slideCount < 2) {
      return;
    }
    if (this.SlidesRef) {
      this.SlidesRef.style.transitionDuration = `${duration}ms`;
      this.SlidesRef.style.WebkitTransitionDuration = `${duration}ms`;
    }
    if (circular) {
      if (current + 1 >= slideCount) {
        const transformVal = vertical ? `translate3d(0, ${slideCount * 100}%, 0)` : `translate3d(${slideCount * 100}%, 0, 0)`;
        this.SlidesRef.childNodes[0].style.transform = transformVal;
        this.SlidesRef.childNodes[0].style.WebkitTransform = transformVal;
        this.goToSlide(0, 'touch', true);
      } else {
        this.goToSlide(current + 1, 'touch');
      }
    } else {
      current + 1 < slideCount ? this.goToSlide(current + 1, 'autoplay') : this.goToSlide(0, 'autoplay');
    }
  },
  startAutoplay: function startAutoplay() {
    const options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    this.stopAutoplay();
    // shouldHasTransitionDuration 处理组件初始化时渲染就有transitionDuration效果的问题
    this.shouldHasTransitionDuration = true;
    const _options$slideCount = options.slideCount;
    const slideCount = _options$slideCount === undefined ? this.filterChildrenAndReturnCount() : _options$slideCount;
    const _options$interval = options.interval;
    const interval = _options$interval === undefined ? this.props.interval : _options$interval;

    if (slideCount > 1) {
      this.autoplayID = setInterval(this.autoplayIterator, interval);
    }
  },
  stopAutoplay: function stopAutoplay() {
    if (this.autoplayID) {
      clearInterval(this.autoplayID);
      this.autoplayID = null;
    }
  },
  addSlideTransitionEnd: function addSlideTransitionEnd() {
    if (this.SlidesRef) {
      if (this.slidesEvents) {
        this.slidesEvents.remove();
        this.slidesEvents = null;
      }
      this.slidesEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_5__.default)(this.SlidesRef, {
        transitionend: this.onSliderTransitionEnd,
      });
    }
  },
  onSliderTransitionEnd: function onSliderTransitionEnd() {
    const _state = this.state;
    const { current } = _state;
    const { inCircular } = _state;

    const slideCount = this.filterChildrenAndReturnCount();
    const { vertical } = this.props;

    if (current === 0 || current === slideCount - 1 && inCircular) {
      const transformVal = vertical ? `translate3d(0, ${-current * 100}%, 0)` : `translate3d(${-current * 100}%, 0, 0)`;
      this.SlidesRef.style.transform = transformVal;
      this.SlidesRef.style.WebkitTransform = transformVal;
      if (slideCount === 2) {
        const twoChildTransformVal = vertical ? 'translate3d(0, -100%, 0)' : 'translate3d(-100%, 0, 0)';
        this.SlidesRef.childNodes[0].style.transform = twoChildTransformVal;
        this.SlidesRef.childNodes[0].style.WebkitTransform = twoChildTransformVal;
      } else if (this.SlidesRef.childNodes.length > 0) {
        this.SlidesRef.childNodes[0].style.transform = 'translate3d(0, 0, 0)';
        this.SlidesRef.childNodes[0].style.WebkitTransform = 'translate3d(0, 0, 0)';
      }
      this.shouldHasTransitionDuration = false;
      this.SlidesRef.style.transitionDuration = 0;
      this.SlidesRef.style.WebkitTransitionDuration = 0;
      this.setState({
        inCircular: false,
      });
    } else {
      this.shouldHasTransitionDuration = true;
    }
  },
  onSwiperNativeTouchMove: function onSwiperNativeTouchMove(e) {
    if (this.props.vertical) {
      e.preventDefault();
    } else if (this.touchObject && this.touchObject.direction !== undefined && this.touchObject.direction !== 0) {
      e.preventDefault();
    }
  },
  goToSlide: function goToSlide(index, source) {
    const _this2 = this;

    const inCircular = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const _props4 = this.props;
    const { vertical } = _props4;
    const { onChange } = _props4;
    const { current } = this.state;

    const slideCount = this.filterChildrenAndReturnCount();
    let targetOffset ;
    if (inCircular && index === 0) {
      targetOffset = this.getTargetOffset(null, slideCount);
    } else if (inCircular && index === slideCount - 1) {
      if (this.touchObject.direction === -1) {
        targetOffset = this.getTargetOffset(null, -1);
      } else {
        targetOffset = this.getTargetOffset(null, 0);
      }
    } else {
      targetOffset = this.getTargetOffset(null, index);
    }
    if (vertical) {
      this.setState({
        top: targetOffset,
        inCircular,
      });
    } else {
      this.setState({
        left: targetOffset,
        inCircular,
      });
    }
    this.setState({
      current: index,
    }, () => {
      if (onChange && current !== index && source !== undefined) {
        const e = _this2.props.$mp.getNormalizedEvent('change', {
          detail: {
            current: _this2.state.current,
            source,
          },
        });
        onChange(e);
      }
    });
  },
  onSwiperTouchStart: function onSwiperTouchStart(e) {
    this.touchObject = {
      startX: e.touches[0].pageX,
      startY: e.touches[0].pageY,
    };
    if (this.props.autoplay) {
      this.stopAutoplay();
    }
  },
  onSwiperTouchMove: function onSwiperTouchMove(e) {
    e.stopPropagation();
    const { current } = this.state;
    const _props5 = this.props;
    const { vertical } = _props5;
    const { circular } = _props5;

    const slideCount = this.filterChildrenAndReturnCount();
    const { touchObject } = this;

    const touchPoint = e.touches[0];
    const xDist = touchObject.startX - touchPoint.pageX || 0;
    const yDist = touchObject.startY - touchPoint.pageY || 0;
    touchObject.endX = touchPoint.pageX;
    touchObject.endY = touchPoint.pageY;
    // 计算手势方向，首次move保存，知道end释放
    if (touchObject.direction === undefined) {
      let direction = 0;
      const r = Math.atan2(yDist, xDist);
      let swipeAngle = Math.round(r * 180 / Math.PI);
      if (swipeAngle < 0) {
        swipeAngle = 360 - Math.abs(swipeAngle);
      }
      if (swipeAngle <= 45 && swipeAngle >= 0) {
        direction = 1;
      }
      if (swipeAngle <= 360 && swipeAngle >= 315) {
        direction = 1;
      }
      if (swipeAngle >= 135 && swipeAngle <= 225) {
        direction = -1;
      }
      if (vertical) {
        if (swipeAngle >= 35 && swipeAngle <= 135) {
          direction = 1;
        } else {
          direction = -1;
        }
      }
      touchObject.direction = direction;
    }
    // 更新移动距离
    if (touchObject.direction !== 0) {
      const distance = vertical ? yDist : xDist;
      touchObject.length = Math.abs(distance);
      const targetOffset = this.getTargetOffset(distance);
      // 第一次move的时候触发下setState，保证end的时候会触发render
      if (!this.touchmoving) {
        this.setState({
          left: vertical ? 0 : targetOffset,
          top: vertical ? targetOffset : 0,
          inCircular: false,
        });
        this.touchmoving = true;
      } else {
        let difference = 0;
        if (!circular) {
          if (current === 0 && touchObject.direction === -1) {
            difference = -(touchObject.length * 0.6);
          }
          if (current === slideCount - 1 && touchObject.direction === 1) {
            difference = touchObject.length * 0.6;
          }
        }
        let transform ;
        if (vertical) {
          transform = `translate3d(0, ${targetOffset + difference}px, 0)`;
        } else {
          transform = `translate3d(${targetOffset + difference}px, 0, 0)`;
        }
        this.SlidesRef.style.transform = transform;
        this.SlidesRef.style.WebkitTransform = transform;
      }
    }
  },

  // 处理swipe手势
  onSwiperTouchEnd: function onSwiperTouchEnd() {
    this.touchmoving = false;
    this.shouldHasTransitionDuration = true;
    const _props6 = this.props;
    const { circular } = _props6;
    const { autoplay } = _props6;
    const { vertical } = _props6;
    const { current } = this.state;

    const slideCount = this.filterChildrenAndReturnCount();
    const _touchObject = this.touchObject;
    const { direction } = _touchObject;
    const { length } = _touchObject;

    this.clickSafe = typeof length !== 'undefined' && length > 44;
    const calculatedLength = vertical ? this.SwiperContainer.offsetHeight : this.SwiperContainer.offsetWidth;
    if (direction !== 0) {
      if (length > calculatedLength / 5) {
        if (direction === 1) {
          if (circular) {
            if (current + 1 >= slideCount) {
              this.goToSlide(0, 'touch', true);
            } else {
              this.goToSlide(current + 1, 'touch');
            }
          } else {
            current + 1 < slideCount ? this.goToSlide(current + 1, 'touch') : this.goToSlide(current, 'touch');
          }
        } else if (direction === -1) {
          if (circular) {
            if (current === 0) {
              this.goToSlide(slideCount - 1, 'touch', true);
            } else {
              this.goToSlide(current - 1, 'touch');
            }
          } else {
            current > 0 ? this.goToSlide(current - 1, 'touch') : this.goToSlide(current, 'touch');
          }
        }
      } else {
        this.goToSlide(current, 'touch');
      }
    }
    if (autoplay) {
      this.startAutoplay();
    }
  },
  onSwiperClick: function onSwiperClick(e) {
    if (this.clickSafe) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
      }
    }
  },

  // 获取当前滑动时刻的偏移值
  getTargetOffset: function getTargetOffset(touchOffset, slide) {
    const { vertical } = this.props;
    const { current } = this.state;

    let offset = 0;
    let target = slide;
    if (target === undefined) {
      target = current;
    }
    // 代表是滑动结束时的偏移计算
    // if (circular && touchOffset === null && target === 0) {
    //   target === slideCount;
    // }
    const left = this.SwiperContainer.offsetWidth * target;
    const top = this.SwiperContainer.offsetHeight * target;
    offset -= touchOffset || 0;
    if (vertical) {
      return (top - offset) * -1;
    }
    return (left - offset) * -1;
  },
  getSlidesStyle: function getSlidesStyle() {
    const _props7 = this.props;
    const { duration } = _props7;
    const { vertical } = _props7;
    const { circular } = _props7;
    const _state2 = this.state;
    const { top } = _state2;
    const { left } = _state2;

    let slideStyles ;
    if (vertical) {
      slideStyles = {
        transform: `translate3d(0, ${top}px, 0)`,
        WebkitTransform: `translate3d(0, ${top}px, 0)`,
      };
    } else {
      slideStyles = {
        transform: `translate3d(${left}px, 0, 0)`,
        WebkitTransform: `translate3d(${left}px, 0, 0)`,
      };
    }
    if (!this.touchmoving && this.shouldHasTransitionDuration) {
      slideStyles.transitionDuration = `${duration}ms`;
      slideStyles.WebkitTransitionDuration = `${duration}ms`;
    }
    if (circular) {
      this.addSlideTransitionEnd();
    }
    return slideStyles;
  },
  getSlideStyle: function getSlideStyle(childIndex) {
    const _props8 = this.props;
    const { circular } = _props8;
    const { vertical } = _props8;

    let slideTransform = childIndex;
    // 无限循环未开启时
    if (circular) {
      const _state3 = this.state;
      const { current } = _state3;
      const { inCircular } = _state3;

      const slideCount = this.filterChildrenAndReturnCount();
      if (childIndex === 0 && slideCount !== 2) {
        if (current === slideCount - 1 || inCircular) {
          if (this.touchObject && this.touchObject.direction === 1) {
            slideTransform = slideCount;
          }
        }
      } else if (childIndex === slideCount - 1 && slideCount !== 2) {
        if (current === 0 && !inCircular || current === slideCount - 1 && inCircular) {
          slideTransform = -1;
        }
      }
    }
    const transformVal = vertical ? `translate3d(0, ${slideTransform * 100}%, 0)` : `translate3d(${slideTransform * 100}%, 0, 0)`;
    return {
      transform: transformVal,
      WebkitTransform: transformVal,
    };
  },
  getContainerStyle: function getContainerStyle() {
    const { vertical } = this.props;
    const _state4 = this.state;
    const { previousMargin } = _state4;
    const { nextMargin } = _state4;

    if (vertical) {
      return {
        top: `${previousMargin}`,
        bottom: `${nextMargin}`,
      };
    } else {
      return {
        left: `${previousMargin}`,
        right: `${nextMargin}`,
      };
    }
  },
  renderSlideItem: function renderSlideItem() {
    const _this3 = this;

    const _props9 = this.props;
    const { circular } = _props9;
    const { vertical } = _props9;

    const slideCount = this.filterChildrenAndReturnCount();
    const customChildren = this.handledChildren.map((item, childIndex) => {
      const childStyle = _this3.getSlideStyle(childIndex);
      return React.cloneElement(item, {
        style: childStyle,
        key: `${childIndex}-child`,
      });
    });
    if (circular) {
      if (slideCount === 2) {
        const firstChildTransformVal = vertical ? 'translate3d(0, 200%, 0)' : 'translate3d(200%, 0, 0)';
        customChildren.push(React.cloneElement(customChildren[0], {
          style: {
            transform: firstChildTransformVal,
            WebkitTransform: firstChildTransformVal,
          },
          key: 'duplicate-child-0',
        }));
        const secondChildTransformVal = vertical ? 'translate3d(0, -100%, 0)' : 'translate3d(-100%, 0, 0)';
        customChildren.unshift(React.cloneElement(customChildren[1], {
          style: {
            transform: secondChildTransformVal,
            WebkitTransform: secondChildTransformVal,
          },
          key: 'duplicate-child-1',
        }));
      } else if (slideCount > 2) {
        const len = customChildren.length;
        const lastChildTransformVal = vertical ? `translate3d(0, -${len * 100}%, 0)` : `translate3d(${len * 100}%, 0, 0)`;
        customChildren.push(React.cloneElement(customChildren[0], {
          style: {
            transform: lastChildTransformVal,
            WebkitTransform: lastChildTransformVal,
          },
          key: `duplicate-child-${len - 1}`,
        }));
      }
    }
    return customChildren;
  },
  renderIndicatorDots: function renderIndicatorDots() {
    const _props10 = this.props;
    const { indicatorDots } = _props10;
    const { indicatorColor } = _props10;
    const { indicatorActiveColor } = _props10;
    const { current } = this.state;

    const slideCount = this.filterChildrenAndReturnCount();
    const indicatorDotsArr = [];
    let indicatorDotsDom = null;
    if (indicatorDots) {
      for (let i = 0; i < slideCount; i++) {
        var _classNames;

        const dotCls = classnames__WEBPACK_IMPORTED_MODULE_3___default()((_classNames = {}, _classNames[`${prefixCls}-dot`] = true, _classNames[`${prefixCls}-dot-active`] = current === i, _classNames));
        const style = {};
        if (current === i && indicatorActiveColor) {
          style.backgroundColor = indicatorActiveColor;
        }
        if (current !== i && indicatorColor) {
          style.backgroundColor = indicatorColor;
        }
        indicatorDotsArr.push(React.createElement('div', { className: dotCls, style, key: `dot-${i}` }));
      }
      indicatorDotsDom = React.createElement(
        'div',
        { className: `${prefixCls}-indicator` },
        indicatorDotsArr,
      );
    }
    return indicatorDotsDom;
  },
  render: function render() {
    let _classNames2;

    const _props11 = this.props;
    const { style } = _props11;
    const { className } = _props11;
    const { vertical } = _props11;
    const { circular } = _props11;
    const { id } = _props11;

    const slideCount = this.filterChildrenAndReturnCount();
    const wrapCls = classnames__WEBPACK_IMPORTED_MODULE_3___default()((_classNames2 = {}, _classNames2[className] = true, _classNames2[`${prefixCls}-vertical`] = vertical, _classNames2[`${prefixCls}-circular`] = circular, _classNames2));
    let touchEvent = {};
    if (slideCount > 1) {
      touchEvent = {
        onTouchStart: this.onSwiperTouchStart,
        onTouchMove: this.onSwiperTouchMove,
        onTouchEnd: this.onSwiperTouchEnd,
        onTouchCancel: this.onSwiperTouchEnd,
      };
    }
    return React.createElement(
      'div',
      { ref: this.saveSwiperWrap, id, className: wrapCls, style },
      React.createElement(
        'div',
        { ref: this.saveSlidesContainer, style: this.getContainerStyle(), className: `${prefixCls}-container` },
        React.createElement(
          'div',
          { ref: this.saveSlidesRef, style: this.getSlidesStyle(), className: `${prefixCls}-slides`, onClick: this.onSwiperClick, ...touchEvent },
          this.renderSlideItem(),
        ),
      ),
      this.renderIndicatorDots(),
    );
  },
}));
