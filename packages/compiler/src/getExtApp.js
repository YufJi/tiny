const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const {
  safeJsonParse,
  getAllPagesFromAppJson,
  cleanSubPackagesJson,
} = require('./utils');

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

function getPluginsConfig(appJson) {
  const allPluginsConfig = [];
  if (appJson.plugins) {
    allPluginsConfig.push(appJson.plugins);
  }
  if (appJson.subPackages) {
    appJson.subPackages.forEach((sub) => {
      if (sub.plugins) {
        allPluginsConfig.push(sub.plugins);
      }
    });
  }
  return allPluginsConfig;
}

function checkPlugins(appJson) {
  const providers = {};
  const allPlugins = {};

  getPluginsConfig(appJson).forEach((plugins) => {
    Object.keys(plugins).forEach((key) => {
      if (allPlugins[key]) {
        throw new Error(`plugin ${key} 出现了多次!`);
      }
      allPlugins[key] = 1;
      const { provider } = plugins[key];
      if (!provider) {
        throw new Error(`plugin ${key} provider 不能为空!`);
      }

      if (providers[provider]) {
        throw new Error(`provider ${provider} 不能多次引用!`);
      }
      providers[provider] = 1;
    });
  });
}

function parseAppJSON(filePath, variables = {}) {
  /* 读取app.json */
  const appJson = safeJsonParse(filePath);
  /* 序列化写入变量 */
  const compiled = _.template(JSON.stringify(appJson))(variables);
  /* 反序列化 */
  return JSON.parse(compiled);
}

let extApp = {};

module.exports = function getExtApp({
  src,
  mergeSubPackages,
  checkConfig,
  variables,
}) {
  /* app.json路径 */
  const appPath = path.join(src, 'app.json');
  /* 写入变量 */
  const app = parseAppJSON(appPath, variables);

  if (checkConfig) {
    checkPlugins(app);
  }

  if (app.subPackages) {
    cleanSubPackagesJson(app.subPackages);
  }

  if (app.subPackages) {
    app.allPages = getAllPagesFromAppJson(app);
    if (mergeSubPackages) {
      app.pages = app.allPages;
      delete app.subPackages;
      delete app.preloadRule;
    }
  } else {
    app.allPages = app.pages;
  }

  /* 小程序应用下额外配置文件 */
  const extPath = path.join(src, 'ext.json');
  let ext = {};
  if (fs.existsSync(extPath)) {
    ext = safeJsonParse(extPath);
  }
  if (!ext.extEnable) {
    ext = {};
  }

  Object.keys(ext).forEach((k) => {
    /* 如果属性不是ext */
    if (!k.match(/ext[A-Z\d]/)) {
      app[k] = ext[k];
    }
  });
  extApp = app;
  return {
    app,
    ext,
  };
};

module.exports.getCachedExtApp = function getCachedExtApp() {
  return extApp;
};
