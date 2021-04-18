const loaderUtils = require('loader-utils');
const assign = require('object-assign');
const { extname: getExtname } = require('path');
const jsTransformer = require('../jsTransformer');
const { getPage, findTabIndex, getComponent } = require('../pageMap');
const getAppStyleTransformer = require('../getAppStyleTransformer');
const {
  normalizePathForWin,
  getProjectPath,
  isValidFilePath,
} = require('../utils');
const getStyleTransformerFromPageJs = require('../getStyleTransformerFromPageJs');
const getJsLoaderMap = require('./getJsLoaderMap');

function isAppJS(path) {
  return path === 'app.js' || path === 'app.ts';
}

module.exports = function g(source) {
  const { isWorker, cwd, isNative, transformConfig } = loaderUtils.getOptions(
    this,
  );
  const { pluginId } = transformConfig;
  // console.log('xxxxxx', isWorker, cwd, isNative, transformConfig);
  const { resourcePath } = this;
  if (!isWorker && !isValidFilePath(resourcePath)) {
    this.callback(new Error(`illegal file path ${resourcePath}`));
    return undefined;
  }
  // native or webview
  const isRender = !isWorker;
  const fullPath = normalizePathForWin(resourcePath);
  let type = 'normal';
  if (!source) {
    this.callback(null, source);
    return type;
  }

  const normalizeCwd = normalizePathForWin(`${cwd}/`);
  if (fullPath.indexOf(normalizeCwd) === -1) {
    this.callback(null, source);
    return type;
  }
  const projectPath = getProjectPath(fullPath, cwd);
  const extname = getExtname(projectPath);
  let code;
  const pageUsingComponents = getPage(projectPath, extname, {
    pluginId,
  });
  const is = `/${projectPath}`.slice(0, -extname.length);
  let componentInfo;
  const componentConfig = getComponent(is, cwd, { pluginId });
  if (!pageUsingComponents && componentConfig) {
    componentInfo = assign({ is }, componentConfig);
  }
  if (componentInfo) {
    // console.log('componentInfo', componentInfo, resourcePath, isWorker);
    const extConfig = assign(
      {
        resourceQuery: this.resourceQuery || '',
        fullPath,
      },
      transformConfig,
    );

    if (isNative) {
      code = jsTransformer.transformComponentJs(
        source,
        componentInfo,
        extConfig,
      );
    } else if (isWorker) {
      code = jsTransformer.transformComponentJsForWorker(
        source,
        componentInfo,
        extConfig,
      );
    } else {
      code = jsTransformer.transformComponentJsForWebRender(
        componentInfo,
        extConfig,
      );
    }
    type = 'component';
  } else if (isAppJS(projectPath)) {
    if (isWorker) {
      code = jsTransformer.transformAppJs(source, transformConfig, {
        fullPath,
      });
    } else if (isNative) {
      code = jsTransformer.transformAppJsForNative(source, transformConfig, {
        fullPath,
      });
    } else {
      code = jsTransformer.transformAppJsForWebRender(source, transformConfig, {
        fullPath,
      });
    }
    type = 'app';
  } else if (pageUsingComponents) {
    let renderConfig;
    if (isRender) {
      const appStyle = getAppStyleTransformer(cwd, transformConfig);
      const styleTransformer = getStyleTransformerFromPageJs({
        fullPath,
        source: projectPath,
        config: transformConfig,
        appStyle,
        src: cwd,
      });
      renderConfig = assign(
        {
          resourceQuery: this.resourceQuery || '',
          usingComponents: pageUsingComponents,
          fullPath,
          tabIndex: findTabIndex(projectPath, extname),
          styleTransformer,
        },
        transformConfig,
      );
    }
    if (isNative) {
      code = jsTransformer.transformPageJs(
        source,
        projectPath.slice(0, -extname.length),
        renderConfig,
      );
    } else if (isWorker) {
      code = jsTransformer.transformPageJsForWorker(
        source || 'Page({})',
        projectPath.slice(0, -extname.length),
        assign(
          {
            usingComponents: pageUsingComponents,
            tabIndex: findTabIndex(projectPath, extname),
          },
          transformConfig,
        ),
      );
    } else {
      code = jsTransformer.transformPageJsForWebRender(
        projectPath.slice(0, -extname.length),
        renderConfig,
      );
    }
    type = 'page';
  } else if (isWorker || isNative) {
    code = jsTransformer.transformJsForWorker(source, transformConfig);
  } else {
    this.callback(null, source);
    return type;
  }
  if (code === null || code === undefined || !source) {
    // console.log('fullpath', fullPath);
    // console.log('code', code);
    // console.log('source', source);
    this.callback(new Error(`parse ${fullPath} error!`));
    return type;
  }
  const map = getJsLoaderMap({ code, source, fullPath, path: projectPath });
  this.callback(null, code, map);
  return type;
};
