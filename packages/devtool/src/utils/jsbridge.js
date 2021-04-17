import * as API from './API'

const bridge = {
  call(method, params) {
    console.log('call:', 'method', method, 'params', params);
    if (typeof API[method] === 'function') {
      API[method](params)
    } else {
      console.warn(`method: ${method} 还未实现`)
    }
  },
  callSync(method, params) {
    console.log('callSync:', 'method', method, 'params', params);
  },
}

export default bridge;
