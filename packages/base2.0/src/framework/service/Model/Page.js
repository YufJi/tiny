import { set, get } from 'lodash';

import { wrapUserFunction, wrapPageLifetime } from '../utils/wrapfn';
import { warn } from '../utils/log';

import { invokeWebview } from '../bridge';
import { componentModels, pageModels, pageInitMap, afterSetData } from './common';
import BaseModel from './Base';

export default class PageModel extends BaseModel {
  constructor(is, __webviewId__) {
    super(__webviewId__);

    this.is = is;
    this.__webviewId__ = __webviewId__;
    this.options = {};

    const init = cloneDeep(pageInitMap.get(is));

    if (!init) {
      throw new Error(`Page[${is}] not found. May be caused by: 1. Forgot to add page route in app.json. 2. Invoking Page() in async task.`);
    }
    // bind 用户方法的运行时 this
    const LIFETIMES = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload'];
    Object.assign(this, mapValues(init, (prop, key) => {
      if (isFunction(prop)) {
        if (LIFETIMES.includes(key)) {
          return wrapPageLifetime.call(this, key, prop);
        }

        return prop.bind(this);
      }

      return prop;
    }));

    set(pageModels, __webviewId__, this);
  }

  get __route__() {
    return this.is;
  }

  selectComponent(selector, callback) {
    if (!isFunction(callback)) {
      return super.selectComponent(selector);
    }

    afterSetData(this, async () => {
      const nodeIds = await invokeWebview('selectComponentInPage', {
        selector,
        single: true,
      }, this.__webviewId__);

      if (nodeIds.length === 0) {
        callback.call(this, null);
      } else {
        const component = get(componentModels, [this.__webviewId__, nodeIds[0]]);
        callback.call(this, component);
      }
    });
  }

  selectAllComponents(selector, callback) {
    if (!isFunction(callback)) {
      return super.selectAllComponents(selector);
    }

    afterSetData(this, async () => {
      try {
        const nodeIds = await invokeWebview('selectComponentInPage', {
          selector,
          single: false,
        }, this.__webviewId__);

        const components = nodeIds.map((id) => {
          return get(componentModels, [this.__webviewId__, id]);
        });

        callback.call(this, components);
      } catch (error) {
        callback.call(this, []);
      }
    });
  }
}
