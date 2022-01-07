import { isObject, isString, last, cloneDeep } from 'lodash';
import qs from 'qs';
import { invokeNative } from '../bridge';
import context, { routeEmitter, webviewUsed, pageStack, pageInitMap, componentBookmarks } from '../context';
import { ComponentPageModel, PageModel } from '../Model';
import firstRender from './firstRender';

let onAppRouteParams;

export default function handleAppRoute(_params, _webviewId) {
  const params = handleAppRouteParams(_params, _webviewId);

  action(params);

  invokeNative('endRouteChange', {});
}

function handleAppRouteParams(params, _webviewId) {
  const webviewId = params.webviewId || _webviewId;
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
    for (let i = 0; i < entries.length; i+=1) {
      const [key, value] = entries[i];

      if (!isString(value)) {
        throw new Error(`onAppRoute query has non-string type with ${key} as '${typeof value}'`);
      }

      query[key] = decodeURIComponent(value);
    }
  } else if (isString(rawQuery) && rawQuery !== '') {
    query = qs.parse(rawQuery);
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

  routeEmitter.emit('beforeRoute', currentPage);

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
    routeEmitter.emit('afterRoute', currentPage, lastPage);
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

  let isComponent;

  if (pageInitMap.has(route)) {
    isComponent = false;
  } else if (componentBookmarks.has(route)) {
    isComponent = true;
  } else {
    throw new Error(`Page[${route}] not found. May be caused by: 1. Forgot to add page route in app.json. 2. Invoking Page() in async task.`);
  }

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
    loaded: false,
  };

  if (!currentPage.implement.onShareAppMessage) {
    invokeNative('hideShareMenu');
  }

  firstRender(currentPage);

  // 缓存page
  webviewUsed.set(webviewId, currentPage);

  pageStack.push(currentPage);

  // 是否需要和微信对齐？
  // implement.onLoad(query);
  // implement.onShow();
}

function isRouteType(type) {
  return ['appLaunch', 'navigateTo', 'redirectTo', 'navigateBack', 'switchTab', 'reLaunch'].includes(type);
}

function isTabPage(path) {
  return Boolean(context.tabBarConfig && context.tabBarConfig.list.some((item) => {
    return item.pagePath === path;
  }));
}

function pageShow(page) {
  page.implement.onShow();
  routeEmitter.emit('show', page);
}

function popPageStack() {
  const pop = pageStack.pop();

  if (pop) {
    webviewUsed.delete(pop.webviewId);
    pop.implement.onUnload();
    routeEmitter.emit('destroyPage', pop);
  }
}
