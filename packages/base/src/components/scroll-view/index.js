import Nerv, { createNervClass, findDOMNode } from '@/nerv';
import { createComponent, getCurrentPageImpl } from '@/framework/';
import throttle from '@/utils/throttle';
import addEvents from '@/utils/addEvents';
import { isIOS } from '@/utils/system';
import supportsPassive from '@/utils/supportsPassive';

function easeInOut(currentTime, start, change, duration) {
  currentTime /= duration / 2;
  if (currentTime < 1) {
    return change / 2 * currentTime * currentTime + start;
  }
  currentTime -= 1;
  return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
}
const BASE_SCROLL_DURATION = 1;
const STATE = {
  STOPPED: 0,
  TRIGGERED: 1,
};
const defaultStyle = {
  overflowY: 'hidden',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch',
};
const styles = {
  scrollX: {
    overflowY: 'hidden',
    overflowX: 'auto',
  },
  scrollY: {
    overflowX: 'hidden',
    overflowY: 'auto',
  },
};
const ScrollView = createComponent({
  pure: false,
  name: 'scroll-view',
})(createNervClass({
  displayName: 'ScrollView',
  getDefaultProps: function getDefaultProps() {
    return {
      scrollX: false,
      scrollY: false,
      upperThreshold: 50,
      lowerThreshold: 50,
      scrollLeft: 0,
      scrollTop: 0,
      scrollWithAnimation: false,
      enableBackToTop: false,
      trapScroll: false,
    };
  },
  componentDidMount: function componentDidMount() {
    const { enableBackToTop, scrollY } = this.props;

    this.onScroll = throttle(this.onScroll, 16);
    this._xUpperState = STATE.TRIGGERED;
    this._xLowerState = STATE.STOPPED;
    this._yUpperState = STATE.TRIGGERED;
    this._yLowerState = STATE.STOPPED;
    this.componentDidUpdate({});
    if (enableBackToTop && scrollY) {
      const event = isIOS ? 'statusBarClick' : 'titleClick';
      this.documentEvents = addEvents(document, { [event]: this.scrollToTop });
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    this.bindEvents();
    const sv = this.scrollView;
    const { scrollLeft, scrollTop, scrollWithAnimation, scrollX, scrollY, scrollIntoView } = this.props;

    if (!scrollX && !scrollY) {
      return;
    }
    // scrollIntoView has High priority vs scrollLeft / scrollTop
    if (scrollIntoView && prevProps.scrollIntoView !== scrollIntoView) {
      const page = getCurrentPageImpl();
      const scrollIntoViewComponent = findDOMNode(page.refComponents[scrollIntoView]);
      if (scrollIntoViewComponent) {
        const boundingRect = scrollIntoViewComponent.getBoundingClientRect();
        const containerRect = sv.getBoundingClientRect();
        if (scrollX) {
          // use Animation
          if (scrollWithAnimation) {
            this.ScrollWithAnimationFn(sv, Math.max(sv.scrollLeft + boundingRect.left - containerRect.left, 0), false);
          } else {
            sv.scrollLeft = Math.max(sv.scrollLeft + boundingRect.left - containerRect.left, 0);
          }
        }
        if (scrollY) {
          if (scrollWithAnimation) {
            this.ScrollWithAnimationFn(sv, Math.max(sv.scrollTop + boundingRect.top - containerRect.top, 0), true);
          } else {
            sv.scrollTop = Math.max(sv.scrollTop + boundingRect.top - containerRect.top, 0);
          }
        }
      }
    } else {
      if (scrollX && scrollLeft !== undefined && prevProps.scrollLeft !== scrollLeft) {
        // use Animation
        if (scrollWithAnimation) {
          this.ScrollWithAnimationFn(sv, scrollLeft, false);
        } else {
          sv.scrollLeft = scrollLeft;
        }
      }
      if (scrollY && scrollTop !== undefined && prevProps.scrollTop !== scrollTop) {
        if (scrollWithAnimation) {
          this.ScrollWithAnimationFn(sv, scrollTop, true);
        } else {
          sv.scrollTop = scrollTop;
        }
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.documentEvents) {
      this.documentEvents.remove();
    }
    this.bindEvents({});
  },
  bindEvents: function bindEvents(props) {
    const { scrollY, scrollX } = props || this.props;

    if (scrollX || scrollY) {
      if (!this.__binded) {
        this.__binded = true;
        this.scrollView.addEventListener('scroll', this.onScroll, supportsPassive ? { passive: true } : false);
      }
    } else if (this.__binded) {
      this.__binded = false;
      this.scrollView.removeEventListener('scroll', this.onScroll);
    }
  },
  scrollToTop: function scrollToTop() {
    const { scrollView } = this;

    if (scrollView) {
      scrollView.scrollTop = 0;
      const offset = { x: scrollView.scrollLeft, y: scrollView.scrollTop };
      const contentSize = {
        width: scrollView.scrollWidth,
        height: scrollView.scrollHeight,
      };

      const { onScroll, $mp } = this.props;

      if (onScroll) {
        const scrollEvent = $mp.getNormalizedEvent('scroll', {
          detail: {
            scrollLeft: offset.x,
            scrollTop: offset.y,
            scrollWidth: contentSize.width,
            scrollHeight: contentSize.height,
          },
        });
        onScroll(scrollEvent);
      }
    }
  },
  runAnimationScroll: function runAnimationScroll(el, to, duration, prop) {
    const start = el[prop];
    const difference = to - start;
    const increment = 10;
    if (duration === 0) {
      el[prop] = to;
      return;
    }
    const animateScroll = function animateScroll(elapsedTime) {
      elapsedTime += increment;
      el[prop] = easeInOut(elapsedTime, start, difference, duration);
      if (elapsedTime < duration) {
        setTimeout(() => {
          animateScroll(elapsedTime);
        }, increment);
      }
    };
    animateScroll(0);
  },
  ScrollWithAnimationFn: function ScrollWithAnimationFn(el, to, isTop) {
    const { scrollAnimationDuration } = this.props;

    const prop = isTop ? 'scrollTop' : 'scrollLeft';
    const duration = scrollAnimationDuration && scrollAnimationDuration > 0 ? scrollAnimationDuration : Math.abs(to - el[prop]) * BASE_SCROLL_DURATION;
    this.runAnimationScroll(el, to, duration, prop);
  },
  saveScrollView: function saveScrollView(scrollView) {
    this.scrollView = scrollView;
  },

  // handle onScroll Event
  onScroll: function onScroll() {
    const { onScroll, onScrollToLower, onScrollToUpper, scrollX, scrollY, upperThreshold, lowerThreshold, trapScroll } = this.props;

    // 根据clue报错，this.scrollView 可能为undefined
    if (!this.scrollView) {
      return;
    }
    const ev = this.scrollView;
    const offset = { x: ev.scrollLeft, y: ev.scrollTop };
    const contentSize = { width: ev.scrollWidth, height: ev.scrollHeight };
    const layoutMeasurement = {
      width: ev.clientWidth,
      height: ev.clientHeight,
    };
    // note: 执行 scroll 时 offset.x/y 不一定以 1 来递增/减
    // scrollY 和 scrollX 都为 false 的时候不滚动，和 wx 一致，方便移植
    // scroll-y onScrollToUpper
    if (scrollY && offset.y < upperThreshold) {
      if (onScrollToUpper && this._yUpperState === STATE.STOPPED) {
        this._yLowerState = STATE.STOPPED;
        onScrollToUpper(this.props.$mp.getNormalizedEvent('scrollToUpper'));
        this._yUpperState = STATE.TRIGGERED;
      }
    } else {
      this._yUpperState = STATE.STOPPED;
    }
    // scroll-y onScrollToLower
    if (contentSize.height - layoutMeasurement.height - offset.y < lowerThreshold) {
      if (scrollY && onScrollToLower && this._yLowerState === STATE.STOPPED) {
        this._yUpperState = STATE.STOPPED;
        onScrollToLower(this.props.$mp.getNormalizedEvent('scrollToLower'));
        this._yLowerState = STATE.TRIGGERED;
      }
    } else {
      this._yLowerState = STATE.STOPPED;
    }
    // scroll-x onScrollToUpper
    if (scrollX && offset.x < upperThreshold) {
      if (onScrollToUpper && this._xUpperState === STATE.STOPPED) {
        this._xLowerState = STATE.STOPPED;
        onScrollToUpper(this.props.$mp.getNormalizedEvent('scrollToUpper'));
        this._xUpperState = STATE.TRIGGERED;
      }
    } else {
      this._xUpperState = STATE.STOPPED;
    }
    // scroll-x onScrollToLower
    if (contentSize.width - layoutMeasurement.width - offset.x < lowerThreshold) {
      if (scrollX && onScrollToLower && this._xLowerState === STATE.STOPPED) {
        this._xUpperState = STATE.STOPPED;
        onScrollToLower(this.props.$mp.getNormalizedEvent('scrollToLower'));
        this._xLowerState = STATE.TRIGGERED;
      }
    } else {
      this._xLowerState = STATE.STOPPED;
    }
    if (onScroll) {
      if (trapScroll && scrollY) {
        if (offset.y === 1) {
          return;
        } else if (offset.y + ev.offsetHeight === ev.scrollHeight - 1) {
          return;
        }
      }
      const scrollEvent = this.props.$mp.getNormalizedEvent('scroll', {
        detail: {
          scrollLeft: offset.x,
          scrollTop: offset.y,
          scrollWidth: contentSize.width,
          scrollHeight: contentSize.height,
        },
      });
      // this.last=this.last || Date.now();
      // console.log('scroll',offset.x,Date.now()-this.last);
      // this.last=Date.now();
      onScroll(scrollEvent);
    }
    if (trapScroll && scrollY) {
      if (offset.y === 0) {
        ev.scrollTop = 1;
      } else if (offset.y + ev.offsetHeight === ev.scrollHeight) {
        ev.scrollTop = offset.y - 1;
      }
    }
  },
  render: function render() {
    const { scrollX, scrollY, children, style, className, id } = this.props;

    const scrollViewStyle = { ...defaultStyle, ...scrollX && styles.scrollX, ...scrollY && styles.scrollY, ...style };
    return Nerv.createElement(
      'div',
      { id, className, ref: this.saveScrollView, style: scrollViewStyle },
      children,
    );
  },
}));
export default ScrollView;
