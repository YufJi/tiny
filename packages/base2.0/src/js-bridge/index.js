import createSubscribe from './createSubscribe';
import createPublish from './createPublish';
import createInvoke from './createInvoke';

export default function createBridge(jsCore) {
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
