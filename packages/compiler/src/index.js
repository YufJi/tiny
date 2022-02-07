const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const transformMini = require('./transformMini');
const transformPlugin = require('./transformPlugin');
const { noop } = require('./utils');

const cwd = process.cwd();

module.exports = function run(config, callback = noop) {
  const miniConfig = { ...config };

  transformMini({
    ...miniConfig,
    src: path.join(cwd, argv.root),
    watch: argv.watch,
  });

  /* 如果存在pluginId，则配置用来转换插件 */
  if (config.pluginId) {
    transformPlugin({
      ...config,
      src: path.join(cwd, argv.root),
      watch: argv.watch,
    });
  }

  callback();
};
