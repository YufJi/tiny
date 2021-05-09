const path = require('path');
const fs = require('fs-extra');
const {
  transformColorConfig,
  cleanPageJson,
  safeJsonParse,
} = require('./utils');
const generateMultiLanguageAppConfigJson = require('./generateMultiLanguageAppConfigJson');

module.exports = function g({ appJson, out, src, transformColor }) {
  const webConfig = {};
  if (appJson.includeFiles) {
    webConfig.includeFiles = appJson.includeFiles;
  }
  const launchParams = {};
  (appJson.pages || []).forEach((p) => {
    const fullPath = path.join(src, p);
    const pageConfigPath = `${fullPath}.json`;
    let pageJson;
    if (fs.existsSync(pageConfigPath)) {
      pageJson = safeJsonParse(pageConfigPath);
    }
    launchParams[p] = cleanPageJson(
      transformColor !== false ? transformColorConfig(pageJson) : pageJson,
    );
    if (launchParams[p]) {
      delete launchParams[p].allowEval;
    }
  });
  if (appJson.pages && appJson.pages.length) {
    webConfig.pages = appJson.pages;
  }
  webConfig.launchParams = launchParams;
  if (out) {
    // fs.writeFileSync(path.join(out, 'app_.json'), JSON.stringify(getExtApp(src).app, null, 2));
    fs.ensureDirSync(out);
    fs.writeFileSync(
      path.join(out, 'appConfig.json'),
      JSON.stringify(webConfig, null, 2),
    );
    generateMultiLanguageAppConfigJson({ app: webConfig, src }, out);
  }
  return {
    webConfig,
  };
};
