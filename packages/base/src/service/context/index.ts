import { noop } from 'lodash';
import EventEmitter from 'eventemitter3';

import { g } from 'shared';
import { getAppInfoSync, getLaunchOptionsSync } from '../apis/System';

const context: any = {
  get debug() {
    return g.TinyConfig && g.TinyConfig.debug;
  },

  get loadScript() {
    return g.loadScript || noop;
  },

  get appId() {
    return g.TinyConfig && g.TinyConfig.appId || '';
  },

  /** 编译阶段生成的用户配置 */
  get tabBarConfig() {
    return g.TinyConfig && g.TinyConfig.tabBar;
  },

  get appInfo() {
    return getAppInfoSync();
  },

  get launchOptions() {
    return getLaunchOptionsSync();
  },

  get __allConfig__() {
    return g.$global.__allConfig__;
  },
};

export default context;

export function setUserInteraction(val) {
  context.interactionKind = val;
}
export function resetUserInteraction() {
  context.interactionKind = undefined;
}

// 使用过的webview
export const webviewUsed = new Map();
// 页面栈
export const pageStack = [];
// events
export const routeEmitter = new EventEmitter();

export const componentModels = {};
export const componentBookmarks = new Map();
export const pageModels = {};
export const pageInitMap = new Map();

export const behaviorBookmarks = new Map();
