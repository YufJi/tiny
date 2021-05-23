import { findDOMNode } from '@/nerv';

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

export default {
  // componentDidMount() {
  //   this.__basicEventRoot = findDOMNode(this);
  //   attachScroll(this);
  // },
  // componentDidUpdate() {
  //   attachScroll(this);
  // },
  // componentWillUnmount() {
  //   detachScroll(this);
  // },
  // recordTarget(srcEvent) {
  //   const nativeEvent = srcEvent && srcEvent.nativeEvent;
  //   if (nativeEvent && !nativeEvent.$target) {
  //     nativeEvent.$target = this.getTargetForEvent();
  //   }
  // },
  // hasEvent(event, capture) {
  //   return getPropsEventName(event, false, capture) || getPropsEventName(event, true, capture);
  // },
  getDatasetForTarget(target) {
    const dataset = {};

    for (const key in target.dataset) {
      if (Object.hasOwnProperty.call(target.dataset, key)) {
        const value = target.dataset[key];
        dataset[key] = value;
      }
    }
    return dataset;
  },
  getTargetForEvent(nativeEvent, key = 'target') {
    const { props } = this;
    const { offsetLeft, offsetTop } = nativeEvent[key];

    return {
      id: props.id || '',
      dataset: this.getDatasetForTarget(nativeEvent[key]),
      offsetLeft,
      offsetTop,
    };
  },
  getDetailForEvent(nativeEvent) {
    const eventType = nativeEvent.type;
    const detail = {};

    if (eventType === 'click') {
      detail.x = nativeEvent.pageX;
      detail.y = nativeEvent.pageY;
    } else if (eventType === 'transitionend') {
      detail.elapsedTime = nativeEvent.elapsedTime;
      detail.propertyName = nativeEvent.propertyName;
    } else if (eventType === 'animationstart' || eventType === 'animationiteration' || eventType === 'animationend') {
      detail.elapsedTime = nativeEvent.elapsedTime;
      detail.animationName = nativeEvent.animationName;
    }

    return detail;
  },
  getTouchesForEvent(nativeEvent, key = 'touches') {
    if (nativeEvent[key]) {
      const list = [].slice.call((nativeEvent[key]), 0);
      return list.map((item) => {
        return {
          clientX: item.clientX,
          clientY: item.clientY,
          identifier: item.identifier,
          force: item.force,
          pageX: item.pageX,
          pageY: item.pageY,
        };
      });
    }
  },
  /* 格式化event对象 */
  getNormalizedEvent(nativeEvent, more = {}) {
    const eventType = nativeEvent.type === 'click' ? 'tap' : nativeEvent.type;
    const target = this.getTargetForEvent(nativeEvent);
    const currentTarget = this.getTargetForEvent(nativeEvent, 'currentTarget');
    const detail = this.getDetailForEvent(nativeEvent);
    const touches = this.getTouchesForEvent(nativeEvent);
    const changedTouches = this.getTouchesForEvent(nativeEvent, 'changedTouches');

    return {
      type: eventType,
      timeStamp: Date.now(),
      target,
      currentTarget,
      detail,
      touches,
      changedTouches,
      ...more,
    };
  },
  // onTap(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   // ios also trigger onTap after onLongTap
  //   if (this.__longTapTriggered) {
  //     return;
  //   }
  //   const eventName = 'tap';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap), capture);
  //   }
  // },
  // onTouchStart(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   this.__longTapTriggered = 0;

  //   const eventName = 'touchstart';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onTouchMove(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   const eventName = 'touchmove';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onTouchEnd(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   const eventName = 'touchend';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onTouchCancel(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   const eventName = 'touchcancel';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onLongTap(srcEvent) {
  //   this.__longTapTriggered = 1;
  //   if (this.hasEvent('LongTap')) {
  //     callBubblesEvent(this, 'longTap', srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
  //   }
  // },
  // onTransitionEnd(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('transitionend', capture)) {
  //     callBubblesEvent(this, 'transitionend', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         propertyName: srcEvent.propertyName,
  //       },
  //     }, capture);
  //   }
  // },
  // onAnimationStart(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('animationstart', capture)) {
  //     callBubblesEvent(this, 'animationstart', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         animationName: srcEvent.animationName,
  //       },
  //     }, capture);
  //   }
  // },
  // onAnimationIteration(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('animationiteration', capture)) {
  //     callBubblesEvent(this, 'animationiteration', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         animationName: srcEvent.animationName,
  //       },
  //     }, capture);
  //   }
  // },
  // onAnimationEnd(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('animationend', capture)) {
  //     callBubblesEvent(this, 'animationend', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         animationName: srcEvent.animationName,
  //       },
  //     }, capture);
  //   }
  // },
};
