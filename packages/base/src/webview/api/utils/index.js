export function isSlot(node) {
  return node.id === '__slot__';
}

export function isShadowRoot(node) {
  if (node) {
    return node._type_ && node._type_ === 'component';
  }

  return false;
}

export function getShadowRootId(node) {
  return node.elementId;
}

export function getComponentConfig(node) {
  return node._config_;
}
