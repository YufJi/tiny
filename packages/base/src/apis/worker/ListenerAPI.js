import { getCurrentPageImpl } from '../../framework/dev';
import ap from '../ap';
import './listeners/backHome';
import './listeners/optionMenu';
import './listeners/share';
import './listeners/tracker';

ap.on('titleClick', () => {
  const page = getCurrentPageImpl();
  if (page && page.publicInstance.onTitleClick) {
    page.publicInstance.onTitleClick();
  }
});
ap.on('firePullToRefresh', (e) => {
  const page = getCurrentPageImpl();
  if (page) {
    const data = e.data || {};
    const from = data.from || 'manual';
    page.pullDownRefresh({ from });
  }
  return false;
});
ap.on('pullIntercept', () => {
  const page = getCurrentPageImpl();
  if (page && page.publicInstance.onPullIntercept) {
    page.publicInstance.onPullIntercept();
  }
});
