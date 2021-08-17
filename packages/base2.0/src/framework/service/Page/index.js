import { defaults, mapValues, isFunction, noop } from 'lodash';

import { wrapUserFunctions, wrapUserFunction } from '../utils/wrapfn';
import { debug, warn } from '../utils/log';
import { pageInitMap } from '../Model/common';
import $global from '../common/global';

const g = self;

export default function registerPage(options = {}) {
  const { pagePath: is } = $global.currentPageConfig;
  $global.__allConfig__[is] = $global.currentPageConfig;

  debug('全局配置：', JSON.stringify(g.TinyConfig.pages));

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
