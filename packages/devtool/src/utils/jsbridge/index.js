/**
 * web调试时宿主环境对jsbridge的处理
 */

import * as API from './API';

const bridge = {
  call(method, params) {
    console.log('%cjsbridge call:', 'color: green;', method, params);
    if (typeof API[method] === 'function') {
      API[method](params);
    } else {
      console.warn(`method: ${method} 还未实现`);
    }
  },
  callSync(method, params) {
    console.log('jsbridge callSync:', 'method', method, 'params', params);
  },
};

export default bridge;
