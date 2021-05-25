import qs from 'qs';
import getScene from '@/utils/getScene';
import log, { debug } from '@/utils/log';
import objectKeys from '@/utils/objectKeys';
import invokeWithGuardAndReThrow from '@/utils/invokeWithGuardAndReThrow';
import { getStartupParams } from '../startupParams';
import EventHub from '../EventHub';
import AppMixin from '../mixins/AppMixin';
import { setAppImpl } from '../utils/appImpl';
import { isTabPage } from '../utils/pageUtils';

let appImpl;
let app;

function pushPage(page) {
  let pages = getCurrentPagesImpl();
  if (!pages.length) {
    const tabPath = appImpl._currentTabPath = page.getPagePath();
    pages = appImpl._tabCaches[tabPath] = [];
  }
  pages.push(page);
}

function popPage(page) {
  const tabCaches = appImpl._tabCaches;
  objectKeys(tabCaches).forEach((k) => {
    const tabPages = tabCaches[k];
    if (tabPages) {
      for (let i = tabPages.length - 1; i >= 0; i -= 1) {
        if (tabPages[i] === page) {
          tabPages.splice(i, 1);
          return;
        }
      }
    }
  });
}

export function getApp() {
  return app;
}

export function App(publicInstance = {}) {
  if (appImpl) {
    throw new Error('App() can only be called once');
  }

  const { query, referrerInfo, pagePath } = getStartupParams();
  const launchOptions = {
    path: pagePath,
  };

  if (query) {
    launchOptions.query = qs.parse(query);
  }
  launchOptions.scene = getScene(getStartupParams());
  if (referrerInfo) {
    launchOptions.referrerInfo = JSON.parse(referrerInfo);
  }

  app = publicInstance;
  appImpl = new AppImpl(publicInstance);
  setAppImpl(appImpl);
  EventHub.emit('appCreated', appImpl);
  appImpl.launch(launchOptions);
  return app;
}

function AppImpl(publicInstance) {
  this._tabCaches = {};
  this._currentTabPath = '';
  this.publicInstance = publicInstance;
  // app status is unstable
  this.shown = true;
}

AppImpl.prototype = {
  ...AppMixin,
  pushPage,
  popPage,
  getAllPages() {
    let pages = [];
    const tabCaches = this._tabCaches;
    objectKeys(tabCaches).forEach((k) => {
      const tabPages = tabCaches[k];
      if (tabPages) {
        pages = pages.concat(tabPages);
      }
    });
    return pages;
  },
  isTabShow() {
    const tabCaches = appImpl._tabCaches;
    // filter destroyed/empty tabs
    const tabKeys = objectKeys(tabCaches).filter((k) => {
      return !!tabCaches[k].length;
    });
    if (!tabKeys.length) {
      return false;
    }
    // if all invalid tab page
    return tabKeys.every((k) => {
      return isTabPage(tabCaches[k][0]);
    });
  },
  clearAllPages() {
    const nowTabCaches = this._tabCaches;
    this._tabCaches = {};
    // clear tab caches and page stack
    objectKeys(nowTabCaches).forEach((k) => {
      const tabPages = nowTabCaches[k];
      if (tabPages) {
        tabPages.concat().reverse().forEach((page) => {
          return page.unload();
        });
      }
    });
    this._currentTabPath = '';
  },
  getPagesByTabPath(tabPath) {
    return this._tabCaches[tabPath] || [];
  },
  getPageById(id) {
    return this.getPageBy((page) => {
      return page.getId() === id;
    });
  },
  getPageObject(url) {
    const queryIndex = url.indexOf('?');
    let queryString = '';
    let pagePath = url;
    if (queryIndex !== -1) {
      queryString = url.slice(queryIndex + 1);
      pagePath = pagePath.slice(0, queryIndex);
    }
    if (pagePath.charAt(0) === '/') {
      pagePath = pagePath.slice(1);
    }
    return {
      queryString,
      pagePath,
    };
  },
  getPageBy(same) {
    const tabCaches = appImpl._tabCaches;
    for (const k in tabCaches) {
      if (tabCaches.hasOwnProperty(k)) {
        const tabPages = tabCaches[k];
        if (tabPages) {
          for (let i = tabPages.length - 1; i >= 0; i -= 1) {
            if (same(tabPages[i])) {
              return tabPages[i];
            }
          }
        }
      }
    }
    return null;
  },
  launch(options = {}) {
    this.$launchTime = Date.now();
    this.launchOptions = options;
    EventHub.emit('launch', options);
    debug('framework', 'App onLaunch');
    const { publicInstance } = this;
    const { onLaunch } = publicInstance;
    const { onShow } = publicInstance;

    invokeWithGuardAndReThrow(onLaunch, publicInstance, options);
    invokeWithGuardAndReThrow(onShow, publicInstance, options);
    this.shown = true;
  },
  hide(hidePage = true) {
    this.shown = false;
    EventHub.emit('background');
    debug('framework', 'App onHide');
    if (hidePage) {
      const page = getCurrentPageImpl();
      if (page) {
        page.hide();
      }
    }
    invokeWithGuardAndReThrow(this.publicInstance.onHide, this.publicInstance);
  },
  show(o, showPage = true) {
    this.shown = true;
    const options = o || {};
    debug('framework', 'App onShow');
    EventHub.emit('foreground', options);
    const prePage = getCurrentPageImpl();
    invokeWithGuardAndReThrow(this.publicInstance.onShow, this.publicInstance, options);
    // if relaunch, do not invoke previous page show
    if (showPage && !options.path) {
      const page = getCurrentPageImpl();
      if (page && page === prePage) {
        page.show();
      }
    }
  },
  error(e) {
    invokeWithGuardAndReThrow(this.publicInstance.onError, this.publicInstance, e);
  },
  navigateBack(params = {}, fn) {
    let { delta = 1 } = params;

    if (typeof delta !== 'number') {
      return 'delta must be number!';
    }
    const pages = this.getCurrentPagesImpl();
    const len = pages.length;
    if (len === 1) {
      return 'already top of navigation';
    }
    if (delta >= len) {
      delta = len - 1;
    }
    fn({ delta });
  },

  setCurrentPagesImpl(pages, _tabPath) {
    let tabPath = _tabPath || this._currentTabPath;
    if (pages.length) {
      tabPath = pages[0].getPagePath();
    }
    this._currentTabPath = tabPath;
    this._tabCaches[tabPath] = pages;
  },

  getCurrentPagesImpl,

  getCurrentPageImpl,
};

// remove from page stack
EventHub.addListener('pageUnload', ({ page }) => {
  popPage(page);
});

const empty = [];

export function getCurrentPagesImpl() {
  if (!appImpl) {
    return [];
  }
  const tabCaches = appImpl._tabCaches;
  const currentTabPath = appImpl._currentTabPath;
  if (!currentTabPath) {
    return empty;
  }
  tabCaches[currentTabPath] = tabCaches[currentTabPath] || [];
  return tabCaches[currentTabPath];
}

export function getCurrentPageImpl() {
  const pages = getCurrentPagesImpl();
  return pages[pages.length - 1];
}

export function getCurrentPages() {
  return getCurrentPagesImpl().map((p) => {
    return p.publicInstance;
  });
}

export function getAppImpl() {
  return appImpl;
}
