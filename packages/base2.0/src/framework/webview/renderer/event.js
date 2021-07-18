/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:00:56
 * @LastEditTime: 2021-07-19 02:10:49
 * @Description:
 * @FilePath: /react-demo1/src/renderer/event.js
 */

const elementPrefix = 'tiny';
const UpperCasePerfix = elementPrefix.toUpperCase();
const EVENT_BLACK_LIST= ['click'];
const PRESS_DELAY = 350;
const TAP_DISTANCE = 5;
const TAP_BLACK_LIST = [
  `${UpperCasePerfix}-BUTTON`,
  `${UpperCasePerfix}-CHECKBOX`,
  `${UpperCasePerfix}-RADIO`,
  `${UpperCasePerfix}-MAP`,
];

const eventReg = /^(capture-)?(bind|catch)?([A-Za-z_]+)/;

export function addListenerToElement(node, type, callback) {
  const matches = type.match(eventReg);
  if (!matches) {
    return;
  }

  const capture = matches[1] === 'capture-';
  const stop = matches[2] === 'catch';
  const eventType = matches[3];

  // eslint-disable-next-line default-case
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
          type: eventType,
          touches: createTouchList(e.detail.sourceEndEvent.changedTouches),
          // touchend没有touches，可以用changedTouches
          changedTouches: createTouchList(e.detail.sourceEndEvent.changedTouches),
          detail: {
            x: e.detail.x,
            y: e.detail.y,
          },
          currentTarget: {
            id: e.detail.sourceEndEvent.currentTarget.id,
            dataset: e.detail.sourceEndEvent.currentTarget.dataset,
          },
          target: {
            id: e.detail.sourceEndEvent.target.id,
            dataset: e.detail.sourceEndEvent.target.dataset,
          },
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
        return callback.call(node, getNormalizedEvent(e));
      }, capture);

      // 组件可能会取消touchmove事件，并用tt-touchmove替换, 主要是swiper会用到
      if (eventType === 'touchmove') {
        node.addEventListener(`${elementPrefix}-touchmove`, (e) => {
          const { srcMoveEvent } = e.detail;
          return callback.call(node, {
            touches: createTouchList(srcMoveEvent.touches),
            changedTouches: createTouchList(srcMoveEvent.changedTouches),
            detail: {
              x: srcMoveEvent.pageX,
              y: srcMoveEvent.pageY,
            },
            currentTarget: {
              id: e.currentTarget.id,
              dataset: e.currentTarget.dataset,
            },
            target: {
              id: e.target.id,
              dataset: e.target.dataset,
            },
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
        callback.call(node, getNormalizedEvent(e));
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
    stop && e.stopPropagation();

    ended = false;
    pressStart = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
    };
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      // dispatch longpress event
      const pressEvent = new Event(`${elementPrefix}-longpress`, {
        bubbles: false,
        composed: true,
      });
      pressEvent.detail = pressStart;

      pressEvent.longpressFired = function () {
        ended = true;
      };

      node.dispatchEvent(pressEvent);
    }, PRESS_DELAY);
  };

  const touchmoveHandler = (e) => {
    stop && e.stopPropagation();

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

  node.addEventListener('touchstart', touchstartHandler, capture);
  node.addEventListener('touchmove', touchmoveHandler, capture);

  node.addEventListener('touchend', (e) => {
    stop && e.stopPropagation();

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
      bubbles: false,
      composed: true,
    });

    tapEvent.detail = {
      x: e.changedTouches[0].pageX,
      y: e.changedTouches[0].pageY,
      sourceEndEvent: e,
    };

    node.dispatchEvent(tapEvent);
  }, capture);

  node.addEventListener('touchcancel', (e) => {
    stop && e.stopPropagation();

    ended = true;
    clearTimeout(pressTimer);
  }, capture);
}

function createTouchList(touchList = []) {
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

/* 格式化event对象 */
export function getNormalizedEvent(nativeEvent) {
  const { timeStamp } = nativeEvent;

  return {
    type: nativeEvent.type,
    timeStamp,
    currentTarget: {
      id: nativeEvent.currentTarget.id,
      dataset: nativeEvent.currentTarget.dataset,
    },
    target: {
      id: nativeEvent.target.id,
      dataset: nativeEvent.target.dataset,
    },
    detail: nativeEvent.detail,
    touches: createTouchList(nativeEvent.touches),
    changedTouches: createTouchList(nativeEvent.changedTouches),
  };
}

export function removeListenerToElement(node, type, handler) {
  const matches = type.match(eventReg);
  if (!matches) {
    return;
  }

  const capture = matches[1];
  const eventType = matches[3];

  node.removeEventListener(eventType, handler, capture);
}

export {
  addListenerToElement as attachEvent,
  removeListenerToElement as detachEvent,
};
