import { defaults, noop } from 'lodash';
import AppModel from './model';
import loadApp from './loadApp';

let currentAppModel;

export function registerApp(options = {}) {
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
  loadApp(currentAppModel);
}

export function getApp() {
  return currentAppModel;
}
