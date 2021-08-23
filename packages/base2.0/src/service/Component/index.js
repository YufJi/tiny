import { defaults } from 'lodash';
import { createBehavior } from '../Behavior';
import { componentBookmarks } from '../Model/common';
import normalizeRelations from './normalizeRelations';
import $global from '../common/global';

const g = self;

export default function registerComponent(options = {}) {
  const { is } = $global.currentPageConfig;
  $global.__allConfig__[is] = $global.currentPageConfig;

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
