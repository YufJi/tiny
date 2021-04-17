
import { getCurrentPageImpl, $global, EventHub } from '../framework/dev';
import callBridge from '../utils/callBridge';
import callInternalAPI from '../utils/callInternalAPI';
import bridge from '@hulk/mp-core/es/bridge/index';
import TrackerAPI from './web/TrackerAPI';
import createSelectorQuery from './web/createSelectorQuery';
import reportError from '../utils/reportError';
import { SDKVersion, logSystemInfo } from '../utils/system';
import addEvents from '../utils/addEvents';
import loadFontFace from './web/loadFontFace';
import { addIntersectionObserver, removeIntersectionObserver, scheduleIntersectionUpdate } from './web/IntersectionObserver';


const dispatchPageReRenderEvent = function dispatchPageReRenderEvent() {
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
Object.assign(bridge, {
  SDKVersion,
  ...TrackerAPI,
  ...loadFontFace,
  createSelectorQuery,
  addIntersectionObserver,
  removeIntersectionObserver,
  reportError,
  call: callBridge,
  callInternalAPI,
  __reportFrameworkPerf: function __reportFrameworkPerf(loadTime) {
    callInternalAPI('onAppPerfEvent', {
      state: 'renderFrameworkLoaded',
      loadTime,
    });
  },
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
});
logSystemInfo();
$global.bridge = bridge;

export default bridge;
