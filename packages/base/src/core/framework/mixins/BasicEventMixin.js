
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

function callBubbleEvent(instance, eventType, srcEvent, more) {
  const catchHandler = instance.props[`catch${eventType}`];

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

  const onHandler = instance.props[`on${eventType}`];
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
export default function BasicEventMixin({ createTouchList = defaultCreateTouchList, createTap = defaultCreateTap } = {}) {
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
    hasBubbleEvent(event) {
      return this.props[`on${event}`] || this.props[`catch${event}`];
    },
    onTap(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      // ios also trigger onTap after onLongTap
      if (this.__longTapTriggered) {
        return;
      }
      const eventName = `tap${capture ? 'capture' : ''}`;
      if (this.hasBubbleEvent(eventName)) {
        callBubbleEvent(this, eventName, srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
      }
    },
    onTouchStart(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      this.__longTapTriggered = 0;

      const eventName = `touchstart${capture ? 'capture' : ''}`;
      if (this.hasBubbleEvent(eventName)) {
        callBubbleEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        });
      }
    },
    onTouchMove(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = `touchmove${capture ? 'capture' : ''}`;
      if (this.hasBubbleEvent(eventName)) {
        callBubbleEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        });
      }
    },
    onTransitionEnd(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasBubbleEvent('TransitionEnd')) {
        callBubbleEvent(this, 'transitionEnd', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            propertyName: srcEvent.propertyName,
          },
        });
      }
    },
    onAnimationStart(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasBubbleEvent('AnimationStart')) {
        callBubbleEvent(this, 'animationStart', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        });
      }
    },
    onAnimationIteration(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasBubbleEvent('AnimationIteration')) {
        callBubbleEvent(this, 'animationIteration', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        });
      }
    },
    onAnimationEnd(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasBubbleEvent('AnimationEnd')) {
        callBubbleEvent(this, 'animationEnd', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        });
      }
    },
    onTouchEnd(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = `touchend${capture ? 'capture' : ''}`;
      if (this.hasBubbleEvent(eventName)) {
        callBubbleEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        });
      }
    },
    onTouchCancel(srcEvent) {
      this.recordTarget(srcEvent);
      if (this.hasBubbleEvent('TouchCancel')) {
        callBubbleEvent(this, 'touchCancel', srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        });
      }
    },
    onLongTap(srcEvent) {
      this.__longTapTriggered = 1;
      if (this.hasBubbleEvent('LongTap')) {
        callBubbleEvent(this, 'longTap', srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
      }
    },
  };
}
