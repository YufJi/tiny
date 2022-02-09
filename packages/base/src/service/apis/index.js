import { onAppShow, onAppHide, offAppShow, offAppHide } from './AppEvents';
import { navigateTo, navigateBack, reLaunch, redirectTo, switchTab } from './Route';
import { showToast, hideToast, showLoading, hideLoading, setNavigationBarTitle } from './UI';
import { getStorage, setStorage, getStorageSync, setStorageSync, getStorageInfo, getStorageInfoSync, clearStorage, clearStorageSync, removeStorage, removeStorageSync } from './Storage';
import { getSystemInfoSync } from './System';
import { request } from './Request';
import { createAnimation } from './Animation';
import { createCanvasContext, canvasToTempFilePath } from './Canvas';
import { createSelectorQuery } from './SelectorQuery';

export * from './arrayBuffer';

export {
  request,

  onAppShow,
  onAppHide,
  offAppShow,
  offAppHide,

  navigateTo,
  navigateBack,
  reLaunch,
  redirectTo,
  switchTab,

  showToast,
  hideToast,
  showLoading,
  hideLoading,

  setNavigationBarTitle,

  getStorage,
  setStorage,
  getStorageSync,
  setStorageSync,
  getStorageInfo,
  getStorageInfoSync,
  clearStorage,
  clearStorageSync,
  removeStorage,
  removeStorageSync,

  getSystemInfoSync,

  createAnimation,

  createCanvasContext,
  canvasToTempFilePath,

  createSelectorQuery,
};
