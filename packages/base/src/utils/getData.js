
import objectKeys from './objectKeys';
import stringToPath from './stringToPath';

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * get(object, 'a[0].b.c');
 * // => 3
 *
 */
function getData(object, path) {
  if (object) {
    path = stringToPath(path);
    let index = 0;
    const { length } = path;
    while (object && index < length) {
      object = object[path[index++]];
    }
    return index && index === length ? object : undefined;
  }
  return object;
}

export default function(data, dataConfig) {
  if (!data) {
    return undefined;
  }
  const ret = {};
  objectKeys(dataConfig).forEach((k) => {
    ret[k] = getData(data, dataConfig[k]);
  });
  return ret;
}
