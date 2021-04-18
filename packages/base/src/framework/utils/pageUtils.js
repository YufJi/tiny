import $global from '../common/global';

const START_TAB_ID = 10;
const END_TAB_ID = 100;
// 0-100 reserved for tab pages
let globalPageId = END_TAB_ID;

export function getPageId(pagePath, useTab) {
  if (useTab) {
    return $global.tabsConfig[pagePath];
  }
  return ++globalPageId;
}

export function isTabPage(page) {
  const id = page.getId();
  return id >= START_TAB_ID && id <= END_TAB_ID;
}
