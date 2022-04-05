import { Fragment } from './util';

const stack = [];

export function h(nodeName, attributes) {
  let children = [];
  let lastSimple;
  let child;
  let simple;

  for (let i = 2; i < arguments.length; i+=1) {
    // eslint-disable-next-line prefer-rest-params
    stack.push(arguments[i]);
  }

  if (attributes && attributes.children != null) {
    if (!stack.length) {
      stack.push(attributes.children);
    }
    delete attributes.children;
  }

  while (stack.length) {
    if ((child = stack.shift()) && child.shift !== undefined) {
      for (let i = 0; i < child.length; i+=1) {
        stack.push(child[i]);
      }
    } else {
      if (typeof child === 'boolean') child = null;

      if ((simple = typeof nodeName !== 'function')) {
        if (child == null) child = '';
        else if (typeof child === 'number') child = String(child);
        else if (typeof child !== 'string') simple = false;
      }

      if (simple && lastSimple) {
        children[children.length - 1] += child;
      } else if (children.length === 0) {
        children = [child];
      } else {
        children.push(child);
      }

      lastSimple = simple;
    }
  }

  if (nodeName === Fragment) {
    return children;
  }

  const p = {
    nodeName,
    children,
    attributes: attributes == null ? undefined : attributes,
    key: attributes == null ? undefined : attributes.key,
  };

  return p;
}
