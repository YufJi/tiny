/* tslint:disable: no-empty */
import { camelCase } from 'lodash';
import {
  isString,
  isAttrAnEvent,
  isNumber,
  isArray,
  isFunction,
} from '../utils';
import {
  isInvalid,
  isNil,
  isValidElement,
  EMPTY_CHILDREN,
  VType,
} from '../shared';
import createElement, { mountChild, mountElement, insertElement } from './create-element';
import { unmount, unmountChildren } from './unmount';
import Ref from './ref';
import { addListener, eventProxy, toEventName } from '../event';
import transformRpx from '../utils/transformRpx';

export function patch(
  lastVnode,
  nextVnode,
  parentNode,
  context,
) {
  const lastDom = lastVnode.dom;
  let newDom;
  const lastVnodeIsArray = isArray(lastVnode);
  const nextVnodeisArray = isArray(nextVnode);
  if (isSameVNode(lastVnode, nextVnode)) {
    const { vtype } = nextVnode;
    if (vtype & VType.Node) {
      patchProps(lastDom, nextVnode.props, lastVnode.props, lastVnode);
      patchChildren(
        lastDom,
        lastVnode.children,
        nextVnode.children,
        context,
      );
      if (nextVnode.ref !== null) {
        Ref.update(lastVnode, nextVnode, lastDom);
      }
      newDom = lastDom;
    } else if ((vtype & VType.Composite) > 0) {
      newDom = nextVnode.update(lastVnode, nextVnode, context);
    } else if (vtype & VType.Text) {
      return patchVText(lastVnode, nextVnode);
    } else if (vtype & VType.Portal) {
      patchChildren(lastVnode.type, lastVnode.children, nextVnode.children, context);
    }
    // @TODO: test case
    nextVnode.dom = newDom || lastDom;
  } else if (isArray(lastVnode) && isArray(nextVnode)) {
    patchArrayChildren(lastDom, lastVnode, nextVnode, context, false);
  } else if (lastVnodeIsArray && !nextVnodeisArray) {
    patchArrayChildren(parentNode, lastVnode, [nextVnode], context, false);
  } else if (!lastVnodeIsArray && nextVnodeisArray) {
    newDom = createElement(nextVnode, context);
    insertElement(newDom, parentNode, lastDom);
    parentNode.removeChild(lastDom);
  } else {
    unmount(lastVnode);
    newDom = createElement(nextVnode, context);
    if (nextVnode !== null) {
      nextVnode.dom = newDom;
    }
    const newDomIsArray = isArray(newDom);
    const lastDomIsArray = isArray(lastDom);
    if (newDomIsArray) {
      insertElement(newDom, parentNode, lastDom);
      parentNode.removeChild(lastDom);
    } else if (lastDomIsArray) {
      parentNode = lastDom[0].parentNode;
      parentNode.insertBefore(newDom, lastDom[0]);
      for (let i = 0; i < lastDom.length; i++) {
        parentNode.removeChild(lastDom[i]);
      }
    } else if (parentNode !== null) {
      if (lastDom != null) {
        parentNode.replaceChild(newDom, lastDom);
      } else {
        parentNode.appendChild(newDom);
      }
    }
  }
  return newDom;
}

function patchArrayChildren(
  parentDom,
  lastChildren,
  nextChildren,
  context,
) {
  const lastLength = lastChildren.length;
  const nextLength = nextChildren.length;
  if (lastLength === 0) {
    if (nextLength > 0) {
      for (let i = 0; i < nextLength; i++) {
        mountChild(nextChildren[i], parentDom, context);
      }
    }
  } else if (nextLength === 0) {
    unmountChildren(lastChildren);
    parentDom.textContent = '';
  } else if (isKeyed(lastChildren, nextChildren)) {
    patchKeyedChildren(
      lastChildren,
      nextChildren,
      parentDom,
      context,
      lastLength,
      nextLength,
    );
  } else {
    patchNonKeyedChildren(
      parentDom,
      lastChildren,
      nextChildren,
      context,
      lastLength,
      nextLength,
    );
  }
}

