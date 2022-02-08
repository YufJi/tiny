import { last, isEqual, isString } from 'lodash';
import qs from 'qs';
import { onNative, publish } from '../bridge';
import context from '../context';
import { triggerShowCbs, triggerHideCbs } from '../apis/AppEvents';
import { getPageStack } from '../Route';

const APP_STATE = {
  // willRoute 意味着onAppEnterForeground后面会有路由事件，此时不派发页面级别的 onShow
  willRoute: false,
  firstColdLaunch: true,
  launchParam: {
    path: '',
    query: {},
  },
};

export default function loadApp(app) {
  app.onLaunch(context.launchOptions);
  app.onShow(context.launchOptions);

  triggerShowCbs(context.launchOptions);

  // onAppLaunch 一定比 onAppEnterForeground 先发
  onNative('onAppLaunch', handleAppLaunch);

  // 页面切回前台时，先‘显示’ App，再‘显示’最上层页面
  onNative('onAppEnterForeground', (param) => {
    handleAppEnterForeground(app, param);
  });

  // 页面切到后台时，将最上层页面‘隐藏’，然后让App‘隐藏’
  onNative('onAppEnterBackground', () => {
    handleAppEnterBackground(app);
  });

  // 监听全局错误
  // app.onError(e);
}

function handleAppLaunch(param) {
  const pages = getPageStack();
  const currentPage = last(pages);
  const query = isString(param.query) ? qs.parse(param.query) : param.query || {};

  if (!currentPage || currentPage.route !== param.path || !isEqual(currentPage.query, query)) {
    APP_STATE.willRoute = true;
    APP_STATE.launchParam.path = param.path;
    APP_STATE.launchParam.query = query;
  }
}

function handleAppEnterForeground(app, param) {
  if (APP_STATE.firstColdLaunch) {
    APP_STATE.willRoute = false;
    APP_STATE.firstColdLaunch = false;
    return;
  }

  const pages = getPageStack();
  const currentPage = last(pages);
  let path;
  let query;

  if (APP_STATE.willRoute) {
    // 后面将有一次onAppRoute，会改变currentPage
    path = APP_STATE.launchParam.path;
    query = APP_STATE.launchParam.query;
  } else if (currentPage) {
    // 小程序已经启动，一定有currentPage
    path = currentPage.route;
    query = currentPage.query;
  } else {
    console.error('currentPage not found');
  }

  const showOptions = {
    ...param,
    query,
    path,
  };

  app.onShow(showOptions);
  triggerShowCbs(showOptions);

  // 页面onShow生命周期将有route管理
  if (!APP_STATE.willRoute) {
    if (currentPage) {
      currentPage.implement.onShow();

      // notify webview
      publish('onAppEnterForeground', {}, [currentPage.webviewId]);
    }
  }

  APP_STATE.willRoute = false;
}

function handleAppEnterBackground(app) {
  const pages = getPageStack();

  if (pages.length) {
    const currentPage = pages[pages.length - 1];
    currentPage.implement.onHide();
    // notify webview
    publish('onAppEnterBackground', {}, [currentPage.webviewId]);
  }

  triggerHideCbs();
  app.onHide();
}
