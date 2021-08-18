/*
 * @Author: YufJ
 * @Date: 2021-07-12 20:45:27
 * @LastEditTime: 2021-07-13 11:28:13
 * @Description:
 * @FilePath: /yeact/src/passive-event.js
 */

export let supportPassive = false;

try {
  const opts = Object.defineProperty({}, 'passive', {
    get() {
      supportPassive = true;
      return supportPassive;
    },
  });
  window.addEventListener('testPassive', null, opts);
  window.removeEventListener('testPassive', null, opts);
} catch (e) {
  supportPassive = false;
}

export const getEventListenerOption = (capture) => {
  if (supportPassive) {
    return {
      passive: true,
      capture,
    };
  } else {
    return capture;
  }
};
