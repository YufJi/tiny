import objectKeys from './objectKeys';

export default function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = objectKeys(objA);
  const keysB = objectKeys(objB);
  const len = keysA.length;
  if (len !== keysB.length) {
    return false;
  }
  for (let i = 0; i < len; i++) {
    const key = keysA[i];
    if (!objB.hasOwnProperty(key)) {
      return false;
    }
    const valueA = objA[key];
    const valueB = objB[key];
    if (valueA !== valueB) {
      return false;
    }
  }
  return true;
}
