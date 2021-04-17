
import objectKeys from '@/utils/objectKeys';

function safeAssign(to, from, prop) {
  if (from) {
    objectKeys(from).forEach((key) => {
      if (key in to) {
        throw new Error(`Tried to merge two objects with the same key: \`${key}\`. This conflict is due to \`${prop}\` of a component mixin.`);
      }
      to[key] = from[key];
    });
  }
}
export default function getComponentProp(componentConfig, prop, caches = false, args = []) {
  const _this = this;

  if (caches && caches[prop]) {
    return caches[prop];
  }
  const _componentConfig$mixi = componentConfig.mixins;
  const mixins = _componentConfig$mixi === undefined ? [] : _componentConfig$mixi;

  const ret = {};
  mixins.forEach((m) => {
    let v = m[prop];
    if (typeof v === 'function') {
      v = v.apply(_this, args);
    }
    safeAssign(ret, v, prop);
  });
  {
    let v = componentConfig[prop];
    if (typeof v === 'function') {
      v = v.apply(this, args);
    }
    safeAssign(ret, v, prop);
  }
  if (caches) {
    caches[prop] = ret;
  }
  return ret;
}
