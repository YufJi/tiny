import ReactDOM from 'react-dom';
import addEvents from '@/utils/addEvents';
import objectKeys from '@/utils/objectKeys';
import { getPropsEventName } from '@/utils/eventReg';

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

function callBubblesEvent(instance, eventType, srcEvent, more, capture) {
  const catchHandler = instance.props[getPropsEventName(eventType, true, capture)];

  const e = instance.getNormalizedEvent({
    eventType,
    srcEvent,
  }, more);

  e.currentTarget = { ...e.currentTarget, ...instance.getTargetForEvent() };

  if (catchHandler && srcEvent.stopPropagation) {
    srcEvent.stopPropagation();
    typeof catchHandler === 'function' && catchHandler(e);
    return;
  }

  const onHandler = instance.props[getPropsEventName(eventType, false, capture)];
  if (typeof onHandler === 'function') {
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
    hasEvent(event, capture) {
      return getPropsEventName(event, false, capture) || getPropsEventName(event, true, capture);
    },
    getDataset() {
      const { props } = this;

      const dataset = {};
      objectKeys(props).forEach((n) => {
        if (n.slice(0, 5) === 'data-') {
          const key = camelCase(n.slice(5));
          dataset[key] = props[n];
        }
      });
      return dataset;
    },
    getTargetForEvent() {
      const { props } = this;
      const { __basicEventRoot } = this;

      return {
        id: props.id,
        dataset: this.getDataset(),
        offsetLeft: __basicEventRoot.offsetLeft,
        offsetTop: __basicEventRoot.offsetTop,
      };
    },
    /* 格式化event对象 */
    getNormalizedEvent(eventParam, other) {
      let eventType = eventParam;
      let srcEvent;
      if (eventType.eventType) {
        srcEvent = eventType.srcEvent;
        eventType = eventType.eventType;
      }
      const nativeEvent = srcEvent && srcEvent.nativeEvent || srcEvent;
      const currentTarget = this.getTargetForEvent();
      let target = nativeEvent && nativeEvent.$target || currentTarget;
      if (nativeEvent && !nativeEvent.$target) {
        nativeEvent.$target = target;
      }
      // bug compatibility
      target = {
        targetDataset: target.dataset,
        ...target,
        dataset: currentTarget.dataset,
      };

      return {
        type: eventType,
        timeStamp: Date.now(),
        target,
        currentTarget,
        ...other,
      };
    },
    onTap(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      // ios also trigger onTap after onLongTap
      if (this.__longTapTriggered) {
        return;
      }
      const eventName = 'tap';
      if (this.hasEvent(eventName, capture)) {
        callBubblesEvent(this, eventName, srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap), capture);
      }
    },
    onTouchStart(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      this.__longTapTriggered = 0;

      const eventName = 'touchstart';
      if (this.hasEvent(eventName, capture)) {
        callBubblesEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onTouchMove(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = 'touchmove';
      if (this.hasEvent(eventName, capture)) {
        callBubblesEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onTransitionEnd(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('transitionend', capture)) {
        callBubblesEvent(this, 'transitionend', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            propertyName: srcEvent.propertyName,
          },
        }, capture);
      }
    },
    onAnimationStart(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('animationstart', capture)) {
        callBubblesEvent(this, 'animationstart', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        }, capture);
      }
    },
    onAnimationIteration(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('animationiteration', capture)) {
        callBubblesEvent(this, 'animationiteration', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        }, capture);
      }
    },
    onAnimationEnd(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      if (this.hasEvent('animationend', capture)) {
        callBubblesEvent(this, 'animationend', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName,
          },
        }, capture);
      }
    },
    onTouchEnd(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = 'touchend';
      if (this.hasEvent(eventName, capture)) {
        callBubblesEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onTouchCancel(srcEvent, capture = false) {
      this.recordTarget(srcEvent);
      const eventName = 'touchcancel';
      if (this.hasEvent(eventName, capture)) {
        callBubblesEvent(this, eventName, srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches),
        }, capture);
      }
    },
    onLongTap(srcEvent) {
      this.__longTapTriggered = 1;
      if (this.hasEvent('LongTap')) {
        callBubblesEvent(this, 'longTap', srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
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
        onAnimationStartCapture: this.registryEvent('onAnimationStart', true),

        onAnimationIteration: this.registryEvent('onAnimationIteration'),
        onAnimationIterationCapture: this.registryEvent('onAnimationIteration', true),

        onAnimationEnd: this.registryEvent('onAnimationEnd'),
        onAnimationEndCapture: this.registryEvent('onAnimationEnd', true),

        onTransitionEnd: this.registryEvent('onTransitionEnd'),
        onTransitionEndCapture: this.registryEvent('onTransitionEnd', true),
      };
    },
  };
}
