import $global from '../common/global';
import startsWith from '@/utils/startsWith';
import { getStartupParams } from '@/utils/startupParams';

const g = self;

function getSubPackageByPage(page) {
  const { mpAppJson } = g;

  if (!mpAppJson || !mpAppJson.app.subPackages) {
    return false;
  }
  const { subPackages } = mpAppJson.app;

  for (let i = 0; i < subPackages.length; i++) {
    const p = subPackages[i];
    if (startsWith(page, `${p.root}/`)) {
      return p.root;
    }
  }
  return false;
}
const packageMap = {};
const packageListeners = {};

g.bootstrapSubPackage = function (subPackage, { success }) {
  packageMap[subPackage] = 1;
  success();
  if (packageListeners[subPackage]) {
    packageListeners[subPackage]();
    delete packageListeners[subPackage];
  }
};
const isWorker = typeof importScripts !== 'undefined';

function loadPackageScript(subPackage, callback) {
  const url = `/${subPackage}`;
  if (isWorker) {
    importScripts(`${url}/index.worker.js`);
    callback();
  } else {
    const script = document.createElement('script');
    script.src = `${url}/index.js`;
    document.head.appendChild(script);
    // do not use script.onload
    packageListeners[subPackage] = callback;
  }
}
export function loadPage(pagePath, doLoad) {
  const isCli = getStartupParams().mpCli;
  const subPackage = getSubPackageByPage(pagePath);

  if (subPackage) {
    const callBridge = $global.bridge.call;
    if (packageMap[subPackage]) {
      doLoad();
    } else {
      if (isWorker) {
        callBridge('showLoading');
      }
      function doLoadScript() {
        loadPackageScript(subPackage, () => {
          if (isWorker) {
            $global.bridge.call('hideLoading');
          }
          doLoad();
        });
      }
      if (isCli) {
        doLoadScript();
      } else {
        callBridge('loadSubPackage', {
          packages: [subPackage],
        }, doLoadScript);
      }
    }
  } else {
    doLoad();
  }
}
