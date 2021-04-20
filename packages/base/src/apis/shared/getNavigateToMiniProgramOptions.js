
export default function getNavigateToMiniProgramOptions(appId, config) {
  const referrerInfo = {
    appId,
  };
  const param = {};
  if (config.path) {
    param.page = config.path;
  }
  if (config.extraData) {
    referrerInfo.extraData = config.extraData;
  }
  param.referrerInfo = JSON.stringify(referrerInfo);
  const options = { appId: config.appId, ...config, param };
  const versions = ['develop', 'trial', 'release', 'examine'];
  if (config.envVersion && versions.indexOf(config.envVersion) !== -1) {
    options.envVersion = config.envVersion;
  }
  return options;
}
