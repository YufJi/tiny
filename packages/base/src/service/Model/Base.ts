import { isFunction, noop } from 'lodash';
import { wrapUserFunction, error } from '../utils';
import { componentModels } from '../context';
import { addSetDataTask } from './util';
import { createSelectorQuery } from '../apis';
import { Component } from '../type';

export default class BaseModel {
  [is: string]: any;

  public __webviewId__: string

  public __nodeId__: string

  constructor(__webviewId__: string, __nodeId__?: string) {
    this.__webviewId__ = __webviewId__;
    this.__nodeId__ = __nodeId__;
  }

  selectComponent(selector) {
    const _selector = selector.slice(1);

    const components: Component[] = Object.values(componentModels[this.__webviewId__] || {});

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

    const components: Component[] = Object.values(componentModels[this.__webviewId__] || {});

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

  _setData(data, cb) {
    const callback = wrapUserFunction(`at ${this.is} setData callback`, isFunction(cb) ? cb : noop);
    return addSetDataTask(this, data, callback).catch((e) => error(e));
  }

  /* todo */
  // createIntersectionObserver(options = {}) {
  //   return createIntersectionObserver.call(this, this, options);
  // }

  createSelectorQuery() {
    const selectorQuery = createSelectorQuery();

    return selectorQuery && selectorQuery.in(this);
  }
}
