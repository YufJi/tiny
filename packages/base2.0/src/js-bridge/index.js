import createSubscribe from './createSubscribe';
import createPublish from './createPublish';
import createInvoke from './createInvoke';

export default function createBridge(jsCore) {
  const {
    subscribeHandler,
    onNative,
    offNative,
    subscribe,
    unsubscribe,
  } = createSubscribe();

  const {
    invokeNative,
    invokeHandler,
  } = createInvoke(jsCore, onNative);

  const { publish } = createPublish(jsCore);

  return {
    // 宿主调用
    invokeHandler,
    subscribeHandler,

    // 内部方法
    publish,
    invokeNative,
    onNative,
    offNative,
    subscribe,
    unsubscribe,
  };
}
