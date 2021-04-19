
import { debug } from '@/utils/log';
import callRender from './callRender';
import { getStartupParams } from '@/utils/startupParams';
import EventEmitter from '@/utils/EventEmitter';
import { isDebugFramework } from '@/utils/isDebug';

const g = self;
const globalEmitter = new EventEmitter();

function log(...args) {
  // debug.apply(undefined, ['framework'].concat(args));
  debug('framework', ...args);
}

function getUserEventName(name) {
  return `_$${name}`;
}

function getUserEventDataName(name) {
  return `_data_$${name}`;
}

function cleanEventData(userEventData) {
  if (userEventData && typeof userEventData === 'object' && 'NBPageUrl' in userEventData) {
    userEventData = { ...userEventData };
    delete userEventData.NBPageUrl;
  }

  return userEventData;
}

function doEventCallback(options) {
  const name = options.eventName;

  const userEventName = getUserEventName(name);
  const userEventDataName = getUserEventDataName(name);
  const hasSysEvent = globalEmitter.listenerCount(name);
  const hasUserEvent = globalEmitter.listenerCount(userEventName);
  const hasUserEventData = globalEmitter.listenerCount(userEventDataName);
  if (hasUserEvent || hasSysEvent || hasUserEventData) {
    const evt = { 
      name, 
      type: name,
      data: options.param,
      viewId: options.viewId,
    };

    globalEmitter.emit(name, evt);

    if (hasUserEvent) {
      const userEvent = { ...evt };
      delete userEvent.viewId;
      userEvent.data = cleanEventData(userEvent.data);
      globalEmitter.emit(userEventName, userEvent);
    }
    if (hasUserEventData) {
      const userEventData = cleanEventData(evt.data);
      globalEmitter.emit(userEventDataName, userEventData);
    }
  }
}

const JSBridge = g.JSBridge;

g.callRender = callRender;

g.__trigger__ = doEventCallback;

/* native事件触发 */
g.document.addEventListener('push', (evt) => {
  /**
   * param
   * viewId
   * eventName
   */
  const { data } = evt;
  doEventCallback(data);
})

let API = {};

const ap = {
  injectAPI(_API) {
    API = _API;
  },
  getAPI() {
    return API;
  },
  emitUserEvent(type, ...args) {
    return globalEmitter.emit.apply(globalEmitter, [getUserEventName(type)].concat(args));
  },
  emitUserEventData(type, ...args) {
    return globalEmitter.emit.apply(globalEmitter, [getUserEventDataName(type)].concat(args));
  },
  onUserEvent(name, callback) {
    return globalEmitter.on(getUserEventName(name), callback);
  },
  offUserEvent(name, callback) {
    return globalEmitter.off(getUserEventName(name), callback);
  },
  onUserEventData(name, callback) {
    return globalEmitter.on(getUserEventDataName(name), callback);
  },
  offUserEventData(name, callback) {
    return globalEmitter.off(getUserEventDataName(name), callback);
  },
  on(...args) {
    return globalEmitter.on.call(globalEmitter, ...args);
  },
  off(...args) {
    return globalEmitter.off.call(globalEmitter, ...args);
  },
  emit(...args) {
    return globalEmitter.emit.call(globalEmitter, ...args);
  },
  callBridge(method, params, callback) {
    // 这里调用bridge的方法
    JSBridge.call(method, params, callback);
  },
  callBridgeSync(method, params) {
    const res = JSBridge.callSync(method, params);
    if (res && res.error) {
      log('callBridgeSync error:', method, params, res);
    }
    return res;
  },
};

const ddOrAp = true;
/* param must be a object... */
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
