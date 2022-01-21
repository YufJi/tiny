/* eslint-disable max-classes-per-file */
import { get, set, noop, setWith, cloneDeep, mapValues, isFunction } from 'lodash';
import EventEmitter from 'eventemitter3';
import { invokeWebview } from '../bridge';
import { wrapUserFunction, wrapComponnetLifetime, error } from '../utils';
import { pageModels, componentModels, componentBookmarks } from '../context';
import BaseModel from '../Model/Base';
import { afterSetData } from '../Model/util';

export class ComponentModel extends BaseModel {
  public is: string

  public id: string

  public className: string

  public dataset: Record<string, any>

  public data

  public externalClasses

  public options

  public methods

  public relations

  public behaviors

  public lifetimes

  public pageLifetimes

  public definitionFilter

  public hasBehavior

  constructor(is, webviewId, nodeId) {
    super(webviewId, nodeId);

    this.is = is;
    this.id = '';
    this.className = '';
    this.dataset = {};

    const bookmark = componentBookmarks.get(is);

    if (!bookmark) {
      throw new Error(`${is}.js Component not register yet`);
    }

    const init = cloneDeep(bookmark.init);
    this.data = init.data;
    this.externalClasses = init.externalClasses;
    this.options = init.options;
    this.methods = init.methods;
    this.relations = init.relations;
    this.behaviors = init.behaviors;
    this.lifetimes = mapValues(init.lifetimes, (life, key) => {
      return wrapComponnetLifetime.call(this, key, life);
    });
    this.pageLifetimes = init.pageLifetimes;
    this.definitionFilter = init.definitionFilter;
    this.hasBehavior = init.hasBehavior;

    // 用户的 methods 需要展开挂在到 this
    // 以满足 在 lifetimes.created 里用户可能会调用 `this.setData` 和 `this.customMethod`
    Object.assign(this, mapValues(init.methods, (fn) => {
      return fn.bind(this);
    }));

    // 缓存 component model
    setWith(componentModels, [this.__webviewId__, this.__nodeId__], this, Object);
  }

  get properties() {
    return this.data;
  }

  selectComponent(selector, callback) {
    if (!isFunction(callback)) {
      return super.selectComponent(selector);
    }

    afterSetData(this, async () => {
      try {
        const nodeIds = await invokeWebview('selectComponent', {
          selector,
          single: true,
          nodeId: this.__nodeId__,
        }, this.__webviewId__);

        if ((nodeIds as []).length === 0) {
          callback.call(this, null);
        } else {
          const component = get(componentModels, [this.__webviewId__, nodeIds[0]]);
          callback.call(this, component);
        }
      } catch (e) {
        callback.call(this, null);
      }
    });
  }

  selectAllComponents(selector, cb) {
    if (!isFunction(cb)) {
      return super.selectAllComponents(selector);
    }

    const callback = wrapUserFunction(`at ${this.is} selectAllComponents callback`, cb);

    afterSetData(this, async () => {
      try {
        const nodeIds = await invokeWebview('selectComponent', {
          selector,
          single: false,
          nodeId: this.__nodeId__,
        }, this.__webviewId__);

        const components = (nodeIds as []).map((id) => {
          return get(componentModels, [this.__webviewId__, id]);
        });
        callback.call(this, components);
      } catch (e) {
        callback.call(this, []);
      }
    });
  }

  triggerEvent(type, detail, options) {
    invokeWebview('triggerComponentEvent', {
      nodeId: this.__nodeId__,
      eventName: type,
      eventDetail: detail,
      eventOption: options,
    }, this.__webviewId__).catch((e) => {
      error('triggerComponentEvent', e);
    });
  }

  getRelationNodes(relation, cb) {
    if (!isFunction(cb)) return;

    const callback = wrapUserFunction(`at ${this.is} getRelationNodes callback`, cb);

    invokeWebview('getRelationNodes', {
      relation,
      nodeId: this.__nodeId__,
    }, this.__webviewId__).then((ids: any[]) => {
      const result = ids.map((id) => {
        return get(componentModels, [this.__webviewId__, id]);
      }).filter(Boolean);

      callback.call(this, result);
    }).catch((e) => {
      error('getRelationNodes', e);
    });
  }
}

export class ComponentPageModel extends ComponentModel {
  constructor(is, webviewId) {
    super(is, webviewId, 0);

    this.__eventChannel__ = new EventEmitter();

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

  getOpenerEventChannel() {
    const openerPage = this.__page__.opener?.implement;

    return openerPage ? openerPage.__eventChannel__ : new EventEmitter();
  }
}
