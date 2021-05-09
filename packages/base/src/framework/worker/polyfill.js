const g = self;

/* 实现worker中的importScripts */
const importScriptsPolyfill = (...urls) => {
  if (!urls.length) {
    return;
  }
  urls.forEach((url) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();
      const contentType = xhr.getResponseHeader('content-type');
      if (/(java|ecma)script/.test(contentType)) {
        eval(xhr.responseText);
      }
    } catch (err) {
      console.error(err);
    }
  });
};

g.importScripts = g.importScripts || importScriptsPolyfill;
