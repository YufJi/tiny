import {
  isValidElement,
  EMPTY_CHILDREN,
} from '../shared';
import { isString, isArray, isNumber } from '../utils';
import createVNode from './create-vnode';
import createVText from './create-vtext';
import { createVoid } from './create-void';

function h(type, props, children) {
  let childNodes;

  if (props.children && !children) {
    children = props.children;
  }

  if (isArray(children)) {
    childNodes = [];
    addChildren(childNodes, children, type);
  } else if (isString(children) || isNumber(children)) {
    children = createVText(String(children));
  } else if (!isValidElement(children)) {
    children = EMPTY_CHILDREN;
  }

  props.children = childNodes !== undefined ? childNodes : children;

  return createVNode(
    type,
    props,
    props.children,
    props.key,
    props.namespace,
    props.owner,
    props.ref,
  );
}

function addChildren(
  childNodes,
  children,
  type,
) {
  if (isString(children) || isNumber(children)) {
    childNodes.push(createVText(String(children)));
  } else if (isValidElement(children)) {
    childNodes.push(children);
  } else if (isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      addChildren(childNodes, children[i], type);
    }
  } else {
    childNodes.push(createVoid());
  }
}

export default h;
