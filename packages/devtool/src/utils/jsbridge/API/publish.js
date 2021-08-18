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
    const render = gloabl.webviews.get(viewId);

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
  const { __IS_WORKER__ } = options;

  if (__IS_WORKER__) {
    return messageToRender(method, options);
  } else {
    return messageToWorker(method, options);
  }
}
