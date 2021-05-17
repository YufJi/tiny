import PageRegistry from '../PageRegistry';
import $global from '../common/global';
import PageComponent from '../legacy/PageComponent';

export default function Page(setupConfig) {
  const { pagePath, tabIndex } = setupConfig;

  if (typeof tabIndex === 'number') {
    $global.tabsConfig[pagePath] = tabIndex;
  }
  $global.pagesConfig[pagePath] = {
    system: setupConfig,
  };
  PageRegistry.registerComponent(pagePath, () => {
    return PageComponent;
  });
}
