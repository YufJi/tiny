import { isPlainObject, get } from 'lodash';

export default function normalizeRelations(relations, currentPath) {
  if (!isPlainObject(relations)) return {};
  const standardRelations = {};

  for (let i = 0; i < Object.entries(relations).length; i++) {
    const [key, relation] = Object.entries(relations)[i];
    let target;

    if (relation.target) {
      target = String(relation.target);
    } else if (key.startsWith('/')) {
      target = key;
    } else {
      // eg. currentPath='a/b/c' + key='../d/e/f' => 'a/d/e/f'
      const pathArr = currentPath.split('/');
      pathArr.pop();

      for (const path of key2.split('/')) {
        if (path && path !== '.') {
          if (path === '..') {
            pathArr.pop();
          } else {
            pathArr.push(path);
          }
        }
      }

      target = pathArr.join('/');
    }

    if (target.startsWith('/')) {
      target = target.slice(1);
    }

    standardRelations[key] = {
      target,
      type: relation.type,
      originalKey: key,
      linked: get(relation, 'linked', noop),
      linkChanged: get(relation, 'linkChanged', noop),
      unlinked: get(relation, 'unlinked', noop),
    };
  }

  return standardRelations;
}