export function patchChildren(
  parentDom,
  lastChildren,
  nextChildren,
  context,
) {
  const lastChildrenIsArray = isArray(lastChildren);
  const nextChildrenIsArray = isArray(nextChildren);
  if (lastChildrenIsArray && nextChildrenIsArray) {
    patchArrayChildren(parentDom, lastChildren, nextChildren, context);
  } else if (!lastChildrenIsArray && !nextChildrenIsArray) {
    patch(lastChildren, nextChildren, parentDom, context);
  } else if (lastChildrenIsArray && !nextChildrenIsArray) {
    patchArrayChildren(parentDom, lastChildren, [nextChildren], context);
  } else if (!lastChildrenIsArray && nextChildrenIsArray) {
    patchArrayChildren(parentDom, [lastChildren], nextChildren, context);
  }
}

function patchNonKeyedChildren(
  parentDom,
  lastChildren,
  nextChildren,
  context,
  lastLength,
  nextLength,
) {
  const minLength = Math.min(lastLength, nextLength);
  let i = 0;
  while (i < minLength) {
    patch(lastChildren[i], nextChildren[i], parentDom, context);
    i++;
  }
  if (lastLength < nextLength) {
    for (i = minLength; i < nextLength; i++) {
      if (parentDom !== null) {
        const refVnode = lastChildren[i - 1];
        mountElement(
          createElement(
            nextChildren[i],
            context,
          ),
          parentDom,
          isValidElement(refVnode) && refVnode.dom != null
            ? refVnode.dom.nextSibling
            : null,
        );
      }
    }
  } else if (lastLength > nextLength) {
    for (i = minLength; i < lastLength; i++) {
      unmount(lastChildren[i], parentDom);
    }
  }
}

/**
 *
 * Virtual DOM patching algorithm based on ivi by
 * Boris Kaul (@localvoid)
 * Licensed under the MIT License
 * https://github.com/ivijs/ivi/blob/master/LICENSE
 *
 */
function patchKeyedChildren(
  a,
  b,
  dom,
  context,
  aLength,
  bLength,
) {
  let aEnd = aLength - 1;
  let bEnd = bLength - 1;
  let aStart = 0;
  let bStart = 0;
  let i;
  let j;
  let aNode;
  let bNode;
  let nextNode;
  let nextPos;
  let node;
  let aStartNode = a[aStart];
  let bStartNode = b[bStart];
  let aEndNode = a[aEnd];
  let bEndNode = b[bEnd];

  // Step 1
  // tslint:disable-next-line

  // Sync nodes with the same key at the beginning.
  while (aStartNode.key === bStartNode.key) {
    patch(aStartNode, bStartNode, dom, context);
    aStart++;
    bStart++;
    if (aStart > aEnd || bStart > bEnd) {
      break;
    }
    aStartNode = a[aStart];
    bStartNode = b[bStart];
  }

  // Sync nodes with the same key at the end.
  while (aEndNode.key === bEndNode.key) {
    patch(aEndNode, bEndNode, dom, context);
    aEnd--;
    bEnd--;
    if (aStart > aEnd || bStart > bEnd) {
      break;
    }
    aEndNode = a[aEnd];
    bEndNode = b[bEnd];
  }

  if (aStart > aEnd) {
    if (bStart <= bEnd) {
      nextPos = bEnd + 1;
      nextNode = nextPos < bLength ? b[nextPos].dom : null;
      while (bStart <= bEnd) {
        node = b[bStart];
        bStart++;
        attachNewNode(dom, createElement(node, context), nextNode);
      }
    }
  } else if (bStart > bEnd) {
    while (aStart <= aEnd) {
      unmount(a[aStart++], dom);
    }
  } else {
    const aLeft = aEnd - aStart + 1;
    const bLeft = bEnd - bStart + 1;
    const sources = new Array(bLeft);

    // Mark all nodes as inserted.
    for (i = 0; i < bLeft; i++) {
      sources[i] = -1;
    }
    let moved = false;
    let pos = 0;
    let patched = 0;

    // When sizes are small, just loop them through
    if (bLeft <= 4 || aLeft * bLeft <= 16) {
      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i];
        if (patched < bLeft) {
          for (j = bStart; j <= bEnd; j++) {
            bNode = b[j];
            if (aNode.key === bNode.key) {
              sources[j - bStart] = i;

              if (pos > j) {
                moved = true;
              } else {
                pos = j;
              }
              patch(aNode, bNode, dom, context);
              patched++;
              a[i] = null;
              break;
            }
          }
        }
      }
    } else {
      const keyIndex = new Map();

      for (i = bStart; i <= bEnd; i++) {
        keyIndex.set(b[i].key, i);
      }

      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i];

        if (patched < bLeft) {
          j = keyIndex.get(aNode.key);

          if (j !== undefined) {
            bNode = b[j];
            sources[j - bStart] = i;
            if (pos > j) {
              moved = true;
            } else {
              pos = j;
            }
            patch(aNode, bNode, dom, context);
            patched++;
            a[i] = null;
          }
        }
      }
    }
    if (aLeft === aLength && patched === 0) {
      unmountChildren(a);
      dom.textContent = '';
      while (bStart < bLeft) {
        node = b[bStart];
        bStart++;
        attachNewNode(dom, createElement(node, context), null);
      }
    } else {
      i = aLeft - patched;
      while (i > 0) {
        aNode = a[aStart++];
        if (aNode !== null) {
          unmount(aNode, dom);
          i--;
        }
      }
      if (moved) {
        const seq = lis(sources);
        j = seq.length - 1;
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === -1) {
            pos = i + bStart;
            node = b[pos];
            nextPos = pos + 1;
            attachNewNode(
              dom,
              createElement(node, context),
              nextPos < bLength ? b[nextPos].dom : null,
            );
          } else if (j < 0 || i !== seq[j]) {
            pos = i + bStart;
            node = b[pos];
            nextPos = pos + 1;
            attachNewNode(
              dom,
              node.dom,
              nextPos < bLength ? b[nextPos].dom : null,
            );
          } else {
            j--;
          }
        }
      } else if (patched !== bLeft) {
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === -1) {
            pos = i + bStart;
            node = b[pos];
            nextPos = pos + 1;
            attachNewNode(
              dom,
              createElement(node, context),
              nextPos < bLength ? b[nextPos].dom : null,
            );
          }
        }
      }
    }
  }
}

