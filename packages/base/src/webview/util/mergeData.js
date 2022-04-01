import { clone, forOwn, isObject, toPath } from 'lodash';

export function mergeData(a, b) {
  forOwn(b, (value, key) => {
    setValue(a, key, value);
  });

  return clone(a);
}

function setValue(obj, key, value) {
  const paths = castPath(key, obj);
  const len = paths.length;
  const lastIndex = len - 1;
  let index = -1;
  let temp = obj;

  while (temp && ++index < len) {
    const key = paths[index];
    let val = value;

    if (index !== lastIndex) {
      const tempVal = temp[key];
      val = isObject(tempVal) ? clone(tempVal) : isIndex(paths[index + 1]) ? [] : {};
    }

    temp[key] = val;
    temp = temp[key];
  }

  return obj;
}

function castPath(key, obj) {
  return /^\w*$/.test(key) || key in obj ? [key] : toPath(key);
}

function isIndex(value) {
  if (!/^(?:0|[1-9]\d*)$/.test(value)) return false;

  const num = Number(value);
  return typeof num === 'number' && Number.isSafeInteger(num) && num > -1;
}
