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
