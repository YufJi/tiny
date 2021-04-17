
import ap from '../../ap';
import { getCurrentPageImpl, EventHub } from '../../../framework/dev';
import setOptionMenuAPI from '../setOptionMenuAPI';

function getPageOptionMenuConfig(page) {
  const { mpAppJson = {} } = self;

  const pageConfig = mpAppJson[page.getPagePath()];
  const appConfig = mpAppJson.app;
  return pageConfig && pageConfig.optionMenu || appConfig && appConfig.window && appConfig.window.optionMenu;
}
function onOptionMenu(e) {
  const page = getCurrentPageImpl();
  if (page && page.publicInstance.onOptionMenuClick) {
    page.publicInstance.onOptionMenuClick(e);
  }
}
EventHub.addListener('pageLoad', ({ page }) => {
  if (setOptionMenuAPI.setOptionMenu) {
    const config = getPageOptionMenuConfig(page);
    if (config) {
      // 显式指定viewId,fix bug https://huoban.alipay.com/portal/issues/detail?defectId=hb_defect_249186
      setOptionMenuAPI.setOptionMenu(config, page.getViewId());
    }
  }
});
ap.on('tinyOptionMenu', onOptionMenu);
ap.on('optionMenu', onOptionMenu);
