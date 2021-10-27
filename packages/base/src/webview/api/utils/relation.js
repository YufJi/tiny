import { isSlot, isShadowRoot, getShadowRootId, getComponentConfig } from './index';

const store = new WeakMap();
export const getRelation = function (element) {
  return store.get(element);
};
export const setRelation = function (element, relations) {
  store.set(element, relations);
};

export function getRelationNodes(component, relation) {
  const getRelations = function (element, type, handler) {
    const links = findRelationLink(element, type, handler);

    if (links.length > 0) {
      return links.map((relation) => relation.ancestor._nodeId_);
    } else {
      return [];
    }
  };

  const isSameDescendant = function (e) {
    return e.infoOnDescendant.originalKey === relation;
  };

  const isSameAncestor = function (e) {
    return e.infoOnAncestor.originalKey === relation;
  };

  let result = [];

  if ((result = getRelations(component, 'parent', isSameDescendant)).length > 0 || (result = getRelations(component, 'ancestor', isSameDescendant)).length > 0) {
    return result;
  } else {
    visitor(component, (element, nodeId) => {
      if (nodeId === 0) return true;

      if (!isShadowRoot(element)) return true;

      if (nodeId === 1 && getRelations(element, 'parent', isSameAncestor).length > 0) {
        result.push(element._nodeId_);

        return false;
      }

      getRelations(element, 'parent', isSameAncestor).length > 0 && result.push(element._nodeId_);

      return true;
    });

    return result.length > 0 ? result : [];
  }
}

function visitor(component, cb, nodeId = 0) {
  if (!isSlot(component)) {
    if (cb(component, nodeId)) {
      getChildren(component).forEach((child) => {
        visitor(child, cb, nodeId + 1);
      });
    }
  }
}

function getChildren(component) {
  if (isShadowRoot(component)) {
    let result = [];

    (function loop(c) {
      const children = Array.from(c.children);

      isSlot(c)
        ? (result = result.concat(children))
        : children.forEach((child) => {
          loop(child);
        });
    })(component);

    return result;
  }

  return Array.from(component.children);
}

function findRelationLink(component, type, handler = () => true) {
  const componentRelation = getRelation(component);
  if (!componentRelation) return [];

  const keys = Array.from(componentRelation.keys()).filter((key) => {
    return key.includes(type);
  });
  const links = [];

  keys.forEach((key) => {
    const relation = componentRelation.get(key);

    if (relation && relation.descendant === component && handler(relation)) {
      links.push(relation);
    }
  });

  return links;
}

export function computeRelations(e) {
  const t = new Map();
  const n = getComponentConfig(e);
  const r = n.relationMap;
  const i = n.ancestors;

  if (!r) return t;

  for (
    let o = Object.keys(r),
      a = function (n, r, i) {
        const o = matchRelations(i, r);
        const a = o[0];
        const s = o[1];
        a
          && s
          && t.set(getRegistryKey(s.originalKey, r, getShadowRootId(n)), {
            ancestor: n,
            descendant: e,
            infoOnAncestor: a,
            infoOnDescendant: s,
          });
      },
      s = e,
      l = 0;
    (s = getParent(s));

  ) {
    if (((l += 1), isShadowRoot(s))) {
      const c = s;
      const u = getComponentConfig(c);
      const d = u.relationMap;
      const p = u.ancestors;
      const h = Object.keys(d);
      const f = {
        childRelationMap: r,
        parentRelationMap: d,
        childAncestors: i,
        parentAncestors: p,
      };
      if (
        (o.includes('ancestor')
          && h.includes('descendant')
          && a(c, 'ancestor', f),
        l === 1
          && o.includes('parent')
          && h.includes('child')
          && a(c, 'parent', f),
        l > 1 && !o.includes('ancestor'))
      ) break;
    }
  }

  return t;
}
