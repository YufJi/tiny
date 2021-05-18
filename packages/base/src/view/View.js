import Nerv, { createNervClass } from '@/nerv';
import addEvents from '@/utils/addEvents';
import isNodeVisible from '@/utils/isNodeVisible';
import throttle from '@/utils/throttle';
import objectKeys from '@/utils/objectKeys';
import {
  lengthCssPropNames,
  colorCssPropNames,
  translateProperties,
  rotateProperties,
  skewProperties,
  expandAnimation,
} from './utils';
import AnimationViewMixin from './AnimationViewMixin';

function transformUnit(v) {
  if (typeof v === 'number') {
    return `${v}px`;
  }
  return v;
}
function getDegreeTransform(property, value) {
  return `${property}(${value.map((s) => {
    return `${s}deg`;
  }).join(',')})`;
}
function getNormalTransform(property, value) {
  return `${property}(${value.join(',')})`;
}
function getTranslateTransform(property, value) {
  return `${property}(${value.map((s) => {
    return transformUnit(s);
  }).join(',')})`;
}
function removeTransform(transform, property) {
  if (transform) {
    const reg = new RegExp(`${property}\\([^)]+\\)`, 'gi');
    return transform.replace(reg, '');
  }
  return transform;
}
function getStyleFromAnimation(component, _animation, node) {
  const style = {};
  const animation = expandAnimation(_animation || []);
  let transform = node.style.transform || '';
  animation.forEach((a) => {
    const p = a[0];
    const value = a[1];
    if (lengthCssPropNames[p]) {
      style[p] = transformUnit(value[0]);
    } else if (colorCssPropNames[p]) {
      style[p] = value[0];
    } else {
      transform = removeTransform(transform, p);
      if (p === 'rotate3d') {
        const newValue = value.concat();
        if (newValue.length === 4) {
          newValue[3] += 'deg';
        }
        transform += ` ${p}(${newValue.join(',')})`;
      } else if (rotateProperties[p] || skewProperties[p]) {
        transform += ` ${getDegreeTransform(p, value)}`;
      } else if (translateProperties[p]) {
        transform += ` ${getTranslateTransform(p, value)}`;
      } else {
        transform += ` ${getNormalTransform(p, value)}`;
      }
    }
  });
  if (transform) {
    style.transform = transform.trim();
  }
  return component.props.$mp.getNormalizedStyle({ style });
}

