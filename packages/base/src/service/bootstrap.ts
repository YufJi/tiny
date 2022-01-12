import { replyWebview } from './bridge';
import loadRoute from './Route';
import { loadPageEvent } from './Page';
import { loadComponent } from './Component';

export default function bootstrap() {
  /* 注册监听webview事件 */
  replyWebview();
  /* 加载路由 */
  loadRoute();
  loadComponent();
  loadPageEvent();
}
