const ua = navigator.userAgent || navigator.swuserAgent;
const _systemVersion = ua.match(/AlipayClient\/(\d+\.\d+\.\d+)/);
const _UCVersion = ua.match(/UCBS\/(\d+\.\d+)/);
// expose all functions for ant fortune app
const systemVersion = _systemVersion && _systemVersion[1] || '100.0.0';
const UCVersion = _UCVersion && _UCVersion[1] || '2.12';
const isAndroid = ua.indexOf('Android') > -1;
const isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
const isIDE = ua.indexOf('AlipayIDE') > -1;
const SDKVersion = '0.0.1';
const caches = {};
const cacheIntArray = {};
const isUC = !!(_UCVersion && _UCVersion[1]);
const isNativeComponent = isUC || isIOS;

function toIntArray(v) {
  if (cacheIntArray[v]) {
    return cacheIntArray[v];
  }
  const ret = [];
  const version = v.split('.');
  for (let i = 0; i < version.length; i+=1) {
    ret.push(parseInt(version[i], 10));
  }
  cacheIntArray[v] = ret;
  return ret;
}

function compareVersion(version, targetVersion) {
  if (version && targetVersion) {
    const key = `${version}__${targetVersion}`;
    if (key in caches) {
      return caches[key];
    }
    version = toIntArray(version);
    targetVersion = toIntArray(targetVersion);
    for (let i = 0, n1, n2; i < version.length; i+=1) {
      n1 = targetVersion[i] || 0;
      n2 = version[i] || 0;
      if (n1 > n2) {
        caches[key] = -1;
        break;
      }
      if (n1 < n2) {
        caches[key] = 1;
        break;
      }
    }
    caches[key] = caches[key] || 0;
    return caches[key];
  }
  return 0;
}

function logSystemInfo() {
  console.log(`${'SDKVersion: '}${SDKVersion}`);
}

function compareSystemVersion(targetVersion) {
  return compareVersion(systemVersion, targetVersion);
}

function compareUCVersion(targetVersion) {
  return compareVersion(UCVersion, targetVersion);
}

export {
  systemVersion,
  UCVersion,
  isAndroid,
  isIOS,
  isIDE,
  SDKVersion,
  isUC,
  isNativeComponent,
  compareVersion,
  logSystemInfo,
  compareSystemVersion,
  compareUCVersion,
};
