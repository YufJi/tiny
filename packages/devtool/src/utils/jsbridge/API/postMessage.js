import EventHub, { WORKERLOADED } from '@/utils/EventHub'
import gloabl from '@/utils/global'

let workerInited = false;
let queue = [];

EventHub.on(WORKERLOADED, () => {
  workerInited = true;
  queue.forEach(messageToWorker);
  queue = [];
})

export function messageToWorker(params) {
  if (gloabl.worker) {
    gloabl.worker.contentWindow.send({
      data: params
    })
  }
}

export function messageToRender(params) {
  const { $viewId } = params;
  const render = gloabl.renders[$viewId];
  if (render) {
    // render.contentWindow.postMessage(params);
    render.contentWindow.send({
      data: params
    })
  }
}

export default function postMessage(params) {
  const { pageType } = params;

  if (pageType === 'RENDER') {
    if (workerInited) {
      messageToWorker(params)
    } else {
      queue.push(params)
    }
  } else if (pageType === 'WORKER') {
    messageToRender(params)
  }
}
