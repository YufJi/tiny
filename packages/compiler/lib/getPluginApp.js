const path = require('path');
const { safeJsonParse } = require('./utils');

module.exports = function getPluginApp(src) {
  const appPath = path.join(src, 'plugin.json');
  const appJson = safeJsonParse(appPath);
  return appJson;
};
