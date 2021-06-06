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

export {
  /* 调用的回调 */
  invokeHandler,
  /* 监听的回调 */
  subscribeHandler,

  publish,
  subscribe,
  unsubscribe,

  invokeNative,
  onNative,
  offNative,
};
