
import { getStartupParams } from './startupParams';

const debugMatchCache = {};

export function isDebug() {
  return !!getStartupParams().debug;
}
export function isDebugFramework() {
  return isDebugSupported('framework');
}
export function isDebugSupported(type) {
  let isMatch = debugMatchCache[type];
  if (isMatch === undefined) {
    const _getStartupParams = getStartupParams();
    const { debug } = _getStartupParams;

    if (debug) {
      debugMatchCache[type] = isMatch = !!debug.match(new RegExp(`\\b${type}\\b`));
    }
  }
  return isMatch;
}
