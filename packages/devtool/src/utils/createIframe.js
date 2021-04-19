/**
 * 创建rednerFrame、workerFrame 
 */


function createIframe(options) {
  const {id, src, style, onload, container } = options || {}
  const el = document.createElement('iframe');
  el.setAttribute('src', src);
  el.setAttribute('id', id);
  el.setAttribute('name', id);
  el.setAttribute('seamless', 'seamless')
  el.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals');
  el.setAttribute('frameborder', '0');
  el.setAttribute('style', style)
  el.onload = function () {
    el.contentWindow.document.dispatchEvent(new CustomEvent('JSBridgeReady', {
      detail: {
        guid: id,
      }
    }))

    onload(el)
  };
  el.id = id;
  container.appendChild(el);
  return el
}

export function createWorkerIframe(id, src, onload) {
  return createIframe({
    id, 
    src, 
    style: `width:0; height:0; border:0; display:none;`, 
    onload, 
    container: document.getElementById('workerFrame'),
  })
}

export function createRenderIframe(id, src, onload) {
  return createIframe({
    id, 
    src, 
    style: `
      position: absolute;
      top: 0px;
      bottom: 0px;
      width: 100%;
      height: 100%;
    `, 
    onload, 
    container: document.getElementById('pageFrames'),
  })
}

