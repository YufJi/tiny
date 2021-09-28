import EventEmitter from 'eventemitter3';
import {
  beforeInvoke,
  beforeInvokeFail,
  getDataType,
  onMethod,
  invokeMethod,
  surroundByTryCatchFactory,
  validateUrl,
  convertObjectValueToString,
  addQueryStringToUrl,
} from './util';

const MAX_REQUEST_CONCURRENT = 10;
const waitingIdStore = new WeakMap();
const requestTaskIdStore = new WeakMap();
const requestStatusStore = new WeakMap();
const requestParamStore = new WeakMap();
const requestCreateTimeStore = new WeakMap();
const requestCreateEndTimeStore = new WeakMap();
const waitingQueue = [];
const requestInstances = {};
const emitter = new EventEmitter();
let requestTaskIdCounter = 0;
let concurrentRequestCount = 0;

['onRequestTaskStateChange', 'onInnerRequestTaskStateChange'].forEach((name) => {
  onMethod(name, (res = {}) => {
    const { state, requestTaskId: taskId } = res;

    delete res.state;
    delete res.requestTaskId;

    if (state === 'success' || state === 'fail') {
      concurrentRequestCount -= 1;

      if (waitingQueue.length > 0) {
        const task = waitingQueue.shift();
        createRequestTask.call(task.item, task.createMethod);
      }
    }

    emitter.emit(`${taskId}${state}`, res);

    if (state === 'success' || state === 'fail') {
      const _task = requestInstances[taskId];

      if (_task) {
        delete requestInstances[taskId];
        emitter.removeAllListeners(`${taskId}success`);
        emitter.removeAllListeners(`${taskId}fail`);
      }
    }
  });
});

class SafeRequestClass {
  constructor(param) {
    ['success', 'fail', 'complete'].forEach((status) => {
      if (typeof param[status] === 'function') {
        param[status] = surroundByTryCatchFactory(param[status], `at api request ${status} callback function`);
      }
    });

    createRequest(this, 'createRequestTask', param);
  }

  abort() {
    abortRequest(this, 'operateRequestTask');
  }
}

export function request(param = {}) {
  if (beforeInvoke('request', param, {
    url: '',
  })) {
    if (!validateUrl(param.url)) {
      beforeInvokeFail('request', param, `invalid url "${param.url}"`);
      return;
    }

    if (param.data === 'function') {
      beforeInvokeFail('request', param, 'data should not be Function');
      return;
    }

    const headerDataType = getDataType(param.header);
    param.header = param.header || {};
    param.header = convertObjectValueToString(param.header);

    if (headerDataType !== 'Undefined' && headerDataType !== 'Object') {
      // console.warn("request: header must be an object");
      param.header = {};
    }

    param.header = Object.keys(param.header).reduce((obj, key) => {
      key.toLowerCase() === 'content-type' ? obj[key.toLowerCase()] = param.header[key] : obj[key] = param.header[key];
      return obj;
    }, {});
    const header = param.header || {};
    let method = 'GET';
    param.method && (param.method = param.method.toUpperCase());
    typeof param.method === 'string' && (method = param.method.toUpperCase());
    let responseType = 'text';
    param.responseType && (responseType = param.responseType.toLowerCase());
    let data;
    param.dataType = param.dataType || 'json';
    header['content-type'] = header['content-type'] || 'application/json';

    if (param.data === undefined) {
      data = '';
    } else if (typeof param.data === 'string' || param.data instanceof ArrayBuffer) {
      data = param.data;
    } else if (header['content-type'].indexOf('application/x-www-form-urlencoded') > -1) {
      data = urlEncodeFormData(param.data, true);
    } else if (header['content-type'].indexOf('application/json') > -1) {
      data = JSON.stringify(param.data);
    } else if (typeof param.data === 'object') {
      data = JSON.stringify(param.data);
    } else {
      data = param.data.toString();
    }

    method === 'GET' && (param.url = addQueryStringToUrl(param.url, param.data));

    try {
      return new SafeRequestClass({
        ...param,
        header,
        method,
        responseType,
        data,
      });
    } catch (error) {
      beforeInvokeFail('request', error, error && error.message);
    }
  }
}

function createRequest(req, createMethod, param) {
  const id = requestTaskIdCounter++;
  waitingIdStore.set(req, id);
  requestStatusStore.set(req, 'waiting');
  requestParamStore.set(req, param);

  if (concurrentRequestCount >= MAX_REQUEST_CONCURRENT) {
    waitingQueue.push({
      id,
      item: req,
      createMethod,
    });
    return;
  }

  createRequestTask.call(req, createMethod);
}

function abortRequest(req, operateMethod) {
  /* eslint-disable valid-typeof */
  if (typeof requestStatusStore.get(req) === 'waiting') {
    const idx = waitingQueue.findIndex((tmp) => {
      return tmp.id === waitingIdStore.get(req);
    });

    if (idx > -1) {
      waitingQueue.splice(idx, 1);
      concurrentRequestCount -= 1;
    }

    requestStatusStore.set(req, 'done');
  } else {
    invokeMethod(operateMethod, {
      requestTaskId: requestTaskIdStore.get(req),
      operationType: 'abort',
    });
  }
}

function createRequestTask(createMethod) {
  const that = this;
  const param = requestParamStore.get(this);
  let errMsg;
  requestStatusStore.set(this, 'sending');
  const startTime = Date.now();
  requestCreateTimeStore.set(this, startTime);

  invokeMethod(createMethod, {
    data: param.data,
    url: param.url,
    header: param.header,
    method: param.method,
    responseType: param.responseType,
    success(res) {
      requestTaskIdStore.set(that, res.requestTaskId);
      concurrentRequestCount += 1;
      requestInstances[res.requestTaskId] = that;
    },
    fail(response) {
      errMsg = response.errMsg;
    },
    complete() {
      requestStatusStore.set(that, 'done');
    },
  });

  if (errMsg) {
    setTimeout(() => {
      const res = {
        errMsg: errMsg.replace('createRequestTask', 'request'),
      };
      typeof param.fail === 'function' && param.fail(res);
      typeof param.complete === 'function' && param.complete(res);
    }, 0);
  } else {
    emitter.on(`${requestTaskIdStore.get(this)}success`, (res) => {
      res.errMsg = 'request:ok';

      if (typeof res.data === 'string' && res.data.charCodeAt(0) === 65279) {
        res.data = res.data.substr(1);
      }

      if (param.dataType === 'json' && typeof res.data === 'string') {
        try {
          res.data = JSON.parse(res.data);
        } catch (e) {}
      }

      res.statusCode = parseInt(res.statusCode, 10);

      if (typeof res.header === 'object') {
        res.header = Object.keys(res.header).reduce((obj, key) => {
          Array.isArray(res.header[key]) ? obj[key] = res.header[key].join(',') : typeof res.header[key] === 'string' && (obj[key] = res.header[key]);
          return obj;
        }, {});
      }

      typeof param.success === 'function' && param.success(res);
      typeof param.complete === 'function' && param.complete(res);
    });

    emitter.on(`${requestTaskIdStore.get(this)}fail`, (res) => {
      res.errMsg = `request:fail ${res.errMsg}`;
      typeof param.fail === 'function' && param.fail(res);
      typeof param.complete === 'function' && param.complete(res);
    });
  }

  requestCreateEndTimeStore.set(this, Date.now());
}
