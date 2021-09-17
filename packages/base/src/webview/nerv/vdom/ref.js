/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:35:32
 * @LastEditTime: 2021-07-13 11:35:47
 * @Description:
 * @FilePath: /yeact/src/vdom/ref.js
 */
import { isFunction, isString, isObject } from '../utils';
import { isComposite } from '../shared';
import { errorCatcher } from '../lifecycle';

export default {
  update(lastVnode, nextVnode, domNode) {
    const prevRef = lastVnode != null && lastVnode.ref;
    const nextRef = nextVnode != null && nextVnode.ref;

    if (prevRef !== nextRef) {
      this.detach(lastVnode, prevRef, lastVnode.dom);
      this.attach(nextVnode, nextRef, domNode);
    }
  },
  attach(vnode, ref, domNode) {
    const node = isComposite(vnode) ? vnode.component : domNode;
    if (isFunction(ref)) {
      const componentForCatcher = isComposite(vnode) ? vnode.component : vnode;
      errorCatcher(() => {
        ref(node);
      }, componentForCatcher);
    } else if (isString(ref)) {
      const inst = vnode._owner;
      if (inst && isFunction(inst.render)) {
        inst.refs[ref] = node;
      }
    } else if (isObject(ref)) {
      ref.current = node;
    }
  },
  detach(vnode, ref, domNode) {
    const node = isComposite(vnode) ? vnode.component : domNode;
    if (isFunction(ref)) {
      const componentForCatcher = isComposite(vnode) ? vnode.component : vnode;
      errorCatcher(() => {
        ref(null);
      }, componentForCatcher);
    } else if (isString(ref)) {
      const inst = vnode._owner;
      if (inst.refs[ref] === node && isFunction(inst.render)) {
        delete inst.refs[ref];
      }
    } else if (isObject(ref)) {
      ref.current = null;
    }
  },
};
