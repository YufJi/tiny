import React from 'react';
import { Toast } from 'antd-mobile';
import { ExclamationCircleOutline } from 'antd-mobile-icons';

import global from '@/utils/global';
import store from '@/store';

const { dispatch } = store;

export function showToast(params, webviewIds, callbackId) {
  const { title, icon, duration, mask } = params;

  switch (icon) {
    case 'success':
    case 'loading':
      Toast.show({
        icon,
        content: title,
        duration,
        maskClickable: !mask,
      });
      break;
    case 'error':
      Toast.show({
        icon: <ExclamationCircleOutline />,
        content: title,
        duration,
        maskClickable: !mask,
      });
      break;
    case 'none':
      Toast.show({
        content: title,
        duration,
        maskClickable: !mask,
      });
      break;

    default:
      break;
  }

  global.service.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ errMsg: 'showToast:ok' })}')`);
}

export function hideToast(params, webviewIds, callbackId) {
  Toast.clear();

  global.service.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ errMsg: 'hideToast:ok' })}')`);
}

export function setNavigationBarTitle(params, webviewIds, callbackId) {
  const { title } = params;

  dispatch.nav.setTitle(title);

  global.service.contentWindow.executeJavaScript(`JSBridge.invokeHandler(${callbackId}, '${JSON.stringify({ errMsg: 'setNavigationBarTitle:ok' })}')`);
}
