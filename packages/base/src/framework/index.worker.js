import './utils/env';
import securityPatch from '@/utils/securityPatch';
import getApplicationId from '@/utils/getApplicationId';
import bootstrap, { pauseApp } from './worker/bootstrap';
import { $global, App, Page, getApp, getCurrentPages, Component } from './common/commonLogic';
import EventHub from './EventHub';
import { getStartupParams, setStartupParams } from './startupParams';
import {
  getCurrentPageImpl,
  getCurrentPagesImpl,
  getAppImpl,
} from './App';
import registerBehavior from './Behavior';

const g = self;

g.onerror = function (msg, url, line, col, error) {
  const args = [msg, url, line, col, error];
  try {
    const app = getAppImpl();
    if (app) {
      app.error(msg);
    }
    let stack = [];
    try {
      stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
    } catch (e) {

    }
  } catch (ee) {
    console.error('[WORKER] report catch error', ee);
  }
  console.error('[WORKER] onerror', args);
};

g.bootstrapApp = function ({ success }) {
  function start() {
    securityPatch();
    // success是worker代码
    success();
  }

  pauseApp();
  getApplicationId((applicationId) => {
    start();
    bootstrap();
  });
};

export {
  EventHub,
  getStartupParams,
  setStartupParams,
  getCurrentPageImpl,
  getCurrentPagesImpl,
  Component,
  Page,
  App,
  getApp,
  getAppImpl,
  getCurrentPages,
  registerBehavior,
  $global,
};
