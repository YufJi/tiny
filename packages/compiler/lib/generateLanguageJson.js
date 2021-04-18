module.exports = function generateLanguageJson(app, tabBar, locale) {
  let res;
  if (locale) {
    let tempApp;
    let tempTabBar;
    const { window = {}, tabBar: localeTabBar = {}, pages = {} } = locale;
    if (window.defaultTitle) {
      tempApp = tempApp || JSON.parse(JSON.stringify(app));
      tempApp.window.defaultTitle = window.defaultTitle;
      Object.keys(tempApp.launchParams).forEach((pagePath) => {
        if (tempApp.launchParams[pagePath]) {
          tempApp.launchParams[pagePath].defaultTitle = window.defaultTitle;
        }
      });
    }

    Object.keys(pages).forEach((pagePath) => {
      if (pages[pagePath] && pages[pagePath].defaultTitle) {
        tempApp = tempApp || JSON.parse(JSON.stringify(app));
        if (tempApp.launchParams[pagePath] && pages[pagePath]) {
          tempApp.launchParams[pagePath].defaultTitle = pages[pagePath].defaultTitle;
        }
      }
    });

    if (Array.isArray(localeTabBar.items) && Array.isArray(tabBar.items)) {
      localeTabBar.items.forEach((item, index) => {
        if (tabBar.items[index] && item.name) {
          tempTabBar = tempTabBar || JSON.parse(JSON.stringify(tabBar));
          tempTabBar.items[index].name = item.name;
        }
      });
    }
    if (tempApp) {
      res = res || {};
      res.app = tempApp;
    }
    if (tempTabBar) {
      res = res || {};
      res.tabBar = tempTabBar;
    }
  }
  return res;
};
