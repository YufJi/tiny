import { isAndroid } from '../../utils/system';

export default (function (ap) {
  return {
    onUserCaptureScreen: {
      m: 'screenshotbyuser',
      b: function b() {
        if (isAndroid) {
          ap.callBridge('addScreenshotListener');
        }
      },
    },
    offUserCaptureScreen: {
      m: 'screenshotbyuser',
    },
  };
});
