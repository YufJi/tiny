import { invokeHandler, subscribeHandler } from '@/bridge';
import bridge from '@/apis/';
import { debug } from '@/utils/log';
import {
  EventHub,
  getStartupParams,
  setStartupParams,
  getApp,
  App,
  getCurrentPagesImpl,
  getCurrentPageImpl,
  getCurrentPages,
  getAppImpl,
  Component,
  Page,
  registerBehavior,
  $global,
} from './framework/index.worker';

const __mpStartTime = Date.now();

self.__IS_WORKER__ = true;

// 全局注册对象, 提供给宿主调用
self.JSBridgeHandler = {
  /* 调用的回调 */
  invokeHandler,
  /* 监听的回调 */
  subscribeHandler,
};

self.MP = {
  bridge,
  EventHub,
  getStartupParams,
  setStartupParams,
  getApp,
  App,
  getCurrentPagesImpl,
  getCurrentPageImpl,
  getCurrentPages,
  getAppImpl,
  Component,
  Page,
  Behavior: registerBehavior,
  $global,
};

const __mpCosts = Date.now() - __mpStartTime;
debug('framework', `worker bundle costs ${__mpCosts} ms`);
