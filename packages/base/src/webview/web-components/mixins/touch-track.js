/* eslint-disable no-multi-assign */
export default function TouchTrack(superClass) {
  return class extends superClass {
    touchtrack(el, method, n) {
      let startX = 0;
      let startY = 0;
      let dx = 0;
      let dy = 0;

      const handleEvent = (e, state, pageX, pageY) => {
        if (this[method].call(this, {
          target: e.target,
          currentTarget: e.currentTarget,
          preventDefault: e.preventDefault.bind(e),
          stopPropagation: e.stopPropagation.bind(e),
          touches: e.touches,
          changedTouches: e.changedTouches,
          detail: {
            state,
            x: pageX,
            y: pageY,
            dx: pageX - startX,
            dy: pageY - startY,
            ddx: pageX - dx,
            ddy: pageY - dy,
            timeStamp: e.timeStamp,
          },
        }) === false) {
          return false;
        }
      };

      let originalEvent = null;
      el.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1 && !originalEvent) {
          originalEvent = e;
          startX = dx = e.touches[0].pageX;
          startY = dy = e.touches[0].pageY;

          handleEvent(e, 'start', startX, startY);
        }
      });
      el.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length === 1 && originalEvent) {
          const t = handleEvent(e, 'move', e.touches[0].pageX, e.touches[0].pageY);
          dx = e.touches[0].pageX;
          dy = e.touches[0].pageY;
          return t;
        }
      });
      el.addEventListener('touchend', (e) => {
        if (e.touches && e.touches.length === 0 && originalEvent) {
          originalEvent = null;
          return handleEvent(e, 'end', e.changedTouches[0].pageX, e.changedTouches[0].pageY);
        }
      });
      el.addEventListener('touchcancel', (e) => {
        if (originalEvent) {
          const t = originalEvent;
          originalEvent = null;
          return handleEvent(e, n ? 'cancel' : 'end', t.touches[0].pageX, t.touches[0].pageY);
        }
      });
    }
  };
}
