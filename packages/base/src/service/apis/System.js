import { memoize, isString, isObject } from 'lodash';
import qs from 'qs';
import { invokeNative } from '../bridge';
import { debug, error } from '../utils';

let systemInfo = {};

function checkObjectKeys(obj) {
  const keysArr = [];

  for (const key in obj) {
    keysArr.push(key);
  }

  return keysArr.length;
}

export function getSystemInfoSync() {
  if (!checkObjectKeys(systemInfo)) {
    const res = invokeNative('getSystemInfoSync');

    if (res.errMsg.startsWith('getSystemInfoSync:ok')) {
      systemInfo = res.data;
    }
  }

  return systemInfo;
}

export const getAppInfoSync = memoize(() => {
  return invokeNative('getAppInfoSync') || {};
}, (result) => {
  return Boolean(result.schema);
});

export const getLaunchOptionsSync = memoize(() => {
  try {
    const res = invokeNative('getLaunchOptionsSync');

    let query;

    if (isString(res.query)) {
      // NOTE: 客户端传递的query是字符串格式，需要手动解析成object
      query = qs.parse(res.query);
    } else if (isObject(res.query)) {
      query = res.query;
      Object.entries(query).forEach(([key, value = '']) => {
        query[key] = decodeURIComponent(value.toString());
      });
    } else {
      query = {};
    }

    const launchOptions = {
      query,
      path: res.path,
      scene: res.scene,
      refererInfo: res.refererInfo,
    };

    debug('launchOptions', launchOptions);

    return launchOptions;
  } catch (e) {
    error(e);
    return {};
  }
});
