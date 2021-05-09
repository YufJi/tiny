const { existsSync } = require('fs');
const { join } = require('path');
const assign = require('object-assign');
const StyleStore = require('./StyleStore');

module.exports = function g(cwd, transformConfig) {
  const appStylePath = join(cwd, `app${transformConfig.styleExtname}`);
  let appStyleTransformer;
  if (existsSync(appStylePath)) {
    appStyleTransformer = StyleStore.getStyleTransformer(
      appStylePath,
      assign(
        {
          src: cwd,
          source: `app${transformConfig.styleExtname}`,
        },
        transformConfig,
      ),
    );
  }
  return appStyleTransformer;
};
