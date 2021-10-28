import { COMPONENT_DATA_CHANGE, PAGE_EVENT } from 'shared/events/custom';
import { PASSIVE } from '../../nerv/passive-event';

let scrollFlag = false;
let pullupRefreshLock = true;

export function checkScroll(onReachBottomDistance) {
  const windowHeight = getWindowHeight();
  const scrollHeight = getScrollHeight();
  const { scrollY } = window;
  const over = scrollY > 0 && scrollHeight > windowHeight && scrollY + windowHeight + onReachBottomDistance >= scrollHeight;

  if (over && !scrollFlag) {
    scrollFlag = true;
    return true;
  } else if (!over || !scrollFlag) {
    scrollFlag = false;
    return false;
  }
}

function getWindowHeight() {
  return document.compatMode === 'CSS1Compat' ? document.documentElement.clientHeight : document.body.clientHeight;
}

function getScrollHeight() {
  let h1 = 0;
  let h2 = 0;

  if (document.body) {
    h1 = document.body.scrollHeight;
  }

  if (document.documentElement) {
    h2 = document.documentElement.scrollHeight;
  }

  return Math.max(h1, h2);
}

export function triggerPullUpRefresh(publish) {
  if (pullupRefreshLock) {
    publish(PAGE_EVENT, { type: 'onReachBottom', data: {}, nodeId: 0 });
    pullupRefreshLock = false;
    setTimeout(() => {
      pullupRefreshLock = true;
    }, 350);
  }
}

export function enableScroll(config, fields) {
  const { enablePageScroll, enablePullUpRefresh, onReachBottomDistance } = config;

  const { root, bridge } = fields;
  const { publish } = bridge;

  const enable = enablePageScroll || enablePullUpRefresh;

  if (enable) {
    window.onscroll = function () {
      enablePageScroll && publish(PAGE_EVENT, {
        type: 'onPageScroll',
        data: { scrollTop: window.pageYOffset },
        nodeId: 0,
      });

      enablePullUpRefresh && checkScroll(onReachBottomDistance, root) && triggerPullUpRefresh(publish);
    };
  }

  enablePullUpRefresh && trackDOMTouches(onReachBottomDistance, bridge);
}

export function disableScroll(subscribe, invokeNative) {
  let disable = false;

  document.addEventListener('touchmove', (e) => {
    disable && e.preventDefault();
  });

  subscribe('disable-scroll', (e) => {
    invokeNative('disableScrollBounce', { disable: e.disable });
    disable = e.disable;
  });
}

export function pageScrollTo(duration = 200, scrollTop) {
  return new Promise((resolve) => {
    const scrollTo = (duration, to) => {
      const element = document.scrollingElement || document.body || document.documentElement;

      const start = element.scrollTop;
      const change = to - start;
      const startDate = +new Date();

      const easeInOutQuad = (currentTime, startVal, changeVal, duration) => {
        currentTime /= duration / 2;

        if (currentTime < 1) {
          return changeVal / 2 * currentTime * currentTime + startVal;
        }

        currentTime-=1;
        return -changeVal / 2 * (currentTime * (currentTime - 2) - 1) + startVal;
      };

      const animateScroll = () => {
        const currentDate = +new Date();
        const currentTime = currentDate - startDate;
        element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration), 10);

        if (currentTime < duration) {
          requestAnimationFrame(animateScroll);
        } else {
          element.scrollTop = to;
          resolve();
        }
      };

      animateScroll();
    };

    scrollTo(duration, scrollTop);
  });
}

export function trackDOMTouches(onReachBottomDistance, bridge) {
  const { publish } = bridge;
  let pageY = 0;

  document.addEventListener(
    'touchstart',
    (e) => {
      const { touches } = e;
      pageY = touches[0].pageY;
      return pageY;
    },
    PASSIVE,
  );

  document.addEventListener(
    'touchmove',
    (e) => {
      if (e.touches[0].pageY < pageY) {
        checkScroll(onReachBottomDistance) && triggerPullUpRefresh(publish);
      }
    },
    PASSIVE,
  );
}
