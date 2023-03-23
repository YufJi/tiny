const fs = require('fs-extra');
const path = require('path');
const { getPagesComponents } = require('./pageMap');
const { getPagesFromPackage, getImports, normalizePathForWin } = require('./utils');

function getComponentImports(pages = [], baseDir, option) {
  return getImports(getPagesComponents(pages), baseDir, option);
}

module.exports = function generateEntries({
  src, /* miniprogramRoot 小程序source目录 */
  appJson,
  transformConfig,
}) {
  const { app } = appJson;
  const { temp } = transformConfig;
  /* 获取页面入口 */
  const pageImports = getImports(app.pages, src, {
    src,
    compileType: 'mini',
    type: 'page',
    transformConfig,
  });

  const defaultWindow = (app && app.window) || {};

  const mpJson = {
    app: {
      $homepage: app.pages[0],
    },
  };

  const mpApp = mpJson.app;

  if (app.useDynamicPlugins) {
    mpApp.useDynamicPlugins = app.useDynamicPlugins;
  }

  if (app.plugins) {
    mpApp.plugins = app.plugins;
  }

  if (app.subPackages) {
    mpApp.subPackages = app.subPackages;
  }

  if (app.preloadRule) {
    mpApp.preloadRule = app.preloadRule;
  }

  if (defaultWindow.optionMenu) {
    mpApp.window = mpApp.window || {};
    mpApp.window.optionMenu = defaultWindow.optionMenu;
  }

  Object.keys(appJson).forEach((k) => {
    if (k === 'app') {
      mpApp.ext = app.ext;
    } else {
      const optionMenu = appJson[k] && appJson[k].optionMenu;
      if (optionMenu) {
        mpJson[k] = { optionMenu };
      }
    }
  });

  const configJs = `
const g = typeof global !== 'undefined' ? global : self;
const appConfig = require('./appConfig.json');
g.TinyConfig = appConfig;
`;

  fs.writeFileSync(path.join(temp, 'config.js'), configJs);

  const sjsEnvInitImport = 'require(\'tiny-compiler/sjsEnvInit\');';

  const configImport = 'require(\'./config\');';

  const appImport = `require('${normalizePathForWin(
    path.relative(temp, path.join(src, 'app')),
  )}');`;

  const allComponentsRequires = getComponentImports(app.pages, src, {
    src,
    compileType: 'mini',
    type: 'component',
    transformConfig,
  });

  const webIndex = [
    sjsEnvInitImport,
    ...allComponentsRequires,
    ...pageImports,
    '',
  ];
  const indexWebJs = webIndex.join('\n');

  fs.writeFileSync(path.join(temp, 'index.webview.js'), indexWebJs);

  const workerIndex = [
    'if(!self.__TinyInited__) {',
    'self.__TinyInited__ = true;',
    configImport,
    'function success() {',
    appImport,
    ...allComponentsRequires,
    ...pageImports,
    '}',
    'success();',
    '}',
  ];
  const indexWorkerJs = workerIndex.join('\n');

  fs.writeFileSync(path.join(temp, 'index.service.js'), indexWorkerJs);

  const packagesJs = {};
  if (app.subPackages) {
    app.subPackages.forEach((mPackage) => {
      const { root } = mPackage;
      if (/^[\.\/]/.test(root)) {
        throw new Error('app.json中subPackages的root不应该以 \'/\' 或 \'.\' 开头');
      }

      const subPackageDir = path.join(temp, root);

      const packagePages = getPagesFromPackage(mPackage);

      const packagePagesImports = getImports(packagePages, src, {
        src,
        compileType: 'mini',
        type: 'page',
        transformConfig,
        from: subPackageDir,
      });

      const packageComponentsRequires = getComponentImports(packagePages, src, {
        src,
        compileType: 'mini',
        type: 'component',
        transformConfig,
        from: subPackageDir,
      });
      const packageIndexWebJs = [
        sjsEnvInitImport,
        ...packageComponentsRequires,
        ...packagePagesImports,
      ].join('\n');

      const packageIndexWorkerJs = [
        'function success(){',
        ...packageComponentsRequires,
        ...packagePagesImports,
        '}',
        'success();',
      ].join('\n');

      packagesJs[root] = {
        web: packageIndexWebJs,
        worker: packageIndexWorkerJs,
      };

      fs.mkdirsSync(subPackageDir);
      fs.writeFileSync(path.join(subPackageDir, 'index.webview.js'), packageIndexWebJs);
      fs.writeFileSync(path.join(subPackageDir, 'index.service.js'), packageIndexWorkerJs);
    });
  }

  return {
    packagesJs,
    indexWebJs,
    indexWorkerJs,
    configJs,
  };
};
