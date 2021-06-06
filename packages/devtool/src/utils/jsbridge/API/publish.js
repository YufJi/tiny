import EventHub, { WORKERLOADED } from '@/utils/EventHub';
import gloabl from '@/utils/global';

let workerLoaded = false;
let workerMsgQueue = [];

EventHub.on(WORKERLOADED, () => {
  workerLoaded = true;
  workerMsgQueue.forEach(({ event, params }) => messageToWorker(event, params));
  workerMsgQueue = [];
});

export function messageToWorker(event, options) {
  const { paramsString, webviewIds } = options;

  const viewIds = JSON.parse(webviewIds);

  if (gloabl.worker) {
    try {
      gloabl.worker.contentWindow.JSBridgeHandler.subscribeHandler(event, paramsString, viewIds[0]);
    } catch (error) {
      console.error(error);
    }
  }
}

export function messageToRender(event, options) {
  const { paramsString, webviewIds, callbackId } = options;

  const viewIds = JSON.parse(webviewIds);

  viewIds.forEach((viewId) => {
    const render = gloabl.renders[viewId];
    if (render) {
      try {
        render.contentWindow.JSBridgeHandler.subscribeHandler(event, paramsString);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

export function publish(event, options) {
  const { paramsString } = options;
  const params = JSON.parse(paramsString);

  const { from } = params;

  if (from === 'RENDER') {
    if (workerLoaded) {
      return messageToWorker(event, options);
    } else {
      workerMsgQueue.push({
        event,
        params: options,
      });
    }
  } else if (from === 'WORKER') {
    return messageToRender(event, options);
  }
}

export function publishCallback() {
  
}
