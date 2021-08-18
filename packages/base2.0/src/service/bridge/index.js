import createBridge from 'js-bridge';

const g = self;

g.__IS_WORKER__ = true;

const {
  invokeHandler,
  subscribeHandler,

  publish,
  invokeNative,
  onNative,
  offNative,
  subscribe,
  unsubscribe,
} = createBridge(g.JSCore);

let callbackId = 0;
const callbackMap = new Map();
// 监听webview调用
subscribe('callbackWebviewMethod', (response) => {
  const { error, result, extra } = response;
  const currentId = extra.callbackId;
  const executor = callbackMap.get(currentId);

  if (!executor) {
    const info = JSON.stringify(response);
    throw new Error(`Executor(${currentId}) in service not found.\nresponse: ${info}`);
  }

  if (error) {
    error.env = 'WEBVIEW';
    executor.reject(error);
  } else {
    executor.resolve(result);
  }

  callbackMap.delete(currentId);
});

// 调用webview
function invokeWebview(method, params, webviewId) {
  return new Promise(((resolve, reject) => {
    callbackId += 1;
    callbackMap.set(callbackId, {
      resolve,
      reject,
    });

    publish('invokeWebviewMethod', {
      method,
      params,
      extra: {
        callbackId,
        timestamp: Date.now(),
      },
    }, webviewId);
  }));
}

// 监听且回应webview
function replyWebview() {
  subscribe('invokeServiceMethod', async (data, webviewId) => {
    const webviewIds = [webviewId];
    const { scene, method, extra, params } = data;
    let fn;

    if (scene === 'bridge') {
      fn = async () => {
        const response = await invokeNative(method, data);
        if (!response.errMsg) {
          return;
        }

        const { errMsg = `${method}:ok`, result } = response;
        if (!errMsg.startsWith(`${method}ok`)) {
          throw new Error(errMsg);
        }

        return result;
      };
    }

    if (scene === 'sdk') {
      const api = get(innerAPI, method) || get(apis, method);

      if (api) {
        fn = promisifyAPI(api);
      }
    }

    if (!fn) {
      publish('callbackServiceMethod', {
        method,
        result: undefined,
        error: `${method} method not found`,
        extra,
      }, webviewIds);
      return;
    }

    const result = await fn(params);
    publish('callbackServiceMethod', {
      method,
      result,
      extra,
    }, webviewIds);
  });
}

export {
  /* 调用的回调 */
  invokeHandler,
  /* 监听的回调 */
  subscribeHandler,

  publish,
  subscribe,
  unsubscribe,
  invokeWebview,
  replyWebview,

  invokeNative,
  onNative,
  offNative,
};
