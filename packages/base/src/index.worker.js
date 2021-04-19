import bridge from '@/apis/';

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
  $global,
} from './framework/';

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
  $global,
};

const __mpCosts = Date.now() - __mpStartTime;
console.log(`framework: worker bundle costs ${__mpCosts} ms`);
