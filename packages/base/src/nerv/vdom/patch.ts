/* tslint:disable: no-empty */
import {
  isString,
  isAttrAnEvent,
  isNumber,
  isArray,
  isFunction,
  MapClass,
} from '@/nerv/utils';
import {
  Props,
  VText,
  isInvalid,
  VNode,
  isNullOrUndef,
  isValidElement,
  EMPTY_CHILDREN,
  VType,
} from '@/nerv/shared';
import createElement, { mountChild, mountElement, insertElement } from './create-element';
import { unmount, unmountChildren } from './unmount';
import Ref from './ref';
import { attachEvent, detachEvent } from '../event';
import SVGPropertyConfig from './svg-property-config';

export function patch(
  lastVnode,
  nextVnode,
  parentNode: Element,
  context: object,
  isSvg?: boolean,
) {
  const lastDom = lastVnode.dom;
  let newDom;
  const lastVnodeIsArray = isArray(lastVnode);
  const nextVnodeisArray = isArray(nextVnode);
  if (isSameVNode(lastVnode, nextVnode)) {
    const { vtype } = nextVnode;
    if (vtype & VType.Node) {
      isSvg = isNullOrUndef(isSvg) ? lastVnode.isSvg : isSvg;
      if (isSvg) {
        nextVnode.isSvg = isSvg;
      }
      patchProps(lastDom, nextVnode.props, lastVnode.props, lastVnode, isSvg);
      patchChildren(
        lastDom,
        lastVnode.children,
        nextVnode.children,
        context,
        isSvg as boolean,
      );
      if (nextVnode.ref !== null) {
        Ref.update(lastVnode, nextVnode, lastDom);
      }
      newDom = lastDom;
    } else if ((vtype & (VType.Composite)) > 0) {
      newDom = nextVnode.update(lastVnode, nextVnode, context);
    } else if (vtype & VType.Text) {
      return patchVText(lastVnode, nextVnode);
    } else if (vtype & VType.Portal) {
      patchChildren(lastVnode.type, lastVnode.children, nextVnode.children, context, isSvg as boolean);
    }
    // @TODO: test case
    nextVnode.dom = newDom || lastDom;
  } else if (isArray(lastVnode) && isArray(nextVnode)) {
    patchArrayChildren(lastDom, lastVnode, nextVnode, context, false);
  } else if (lastVnodeIsArray && !nextVnodeisArray) {
    patchArrayChildren(parentNode, lastVnode, [nextVnode], context, false);
  } else if (!lastVnodeIsArray && nextVnodeisArray) {
    newDom = createElement(nextVnode, isSvg, context);
    insertElement(newDom, parentNode, lastDom);
    parentNode.removeChild(lastDom);
  } else {
    unmount(lastVnode);
    newDom = createElement(nextVnode, isSvg, context);
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
  parentDom: Element,
  lastChildren,
  nextChildren,
  context: object,
  isSvg: boolean,
) {
  const lastLength = lastChildren.length;
  const nextLength = nextChildren.length;
  if (lastLength === 0) {
    if (nextLength > 0) {
      for (let i = 0; i < nextLength; i++) {
        mountChild(nextChildren[i], parentDom, context, isSvg);
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
      isSvg,
      lastLength,
      nextLength,
    );
  } else {
    patchNonKeyedChildren(
      parentDom,
      lastChildren,
      nextChildren,
      context,
      isSvg,
      lastLength,
      nextLength,
    );
  }
}

export function patchChildren(
  parentDom: Element,
  lastChildren,
  nextChildren,
  context: object,
  isSvg: boolean,
) {
  // @TODO: is a better way to compatible with react-router?
  // if (lastChildren === nextChildren) {
  //   return
  // }
  const lastChildrenIsArray = isArray(lastChildren);
  const nextChildrenIsArray = isArray(nextChildren);
  if (lastChildrenIsArray && nextChildrenIsArray) {
    patchArrayChildren(parentDom, lastChildren, nextChildren, context, isSvg);
  } else if (!lastChildrenIsArray && !nextChildrenIsArray) {
    patch(lastChildren, nextChildren, parentDom, context, isSvg);
  } else if (lastChildrenIsArray && !nextChildrenIsArray) {
    patchArrayChildren(parentDom, lastChildren, [nextChildren], context, isSvg);
  } else if (!lastChildrenIsArray && nextChildrenIsArray) {
    patchArrayChildren(parentDom, [lastChildren], nextChildren, context, isSvg);
  }
}

function patchNonKeyedChildren(
  parentDom: Element,
  lastChildren,
  nextChildren,
  context: object,
  isSvg: boolean,
  lastLength: number,
  nextLength: number,
) {
  const minLength = Math.min(lastLength, nextLength);
  let i = 0;
  while (i < minLength) {
    patch(lastChildren[i], nextChildren[i], parentDom, context, isSvg);
    i++;
  }
  if (lastLength < nextLength) {
    for (i = minLength; i < nextLength; i++) {
      if (parentDom !== null) {
        const refVnode = lastChildren[i - 1];
        mountElement(
          createElement(
            nextChildren[i],
            isSvg,
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
  a: VNode[],
  b: VNode[],
  dom: Element,
  context,
  isSvg: boolean,
  aLength: number,
  bLength: number,
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
  outer: {
    // Sync nodes with the same key at the beginning.
    while (aStartNode.key === bStartNode.key) {
      patch(aStartNode, bStartNode, dom, context, isSvg);
      aStart++;
      bStart++;
      if (aStart > aEnd || bStart > bEnd) {
        break outer;
      }
      aStartNode = a[aStart];
      bStartNode = b[bStart];
    }

    // Sync nodes with the same key at the end.
    while (aEndNode.key === bEndNode.key) {
      patch(aEndNode, bEndNode, dom, context, isSvg);
      aEnd--;
      bEnd--;
      if (aStart > aEnd || bStart > bEnd) {
        break outer;
      }
      aEndNode = a[aEnd];
      bEndNode = b[bEnd];
    }
  }

  if (aStart > aEnd) {
    if (bStart <= bEnd) {
      nextPos = bEnd + 1;
      nextNode = nextPos < bLength ? b[nextPos].dom : null;
      while (bStart <= bEnd) {
        node = b[bStart];
        bStart++;
        attachNewNode(dom, createElement(node, isSvg, context), nextNode);
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
              patch(aNode, bNode, dom, context, isSvg);
              patched++;
              a[i] = null as any;
              break;
            }
          }
        }
      }
    } else {
      const keyIndex = new MapClass();

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
            patch(aNode, bNode, dom, context, isSvg);
            patched++;
            a[i] = null as any;
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
        attachNewNode(dom, createElement(node, isSvg, context), null);
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
              createElement(node, isSvg, context),
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
              createElement(node, isSvg, context),
              nextPos < bLength ? b[nextPos].dom : null,
            );
          }
        }
      }
    }
  }
}

