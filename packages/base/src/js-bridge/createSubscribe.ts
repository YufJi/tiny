import EventEmitter from 'eventemitter3';
import { getType } from 'shared';
import { EventPrefix } from './type';

export default function createSubscribe() {
  const nativeEmitter = new EventEmitter();
  const customEmitter = new EventEmitter();

  return {
    onNative: nativeEmitter.on.bind(nativeEmitter),
    offNative: nativeEmitter.off.bind(nativeEmitter),
    subscribe(event, listener) {
      customEmitter.on.call(customEmitter, EventPrefix.CUSTOM + event, listener);
    },
    unsubscribe(event, listener) {
      customEmitter.off.call(customEmitter, EventPrefix.CUSTOM + event, listener);
    },

    // 监听消息
    subscribeHandler(event, data, webviewId) {
      let params;

      if (typeof data === 'string') {
        try {
          params = JSON.parse(data);
        } catch (error) {
          console.error('监听消息时解析数据出错:', error);
          console.error('错误数据为:', data);
          params = {};
        }
      } else if (getType(data) === 'Object') {
        params = data;
      }

      /* 再检查一次 */
      if (typeof params !== 'object') {
        params = {};
      }

      if (event.startsWith(EventPrefix.CUSTOM)) {
        customEmitter.emit.call(customEmitter, event, params, webviewId);
      } else {
        nativeEmitter.emit.call(nativeEmitter, event, params, webviewId);
      }
    },
  };
}
