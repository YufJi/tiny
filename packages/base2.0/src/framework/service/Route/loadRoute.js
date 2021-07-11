import EventEmitter from 'eventemitter3';
import { isObject, isString, isFunction, last, cloneDeep } from 'lodash';
import querystring from 'querystring';

import { onNative, subscribe, invokeNative } from '../bridge';
import context from '../context';
import checkIsComponent from './checkIsComponent';

// 使用过的webview
const webviewUsed = new Map();

// 页面栈
const pageStack = [];

// events
const emitter = new EventEmitter();

let onAppRouteParams;

function isRouteType(type) {
  return ['appLaunch', 'navigateTo', 'redirectTo', 'navigateBack', 'switchTab', 'reLaunch'].includes(type);
}

function isTabPage(path) {
  return Boolean(context.tabBarConfig && context.tabBarConfig.list.some((item) => {
    return item.pagePath === path;
  }));
}

function popPageStack() {
  const pop = pageStack.pop();

  if (pop) {
    webviewUsed.delete(pop.webviewId);
    pop.implement.onUnload();
    emitter.emit('destroyPage', pop);
  }
}

/**
 * 读 页面栈
 */
export function getPageStack() {
  return Array.from(pageStack);
}
/**
 * 获取当前页面栈中的页面信息
 */
export function getCurrentPages() {
  return getPageStack().map((i) => {
    return i.implement;
  });
}

export function onRouteEvent(event, handler) {
  if (isFunction(handler)) {
    emitter.on(event, handler);
  }
}

export default function loadRoute() {
  onNative('onAppRoute', handleAppRoute);

  // 监听webview的domready事件，响应用户页面的onReady生命周期
  subscribe('DOCUMENT_READY', (_, webviewId) => {
    const page = webviewUsed.get(webviewId);

    if (!page) {
      return;
    }

    page.implement.onReady();
  });

  // 监听native的onPullDownRefresh消息，响应用户页面的onPullDownRefresh生命周期
  onNative('onPullDownRefresh', (_, webviewId) => {
    const page = webviewUsed.get(webviewId);

    if (!page) {
      return;
    }

    page.implement.onPullDownRefresh && page.implement.onPullDownRefresh();
  });

  // 注册分享逻辑
  shareAppExt(handleShareParams);
}

function handleAppRoute(_params, _webviewId) {
  const params = handleAppRouteParams(_params, _webviewId);

  emitter.emit('route', { ..._params, query: params.query });

  action(params);

  invokeNative('endRouteChange', {});
}

function handleAppRouteParams(params, _webviewId) {
  const webviewId = Number(params.webviewId || _webviewId);
  const rawQuery = params.query;
  const type = params.openType;
  const route = params.path;

  let query;

  if (!webviewId) {
    throw new Error('onAppRoute native params is missing webviewId');
  }

  if (!isRouteType(type)) {
    throw new Error(`onAppRoute encountered unknown openType ${type}`);
  }

  if (!route) {
    throw new Error('onAppRoute native params is missing route');
  }

  if (isObject(rawQuery)) {
    query = {};

    const entries = Object.entries(rawQuery);
    // 兼容老的schema解析逻辑
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];

      if (!isString(value)) {
        throw new Error(`onAppRoute query has non-string type with ${key} as '${typeof value}'`);
      }

      query[key] = decodeURIComponent(value);
    }
  } else if (isString(rawQuery) && rawQuery !== '') {
    query = querystring.parse(rawQuery);
  } else {
    query = {};
  }

  onAppRouteParams = {
    query: rawQuery,
    openType: type,
  };

  return {
    type,
    webviewId,
    route,
    query,
  };
}

function action({ type, webviewId, route, query }) {
  const currentPage = last(pageStack);

  if (currentPage && currentPage.webviewId === webviewId) {
    return;
  }

  emitter.emit('beforeRoute', currentPage);

  if (type === 'appLaunch') {
    actionAppLaunch(route, webviewId, query);
  } else if (type === 'navigateTo') {
    actionNavigateTo(route, webviewId, query);
  } else if (type === 'redirectTo') {
    actionRedirectTo(route, webviewId, query);
  } else if (type === 'navigateBack') {
    actionNavigateBack(route, webviewId);
  } else if (type === 'switchTab') {
    actionSwitchTab(route, webviewId, query);
  } else if (type === 'reLaunch') {
    actionReLaunch(route, webviewId, query);
  } else {
    throw new Error(`Route[${type}] unexpected route type`);
  }

  const lastPage = last(pageStack);

  if (lastPage) {
    emitter.emit('afterRoute', currentPage, lastPage);
  }
}

