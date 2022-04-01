import { camelCase, isArray, isNil, isObject } from 'lodash';

import { TemplateTag, isEventAttr } from 'shared';
import { transformRpx } from '@/webview/util';

import bindEvent from './bindEvent';
import bindAnimation from './bindAnimation';

/**
 * Create an element with the given nodeName.
 * @param {string} nodeName The DOM node to create
 *  namespace.
 * @returns {Element} The created DOM node
 */
export function createNode(nodeName) {
  /** @type {Element} */
  const node = document.createElement(nodeName);
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
 * @private
 */

const ignoreNames = ['key'];

export function setAccessor(node, name, old, value, component) {
  if (ignoreNames.indexOf(name) !== -1) return;

  if (name === 'className') {
    name = 'class';
  }

  if (name === 'class') {
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
  } else if (`${TemplateTag.UpperCasePerfix}-INPUT` === node.nodeName && name === 'value') {
    node[name] = value == null ? '' : value;
  } else if (`${TemplateTag.UpperCasePerfix}-LABEL` === node.nodeName && name === 'for') {
    node.htmlFor = value;
  } else if (/^data-[a-zA-z]+$/.test(name)) { // dataset
    const key = name.replace(/^data-/, '');
    if (!node._dataset) {
      node._dataset = {};
    }
    node._dataset[camelCase(key)] = value;
  } else if (isNil(value) || value === false) {
    node.pureRemoveAttribute
      ? node.pureRemoveAttribute(name)
      : node.removeAttribute(name);
  } else if (typeof value !== 'function') {
    let finalVal = value;

    if (isObject(value) || isArray(value)) {
      finalVal = JSON.stringify(value);
    }

    node.pureSetAttribute
      ? node.pureSetAttribute(name, finalVal)
      : node.setAttribute(name, finalVal);
  }
}
