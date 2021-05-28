export default function createPublish(jsCore) {
  return function (event, data, webviewId = []) {
    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    const paramsString = JSON.stringify(data);
    const webviewIdsString = JSON.stringify(webviewIds); // console.log(
    //   "webview",
    //   'publish:',
    //   CUSTOM_EVENT + event,
    //   paramsString,
    //   webviewIdsString,
    // );

    jsCore.call({
      event: CUSTOM_EVENT + event,
      paramsString,
      webviewIds: webviewIdsString,
    });
  };
}
