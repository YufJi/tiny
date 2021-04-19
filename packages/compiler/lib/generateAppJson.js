const fs = require('fs-extra');
const path = require('path');
const assign = require('object-assign');
const {
  transformColorConfig,
  cleanPageJson,
  safeJsonParse,
} = require('./utils');
const getExtApp = require('./getExtApp');
const { findTabIndex, update } = require('./pageMap');

module.exports = function g({
  src,
  out,
  transformColor,
  mergeSubPackages,
  variables,
  transformConfig,
}) {
  /* 存储相关配置usingComponents，tabBar */
  update({ src, mergeSubPackages,  variables, transformConfig });

  const appJson = {};
  const { app, ext } = getExtApp({
    src,
    mergeSubPackages,
    checkConfig: true,
    variables,
  });
  const { extPages = {} } = ext;

  /* 忽略 */
  if (transformColor !== false) {
    app.window = transformColorConfig(app.window);
    if (app.tabBar) {
      app.tabBar = transformColorConfig(app.tabBar);
    }
  }

  if (app.tabBar) {
    const { list } = app.tabBar;
    if (Array.isArray(list)) {
      /* 增加id属性， tabBar的id从 10 开始 */
      app.tabBar.list = list.map((t) => assign(
        {
          id: findTabIndex(t.pagePath),
        },
        t,
      ));
    }
  }

  appJson.app = app;

  (app.allPages || []).forEach((pageName) => {
    const fullPath = path.join(src, pageName);
    const pageConfigPath = `${fullPath}.json`;
    let pageJson = extPages[pageName];
    if (!pageJson && fs.existsSync(pageConfigPath)) {
      pageJson = safeJsonParse(pageConfigPath);
    }

    /* 清除配置中usingComponents */
    appJson[pageName] = cleanPageJson(
      transformColor !== false ? transformColorConfig(pageJson) : pageJson,
    );
  });

  if (out) {
    const writeData = JSON.parse(JSON.stringify(appJson));

    delete writeData.app.allPages;

    fs.writeFileSync(
      path.join(out, 'app.json'),
      JSON.stringify(writeData, null, 2),
    );
  }

  return appJson;
};
