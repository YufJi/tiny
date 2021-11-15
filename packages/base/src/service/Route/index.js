import { isFunction } from 'lodash';
import { CustomEvent } from 'shared';
import { onNative, subscribe, invokeNative } from '../bridge';
import handleAppRoute from './handleRoute';
import firstRender from './firstRender';
import { webviewUsed, emitter, pageStack } from './common';

const { PAGE_READY, PAGE_SHOW } = CustomEvent;

export default function loadRoute() {
  onRouteEvent('afterCreatePage', (currentPage) => {
    // 页面创建后控制分享菜单是否显示隐藏
    if (!currentPage.implement.onShareAppMessage) {
      invokeNative('hideShareMenu');
    }

    // 渲染数据
    firstRender(currentPage);
  });

  onNative('onAppRoute', handleAppRoute);

  subscribe(PAGE_SHOW, (_, webviewId) => {
    const page = webviewUsed.get(webviewId);

    if (!page) {
      return;
    }
    page.implement.onShow();
  });

  subscribe(PAGE_READY, (_, webviewId) => {
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
  // shareAppExt(handleShareParams);
}

export function onRouteEvent(event, handler) {
  if (isFunction(handler)) {
    emitter.on(event, handler);
  }
}

export function getCurrentPages() {
  return getPageStack().map((i) => {
    return i.implement;
  });
}

export function getPageStack() {
  return Array.from(pageStack);
}

export {
  firstRender,
};
