
const path = require('path');
const { existsSync } = require('fs');
const defaultLib = require('./defaultLib');
const {
  PLUGIN_PREFIX,
  PLUGIN_PRIVATE_PREFIX,
  getPluginPath,
} = require('./pluginUtils');
const { relative, normalizePathForWin, getSecurityHeader } = require('./utils');

function getPageRenderHeader(config) {
  const { library = defaultLib.tinyBaseModule } = config;
  return `const { Page } = ${library};\n`
}

function getAppRenderHeader(config) {
  const { library = defaultLib.tinyBaseModule } = config;
  return `const { App } = ${library};\n`
}

function getComponentRenderHeader(config) {
  const { library = defaultLib.tinyBaseModule } = config;
  return [
    `const { Component: $Component } = ${library};`,
    '',
    'var Component = $Component || function(){};',
  ].join('\n');
}

function wrapRegisterPage(pageMetaConfig, code, config) {
  return `
${getSecurityHeader(config.forbiddenGlobals)}

$global.currentPageConfig = ${pageMetaConfig};

${code}
`;
}

function transformPageJs(str, name, config) {
  const { templateExtname, styleTransformer, fullPath } = config;
  const filename = path.basename(name);
  const xmlPath = path.join(
    path.dirname(fullPath),
    `./${filename}${templateExtname}`,
  );
  if (!existsSync(xmlPath)) {
    throw new Error(`can not find ${xmlPath}`);
  }
  const info = `
{
  pagePath: '${name}',
  ${config.tabIndex !== -1 ? `tabIndex: ${config.tabIndex},` : ''}
  render: function() { return require('./${filename}${templateExtname}'); },
  ${
  styleTransformer && fullPath
    ? `stylesheet: function() { return require('${normalizePathForWin(
      relative(fullPath, styleTransformer.config.stylePath),
    )}'); },`
    : ''
}
}`;
  return wrapRegisterPage(info, str, config);
}

function transformPageJsForWorker(str, pagePath, config) {
  const filename = path.basename(pagePath);
  const { tabIndex, usingComponents, templateExtname } = config;
  const info = `
{
  pagePath: '${pagePath}',
  ${
  usingComponents
    ? `usingComponents: ${JSON.stringify(usingComponents)},`
    : ''
  }
  ${tabIndex !== -1 ? `tabIndex: ${tabIndex},` : ''}
}`;

  return wrapRegisterPage(info, str, config);
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
${getSecurityHeader(config.forbiddenGlobals)}

$global.currentComponentConfig = ${info};

${str}
  `;
}

function transformComponentJs(
  str,
  { is, usingComponents, registerApp },
  config,
) {
  const filename = path.basename(is);
  const xmlPath = path.join(
    path.dirname(config.fullPath),
    `./${filename}${config.templateExtname}`,
  );
  if (!existsSync(xmlPath)) {
    throw new Error(`can not find ${xmlPath}`);
  }
  const cConfig = `
{
  is: ${JSON.stringify(is)},
  ${registerApp ? 'registerApp: 1,' : ''}
  usingComponents: ${JSON.stringify(usingComponents)},
  render: function() { return require('./${filename}${
  config.templateExtname
}'); },
}
`;
  return `
${getSecurityHeader(config.forbiddenGlobals)}

$global.currentComponentConfig = ${cConfig};

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
  if (!existsSync(xmlPath)) {
    throw new Error(`can not find ${xmlPath}`);
  }
  is = pluginId ? getPluginPath(pluginId, is.slice(1)) : is;
  let cssExists = false;

  const info = `
{
  is: ${JSON.stringify(is)},
  usingComponents: ${JSON.stringify(
    transformUsingComponents({ usingComponents, pluginId }),
  )},
  render: function() { return require('./${filename}${templateExtname}${resourceQuery}'); },
  ${
  cssExists
    ? `stylesheet: function() { return require('./${filename}${styleExtname}'); },`
    : ''
}
}`;
  return `
${getComponentRenderHeader(config)}

Component(${info});
`;
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
  // es5 for node_modules
  const info = `
{
  pagePath: '${pagePath}',
  ${
  usingComponents
    ? `usingComponents: ${JSON.stringify(
      transformUsingComponents({
        usingComponents,
        pluginId,
      }),
    )},`
    : ''
}
  ${config.tabIndex !== -1 ? `tabIndex: ${config.tabIndex},` : ''}
  render: function() { return require('./${filename}${templateExtname}${resourceQuery}'); },
  ${
  styleTransformer && fullPath
    ? `stylesheet: function() { return require('${normalizePathForWin(
      relative(fullPath, styleTransformer.config.stylePath),
    )}${resourceQuery}'); },`
    : ''
}
}`;
  return `
${getPageRenderHeader(config)}

Page(${info});
`;
}

function transformJsForWorker(str, config) {
  return `
${getSecurityHeader(config.forbiddenGlobals)}

${str}`;
}

function transformAppJs(str, config) {
  return `
${getSecurityHeader(config.forbiddenGlobals)}

${str}`;
}

function transformAppJsForNative() {
  return `import './app.worker';`;
}

function transformAppJsForWebRender(_, config, { fullPath }) {
  const cssPath = fullPath.replace(/\.(js|ts)$/, config.styleExtname);
  if (!existsSync(cssPath)) {
    return '';
  }
  return `
${getAppRenderHeader(config)}
if(App) {
  App({
    stylesheet(){return require('./app${config.styleExtname}')},
  });
}
`;
}

module.exports = {
  transformComponentJs,
  transformComponentJsForWebRender,
  transformComponentJsForWorker,
  transformPageJsForWebRender,
  transformAppJs,
  transformAppJsForNative,
  transformAppJsForWebRender,
  transformPageJs,
  transformJsForWorker,
  transformPageJsForWorker,
};
