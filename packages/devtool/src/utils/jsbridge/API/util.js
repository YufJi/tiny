import global from '../../global';

export function forEachWebviewIds(webviewIds = [], callback) {
  webviewIds.forEach((webviewId) => {
    const frame = global.webviews.get(webviewId);

    frame && callback(frame);
  });
}
