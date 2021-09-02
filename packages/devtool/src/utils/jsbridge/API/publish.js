import gloabl from '@/utils/global';

export function messageToWorker(method, params, webviewIds) {
  webviewIds.forEach((viewId) => {
    if (gloabl.worker) {
      try {
        gloabl.worker.contentWindow.JSBridge.subscribeHandler(method, JSON.stringify(params), viewId);
      } catch (error) {
        console.error(error);
      }
    }
  });
}

export function messageToRender(method, params, webviewIds) {
  webviewIds.forEach((viewId) => {
    const render = gloabl.webviews.get(viewId);

    if (render) {
      try {
        render.contentWindow.JSBridge.subscribeHandler(method, JSON.stringify(params));
      } catch (error) {
        console.error(error);
      }
    }
  });
}

export function publish(method, params, webviewIds = [], __IS_WORKER__) {
  if (__IS_WORKER__) {
    return messageToRender(method, params, webviewIds);
  } else {
    return messageToWorker(method, params, webviewIds);
  }
}
