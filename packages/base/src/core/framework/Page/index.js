
import AppRegistry from '../AppRegistry';
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
  AppRegistry.registerComponent(pagePath, () => {
    return PageComponent;
  });
}
