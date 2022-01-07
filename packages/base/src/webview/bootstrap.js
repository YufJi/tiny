import EventEmitter from 'eventemitter3';
import { CustomEvent } from 'shared';

const { InitDataReady } = CustomEvent;

import * as bridge from './bridge';
import renderPage from './Page';

export default function bootstrap() {
  const root = document.getElementById('__root__');
  const fields = {
    root,
    bridge,
    emitter: new EventEmitter(),
  };

  const componentHub = getComponentHub();

  const waitRenderFunc = new Promise((resolve) => {
    document.addEventListener('generateFuncReady', (e) => {
      const { generateFunc, webviewId } = e.detail;

      resolve(generateFunc);
    });
  });

  const waitInitData = new Promise((resolve) => {
    const { subscribe } = bridge;

    subscribe(InitDataReady, (e) => {
      const { data, ext } = e;

      resolve({ data, config: ext });
    });
  });

  Promise.all([
    waitRenderFunc,
    waitInitData,
  ]).then((res) => {
    const [generateFunc, init] = res;
    const { data, config } = init;

    const provide = {
      config,
      bridge,
      fields,
      componentHub,
    };

    renderPage(provide, data, generateFunc);
  });
}

function getComponentHub() {
  const events = getEventHub();
  const instances = getInstanceHub();

  return {
    events,
    instances,
  };
}

function getInstanceHub() {
  const instanceMap = new Map();
  return {
    remove(is) {
      instanceMap.delete(is);
    },
    set(is, instance) {
      instanceMap.set(is, instance);
    },
    get(is) {
      return instanceMap.get(is) || null;
    },
  };
}

function getEventHub() {
  const getDispatchKey = function (nodeId, type) {
    return `${type}:${nodeId}`;
  };

  const eventMap = new Map();

  return {
    subscribe(type, nodeId, callback) {
      const key = getDispatchKey(nodeId, type);
      eventMap.set(key, callback);

      return {
        remove() {
          eventMap.delete(key);
        },
      };
    },
    dispatch(type, e) {
      const { nodeId } = e;
      const fn = eventMap.get(getDispatchKey(nodeId, type));
      return fn ? fn(e) : null;
    },
  };
}
