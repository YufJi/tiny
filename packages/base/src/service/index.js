import { g } from 'shared';
import * as bridge from './bridge';
import timerPolyfill from './Timer';
import bootstrap from './bootstrap';
import { registerApp, getApp } from './App';
import { getCurrentPages } from './Route';
import { registerPage } from './Page';
import { registerComponent } from './Component';
import registerBehavior from './Behavior';
import $global from './common/global';
import * as apis from './apis';

timerPolyfill();

g.__IS_SERVICE__ = true;

g.JSBridge = bridge;
g.tiny = new Proxy(apis, {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    }

    console.warn(`api: ${prop}暂不支持`);
  },
});

g.wx = g.tiny;

g.getCurrentPages = getCurrentPages;
g.getApp = getApp;
g.App = registerApp;
g.Page =registerPage;
g.Component = registerComponent;
g.Behavior = registerBehavior;

g.$global = $global;
bootstrap();
