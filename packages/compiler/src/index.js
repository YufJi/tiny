const transformMini = require('./transformMini');
const transformPlugin = require('./transformPlugin');

function noop() {}

module.exports = function run(config, callback = noop) {
  const miniConfig = { ...config };
  delete miniConfig.pluginId;
  /* 浅拷贝一份，删除pluginId，用作小程序的转换配置 */
  transformMini(miniConfig);

  /* 如果存在pluginId，则配置用来转换插件 */
  if (config.pluginId) {
    transformPlugin(config);
  }
  callback();
};
