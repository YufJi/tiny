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
