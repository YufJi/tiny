import querystring from 'querystring';
import { isPlainObject } from 'lodash';
import { wrapInnerFunction, wrapUserFunction } from './wrapfn';

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

export function surroundByTryCatch(func, msg) {
  return wrapInnerFunction(msg, func);
}

export function surroundByTryCatchFactory(func, msg) {
  return wrapUserFunction(msg, func);
}

export const anyTypeToString = surroundByTryCatch((any) => {
  const protoType = Object.prototype.toString.call(any).split(' ')[1].split(']')[0];

  if (protoType === 'Array' || protoType === 'Object') {
    any = JSON.stringify(any);
  } else if (protoType === 'String' || protoType === 'Number' || protoType === 'Boolean') {
    any = any.toString();
  } else if (protoType === 'Date') {
    any = any.getTime().toString();
  } else if (protoType === 'Undefined') {
    any = 'undefined';
  } else if (protoType === 'Null') {
    any = 'null';
  } else {
    any = '';
  }

  return {
    data: any,
    dataType: protoType,
  };
}, 'anyTypeToString');

export const stringToAnyType = surroundByTryCatch((str, protoType) => {
  switch (protoType) {
    case 'String':
    case 'Array':
    case 'Object':
      return JSON.parse(str);

    case 'Number':
      return parseFloat(str);

    case 'Boolean':
      return str === 'true';

    case 'Date':
      return new Date(parseInt(str, 10));

    case 'Undefined':
      return undefined;

    case 'Null':
      return null;

    default:
      return '';
  }
}, 'stringToAnyType');

export function convertObjectValueToString(obj) {
  const result = {};

  for (let i = 0; i < Object.entries(obj).length; i++) {
    const [k, v] = Object.entries(obj)[i];

    if (typeof v === 'string' || typeof v === 'number') {
      result[k] = String(v);
    } else {
      result[k] = Object.prototype.toString.call(v);
    }
  }

  return result;
}

export function validateUrl(url, protocol = 'http') {
  if (protocol === 'http') {
    return /^(http|https):\/\/.*/i.test(url);
  } else if (protocol === 'websocket') {
    return /^(ws|wss):\/\/.*/i.test(url);
  }
}

export function addQueryStringToUrl(url, data) {
  if (typeof url === 'string' && isPlainObject(data)) {
    const [prefix, search] = url.split('?');

    const query = { ...querystring.parse(search), ...data };
    const newSearch = querystring.stringify(query);
    return `${prefix}?${newSearch}`;
  }

  return url;
}
