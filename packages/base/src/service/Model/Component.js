import { set, get, setWith, cloneDeep, mapValues } from 'lodash';

import { truthy } from '../utils';
import { wrapUserFunction, wrapComponnetLifetime } from '../utils/wrapfn';
import { warn, error } from '../utils/log';

import { invokeWebview } from '../bridge';
import { componentModels, componentBookmarks, afterSetData } from './common';
import BaseModel from './Base';

export default class ComponentModel extends BaseModel {
  constructor(is, __webviewId__, __nodeId__) {
    super(__webviewId__, __nodeId__);

    this.is = is;
    this.__webviewId__ = __webviewId__;
    this.__nodeId__ = __nodeId__;
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

        if (nodeIds.length === 0) {
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

        const components = nodeIds.map((id) => {
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
      error(e);
    });
  }

  getRelationNodes(relation, cb) {
    if (!isFunction(cb)) return;

    const callback = wrapUserFunction(`at ${this.is} getRelationNodes callback`, cb);

    invokeWebview('getRelationNodes', {
      relation,
      nodeId: this.__nodeId__,
    }, this.__webviewId__).then((ids) => {
      const result = ids.map((id) => {
        return get(componentModels, [this.__webviewId__, id]);
      }).filter(truthy);

      callback.call(this, result);
    }).catch((e) => {
      error(e);
    });
  }
}
