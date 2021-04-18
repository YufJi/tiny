const fs = require('fs-extra');
const path = require('path');
const { safeJsonParse } = require('./utils');
const generateLanguageJson = require('./generateLanguageJson');

// https://yuque.antfin-inc.com/docs/share/f4cab0ee-e622-4512-bed5-7d04a09bac92#
const supportLanguage = ['zh-Hans', 'zh-Hant', 'zh-HK', 'en'];

module.exports = function generateMultiLanguageAppConfigJson(
  { app, src, tabBar },
  out,
) {
  const localeDir = path.join(src, 'locale');
  if (!fs.existsSync(localeDir)) {
    return;
  }
  supportLanguage.forEach((lan) => {
    const lanAppJsonPath = path.join(localeDir, lan, 'app.json');
    if (fs.existsSync(lanAppJsonPath)) {
      const appJson = generateLanguageJson(
        app,
        tabBar,
        safeJsonParse(lanAppJsonPath),
      );
      if (out) {
        const outDir = path.join(out, lan);
        fs.mkdirsSync(outDir);
        if (appJson.app) {
          fs.writeFileSync(
            path.join(outDir, 'appConfig.json'),
            JSON.stringify(appJson.app, null, 2),
          );
        }
        if (appJson.tabBar) {
          fs.writeFileSync(
            path.join(outDir, 'tabBar.json'),
            JSON.stringify(appJson.tabBar, null, 2),
          );
        }
      }
    }
  });
};
