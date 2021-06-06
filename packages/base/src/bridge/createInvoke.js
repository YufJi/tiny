export function Deferred() {
  this.promise = undefined;
  this.resolve = undefined;
  this.reject = undefined;

  this.promise = new Promise(((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  }));
}

export default function createInvoke(jsCore) {
  let resolveId = 0;
  const resolveMap = new Map();

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

    if (typeof data !== 'object') {
      response = {};
    }

    resolve(response);
  };

  const invokeNative = (method, params, webviewId = self.WEBVIEWID) => {
    resolveId += 1;

    const deferred = new Deferred();
    resolveMap.set(resolveId, deferred.resolve);

    params.from = self.__IS_WORKER__ ? 'WORKER' : 'RENDER';

    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];

    let response = jsCore.call({
      event: method,
      paramsString: JSON.stringify(params),
      webviewIds: JSON.stringify(webviewIds),
      callbackId: resolveId,
    });

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

  return {
    invokeNative,
    invokeHandler,
  };
}
