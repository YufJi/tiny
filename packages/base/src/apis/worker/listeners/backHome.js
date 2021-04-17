
import { EventHub, $global } from '@/core/framework/';
import getHomePage from '@/utils/getHomePage';
import ap from '../../ap';
import { needBackHome } from '../../util';

const { callInternalAPI } = ap;

EventHub.addListener('pageLoad', ({ page }) => {
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
