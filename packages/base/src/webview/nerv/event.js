import { TemplateTag } from 'shared';
import { xmlEventReg } from './utils/is';

const EVENT_BLACK_LIST = ['click'];
const PRESS_DELAY = 350;
const TAP_DISTANCE = 5;
const TAP_BLACK_LIST = [
  `${TemplateTag.UpperCasePerfix}-BUTTON`,
  `${TemplateTag.UpperCasePerfix}-CHECKBOX`,
  `${TemplateTag.UpperCasePerfix}-RADIO`,
  `${TemplateTag.UpperCasePerfix}-MAP`,
];

export function addListener(node, type, callback, options = {}) {
  const { capture = false } = options;
  const eventType = type;

  // eslint-disable-next-line default-case
  switch (eventType) {
    case 'tap':
      // listen down and up
      if (!node.__hasTapEvent) {
        node.__hasTapEvent = true;
        addTapEvent(node);
      }

      node.addEventListener(`${TemplateTag.LowerCasePrefix}-tap`, (e) => {
        return callback.call(node, {
          type: 'tap',
          touches: e.detail.sourceEndEvent.changedTouches,
          changedTouches: e.detail.sourceEndEvent.changedTouches,
          detail: { x: e.detail.x, y: e.detail.y },
          target: e.detail.sourceEndEvent.target,
          timeStamp: e.timeStamp,
          preventDefault() {
            return e.detail.sourceEndEvent.preventDefault();
          },
          stopPropagation() {
            e.stopPropagation();
            e.detail.sourceEndEvent.__catchedTap = true;
          },
        });
      }, capture);
      return;

    case 'touchstart':
    case 'touchend':
    case 'touchmove':
    case 'touchcancel':
      node.addEventListener(eventType, (e) => {
        if (e.__frozenBySwipeBack) return; // ios 触发了滑动返回

        const detail = {
          x: e.pageX,
          y: e.pageY,
        };
        // detail is a read-only property, so re-define it ....
        Object.defineProperty(e, 'detail', {
          get: function get() {
            return detail;
          },
          configurable: true,
        });
        return callback.call(node, e);
      }, capture);

      // 组件可能会取消touchmove事件，并用touchmove替换, 主要是swiper会用到
      if (eventType === 'touchmove') {
        node.addEventListener(`${TemplateTag.LowerCasePrefix}-touchmove`, (e) => {
          const { srcMoveEvent } = e.detail;
          return callback.call(node, {
            type: eventType,
            touches: srcMoveEvent.touches,
            changedTouches: srcMoveEvent.changedTouches,
            detail: { x: srcMoveEvent.pageX, y: srcMoveEvent.pageY },
            target: e.target,
            timeStamp: e.timeStamp,
            preventDefault() {
              return srcMoveEvent.preventDefault();
            },
            stopPropagation() {
              return e.stopPropagation();
            },
          });
        });
      }
      return;

    case 'longtap':
    case 'longpress':
      // listen down and up
      if (!node.__hasTapEvent) {
        node.__hasTapEvent = true;
        addTapEvent(node);
      }

      node.addEventListener(`${TemplateTag.LowerCasePrefix}-longpress`, (e) => {
        e.longpressFired();
        callback.call(node, e);
      });
      return;
  }

  // 不在黑名单中
  if (EVENT_BLACK_LIST.indexOf(eventType) === -1) {
    node.addEventListener(eventType, (e) => {
      callback.call(node, e);
    }, capture);
  }
}

