
import ap from '@hulk/mp-core/es/bridge/ap.worker';
import { getStartupParams } from '@hulk/mp-core/es/framework/startupParams';

const ddOrAp = true || false;
// param must be a object...
ap.callInternalAPI = function (method, param = {}, callback) {
  if (ddOrAp && !getStartupParams().isInternalApp) {
    const internalParams = {
      method,
      param,
    };
    if ('viewId' in param) {
      internalParams.viewId = param.viewId;
    }
    ap.callBridge('internalAPI', internalParams, callback);
  } else {
    ap.callBridge(method, param, callback);
  }
};
ap.callInternalAPISync = function (method, param = {}) {
  if (ddOrAp && !getStartupParams().isInternalApp) {
    const internalParams = {
      method,
      param,
    };
    if ('viewId' in param) {
      internalParams.viewId = param.viewId;
    }
    return ap.callBridgeSync('internalAPI', internalParams);
  } else {
    return ap.callBridgeSync(method, param);
  }
};

export default ap;
