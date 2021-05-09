import { debug } from '@/utils/log';
import { noop } from '@/utils/types';

const MessageHandle = {
  getCallbackId() {
    this.callbackSeq = this.callbackSeq || 0;
    this.callbackSeq += 2;
    return this.callbackSeq;
  },
  setId(id) {
    this.id = id;
  },
  getId() {
    return this.id;
  },
  getPagePath() {
    return this.pagePath;
  },
  onMessage(event) {
    const _this = this;

    if (this.unloaded) {
      return;
    }
    let { data } = event;

    if (typeof data === 'string') {
      data = JSON.parse(data).data;
    }

    const { method, args, caller, successCallback, errorCallback } = data;

    if (caller !== 'bridge' || method !== 'console') {
      debug('framework', `[${this.pageType}] Page ${this.pagePath} onMessage`, data);
    }
    const callPath = caller && caller.split('.') || [];
    let callObj = this;
    callPath.forEach((p) => {
      callObj = callObj && callObj[p];
    });

    if (callObj) {
      if (!args) {
        debug('framework', `[${this.pageType}] Page ${this.pagePath} unhandled message`, event.data);
        return;
      }
      const myArgs = args.concat();
      if (successCallback) {
        myArgs.push((...a) => {
          _this.callRemote.apply(_this, ['self', 'invokeCallback', successCallback].concat(a));
        });
      } else {
        myArgs.push(noop);
      }
      if (errorCallback) {
        myArgs.push((...a) => {
          _this.callRemote.apply(_this, ['self', 'invokeCallback', errorCallback].concat(a));
        });
      } else {
        myArgs.push(noop);
      }
      if (callObj[method]) {
        let _callObj;

        (_callObj = callObj)[method].apply(_callObj, myArgs);
        return;
      }
    }
    debug('framework', `[${this.pageType}] Page ${this.pagePath} unhandled message`, event.data);
  },

  invokeCallback(callbackId, ...args) {
    if (this.unloaded) {
      return;
    }
    const { callbacks } = this;
    if (callbacks) {
      if (callbackId && callbacks[callbackId]) {
        callbacks[callbackId].apply(callbacks, args);
      }
      if (callbackId % 2 === 0) {
        callbackId -= 1;
      }
      // success and error
      delete callbacks[callbackId];
      delete callbacks[callbackId + 1];
    }
  },
  callRemote(caller, method, ...args) {
    if (this.unloaded) {
      return;
    }
    let successCallback;
    let errorCallback;
    if (typeof args[args.length - 2] === 'function') {
      this.callbacks = this.callbacks || {};
      successCallback = this.getCallbackId() - 1;
      this.callbacks[successCallback] = args[args.length - 2];
      errorCallback = successCallback + 1;
      this.callbacks[errorCallback] = args[args.length - 1];
      args.pop();
      args.pop();
    } else if (typeof args[args.length - 1] === 'function') {
      this.callbacks = this.callbacks || {};
      successCallback = this.getCallbackId() - 1;
      this.callbacks[successCallback] = args[args.length - 1];
      errorCallback = successCallback + 1;
      args.pop();
    }

    this.postMessage({
      caller,
      method,
      id: this.getId(),
      successCallback,
      errorCallback,
      args,
    });
  },
};

export default MessageHandle;
