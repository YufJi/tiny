import { defaults, mapValues, forEachRight, noop } from 'lodash';
import { behaviorBookmarks } from '../context';
import { error } from '../utils';

const PAGE_LIFETIMES = ['show', 'hide', 'resize'];
const COMPONENT_LIFETIMES = ['created', 'attached', 'ready', 'detached', 'error'];

export default function mixinBehaviors(instance) {
  const lifeQueue = {
    created: [instance.lifetimes.created],
    attached: [instance.lifetimes.attached],
    ready: [instance.lifetimes.ready],
    detached: [instance.lifetimes.detached],
    error: [instance.lifetimes.error],
  };
  const pageLifeQueue = {
    show: [instance.pageLifetimes.show],
    hide: [instance.pageLifetimes.hide],
    resize: [instance.pageLifetimes.resize],
  };

  forEachRight(instance.behaviors, (is) => {
    const bookmark = getBehaviorBookmark(is);
    if (!bookmark) return;
    const parent = bookmark.init;
    defaults(instance.data, parent.data); // 合并 data

    defaults(instance.properties, parent.properties); // 合并 properties

    // properties中默认值写入data
    defaults(instance.data, mapValues(instance.properties, 'value'));

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
      lifeQueue[life].forEach((cb) => {
        return cb.apply(this, args);
      });
    };
  });
  PAGE_LIFETIMES.forEach((life) => {
    // 确保此处是一个 function 而不是 array function
    // 因为需要依赖调用处的 this
    instance.pageLifetimes[life] = function (...args) {
      pageLifeQueue[life].forEach((cb) => {
        return cb.apply(this, args);
      });
    };
  });
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
