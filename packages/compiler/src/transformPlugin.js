const fs = require('fs-extra');
const assign = require('object-assign');
const generateEntries = require('./generatePluginEntries');
const generateAppJson = require('./generatePluginAppJson');
const generateAppConfigJson = require('./generatePluginAppConfigJson');
const transform = require('./transform');

module.exports = function run(config) {
  const {

    pluginId,
    pluginRoot,
    native = 0,
    // allowedNativeComponents=['view']
  } = config;
  // console.log(config, 'config')
  const src = pluginRoot;
  const out = `${config.out}/plugin`;

  const transformConfig = assign({}, config);

  transformConfig.pluginId = pluginId;

  fs.ensureDirSync(out);

  const appJson = generateAppJson({ src, pluginId });

  generateEntries({

    appJson,
    web: 1,
    native,
    out,
    pluginId,
  });

  generateAppConfigJson({
    appJson,
    out,
    src,
  });

  transform(assign({}, transformConfig, { cwd: src, out, src }));
};
