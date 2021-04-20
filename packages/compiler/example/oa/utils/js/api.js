const config = require('../../config.js');
const {errFunTips} = require('../../utils/js/util');
let hasLoading = false; // 判断如果已经在loading的状态不loading

var api = {
  // 接口鉴权的字段信息的获取；
  getIdentityAuth2(callback) {
    let identityauth2 = '';
    let wrapCallback = function () {
      if (identityauth2) {
        wx.setStorageSync("identityauth2", JSON.stringify(identityauth2));
      } else {
        identityauth2 = wx.getStorageSync("identityauth2");
      }
      callback && callback(identityauth2);
    };
    // 微信开发者工具的时候才进行mock数据
    if (config.platform == 'devtools') {
      // mock数据
      identityauth2 = JSON.stringify(
        { "Str_TimeStamp": "2020-05-13 10:16:28", "Str_Signature": "24e6232729a062f6c8c1707ffeae0106", "SessionID": "dev:5e489fd5071146309806c1c54d93a093kTDGGzg8jYjodoPCsmH7mURn0kGfJYlI" }
        );
      wrapCallback();
    } else {
      // 调取用户信息的接口数据
      wx.getUserInfo({
        success: function (res) {
          // 如果成功了，通过res的返回值去判断
          if (res.userInfo && res.Str_Signature && res.SessionID && res.Str_TimeStamp) {
            // 可以拿到当前的用户的员工信息以及鉴权信息
            identityauth2 = JSON.stringify({
              Str_Signature: res.Str_Signature,
              SessionID: res.SessionID,
              Str_TimeStamp: res.Str_TimeStamp
            });
          }
          wrapCallback();
        },
        fail: function () {
          wrapCallback();
        }
      });
    }
  },

  // 数据请求的封装
  PostData(url, data, callback, isShowLoading,complateCall) {
    // 是否需要发送loading，loading的拦截判断
    if (!isShowLoading && !hasLoading) {
      hasLoading = true;
      wx.showLoading({
        title: wx.getStorageSync('lang')['OA_loading_text'],
        icon: 'none'
      })
    }
    this.getIdentityAuth2(function (identityauth2) {
      wx.request({
        url: config.apiHost + url,
        data: {
          'access_token': config.token,
          'request_body': data,
        },
        method: 'POST', // 
        header: {
          "userEmpcode": wx.getStorageSync('userEmpcode'),
          "userlangsetting": wx.getStorageSync('langStr'),
          "identityauth2": identityauth2
        }, // 设置请求的 header
        success: function (res) {
          // 关闭loading
          if (!isShowLoading) {
            hasLoading = false;
            wx.hideLoading();
          }
          // 数据成功的
          if (res.statusCode === 200 || res.statusCode === 201) {
            callback(res); // code状态为200的时候进行数据的处理
          } else {
            // 提示报错
            if (!isShowLoading) {
              errFunTips(res);
            }
          }
        },
        fail: function (res) {
          // 关闭loading
          if (!isShowLoading) {
            hasLoading = false;
            wx.hideLoading();
          }
          // 提示报错
          errFunTips(res);
        },
        complete: function () {
          complateCall && complateCall();
        }
      })
    });
  }
}

module.exports = api;