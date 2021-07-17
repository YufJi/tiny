/*
 * @Author: YufJ
 * @Date: 2021-07-13 11:36:44
 * @LastEditTime: 2021-07-13 11:37:55
 * @Description:
 * @FilePath: /yeact/src/vdom/create-vnode.js
 */
import {
  VType,
  EMPTY_OBJ,
} from '../shared';

function createVNode(
  type,
  props,
  children,
  key,
  namespace,
  owner,
  ref,
) {
  return {
    type,
    key: key || null,
    vtype: VType.Node,
    props: props || EMPTY_OBJ,
    children,
    namespace: namespace || null,
    _owner: owner,
    dom: null,
    ref: ref || null,
  };
}

export default createVNode;
