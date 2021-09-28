import { omitBy, isFunction, get } from 'lodash';
import { invokeNative } from '../bridge';

export function invokeMethod(method, params = {}, options = {}) {
  const pureParams = omitBy(params, isFunction);
  let res = invokeNative(method, pureParams);

  if (typeof res.then === 'function') {
    res.then((r) => {
      res = r;

      invoke();
    });
  } else {
    // 同步调用
    invoke();
  }

  function invoke() {
    res.errMsg = res.errMsg || `${method}:ok`;
    const status = getStatus(method, res.errMsg);

    const call = (obj, key) => {
      const fn = get(obj, key);

      if (typeof fn === 'function') {
        fn(res);
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
