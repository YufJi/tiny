import global from '../../global';

export function forEachWebviewIds(webviewIds = [], callback) {
  webviewIds.forEach((viewId) => {
    const frame = global.webviews.get(viewId);

    frame && callback(frame);
  });
}
