import { defaults, mapValues, forEachRight } from 'lodash';

import { behaviorBookmarks, COMPONENT_LIFETIMES, PAGE_LIFETIMES } from './common';

export default function mixinBehaviors(instance) {
  const lifeQueue = {
    created: [instance.lifetimes.created],
    attached: [instance.lifetimes.attached],
    ready: [instance.lifetimes.ready],
    moved: [instance.lifetimes.moved],
    detached: [instance.lifetimes.detached],
    error: [instance.lifetimes.error],
  };
  const pageLifeQueue = {
    load: [instance.pageLifetimes.load],
    show: [instance.pageLifetimes.show],
    hide: [instance.pageLifetimes.hide],
    unload: [instance.pageLifetimes.unload],
    resize: [instance.pageLifetimes.resize],
  };

  forEachRight(instance.behaviors, (is) => {
    const bookmark = getBehaviorBookmark(is);
    if (!bookmark) return;
    const parent = bookmark.init;
    defaults(instance.data, parent.data); // 合并 data

    defaults(instance.properties, parent.properties); // 合并 properties

    defaults(instance.methods, parent.methods); // 合并 methods

    parent.definitionFilter(instance, getFilters(parent.behaviors));
    COMPONENT_LIFETIMES.forEach((life) => {
      lifeQueue[life].push(parent.lifetimes[life]);
    });
    PAGE_LIFETIMES.forEach((life) => {
      pageLifeQueue[life].push(parent.pageLifetimes[life]);
    });
  });

  COMPONENT_LIFETIMES.forEach((life) => {
    // 确保此处是一个 function 而不是 array function
    // 因为需要依赖调用处的 this
    instance.lifetimes[life] = function (...args) {
      const _this = this;

      lifeQueue[life].forEach((cb) => {
        return cb.apply(_this, args);
      });
    };
  });
  PAGE_LIFETIMES.forEach((life) => {
    // 确保此处是一个 function 而不是 array function
    // 因为需要依赖调用处的 this
    instance.pageLifetimes[life] = function (...args) {
      const _this = this;

      pageLifeQueue[life].forEach((cb) => {
        return cb.apply(_this, args);
      });
    };
  });

  defaults(instance.data, mapValues(instance.properties, 'value'));
}

function getBehaviorBookmark(is) {
  const bookmark = behaviorBookmarks.get(is);

  if (!bookmark) {
    error(`${is} Behavior not found`);
  }

  return bookmark;
}

function getFilters(behaviors) {
  return behaviors.map((is) => {
    const bookmark = getBehaviorBookmark(is);
    if (bookmark) {
      return bookmark.init.definitionFilter ? bookmark : noop;
    }
    return noop;
  });
}
