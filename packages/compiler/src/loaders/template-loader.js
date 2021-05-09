const loaderUtils = require('loader-utils');
const assign = require('object-assign');
const { extname: getExtname, relative } = require('path');
const TemplateTransformer = require('../TemplateTransformer');
const { getProjectPath, isValidFilePath } = require('../utils');
const { getComponent, getPage } = require('../pageMap');
const { getCachedExtApp } = require('../getExtApp');

module.exports = function t(source) {
  const { isWorker, cwd, transformConfig } = loaderUtils.getOptions(this);
  const { pluginId, showFileNameInError } = transformConfig;

  const { resourcePath: fullPath } = this;

  if (!isValidFilePath(fullPath)) {
    this.callback(new Error(`illegal file path ${fullPath}`));
    return;
  }

  const { supportSjsHandler } = getCachedExtApp();
  const projectPath = getProjectPath(fullPath, cwd);
  const extname = getExtname(projectPath);
  const fileName = projectPath.slice(0, -extname.length);
  const componentConfig = getComponent(`/${fileName}`, cwd, { pluginId });
  const usingComponents = (componentConfig && componentConfig.usingComponents) || getPage(fileName, undefined, { pluginId });

  new TemplateTransformer(
    source,
    assign(
      {
        strictDataMember: false,
        pure: true,
        prettier: false,
        projectRoot: cwd,
        usingComponents,
        renderPath: fullPath,
        isComponent: !!componentConfig,
        isWorker,
        supportSjsHandler,
      },
      transformConfig,
    ),
  ).transform((e, code) => {
    if (e) {
      if (showFileNameInError) {
        let fileProjectPath = relative(cwd, fullPath);
        fileProjectPath = fileProjectPath.substr(0, 2) === '..' ? fullPath : fileProjectPath;
        e = new Error(
          `${fileProjectPath}\nModule build failed:\n${e.message || ''}`,
        );
      }
      /* eslint-enable */
      this.callback(e);
      return;
    }
    this.callback(null, code);
  });
  return undefined;
};
