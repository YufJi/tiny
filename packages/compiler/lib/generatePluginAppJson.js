const path = require('path');
const { safeJsonParse } = require('./utils');
const { updatePlugin } = require('./pageMap');

module.exports = function generatePluginAppJson({
  src,
  pluginId,
  css2 = true,
}) {
  const appPath = path.join(src, 'plugin.json');
  const appJson = safeJsonParse(appPath);
  updatePlugin({ cwd: src, appJson, pluginId, css2 });
  return appJson;
};
