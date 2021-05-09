import callInternalAPI from './callInternalAPI';
import callBridge from './callBridge';
import { SDKVersion, systemVersion } from './system';
import escapeLogParams from './escapeLogParams';

let did = '';
let version = '';
let appId = '';
let fromIDE;
let cluePID;
function stringify(obj) {
  const arr = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push(`${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`);
    }
  }
  return arr.join('&');
}
function _reportError(code, e) {
  if (appId === '') {
    const startupParams = window.JSBridge && window.JSBridge.startupParams;
    if (startupParams && startupParams.version) {
      version = startupParams.version;
      fromIDE = startupParams.fromIDE;
      appId = startupParams.appId;
    }
    if (cluePID === undefined && startupParams && startupParams.cluePID) {
      cluePID = startupParams.cluePID;
    }
  }
  if (!fromIDE && did !== 'unknown') {
    const ua = navigator.userAgent;
    const error = e.error || {};
    const col = error.column || `_${e.col || '-1'}`;
    const line = error.line || `_${e.line || '-1'}`;
    const msg = `${error.message || e.msg}^${line}^${col}`;
    const errorUrl = error.sourceURL || `_${e.url || '__errorUrl'}`;
    const option = {
      pid: 'miniprogram',
      code,
      msg,
      uid: did,
      page: location.href,
      ua,
      rel: version,
      c1: SDKVersion,
      c2: appId,
      c3: systemVersion,
      c4: errorUrl,
      c5: error.stack,
    };
    const fsp = new Image();
    fsp.src = `https://gm.mmstat.com/fsp.1.1?${stringify(option)}`;
    if (appId !== '') {
      const fspForSingleApp = new Image();
      option.pid = `miniprogram-${cluePID || appId}`;
      fspForSingleApp.src = `https://gm.mmstat.com/fsp.1.1?${stringify(option)}`;
    }
    callBridge('remoteLog', {
      type: 'error',
      seedId: 'H5_CUSTOM_ERROR',
      param1: `H5_CUSTOM_ERROR_TINY_${code}`,
      param3: escapeLogParams({
        errorMsg: msg,
        errorUrl,
        SDKVersion,
      }),
    });
  }
}
export default function reportError(code, e) {
  if ( true && !did) {
    callInternalAPI('getUserInfo', (result) => {
      if (result && result.userId) {
        did = result.userId;
        _reportError(code, e);
      } else {
        callInternalAPI('getConfig', {
          configKeys: ['did'],
        }, (result) => {
          if (result && result.data && result.data.did) {
            did = result.data.did;
          } else {
            did = 'unknown';
          }
          _reportError(code, e);
        });
      }
    });
  } else {
    _reportError(code, e);
  }
}