function attachNewNode(parentDom, newNode, nextNode) {
  if (isNil(nextNode)) {
    parentDom.appendChild(newNode);
  } else {
    parentDom.insertBefore(newNode, nextNode);
  }
}

/**
 * Slightly modified Longest Increased Subsequence algorithm, it ignores items that have -1 value, they're representing
 * new items.
 *
 * http://en.wikipedia.org/wiki/Longest_increasing_subsequence
 *
 * @param a Array of numbers.
 * @returns Longest increasing subsequence.
 */
function lis(a) {
  const p = a.slice();
  const result = [];
  result.push(0);
  let u;
  let v;

  for (let i = 0, il = a.length; i < il; ++i) {
    if (a[i] === -1) {
      continue;
    }

    const j = result[result.length - 1];

    if (a[j] < a[i]) {
      p[i] = j;
      result.push(i);
      continue;
    }

    u = 0;
    v = result.length - 1;

    while (u < v) {
      const c = ((u + v) / 2) | 0;
      if (a[result[c]] < a[i]) {
        u = c + 1;
      } else {
        v = c;
      }
    }

    if (a[i] < a[result[u]]) {
      if (u > 0) {
        p[i] = result[u - 1];
      }
      result[u] = i;
    }
  }

  u = result.length;
  v = result[u - 1];

  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }

  return result;
}

function isKeyed(lastChildren, nextChildren) {
  return (
    nextChildren.length > 0
    && !isNil(nextChildren[0])
    && !isNil(nextChildren[0].key)
    && lastChildren.length > 0
    && !isNil(lastChildren[0])
    && !isNil(lastChildren[0].key)
  );
}

function isSameVNode(a, b) {
  if (isInvalid(a) || isInvalid(b) || isArray(a) || isArray(b)) {
    return false;
  }
  return a.type === b.type && a.vtype === b.vtype && a.key === b.key;
}

function patchVText(lastVNode, nextVNode) {
  const { dom } = lastVNode;
  if (dom === null) {
    return;
  }
  const nextText = nextVNode.text;
  nextVNode.dom = dom;

  if (lastVNode.text !== nextText) {
    dom.nodeValue = nextText;
  }
  return dom;
}

const skipProps = {
  children: 1,
  key: 1,
  ref: 1,
  owner: 1,
};

const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

