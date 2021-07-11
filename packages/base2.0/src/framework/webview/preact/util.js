import { EMPTY_ARR } from './constants';

/**
 * Assign properties from `props` to `obj`
 * @template O, P The obj and props types
 * @param {O} obj The object to copy properties to
 * @param {P} props The object to copy properties from
 * @returns {O & P}
 */
export function assign(obj, props) {
  // @ts-ignore We change the type of `obj` to be `O & P`
  for (const i in props) obj[i] = props[i];
  return /** @type {O & P} */ (obj);
}

/**
 * Remove a child node from its parent if attached. This is a workaround for
 * IE11 which doesn't support `Element.prototype.remove()`. Using this function
 * is smaller than including a dedicated polyfill.
 * @param {Node} node The node to remove
 */
export function removeNode(node) {
  const { parentNode } = node;
  if (parentNode) parentNode.removeChild(node);
}

export const { slice } = EMPTY_ARR;

export function isNullOrUndef(o) {
  return o === undefined || o === null;
}

export const { isArray } = Array;
