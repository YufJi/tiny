/**
 * web调试时宿主环境对jsbridge的处理
 */

import * as API from './API';

export const CUSTOM_EVENT = 'custom_event_';

const bridge = {
  publish(event, paramsString, webviewIds, __IS_WORKER__) {
    return API.publish(event, paramsString, webviewIds, __IS_WORKER__);
  },
  call(method, params, webviewIds, callbackId) {
    if (typeof API[method] === 'function') {
      const result = API[method](params, webviewIds, callbackId);
      return JSON.stringify(result);
    } else {
      console.warn(`method: ${method} 还未实现`);
    }
  },
};

export default bridge;
