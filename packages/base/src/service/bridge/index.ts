import { get } from 'lodash';
import createBridge from 'js-bridge';
import { g } from 'shared';

const {
  invokeHandler,
  subscribeHandler,

  invokeNative,
  onNative,
  offNative,
  publish,
  subscribe,
  unsubscribe,
} = createBridge();

function createInvokeWebview(publish, subscribe) {
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

  return function invokeWebview(method, params, webviewId) {
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
      }, [webviewId]);
    }));
  };
}

// 监听且回应webview
function replyWebview() {
  subscribe('invokeServiceMethod', async (data, webviewId) => {
    const { method, params, scene, extra } = data;
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
      fn = get(g.tiny, method);
    }

    if (!fn) {
      publish('callbackServiceMethod', {
        method,
        result: undefined,
        error: `${method} method not found`,
        extra,
      }, [webviewId]);
      return;
    }

    const result = await fn(params);
    publish('callbackServiceMethod', {
      method,
      result,
      extra,
    }, [webviewId]);
  });
}

const invokeWebview = createInvokeWebview(publish, subscribe);

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
