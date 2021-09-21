import { noop } from 'lodash';
import { g } from 'shared';
import $global from '../common/global';
import { getAppInfoSync, getLaunchOptionsSync } from '../apis/System';

const context = {
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
    return getAppInfoSync();
  },

  get launchOptions() {
    return getLaunchOptionsSync();
  },

  get __allConfig__() {
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
