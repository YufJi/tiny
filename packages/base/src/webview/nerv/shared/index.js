export const VType = {
  Text: 1,
  Node: 1 << 1,
  Composite: 1 << 2,
  Void: 1 << 4,
  Portal: 1 << 5,
};

export const EMPTY_CHILDREN = [];

export const EMPTY_OBJ = {};

export function isNil(o) {
  return o === undefined || o === null;
}

export function isInvalid(o) {
  return isNil(o) || o === true || o === false;
}

export function isVNode(node) {
  return !isNil(node) && node.vtype === VType.Node;
}

export function isVText(node) {
  return !isNil(node) && node.vtype === VType.Text;
}

export function isComponent(instance) {
  return !isInvalid(instance) && instance.isReactComponent === EMPTY_OBJ;
}

export function isWidget(node) {
  return (
    !isNil(node)
    && (node.vtype & (VType.Composite)) > 0
  );
}

export function isPortal(vtype, node) {
  return (vtype & VType.Portal) > 0;
}

export function isComposite(node) {
  return !isNil(node) && node.vtype === VType.Composite;
}

export function isValidElement(node) {
  return !isNil(node) && node.vtype;
}

export function isHook(arg) {
  return !isNil(arg) && typeof arg.vhook === 'number';
}

// tslint:disable-next-line:no-empty
export function noop() {
  /* noop */
}
