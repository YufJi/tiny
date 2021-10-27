export function isSlot(node) {
  return node.id === '__slot__';
}

export function isShadowRoot(node) {
  if (node) {
    return node._type_ && node._type_.startsWith('SHADOW_ROOT');
  }

  return false;
}

export function getShadowRootId(node) {
  return node._nodeId_;
}

export function getComponentConfig(node) {
  return node._config_;
}
