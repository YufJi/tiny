/**
 * web调试时宿主环境对jsbridge的处理
 */

import * as API from './API';

export const CUSTOM_EVENT = 'custom_event_';

const bridge = {
  call(method, params) {
    console.log('%cjsbridge call:', 'color: green;', method, params);
    if (method.startsWith(CUSTOM_EVENT)) {
      return API.publish(method, params);
    } else if (typeof API[method] === 'function') {
      API[method](params);
    } else {
      console.warn(`method: ${method} 还未实现`);
    }
  },
};

export default bridge;
