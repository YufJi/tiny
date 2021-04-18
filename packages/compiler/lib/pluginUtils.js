const PLUGIN_PREFIX = 'plugin://';
const PLUGIN_PRIVATE_PREFIX = 'plugin-private://';
function getPluginPath(pluginId, suffix) {
  return `${PLUGIN_PRIVATE_PREFIX}${pluginId}/${suffix}`;
}

module.exports = {
  PLUGIN_PREFIX,
  PLUGIN_PRIVATE_PREFIX,
  getPluginPath,
};
