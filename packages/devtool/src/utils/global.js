/**
 * 一些全局变量
 */

const gloabl = {
  // 预热webview
  preloadRenders: [],
  // 当前webview
  currentRender: null,
  pagesStack: [],
  renders: {},
  tabRenders: {},
  worker: null,
  appConfig: {},
  tabBarConfig: null,
};

export default gloabl;
