import { CACHE } from '../constants';
import { createNode, setAccessor, removeNode } from '../dom/index';
import { isArray } from '../util';
import options from '../options';

import { isSameNodeType, isNamedNode } from './index';

/** Diff recursion count, used to track the end of the diff cycle. */
let diffLevel = 0;

/** Global flag indicating if the diff is performing hydration */
let hydrating = false;

/** Apply differences in a given vnode (and it's deep children) to a real DOM Node.
 *  @param {Element} [dom=null]    A DOM node to mutate into the shape of the `vnode`
 *  @param {VNode} vnode      A VNode (with descendants forming a tree) representing the desired DOM structure
 *  @returns {Element} dom      The created/mutated element
 *  @private
 */
export function diff(dom, vnode, parent, component, updateSelf) {
  // 首次渲染返回undefined
  if (!dom && !vnode) return;

  // diffLevel having been 0 here indicates initial entry into the diff (not a subdiff)
  if (!diffLevel++) {
    // 当前diff 的dom存在 且没有缓存
    hydrating = dom != null && !(CACHE in dom);
  }

  let ret;

  if (isArray(vnode)) {
    if (parent) {
      innerDiffNode(parent, vnode, hydrating, component, updateSelf);
    } else {
      ret = [];
      vnode.forEach((item, index) => {
        const ele = idiff(index === 0 ? dom : null, item, component, updateSelf);
        ret.push(ele);
      });
    }
  } else {
    if (isArray(dom)) {
      dom.forEach((one, index) => {
        if (index === 0) {
          ret = idiff(one, vnode, component, updateSelf);
        } else {
          recollectNodeTree(one, false);
        }
      });
    } else {
      ret = idiff(dom, vnode, component, updateSelf);
    }
    // append the element if its a new parent
    if (parent && ret.parentNode !== parent) parent.appendChild(ret);
  }

  //  diffLevel为0，代表结束diff
  if (!--diffLevel) {
    hydrating = false;
  }

  return ret;
}

/** Internals of `diff()`, separated to allow bypassing diffLevel / mount flushing. */
function idiff(dom, vnode, component, updateSelf) {
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

    for (let a = out.attributes, i = a.length; i--;) {
      props[a[i].name] = a[i].value;
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
  }
  // otherwise, if there are existing or new children, diff them:
  else if ((vchildren && vchildren.length) || fc != null) {
    if (!(out.constructor.is === 'WeElement' && out.constructor.noSlot)) {
      innerDiffNode(
        out,
        vchildren,
        hydrating || props.dangerouslySetInnerHTML != null,
        component,
        updateSelf,
      );
    }
  }

  // Apply attributes/props from VNode to the DOM Element:
  diffAttributes(out, vnode.attributes, props, component, updateSelf);
  if (out.props) {
    out.props.children = vnode.children;
  }

  return out;
}

/** Apply child and attribute changes between a VNode and a DOM Node to the DOM.
 *  @param {Element} dom      Element whose children should be compared & mutated
 *  @param {Array} vchildren    Array of VNodes to compare to `dom.childNodes`
 *  @param {Boolean} isHydrating  If `true`, consumes externally created elements similar to hydration
 */
function innerDiffNode(dom, vchildren, isHydrating, component, updateSelf) {
  const originalChildren = dom.childNodes;
  const children = [];
  const keyed = new Map();
  let keyedLen = 0;
  let min = 0;
  const len = originalChildren.length;
  let childrenLen = 0;
  const vlen = vchildren ? vchildren.length : 0;

  let child;

  // Build up a map of keyed children and an Array of unkeyed children:
  if (len !== 0) {
    for (let i = 0; i < len; i+=1) {
      const child = originalChildren[i];
      const props = child[CACHE];
      const key = vlen && props ? props.key : null;

      if (key != null) {
        keyedLen++;
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
  }

  if (vlen !== 0) {
    for (let i = 0; i < vlen; i++) {
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
                min++;
              }
              break;
            }
          }
        }
      }

      // morph the matched/found/created DOM child to match vchild (deep)
      child = idiff(child, vchild, component, updateSelf);

      const f = originalChildren[i];
      if (child && child !== dom && child !== f) {
        if (f == null) {
          dom.appendChild(child);
        } else if (child === f.nextSibling) {
          removeNode(f);
        } else {
          dom.insertBefore(child, f);
        }
      }
    }
  }

  // remove unused keyed children:
  if (keyedLen) {
    keyed.forEach((value) => {
      if (value !== undefined) recollectNodeTree(value, false);
    });
  }

  // remove orphaned unkeyed children:
  while (min <= childrenLen) {
    if ((child = children[childrenLen-=1]) !== undefined) {
      recollectNodeTree(child, false);
    }
  }
}

/** Recursively recycle (or just unmount) a node and its descendants.
 *  @param {Node} node            DOM node to start unmount/removal from
 *  @param {Boolean} [unmountOnly=false]  If `true`, only triggers unmount lifecycle, skips removal
 */
export function recollectNodeTree(node, unmountOnly) {
  if (unmountOnly === false || node[CACHE] == null) {
    removeNode(node);
  }

  removeChildren(node);
}

/** Recollect/unmount all children.
 *  - we use .lastChild here because it causes less reflow than .firstChild
 *  - it's also cheaper than accessing the .childNodes Live NodeList
 */
export function removeChildren(node) {
  node = node.lastChild;
  while (node) {
    const next = node.previousSibling;
    recollectNodeTree(node, true);
    node = next;
  }
}

/** Apply differences in attributes from a VNode to the given DOM Element.
 *  @param {Element} dom    Element with attributes to diff `attrs` against
 *  @param {Object} attrs    The desired end-state key-value attribute pairs
 *  @param {Object} old      Current/previous attributes (from previous VNode or element's prop cache)
 */
function diffAttributes(dom, attrs, old, component, updateSelf) {
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

  if (isWeElement && !updateSelf && dom.parentNode) {
    if (dom.shouldUpdate(dom.props, oldClone)) {
      dom.update();
    }
  }
}
