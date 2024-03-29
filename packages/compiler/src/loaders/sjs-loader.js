const loaderUtils = require('loader-utils');
const sjsTranspiler = require('../sjsTranspiler');
const { isValidFilePath } = require('../utils');

module.exports = function (source) {
  if (!source) {
    return this.callback(null, source);
  }
  const { cwd, transformConfig } = loaderUtils.getOptions(this);
  const { resourcePath: renderPath } = this;
  if (!isValidFilePath(renderPath)) {
    this.callback(new Error(`illegal file path ${renderPath}`));
    return undefined;
  }
  try {
    const code = sjsTranspiler(source, {
      renderPath,
      projectRoot: cwd,
      transformConfig,
    });
    this.callback(null, code);
  } catch (e) {
    /* eslint-disable */
    console.error(e);
    /* eslint-enable */
    this.callback(e);
  }
  return undefined;
};
