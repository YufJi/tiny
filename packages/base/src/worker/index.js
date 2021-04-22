import EventEmitter from '@/core/utils/EventEmitter';
import securityPatch from '@/core/utils/securityPatch';
import ap from '@/api/ap.worker';

const eventEmitter = new EventEmitter();

securityPatch();

const g = self;

g.fetch = null;

const { JSBridge } = g;

const promise = new Promise(((resolve) => {
  document.addEventListener('JSBridgeReady', resolve);
}));

const worker = {
  postMessage(message) {
    promise.then(() => {
      JSBridge.call('multiWorkerPostMessage', {
        message,
        fromCustomWorker: true,
      });
    });
  },
  onMessage(listener) {
    eventEmitter.on('message', listener);
  },
};

promise.then(() => {
  ap.onUserEvent('mainWorkerMessage', (e) => {
    eventEmitter.emit('message', e.data);
  });
});

export default worker;
