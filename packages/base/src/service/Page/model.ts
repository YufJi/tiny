import { set, get, cloneDeep, mapValues, isFunction, wrap } from 'lodash';

import { invokeWebview } from '../bridge';
import { wrapPageLifetime } from '../utils';
import { componentModels, pageModels, pageInitMap } from '../context';
import BaseModel from '../Model/Base';
import { afterSetData } from '../Model/util';

export default class PageModel extends BaseModel {
  constructor(is, __webviewId__) {
    super(__webviewId__);

    this.is = is;
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
          // return wrap(prop, (life, ...args) => {
          //   /* 执行自定义组件pageLifeTimes */
          //   const components = componentModels[this.__webviewId__];
          //   switch (key) {
          //     case 'onShow':
          //       Object.values(components).forEach((c) => {
          //         c.pageLifetimes.show();
          //       });
          //       break;
          //     case 'onHide':
          //       Object.values(components).forEach((c) => {
          //         c.pageLifetimes.hide();
          //       });
          //       break;
          //     default:
          //       break;
          //   }

          //   /* 执行page生命周期 */
          //   const result = wrapUserFunction(`at ${this.is}.js Page.${key}`, life).apply(this, args);
          //   return result;
          // });
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
