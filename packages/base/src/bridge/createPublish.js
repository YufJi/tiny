import { CUSTOM_EVENT } from './const';

export default function createPublish(jsCore) {
  return function (event, data, webviewId = []) {
    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    const paramsString = JSON.stringify(data);
    const webviewIdsString = JSON.stringify(webviewIds);

    jsCore.call({
      event: CUSTOM_EVENT + event,
      paramsString,
      webviewIds: webviewIdsString,
    });
  };
}
