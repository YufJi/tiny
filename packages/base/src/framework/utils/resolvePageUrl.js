import resolveUrl from './resolveUrl';

export default function resolvePageUrl(pagePath, currentPage) {
  let url = pagePath;
  let queryString = '';
  const queryIndex = url.indexOf('?');
  if (queryIndex !== -1) {
    queryString = url.slice(queryIndex + 1);
    url = url.slice(0, queryIndex);
  }
  if (url.charAt(0) === '/') {
    url = url.slice(1);
  } else if (currentPage) {
    const refer = currentPage.getPagePath();
    url = resolveUrl(url, refer);
  }
  queryString = queryString ? `?${queryString}` : queryString;
  return `${url}${queryString}`;
}
