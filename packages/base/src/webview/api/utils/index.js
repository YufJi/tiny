export function isShadowRoot(node) {
  if (node) {
    return node._type_ && node._type_.startsWith('SHADOW_ROOT');
  }

  return false;
}

export function getShadowRootId(node) {
  return node._nodeId_;
}
