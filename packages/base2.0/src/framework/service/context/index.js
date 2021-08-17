import { noop } from 'lodash';

import getLaunchOptions from './getLaunchOptions';
import getAppInfo from './getAppInfo';
import $global from '../common/global';
import { debug } from '../utils/log';

const g = self;

const readyQueue = [];

const context = {
  // todo 构建时注入
  checkTinyConfig() {
    if (g.TinyConfig && g.TinyConfig.ready) return;

    g.TinyConfig = g.TinyConfig || {};

    g.TinyConfig.ready = function () {
      while (readyQueue.length) {
        const fn = readyQueue.shift();
        fn && fn();
      }
    };
  },

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
    return g.TMAConfig && g.TMAConfig.tabBar;
  },

  get appInfo() {
    return getAppInfo();
  },

  get launchOptions() {
    return getLaunchOptions();
  },

  get __allConfig__() {
    debug('__allConfig__', $global.__allConfig__);
    return $global.__allConfig__;
  },
};

export default context;

export function setUserInteraction(val) {
  context.interactionKind = val;
}
export function resetUserInteraction() {
  context.interactionKind = undefined;
}
