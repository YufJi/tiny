/*
 * @Author: YufJ
 * @Date: 2021-07-05 20:35:40
 * @LastEditTime: 2021-07-09 15:48:35
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/webview/bridge/index.js
 */
import createBridge from 'js-bridge';

const g = self;

g.__IS_WORKER__ = false;

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

subscribe('callbackServiceMethod', (data) => {
  const callback = callbackMap.get(data.extra.callbackId);
  if (!callback) return;

  if (data.error) {
    callback.fail({
      errMsg: data.error,
    });
    callback.complete({
      errMsg: data.error,
    });
  } else {
    callback.success(data.result);
    callback.complete(data.result);
  }
});

function invokeService(options) {
  const { name: method, type: scene = 'sdk', args } = options;
  const params = omitBy(args, isFunction);

  callbackId += 1;
  callbackMap.set(callbackId, {
    success: args.success || noop,
    fail: args.fail || noop,
    complete: args.complete || noop,
  });

  publish('invokeServiceMethod', {
    method,
    scene,
    params,
    extra: {
      callbackId,
      timestamp: Date.now(),
    },
  });
}

function createReply(publish, subscribe) {
  const callbackMap = new Map();

  subscribe('invokeWebviewMethod', (ev) => {
    const { method, params, extra } = ev;
    const fn = callbackMap.get(method);

    if (fn) {
      return fn(params).then((result) => {
        publish('callbackWebviewMethod', {
          method,
          result,
          extra,
        });
      }).catch((error) => {
        publish('callbackWebviewMethod', {
          method,
          error,
          extra,
        });
      });
    }

    publish('callbackWebviewMethod', {
      method,
      error: new Error(
        `Cannot find ${method}'s callback in reply-service.`,
      ),
      extra,
    });
  });

  return function (method) {
    return (callback) => {
      if (callbackMap.has(method)) { throw new Error(`${method} already register`); }

      callbackMap.set(method, callback);
    };
  };
}

const replyService = createReply(publish, subscribe);

export {
  /* 调用的回调 */
  invokeHandler,
  /* 监听的回调 */
  subscribeHandler,

  publish,
  subscribe,
  unsubscribe,
  invokeService,
  replyService,

  invokeNative,
  onNative,
  offNative,
};
