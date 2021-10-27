import { wrapUserFunction } from '../../utils';

export default class NodesRef {
  constructor(selectorQuery, component, selector, single) {
    this._selectorQuery = selectorQuery;
    this._component = component;
    this._selector = selector;
    this._single = single;
  }

  fields(_fields, callback) {
    callback = wrapUserFunction('at createSelectorQuery fields', callback);

    this._selectorQuery._push(this._selector, this._component, this._single, _fields, callback);

    return this._selectorQuery;
  }

  node(callback) {
    callback = wrapUserFunction('at createSelectorQuery node', callback);

    this._selectorQuery._push(this._selector, this._component, this._single, { node: true }, callback);

    return this._selectorQuery;
  }

  boundingClientRect(callback) {
    callback = wrapUserFunction('at createSelectorQuery boundingClientRect', callback);

    this._selectorQuery._push(this._selector, this._component, this._single, {
      id: true,
      dataset: true,
      rect: true,
      size: true,
    }, callback);

    return this._selectorQuery;
  }

  scrollOffset(callback) {
    callback = wrapUserFunction('at createSelectorQuery scrollOffset', callback);

    this._selectorQuery._push(this._selector, this._component, this._single, {
      id: true,
      dataset: true,
      scrollOffset: true,
    }, callback);

    return this._selectorQuery;
  }
}
