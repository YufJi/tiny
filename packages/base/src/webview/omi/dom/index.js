import { camelCase } from 'lodash';
import { isEventAttr } from 'shared/addListener';
import { transformRpx } from '@/webview/util';

import { applyRef } from '../util';

import bindEvent from './bindEvent';
import bindAnimation from './bindAnimation';

/**
 * Create an element with the given nodeName.
 * @param {string} nodeName The DOM node to create
 * @param {boolean} [isSvg=false] If `true`, creates an element within the SVG
 *  namespace.
 * @returns {Element} The created DOM node
 */
export function createNode(nodeName, isSvg) {
  /** @type {Element} */
  const node = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', nodeName)
    : document.createElement(nodeName);
  node.normalizedNodeName = nodeName;
  return node;
}

/**
 * Remove a child node from its parent if attached.
 * @param {Node} node The node to remove
 */
export function removeNode(node) {
  const { parentNode } = node;
  if (parentNode) parentNode.removeChild(node);
}

/**
 * Set a named attribute on the given Node, with special behavior for some names
 * and event handlers. If `value` is `null`, the attribute/handler will be
 * removed.
 * @param {Element} node An element to mutate
 * @param {string} name The name/key to set, such as an event or attribute name
 * @param {*} old The last value that was set for this name/node pair
 * @param {*} value An attribute value, such as a function to be used as an
 *  event handler
 * @param {boolean} isSvg Are we currently diffing inside an svg?
 * @private
 */

const ignoreNames = ['key'];

export function setAccessor(node, name, old, value, isSvg, component) {
  if (ignoreNames.indexOf(name) !== -1) return;

  if (name === 'className') name = 'class';

  if (name === 'ref') {
    applyRef(old, null);
    applyRef(value, node);
  } else if (name === 'class' && !isSvg) {
    node.className = value || '';
  } else if (name === 'style') {
    if (typeof value === 'string') {
      node.style.cssText = transformRpx(value) || '';
    }
  } else if (name === 'animation') {
    bindAnimation(node, value);
  } else if (isEventAttr(name)) {
    bindEvent(node, name, value, old);
  } else if (name === 'dangerouslySetInnerHTML') {
    if (value) node.innerHTML = value.__html || '';
  } else if (node.nodeName === 'INPUT' && name === 'value') {
    node[name] = value == null ? '' : value;
  } else {
    if (/^data-[a-zA-z]+$/.test(name)) {
      const key = name.replace(/^data-/, '');
      if (!node._dataset) {
        node._dataset = {};
      }
      node._dataset[camelCase(key)] = value;
    }

    const ns = isSvg && name !== (name = name.replace(/^xlink:?/, ''));
    // spellcheck is treated differently than all other boolean values and
    // should not be removed when the value is `false`. See:
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-spellcheck
    if (value == null || value === false) {
      if (ns) {
        node.removeAttributeNS(
          'http://www.w3.org/1999/xlink',
          name.toLowerCase(),
        );
      } else {
        node.pureRemoveAttribute
          ? node.pureRemoveAttribute(name)
          : node.removeAttribute(name);
      }
    } else if (typeof value !== 'function') {
      if (ns) {
        node.setAttributeNS(
          'http://www.w3.org/1999/xlink',
          name.toLowerCase(),
          value,
        );
      } else {
        node.pureSetAttribute
          ? node.pureSetAttribute(name, value)
          : node.setAttribute(name, value);
      }
    }
  }
}
