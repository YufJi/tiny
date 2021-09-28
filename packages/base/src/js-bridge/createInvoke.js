import { Deferred, g } from 'shared';

export default function createInvoke(jsCore) {
  let resolveId = 0;
  const resolveMap = new Map();

  const invokeNative = (method, params = {}, webviewId = g.WEBVIEWID) => {
    resolveId += 1;

    const deferred = new Deferred();
    resolveMap.set(resolveId, deferred.resolve);

    const paramsString = JSON.stringify(params);
    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    const webviewIdsString = JSON.stringify(webviewIds);

    let response = jsCore.call(method, paramsString, webviewIdsString, resolveId);

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
