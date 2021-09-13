const transformMini = require('./transformMini');
const transformPlugin = require('./transformPlugin');
const { noop } = require('./utils');

module.exports = function run(config, callback = noop) {
  const miniConfig = { ...config };

  transformMini(miniConfig);

  /* 如果存在pluginId，则配置用来转换插件 */
  if (config.pluginId) {
    transformPlugin(config);
  }

  callback();
};
