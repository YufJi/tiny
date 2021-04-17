
import ap from '../ap.worker';
import { compareSystemVersion } from '../../utils/system';
import { arrayBufferToBase64, base64ToArrayBuffer } from '../../utils/arrayBuffer';

const { callBridge, callBridgeSync } = ap;

const g10138 = compareSystemVersion('10.1.38') >= 0;
const FSManage = 'fsManage';
const Stat = function Stat(res) {
  this.mode = res.mode;
  this.size = res.size;
  this.lastAccessedTime = res.lastAccessedTime;
  this.lastModifiedTime = res.lastModifiedTime;
  Object.defineProperty(this, 'isDirectory', {
    value: function value() {
      return res.is_directory;
    },
  });
  Object.defineProperty(this, 'isFile', {
    value: function value() {
      return res.is_file;
    },
  });
};
function handleStatsRes(res) {
  if (res.error) {
    return res;
  }
  let stats = {};
  if (Array.isArray(res.stats)) {
    res.stats.forEach((item) => {
      stats[item.path] = {
        path: item.path,
        stats: new Stat(item.stats),
      };
    });
  } else {
    stats = new Stat(res.stats);
  }
  return { stats };
}
function handleParamsBeforeCall(method, params) {
  if (['appendFile', 'writeFile'].indexOf(method) > -1) {
    if (params.data instanceof ArrayBuffer && params.data.byteLength !== undefined) {
      params.dataType = 'ArrayBuffer';
      params.data = arrayBufferToBase64(params.data);
    }
  }
  return params;
}
function handleResAfterCall(method, res) {
  if (method === 'readFile' && res.dataType === 'ArrayBuffer') {
    res = base64ToArrayBuffer(res.data);
  }
  if (method === 'stat') {
    res = handleStatsRes(res);
  }
  return res;
}
function FileSystemManager() {}

const fileSystemManagerProto = FileSystemManager.prototype = {};

['mkdir', 'rmdir', 'readdir', 'writeFile', 'copyFile', 'readFile', 'saveFile', 'appendFile', 'removeSavedFile', 'getSavedFileList', 'getFileInfo', 'access', 'rename', 'unlink', 'unzip', 'stat'].forEach((m) => {
  fileSystemManagerProto[m] = function (params = {}) {
    const { success, fail, complete, ...rest } = params;

    callBridge(FSManage, { action: m, ...handleParamsBeforeCall(m, rest) }, (res) => {
      res = handleResAfterCall(m, res);
      if (res.error) {
        if (fail) {
          fail(res);
        }
      } else if (success) {
        success(res);
      }
      if (complete) {
        complete(res);
      }
    });
  };
  if (m !== 'unzip') {
    fileSystemManagerProto[`${m}Sync`] = function (params = {}) {
      const res = callBridgeSync(FSManage, { action: m, ...handleParamsBeforeCall(m, params) });
      return handleResAfterCall(m, res);
    };
  }
});
const api = g10138 ? {
  getFileSystemManager: function getFileSystemManager() {
    return new FileSystemManager();
  },
} : {};

export default api;
