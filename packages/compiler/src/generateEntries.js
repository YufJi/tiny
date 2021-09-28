const fs = require('fs-extra');
const path = require('path');
const { getPagesComponents } = require('./pageMap');
const { getPagesFromPackage, getImports } = require('./utils');

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

  const configImport = 'require(\'./config\');';

  const appImport = `require('${path.relative(temp, path.join(src, 'app'))}');`;

  const allComponentsRequires = getComponentImports(app.pages, src, {
    src,
    compileType: 'mini',
    type: 'component',
    transformConfig,
  });

  const webIndex = [
    'require(\'tiny-compiler/sjsEnvInit\');',
    configImport,
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
      const packagePages = getPagesFromPackage(mPackage);
      const slashMatch = root.match(/\//g);
      const slashCount = (slashMatch && slashMatch.length) || 0;
      const packageBaseDir = path.join(
        new Array(slashCount + 2).join('../'),
        src,
      );
      const packagePagesImports = getImports(packagePages, packageBaseDir, {
        src,
        compileType: 'mini',
        type: 'page',
        transformConfig,
      });
      const packageComponentsRequires = getComponentImports(
        packagePages,
        packageBaseDir,
        {
          src,
          compileType: 'mini',
          type: 'component',
          transformConfig,
        },
      );
      const packageIndexJs = [
        'function success(){',
        ...packageComponentsRequires,
        ...packagePagesImports,
        '}',
        `self.bootstrapSubPackage('${root}', {success});`,
      ].join('\n');
      packagesJs[root] = packageIndexJs;

      const rootDir = path.join(temp, root);
      fs.mkdirsSync(rootDir);
      fs.writeFileSync(path.join(rootDir, 'index.webview.js'), packageIndexJs);
      fs.writeFileSync(
        path.join(rootDir, 'index.service.js'),
        packageIndexJs,
      );
    });
  }

  return {
    packagesJs,
    indexWebJs,
    indexWorkerJs,
    configJs,
  };
};
