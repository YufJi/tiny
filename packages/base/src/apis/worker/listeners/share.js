import ap from '@/apis/ap';
import { EventHub, getAppImpl, getCurrentPageImpl, getStartupParams } from '@/framework/';
import trackerStore from '@/utils/trackerStore';
import { isAndroid, SDKVersion } from '@/utils/system';
import escapeLogParams from '@/utils/escapeLogParams';
import { getAutoTrackerConfig } from '@/apis/util';

const { callBridge, callInternalAPI } = ap;

EventHub.addListener('pageLoad', ({ page }) => {
  if (getAppImpl().launchOptions.scene !== 'miniService') {
    page.startShare = startPageShare;
    page.shareToAlipayContact = shareToAlipayContact;
  } else if (page.publicInstance.onShareAppMessage) {
    callBridge('setShowShareMenu', { showShareMenu: true });
  }
});

function shareToAlipayContact(e) {
  if (this && this.publicInstance.onShareAppMessage) {
    const options = {};
    if (e && e.target && e.target.tagName === 'button') {
      options.from = 'button';
      options.target = e.target;
    }
    const shareInfo = this.publicInstance.onShareAppMessage(options);
    // 配置了自定义分享，但是没有返回值，给开发者提示报错
    if (typeof shareInfo !== 'object') {
      // 提示开发者
      console.error('请检查onShareAppMessage代码，需要返回一个对象，并包含必填参数');
      return null;
    }
    nativeShare.call(this, 'shareToAlipayContact', shareInfo);
  }
}

function nativeShare(shareTo, shareInfo = {}) {
  const { fail, success, complete, path, ...rest } = shareInfo;

  callInternalAPI(shareTo, { ...rest, page: path || this.getPagePath() }, (e) => {
    logShare(e);
    // 分享API调用失败
    if (!e.shareResult && fail) {
      fail(e);
    }
    if (e.shareResult && success) {
      success(e);
    }
    if (complete) {
      complete(e);
    }
  });
}
ap.on('afterShare', (e) => {
  logShare(e.data);
});

function startPageShare(e) {
  const useOldShare = 'ap' === 'dd';
  const pageShareAppMessage = this && this.publicInstance.onShareAppMessage;
  const globalShareAppMessage = getAppImpl().publicInstance.onShareAppMessage;

  let shareInfo;
  if (typeof pageShareAppMessage === 'function' || typeof globalShareAppMessage === 'function') {
    const options = {
      from: 'menu',
    };
    if (e && e.data && e.data.webViewUrl) {
      options.webViewUrl = e.data.webViewUrl;
    }
    if (e && e.target && e.target.tagName === 'button') {
      options.from = 'button';
      options.target = e.target;
    }
    if (pageShareAppMessage) {
      shareInfo = pageShareAppMessage.call(this.publicInstance, options);
    } else {
      shareInfo = globalShareAppMessage.call(getAppImpl().publicInstance, options);
    }
    // 配置了自定义分享，但是没有返回值，给开发者提示报错
    if (typeof shareInfo !== 'object') {
      // 提示开发者
      console.error('请检查onShareAppMessage代码，需要返回一个对象，并包含必填参数');
      return null;
    }
    if (useOldShare) {
      shareAppMessage.call(this, shareInfo);
    } else {
      nativeShare.call(this, 'shareTinyAppMsg', shareInfo);
    }
  } else if (!useOldShare) {
    callInternalAPI('shareTinyAppMsg', {
      page: this.getPagePath(),
    }, (e) => {
      logShare(e);
    });
  }
}

ap.on('onShare', (e) => {
  const page = getCurrentPageImpl();
  startPageShare.call(page, e);
});

function logShare(data) {
  if (trackerStore.trackerEnabled) {
    callBridge('remoteLog', {
      ...getAutoTrackerConfig(),
      actionId: 'auto_share',
      param4: escapeLogParams({
        SDKVersion,
        channel: data.channelName,
        shareResult: data.shareResult,
      }),
    });
  }
}

