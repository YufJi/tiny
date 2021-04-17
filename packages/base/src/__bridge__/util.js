
import { getCurrentPageImpl, getStartupParams, $global } from '../framework/dev';
import { APP_BIZ } from '../utils/LogBizType';
import objectKeys from '../utils/objectKeys';
import getHomePage from '@hulk/mp-core/es/utils/getHomePage';

function escapeDot(str) {
  return str.replace(/\./g, '_DOT_');
}
export function getAutoTrackerConfig(_pagePath) {
  let pagePath = _pagePath || '';
  if (!pagePath && getCurrentPageImpl()) {
    pagePath = getCurrentPageImpl().getPagePath();
  }

  const _getStartupParams = getStartupParams();
  const { appId } = _getStartupParams;

  return {
    spmId: `MiniApp_${appId}.${escapeDot(pagePath)}`,
    bizType: APP_BIZ(),
  };
}

const noop = function noop() {};

export function handleCallbackParams(params, resolve, reject) {
  const { success = noop, fail = noop, complete = noop, ...rest } = params;

  const newSuccess = function newSuccess(ret) {
    success(ret);
    if (resolve) {
      resolve(ret);
    }
    complete(ret);
  };
  const newFail = function newFail(ret) {
    fail(ret);
    if (reject) {
      reject(ret);
    }
    complete(ret);
  };
  return { success: newSuccess, fail: newFail, ...rest };
}

export function needBackHome() {
  const homepage = getHomePage();
  const tabs = objectKeys($global.tabsConfig);
  // 页面堆栈第一个元素
  const currentStackTop = getCurrentPagesImpl()[0].getPagePath();
  const notHomePage = homepage && currentStackTop !== homepage;
  return notHomePage && tabs.indexOf(currentStackTop) === -1;
}
