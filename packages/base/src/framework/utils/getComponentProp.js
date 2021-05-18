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
  if (caches && caches[prop]) {
    return caches[prop];
  }

  const ret = {};

  let v = componentConfig[prop];
  if (typeof v === 'function') {
    v = v.apply(this, args);
  }
  safeAssign(ret, v, prop);

  if (caches) {
    caches[prop] = ret;
  }
  return ret;
}
