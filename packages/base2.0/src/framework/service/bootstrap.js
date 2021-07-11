import context from './context';
import { loadApp } from './App';
import { invokeNative, replyWebview, onNative } from './bridge';
import { onRouteEvent, loadRoute, getPageStack } from './Route';
import firstRender from './Route/firstRender';
import loadPageEvent from './Page/loadPageEvent';
import loadComponent from './Component/loadComponent';

/**
 * 路由创建页面的事件回调
 * @param currentPage 当前路由页面
 */
onRouteEvent('afterCreatePage', (currentPage) => {
  // 页面创建后控制分享菜单是否显示隐藏
  if (!currentPage.implement.onShareAppMessage) {
    invokeNative('hideShareMenu');
  }

  // 渲染数据
  firstRender(currentPage);
});

export default function bootstrap() {
  context.checkTinyConfig();
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
