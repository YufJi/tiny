

export function createWorkerIframe(id, src, onload) {
  const el = document.createElement('iframe');
  el.setAttribute('src', src);
  el.setAttribute('id', id);
  el.setAttribute('name', id);
  el.setAttribute('seamless', 'seamless')
  el.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals');
  el.setAttribute('frameborder', '0');
  el.setAttribute('width', '0');
  el.setAttribute('height', '0');
  el.setAttribute('style', 'width:0; height:0; border:0; display:none;')
  el.onload = function () {
    onload(el)
  };
  el.id = id;
  document.getElementById('workerIframe').appendChild(el);
  return el
}

export function createRenderIframe(id, src, onload) {
  const winH = window.innerHeight;

  const el = document.createElement('iframe');
  el.setAttribute('src', src);
  el.setAttribute('id', id);
  el.setAttribute('name', id);
  el.setAttribute('seamless', 'seamless');
  el.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals');
  el.setAttribute('frameborder', '0');

  el.setAttribute('style', `
    position:absolute;
    top: 0px;
    bottom: 0px;
    width: 100%;
    height: 100%;
  `);

  el.onload = function () {
    onload(el)
  };
  el.id = id;
  document.getElementById('pageFrames').appendChild(el);
  return el
}

