import { getCurrentPageImpl } from '@/framework/';
import trackerStore from '@/utils/trackerStore';

export default ({
  setTrackerConfig: function setTrackerConfig(trackerConfig) {
    trackerStore.trackerConfig = trackerConfig;
  },
  collectRemoteTrackerData: function collectRemoteTrackerData(eventCode, payload) {
    getCurrentPageImpl().callRemote('bridge.$trackerAPI', 'collectTrackerData', getCurrentPageImpl().getId(), eventCode, payload);
  },
  reportRemoteTrackerData: function reportRemoteTrackerData(eventCode, payload) {
    getCurrentPageImpl().callRemote('bridge.$trackerAPI', 'reportTrackerData', getCurrentPageImpl().getId(), eventCode, payload);
  },
});
