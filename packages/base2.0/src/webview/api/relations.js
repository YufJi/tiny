/*
 * @Author: YufJ
 * @Date: 2021-07-11 14:03:01
 * @LastEditTime: 2021-07-11 14:09:31
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/api/relations.js
 */

const store$4 = new WeakMap();
const getComponentRelation = function (e) {
  return store$4.get(e);
};
const setRelation = function (e, t) {
  store$4.set(e, t);
};

function computeRelations(e) {
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

function diffRelationRegistry(e, t) {
  const n = [];
  const r = function (e, t) {
    const r = getShadowRootId(e.descendant);
    const i = getShadowRootId(e.ancestor);
    n.push({
      nodeId: r,
      originalKey: e.infoOnDescendant.originalKey,
      type: t,
      target: i,
    }),
    n.push({
      nodeId: i,
      originalKey: e.infoOnAncestor.originalKey,
      type: t,
      target: r,
    });
  };
  const i = Array.from(t.keys());
  const o = Array.from(e.keys());
  return (
    new Set(i.concat(o)).forEach((n) => {
      const i = t.get(n);
      const o = e.get(n);
      !i || (o && o.ancestor === i.ancestor)
        ? !o || (i && i.ancestor === o.ancestor)
          ? i && o && (o.ancestor, i.ancestor)
          : r(o, 'linked')
        : r(i, 'unlinked');
    }),
    n
  );
}

export function triggerRelationsEvent(node, t, publish) {
  let r;
  let i = getComponentRelation(node);
  i || (i = new Map());
  t ? ((r = computeRelations(node)), setRelation(node, r)) : (r = new Map());
  publish('COMPONENT_RELATION_CHANGE', { data: diffRelationRegistry(r, i) });
}

function matchRelations(e, t) {
  let n;
  let r;
  const i = e.childRelationMap;
  const o = e.parentRelationMap;
  const a = e.childAncestors;
  const s = e.parentAncestors;
  const l = (n = o[t === 'parent' ? 'child' : 'descendant']) == null
    ? void 0
    : n.find((e) => {
      return a.includes(e.target);
    });
  const c = (r = i[t]) == null
    ? void 0
    : r.find((e) => {
      return s.includes(e.target);
    });
  return l && c ? [l, c] : [null, null];
}

function getRegistryKey(e, t, n) {
  return `${e}:${t}:${n}`;
}
