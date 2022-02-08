import global from '@/utils/global';
import store from '@/store';

const { dispatch } = store;

export function showToast(params) {
  const { title } = params;
}

export function setNavigationBarTitle(params, webviewIds, callbackId) {
  const { title } = params;

  dispatch.nav.setTitle(title);

  global.service.contentWindow.JSBridge.invokeHandler(callbackId, {
    errMsg: 'setNavigationBarTitle:ok',
  });
}
