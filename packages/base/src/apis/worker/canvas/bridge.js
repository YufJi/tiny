
import ap from '@/apis/ap';

const { callBridge, callBridgeSync } = ap;

const g = self;

export function callCanvasBridge(name, params, callback) {
  callBridge(name, params, callback);
}

export function callCanvasBridgeSync(name, params) {
  if (g.callMPCanvasBridgeSync) {
    return g.callMPCanvasBridgeSync(params);
  } else {
    return callBridgeSync(name, params);
  }
}

export function callBridgeAPI(context, actionType, data, params = {}, sync) {
  const args = ['NBComponent.sendMessage', {
    actionType,
    element: context.id,
    viewId: context._getPage().getViewId(),
    data,
  }];
  return sync ? callCanvasBridgeSync(...args) : new Promise(((resolve, reject) => {
    args.push((res) => {
      if (res.error) {
        reject(res);
        if (params.fail) {
          params.fail(res);
        }
      } else {
        resolve(res);
        if (params.success) {
          params.success(res);
        }
      }
      if (params.complete) {
        params.complete(res);
      }
    });
    callCanvasBridge(...args);
  }));
}
