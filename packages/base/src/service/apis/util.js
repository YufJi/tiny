import { omitBy, isFunction, get, isPlainObject } from 'lodash';
import path from 'path';
import { g } from 'shared';
import qs from 'qs';
import { wrapInnerFunction, wrapUserFunction, debug } from '../utils';
import { onNative, invokeNative } from '../bridge';

const S = {
  lastRoute: '',
  query: {},
  runningStatus: 'active',
  navigatorLock: false,
  openUrlLock: false,
  possessingBackgroundAudioPlayer: false,
  webviewEventCallback: null,
};

export const GlobalState = new Proxy(S, {
  set: function set(target, key, value, receiver) {
    return Reflect.set(target, key, value, receiver);
  },
});

export function getDataType(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

export function paramCheck(input, shouldbe, name = 'param') {
  const inputType = getDataType(input);
  const shouldbeType = getDataType(shouldbe);

  if (inputType !== shouldbeType) {
    return `${name} should pass ${shouldbeType}, not ${inputType}`;
  }

  let message = '';

  // eslint-disable-next-line default-case
  switch (shouldbeType) {
    case 'Object':
      for (const key in shouldbe) {
        message += paramCheck(input[key], shouldbe[key], `${name}.${key}`);
      }

      break;

    case 'Array':
      if (input.length < shouldbe.length) {
        return `${name} should have more than ${shouldbe.length} items, not ${input.length} items`;
      }

      for (let i = 0; i < shouldbe.length; ++i) {
        message += paramCheck(input[i], shouldbe[i], `${name}[${i}]`);
      }
      break;
  }

  return message;
}

export function getRealRoute(root, url) {
  if (url.startsWith('/')) {
    return url.substr(1);
  }

  const [_url, search] = url.split('?');
  const result = path.join(path.dirname(root), _url);

  if (search) {
    return `${result}?${search}`;
  }

  return result;
}

export function beforeInvoke(api, param, shouldBe) {
  const failMessage = paramCheck(param, shouldBe);

  if (failMessage) {
    beforeInvokeFail(api, param, failMessage);
    return false;
  } else {
    return true;
  }
}

export function beforeInvokeFail(api, param = {}, msg = '') {
  const res = {
    errMsg: `${api}:fail ${msg}`,
  };
  wrapUserFunction(res.errMsg, param.fail)(res);
  wrapUserFunction(res.errMsg, param.complete)(res);
}

export function checkUrlInConfig(api, url, param) {
  let path = url.replace(/\.html\?.*|\.html$/, '');
  path = path.replace(/\?.*$/, '');

  if (g.TinyConfig.pages.includes(path)) {
    return true;
  }

  beforeInvokeFail(api, param, `url "${removeHtmlSuffixFromUrl(url)}" is not in app.json`);
  return false;
}

function getStatus(method, errMsg) {
  if (errMsg.startsWith(`${method}:ok`)) {
    return 'success';
  }

  if (errMsg.startsWith(`${method}:fail`)) {
    return 'fail';
  }

  if (errMsg.startsWith(`${method}:cancel`)) {
    return 'cancel';
  }

  throw new Error(`${method} response's errMsg(${errMsg}) incorrect`);
}

export function invokeMethod(method, params = {}, options = {}) {
  const pureParams = omitBy(params, isFunction);
  let res = invokeNative(method, pureParams);

  if (typeof res.then === 'function') {
    res.then((r) => {
      res = r;

      invoke(method, res, params, options);
    });
  } else {
    // 同步调用
    invoke(method, res, params, options);
  }
}

export function invoke(method, res, params, options) {
  res.errMsg = res.errMsg || `${method}:ok`;
  const status = getStatus(method, res.errMsg);

  const call = (obj, key) => {
    const fn = get(obj, key);

    if (typeof fn === 'function') {
      if (obj === options) {
        wrapInnerFunction(`at api ${method} ${key} callback function`, fn)(res);
      } else {
        wrapUserFunction(`at api ${method} ${key} callback function`, fn)(res);
      }
    }
  };

  call(options, 'beforeAll');

  if (status === 'success') {
    call(options, 'beforeSuccess');
    call(params, 'success');
    call(options, 'afterSuccess');
  } else if (status === 'cancel') {
    res.errMsg = res.errMsg.replace(`${method}:cancel`, `${method}:fail cancel`);

    call(params, 'fail');
    call(options, 'beforeCancel');
    call(params, 'cancel');
    call(options, 'afterCancel');
  } else if (status === 'fail') {
    call(options, 'beforeFail');
    call(params, 'fail');
    call(options, 'afterFail');
  }

  call(params, 'complete');
  call(options, 'afterAll');
}

export function onMethod(event, callback) {
  onNative(event, wrapInnerFunction(`at api ${event} callback function`, callback));
}

export function encodeUrlQuery(url) {
  if (typeof url === 'string') {
    return encodeEachValue(url);
  }

  return url;
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
    }).filter(Boolean).join('&');
    return `${prefix}?${newSearch}`;
  }

  return prefix;
}

export function removeHtmlSuffixFromUrl(url) {
  if (typeof url === 'string') {
    if (url.includes('?')) {
      return url.replace(/\.html\?/, '?');
    } else {
      return url.replace(/\.html$/, '');
    }
  } else {
    return url;
  }
}

export function surroundByTryCatchFactory(func, msg) {
  return wrapUserFunction(msg, func);
}

function surroundByTryCatch(func, msg) {
  return wrapInnerFunction(msg, func);
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

    const query = { ...qs.parse(search), ...data };
    const newSearch = qs.stringify(query);
    return `${prefix}?${newSearch}`;
  }

  return url;
}
