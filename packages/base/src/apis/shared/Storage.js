export default function storage() {
  return {
    setStorage: {
      m: 'setTinyLocalStorage',
      b: function b(opt) {
        opt.value = JSON.stringify({ APDataStorage: opt.data });
        opt.data = opt.value;
        opt.key = String(opt.key);
        opt.type = 'user';
      },
    },
    getStorage: {
      m: 'getTinyLocalStorage',
      b: function b(opt) {
        opt.key = String(opt.key);
        opt.type = 'user';
      },
      a: function a(res) {
        if (res.error === 11) {
          res.data = null;
          delete res.error;
          delete res.errorMessage;
          delete res.success;
        }
        if (res.data) {
          const data = JSON.parse(res.data);
          res.data = data.APDataStorage;
        }
      },
    },
    removeStorage: {
      m: 'removeTinyLocalStorage',
      b: function b(opt) {
        opt.key = String(opt.key);
        opt.type = 'user';
      },
    },
    clearStorage: {
      m: 'clearTinyLocalStorage',
      b: function b(opt) {
        opt.type = 'user';
      },
    },
    getStorageInfo: {
      m: 'getTinyLocalStorageInfo',
    },
  };
}
