
export default function callBridge(method, param, callback) {
  const g = self;
  const { JSBridge } = g;

  function done(res) {
    if (res && res.error) {
      if (method === 'internalAPI') {
        if (param && param.method !== 'onAppPerfEvent') {
          console.error(`callInternalAPI error: ${param.method}`, param, res);
        }
      } else {
        console.error(`callBridge error: ${method}`, param, res);
      }
    }
    if (callback) {
      callback(res);
    }
  }

  if (JSBridge) {
    JSBridge.call(method, param, done);
  } else {
    document.addEventListener('JSBridgeReady', () => {
      g.JSBridge.call(method, param, done);
    });
  }
}
