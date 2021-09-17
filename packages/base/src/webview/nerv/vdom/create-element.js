import { isArray, isString, isNumber, doc, isBoolean } from '../utils';
import {
  isNil,
  VType,
  isValidElement,
  EMPTY_OBJ,
  isPortal,
} from '../shared';
import { patchProp } from './patch';
import Ref from './ref';

function createElement(vnode, parentContext, parentComponent) {
  let domNode;

  if (isValidElement(vnode)) {
    const { vtype } = vnode;

    if (vtype & VType.Composite) {
      domNode = vnode.init(parentContext, parentComponent);
    } else if (vtype & VType.Text) {
      domNode = doc.createTextNode(vnode.text);
      vnode.dom = domNode;
    } else if (vtype & VType.Node) {
      domNode = mountVNode(vnode, parentContext, parentComponent);
    } else if (vtype & VType.Void) {
      vnode.dom = doc.createTextNode('');
      domNode = vnode.dom;
    } else if (isPortal(vtype, vnode)) {
      vnode.type.appendChild(
        createElement(vnode.children, parentContext, parentComponent),
      );
      domNode = doc.createTextNode('');
    }
  } else if (isString(vnode) || isNumber(vnode)) {
    domNode = doc.createTextNode(vnode);
  } else if (isNil(vnode) || isBoolean(vnode)) {
    domNode = doc.createTextNode('');
  } else if (isArray(vnode)) {
    domNode = vnode.map((child) => createElement(child, parentContext, parentComponent));
  } else {
    throw new Error('Unsupported VNode.');
  }
  return domNode;
}

export function mountVNode(vnode, parentContext, parentComponent) {
  const domNode = doc.createElement(vnode.type);

  setProps(domNode, vnode);

  const { children } = vnode;
  if (isArray(children)) {
    for (let i = 0, len = children.length; i < len; i++) {
      mountChild(children[i], domNode, parentContext, parentComponent);
    }
  } else {
    mountChild(children, domNode, parentContext, parentComponent);
  }
  vnode.dom = domNode;
  if (vnode.ref !== null) {
    Ref.attach(vnode, vnode.ref, domNode);
  }
  return domNode;
}

export function mountChild(
  child,
  domNode,
  parentContext,
  parentComponent,
) {
  child.parentContext = parentContext || EMPTY_OBJ;
  const childNode = createElement(child, parentContext, parentComponent);
  mountElement(childNode, domNode);
}

export function mountElement(
  element,
  parentNode,
  refChild,
) {
  if (isArray(element)) {
    for (let i = 0; i < element.length; i+=1) {
      const el = element[i];
      mountElement(el, parentNode);
    }
  } else {
    isNil(refChild) ? parentNode.appendChild(element) : parentNode.insertBefore(element, refChild);
  }
}

export function insertElement(
  element,
  parentNode,
  lastDom,
) {
  if (isArray(element)) {
    for (let i = 0; i < element.length; i+=1) {
      const el = element[i];
      insertElement(el, parentNode, lastDom);
    }
  } else {
    parentNode.insertBefore(element, lastDom);
  }
}

function setProps(domNode, vnode) {
  const { props } = vnode;
  for (const p in props) {
    patchProp(domNode, p, null, props[p], null);
  }
}

export default createElement;
