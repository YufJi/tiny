/*
 * @Author: YufJ
 * @Date: 2021-07-04 01:11:10
 * @LastEditTime: 2021-08-17 14:38:03
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/service/index.js
 */
import { g } from 'utils';
import * as bridge from './bridge';
import timerPolyfill from './Timer';
import bootstrap from './bootstrap';
import { registerApp, getApp } from './App';
import registerPage from './Page';
import registerComponent from './Component';
import registerBehavior from './Behavior';
import { getCurrentPages } from './Route';
import $global from './common/global';
import * as apis from './apis';

g.__IS_WORKER__ = true;

g.JSBridge = bridge;
g.wx = new Proxy(apis, {
  get(obj, prop) {
    if (prop in obj) {
      return obj[prop];
    } else {
      console.warn(`api: ${prop}暂不支持，敬请期待`);
      return () => {};
    }
  },
});

g.getCurrentPages = getCurrentPages;
g.getApp = getApp;
g.App = registerApp;
g.Page =registerPage;
g.Component = registerComponent;
g.Behavior = registerBehavior;

g.$global = $global;

timerPolyfill();
bootstrap();
