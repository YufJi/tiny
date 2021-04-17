
import Storage from '../shared/Storage';

function StorageAP(ap) {
  const { callSync } = ap;

  const storageImpl = ['setStorage', 'getStorage', 'getStorageInfo', 'removeStorage', 'clearStorage'];
  let storageAP = {};
  storageImpl.forEach((api) => {
    storageAP[`${api}Sync`] = {
      d: function d(opt) {
        return callSync(api, opt);
      },
    };
  });
  storageAP = { ...storageAP, ...Storage() };
  return storageAP;
}


export default StorageAP;