function attachNewNode(parentDom, newNode, nextNode) {
  if (isNullOrUndef(nextNode)) {
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
function lis(a: number[]): number[] {
  const p = a.slice();
  const result: number[] = [];
  result.push(0);
  let u: number;
  let v: number;

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

function isKeyed(lastChildren: VNode[], nextChildren: VNode[]): boolean {
  return (
    nextChildren.length > 0
    && !isNullOrUndef(nextChildren[0])
    && !isNullOrUndef(nextChildren[0].key)
    && lastChildren.length > 0
    && !isNullOrUndef(lastChildren[0])
    && !isNullOrUndef(lastChildren[0].key)
  );
}

function isSameVNode(a, b) {
  if (isInvalid(a) || isInvalid(b) || isArray(a) || isArray(b)) {
    return false;
  }
  return a.type === b.type && a.vtype === b.vtype && a.key === b.key;
}

function patchVText(lastVNode: VText, nextVNode: VText) {
  const { dom } = lastVNode;
  if (dom === null) {
    return;
  }
  const nextText = nextVNode.text;
  nextVNode.dom = dom;

  if (lastVNode.text !== nextText) {
    dom.nodeValue = nextText as string;
  }
  return dom;
}

const skipProps = {
  children: 1,
  key: 1,
  ref: 1,
  owner: 1,
  /* 编译小程序，生成的prop */
  __owner: 1,
  __page: 1,
};

const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

function setStyle(domStyle, style, value) {
  if (isNullOrUndef(value) || (isNumber(value) && isNaN(value))) {
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
  eventName: string,
  lastEvent: Function,
  nextEvent: Function,
  domNode: Element,
) {
  if (lastEvent !== nextEvent) {
    if (isFunction(lastEvent)) {
      detachEvent(domNode, eventName, lastEvent);
    }
    attachEvent(domNode, eventName, nextEvent);
  }
}

const BASE_DEVICE_WIDTH = 750;
const isIOS = navigator.userAgent.match('iPhone');
const deviceWidth = window.screen.width || 375;
const deviceDPR = window.devicePixelRatio || 2;
const eps = 1e-4;

function rpx2px(number) {
  if (number === 0) {
    return 0;
  }
  number = number / BASE_DEVICE_WIDTH * deviceWidth;
  number = Math.floor(number + eps);
  if (number === 0) {
    if (deviceDPR === 1 || !isIOS) {
      return 1;
    } else {
      return 0.5;
    }
  }
  return number;
}

function transformRpx(str: string) {
  if (typeof str !== 'string') {
    return str;
  }
  let state = 0;
  let res = '';
  let number = '';
  for (let i = 0, l = str.length; i < l; i++) {
    const char = str[i];
    if (/[\d.]/.test(char) && i < l - 1 && state !== 2) {
      state = 3;
      number += char;
      continue;
    } else if (state === 1) {
      if (char === '\n' || char === '\r' || char === ' ' && res.slice(-1) === ' ') {
        continue;
      }
      if (char === '(' && res.endsWith('url')) {
        state = 2;
      }
      if (char === ';') {
        state = 0;
      }
      res += char;
    } else if (state === 2) {
      if (char === ')') {
        state = 1;
      }
      res += char;
    } else if (state === 3) {
      if (!/[\d.]/.test(char)) {
        const safeNum = Number(number);
        if (str.slice(i, i + 4).match(/rpx([\s;),}]|$)/) && !isNaN(safeNum)) {
          res += `${rpx2px(safeNum)}px`;
          i += 2;
        } else {
          res += number;
          res += char;
        }
        state = 1;
        number = '';
        continue;
      }
      number += char;
      if (i === l - 1) {
        // 结束了，number还没处理
        res += number;
      }
    } else {
      if (char === ':') {
        state = 1;
      }
      res += char;
    }
  }
  return res;
}

function patchStyle(lastAttrValue: CSSStyleSheet, nextAttrValue: CSSStyleSheet, dom: HTMLElement) {
  const domStyle = dom.style;
  let style;
  let value;

  if (isString(nextAttrValue)) {
    domStyle.cssText = transformRpx(nextAttrValue);
    return;
  }
  if (!isNullOrUndef(lastAttrValue) && !isString(lastAttrValue)) {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      if (value !== lastAttrValue[style]) {
        setStyle(domStyle, style, value);
      }
    }
    for (style in lastAttrValue) {
      if (isNullOrUndef(nextAttrValue[style])) {
        domStyle[style] = '';
      }
    }
  } else {
    for (style in nextAttrValue) {
      value = nextAttrValue[style];
      setStyle(domStyle, style, value);
    }
  }
}

export function patchProp(
  domNode: Element,
  prop: string,
  lastValue,
  nextValue,
  lastVnode: VNode | null,
  isSvg?: boolean,
) {
  // fix the value update for textarea/input
  if (lastValue !== nextValue || prop === 'value') {
    if (prop === 'className') {
      prop = 'class';
    }
    if (skipProps[prop] === 1) {

    } else if (prop === 'class' && !isSvg) {
      domNode.className = nextValue;
    } else if (prop === 'dangerouslySetInnerHTML') {
      const lastHtml = lastValue && lastValue.__html;
      const nextHtml = nextValue && nextValue.__html;

      if (lastHtml !== nextHtml) {
        if (!isNullOrUndef(nextHtml)) {
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
    } else if (isAttrAnEvent(prop)) {
      patchEvent(prop, lastValue, nextValue, domNode);
    } else if (prop === 'style') {
      patchStyle(lastValue, nextValue, domNode as HTMLElement);
    } else if (isNullOrUndef(nextValue) || nextValue === false) {
      domNode.removeAttribute(prop);
    } else {
      const namespace = SVGPropertyConfig.DOMAttributeNamespaces[prop];
      if (isSvg && namespace) {
        if (nextValue) {
          domNode.setAttributeNS(namespace, prop, nextValue);
        } else {
          const colonPosition = prop.indexOf(':');
          const localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
          domNode.removeAttributeNS(namespace, localName);
        }
      } else {
        if (!isFunction(nextValue)) {
          domNode.setAttribute(prop, nextValue);
        }
        // WARNING: Non-event attributes with function values:
        // https://reactjs.org/blog/2017/09/08/dom-attributes-in-react-16.html#changes-in-detail
      }
    }
  }
}

function patchProps(
  domNode: Element,
  nextProps: Props,
  previousProps: Props,
  lastVnode: VNode,
  isSvg?: boolean,
) {
  for (const propName in previousProps) {
    const value = previousProps[propName];
    if (isNullOrUndef(nextProps[propName]) && !isNullOrUndef(value)) {
      if (isAttrAnEvent(propName)) {
        detachEvent(domNode, propName, value);
      } else if (propName === 'dangerouslySetInnerHTML') {
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
      isSvg,
    );
  }
}

export default patch;
