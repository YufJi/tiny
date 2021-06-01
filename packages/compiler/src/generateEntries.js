const fs = require('fs-extra');
const path = require('path');
const { getPagesComponents } = require('./pageMap');
const { getPagesFromPackage, getImports } = require('./utils');

function getComponentImports(pages = [], baseDir, option) {
  return getImports(getPagesComponents(pages), baseDir, option);
}

const defaultInjectScriptAfterWorkerImportScripts = (bridgeName = 'mp') => `
var MP = self.MP;
self.getCurrentPages = MP.getCurrentPages;
self.getApp = MP.getApp;
self.Page = MP.Page;
self.App = MP.App;
self.${bridgeName} = MP.bridge;
self.Component = MP.Component;
self.Behavior = MP.Behavior;
self.$global = MP.$global;
self.requirePlugin = MP.requirePlugin;
`;

module.exports = function generateEntries({
  src, /* miniprogramRoot 小程序source目录 */
  appJson,
  importScripts,
  out,
  web,
  native,
  injectScript = '',
  injectScriptForNative,
  injectScriptAfterWorkerImportScripts,
  pluginInjection = '',
  transformConfig,
}) {
  injectScriptForNative = injectScriptForNative || defaultInjectScriptAfterWorkerImportScripts(transformConfig.bridgeName);
  injectScriptAfterWorkerImportScripts = injectScriptAfterWorkerImportScripts || defaultInjectScriptAfterWorkerImportScripts(transformConfig.bridgeName);
  const { app } = appJson;
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

  if (app.supportSjsHandler) {
    mpApp.supportSjsHandler = app.supportSjsHandler;
  }

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
g.mpAppJson = ${JSON.stringify(mpJson, null, 2)};
`;

  if (out) {
    fs.writeFileSync(path.join(out, 'config$.js'), configJs);
  }

  const configImport = 'require(\'./config$\');';
  const appImport = `require('${src}/app');`;
  const allComponentsRequires = getComponentImports(app.pages, src, {
    src,
    compileType: 'mini',
    type: 'component',
    transformConfig,
  });
  const index = [
    'require(\'compiler/sjsEnvInit\');',
    configImport,
    appImport,
    ...allComponentsRequires,
    ...pageImports,
    '',
  ];
  const indexJs = ['// for rn: index$.bundle', injectScript, '']
    .concat(index)
    .join('\n');
  if (native && out) {
    fs.writeFileSync(path.join(out, 'index$.js'), indexJs);
    fs.writeFileSync(
      path.join(out, 'index$.native.js'),
      `
      ${injectScriptForNative}

      require('./index$.js');`,
    );
  }
  const webIndex = [
    'require(\'compiler/sjsEnvInit\');',
    configImport,
    ...allComponentsRequires,
    ...pageImports,
    '',
  ];
  const indexWebJs = webIndex.join('\n');
  if (web && out) {
    fs.writeFileSync(path.join(out, 'index$.web.js'), indexWebJs);
  }

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
      if (web && out) {
        const rootDir = path.join(out, root);
        fs.mkdirsSync(rootDir);
        fs.writeFileSync(path.join(rootDir, 'index$.web.js'), packageIndexJs);
        fs.writeFileSync(
          path.join(rootDir, 'index$.worker.js'),
          packageIndexJs,
        );
      }
    });
  }

  const hasImportScripts = importScripts && importScripts.length;
  let importJs = `if(!self.Map || !self.Set || !self.Symbol) {
    importScripts('https://gw.alipayobjects.com/as/g/mp_release/deps/1.0.3/es6-set-map-symbol.js');
     }
     `;
  if (hasImportScripts) {
    importJs += importScripts.reduce((acc, script) => {
      acc += `importScripts(\`${script}\`);\n`;
      return acc;
    }, '');
  }
  const registerAppJson = `
if(MP.registerApp) {
  MP.registerApp({
    appJSON: mpAppJson,
  });
}
`;

  if (web && out) {
    fs.writeFileSync(path.join(out, 'importScripts$.js'), importJs);
  }

  const workerIndex = [
    'if(!self.__mpInited) {',
    'self.__mpInited = 1;',
    injectScript,
    configImport,
    hasImportScripts ? 'require(\'./importScripts$\');' : '',
    injectScriptAfterWorkerImportScripts,
    registerAppJson,
    pluginInjection,
    'function success() {',
    appImport,
    ...allComponentsRequires,
    ...pageImports,
    '}',
    'self.bootstrapApp ? self.bootstrapApp({ success }) : success();',
    '}',
  ];
  const indexWorkerJs = workerIndex.join('\n');
  if (web && out) {
    fs.writeFileSync(path.join(out, 'index$.worker.js'), indexWorkerJs);
  }

  return {
    packagesJs,
    indexJs,
    indexWebJs,
    indexWorkerJs,
    configJs,
    importJs,
  };
};
