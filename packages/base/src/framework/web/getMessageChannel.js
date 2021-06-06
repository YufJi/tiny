import { publish, subscribe, invokeNative } from '@/bridge';
import addEvents from '@/utils/addEvents';
import { debug } from '@/utils/log';
import { noop } from '@/utils/types';

import { getCurrentPageImpl } from '../App';
import EventHub from '../EventHub';

const g = self;

export default function getMessageChannel(pageInfo, bridge) {
  let unhandledMessages = [];

  let callback;

  g.send = (event) => {
    if (callback) {
      callback(event);
    } else {
      unhandledMessages.push(event);
    }
  };

  g.addEventListener('message', g.send);

  const { queryString, id, pagePath } = pageInfo;

  const payload = {
    pagePath,
    id,
    pageType: 'RENDER',
    msgType: 'DOMContentLoaded',
    viewId: g.WEBVIEWID,
  };

  if (queryString) {
    payload.queryString = queryString;
  }

  // bridge.call('postMessage', payload);

  return {
    id,
    postMessage: function postMessage(data) {
      bridge.call('postMessage', {
        viewId: g.WEBVIEWID,
        ...data,
        id: data.id || id,
      });
    },
    onMessage: function onMessage(fn) {
      callback = fn;
      // 清空积压消息
      if (unhandledMessages.length) {
        unhandledMessages.forEach((message) => {
          fn(message);
        });
        unhandledMessages = [];
      }
    },
  };
}

let callbackId = 0;
const callbackMap = new Map();

function invokeServiceMethod(options) {
  const { name: method, type = 'sdk', args } = options;
  const scene = type;
  const params = omitBy(args, isFunction);
  callbackId += 1;
  callbackMap.set(callbackId, {
    success: args.success || noop,
    fail: args.fail || noop,
    complete: args.complete || noop,
  });
  publish('invokeServiceMethod', {
    method,
    scene,
    params,
    extra: {
      callbackId,
      timestamp: Date.now(),
    },
  });
}

subscribe('callbackServiceMethod', (data) => {
  const callback = callbackMap.get(data.extra.callbackId);
  if (!callback) return;

  if (data.error) {
    callback.fail({
      errMsg: data.error,
    });
    callback.complete({
      errMsg: data.error,
    });
  } else {
    callback.success(data.result);
    callback.complete(data.result);
  }
});

subscribe('invokeWebviewMethod', (ev) => {
  EventHub.emit(ev.method, ev.params, (res, isSuccess) => {
    publish('callbackWebviewMethod', {
      method: ev.method,
      result: res,
      extra: ev.extra,
    });
  });
});

subscribe('onRenderPageLoad', () => {
  const page = getCurrentPageImpl();

  page.onRenderPageLoad();
});

subscribe('onReceiveData', (params) => {
  const page = getCurrentPageImpl();

  const { data } = params;
  page.receiveData(data, () => {
    invokeNative('publishCallback', {

    });
  });
});
