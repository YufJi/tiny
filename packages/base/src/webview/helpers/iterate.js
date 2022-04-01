const { isArray } = Array;

export default function iterate(items, fn) {
  let ret = null;

  if (items) {
    ret = [];
    if (isArray(items)) {
      ret = items.map(fn);
    } else if (typeof items === 'number') {
      for (let i = 0; i < items; i+=1) {
        ret.push(fn(i + 1, i));
      }
    } else if (typeof items === 'object') {
      Object.keys(items).forEach((key) => {
        ret.push(fn(items[key], key));
      });
    }
  }
  return ret;
}
