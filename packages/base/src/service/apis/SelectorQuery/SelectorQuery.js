import { wrapUserFunction } from '../../utils';
import NodesRef from './NodesRef';
import { publishSelectQuery } from './util';

export default class SelectorQuery {
  constructor(webviewid) {
    this._webviewid = webviewid;
    this._component = null;
    this._queue = [];
    this._queueCb = [];
  }

  in(component) {
    if (this._webviewid === null) {
      this._webviewid = component.__webviewId__;
      this._component = component;
    } else if (this._webviewid === component.__webviewId__) {
      this._component = component;
    } else {
      console.error('A single SelectorQuery could not work in components in different pages. A SelectorQuery#in call has been ignored and the page root is used as the current component.');
    }

    return this;
  }

  select(selector) {
    return new NodesRef(this, this._component, selector, true);
  }

  selectAll(selector) {
    return new NodesRef(this, this._component, selector, false);
  }

  selectViewport() {
    return new NodesRef(this, 0, '', true);
  }

  _push(selector, component, single, fields, callback) {
    this._queue.push({
      component: component ? component.__nodeId__ : component,
      selector,
      single,
      fields,
    });

    this._queueCb.push(callback || null);
  }

  exec(callback) {
    const that = this;
    callback = wrapUserFunction('at createSelectorQuery exec', callback);
    publishSelectQuery(this._webviewid, this._queue, (res) => {
      const queueCb = that._queueCb;
      res.forEach((value, key) => {
        if (typeof queueCb[key] === 'function') {
          queueCb[key].call(that, value);
        }
      });

      if (typeof callback === 'function') {
        callback.call(that, res);
      }
    });
  }
}
