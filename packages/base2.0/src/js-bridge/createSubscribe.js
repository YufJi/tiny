import EventEmitter from 'eventemitter3';

import { CUSTOM_EVENT } from './const';

export default function createSubscribe() {
  const nativeEmitter = new EventEmitter();
  const customEmitter = new EventEmitter();

  return {
    onNative: nativeEmitter.on.bind(nativeEmitter),
    offNative: nativeEmitter.off.bind(nativeEmitter),
    subscribe(event, listener) {
      customEmitter.on.call(customEmitter, CUSTOM_EVENT + event, listener);
    },
    unsubscribe(event, listener) {
      customEmitter.off.call(customEmitter, CUSTOM_EVENT + event, listener);
    },

    // 监听消息
    subscribeHandler(event, data, webviewId) {
      let params;

      if (typeof data === 'string') {
        try {
          params = JSON.parse(data);
        } catch (e) {
          params = {};
        }
      } else if (typeof params !== 'object') {
        params = {};
      }

      if (event.startsWith(CUSTOM_EVENT)) {
        customEmitter.emit.call(customEmitter, event, params, webviewId);
      } else {
        nativeEmitter.emit.call(nativeEmitter, event, params, webviewId);
      }
    },
  };
}
