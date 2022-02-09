/**
 * web调试时宿主环境对jsbridge的处理
 */

import * as API from './API';

const bridge = {
  publish(event, params, webviewIds, __IS_WORKER__) {
    // eslint-disable-next-line import/no-named-as-default-member
    return API.publish(event, params, webviewIds, __IS_WORKER__);
  },
  call(method, params, webviewIds, callbackId) {
    if (typeof API[method] === 'function') {
      console.warn(`bridge invoke ${method}`);
      const result = API[method](params, webviewIds, callbackId);
      return JSON.stringify(result);
    } else {
      console.error(`bridge: ${method}暂不支持，敬请期待`);
    }
  },
};

export default bridge;
