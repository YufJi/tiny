const fs = require('fs-extra');
const path = require('path');
const { getImports, getImport } = require('./utils');
const { getPluginComponents } = require('./pageMap');

function getComponentImports(
  pages = [],
  publicComponents = [],
  baseDir,
  option,
) {
  return getImports(
    getPluginComponents(pages, publicComponents),
    baseDir,
    option,
  );
}

function getMainRequire(mainJs, baseDir) {
  if (!mainJs) {
    return '';
  }
  return `function() {return ${getImport(mainJs, baseDir)}}`;
}

module.exports = function generatePluginEntries({
  src, // pluginRoot 插件根目录

  appJson,
  out,
  web,
  baseDir = '.',
  pluginId,
}) {
  const pageImports = getImports(appJson.pages, baseDir, {
    src,

    compileType: 'plugin',
    type: 'page',
  });
  const allComponentsRequires = getComponentImports(
    appJson.pages,
    Object.values(appJson.publicComponents || {}),
    baseDir,
    {
      src,

      compileType: 'plugin',
      type: 'component',
    },
  );
  const pluginJson = {};
  if (appJson.publicComponents) {
    pluginJson.publicComponents = appJson.publicComponents;
  }
  if (appJson.publicPages) {
    pluginJson.publicPages = appJson.publicPages;
  }
  const configJs = `
const g = typeof global !== 'undefined' ? global : self;
g.mpPluginsConfig = g.mpPluginsConfig || {};
g.mpPluginsConfig['${pluginId}'] = ${JSON.stringify(pluginJson, null, 2)};
`;
  const webIndex = [configJs, ...allComponentsRequires, ...pageImports, ''];
  const indexWebJs = webIndex.join('\n');
  if (web && out) {
    fs.ensureDirSync(out);
    fs.writeFileSync(path.join(out, 'index$.web.js'), indexWebJs);
  }

  const mainRequire = getMainRequire(appJson.main, baseDir);

  const workerIndex = [
    `MP.Plugin({ config: ${JSON.stringify(pluginJson, null, 2)},`,
    mainRequire ? `mod: ${mainRequire},` : '',
    'run: function(){',
    ...allComponentsRequires,
    ...pageImports,
    '},',
    '});',
  ];
  const indexWorkerJs = workerIndex.join('\n');
  if (web && out) {
    fs.writeFileSync(path.join(out, 'index$.worker.js'), indexWorkerJs);
  }
  return {
    indexWorkerJs,
    indexWebJs,
  };
};
