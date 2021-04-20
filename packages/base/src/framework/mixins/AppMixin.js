
import qs from 'query-string';
import AppRegistry from '../AppRegistry';
import EventHub from '../EventHub';
import { getPageInfoFromUrl, getUrlFromPageInfo } from '../utils/pageInfoAndUrl';
import { isTabPage, getPageId } from '../utils/pageUtils';
import resolvePageUrl from '../utils/resolvePageUrl';
import checkInvalidPage from '../utils/checkInvalidPage';
import { loadPage } from '../SubPackage';

function newPage({ pagePath, pageId, queryString }) {
  // 对于通过navigate跳转的页面，直接返回已经存在的实例
  let page = this.getPageById(pageId);
  if (page) {
    return page;
  }
  const Page = AppRegistry.getComponent(pagePath);
  if (!Page) {
    throw new Error(`[WORKER] page '${pagePath}' not found!`);
  }
  let query = {};
  if (queryString) {
    query = qs.parse(queryString);
  }
  page = Page({ id: pageId, query, pagePath });
  this.pushPage(page);
  return page;
}

function doPushWindow(doPush, { pageUrl, viewId }) {
  const { pagePath, queryString } = this.getPageObject(pageUrl);

  // 创建新的pageId
  const pageId = getPageId();
  const page = newPage.call(this, { pagePath, pageId, queryString });
  // in case invalid queryString
  const safeQueryString = qs.stringify(page.query);
  // 这里的doPush由bridge提供，集体实现根据不同的平台，不同的实现
  doPush({
    url: getUrlFromPageInfo({
      pagePath,
      pageId,
      queryString: safeQueryString,
    }),
    viewId,
    pagePath,
  });
  return page;
}

function onTabSwitch(config) {
  const _this = this;

  const { url } = config;
  const currentPage = config.currentPage || this.getCurrentPageImpl();
  const { pagePath, queryString } = this.getPageObject(url);

  function newTab() {
    const page = newPage.call(_this, {
      pagePath,
      pageId: getPageId(pagePath, 1),
      queryString,
    });
    page.fromPage = currentPage;
  }

  // from non-tab pages
  if (!this.isTabShow()) {
    this.clearAllPages();
    EventHub.emit('switchTab', {
      page: currentPage,
    });
    newTab();
    return;
  }
  const currentPages = this.getCurrentPagesImpl();
  const nextPages = this.getPagesByTabPath(pagePath);
  if (!currentPages.length && !nextPages.length) {
    return;
  }
  // switch to current page
  if (currentPages === nextPages && currentPages.length === 1) {
    return;
  }
  EventHub.emit('switchTab', {
    page: currentPage,
  });
  const pagesLoop = currentPages.concat();
  for (let i = pagesLoop.length - 1; i >= 1; i-=1) {
    pagesLoop[i].unload();
  }
  if (currentPages === nextPages) {
    pagesLoop[0].show();
  } else {
    // only onHide if current tab's stack is 1
    if (pagesLoop.length === 1) {
      pagesLoop[0].hide();
    }
    this.setCurrentPagesImpl(nextPages, pagePath);
    const nextPage = nextPages[0];
    if (nextPage) {
      nextPage.fromPage = currentPage;
      nextPage.show();
    } else {
      newTab();
    }
  }
}

const App = {
  newPage,

  reLaunch({ url }, { pushWindow, switchTab }) {
    const _this = this;

    const currentPage = this.getCurrentPageImpl();
    const pageUrl = resolvePageUrl(url, currentPage);

    loadPage(pageUrl, () => {
      if (checkInvalidPage(pageUrl)) {
        return;
      }
      _this.clearAllPages();
      let nextPage;

      const _getPageObject3 = _this.getPageObject(pageUrl);
      const { pagePath } = _getPageObject3;

      if (getPageId(pagePath, 1)) {
        // already clear all pages, need pass currentPage to switchTab
        _this.switchTab({ url: `/${pageUrl}` }, { doSwitch: switchTab, currentPage });
      } else {
        nextPage = doPushWindow.call(_this, pushWindow, { pageUrl });
        nextPage.fromPage = currentPage;
      }
    });
  },

  navigateTo({ url, viewId }, { pushWindow }) {
    const currentPage = this.getCurrentPageImpl();
    const pageUrl = resolvePageUrl(url, currentPage);
    loadPage(pageUrl, () => {
      if (checkInvalidPage(pageUrl)) {
        return;
      }
      /* 这里稍微有些不妥，万一pushWindow失败呢 */
      currentPage.hide();
      const nextPage = doPushWindow.call(this, pushWindow, { pageUrl, viewId });
      nextPage.fromPage = currentPage;
    });
  },

  redirectTo({ url }, { pushWindow }) {
    const _this = this;

    const currentPage = this.getCurrentPageImpl();
    const pageUrl = resolvePageUrl(url, currentPage);
    loadPage(pageUrl, () => {
      if (checkInvalidPage(pageUrl)) {
        return;
      }
      if (isTabPage(currentPage)) {
        _this.clearAllPages();
      } else {
        currentPage.unload();
      }
      const nextPage = doPushWindow.call( _this, pushWindow, { pageUrl });
      nextPage.fromPage = currentPage;
    });
  },

  switchTab({ url, ...tabProps }, { doSwitch, currentPage } = {}) {
    const _this = this;

    const pageUrl = resolvePageUrl(url, this.getCurrentPageImpl());
    loadPage(pageUrl, () => {
      if (checkInvalidPage(pageUrl)) {
        return;
      }

      const { pagePath } = _this.getPageObject(pageUrl);

      onTabSwitch.call(_this, { url: pageUrl, currentPage });
      if (doSwitch) {
        doSwitch({ pagePath });
      } else {
        // click tab. bug: switchTab api will also trigger native tabClick event
        const page = _this.getCurrentPageImpl();
        if (page) {
          if (page.isLoaded()) {
            page.onTabItemTap(tabProps);
          } else {
            page.tabProps = tabProps;
            page._fromTabItemTap = 1;
          }
        }
      }
    });
  },

  destroyPageByUrl(pageUrl) {
    const { id } = getPageInfoFromUrl(pageUrl);

    const allPages = this.getAllPages();
    // after reLaunch the same tab....
    if (allPages.length === 1 && allPages[0].getId() === id) {
      return;
    }
    const page = this.getPageById(id);
    if (page) {
      page.unload();
    }
  },

  pausePageByUrl(url) {
    const { id } = getPageInfoFromUrl(url);

    const page = this.getPageById(id);
    if (page) {
      page.hide();
    }
  },

  resumePageByUrl(url) {
    const { id } = getPageInfoFromUrl(url);

    const page = this.getPageById(id);
    if (page) {
      page.show();
    }
  },
};

export default App;
