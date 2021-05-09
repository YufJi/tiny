function doOpenTaobao(callBridge, url, login, result) {
  if ('installed' in result) {
    if (result.installed) {
      if (login) {
        callBridge('getLoginToken', {}, (res) => {
          let loginToken = null;
          let encrypted = false;
          if ('token' in res && res.token !== '') {
            loginToken = res.token;
            encrypted = res.encrypted;
          }
          if (loginToken) {
            url += `&loginToken=${loginToken}&tokenEncrypted=${encrypted}`;
          }
          callBridge('openInBrowser', {
            url,
          });
        });
      } else {
        callBridge('openInBrowser', {
          url,
        });
      }
    } else {
      callBridge('openInBrowser', {
        url: 'https://h5.m.taobao.com/bcec/downloadTaobao.html',
      });
    }
  }
}

export function openTaobao(fn) {
  return {
    d: function d(opt) {
      const callBridge = fn();
      callBridge('isInstalledApp', {
        packagename: 'com.taobao.taobao',
        scheme: 'taobao://',
      }, (res) => {
        doOpenTaobao(callBridge, opt.url, opt.login, res);
      });
    },
  };
}
