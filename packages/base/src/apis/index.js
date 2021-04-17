
import { getCurrentPageImpl, $global, EventHub } from '@/core/framework/';
import callBridge from '@/utils/callBridge';
import callInternalAPI from '@/utils/callInternalAPI';
import reportError from '@/utils/reportError';
import { SDKVersion, logSystemInfo } from '@/utils/system';
import addEvents from '@/utils/addEvents';
import TrackerAPI from './web/TrackerAPI';
import loadFontFace from './web/loadFontFace';
import createSelectorQuery from './web/createSelectorQuery';
import { addIntersectionObserver, removeIntersectionObserver, scheduleIntersectionUpdate } from './web/IntersectionObserver';

const g = self;
const messageQueue = [];

const bridge = {
  // for internal call render
  fireMessage(data) {
    messageQueue.forEach((f) => {
      return f(data);
    });
  },
  onMessage(fn) {
    messageQueue.push(fn);
    return function () {
      const index = messageQueue.indexOf(fn);
      if (index !== -1) {
        messageQueue.splice(index, 1);
      }
    };
  },
  reLaunch(options) {
    let { url } = options;

    if (url.charAt(0) === '/') {
      url = url.slice(1);
    }
    let launchParamsTag = url;
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      launchParamsTag = url.slice(0, queryIndex);
    }
    const isTab = !!$global.tabsConfig[url];
    // init tabs config
    if (isTab) {
      bridge.call('switchTab', {
        tag: url,
        recreate: true,
      });
    } else {
      bridge.call('pushWindow', {
        url: `#${url}`,
        launchParamsTag,
        param: {
          closeAllWindow: true,
          animationType: 'none',
        },
      });
    }
  },
  pageScrollTo({ scrollTop } = {}) {
    window.scrollTo(window.pageXOffset, scrollTop);
  },
  SDKVersion,
  ...TrackerAPI,
  ...loadFontFace,
  createSelectorQuery,
  addIntersectionObserver,
  removeIntersectionObserver,
  reportError,
  call: callBridge,
  callInternalAPI,
  console: (function (_console) {
    function console(...args) {
      return _console.apply(this, args);
    }

    console.toString = function () {
      return _console.toString();
    };

    return console;
  })((type, ...args) => {
    console[type].apply(console, args.slice(0, -2));
  }),
  hideKeyboard: function hideKeyboard() {
    const { activeElement } = document;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }
    if (window._MpActiveNativeElement !== undefined) {
      callBridge('NBComponent.sendMessage', {
        actionType: 'blur',
        element: window._MpActiveNativeElement,
      });
    }
  },
};

const dispatchPageReRenderEvent = () => {
  document.dispatchEvent(new CustomEvent('pageReRender', {}));
};

addEvents(document, {
  onShare(e) {
    const page = getCurrentPageImpl();
    if (page && page.publicInstance.onShareAppMessage) {
      e.preventDefault();
    }
  },
  firePullToRefresh(e) {
    e.preventDefault();
  },
  pullIntercept(e) {
    e.preventDefault();
  },
  pageReRender() {
    scheduleIntersectionUpdate();
  },
});

addEvents(window, {
  resize: dispatchPageReRenderEvent,
  animationstart: dispatchPageReRenderEvent,
  animationiteration: dispatchPageReRenderEvent,
  animationend: dispatchPageReRenderEvent,
  transitionend: dispatchPageReRenderEvent,
});

window.addEventListener('scroll', () => {
  scheduleIntersectionUpdate();
}, {
  capture: true,
  passive: true,
});

EventHub.addListener(['pageReady', 'pageUpdate'], () => {
  dispatchPageReRenderEvent();
});

logSystemInfo();
$global.bridge = bridge;

export default bridge;
