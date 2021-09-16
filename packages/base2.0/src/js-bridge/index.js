import { g } from 'shared';

import createSubscribe from './createSubscribe';
import createPublish from './createPublish';
import createInvoke from './createInvoke';

export default function createBridge() {
  let jsCore;

  if (g.JSCore) {
    jsCore = g.JSCore;
  } else if (g.webkit) {
    const { messageHandlers } = g.webkit;

    jsCore = {
      call(...args) {
        return messageHandlers.TinyCall.postMessage(...args);
      },
      publish(...args) {
        messageHandlers.TinyPublish.postMessage(...args);
      },
      setTimer(...args) {
        messageHandlers.TinySetTimer.postMessage(...args);
      },
      clearTimer(...args) {
        messageHandlers.TinyClearTimer.postMessage(...args);
      },
    };
  } else {
    throw new Error('No JScore nor webkit is found, native bridge is missing.');
  }

  const {
    subscribeHandler,
    onNative,
    offNative,
    subscribe, // 监听线程
    unsubscribe,
  } = createSubscribe();

  const {
    invokeNative, // 调用native
    invokeHandler, // native触发回调
  } = createInvoke(jsCore, onNative);

  const { publish } = createPublish(jsCore);

  return {
    // 宿主调用
    invokeHandler,
    subscribeHandler,

    // 内部方法
    invokeNative,
    onNative,
    offNative,

    publish,
    subscribe,
    unsubscribe,
  };
}
