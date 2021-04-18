const fs = require('fs');
const assign = require('object-assign');
const StyleStore = require('./StyleStore');

module.exports = function getStyleTransformerFromPageJs({
  fullPath,
  source,
  appStyle,
  config,
  src,
}) {
  const stylePath = fullPath.replace(/\.(js|ts)$/, config.styleExtname);

  let styleTransformer = appStyle;
  if (fs.existsSync(stylePath)) {
    styleTransformer = StyleStore.getStyleTransformer(
      stylePath,
      assign({}, config, {
        src,
        appStyleTransformer: appStyle,
        source: source.replace(/\.(js|ts)$/, config.styleExtname),
        injectStyle: false,
      }),
    );
  }
  return styleTransformer;
};