function actionAppLaunch(route, webviewId, query) {
  const currentPage = last(pageStack);

  // 创建新页面
  if (currentPage) {
    // appLaunch在小程序生命周期内只调用一次
    throw new Error('Route[appLaunch] more than once');
  }

  actionCreatePage(route, webviewId, query);
}

function actionNavigateTo(route, webviewId, query) {
  const currentPage = last(pageStack);

  if (currentPage) {
    // 当前页面触发onHide生命周期
    currentPage.implement.onHide();
  }

  actionCreatePage(route, webviewId, query);
}

function actionRedirectTo(route, webviewId, query) {
  const currentPage = last(pageStack);

  if (currentPage) {
    // 当前页面出栈，包括tabBar
    popPageStack();
  }

  actionCreatePage(route, webviewId, query);
}

function actionNavigateBack(route, webviewId) {
  // 此时webviewId为目标Page的webviewId，从页面栈查找目标页面
  if (!pageStack.find((i) => {
    return i.webviewId === webviewId;
  })) {
    // 路由失败
    throw new Error(`Route[navigateBack] with an unexist webviewId ${webviewId}`);
  }

  const currentPage = last(pageStack);

  if (currentPage && currentPage.webviewId === webviewId) {
    return;
  }

  emitBindmessage('navigateBack', {
    route,
  });

  // 推栈
  let page;

  while (page = last(pageStack)) {
    if (page.webviewId === webviewId) {
      pageShow(page);
      break;
    } else {
      popPageStack();
    }
  }
}

function actionSwitchTab(route, webviewId, query) {
  if (!isTabPage(route)) {
    // 那不是个tabbar
    throw new Error('Route[switchTab] a non-tabbar page');
  }

  const currentPage = last(pageStack);

  if (!currentPage) {
    // switchTab不能是第一个action，必须发生在其它action后面
    throw new Error('Route[switchTab] unexpected switchtab before any page created');
  }

  // 在switchTab之前，可能从一个tab页面开始通过其它action到达其它页面，把它们全干掉
  while (pageStack.length > 1) {
    popPageStack();
  }

  // 目前只剩下一个页面
  const lastPage = pageStack[0];

  if (lastPage.webviewId === webviewId) {
    // 其他页面通过 switchTab 跳回，调用 onShow
    if (lastPage !== currentPage) {
      pageShow(lastPage);
    }
  } else {
    if (isTabPage(lastPage.route)) {
      // 最后这个页面是个tabBar
      if (currentPage === lastPage) {
        // 从一个tab直接切换（没有其它页面产生）到另一个tab
        lastPage.implement.onHide();
      } // 清空页面栈，但是不会从 webviewUsed 删除缓存

      pageStack.pop();
    } else {
      // 直接销毁
      popPageStack();
    }

    // 页面栈已清空
    const old = webviewUsed.get(webviewId);

    if (old) {
      // 一个之前创建过的tab
      pageStack.push(old);
      pageShow(old);
    } else {
      actionCreatePage(route, webviewId, query);
    }
  }
}

function actionReLaunch(route, webviewId, query) {
  // 删除所有页面
  while (pageStack.length > 0) {
    popPageStack();
  }

  actionCreatePage(route, webviewId, query);
}

function actionCreatePage(route, webviewId, query) {
  if (webviewUsed.get(webviewId)) {
    // webviewId 是不可重复的，每个 Page 对象都是唯一的
    throw new Error(`Page route webviewId already existed: ${webviewId}`);
  }

  const isComponent = checkIsComponent(route);
  const implement = isComponent ? new ComponentPageModel(route, webviewId) : new PageModel(route, webviewId);

  // query副作用
  Object.assign(implement.options, cloneDeep(query));

  // TODO，如果用户是用component的，要把options赋到data上，原来的handleDiffrenceBetwenComponent
  const currentPage = {
    implement,
    webviewId,
    route,
    query,
    _params: cloneDeep(onAppRouteParams),
  }; // 发布事件，并且这里执行事件回调是同步的

  emitter.emit('afterCreatePage', currentPage);
  // 缓存page
  webviewUsed.set(webviewId, currentPage);
  // 压栈
  pageStack.push(currentPage);
  // 用户生命周期
  implement.onLoad(query);
  implement.onShow();
}
