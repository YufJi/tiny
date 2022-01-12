import { Deferred, g } from 'shared';
import { JSCORE } from './type';

export default function createInvoke(jsCore: JSCORE) {
  let resolveId = 0;
  const resolveMap = new Map();

  const invokeNative = (method, params = {}, webviewId = g.WEBVIEWID) => {
    resolveId += 1;

    const deferred = new Deferred();
    resolveMap.set(resolveId, deferred.resolve);

    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];

    let response = jsCore.call(method, params, webviewIds, resolveId);

    // 同步事件
    if (response) {
      try {
        response = JSON.parse(response);
      } catch (e) {
        console.error(e);
      }

      resolveMap.delete(resolveId);

      return response;
    } else {
      return deferred.promise;
    }
  };

  const invokeHandler = (resolveId, data) => {
    const resolve = resolveMap.get(Number(resolveId));
    if (!resolve) return;

    let response;

    if (typeof data === 'string') {
      try {
        response = JSON.parse(data);
      } catch (e) {
        response = {};
      }
    }
    /* 再检查一次 */
    if (typeof response !== 'object') {
      response = {};
    }

    resolve(response);
  };

  return {
    invokeNative,
    invokeHandler,
  };
}
