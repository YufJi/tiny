import { publish, subscribe } from '../../bridge';
import CanvasContext from '../Canvas/CanvasContext';

let uuid = 1;
const privateMethod = {};

subscribe('responseComponentInfo', (e, webviewId) => {
  const eid = e.reqId;
  const callback = privateMethod[eid];

  if (callback) {
    delete privateMethod[eid];

    // 临时处理canvas node
    for (let i = 0; i < e.res.length; i+=1) {
      const item = e.res[i];
      if (item.node && item.node.isCanvas) {
        item.node.getContext = function (type) {
          if (type === '2d') {
            return new CanvasContext(item.node.canvasId, webviewId);
          }
        };
      }
    }

    callback(e.res);
  }
});

export function publishSelectQuery(webviewid, queue, callback) {
  uuid+=1;
  privateMethod[uuid] = callback;
  publish('requestComponentInfo', {
    reqId: uuid,
    reqs: queue,
  }, [webviewid]);
}
