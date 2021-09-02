/*
 * @Author: YufJ
 * @Date: 2021-07-04 01:11:10
 * @LastEditTime: 2021-08-17 14:38:03
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/service/index.js
 */
import * as bridge from './bridge';
import timerPolyfill from './Timer';
import bootstrap from './bootstrap';
import { registerApp, getApp } from './App';
import registerPage from './Page';
import registerComponent from './Component';
import registerBehavior from './Behavior';
import { getCurrentPages } from './Route';
import global from './common/global';
import * as apis from './apis';

const g = self;

g.__IS_WORKER__ = true;

g.JSBridge = bridge;
g.tiny = apis;
g.wx = apis;

g.getCurrentPages = getCurrentPages;
g.getApp = getApp;
g.App = registerApp;
g.Page =registerPage;
g.Component = registerComponent;
g.Behavior = registerBehavior;

g.$global = global;

timerPolyfill();
bootstrap();
