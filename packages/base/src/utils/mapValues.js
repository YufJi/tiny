
export default function mapValues(obj, key) {
  obj = obj || {}
  const ret = {};
  for (const k in obj) {
    if (Object.hasOwnProperty.call(obj, k)) {
      const item = obj[k] || {};
      if (typeof item[key] !== 'undefined') {
        ret[k] = item[key]
      }
    }
  }

  return ret;
}