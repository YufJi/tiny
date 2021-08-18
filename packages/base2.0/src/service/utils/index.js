export function truthy(value) {
  return Boolean(value);
}

/** guid */
export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = 16 * Math.random() | 0;
    return (char === 'x' ? rand : 3 & rand | 8).toString(16);
  });
}

export function compareVersion(a, b, op) {
  let result = 0;

  if (a !== b) {
    const av = a.split('.');
    const bv = b.split('.');
    const len = Math.max(av.length, bv.length);

    for (let i = 0; i < len; i++) {
      const x = parseInt(av[i], 10) || 0;
      const y = parseInt(bv[i], 10) || 0;

      if (x > y) {
        result = 1;
        break;
      } else if (x < y) {
        result = -1;
        break;
      }
    }
  }

  if (!op) {
    return result;
  }

  // eslint-disable-next-line default-case
  switch (op) {
    case '>':
      return result > 0;

    case '<':
      return result < 0;

    case '=':
      return result === 0;

    case '>=':
      return result >= 0;

    case '<=':
      return result <= 0;
  }
}

/**
 * 对齐微信而实现的
 * @param url
 */
export function encodeEachValue(url) {
  const [prefix, search] = url.split('?');

  if (search) {
    const newSearch = search.split('&').map((kv) => {
      const [k, v = ''] = kv.split('=');

      if (!k) return '';
      return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
    }).filter(truthy).join('&');
    return `${prefix}?${newSearch}`;
  }

  return prefix;
}
