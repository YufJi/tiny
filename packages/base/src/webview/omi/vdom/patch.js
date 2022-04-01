import { createNode, setAccessor, removeNode } from '../dom/index';
import { isArray } from '../util';
import { CACHE } from '../constants';
import { isSameNodeType, isNamedNode } from './index';

/** Diff recursion count, used to track the end of the diff cycle. */
let diffLevel = 0;

/** Global flag indicating if the diff is performing hydration */
let hydrating = false;

export function patch(vnode, parent, component) {
  if (!vnode) return;

  // diffLevel having been 0 here indicates initial entry into the diff (not a subdiff)
  if (!diffLevel++) {
    hydrating = true;
  }

  diff(vnode, parent, component, hydrating);

  //  diffLevel为0，代表结束diff
  if (!--diffLevel) {
    hydrating = false;
  }
}

function diff(vnode, parent, component, isHydrating) {
  const originalChildren = parent.childNodes;

  let min = 0;
  const keyed = new Map();
  let keyedLen = 0;
  const children = [];
  let childrenLen = 0;

  const vchildren = isArray(vnode) ? vnode : [vnode];
  const vlen = vchildren ? vchildren.length : 0;

  let child;

  // Build up a map of keyed children and an Array of unkeyed children:
  for (let i = 0; i < originalChildren.length; i+=1) {
    const child = originalChildren[i];
    const props = child[CACHE];
    const key = vlen && props ? props.key : null;

    if (key != null) {
      keyedLen+=1;
      keyed.set(key, child);
    } else if (
      props
      || (child.splitText !== undefined
        ? isHydrating
          ? child.nodeValue.trim()
          : true
        : isHydrating)
    ) {
      children[childrenLen++] = child;
    }
  }

  for (let i = 0; i < vlen; i+=1) {
    const vchild = vchildren[i];
    child = null;

    if (vchild) {
      // attempt to find a node based on key matching
      const { key } = vchild;
      if (key != null) {
        if (keyedLen && keyed.get(key) !== undefined) {
          child = keyed.get(key);
          keyed.set(key, undefined);
          keyedLen--;
        }
      } else if (!child && min < childrenLen) { // attempt to pluck a node of the same type from the existing children
        for (let j = min; j < childrenLen; j+=1) {
          if (children[j] !== undefined && isSameNodeType(children[j], vchild, isHydrating)) {
            child = children[j];
            children[j] = undefined;

            if (j === childrenLen - 1) {
              childrenLen--;
            }
            if (j === min) {
              min+=1;
            }
            break;
          }
        }
      }
    }

    // morph the matched/found/created DOM child to match vchild (deep)
    child = innerDiff(child, vchild, component);

    const f = originalChildren[i];
    if (child && child !== parent && child !== f) {
      if (f == null) {
        parent.appendChild(child);
      } else if (child === f.nextSibling) {
        removeNode(f);
      } else {
        parent.insertBefore(child, f);
      }
    }
  }

  // remove unused keyed children:
  if (keyedLen) {
    keyed.forEach((value) => {
      if (value !== undefined) {
        recollectNodeTree(value, false);
      }
    });
  }

  // remove orphaned unkeyed children:
  while (min <= childrenLen) {
    if ((child = children[childrenLen-=1]) !== undefined) {
      recollectNodeTree(child, false);
    }
  }
}

