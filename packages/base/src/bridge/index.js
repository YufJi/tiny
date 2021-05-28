import createBridge from './createBridge';

// 宿主提供的bridge
const jsCore = self.JSCore;

const {
  invokeHandler,
  subscribeHandler,

  publish,
  invokeNative,
  onNative,
  offNative,
  subscribe,
  unsubscribe,
} = createBridge(jsCore);

// 全局注册对象, 提供给宿主调用
self.JSBridgeHandler = {
  /* 调用的回调 */
  invokeHandler,
  /* 监听的回调 */
  subscribeHandler,
};

export {
  publish,
  subscribe,
  unsubscribe,

  invokeNative,
  onNative,
  offNative,
};
