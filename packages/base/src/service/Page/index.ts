import { defaults, mapValues, isFunction, noop } from 'lodash';
import { CustomEvent, g } from 'shared';
import { subscribe } from '../bridge';
import { wrapUserFunctions, wrapUserFunction, debug, warn } from '../utils';
import { pageInitMap } from '../context';
import handlePageEvent from './handlePageEvent';
import PageModel from './model';

const { PageEvent } = CustomEvent;

export function registerPage(options = {}) {
  const { is } = g.$global.currentPageConfig;

  if (pageInitMap.has(is)) {
    throw new Error(`at ${is}, Page can only register once`);
  }

  g.$global.__allConfig__[is] = g.$global.currentPageConfig;

  debug('注册Page：', g.$global.currentPageConfig);

  if (!Array.isArray(g.TinyConfig.pages) || !g.TinyConfig.pages.includes(is)) {
    throw new Error(`Invalid path: ${is} doesn't declared in app.json`);
  }

  let { data = {} } = options;
  const { onPullDownRefresh, onReachBottom, onPageScroll, onShareAppMessage } = options;

  try {
    // 开发者有可能传入 mobx 对象, cloneDeep 会导致报错
    data = JSON.parse(JSON.stringify(data));
  } catch (error) {
    warn('Behavior: ', error);
    data = {};
  }

  const init = { ...options, is, data };
  defaults(init, {
    onLoad: noop,
    onShow: noop,
    onReady: noop,
    onHide: noop,
    onUnload: noop,
    onResize: noop,
    onTabItemTap: noop,
  });

  const lifetimes = wrapUserFunctions(`at ${is}, Page`, {
    onLoad: init.onLoad,
    onShow: init.onShow,
    onReady: init.onReady,
    onHide: init.onHide,
    onUnload: init.onUnload,
    onResize: init.onResize,
    onTabItemTap: init.onTabItemTap,
  });
  const extraLifetimes = mapValues({
    onPullDownRefresh,
    onReachBottom,
    onPageScroll,
    onShareAppMessage,
  }, (fn, key) => {
    if (isFunction(fn)) {
      return wrapUserFunction(`at ${is}, Page.${key}`, fn);
    }

    return undefined;
  });
  Object.assign(init, lifetimes, extraLifetimes);
  pageInitMap.set(is, init);
}

export function loadPageEvent() {
  subscribe(PageEvent, handlePageEvent);
}

export {
  PageModel,
};
