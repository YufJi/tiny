import AppRegistry from '../AppRegistry';

export default function checkInvalidPage(pageUrl) {
  let page = pageUrl;
  if (page.charAt(0) === '/') {
    page = pageUrl.slice(1);
  }
  const index = page.indexOf('?');
  if (index !== -1) {
    page = page.slice(0, index);
  }
  if (!AppRegistry.getRunnable(page)) {
    console.error(`framework error: can not find page: ${pageUrl}`);
    return true;
  }
}
