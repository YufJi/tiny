const fs = require('fs');
const path = require('path');
const { transformColorConfig, cleanPageJson } = require('./utils');
const generateMultiLanguageAppConfigJson = require('./generateMultiLanguageAppConfigJson');

module.exports = function generateAppConfigJson({
  appJson,
  src,
  contextPath,
  transformConfig,
}) {
  const { temp } = transformConfig;
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
    (app.tabBar.list || []).forEach((t) => {
      delete t.id;
      t.tag = t.pagePath;
      delete t.pagePath;

      if (t.iconPath) {
        t.iconPath = contextPath ? `${contextPath}/${t.iconPath}` : path.join(src, t.iconPath).replace(src, '');
      }
      if (t.selectedIconPath) {
        t.selectedIconPath = contextPath ? `${contextPath}/${t.selectedIconPath}` : path.join(src, t.selectedIconPath).replace(src, '');
      }

      t.launchParamsTag = t.tag;
    });

    webConfig.tabBar = app.tabBar;
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

  fs.writeFileSync(
    path.join(temp, 'appConfig.json'),
    JSON.stringify(webConfig, null, 2),
  );

  generateMultiLanguageAppConfigJson({
    app: webConfig,
    tabBar: app.tabBar,
    src,
  }, temp);

  return {
    webConfig,
    tabBarConfig: app.tabBar,
  };
};