export default createNervClass({
  displayName: 'View',

  mixins: [
    AnimationViewMixin,
  ],

  componentDidMount() {
    this.firstAppeared = false;
    this.checkVisible = throttle(this.checkVisible, 300, {
      leading: false,
    });
    this.handleAppear();
  },

  componentDidUpdate() {
    this.handleAppear();
  },

  componentWillUnMount() {
    this.removeAllScrollEventLister();
  },

  fireFirstAppear() {
    const { onFirstAppear, $mp } = this.props;

    if (onFirstAppear && !this.firstAppeared) {
      onFirstAppear($mp.getNormalizedEvent('firstAppear'));
      this.firstAppeared = true;
      if (!this.hasAppearEvent()) {
        this.removeAllScrollEventLister();
      }
    }
  },

  hasAppearEvent() {
    const { onAppear, onDisappear, onFirstAppear } = this.props;

    if (onFirstAppear && !this.firstAppeared) {
      return true;
    }
    return !!(onAppear || onDisappear);
  },

  removeAllScrollEventLister() {
    this.viewAppear = undefined;
    if (this.scrollEvent) {
      this.scrollEvent.remove();
      this.scrollEvent = null;
    }
    if (this.scrollParentEvent) {
      this.scrollParentEvent.remove();
      this.scrollParentEvent = null;
    }
  },

  getScrollParent() {
    if (this.scrollParent) {
      return this.scrollParent;
    }
    this.scrollParent = this.findScrollParent(this.root);
    return this.scrollParent;
  },

  handleAppear() {
    // 当外部传入的onAppear、onDisappear都不存在时，移除相关的事件监听
    if (!this.hasAppearEvent()) {
      this.removeAllScrollEventLister();
    } else {
      // 当viewAppear、alreadyAppear 未赋值时，做初始化
      if (this.viewAppear === undefined) {
        this.viewAppear = false;
      }
      this.checkVisible();
      if (!this.scrollEvent) {
        this.scrollEvent = addEvents(window, {
          scroll: this.checkVisible,
        });
      }
      if (!this.scrollParentEvent) {
        const scrollParent = this.getScrollParent();
        if (scrollParent) {
          this.scrollParentEvent = addEvents(scrollParent, {
            scroll: this.checkVisible,
          });
        }
      }
    }
  },
  findScrollParent(element) {
    const { parentNode } = element;
    if (parentNode && parentNode !== document.body) {
      const parentNodeStyle = window.getComputedStyle(parentNode);
      const parentNodeOverflowX = parentNodeStyle['overflow-x'];
      const parentNodeOverflowY = parentNodeStyle['overflow-y'];
      if (parentNodeOverflowX === 'auto' || parentNodeOverflowY === 'auto' || parentNodeOverflowX === 'scroll' || parentNodeOverflowY === 'scroll') {
        return parentNode;
      } else {
        return this.findScrollParent(parentNode);
      }
    } else {
      return undefined;
    }
  },
  checkVisible() {
    // 由于throttle的原因，在执行checkVisible时，this.root可能已经被销毁。
    if (!this.root) {
      return;
    }

    const { onAppear, onDisappear, appearOffset = 0, $mp } = this.props;

    const viewVisible = isNodeVisible(this.root, this.scrollParent, appearOffset);
    // 是否可见
    if (viewVisible) {
      // 之前不可见
      if (!this.viewAppear) {
        if (onAppear) {
          onAppear($mp.getNormalizedEvent('appear'));
        }
        this.fireFirstAppear();
      }
      this.viewAppear = true;
    } else {
      // 之前可见
      if (this.viewAppear && onDisappear) {
        onDisappear($mp.getNormalizedEvent('disappear'));
      }
      this.viewAppear = false;
    }
  },
  doAnimation() {
    const _this = this;

    const { props } = this;

    let time = 0;
    const { animation } = props;

    const rootStyle = this.root.style;
    const animationLength = animation.length;
    animation.forEach((anim, index) => {
      const { timeFunction, delay = 0, duration, transformOrigin } = anim.config;

      time += delay;
      _this.createAnimTimeout(() => {
        Object.assign(rootStyle, props.$mp.getNormalizedStyle({
          style: {
            transitionTimingFunction: timeFunction,
            transitionProperty: 'all',
            transitionDelay: `${delay}ms`,
            transitionDuration: `${duration}ms`,
            transformOrigin,
          },
        }));
        const animStyle = getStyleFromAnimation(_this, anim.animation, _this.root);
        _this.createAnimTimeout(() => {
          Object.assign(rootStyle, animStyle);
        }, 0);
        if (index === animationLength - 1) {
          const resetTime = duration + delay + 10;
          _this.createAnimTimeout(() => {
            _this.stopAnimation();
          }, resetTime);
        }
      }, time);
      time += duration + 10;
    });
  },
  stopAnimation() {
    this.deleteAllAnimTimers();
    const rootStyle = this.root.style;
    Object.assign(rootStyle, this.props.$mp.getNormalizedStyle({
      style: {
        transitionTimingFunction: '',
        transitionProperty: '',
        transitionDelay: '',
        transitionDuration: '',
        transformOrigin: '',
      },
    }));
  },
  saveRoot(root) {
    this.root = root;
  },
  render: function render() {
    const { props } = this;
    const { children, hidden, userProps, testProps = {}, tagName: TagName = 'div', $mp, ...rest } = props;

    let { style } = props;
    const touchableProps = {};

    if (props.hoverClass) {
      touchableProps.activeClassName = props.hoverClass;
    }
    if (props.hoverStartTime) {
      touchableProps.delayPressIn = props.hoverStartTime;
    }
    if (props.hoverStayTime) {
      touchableProps.delayPressOut = props.hoverStayTime;
    }
    // if (this.hasEvent('longtap')) {
    //   touchableProps.onLongPress = this.onLongTap;
    // }
    if (hidden) {
      style = { ...style, display: 'none' };
    }
    const clickable = {
      'data-clickable': true,
    };

    const content = Nerv.createElement(TagName, {
      className: props.className,
      style,
      id: props.id,
      ...clickable,
      ...this.props.$mp.getAriaProps(),
      ref: this.saveRoot,
      ...rest,
    }, children);

    return content;
  },
});
