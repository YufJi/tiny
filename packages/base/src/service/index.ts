import { g } from 'shared';
import * as bridge from './bridge';
import * as apis from './apis';
import { timerPolyfill } from './polyfill';
import bootstrap from './bootstrap';
import { registerApp, getApp } from './App';
import { getCurrentPages } from './Route';
import { registerPage } from './Page';
import { registerComponent } from './Component';
import registerBehavior from './Behavior';

timerPolyfill();

g.$global = {
  __allConfig__: {},
  currentPageConfig: null,
};

g.__IS_SERVICE__ = true;

g.JSBridge = bridge;

g.tiny = new Proxy(apis, {
  get(obj, prop: string) {
    if (prop in obj) {
      return obj[prop];
    }

    console.error(`tiny api ${prop}暂不支持`);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  },
});

g.wx = g.tiny;

g.getCurrentPages = getCurrentPages;
g.getApp = getApp;
g.App = registerApp;
g.Page = registerPage;
g.Component = registerComponent;
g.Behavior = registerBehavior;

bootstrap();
