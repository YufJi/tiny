import { isFunction } from 'lodash';
import { CustomEvent, NativeEvent } from 'shared';
import { onNative, subscribe } from '../bridge';
import { routeEmitter, webviewUsed, pageStack } from '../context';

import handleAppRoute from './handleRoute';
import firstRender from './firstRender';

export default function loadRoute() {
  onNative(NativeEvent.AppRoute, handleAppRoute);

  subscribe(CustomEvent.PageShow, (_, webviewId) => {
    const page = webviewUsed.get(webviewId);

    if (!page) {
      return;
    }
    page.implement.onShow();
  });

  subscribe(CustomEvent.PageReady, (_, webviewId) => {
    const page = webviewUsed.get(webviewId);

    if (!page) {
      return;
    }
    page.implement.onReady();
  });

  // 监听native的onPullDownRefresh消息，响应用户页面的onPullDownRefresh生命周期
  onNative(NativeEvent.PullDownRefresh, (_, webviewId) => {
    const page = webviewUsed.get(webviewId);

    if (!page) {
      return;
    }

    page.implement.onPullDownRefresh && page.implement.onPullDownRefresh();
  });

  /* 刷新页面 */
  onNative(NativeEvent.PageReload, ({ webviewId }) => {
    const targetPage = getPageStack().find((page) => {
      return page.webviewId === webviewId;
    });

    if (targetPage) {
      firstRender(targetPage, true);
    }
  });

  // 注册分享逻辑
  // shareAppExt(handleShareParams);
}

export function onRouteEvent(event, handler) {
  if (isFunction(handler)) {
    routeEmitter.on(event, handler);
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
