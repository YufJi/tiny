import { getStartupParams } from './startupParams';

function getPagePath(url) {
  let index = url.indexOf('#');
  if (index !== -1) {
    url = url.slice(0, index);
  }
  index = url.indexOf('?');
  if (index !== -1) {
    url = url.slice(0, index);
  }
  return url;
}
// pushWindow https://m.taobao.com
export default function isMiniAppPage(pageUrl) {
  const _getStartupParams = getStartupParams();
  const { url } = _getStartupParams;

  if (pageUrl && url) {
    return getPagePath(url) === getPagePath(pageUrl);
  }
  return true;
}
