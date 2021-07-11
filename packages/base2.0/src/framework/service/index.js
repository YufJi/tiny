import bootstrap from './bootstrap';
import { registerApp, getApp } from './App';
import registerPage from './Page';
import registerComponent from './Component';
import registerBehavior from './Behavior';
import { getCurrentPages } from './Route';
import * as apis from './apis';

const g = self;

Object.assign(g, {
  getCurrentPages,
  getApp,
  App: registerApp,
  Page: registerPage,
  Component: registerComponent,
  Behavior: registerBehavior,
  tiny: apis,
});

bootstrap();
