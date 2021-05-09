import objectKeys from './objectKeys';
import stringToPath from './stringToPath';
import shallowEqual from './shallowEqual';
import { OpSet, OpSplice } from './consts';

function isNumber(value) {
  return typeof value === 'number';
}
function isArray(obj) {
  return Array.isArray(obj);
}
function clone(obj, assumeArray) {
  if (!obj) {
    return assumeArray ? [] : {};
  } else if (isArray(obj)) {
    return obj.slice();
  }
  return { ...obj };
}
function set(dest, src, path, changeCallback, deepLevel) {
  const currentPath = path[0];
  if (deepLevel && dest === src || !dest) {
    dest = clone(src, isNumber(currentPath));
  }
  if (path.length === 1) {
    return changeCallback(dest, currentPath);
  }
  if (src) {
    src = src[currentPath];
  }
  dest[currentPath] = set(dest[currentPath], src, path.slice(1), changeCallback, true);
  return dest;
}

export default function setData(data, changedData) {
  const ret = { ...data };
  objectKeys(changedData).forEach((pathString) => {
    const path = stringToPath(pathString);
    set(ret, ret, path, (clonedObj, finalPath) => {
      clonedObj[finalPath] = changedData[pathString];
      return clonedObj;
    });
  });
  if (shallowEqual(ret, data)) {
    return data;
  }
  return ret;
}

export function spliceData(data, changedData) {
  const ret = { ...data };
  objectKeys(changedData).forEach((pathString) => {
    const path = stringToPath(pathString);
    set(ret, ret, path, (clonedObj, finalPath) => {
      let arr = clonedObj[finalPath];
      if (Array.isArray(arr)) {
        arr = arr.concat();
        arr.splice.apply(arr, changedData[pathString]);
        clonedObj[finalPath] = arr;
      }
      return clonedObj;
    });
  });
  if (shallowEqual(ret, data)) {
    return data;
  }
  return ret;
}
export function getOpStr(op) {
  return op === setData ? OpSet : OpSplice;
}
export function getOpFn(op) {
  return op === OpSet ? setData : spliceData;
}
