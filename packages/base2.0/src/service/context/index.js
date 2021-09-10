import { noop } from 'lodash';
import { g } from 'utils';

import getLaunchOptions from './getLaunchOptions';
import getAppInfo from './getAppInfo';
import $global from '../common/global';
import { debug } from '../utils/log';


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
    return getAppInfo();
  },

  get launchOptions() {
    return getLaunchOptions();
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
