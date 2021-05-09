export { default as nextTick } from './next-tick';
export { default as shallowEqual } from './shallow-equal';
export { SimpleMap, MapClass } from './simple-map';
export * from './is';
export * from './env';

export function getPrototype(obj) {
  /* istanbul ignore next */
  if (Object.getPrototypeOf) {
    return Object.getPrototypeOf(obj);
  } else if (obj.__proto__) {
    return obj.__proto__;
  }
  /* istanbul ignore next */
  return obj.constructor.prototype;
}

export function isAttrAnEvent(attr: string): boolean {
  if (attr[0] === 'o' && attr[1] === 'n') {
    return true;
  }

  if (/^(bind|catch|capture-bind|capture-catch)([A-Za-z_]+)/.test(attr)) {
    return true;
  }

  return false;
}

const extend = ((): (<S, F>(source: S, from: F) => S | F & S) => {
  return <S, F>(source: S, from: F): S | F & S => {
    if (!from) {
      return source;
    }
    Object.assign(source, from);
    return source;
  };
})();

export { extend };

export function clone<T>(obj: T): T | {} {
  return extend({}, obj);
}
