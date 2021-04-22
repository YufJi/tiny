/**
 * 仅用于UI components的事件处理
 */

import ReactDOM from 'react-dom';
import addEvents from '@/utils/addEvents';

function defaultCreateTouchList(touchList = []) {
  const list = [].slice.call(touchList, 0);
  return list.map((item) => {
    return {
      clientX: item.clientX,
      clientY: item.clientY,
      identifier: item.identifier,
      pageX: item.pageX,
      pageY: item.pageY,
    };
  });
}

function callEvent(instance, eventType, srcEvent, more, capture) {
  const c = capture ? '$capture' : '';
  const catchHandler = instance.props[`$catch$${eventType}${c}`];

  const e = instance.props.$mp.getNormalizedEvent({
    eventType,
    srcEvent,
  }, more);

  e.currentTarget = { ...e.currentTarget, ...instance.getTargetForEvent() };

  if (catchHandler && srcEvent.stopPropagation) {
    srcEvent.stopPropagation();
    catchHandler(e);
    return;
  }

  const onHandler = instance.props[`$on$${eventType}${c}`];
  if (onHandler) {
    onHandler(e);
  }
}

function defaultCreateTap(nativeEvent) {
  const detail = {};
  if (nativeEvent) {
    nativeEvent = nativeEvent.nativeEvent || nativeEvent;
    if ('pageX' in nativeEvent) {
      detail.pageX = nativeEvent.pageX;
      detail.pageY = nativeEvent.pageY;
    }
    if ('clientX' in nativeEvent) {
      detail.clientX = nativeEvent.clientX;
      detail.clientY = nativeEvent.clientY;
    } else if ('pageX' in detail) {
      detail.clientX = detail.pageX - window.pageXOffset;
      detail.clientY = detail.pageY - window.pageYOffset;
    }
  }
  return {
    detail,
  };
}
function detachScroll(instance) {
  if (instance.detachScrollEvent) {
    instance.detachScrollEvent.remove();
    instance.detachScrollEvent = null;
  }
}
function attachScroll(instance) {
  const { disableScroll } = instance.props;
  const { detachScrollEvent } = instance;
  const { __basicEventRoot } = instance;

  if (!__basicEventRoot) {
    return;
  }
  if (!disableScroll && detachScrollEvent) {
    return detachScroll(instance);
  }
  if (disableScroll && !detachScrollEvent) {
    instance.detachScrollEvent = addEvents(instance.__basicEventRoot, {
      touchmove: function touchmove(e) {
        e.preventDefault();
      },
    });
  }
}
export default function BasicEventMixin({
  createTouchList = defaultCreateTouchList,
  createTap = defaultCreateTap,
} = {}) {
  return {
    componentDidMount() {
      this.__basicEventRoot = ReactDOM.findDOMNode(this);
      attachScroll(this);
    },
    componentDidUpdate() {
      attachScroll(this);
    },
    componentWillUnmount() {
      detachScroll(this);
    },
    recordTarget(srcEvent) {
      const nativeEvent = srcEvent && srcEvent.nativeEvent;
      if (nativeEvent && !nativeEvent.$target) {
        nativeEvent.$target = this.getTargetForEvent();
      }
    },
    getTargetForEvent() {
      const { props } = this;
      const { __basicEventRoot } = this;

      return { ...props.$mp.getTargetForEvent(), offsetLeft: __basicEventRoot.offsetLeft, offsetTop: __basicEventRoot.offsetTop };
    },
    hasEvent(event, capture) {
      const c = capture ? '$capture' : '';
      return this.props[`$on$${event}${c}`] || this.props[`$catch$${event}${c}`];
    },
    onTap(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      // ios also trigger onTap after onLongTap
      if (this.__longTapTriggered) {
        return;
      }
      const eventName = 'tap';
      if (this.hasEvent(eventName, capture)) {
        callEvent(this, eventName, srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap), capture);
      }
    },
    onTouchStart(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      this.__longTapTriggered = false;

      const eventName = 'touchstart';
      if (this.hasEvent(eventName, capture)) {
        callEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onTouchMove(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = 'touchmove';
      if (this.hasEvent(eventName, capture)) {
        callEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onTouchEnd(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = 'touchend';
      if (this.hasEvent(eventName, capture)) {
        callEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onTouchCancel(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = 'touchcancel';
      if (this.hasEvent(eventName, capture)) {
        callEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onTransitionEnd(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('transitionend')) {
        callEvent(this, 'transitionend', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            propertyName: srcEvent.propertyName,
          },
        });
      }
    },
    onAnimationStart(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('animationstart')) {
        callEvent(this, 'animationstart', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        });
      }
    },
    onAnimationIteration(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('animationiteration')) {
        callEvent(this, 'animationiteration', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        });
      }
    },
    onAnimationEnd(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('animationend')) {
        callEvent(this, 'animationend', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        });
      }
    },
    onLongTap(srcEvent) {
      this.__longTapTriggered = true;
      if (this.hasEvent('longtap')) {
        callEvent(this, 'longtap', srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
      }
    },
    registryEvent(eventName, capture = false) {
      return (srcEvent) => {
        this[eventName](srcEvent, capture);
      };
    },
    getNodeEvents() {
      return {
        onClick: this.registryEvent('onTap'),
        onClickCapture: this.registryEvent('onTap', true),
        onTouchStart: this.registryEvent('onTouchStart'),
        onTouchStartCapture: this.registryEvent('onTouchStart', true),
        onTouchMove: this.registryEvent('onTouchMove'),
        onTouchMoveCapture: this.registryEvent('onTouchMove', true),
        onTouchEnd: this.registryEvent('onTouchEnd'),
        onTouchEndCapture: this.registryEvent('onTouchEnd', true),
        onTouchCancel: this.registryEvent('onTouchCancel'),
        onTouchCancelCapture: this.registryEvent('onTouchCancel', true),
        onAnimationStart: this.registryEvent('onAnimationStart'),
        onAnimationIteration: this.registryEvent('onAnimationIteration'),
        onAnimationEnd: this.registryEvent('onAnimationEnd'),
        onTransitionEnd: this.registryEvent('onTransitionEnd'),
      };
    },
  };
}