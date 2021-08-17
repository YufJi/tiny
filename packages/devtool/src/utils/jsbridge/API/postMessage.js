/*
 * @Author: YufJ
 * @Date: 2021-04-18 14:59:25
 * @LastEditTime: 2021-08-13 17:43:10
 * @Description:
 * @FilePath: /tiny-v1/packages/devtool/src/utils/jsbridge/API/postMessage.js
 */
import EventHub, { WORKERLOADED } from '@/utils/EventHub';
import gloabl from '@/utils/global';

let workerLoaded = false;
let workerMsgQueue = [];

EventHub.on(WORKERLOADED, () => {
  workerLoaded = true;
  workerMsgQueue.forEach(messageToWorker);
  workerMsgQueue = [];
});

export function messageToWorker(params) {
  if (gloabl.worker) {
    try {
      gloabl.worker.contentWindow.send({
        data: params,
      });
    } catch (error) {
      gloabl.worker.contentWindow.postMessage(params);
    }
  }
}

export function messageToRender(params) {
  const { viewId } = params;
  const render = gloabl.renders[viewId];
  if (render) {
    try {
      render.contentWindow.send({
        data: params,
      });
    } catch (error) {
      render.contentWindow.postMessage(params);
    }
  }
}

export default function postMessage(params) {
  const { pageType } = params;

  if (pageType === 'RENDER') {
    if (workerLoaded) {
      messageToWorker(params);
    } else {
      workerMsgQueue.push(params);
    }
  } else if (pageType === 'WORKER') {
    messageToRender(params);
  }
}
