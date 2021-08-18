/**
 * 一些全局变量
 */

const global = {
  // 预热webview
  preloadRenders: [],
  // 当前webview
  currentRender: null,
  pageStack: [],
  webviews: new Map(),
  worker: null,
  appConfig: {},
  tabBarConfig: null,
};

export default global;
