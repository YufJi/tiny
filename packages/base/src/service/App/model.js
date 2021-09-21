import { wrapAppLifetime } from '../utils';

export default function AppModel(init) {
  this.is = 'App';

  const { globalData, onLaunch, onShow, onHide, onError, ...rest } = init;

  this.globalData = globalData;
  this.onLaunch = wrapAppLifetime.call(this, 'onLaunch', onLaunch);
  this.onShow = wrapAppLifetime.call(this, 'onShow', onShow);
  this.onHide = wrapAppLifetime.call(this, 'onHide', onHide);

  // error 不需要捕获上报避免死循环
  this.onError = function (message) {
    try {
      return onError(message);
    } catch (e) {
      error('at app.js App.onError', e);
    }
  };

  Object.assign(this, rest);
}
