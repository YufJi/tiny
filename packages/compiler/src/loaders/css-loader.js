/*
 * @Author: YufJ
 * @Date: 2021-04-18 17:17:19
 * @LastEditTime: 2021-08-13 15:41:14
 * @Description:
 * @FilePath: /tiny-v1/packages/compiler/src/loaders/css-loader.js
 */
const assign = require('object-assign');
const loaderUtils = require('loader-utils');
const fs = require('fs');
const path = require('path');
const StyleTransformer = require('../StyleTransformer');
const getAppStyleTransformer = require('../getAppStyleTransformer');
const { getPage, getPageComponents } = require('../pageMap');
const { getProjectPath, isValidFilePath } = require('../utils');
const { getStyleTransformer } = require('../StyleStore');

module.exports = function (source) {
  // css can handle empty
  const { cwd, transformConfig } = loaderUtils.getOptions(this);
  const { pluginId } = transformConfig;
  const { resourcePath: fullPath } = this;
  if (!isValidFilePath(fullPath)) {
    this.callback(new Error(`illegal file path ${fullPath}`));
    return undefined;
  }
  const projectPath = getProjectPath(fullPath, cwd);
  const extname = path.extname(projectPath);
  try {
    let componentStyles;
    let appStyleTransformer;

    const isPageCss = getPage(projectPath, extname, { pluginId });
    const pageName = projectPath.slice(0, -extname.length);
    if (isPageCss) {
      const dependentComponents = getPageComponents(pageName, { pluginId });
      if (dependentComponents.length) {
        componentStyles = [];
        dependentComponents.forEach((d) => {
          const fullComponentPath = path.join(cwd, d + extname);
          if (fs.existsSync(fullComponentPath)) {
            componentStyles.push(
              getStyleTransformer(
                fullComponentPath,
                assign({}, transformConfig, {
                  src: cwd,
                  source: d,
                  appStyleTransformer: false,
                  injectStyle: false,
                }),
              ),
            );
          }
        });
      }
    }
    appStyleTransformer = isPageCss
      ? getAppStyleTransformer(cwd, transformConfig)
      : null;

    const styleTransformer = new StyleTransformer(
      source,
      assign(
        {
          stylePath: fullPath,
          src: cwd,
          componentStyles,
          source: projectPath,
          appStyleTransformer,
          injectStyle: true,
        },
        transformConfig,
      ),
    );
    const code = styleTransformer.getCode();
    this.callback(null, code);
  } catch (e) {
    this.callback(e);
  }
  return undefined;
};
