const loaderUtils = require('loader-utils');
const assign = require('object-assign');
const { extname: getExtname, relative } = require('path');
const TemplateTransformer = require('../TemplateTransformer');
const { getProjectPath, isValidFilePath } = require('../utils');
const { getComponent, getPage } = require('../pageMap');

module.exports = function (source) {
  const { isWorker, cwd, transformConfig } = loaderUtils.getOptions(this);
  const { pluginId, showFileNameInError = true } = transformConfig;

  const { resourcePath: fullPath } = this;

  if (!isValidFilePath(fullPath)) {
    this.callback(new Error(`illegal file path ${fullPath}`));
    return;
  }

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
        projectRoot: cwd,
        usingComponents,
        renderPath: fullPath,
        isComponent: !!componentConfig,
        isWorker,
      },
      transformConfig,
    ),
  ).transform((error, code) => {
    if (error) {
      if (showFileNameInError) {
        let fileProjectPath = relative(cwd, fullPath);
        fileProjectPath = fileProjectPath.substr(0, 2) === '..' ? fullPath : fileProjectPath;
        error = new Error(
          `${fileProjectPath}\nModule build failed:\n${error.message || ''}`,
        );
      }
      /* eslint-enable */
      this.callback(error);
      return;
    }
    this.callback(null, code);
  });
  return undefined;
};
