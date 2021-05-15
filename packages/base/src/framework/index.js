import './utils/env';
import { debug } from '@/utils/log';
import bootstrap from './web/bootstrap';
import { StyleSheet, createComponent, getComponentClass } from './common/commonUI';
import { Page, App, getApp, getCurrentPages, Component } from './common/commonLogic';
import $global from './common/global';
import { setStartupParams, getStartupParams } from './startupParams';
import EventHub from './EventHub';
import {
  setCurrentPageImpl,
  getCurrentPageImpl,
  getCurrentPagesImpl,
  getAppImpl,
} from './App';

const g = self;

function ready(callback) {
  callback();
}

g.onerror = function onerror(msg = '', url, line, col, error) {
  let stack = [];
  try {
    stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
  } catch (e) {}

  const args = [msg, url, line, col, error];
  console.error('[RENDER] onerror', args);
};

g.bootstrapApp = function bootstrapApp(config = {}) {
  const { container, onReady = ready, onRender, onFail } = config;

  onReady((runInfo) => {
    const { bridge } = runInfo || {};
    const { startupParams } = bridge;

    setStartupParams(startupParams);

    if (location.hash.length > 1) {
      debug('framework', '[RENDER] bootstrap page');
      bootstrap({ container, onRender, onFail, type: 'initial hash' }, bridge);
    } else {
      window.addEventListener('hashchange', () => {
        debug('framework', '[RENDER] bootstrap page when hashchange');
        bootstrap({ container, onRender, onFail, type: 'hashchange' }, bridge);
      }, false);
    }
  });
};

export {
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
