import { invokeHandler, subscribeHandler } from '@/bridge';

import './web-components';
import bridge from '@/apis/';
import Nerv from '@/nerv';

import { debug } from '@/utils/log';
import {
  EventHub,
  App,
  setCurrentPageImpl,
  getCurrentPageImpl,
  getCurrentPagesImpl,
  getApp,
  getAppImpl,
  getCurrentPages,
  getStartupParams,
  setStartupParams,
  Component,
  getComponentClass,
  StyleSheet,
  createComponent,
  Page,
  $global,
} from './framework/index';

import XMLRuntime from './xml-runtime';

const __mpStartTime = Date.now();

// 全局注册对象, 提供给宿主调用
self.JSBridgeHandler = {
  /* 调用的回调 */
  invokeHandler,
  /* 监听的回调 */
  subscribeHandler,
};

self.Nerv = Nerv;

self.XMLRuntime = XMLRuntime;

self.MP = {
  bridge,
  EventHub,
  App,
  setCurrentPageImpl,
  getCurrentPageImpl,
  getCurrentPagesImpl,
  getApp,
  getAppImpl,
  getCurrentPages,
  getStartupParams,
  setStartupParams,
  Component,
  getComponentClass,
  StyleSheet,
  createComponent,
  Page,
  $global,
};

const __mpCosts = Date.now() - __mpStartTime;
debug('framework', `web bundle costs ${__mpCosts} ms`);
