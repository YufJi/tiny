/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:34:21
 * @LastEditTime: 2021-08-16 11:31:26
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/nerv/vdom/unmount.js
 */
import { isNil, isInvalid, VType } from '../shared';
import { isAttrAnEvent, isArray } from '../utils';
import { toEventName } from '../event';
import Ref from './ref';

export function unmountChildren(
  children,
  parentDom,
) {
  if (isArray(children)) {
    for (let i = 0, len = children.length; i < len; i++) {
      unmount(children[i], parentDom);
    }
  } else {
    unmount(children, parentDom);
  }
}

export function unmount(vnode, parentDom) {
  if (isInvalid(vnode)) {
    return;
  }
  const { vtype } = vnode;
  // Bitwise operators for better performance
  // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
  const { dom } = vnode;

  if ((vtype & VType.Composite) > 0) {
    vnode.destroy();
  } else if ((vtype & VType.Node) > 0) {
    const { props, children, ref } = vnode;
    unmountChildren(children);
    for (const propName in props) {
      if (isAttrAnEvent(propName)) {
        const { raw, name, options } = toEventName(propName);
        const { capture } = options;

        const callback = dom._callback || (dom._callback = {});

        dom.removeEventListener(name, callback[raw], capture);
      }
    }
    if (ref !== null) {
      Ref.detach(vnode, ref, dom);
    }
  } else if (vtype & VType.Portal) {
    unmountChildren(vnode.children, vnode.type);
  }

  if (!isNil(parentDom) && !isNil(dom)) {
    if (isArray(dom)) {
      for (let i = 0; i < dom.length; i++) {
        parentDom.removeChild(dom[i]);
      }
    } else {
      parentDom.removeChild(dom);
    }
  }
  // vnode.dom = null
}
