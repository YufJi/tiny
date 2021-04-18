
function isComponent(node, usingComponents) {
  return node.type === 'tag' && !!usingComponents[node.name];
}

function isInclude(node) {
  return node.type === 'tag' && node.name === 'include';
}

function ancestorIsComponent(node, usingComponents) {
  if (!node) {
    return false;
  }
  if (isComponent(node, usingComponents)) {
    return true;
  }
  return ancestorIsComponent(node.parent, usingComponents);
}

function isBlock(node) {
  return node.type === 'tag' && node.name === 'block';
}

function hasProp(node) {
  return function (prop) {
    const { attribs } = node;

    return !!(attribs && attribs[prop] !== undefined);
  };
}

function prune(node) {
  if (node.parent) {
    let _node$parent$children;

    (_node$parent$children = node.parent.children).splice.apply(_node$parent$children, [node.parent.children.indexOf(node), 1].concat(node.children || []));
  }
}

function hasReservedDescendant(node, usingComponents, options) {
  const _node$children = node.children;
  const children = _node$children === undefined ? [] : _node$children;

  if (isReservedTag(node, options)) {
    return true;
  }
  if (isComponent(node, usingComponents)) {
    return true;
  }
  return children.some((child) => {
    return hasReservedDescendant(child, usingComponents, options);
  });
}

function hasCousinReservedDescendant(node, usingComponents, options) {
  if (!node || !node.next) {
    return false;
  }
  let cousin = node.next;
  while (cousin) {
    if (cousin.type === 'text' && !cousin.data.trim() || cousin.type === 'comment') {
      cousin = cousin.next;
    } else {
      const nodeHasProp = hasProp(cousin);
      const namespace = options.templateNamespace;
      if (nodeHasProp(`${namespace}:elif`) || nodeHasProp(`${namespace}:else`)) {
        if (hasReservedDescendant(cousin, usingComponents, options)) {
          return true;
        }
        cousin = cousin.next;
      } else {
        return false;
      }
    }
  }
  return false;
}

function hasSibling(node, options) {
  const { templateNamespace } = options;

  const filterFn = function filterFn(n) {
    const nodeHasProp = hasProp(n);
    return n !== node && (n.type === 'tag' && !nodeHasProp('slot') && !isBlock(n) && !nodeHasProp(`${templateNamespace}:if`) && !nodeHasProp(`${templateNamespace}:elif`) && !nodeHasProp(`${templateNamespace}:else`) && !nodeHasProp(`${templateNamespace}:for`) || n.type === 'text' && !!n.data.trim());
  };
  return node.parent.children.filter(filterFn).length > 0;
}

function hasChild(node) {
  const _node$children2 = node.children;
  const children = _node$children2 === undefined ? [] : _node$children2;

  return children.length > 0;
}

const reservedTags = {
  'import-sjs': 1,
  'import-module': 1,
  import: 1,
  template: 1,
  slot: 1,
};

function isReservedTag(node, options) {
  const nodeHasProp = hasProp(node);
  const namespace = options.templateNamespace;
  if (nodeHasProp('slot') || nodeHasProp('slot-scope') || nodeHasProp('key') || nodeHasProp(`${namespace}:key`) || reservedTags[node.name]) {
    return true;
  }
}

function includeSpecialProps(node, usingComponents, options) {
  const nodeHasProp = hasProp(node);
  const namespace = options.templateNamespace;

  if (isReservedTag(node, options)) {
    return true;
  }

  if (nodeHasProp(`${namespace}:if`) || nodeHasProp(`${namespace}:elif`)) {
    if (hasReservedDescendant(node, usingComponents, options) || hasCousinReservedDescendant(node, usingComponents, options)) {
      return true;
    }
    if (ancestorIsComponent(node, usingComponents)) {
      return true;
    }
  }

  if (nodeHasProp(`${namespace}:for`) || nodeHasProp(`${namespace}:else`)) {
    if (hasReservedDescendant(node, usingComponents, options)) {
      return true;
    }
    if (ancestorIsComponent(node, usingComponents)) {
      return true;
    }
  }

  // 这个 if 可以删掉
  if (isBlock(node.parent)) {
    if (ancestorIsComponent(node, usingComponents) && !hasSibling(node, options) && !hasChild(node)) {
      return true;
    }
  }

  // preserve one child for custom component
  if (isComponent(node.parent, usingComponents) && !hasSibling(node, options) && !hasChild(node)) {
    return true;
  }

  return false;
}

function filterNode(node, usingComponents, options) {
  if (isInclude(node) && ancestorIsComponent(node, usingComponents)) {
    throw new Error('include cannot be used inside custom component!');
  }

  if (options.pruneComChildren === false && isComponent(node, usingComponents)) {
    return;
  }

  const children = [].concat(node.children || []);
  (children || []).concat().forEach((child) => {
    filterNode(child, usingComponents, options);
  });
  const isTag = node.type === 'tag';
  const isText = node.type === 'text';
  const isCom = isComponent(node, usingComponents);
  const shouldReserve = (isTag || isText) && (isCom || includeSpecialProps(node, usingComponents, options));

  if (shouldReserve) {
    return;
  }
  prune(node);
}

/**
 * <view>
 *   <view />
 * </view>
 * <view>
 *   <my />
 * </view>
 * <view a:if="">
 *   <my />
 * </view>
 *
 * ->
 * <my />
 * <view a:if="">
 *   <my />
 * </view>
 */
function trimForComponent(children = [], usingComponents = {}, options) {
  const uComponents = { ...usingComponents, component: true };

  if (!options.isComponent && !Object.keys(uComponents).length) {
    return [];
  }

  const node = {
    children,
  };

  node.children.forEach((child) => {
    child.parent = node;
  });

  filterNode(node, uComponents, options);

  return node.children;
}

module.exports = trimForComponent;
