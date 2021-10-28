import { g } from 'shared';
import { CUSTOM_EVENT } from './const';

export default function createPublish(jsCore) {
  const publish = (method, params, webviewId = g.WEBVIEWID) => {
    // const paramsString = JSON.stringify(params);
    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    const webviewIdsString = JSON.stringify(webviewIds);

    jsCore.publish(`${CUSTOM_EVENT}${method}`, params, webviewIdsString, g.__IS_SERVICE__);
  };

  return {
    publish,
  };
}
