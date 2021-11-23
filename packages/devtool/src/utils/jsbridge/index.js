/**
 * web调试时宿主环境对jsbridge的处理
 */

import * as API from './API';

const bridge = {
  publish(event, params, webviewIds, __IS_WORKER__) {
    return API.publish(event, params, webviewIds, __IS_WORKER__);
  },
  call(method, params, webviewIds, callbackId) {
    if (typeof API[method] === 'function') {
      const result = API[method](params, webviewIds, callbackId);
      return JSON.stringify(result);
    } else {
      console.warn(`bridge: ${method}暂不支持，敬请期待`);
    }
  },
};

export default bridge;
