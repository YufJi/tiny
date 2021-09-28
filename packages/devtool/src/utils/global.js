/**
 * 一些全局变量
 */

const global = {
  webviews: new Map(),
  // 预热webview
  preloadRenders: [],
  // 当前webview
  currentRender: null,
  service: null,
};

export default global;
