import { wrapUserFunction } from '../utils/wrapfn';
import { warn, error } from '../utils/log';

import { componentModels, pageModels, pageInitMap, addSetDataTask } from './common';

export default class BaseModel {
  constructor(__webviewId__, __nodeId__) {
    this.__webviewId__ = __webviewId__;
    this.__nodeId__ = __nodeId__;
  }

  selectComponent(selector) {
    const _selector = selector.slice(1);

    const components = Object.values(componentModels[this.__webviewId__] || {});

    if (selector.startsWith('#')) {
      return components.find((c) => {
        return c.id === _selector;
      });
    }

    if (selector.startsWith('.')) {
      return components.find((c) => {
        return c.className.split(/\s+/).includes(_selector);
      });
    }
  }

  selectAllComponents(selector) {
    const _selector = selector.slice(1);

    const components = Object.values(componentModels[this.__webviewId__] || {});

    if (selector.startsWith('#')) {
      return components.filter((c) => {
        return c.id === _selector;
      });
    }

    if (selector.startsWith('.')) {
      return components.filter((c) => {
        return c.className.split(/\s+/).includes(_selector);
      });
    }

    return [];
  }

  setData(data, cb) {
    const callback = wrapUserFunction(`at ${this.is} setData callback`, isFunction(cb) ? cb : noop);
    addSetDataTask(this, data, callback).catch((e) => error(e));
  }

  createIntersectionObserver(options = {}) {
    return createIntersectionObserver.call(this, this, options);
  }

  createSelectorQuery() {
    return createSelectorQuery() && createSelectorQuery().in(this);
  }
}
