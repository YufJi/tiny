import { getAppImpl } from '@/framework/App';
import getCurrentViewId from '@/utils/getCurrentViewId';

import invalidNavigateTo from './invalidNavigateTo';
import { handleResultCallback } from './util';
import ap from './ap';

export function getNavigationAPI(ap) {
  const { callBridge } = ap;

  function doSwitch({ pagePath }, recreate) {
    callBridge('switchTab', {
      tag: pagePath,
      recreate,
    });
  }

  function doPush({ url, pagePath, viewId }, param) {
    callBridge('pushWindow', {
      url,
      viewId,
      launchParamsTag: pagePath,
      param,
    });
  }

  return {
    reLaunch(params) {
      getAppImpl().reLaunch({
        url: params.url,
      }, {
        pushWindow: function pushWindow(param) {
          return doPush(param, {
            closeAllWindow: true,
            animationType: 'none',
          });
        },
        switchTab: function switchTab(param) {
          return doSwitch(param, true);
        },
      });

      handleResultCallback(params);
    },
    navigateTo(params) {
      if (invalidNavigateTo(params)) {
        return;
      }
      getAppImpl().navigateTo({
        url: params.url,
        viewId: params.viewId,
      }, { pushWindow: doPush });

      handleResultCallback(params);
    },
    switchTab(params) {
      getAppImpl().switchTab({
        url: params.url,
      }, { doSwitch });

      handleResultCallback(params);
    },
    redirectTo(params) {
      getAppImpl().redirectTo({
        url: params.url,
      }, {
        pushWindow: function pushWindow(param) {
          doPush(param, {
            closeCurrentWindow: true,
            animationType: 'none',
          });
        },
      });

      handleResultCallback(params);
    },
    navigateBack(params = {}) {
      const error = getAppImpl().navigateBack({
        delta: params.delta,
      }, ({ delta }) => {
        callBridge('popTo', {
          delta,
        });
      });

      if (error) {
        handleResultCallback(params, {
          error,
        });
      } else {
        handleResultCallback(params);
      }
    },
  };
}

export default getNavigationAPI(ap);
