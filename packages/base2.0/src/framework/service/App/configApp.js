import { defaults, wrap, noop } from 'lodash';
import { wrapAppLifetime } from '../utils/wrapfn';
import { error } from '../utils/log';

let onAppCreate;
let currentAppModel;

export default function configApp(_onAppCreate) {
  onAppCreate = _onAppCreate;
}

function registerApp(options = {}) {
  if (currentAppModel) {
    throw new Error('App can only register once');
  }

  const init = { ...options };
  defaults(init, {
    globalData: {},
    onLaunch: noop,
    onShow: noop,
    onHide: noop,
    onError: noop,
  });

  currentAppModel = new AppModel(init);
  onAppCreate && onAppCreate(currentAppModel);
}

function getApp() {
  return currentAppModel;
}

function AppModel(init) {
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

export {
  registerApp,
  getApp,
};
