import { set, noop } from 'lodash';
import { pageModels } from './common';
import ComponentModel from './Component';

export default class ComponentPageModel extends ComponentModel {
  constructor(is, webviewId) {
    super(is, webviewId, 0);

    this.is = is;
    this.onShow = this.methods.onShow || noop;
    this.onHide = this.methods.onHide || noop;
    this.onResize = this.methods.onResize || noop;
    this.onTabItemTap = this.methods.onTabItemTap || noop;

    set(pageModels, webviewId, this);
  }

  get __route__() {
    return this.is;
  }

  get onLoad() {
    return function (query) {
      this.lifetimes.created && this.lifetimes.created.call(this, query);
      this.lifetimes.attached && this.lifetimes.attached.call(this, query);
      this.methods.onLoad && this.methods.onLoad.call(this, query);
    };
  }

  get onReady() {
    return function (...args) {
      this.lifetimes.ready && this.lifetimes.ready.apply(this, args);
      this.methods.onReady && this.methods.onReady.apply(this, args);
    };
  }

  get onUnload() {
    return function (...args) {
      this.lifetimes.detached && this.lifetimes.detached.apply(this, args);
      this.methods.onUnload && this.methods.onUnload.apply(this, args);
    };
  }

  set onLoad(fn) {
    if (typeof fn !== 'function') return;

    set(this, 'methods.onLoad', fn);
  }

  set onReady(fn) {
    set(this, 'methods.onReady', fn);
  }

  set onUnload(fn) {
    set(this, 'methods.onUnload', fn);
  }
}
