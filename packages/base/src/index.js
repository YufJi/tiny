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
