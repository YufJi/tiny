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

module.exports = function (source) {
  const { resourcePath } = this;
  const { isWorker, cwd, transformConfig } = loaderUtils.getOptions(
    this,
  );
  const { pluginId, temp } = transformConfig;

  const isRender = !isWorker;

  /* 校验文件路径 */
  if (isRender && !isValidFilePath(resourcePath)) {
    this.callback(new Error(`illegal file path ${resourcePath}`));
    return undefined;
  }

  // webview
  const fullPath = normalizePathForWin(resourcePath);
  let type = 'normal';
  if (!source) {
    this.callback(null, source);
    return type;
  }

  const normalizeCwd = normalizePathForWin(`${cwd}`);
  const normalizeTemp = normalizePathForWin(`${temp}`);

  /* 不在小程序项目根目录 或者 在临时文件夹，不作处理 */
  if (fullPath.indexOf(normalizeCwd) === -1 || fullPath.indexOf(normalizeTemp) !== -1) {
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

    if (isWorker) {
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
    code = jsTransformer.transformAppJs(source, transformConfig, {
      fullPath,
    });

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
    if (isWorker) {
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
  } else if (isWorker) {
    code = jsTransformer.transformJsForWorker(source, transformConfig);
  } else {
    this.callback(null, source);
    return type;
  }
  if (code === null || code === undefined || !source) {
    this.callback(new Error(`parse ${fullPath} error!`));
    return type;
  }
  const map = getJsLoaderMap({ code, source, fullPath, path: projectPath });
  this.callback(null, code, map);
  return type;
};
