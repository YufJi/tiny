/**
 * 创建rednerFrame、serviceFrame
 */
import qs from 'qs';
import global from './global';

function createIframe(options) {
  return new Promise((resolve, reject) => {
    const { id, src, style, onload, container } = options || {};
    const el = document.createElement('iframe');

    const [url, query] = src.split('?');
    const queryObj = qs.parse(query);
    queryObj.webviewId = id;

    el.id = id;
    el.setAttribute('src', `${url}?${qs.stringify(queryObj)}`);
    el.setAttribute('style', style || '');
    el.setAttribute('class', 'frame');
    el.setAttribute('id', id);
    el.setAttribute('name', id);
    el.setAttribute('seamless', 'seamless');
    el.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals');
    el.setAttribute('frameborder', '0');

    el.onload = function () {
      onload && onload(el);
      resolve(el);
    };

    el.onerror = function (e) {
      reject(e);
    };

    global.webviews.set(id, el);

    container.appendChild(el);
  });
}

export function createWorkerIframe({ src, onload }) {
  return createIframe({
    id: 'service',
    src,
    style: 'width:0; height:0; border:0; display:none;',
    onload,
    container: document.getElementById('serviceFrame'),
  }).then((serviceIframe) => {
    global.service = serviceIframe;
    return serviceIframe;
  });
}

export function createRenderIframe({ guid, src, onload }) {
  return createIframe({
    id: `webview-${guid}`,
    src,
    style: `position: absolute; left: 0; top: 0; bottom: 0; width: 100%; height: 100%; z-index: ${guid};`,
    onload,
    container: document.getElementById('pageFrames'),
  });
}

export function removeRenderIframeById(guid) {
  // 通过guid删除节点信息，并且删除
  const iframe = global.webviews.get(guid);
  if (iframe) {
    global.webviews.delete(guid);

    if (iframe) {
      iframe.className = 'frame out';
      setTimeout(() => {
        iframe.parentNode.removeChild(iframe);
      }, 300);
    }
  }
}
