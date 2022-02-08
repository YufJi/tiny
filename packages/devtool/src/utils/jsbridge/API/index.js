import { navigateTo, navigateBack, navigateToDone } from './navigation';
import { publish } from './publish';
import getLaunchOptionsSync from './launchOptions';
import { showToast, setNavigationBarTitle } from './ui';
import { getStorageSync, setStorageSync } from './storage';
import { getSystemInfoSync } from './system';
import { createRequestTask } from './request';
import { measureText } from './measureText';

export default {
  publish,
  navigateTo,
  navigateBack,
  navigateToDone,

  getLaunchOptionsSync,

  showToast,
  setNavigationBarTitle,

  getStorageSync,
  setStorageSync,

  getSystemInfoSync,
  /* request */
  createRequestTask,

  measureText,
};
