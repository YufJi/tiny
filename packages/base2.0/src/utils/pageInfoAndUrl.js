/*
 * @Author: YufJ
 * @Date: 2021-07-10 03:13:59
 * @LastEditTime: 2021-07-10 03:14:41
 * @Description:
 * @FilePath: /tiny-v1/packages/base2.0/src/utils/pageInfoAndUrl.js
 */

const pageMatchReg = /#([^?]+)(\?.+)?/;
const MP_PAGE_ID = '__mpPageId';
const pageIdMatch = new RegExp(`[&?]${MP_PAGE_ID}=(\\d+)(?:&|$)`);

export function getUrlFromPageInfo({ pagePath, pageId, queryString }) {
  return `#${pagePath}?${MP_PAGE_ID}=${pageId}${queryString ? `&${queryString}` : ''}`;
}

export function getPageInfoFromUrl(url) {
  let id;
  const pageMatch = url && url.match(pageMatchReg);
  let pagePath = pageMatch && pageMatch[1];
  if (pagePath && pagePath.charAt(0) === '/') {
    pagePath = pagePath.slice(1);
  }
  let queryString = pageMatch && pageMatch[2] || '';
  const idMatch = queryString.match(pageIdMatch);
  if (idMatch) {
    id = parseInt(idMatch[1], 10);
    queryString = queryString.replace(pageIdMatch, '');
  }
  if (queryString.charAt(0) === '?') {
    queryString = queryString.slice(1);
  }
  id = id || 0;
  return {
    id,
    route: pagePath,
    queryString,
  };
}
