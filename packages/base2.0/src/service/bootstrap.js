/*
 * @Author: YufJ
 * @Date: 2021-07-04 00:11:24
 * @LastEditTime: 2021-08-17 14:34:24
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/framework/service/bootstrap.js
 */
import { loadApp } from './App';
import { replyWebview, onNative } from './bridge';
import { loadRoute, getPageStack } from './Route';
import firstRender from './Route/firstRender';
import loadPageEvent from './Page/loadPageEvent';
import loadComponent from './Component/loadComponent';

export default function bootstrap() {
  loadApp();
  replyWebview();
  loadRoute();
  loadComponent();
  loadPageEvent();

  // 页面对应对webview挂了，需要重新加载
  onNative('onPageReload', ({ webviewId }) => {
    const targetPage = getPageStack().find((page) => {
      return page.webviewId === webviewId;
    });

    if (targetPage) {
      firstRender(targetPage, true);
    }
  });
}
