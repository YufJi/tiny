import { getCurrentPages } from '../../Route';
import SelectorQuery from './SelectorQuery';

export function createSelectorQuery(currentPage) {
  let webviewid = null;

  if (currentPage && currentPage.page) {
    webviewid = currentPage.page.__webviewId__;
  } else {
    const pages = getCurrentPages(); // 兼容用户循环调用，卡住页面堆栈为空的间隙

    if (pages.length === 0) {
      return null;
    }

    webviewid = pages[pages.length - 1].__webviewId__;
  }

  return new SelectorQuery(webviewid);
}