function setStyle(domStyle, style, value) {
  if (isNil(value) || (isNumber(value) && isNaN(value))) {
    domStyle[style] = '';
    return;
  }
  if (style === 'float') {
    domStyle.cssFloat = value;
    domStyle.styleFloat = value;
    return;
  }
  domStyle[style] = !isNumber(value) || IS_NON_DIMENSIONAL.test(style) ? value : `${value}px`;
}

function patchEvent(
  eventName,
  lastEvent,
  nextEvent,
  domNode,
) {
  const { raw, name, options } = toEventName(eventName);
  const { capture, stop } = options;

  const listener = domNode._listeners || (domNode._listeners = {});
  const callback = domNode._callback || (domNode._callback = {});

  if (nextEvent) {
    listener[`${name}`] = listener[`${name}`] || {};

    if (!lastEvent) {
      const fn = eventProxy.bind(domNode, name, capture);
      callback[raw] = fn;
      addListener(domNode, name, fn, options);
    }

    const displayName = nextEvent.name;

    listener[`${name}`][`${capture ? 'capture' : 'bubble'}`] = {
      options,
      handler: nextEvent,
      name: displayName,
    };
    domNode.setAttribute(raw, displayName);
  } else {
    listener[`${name}`][`${capture ? 'capture' : 'bubble'}`] = null;
    domNode.removeAttribute(raw);
  }
}

function patchStyle(lastAttrValue, nextAttrValue, dom) {
  const domStyle = dom.style;
  let style;
  let value;

  if (isString(nextAttrValue)) {
    try {
      domStyle.cssText = transformRpx(nextAttrValue);
    } catch (error) {
      dom.setAttribute('style', transformRpx(nextAttrValue));
    }

    return;
  }
  if (!isNil(lastAttrValue) && !isString(lastAttrValue)) {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      if (value !== lastAttrValue[style]) {
        setStyle(domStyle, style, transformRpx(value));
      }
    }
    for (style in lastAttrValue) {
      if (isNil(nextAttrValue[style])) {
        domStyle[style] = '';
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      setStyle(domStyle, style, transformRpx(value));
    }
  }
}

export function patchProp(
  domNode,
  prop,
  lastValue,
  nextValue,
  lastVnode,
) {
  // fix the value update for textarea/input
  if (lastValue !== nextValue || prop === 'value') {
    if (skipProps[prop] === 1) return;

    if (prop === 'className') {
      prop = 'class';
    }

    if (prop === 'class') {
      domNode.className = nextValue;
    } else if (isAttrAnEvent(prop)) {
      patchEvent(prop, lastValue, nextValue, domNode);
    } else if (prop === 'style') {
      patchStyle(lastValue, nextValue, domNode);
    } else if (prop === 'dangerouslySetInnerHTML') {
      const lastHtml = lastValue && lastValue.__html;
      const nextHtml = nextValue && nextValue.__html;

      if (lastHtml !== nextHtml) {
        if (!isNil(nextHtml)) {
          if (
            isValidElement(lastVnode)
            && lastVnode.children !== EMPTY_CHILDREN
          ) {
            unmountChildren(lastVnode.children);
            lastVnode.children = [];
          }
          domNode.innerHTML = nextHtml;
        }
      }
    } else if (/^data-/.test(prop)) {
      const key = prop.replace(/^data-/, '');
      if (!domNode._dataset) {
        domNode._dataset = {};
      }

      domNode._dataset[camelCase(key)] = nextValue;
    } else if (isNil(nextValue) || nextValue === false) {
      domNode.removeAttribute(prop);
    } else if (!isFunction(nextValue)) {
      domNode.setAttribute(prop, nextValue);
    }
  }
}

function patchProps(
  domNode,
  nextProps,
  previousProps,
  lastVnode,
) {
  for (const propName in previousProps) {
    const value = previousProps[propName];
    if (isNil(nextProps[propName]) && !isNil(value)) {
      if (propName === 'dangerouslySetInnerHTML') {
        domNode.textContent = '';
      } else if (propName === 'className') {
        domNode.removeAttribute('class');
      } else {
        domNode.removeAttribute(propName);
      }
    }
  }
  for (const propName in nextProps) {
    patchProp(
      domNode,
      propName,
      previousProps[propName],
      nextProps[propName],
      lastVnode,
    );
  }
}

export default patch;
