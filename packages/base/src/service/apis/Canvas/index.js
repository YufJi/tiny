import { subscribe } from '../../bridge';
import { getCurrentPages } from '../../Route';
import CanvasContext from './CanvasContext';
import { infix, canvasStore, actionsCache, callDraw, getBase64Data } from './util';

subscribe('canvasInsert', (event, webviewId) => {
  const iid = infix(webviewId, event.canvasId);
  canvasStore[iid] = true;

  if (Array.isArray(actionsCache[iid])) {
    console.warn('flush old actions');
    actionsCache[iid].forEach((options) => {
      callDraw(options);
    });
    actionsCache[iid] = []; // or delete
  }
});

export function createCanvasContext(canvasId) {
  const cps = getCurrentPages(); // TODO 运行时确定，卧槽，这段代码在第一个webview ready之前就tm要执行?！

  const wvid = cps.length >= 1 ? cps[cps.length - 1].__webviewId__ : -1;
  const ctx = new CanvasContext(canvasId, wvid);

  return ctx;
}

export function canvasToTempFilePath(param) {
  const cps = getCurrentPages();
  const cpid = cps[cps.length - 1].__webviewId__;
  param.webviewId = cpid;
  const iid = infix(cpid, param.canvasId);

  if (canvasStore[iid]) {
    getBase64Data(param);
  } else {
    typeof param.fail === 'function' && param.fail({
      errMsg: 'canvasToTempFilePath: fail canvas is empty',
    });
  }
}
