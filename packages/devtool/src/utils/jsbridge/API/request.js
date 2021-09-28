import axios from 'axios';
import { forEachWebviewIds } from './util';

let requestTaskIdCounter = 0;

export function createRequestTask(params, webviewIds, callbackId) {
  const requestTaskId = requestTaskIdCounter++;
  const { data, header = {}, method = 'GET', responseType = 'text', url } = params;

  axios.request({
    method,
    url,
    data,
    headers: header,
    responseType,
    withCredentials: true,
  }).then((res) => {
    forEachWebviewIds(webviewIds, (frame) => {
      frame.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onRequestTaskStateChange', '${JSON.stringify({
        requestTaskId,
        statusCode: res.status,
        state: 'success',
        data: res.data,
      })}', '${frame.id}')`);
    });
  }).catch(() => {
    forEachWebviewIds(webviewIds, (frame) => {
      frame.contentWindow.executeJavaScript(`JSBridge.subscribeHandler('onRequestTaskStateChange', '${JSON.stringify({
        requestTaskId,
        statusCode: res.status,
        state: 'fail',
        data: res.data,
      })}', '${frame.id}')`);
    });
  });

  return {
    requestTaskId,
  };
}
