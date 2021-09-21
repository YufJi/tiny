import { replyWebview, onNative } from './bridge';
import loadRoute, { getPageStack, firstRender } from './Route';
import { loadPageEvent } from './Page';
import { loadComponent } from './Component';

export default function bootstrap() {
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
