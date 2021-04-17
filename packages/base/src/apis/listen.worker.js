
import qs from 'query-string';
import { $global } from '@/core/framework/';
import { getAppImpl } from '@/core/framework/App';
import EventHub from '@/core/framework/EventHub';
import getScene from '@/utils/getScene';
import isMiniAppPage from '@/utils/isMiniAppPage';
import { getStartupParams } from '@/core/framework/startupParams';
import gerror from '@/utils/gerror';

const g = self;

export default function listen(ap, bridge) {
  const isCli = getStartupParams().mpCli;
  if (!isCli) {
    const _self = self;
    const { mpAppJson } = _self;

    const preloadRule = mpAppJson && mpAppJson.app.preloadRule;
    if (preloadRule) {
      EventHub.addListener('pageLoad', ({ page }) => {
        const pagePath = page.getPagePath();
        const rule = preloadRule[pagePath];
        if (rule) {
          bridge.call('loadSubPackage', rule);
        }
      });
    }
  }
  
  ap.on('appResume', (e) => {
    let { query, page, referrerInfo, shouldNotReLaunch, NBPageUrl } = e.data;

    let options = {};
    let pageName;
    if (page) {
      if (page.charAt(0) === '/') {
        page = page.slice(1);
      }
      pageName = page;
      const index = page.indexOf('?');
      if (index !== -1) {
        pageName = page.slice(0, index);
      }
      options.path = pageName;
      if (!$global.pagesConfig[pageName]) {
        ap.call('toast', {
          content: '页面已失效!',
          type: 'exception',
        });
        const _e = new Error(`Page ${pageName} Not Found when appResume`);
        gerror(_e);
        query = null;
        page = null;
        options = {};
      }
    }
    if (query) {
      query = qs.parse(query);
      options.query = query;
    }
    if (referrerInfo) {
      options.referrerInfo = JSON.parse(referrerInfo);
    }
    options.scene = getScene(e.data);
    getAppImpl().show(options, isMiniAppPage(NBPageUrl));
    if (shouldNotReLaunch) {
      getAppImpl().clearAllPages();
    } else if (options.path) {
      if (page.charAt(0) !== '/') {
        page = `/${page}`;
      }
      bridge.reLaunch({
        url: page,
      });
    }
  });

  function hideApp(hidePage) {
    getAppImpl().hide(hidePage);
  }
  ap.on('appPause', (e) => {
    const { NBPageUrl } = e.data;

    hideApp(isMiniAppPage(NBPageUrl));
  });

  ap.on('beforeDestroy', (e) => {
    const { NBPageUrl } = e.data;

    if (!isMiniAppPage(NBPageUrl)) {
      return;
    }
    const app = getAppImpl();
    if (app) {
      app.destroyPageByUrl(NBPageUrl);
    }
  });

  ap.on('pagePause', (e) => {
    const { NBPageUrl } = e.data;

    if (!isMiniAppPage(NBPageUrl)) {
      return;
    }
    getAppImpl().pausePageByUrl(NBPageUrl);
  });

  ap.on('pageResume', (e) => {
    const { NBPageUrl } = e.data;

    if (!isMiniAppPage(NBPageUrl)) {
      return;
    }
    getAppImpl().resumePageByUrl(NBPageUrl);
  });
  
  ap.on('tabClick', (e) => {
    const { tag, from = 'user', text, index } = e.data;

    getAppImpl().switchTab({
      url: `/${tag}`,
      from,
      pagePath: tag,
      text,
      index,
    });
  });
}
