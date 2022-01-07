import { isNil, isString } from 'lodash';
import DOMRenderer from './renderer';

export function querySelector(selector, node, renderer = DOMRenderer) {
  if (isNil(node)) {
    return null;
  }

  const match = isString(selector) ? parseSelector(selector) : selector;

  if (isNil(match)) {
    return null;
  }

  const retValue = [];
  queryOnRoot(retValue, match, node, node, renderer, true);

  return retValue[0] || null;
}

export function querySelectorAll(selector, node, renderer = DOMRenderer) {
  if (isNil(node)) {
    return [];
  }

  const match = isString(selector) ? parseSelector(selector) : selector;

  if (isNil(match)) {
    return [];
  }

  const retValue = [];
  queryOnRoot(retValue, match, node, node, renderer, false);
  return retValue;
}

function parseSelector(selector) {
  const blocks = selector.split(',');
  const groups = [];

  for (let i = 0; i < blocks.length; i+=1) {
    const segments = blocks[i].split(/( |\t|>+)/g);
    const tokens = [];
    let j = 0;
    let combinator = '';

    for (; j < segments.length; j+=1) {
      const segment = segments[j];

      if (!segment || segment === ' ' || segment === '\t') {
        continue;
      }

      if (segment[0] === '>') {
        if (combinator !== '') {
          break;
        }

        combinator = segment;

        continue;
      }

      const token = parseSegement(segment, combinator);
      combinator = '';

      if (!token) {
        break;
      }

      tokens.push(token);
    }

    if (j !== segments.length) {
      continue;
    }

    if (tokens.length) {
      groups.push(tokens);
    }
  }

  if (groups.length === 0) {
    return null;
  }

  return {
    groups,
  };
}

function parseSegement(segment, combinator = '') {
  const matches = segment.match(/^(#[_a-zA-Z][-_a-zA-Z0-9:]*|)((?:\.-?[_a-zA-Z][-_a-zA-Z0-9]*)+|)$/);

  if (!matches) {
    return null;
  }

  const id = matches[1].slice(1);
  const classes = matches[2].split('.');
  classes.shift();

  if (!id && !classes.length) {
    return null;
  }

  return {
    id,
    classes,
    combinator,
  };
}

function queryOnRoot(retValue, match, root, node, renderer, findOne) {
  const { getChildren, isQueryable } = renderer;

  if (testQuery(match, root, node, renderer)) {
    retValue.push(node);

    if (findOne) {
      return true;
    }
  }

  const children = getChildren(node);

  for (let i = 0; i < children.length; i+=1) {
    const child = children[i];

    if (isQueryable(child)) {
      if (queryOnRoot(retValue, match, root, child, renderer, findOne)) {
        if (findOne) {
          return true;
        }
      }
    }
  }

  return false;
}

function testQuery({ groups }, root, node, renderer) {
  for (const tokens of groups) {
    if (query(root, node, tokens, tokens.length - 1, '>', renderer)) {
      return true;
    }
  }

  return false;
}

function query(root, node, tokens, offset, combinator, renderer) {
  if (node === root) {
    return false;
  }

  const { getParentNode, getScopeParentNode, getProperty, isSameScope } = renderer;
  let isMatch = true;
  const { id, classes, combinator: nc } = tokens[offset];

  if (id && id !== getProperty(node, 'id')) {
    isMatch = false;
  }

  let classNames = getProperty(node, 'className');
  if (isNil(classNames)) {
    classNames = '';
  }

  const classList = classNames.split(' ');
  for (let i = 0; isMatch && i < classes.length; i+=1) {
    if (!classList.includes(classes[i])) {
      isMatch = false;
    }
  }

  if (!isMatch && combinator === '>') {
    return false;
  }

  let nextNode = node;
  if (isMatch && offset === 0) {
    if (root === null) return true;

    if (combinator !== '>>>') {
      if (!isSameScope(root, nextNode)) return false;

      nextNode = getScopeParentNode(root, nextNode);
      for (; nextNode; nextNode = getScopeParentNode(root, nextNode)) {
        if (nextNode === root) {
          return true;
        }
      }
    } else {
      nextNode = getParentNode(nextNode);
      for (; nextNode; nextNode = getParentNode(nextNode)) {
        if (nextNode === root) {
          return true;
        }
      }
    }
    return false;
  }
  const _ = isMatch ? nc : combinator;
  if (_ !== '>>>') {
    if (!isSameScope(root, nextNode)) return false;

    nextNode = getScopeParentNode(root, nextNode);
  } else {
    nextNode = getParentNode(nextNode);
  }

  if (nextNode !== root) {
    return isMatch ? query(root, nextNode, tokens, offset - 1, _, renderer) : query(root, nextNode, tokens, offset, combinator, renderer);
  }

  return false;
}
