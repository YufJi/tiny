
import EventEmitter from '@/core/utils/EventEmitter';
import securityPatch from '@/core/utils/securityPatch';
import { isIOS } from '@/core/utils/system';
import ap from '../bridge/ap.worker';

const eventEmitter = new EventEmitter();
securityPatch();
const g = self;
g.fetch = null;
let { JSBridge } = g;
if (!isIOS) {
  JSBridge = {};
}
const promise = new Promise(((resolve) => {
  if (JSBridge) {
    resolve();
  } else {
    document.addEventListener('JSBridgeReady', resolve);
  }
}));
const worker = {
  postMessage: function postMessage(message) {
    promise.then(() => {
      if (isIOS) {
        JSBridge.call('multiWorkerPostMessage', {
          message,
          fromCustomWorker: true,
        });
      } else {
        console.log(`create_worker:${JSON.stringify(message)}`);
      }
    });
  },
  onMessage: function onMessage(listener) {
    eventEmitter.on('message', listener);
  },
};

promise.then(() => {
  if (isIOS) {
    ap.onUserEvent('mainWorkerMessage', (e) => {
      eventEmitter.emit('message', e.data);
    });
  } else {
    g.addEventListener('message', (e) => {
      eventEmitter.emit('message', e.data);
    });
  }
});

export default worker;
