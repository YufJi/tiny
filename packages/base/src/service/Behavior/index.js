import { defaultsDeep, noop } from 'lodash';

import mixinBehaviors from './mixinBehaviors';
import normalizeProperties from './normalizeProperties';
import { behaviorBookmarks } from './common';
import { guid } from '../utils';

export function createBehavior(is, options) {
  let { data = {} } = options;
  const { created = noop, attached = noop, ready = noop, moved = noop, detached = noop } = options;

  try {
    data = JSON.parse(JSON.stringify(data));
  } catch (e) {
    data = {};
  }

  options = { ...options };

  const _options = defaultsDeep(options, {
    properties: {},
    methods: {},
    behaviors: [],
    definitionFilter: noop,
    lifetimes: {
      created,
      attached,
      ready,
      moved,
      detached,
    },
    pageLifetimes: {
      load: noop,
      show: noop,
      hide: noop,
      unload: noop,
      resize: noop,
    },
  });

  const ancestors = new Set();

  // 初始化给parent的值
  const init = {
    ..._options,
    is,
    data,
    properties: normalizeProperties(_options.properties),
    hasBehavior(is) {
      return ancestors.has(is);
    },
  };

  ancestors.add(is);

  init.behaviors.forEach((i) => {
    ancestors.add(i);

    behaviorBookmarks.get(i) && behaviorBookmarks.get(i).ancestors.forEach((j) => {
      ancestors.add(j);
    });
  });

  mixinBehaviors(init);

  return {
    init,
    ancestors,
  };
}

export default function registerBehavior(options = {}) {
  if (!isObject(options)) {
    throw new Error('Behavior.options is not a object');
  }

  const is = guid();
  const bookmark = createBehavior(is, options);
  behaviorBookmarks.set(is, bookmark);
  return is;
}
