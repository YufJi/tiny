/**
 * 一些全局变量
 */

const global = {
  // 预热webview
  preloadRenders: [],
  // 当前webview
  currentRender: null,
  // ['render-1', 'render-2']
  pageStack: [],
  webviews: new Map(),
  worker: null,
  appConfig: {},
  tabBarConfig: null,
};

export default global;
