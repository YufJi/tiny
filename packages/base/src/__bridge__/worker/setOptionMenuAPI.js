
import ap from '../ap';
import { isAndroid } from '../../utils/system';

const { callInternalAPI } = ap;

let setOptionMenuKey = 'setOptionMenu';
let showOptionMenuKey = 'showOptionMenu';
const shouldCallTinyOptionMenu = !isAndroid;
if (shouldCallTinyOptionMenu) {
  setOptionMenuKey = 'setTAOptionMenu';
  showOptionMenuKey = 'showTAOptionMenu';
}
const api = {
  setOptionMenu: function setOptionMenu(config, viewId) {
    callInternalAPI(setOptionMenuKey, { ...config, viewId, bizType: 'tiny' });
    callInternalAPI(showOptionMenuKey, {
      viewId,
    });
  },
};

export default api;
