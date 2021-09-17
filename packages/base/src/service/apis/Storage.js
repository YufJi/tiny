import { anyTypeToString, stringToAnyType } from '../utils';
import { invokeMethod, beforeInvoke } from './util';

export function getStorage(param) {
  if (beforeInvoke('getStorage', param, {
    key: '',
  })) {
    invokeMethod('getStorage', param, {
      beforeSuccess(res) {
        res.data = stringToAnyType(res.data, res.dataType);
        delete res.dataType;
      },
      afterFail(res = {}) {
        if (res.errMsg && res.errMsg.indexOf('data not found') > 0) {
          return false;
        }
      },
    });
  }
}

export function getStorageSync(key) {
  if (beforeInvoke('getStorageSync', key, '')) {
    let result;
    invokeMethod('getStorageSync', {
      key,
    }, {
      beforeAll(res = {}) {
        result = stringToAnyType(res.data, res.dataType);
      },
      afterFail(res = {}) {
        if (res.errMsg && res.errMsg.indexOf('data not found') > 0) {
          return false;
        }
      },
    });

    return result;
  }
}

export function setStorage(param) {
  if (beforeInvoke('setStorage', param, {
    key: '',
  })) {
    try {
      const { data, dataType } = anyTypeToString(param.data);

      invokeMethod('setStorage', Object.assign(param, {
        data,
        dataType,
      }));
    } catch (ex) {
      typeof param.fail === 'function' && param.fail({
        errMsg: `setStorage:fail ${ex.message}`,
      });
      typeof param.complete === 'function' && param.complete({
        errMsg: `setStorage:fail ${ex.message}`,
      });
    }
  }
}

export function setStorageSync(key, data = '') {
  if (beforeInvoke('setStorageSync', key, '')) {
    const tmp = anyTypeToString(data);
    const dataString = tmp.data;
    const { dataType } = tmp;
    let callFailed = false;
    let errMsg = '';

    invokeMethod('setStorageSync', {
      key,
      data: dataString,
      dataType,
      fail: function fail(res = {}) {
        errMsg = res.errMsg;
        callFailed = true;
      },
    });

    if (callFailed) {
      throw new Error(errMsg);
    }
  }
}

export function removeStorage(param) {
  if (beforeInvoke('removeStorage', param, {
    key: '',
  })) {
    invokeMethod('removeStorage', param);
  }
}

export function removeStorageSync(key) {
  if (beforeInvoke('removeStorageSync', key, '')) {
    invokeMethod('removeStorageSync', {
      key,
    });
  }
}

export function clearStorage(param) {
  invokeMethod('clearStorage', param);
}

export function clearStorageSync() {
  invokeMethod('clearStorageSync');
}

export function getStorageInfo(param) {
  invokeMethod('getStorageInfo', param);
}

export function getStorageInfoSync() {
  let result;
  invokeMethod('getStorageInfoSync', {}, {
    beforeAll: function beforeAll(res) {
      result = res;
      delete res.errMsg;
    },
  });
  return result;
}
