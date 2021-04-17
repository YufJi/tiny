
import { EventHub, $global } from '../../../framework/dev';
import ap from '../../ap';
import { needBackHome } from '../../util';
import getHomePage from '@hulk/mp-core/es/utils/getHomePage';

const { callInternalAPI } = ap;

EventHub.addListener('pageLoad', (_ref) => {
  const { page } = _ref;

  if (needBackHome()) {
    callInternalAPI('showBackHome', {
      viewId: page.getViewId(),
    });
  }
});
ap.on('onBackHomeClick', () => {
  let homepage = getHomePage();
  if (homepage) {
    if (homepage.charAt(0) !== '/') {
      homepage = `/${homepage}`;
    }
    $global.bridge.reLaunch({
      url: homepage,
    });
  }
});
