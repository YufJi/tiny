const g = self;

export default function getMessageChannel(pageInfo, bridge) {
  let unhandledMessages = [];

  let callback;

  g.send = (event) => {
    if (callback) {
      callback(event);
    } else {
      unhandledMessages.push(event);
    }
  };

  g.addEventListener('message', g.send);

  const { queryString, id, pagePath } = pageInfo;

  const payload = {
    pagePath,
    id,
    pageType: 'RENDER',
    msgType: 'DOMContentLoaded',
    viewId: g.WEBVIEWID,
  };
  if (queryString) {
    payload.queryString = queryString;
  }

  bridge.call('postMessage', payload);

  return {
    id,
    postMessage: function postMessage(data) {
      bridge.call('postMessage', {
        viewId: g.WEBVIEWID,
        ...data,
        id: data.id || id,
      });
    },
    onMessage: function onMessage(fn) {
      callback = fn;
      if (unhandledMessages.length) {
        unhandledMessages.forEach((message) => {
          fn(message);
        });
        unhandledMessages = [];
      }
    },
  };
}
