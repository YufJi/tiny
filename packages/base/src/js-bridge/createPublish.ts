import { g } from 'shared';
import { JSCORE, EventPrefix, WebviewId } from './type';

export default function createPublish(jsCore: JSCORE) {
  const publish = (method: string, params: any, webviewId: WebviewId = g.WEBVIEWID) => {
    const webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];

    jsCore.publish(`${EventPrefix.CUSTOM}${method}`, params, webviewIds, g.__IS_SERVICE__);
  };

  return {
    publish,
  };
}
