
import React from 'react';
import ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import bridge from '@/apis/';

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
} from './core/framework/';

const __mpStartTime = Date.now();

const g = self;

g.React = React;
g.ReactDOM = ReactDOM;
g.createReactClass = createReactClass;
g.React.createClass = g.React.createClass || createReactClass;

const mp = {
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
}

self.MP = mp;

const __mpCosts = Date.now() - __mpStartTime;
console.log(`framework: web bundle costs ${__mpCosts} ms`);
