/* eslint-disable default-case */
import { getType } from '@/utils/types';
import eventReg from '@/utils/eventReg';
import supportsPassive from './supportsPassive';
import { elementPrefix, UpperCasePerfix } from './config';

const EVENT_BLACK_LIST= ['click'];
const PRESS_DELAY = 350;
const TAP_DISTANCE = 5;
const TAP_BLACK_LIST = [`${UpperCasePerfix}-BUTTON`, `${UpperCasePerfix}-CHECKBOX`, `${UpperCasePerfix}-RADIO`, `${UpperCasePerfix}-MAP`];

export default function addListenerToElement(node, type, callback) {
  const matches = type.match(eventReg);
  if (!matches) {
    return;
  }

  const capture = matches[1];
  const stop = matches[2] === 'catch';
  const eventType = matches[3];

  switch (eventType) {
    case 'tap':
      // listen down and up
      if (!node.__hasTapEvent) {
        node.__hasTapEvent = true;
        addTapEvent(node, {
          stop,
          capture,
        });
      }

      node.addEventListener(`${elementPrefix}-tap`, (e) => {
        return callback.call(node, {
          touches: e.detail.sourceEndEvent.changedTouches,
          // touchend没有touches，可以用changedTouches
          changedTouches: e.detail.sourceEndEvent.changedTouches,
          detail: {
            x: e.detail.x,
            y: e.detail.y,
          },
          target: e.detail.sourceEndEvent.target,
          timeStamp: e.timeStamp,
          preventDefault() {
            return e.detail.sourceEndEvent.preventDefault();
          },
          stopPropagation() {
            e.stopPropagation();
            // 标记一下touchend，表示这个被阻止过
            e.detail.sourceEndEvent.__catchedTap = true;
          },
        });
      });
      return;

    case 'touchstart':
    case 'touchend':
    case 'touchmove':
    case 'touchcancel':
      node.addEventListener(eventType, (e) => {
        stop && e.stopPropagation();

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
      }, {
        capture,
      });
      // 组件可能会取消touchmove事件，并用tt-touchmove替换, 主要是swiper会用到
      if (eventType === 'touchmove') {
        node.addEventListener(`${elementPrefix}-touchmove`, (e) => {
          const { srcMoveEvent } = e.detail;
          return callback.call(node, {
            touches: srcMoveEvent.touches,
            changedTouches: srcMoveEvent.changedTouches,
            detail: {
              x: srcMoveEvent.pageX,
              y: srcMoveEvent.pageY,
            },
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
        addTapEvent(node, {
          stop,
          capture,
        });
      }

      node.addEventListener(`${elementPrefix}-longpress`, (e) => {
        e.longpressFired();
        callback(e);
      });
      return;
  }

  if (EVENT_BLACK_LIST.indexOf(eventType) === -1) {
    node.addEventListener(eventType, callback);
  }
}

function addTapEvent(node, options) {
  // 模拟合成tap事件和longpress事件，事件名为mp-tap和mp-longpress，以区别于polymer的事件
  let pressTimer;
  let pressStart;
  let ended;

  const { stop, capture } = options;

  const touchstartHandler = (e) => {
    if (e.__handledTap) {
      return;
    }

    ended = false;
    pressStart = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
    };
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      // dispatch longpress event
      const pressEvent = new Event(`${elementPrefix}-longpress`, {
        bubbles: !stop,
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

  node.addEventListener('touchstart', touchstartHandler, supportsPassive ? {
    passive: supportsPassive,
    capture,
  } : capture);
  node.addEventListener('touchmove', touchmoveHandler, supportsPassive ? {
    passive: supportsPassive,
    capture,
  } : capture);

  node.addEventListener('touchend', (e) => {
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
    if (TAP_BLACK_LIST.indexOf(node.tagName) !== -1 && node.disabled) {
      // if element is disabled, 那就不发了
      return;
    }

    const tapEvent = new Event(`${elementPrefix}-tap`, {
      bubbles: !stop,
      composed: true,
    });
    tapEvent.detail = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
      sourceEndEvent: e,
    };
    node.dispatchEvent(tapEvent);
  }, {
    capture,
  });

  node.addEventListener('touchcancel', (e) => {
    ended = true;
    clearTimeout(pressTimer);
  }, {
    capture,
  });
}
