import { last } from 'lodash';

import { publish } from '../bridge';
import { getCurrentPages } from '../Route';
import { beforeInvoke, getRealRoute, checkUrlInConfig, invokeMethod, GlobalState, encodeUrlQuery } from './util';

export const navigateTo = (param) => {
  const pages = getCurrentPages();

  if (beforeInvoke('navigateTo', param, {
    url: '',
  })) {
    const realRoute = getRealRoute(last(getCurrentPages()).is, param.url);
    const finalRoute = encodeUrlQuery(realRoute);
    param.url = finalRoute;

    if (checkUrlInConfig('navigateTo', param.url, param)) {
      GlobalState.navigatorLock = true;
      invokeMethod('navigateTo', param, {
        beforeSuccess() {
          publish('onHide', {}, [last(pages).__webviewId__]);
        },
        afterFail() {
          GlobalState.navigatorLock = false;
        },
      });
    }
  }
};

export function navigateBack(param = {}) {
  if (typeof param.delta !== 'number') {
    param.delta = 1;
  } else {
    param.delta = parseInt(param.delta, 10);
    if (param.delta < 1) {
      param.delta = 1;
    }
  }

  invokeMethod('navigateBack', param);
}

export function reLaunch(param) {
  if (beforeInvoke('reLaunch', param, {
    url: '',
  })) {
    const path = last(getCurrentPages()).is;
    param.url = getRealRoute(path, param.url);
    param.url = encodeUrlQuery(param.url);

    if (checkUrlInConfig('reLaunch', param.url, param)) {
      GlobalState.navigatorLock = true;
      invokeMethod('reLaunch', param, {
        afterFail() {
          GlobalState.navigatorLock = false;
        },
      });
    }
  }
}

export const redirectTo = (param) => {
  if (beforeInvoke('redirectTo', param, {
    url: '',
  })) {
    const path = last(getCurrentPages()).is;
    param.url = getRealRoute(path, param.url);
    param.url = encodeUrlQuery(param.url);

    if (checkUrlInConfig('redirectTo', param.url, param)) {
      GlobalState.navigatorLock = true;
      invokeMethod('redirectTo', param, {
        afterFail() {
          GlobalState.navigatorLock = false;
        },
      });
    }
  }
};

export const switchTab = (param = {}) => {
  if (beforeInvoke('switchTab', param, {
    url: '',
  })) {
    param.url = param.url.replace(/\?.*$/, '');
    param.url = getRealRoute(last(getCurrentPages()).is, param.url);
    param.url = encodeUrlQuery(param.url);

    if (checkUrlInConfig('switchTab', param.url, param)) {
      GlobalState.navigatorLock = true;
      invokeMethod('switchTab', param, {
        afterFail() {
          GlobalState.navigatorLock = false;
        },
      });
    }
  }
};
