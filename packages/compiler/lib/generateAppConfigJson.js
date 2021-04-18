const fs = require('fs');
const path = require('path');
const { transformColorConfig, cleanPageJson } = require('./utils');
const generateMultiLanguageAppConfigJson = require('./generateMultiLanguageAppConfigJson');

const { assign } = Object;
// for android service worker
const manifestJson = {
  gcm_sender_id: 'my_gcm_sender_id',
  gcm_user_visible_only: true,
};

module.exports = function g({ appJson, out, src, indexPage, contextPath }) {
  const { app } = appJson;
  const appWindowConfig = app.window;
  const webConfig = {};
  if (appWindowConfig) {
    webConfig.window = appWindowConfig;
  }
  if (app.includeFiles) {
    webConfig.includeFiles = app.includeFiles;
  }
  if (app.tabBar) {
    app.tabBar = transformColorConfig(app.tabBar);
    (app.tabBar.items || []).forEach((t) => {
      delete t.id;
      t.tag = t.pagePath;
      t.url = `${indexPage}#${t.tag}`;
      delete t.pagePath;
      if (contextPath !== undefined) {
        if (t.icon) {
          if (t.icon.startsWith('/')) {
            t.icon = t.icon.slice(1);
          }
          t.icon = `${contextPath}/${t.icon}`;
        }
        if (t.activeIcon) {
          if (t.activeIcon.startsWith('/')) {
            t.activeIcon = t.activeIcon.slice(1);
          }
          t.activeIcon = `${contextPath}/${t.activeIcon}`;
        }
      }
      t.launchParamsTag = t.tag;
    });
    // webConfig.tabBar = app.tabBar;
    app.tabBar.disableOnInit = true;
    if (out) {
      fs.writeFileSync(
        path.join(out, 'tabBar.json'),
        JSON.stringify(app.tabBar, null, 2),
      );
    }
  }
  const launchParams = {};
  Object.keys(appJson).forEach((page) => {
    if (page !== 'app' && appJson[page]) {
      launchParams[page] = cleanPageJson(
        transformColorConfig({ ...appWindowConfig, ...appJson[page] }),
      );
    }
  });
  (app.allPages || []).forEach((p) => {
    if (!launchParams[p] && appWindowConfig) {
      launchParams[p] = appWindowConfig;
    }
    if (launchParams[p]) {
      delete launchParams[p].allowEval;
    }
  });
  if (app.pages && app.pages.length) {
    webConfig.pages = app.pages;
  }
  if (app.subPackages) {
    webConfig.subPackages = app.subPackages;
  }
  if (app.preloadRule) {
    webConfig.preloadRule = app.preloadRule;
  }
  if (app.plugins) {
    webConfig.plugins = app.plugins;
  }
  if (app.useDynamicPlugins) {
    webConfig.useDynamicPlugins = app.useDynamicPlugins;
  }
  webConfig.launchParams = launchParams;
  if (indexPage) {
    webConfig.prerenderPage = indexPage;
  }
  if (out) {
    // fs.writeFileSync(path.join(out, 'app_.json'), JSON.stringify(getExtApp(src).app, null, 2));
    fs.writeFileSync(
      path.join(out, 'appConfig.json'),
      JSON.stringify(webConfig, null, 2),
    );
    fs.writeFileSync(
      path.join(out, 'manifest.json'),
      JSON.stringify(manifestJson, null, 2),
    );
    generateMultiLanguageAppConfigJson(
      { app: webConfig, tabBar: app.tabBar, src },
      out,
    );
  }
  return {
    webConfig,
    manifestJson,
  };
};
