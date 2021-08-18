import { onAppShow, onAppHide, offAppShow, offAppHide } from './AppEvents';
import { navigateTo, navigateBack, reLaunch, redirectTo, switchTab } from './Route';
import { showToast, hideToast, showLoading, hideLoading } from './UI';
import { getStorage, setStorage, getStorageSync, setStorageSync, getStorageInfo, getStorageInfoSync, clearStorage, clearStorageSync, removeStorage, removeStorageSync } from './Storage';

export {
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
};