function shareAppMessage(info) {
  let { path } = info;

  if (!path) {
    path = this.getPagePath();
  }
  if (path.charAt(0) === '/') {
    path = path.slice(1);
  }

  let { appId, parentAppId } = getStartupParams();

  if (getAppImpl().launchOptions.scene === 'miniService') {
    appId = parentAppId;
  }
  const opt = {
    title: info.title,
    desc: info.desc,
    url: `alipays://platformapi/startapp?appId=${appId}&page=${encodeURIComponent(path)}`,
  };
  const cb = function cb(data) {
    logShare(data);
    if (data.shareResult && info.success) {
      info.success(data);
    }
    if (!data.shareResult && info.fail) {
      info.fail(data);
    }
    if (info.complete) {
      info.complete(data);
    }
  };
  callBridge('setToolbarMenu', {
    menus: [],
    override: true,
  });
  callBridge('startShare', {
    bizType: 'H5App_DD',
    sendEvent: false,
    onlySelectChannel: ['Weibo', 'ALPContact', 'ALPTimeLine', 'SMS', 'Weixin', 'WeixinTimeLine', 'QQ', 'QQZone', 'DingTalkSession'],
  }, ({ message = '', channelName }) => {
    if (message.indexOf('canceled') >= 0) {
      return;
    }
    callBridge('getAppInfo', {
      appId,
      stageCode: '',
    }, ({ iconUrl, name }) => {
      // url带上分享渠道
      const url = `${opt.url}&chInfo=ch_share__chsub_${channelName}`;
      let opts = {
        name: channelName,
        param: {
          title: opt.title,
          content: opt.desc,
          imageUrl: iconUrl,
          captureScreen: false,
          url,
          contentType: 'url',
        },
      };
      const blacklist = ['Weixin', 'QQ', 'WeixinTimeLine', 'QQZone'];
      if (blacklist.indexOf(channelName) !== -1) {
        // 自定义吱口令文案
        let content = '';
        if (info.content) {
          content = info.content.substring(0, 28);
        }
        opts.url = '';
        let appName = '';
        if (name) {
          appName = `[${name}]`;
        }
        opts.param.otherParams = {
          bizType: 'COMMON_CONFIG',
          shareTitle: '',
          iconURL: iconUrl,
          btn1: '取消',
          btn2: '去看看',
          btn2A: url,
          preContent: `${content}#\u5431\u53E3\u4EE4#\u957F\u6309\u590D\u5236\u6B64\u6761\u6D88\u606F\uFF0C\u6253\u5F00\u652F\u4ED8\u5B9D\u5373\u53EF\u4F7F\u7528${appName}\u5C0F\u7A0B\u5E8F`,
        };
      }
      if (channelName === 'Weibo') {
        opts.param.url = `https://ds.alipay.com/?scheme=${encodeURIComponent(url)}`;
      }
      if (channelName === 'ALPTimeLine' && opt.desc) {
        opts.param.title += ` - ${opt.desc}`;
      }
      if (channelName === 'ALPContact') {
        opts = {
          name: channelName,
          param: {
            contentType: 'tinyApp',
            title: opt.title || name,
            content: opt.desc || '',
            url,
            otherParams: {
              appName: name,
              appIcon: iconUrl,
              appType: '小程序',
            },
          },
        };
        const { imageUrl } = info;

        if (imageUrl) {
          callInternalAPI('getShareImageUrl', {
            originalImageUrl: imageUrl,
          }, (res) => {
            if (res.error) {
              opts.param.imageUrl = imageUrl;
            } else {
              opts.param.imageUrl = res.imageUrl;
            }
            shareToChannel();
          });
        } else {
          callBridge('snapshot', {
            range: isAndroid ? 'embedview' : 'screen',
            dataType: 'fileURL',
            saveToGallery: false,
          }, (snapshotResult) => {
            if (snapshotResult.fileURL) {
              callBridge('uploadImage', {
                data: snapshotResult.fileURL,
                dataType: 'fileURL',
                compress: 3,
                business: 'multiMedia',
              }, (uploadResult) => {
                if (uploadResult.multimediaID) {
                  opts.param.iconUrl = uploadResult.multimediaID;
                }
                shareToChannel();
              });
            } else {
              shareToChannel();
            }
          });
        }
      } else {
        shareToChannel();
      }
      function shareToChannel() {
        callBridge('shareToChannel', opts, cb);
      }
    });
  });
}