function innerDiff(dom, vnode, component) {
  if (dom && vnode && dom.props) {
    dom.props.children = vnode.children;
  }

  let out = dom;

  // empty values (null, undefined, booleans) render as empty Text nodes
  if (vnode == null || typeof vnode === 'boolean') {
    vnode = '';
  }

  // Fast case: Strings & Numbers create/update Text nodes.
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    // update if it's already a Text node:
    if (dom && dom.splitText !== undefined && dom.parentNode) {
      /* istanbul ignore if */ /* Browser quirk that can't be covered: https://github.com/developit/preact/commit/fd4f21f5c45dfd75151bd27b4c217d8003aa5eb9 */
      if (dom.nodeValue != vnode) {
        dom.nodeValue = vnode;
      }
    } else {
      // it wasn't a Text node: replace it with one and recycle the old Element
      out = document.createTextNode(vnode);
      if (dom) {
        if (dom.parentNode) {
          dom.parentNode.replaceChild(out, dom);
        }
        recollectNodeTree(dom, true);
      }
    }

    out[CACHE] = true;

    return out;
  }

  // If the VNode represents a Component, perform a component diff:
  let vnodeName = vnode.nodeName;

  // If there's no existing element or it's the wrong type, create a new one:
  vnodeName = String(vnodeName);

  if (!dom || !isNamedNode(dom, vnodeName)) {
    out = createNode(vnodeName);

    if (dom) {
      // move children into the replacement node
      while (dom.firstChild) {
        out.appendChild(dom.firstChild);
      }

      // if the previous Element was mounted into the DOM, replace it inline
      if (dom.parentNode) {
        dom.parentNode.replaceChild(out, dom);
      }

      // recycle the old element (skips non-Element node types)
      recollectNodeTree(dom, true);
    }
  }

  const fc = out.firstChild;
  let props = out[CACHE];
  const vchildren = vnode.children;

  if (!props) {
    props = out[CACHE] = {};

    for (let i = 0; i < out.attributes.length; i+=1) {
      const item = out.attributes[i];

      props[item.name] = item.value;
    }
  }

  // Optimization: fast-path for elements containing a single TextNode:
  if (
    !hydrating
    && vchildren
    && vchildren.length === 1
    && typeof vchildren[0] === 'string'
    && fc != null
    && fc.splitText !== undefined
    && fc.nextSibling == null
  ) {
    if (fc.nodeValue != vchildren[0]) {
      fc.nodeValue = vchildren[0];
    }
  } else if ((vchildren && vchildren.length) || fc != null) { // otherwise, if there are existing or new children, diff them:
    diff(
      vchildren,
      out,
      hydrating,
      component,
    );
  }

  // Apply attributes/props from VNode to the DOM Element:
  diffAttributes(out, vnode.attributes, props, component);

  if (out.props) {
    out.props.children = vnode.children;
  }

  return out;
}

/** Recursively recycle (or just unmount) a node and its descendants.
 *  @param {Node} node            DOM node to start unmount/removal from
 *  @param {Boolean} [unmountOnly=false]  If `true`, only triggers unmount lifecycle, skips removal
 */
export function recollectNodeTree(node, unmountOnly) {
  if (unmountOnly === false || node[CACHE] == null) {
    removeNode(node);
  }

  node = node.lastChild;
  while (node) {
    const next = node.previousSibling;
    recollectNodeTree(node, true);
    node = next;
  }
}

function diffAttributes(dom, attrs, old, component) {
  if (!dom.props) {
    dom.props = attrs || {};
  }

  let name;
  const isWeElement = !!dom.update;
  let oldClone;
  if (dom.shouldUpdate) {
    oldClone = { ...old };
  }

  // remove attributes no longer present on the vnode by setting them to undefined
  for (name in old) {
    if (typeof attrs[name] === 'undefined') {
      setAccessor(dom, name, old[name], undefined, component);
      old[name] = undefined;

      if (isWeElement) {
        delete dom.props[name];
      }
    }
  }

  // add new & update changed attributes
  for (name in attrs) {
    setAccessor(dom, name, old[name], attrs[name], component);

    if (isWeElement && name !== 'children' && (!(name in old) || attrs[name] !== old[name])) {
      dom.props[name] = attrs[name];
      old[name] = attrs[name];
    }
  }

  if (isWeElement && dom.parentNode && dom.shouldUpdate(dom.props, oldClone)) {
    dom.update();
  }
}
