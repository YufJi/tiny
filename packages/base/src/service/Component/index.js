import { defaults, isPlainObject, get } from 'lodash';
import { g } from 'shared';
import { createBehavior } from '../Behavior';
import { componentBookmarks } from '../Model/common';
import { debug } from '../utils';
import loadComponent from './loadComponent';
import { ComponentModel, ComponentPageModel } from './model';

export function registerComponent(options = {}) {
  const { is } = g.$global.currentPageConfig;
  g.$global.__allConfig__[is] = g.$global.currentPageConfig;

  debug('注册Component：', g.$global.currentPageConfig);

  if (componentBookmarks.has(is)) {
    throw new Error(`at ${is}, Component can only register once`);
  }

  const { init, ancestors } = createBehavior(is, options, 'Component');

  defaults(init, {
    externalClasses: [],
    relations: {},
    options: {},
  });

  componentBookmarks.set(is, {
    init: {
      ...init,
      relations: normalizeRelations(init.relations, is),
    },
    ancestors,
  });
}

function normalizeRelations(relations, currentPath) {
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

export {
  loadComponent,
  ComponentModel,
  ComponentPageModel,
};
