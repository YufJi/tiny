const DOMRenderer = Object.freeze({
  __proto__: null,
  getParentNode,
  isSameScope,
  getScopeParentNode,
  getProperty,
  getChildren,
  isQueryable,
});

function getParentNode(node) {
  return node.parentElement;
}

function isSameScope(root, node) {
  let parentNode = node.parentElement;
  let scope = 0;

  while (parentNode && parentNode !== root) {
    if (isSlotDOM(parentNode)) {
      scope += 1;
    }

    parentNode = parentNode.parentElement;
  }

  return scope === 0;
}

function getScopeParentNode(root, node) {
  let scope = 0;
  let parentNode = node.parentElement;

  if (!isSlotDOM(parentNode)) return parentNode;

  for (; parentNode && parentNode !== root; ) {
    if (isSlotDOM(parentNode)) {
      scope += 1;
    }

    parentNode = parentNode.parentElement;

    if (scope === 0) {
      return parentNode;
    }

    parentNode = parentNode && parentNode.parentElement;
  }

  return root;
}

function getProperty(node, property) {
  return node[property];
}

function getChildren(node) {
  return node.children;
}

function isQueryable(node) {
  return node instanceof Element;
}

function isSlotDOM(node) {
  return !!node && node.id === '__slot__';
}

export default DOMRenderer;
