import AppRegistry from '../AppRegistry';
import $global from '../common/global';
import PageComponent from '../legacy/PageComponent';

export default function Page(userConfig = {}) {
  if (!$global.currentPageConfig) {
    throw new Error('invalid Page usage!');
  }
  const { tabsConfig } = $global;
  const { currentPageConfig } = $global;
  const { pagesConfig } = $global;

  $global.currentPageConfig = null;
  const { pagePath } = currentPageConfig;
  const { tabIndex } = currentPageConfig;

  if (tabIndex) {
    tabsConfig[pagePath] = tabIndex;
  }
  pagesConfig[pagePath] = {
    system: currentPageConfig,
    user: userConfig,
  };
  // do not use registerPage, all worker modules run at once
  // if use registerPage, need to do full ast parse(error prone)
  AppRegistry.registerComponent(pagePath, () => {
    return PageComponent;
  });
}
