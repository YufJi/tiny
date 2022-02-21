const path = require('path');
const { existsSync } = require('fs');
const {
  PLUGIN_PREFIX,
  PLUGIN_PRIVATE_PREFIX,
  getPluginPath,
} = require('./pluginUtils');
const { relative, normalizePathForWin } = require('./utils');

function wrapRegisterPage(pageMetaConfig, code, config) {
  return `
    $global.currentPageConfig = ${pageMetaConfig};

    ${code}
  `;
}

function transformPageJsForWorker(str, pagePath, config) {
  const filename = path.basename(pagePath);
  const { tabIndex, usingComponents, templateExtname } = config;
  const info = `
    {
      is: '${pagePath}',
      ${usingComponents ? `usingComponents: ${JSON.stringify(usingComponents)},` : ''}
      ${tabIndex !== -1 ? `tabIndex: ${tabIndex},` : ''}
    }
  `;

  return wrapRegisterPage(info, str, config);
}

function transformPageJsForWebRender(name, config) {
  const {
    resourceQuery = '',
    templateExtname,
    styleTransformer,
    fullPath,
    pluginId,
    usingComponents,
  } = config;
  const filename = path.basename(name);
  const xmlPath = path.join(
    path.dirname(fullPath),
    `./${filename}${config.templateExtname}`,
  );
  if (!existsSync(xmlPath)) {
    throw new Error(`can not find ${xmlPath}`);
  }
  const pagePath = pluginId ? getPluginPath(pluginId, name) : name;

  const info = `{
      ${usingComponents
    ? `usingComponents: ${JSON.stringify(transformUsingComponents({
      usingComponents,
      pluginId,
    }))},`
    : ''}
      ${config.tabIndex !== -1 ? `tabIndex: ${config.tabIndex},` : ''}
      get render() {
        const fn = require('./${filename}${templateExtname}${resourceQuery}')
        return fn.default || fn;
      },
      ${styleTransformer && fullPath ? `get stylesheet() { 
        const fn = require('${normalizePathForWin(relative(fullPath, styleTransformer.config.stylePath))}${resourceQuery}'); 
        return fn.default || fn; 
      },` : 'get stylesheet() { return \'\' }'}
    }`;

  return `
    window.app = window.app || {};
    window.app['${pagePath}'] = ${info};

    window['generateFunc'] = window['generateFunc'] || {}
    window['generateFunc']['${pagePath}'] = function(webviewId) {
      document.dispatchEvent(new CustomEvent("generateFuncReady", {
        detail: {
          webviewId,
          generateFunc: window.app['${pagePath}'],
        }
      }))
    };
  `;
}

function transformUsingComponents({ usingComponents = {}, pluginId }) {
  return Object.keys(usingComponents).reduce(
    (a, c) => ({
      ...a,
      [c]:
        pluginId
        && !usingComponents[c].startsWith(PLUGIN_PREFIX)
        && !usingComponents[c].startsWith(PLUGIN_PRIVATE_PREFIX)
          ? getPluginPath(pluginId, usingComponents[c].slice(1))
          : usingComponents[c],
    }),
    {},
  );
}

function transformComponentJsForWorker(str, { is, usingComponents }, config) {
  const { templateExtname } = config;
  const filename = path.basename(is);
  const info = `
{
  is: ${JSON.stringify(is)},
  ${
  usingComponents
    ? `usingComponents: ${JSON.stringify(usingComponents)},`
    : ''
}
}`;
  return `
$global.currentPageConfig = ${info};

${str}
  `;
}

function transformComponentJsForWebRender({ is, usingComponents }, config) {
  const {
    resourceQuery = '',
    styleExtname,
    templateExtname,
    pluginId,
    fullPath,
  } = config;
  const filename = path.basename(is);
  const xmlPath = path.join(
    path.dirname(fullPath),
    `./${filename}${templateExtname}`,
  );
  const cssPath = path.join(
    path.dirname(fullPath),
    `./${filename}${styleExtname}`,
  );

  if (!existsSync(xmlPath)) {
    throw new Error(`can not find ${xmlPath}`);
  }

  is = pluginId ? getPluginPath(pluginId, is.slice(1)) : is;
  const cssExists = existsSync(cssPath);

  const info = `{
    usingComponents: ${JSON.stringify(transformUsingComponents({ usingComponents, pluginId }))},
    get render() { 
      const fn = require('./${filename}${templateExtname}${resourceQuery}'); 
      return fn.default || fn;
    },
    ${cssExists ? `get stylesheet() {
      const fn = require('./${filename}${styleExtname}'); 
      return fn.default || fn;
    }` : 'get stylesheet() { return \'\' }'}
  }`;

  return `
    window.app = window.app || {};
    window.app['${is}'] = ${info};
  `;
}

/* 处理普通js文件 */
function transformJsForWorker(str, config) {
  return `
    ${str}    
  `;
}

/* 处理worker app.js */
function transformAppJs(str, config) {
  return `
    ${str}
  `;
}

module.exports = {
  transformComponentJsForWebRender,
  transformComponentJsForWorker,
  transformPageJsForWebRender,
  transformPageJsForWorker,
  transformAppJs,
  transformJsForWorker,
};
