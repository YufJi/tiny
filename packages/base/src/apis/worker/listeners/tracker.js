import { EventHub, getStartupParams } from '../../../framework/dev';
import ap from '../../ap';
import trackerStore from '../../../utils/trackerStore';
import { getAutoTrackerConfig } from '../../util';
import { SDKVersion } from '../../../utils/system';
import { TAC } from '../../../utils/LogBizType';

const { callBridge, callInternalAPI } = ap;

const SDKVersionParam = `SDKVersion=${SDKVersion}`;
EventHub.addListener('pageLoad', ({ page }) => {
  const { chInfo, app_startup_type } = getStartupParams();

  if (trackerStore.trackerEnabled) {
    callBridge('reportData', {
      spm: { chInfo, ...getAutoTrackerConfig(page.getPagePath()) },
      spmDetail: {
        app_startup_type,
      },
    });
  }
});

EventHub.addListener('launch', () => {
  callBridge('setTabBar', { actionType: 'enable' });
  callInternalAPI('onAppPerfEvent', {
    state: 'appLoaded',
  });
  callInternalAPI('setMpVersion', {
    mpVersion: SDKVersion,
  });
  callBridge('remoteLog', {
    bizType: TAC,
    type: 'behavior',
    actionId: 'event',
    seedId: 'app.launch',
    param4: SDKVersionParam,
  });
});
EventHub.addListener('foreground', (e) => {
  if (e && (e._scene || e.scene)) {
    callInternalAPI('onAppPerfEvent', {
      state: 'appResume',
    });
  }
});
let notFirstPage = false;
EventHub.addListener('pageReady', ({ page }) => {
  const perfData = {
    state: 'pageLoaded',
    page: page.getPagePath(),
  };
  if (notFirstPage) {
    perfData.loadTime = Date.now() - page.$startTime;
  } else {
    notFirstPage = true;
  }
  callInternalAPI('onAppPerfEvent', perfData);
});
