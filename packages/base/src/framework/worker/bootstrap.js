import './polyfill';
import { subscribe } from '@/bridge';
import { debug } from '@/utils/log';
import { getAppImpl, getCurrentPagesImpl } from '../App';
import { loadPage } from '../SubPackage';

const g = self;

let started = true;
let queue = [];

function processEndpoint(event) {
  const { id: pageId } = event.data;
  const appImpl = getAppImpl();
  const page = appImpl.getPageById(pageId);

  page && page.onMessage(event);
}

function processMessage(event) {
  const { msgType } = event.data;
  if (msgType === 'endpoint') {
    processEndpoint(event);
  }
}

g.send = (event) => {
  debug('framework', '[WORKER] App Received Message:', event.data);

  if (started) {
    queue.forEach(processMessage);
    processMessage(event);
  } else {
    queue.push(event);
  }
};

g.addEventListener('message', g.send);

function processContentLoad(params, webviewId) {
  const { pagePath, queryString, id: pageId } = params;

  loadPage(pagePath, () => {
    const appImpl = getAppImpl();
    const page = appImpl.newPage({ pagePath, queryString, pageId });
    page.setViewId(webviewId);
    // refresh page
    if (page.$loadTime) {
      page.refresh();
    } else {
      page.init();
    }
  });
}

let callbackId = 0;
const callbackMap = new Map();

// eslint-disable-next-line @typescript-eslint/promise-function-async
function invokeWebview(method, params, webviewId) {
  return new Promise(((resolve, reject) => {
    callbackId += 1;
    callbackMap.set(callbackId, {
      resolve,
      reject,
    });

    publish('invokeWebviewMethod', {
      method,
      params,
      extra: {
        callbackId,
        timestamp: Date.now(),
      },
    }, webviewId);
  }));
}

subscribe('callbackWebviewMethod', (response) => {
  const { error, result, extra } = response;
  const currentId = extra.callbackId;
  const executor = callbackMap.get(currentId);

  if (!executor) {
    const info = JSON.stringify(response);
    throw new InvokeError(`Executor(${currentId}) in service not found.\nresponse: ${info}`);
  }

  if (error) {
    error.env = 'WEBVIEW';
    executor.reject(error);
  } else {
    executor.resolve(result);
  }

  callbackMap.delete(currentId);
});

subscribe('invokeServiceMethod', async (data, webviewId) => {
  const webviewIds = [webviewId];
  const { scene } = data;
  const { method } = data;
  const { extra } = data;
  const { params } = data;

  // api 调用
  const result = {};

  publish('callbackServiceMethod', {
    method,
    result,
    extra,
  }, webviewIds);
});

subscribe('DOMContentLoaded', (params, webviewId) => {
  if (started) {
    queue.forEach(({ params, webviewId }) => processContentLoad(params, webviewId));
    processContentLoad(params, webviewId);
  } else {
    queue.push({
      params,
      webviewId,
    });
  }
});

subscribe('onRenderPageEvent', (params, webviewId) => {
  const { method, args } = params;
  const appImpl = getAppImpl();
  const page = appImpl.getPageByViewId(webviewId);

  page && page.executeUserMethod(method, args);
});

export function pauseApp() {
  started = false;
}

export default function bootstrap() {
  started = true;
  queue.forEach(processMessage);
  queue = [];
}
