import { isArray } from './utils';
import {
  isNil,
  EMPTY_CHILDREN,
  isInvalid,
} from './shared';

export const Children = {
  map(children, fn, ctx) {
    if (isNil(children)) {
      return children;
    }
    children = Children.toArray(children);
    if (ctx && ctx !== children) {
      fn = fn.bind(ctx);
    }
    return children.map(fn);
  },
  forEach(children, fn, ctx) {
    if (isNil(children)) {
      return;
    }
    children = Children.toArray(children);
    if (ctx && ctx !== children) {
      fn = fn.bind(ctx);
    }
    for (let i = 0, len = children.length; i < len; i++) {
      const child = isInvalid(children[i]) ? null : children[i];

      fn(child, i, children);
    }
  },
  count(children) {
    children = Children.toArray(children);
    return children.length;
  },
  only(children) {
    children = Children.toArray(children);
    if (children.length !== 1) {
      throw new Error('Children.only() expects only one child.');
    }
    return children[0];
  },
  toArray(children) {
    if (isNil(children)) {
      return [];
    }
    if (isArray(children)) {
      const result = [];

      flatten(children, result);

      return result;
    }
    return EMPTY_CHILDREN.concat(children);
  },
};

function flatten(arr, result) {
  for (let i = 0, len = arr.length; i < len; i++) {
    const value = arr[i];
    if (isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}
