import { getStartupParams } from '@/framework/startupParams';
import callBridge from './callBridge';

const ddOrAp = true || false;

export default function callInternalAPI(method, param = {}, callback) {
  if (ddOrAp && !getStartupParams().isInternalApp) {
    const internalParams = {
      method,
      param,
    };
    if ('viewId' in param) {
      internalParams.viewId = param.viewId;
    }
    callBridge('internalAPI', internalParams, callback);
  } else {
    callBridge(method, param, callback);
  }
}
