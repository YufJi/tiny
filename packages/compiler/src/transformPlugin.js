const fs = require('fs-extra');
const assign = require('object-assign');
const generateEntries = require('./generatePluginEntries');
const generateAppJson = require('./generatePluginAppJson');
const generateAppConfigJson = require('./generatePluginAppConfigJson');

module.exports = function run(config) {
  const {
    pluginId,
    pluginRoot,
  } = config;
  const src = pluginRoot;
  const out = `${config.out}/plugin`;

  const transformConfig = assign({}, config);

  transformConfig.pluginId = pluginId;

  fs.ensureDirSync(out);

  const appJson = generateAppJson({ src, pluginId });

  generateEntries({
    appJson,
    out,
    pluginId,
  });

  generateAppConfigJson({
    appJson,
    out,
    src,
  });

  // todo pack
};
