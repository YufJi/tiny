import { beforeInvoke, invokeMethod } from './util';

export function showToast(param = {}) {
  const defaultParam = {
    duration: 1500,
    title: '',
    icon: 'success',
  };
  const paramDataType = {
    duration: 1,
    title: 'String',
    icon: 'String',
  };

  param = { ...defaultParam, ...param };

  if (['success', 'loading', 'fail', 'none'].indexOf(param.icon) === -1) {
    param.icon = 'success';
  } else if (param.icon === 'none') {
    param.icon = '';
  }

  if (beforeInvoke('showToast', param, paramDataType)) {
    invokeMethod('showToast', param);
  }
}

export function hideToast(param = {}) {
  invokeMethod('hideToast', param);
}

export function showLoading(param = {}) {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const coverParam = {
    icon: 'loading',
    duration: ONE_DAY_MS,
  };
  const paramDataType = {
    title: 'String',
  };

  param = Object.assign(param, coverParam);

  if (beforeInvoke('showLoading', param, paramDataType)) {
    invokeMethod('showToast', param, {
      beforeAll: function beforeAll(res) {
        res.errMsg = res.errMsg.replace('showToast', 'showLoading');
      },
    });
  }
}

export function hideLoading(param) {
  invokeMethod('hideToast', param, {
    beforeAll: function beforeAll(res) {
      res.errMsg = res.errMsg.replace('hideToast', 'hideLoading');
    },
  });
}

export function setNavigationBarTitle() {

}
