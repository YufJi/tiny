import { CUSTOM_EVENT } from './const';

export default function createPublish(jsCore) {
  const publish = (event, data, webviewId = self.WEBVIEWID) => {
    data.from = self.__IS_WORKER__ ? 'WORKER' : 'RENDER';

    const paramsString = JSON.stringify(data);
    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    const webviewIdsString = JSON.stringify(webviewIds);

    const params = {
      event: CUSTOM_EVENT + event,
      paramsString,
      webviewIds: webviewIdsString,
    };

    jsCore.call(params);
  };

  return {
    publish,
  };
}
