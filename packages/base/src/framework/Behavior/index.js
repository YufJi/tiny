import defaults from 'lodash.defaults';
import defaultsDeep from 'lodash.defaultsdeep';
import forEachRight from '@/utils/forEachRight';
import PolyfillMap from '@/utils/Map';
import mapValues from '@/utils/mapValues';
import { getType, isObject, noop } from '@/utils/types';

export let BehaviorId = 1;

const behaviorBookmarks = new PolyfillMap();

const COMPONENT_LIFETIMES = ['created', 'attached', 'ready', 'moved', 'detached', 'error'];
const PAGE_LIFETIMES = ['show', 'hide', 'resize'];

/**
 * types helper
 * @param target
 */
function isPropertyType(target) {
  const constructors = [String, Boolean, Number, Array, Object, null];
  return constructors.includes(target);
}

/**
 * types helper
 * @param target
 */
function isStandardProperty(target) {
  if (!isObject(target)) return false;
  return isPropertyType(target.type);
}

/**
 * 根据 Property type 获取默认值
 * @param type
 */

function getConstructorDefaultValue(type) {
  switch (type) {
    case String:
      return '';

    case Number:
      return 0;

    case Boolean:
      return false;

    case Array:
      return [];

    case Object:
      // TODO(yingchen: 确认原来的设计是否合理？
      return null;

    case null:
      return null;

    default:
      warn('incorrect property type');
  }
}

/**
 * 规范化 properties
 * @param behavior
 */

function normalizeProperties(properties) {
  if (!isObject(properties)) {
    throw new Error(`expect properties to be object, but it is ${getType(properties)}`);
  }

  const result = {};

  const entries = Object.entries(properties);

  for (let i = 0; i < entries.length; i++) {
    const [key, prop] = entries[i];

    if (isPropertyType(prop)) {
      result[key] = {
        type: prop,
        value: getConstructorDefaultValue(prop),
        observer: noop,
      };
    } else if (isStandardProperty(prop)) {
      result[key] = {
        type: prop.type,
        value: prop.value || getConstructorDefaultValue(prop.type),
        observer: prop.observer|| noop,
      };
    }
  }

  return result;
}

function getBehaviorBookmark(is) {
  const bookmark = behaviorBookmarks.get(is);

  if (!bookmark) {
    error(`${is} Behavior not found`);
  }

  return bookmark;
}

/**
 * 根据 behaviors 获取 它的 definitionFilter
 * @param behaviors
 */

function getFilters(behaviors) {
  return behaviors.map((is) => {
    const bookmark = getBehaviorBookmark(is);
    if (bookmark) {
      return bookmark.init.definitionFilter ? bookmark : noop;
    }
    return noop;
  });
}

function mixinBehaviors(instance) {
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
    const child = bookmark.init;
    defaults(instance.data, child.data); // 合并 data

    defaults(instance.properties, child.properties); // 合并 properties

    defaults(instance.methods, child.methods); // 合并 methods

    child.definitionFilter(instance, getFilters(child.behaviors));
    COMPONENT_LIFETIMES.forEach((life) => {
      lifeQueue[life].push(child.lifetimes[life]);
    });
    PAGE_LIFETIMES.forEach((life) => {
      pageLifeQueue[life].push(child.pageLifetimes[life]);
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

/**
 * 创建 Behavior
 * @param is 唯一标识(Component 则为 文件路径)
 * @param options 用户输入参数
 * @param name 实例名字, 为了细化报错信息
 */
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

/**
 * 创建 Behavior, 即全局 Behavior 构造函数
 * @param options
 * @returns Behavior 唯一标识
 */
function registerBehavior(options = {}) {
  if (!isObject(options)) {
    throw new Error('Behavior.options is not a object');
  }
  const is = `behavior-${BehaviorId++}`;
  const bookmark = createBehavior(is, options);
  behaviorBookmarks.set(is, bookmark);
  return is;
}

export default registerBehavior;
