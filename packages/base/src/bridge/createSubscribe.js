import EventEmitter from '@/utils/EventEmitter';

import { CUSTOM_EVENT } from './const';

export default function createSubscribe() {
  const customEmitter = new EventEmitter();
  const nativeEmitter = new EventEmitter();

  return {
    onNative: nativeEmitter.on,
    offNative: nativeEmitter.off,
    subscribe(event, listener) {
      customEmitter.on(CUSTOM_EVENT + event, listener);
    },
    unsubscribe(event, listener) {
      customEmitter.off(CUSTOM_EVENT + event, listener);
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
      }

      if (typeof params !== 'object') {
        params = {};
      }

      if (event.startsWith(CUSTOM_EVENT)) {
        customEmitter.emit(event, params, webviewId);
      } else {
        nativeEmitter.emit(event, params, webviewId);
      }
    },
  };
}
