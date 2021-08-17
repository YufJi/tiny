import gloabl from '@/utils/global';

export function messageToWorker(method, options) {
  const { paramsString, webviewIds } = options;

  const viewIds = JSON.parse(webviewIds);

  if (gloabl.worker) {
    try {
      gloabl.worker.contentWindow.JSBridge.subscribeHandler(method, paramsString, viewIds[0]);
    } catch (error) {
      console.error(error);
    }
  }
}

export function messageToRender(method, options) {
  const { paramsString, webviewIds, callbackId } = options;

  const viewIds = JSON.parse(webviewIds);

  viewIds.forEach((viewId) => {
    const render = gloabl.renders[viewId];

    if (render) {
      try {
        render.contentWindow.JSBridge.subscribeHandler(method, paramsString);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

export function publish(method, options) {
  const { paramsString } = options;
  const { from, ...params } = JSON.parse(paramsString);

  if (from === 'RENDER') {
    return messageToWorker(method, options);
  } else if (from === 'WORKER') {
    return messageToRender(method, options);
  }
}
