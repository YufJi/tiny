import qs from 'qs';
import requireFile from '@/utils/requireFile';

export function getSystemInfoSync() {
  return {
    errMsg: 'getSystemInfoSync:ok',
    data: {
      language: 'zh',
      platform: 'ios',
      SDKVersion: '',
      pixelRatio: window.devicePixelRatio,
    },
  };
}

export function getLaunchOptionsSync(params, webviewIds, callbackId) {
  const { path, query } = qs.parse(window.location.search.replace('?', ''));
  const { pages } = requireFile('/biz/appConfig.json');

  return {
    query,
    path: path || pages[0],
  };
}
