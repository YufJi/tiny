import { CUSTOM_EVENT } from './const';

const g = self;

export default function createPublish(jsCore) {
  const publish = (event, data, webviewId = g.WEBVIEWID) => {
    const paramsString = JSON.stringify(data);
    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    const webviewIdsString = JSON.stringify(webviewIds);

    const params = {
      event: CUSTOM_EVENT + event,
      paramsString,
      webviewIds: webviewIdsString,
      __IS_WORKER__: g.__IS_WORKER__,
    };

    jsCore.call(params);
  };

  return {
    publish,
  };
}