function addTapEvent(node) {
  // 模拟合成tap事件和longpress事件，事件名为mp-tap和mp-longpress，以区别于polymer的事件
  let pressTimer;
  let pressStart;
  let ended;

  const touchstartHandler = (e) => {
    if (e.__handledTap) return;

    ended = false;
    pressStart = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
    };
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      // dispatch longpress event
      const pressEvent = new Event(`${TemplateTag.LowerCasePrefix}-longpress`, {
        bubbles: true,
        composed: true,
      });
      pressEvent.detail = pressStart;

      pressEvent.longpressFired = function () {
        ended = true;
      };

      node.dispatchEvent(pressEvent);
    }, PRESS_DELAY);

    e.__handledTap = true;
  };

  const touchmoveHandler = (e) => {
    if (ended || !pressStart) {
      return;
    }

    const dx = Math.abs(e.changedTouches[0].pageX - pressStart.x);
    const dy = Math.abs(e.changedTouches[0].pageY - pressStart.y);

    if (dx > TAP_DISTANCE || dy > TAP_DISTANCE) {
      ended = true;
      clearTimeout(pressTimer);
    }
  };

  const touchendHandler = (e) => {
    if (ended || !pressStart) {
      return;
    }

    ended = true;
    clearTimeout(pressTimer);
    // 如果没有触发touchmove的判断，这里还要再来一下
    const dx = Math.abs(e.changedTouches[0].pageX - pressStart.x);
    const dy = Math.abs(e.changedTouches[0].pageY - pressStart.y);

    if (dx > TAP_DISTANCE || dy > TAP_DISTANCE) {
      return;
    }

    // dispatch tap event
    if (node.disabled && TAP_BLACK_LIST.indexOf(node.tagName) !== -1) {
      // if element is disabled, 那就不发了
      return;
    }

    const tapEvent = new Event(`${TemplateTag.LowerCasePrefix}-tap`, {
      bubbles: true,
      composed: true,
    });

    tapEvent.detail = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
      sourceEndEvent: e,
    };

    node.dispatchEvent(tapEvent);
  };

  const touchcancelHandler = (e) => {
    ended = true;
    clearTimeout(pressTimer);
  };

  node.addEventListener('touchstart', touchstartHandler);
  node.addEventListener('touchmove', touchmoveHandler);
  node.addEventListener('touchend', touchendHandler);
  node.addEventListener('touchcancel', touchcancelHandler);
}

export function eventProxy(name, capture, nativeEvent) {
  if (EVENT_BLACK_LIST.includes(name)) return false;

  let canBubble = true;

  const listener = this._listeners[`${name}`][`${capture ? 'capture' : 'bubble'}`];

  if (!listener) return;

  const event = wrapEvent(this, nativeEvent, name);

  if (listener.options.stop) {
    nativeEvent.preventDefault();
    nativeEvent.stopPropagation();

    canBubble = false;
  }

  listener.handler(event);

  return canBubble;
}

function wrapEvent(node, nativeEvent, type) {
  const targetElement = nativeEvent.target.__eventTargetRef || nativeEvent.target;

  const target = {
    id: targetElement.id || '',
    dataset: targetElement._dataset || {},
  };
  const currentTarget = {
    id: node.id || '',
    dataset: node._dataset || {},
  };

  Object.assign(target, {
    offsetLeft: targetElement.offsetLeft || 0,
    offsetTop: targetElement.offsetTop || 0,
  });

  Object.assign(currentTarget, {
    offsetLeft: node.offsetLeft || 0,
    offsetTop: node.offsetTop || 0,
  });

  const isCanvasTouches = node.tagName.toUpperCase() === `${TemplateTag.UpperCasePerfix}-CANVAS` && ['touchstart', 'touchend', 'touchmove', 'touchcancel'].includes(type);

  return {
    type,
    timeStamp: nativeEvent.timeStamp || window.performance.now(),
    target,
    currentTarget,
    detail: nativeEvent.detail,
    touches: isCanvasTouches ? getCanvasTouches(node, nativeEvent.touches) : getTouches(nativeEvent.touches),
    changedTouches: isCanvasTouches
      ? getCanvasTouches(node, nativeEvent.changedTouches)
      : getTouches(nativeEvent.changedTouches),
  };
}

function getTouches(touches) {
  if (touches) {
    const touchInfo = [];

    for (let idx = 0; idx < touches.length; idx+=1) {
      const touch = touches[idx];
      touchInfo.push({
        identifier: touch.identifier,
        pageX: touch.pageX,
        pageY: touch.pageY,
        clientX: touch.clientX,
        clientY: touch.clientY,
        force: touch.force || 0,
      });
    }

    return touchInfo;
  }

  return [];
}

function getCanvasTouches(node, touches) {
  if (touches) {
    const touchInfo = [];
    const rect = node._getBox();

    for (let idx = 0; idx < touches.length; idx+=1) {
      const touch = touches[idx];
      touchInfo.push({
        identifier: touch.identifier,
        x: touch.pageX - rect.left,
        y: touch.pageY - rect.top,
        pageX: touch.pageX,
        pageY: touch.pageY,
        clientX: touch.clientX,
        clientY: touch.clientY,
        force: touch.force || 0,
      });
    }

    return touchInfo;
  }
}

export function toEventName(eventName) {
  const matches = eventName.match(xmlEventReg);

  const capture = matches[1].indexOf('capture-') === 0;
  const stop = matches[1].indexOf('catch') !== -1;
  const name = matches[2];

  const options = { capture, stop };

  return {
    raw: eventName,
    name,
    options,
  };
}
