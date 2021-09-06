import { invokeNative } from '../bridge';

let systemInfo = {};

function checkObjectKeys(obj) {
  const keysArr = [];

  for (const key in obj) {
    keysArr.push(key);
  }

  return keysArr.length;
}

export function getSystemInfoSync() {
  if (!checkObjectKeys(systemInfo)) {
    const res = invokeNative('getSystemInfoSync');

    if (res.errMsg.startsWith('getSystemInfoSync:ok')) {
      systemInfo = res.data;
    }
  }

  return systemInfo;
}
