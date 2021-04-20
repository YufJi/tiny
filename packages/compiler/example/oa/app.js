const config = require('./config.js');
const lang = require('./utils/js/lang.js');

const client = typeof nwx == 'undefined' ? 'weixin' : 'nfes';
let env = "uat"; // dev环境
const localID = '20200514'; // 涉及到缓存的时候需要更新缓存的版本号
App({
  onLaunch: function () {
    let that = this;
    // 手动控制缓存的版本
    // 入股当前没有localID的时候，需要设置localID
    if (!wx.getStorageSync('localID') || wx.getStorageSync('localID') != localID) {
      wx.clearStorageSync();
      setTimeout(() => {
        wx.setStorageSync('localID', localID)
      }, 100);
    }; 
    if (client == 'nfes' && wx.getSystemInfoSync) {
      let info = wx.getSystemInfoSync();
      if (info.env == 'PROD') {
        env = 'prod';
      }
    }

    // 手动切换环境的时候
    if (env != wx.getStorageSync('env')) {
      wx.clearStorageSync(); // 清除缓存
    }
    config.update(env);

    // 获取当前用户的  "userEmpcode":
    // 用户信息
    that.getUserEmpcode(function () {
      // empty
    }, function () {
      wx.showToast({
        title: 'Invalid UserInfo',
        icon: 'none'
      });
    });

    // 系统信息
    that.getSystemLang(function (res) {
      let langT;
      if (res == "zh_CN") {
        langT = lang.lang_ZH;
      } else {
        langT = lang.lang_EN;
      }
      that.globalData.lang = langT;
      that.globalData.langStr = res;
      wx.setStorageSync("lang", langT);
      wx.setStorageSync("langStr", res);
    });
  },


  getUserEmpcode(successCallback, failCallback) {
    let AuthData = {
      userEmpcode: "",
      identityauth2: "",
    }
    let that = this;
    let wrapSuccessCallback = function () {
      wx.setStorageSync("userEmpcode", AuthData.userEmpcode);
      wx.setStorageSync("identityauth2", JSON.stringify(AuthData.identityauth2));
      successCallback && successCallback(AuthData);
      that.globalData.userEmpcode = AuthData.userEmpcode;
    };
    let wrapFailCallback = function () {
      failCallback && failCallback();
    };
    if (client == 'weixin') {
      AuthData = {
        userEmpcode: "S80060", // S18251
        identityauth2: {
          Str_Signature: "31854f8a58a0bbe49047310906ce4e57",
          SessionID: "71e078acb4ac479fa945ba6774d511adcCaddOfnk8rCOazxGjY34NoOBYZJ0ghk",
          Str_TimeStamp: "2020-01-12 15:07:15"
        }
      }
      wrapSuccessCallback(AuthData);
    } else {
      // 调取用户信息的接口数据
      wx.getUserInfo({
        success: function (res) {
          // 如果成功了，通过res的返回值去判断
          if (res.userInfo && res.userInfo.user_EmpCode && res.Str_Signature && res.SessionID && res.Str_TimeStamp) {
            // 可以拿到当前的用户的员工信息以及鉴权信息
            AuthData = {
              userEmpcode: res.userInfo.user_EmpCode,
              identityauth2: {
                Str_Signature: res.Str_Signature,
                SessionID: res.SessionID,
                Str_TimeStamp: res.Str_TimeStamp
              }
            }
            wrapSuccessCallback(AuthData)
          } else {
            wrapFailCallback();
          }
        },
        fail: function () {
          wrapFailCallback();
        }
      });
    }
  },
  getSystemLang(callback) {
    let lang = 'zh_CN';
    if (client && client == 'weixin') {
      lang = 'zh_CN'; // 中文的
    } else {
      // 调取系统信息的接口数据
      if (wx.getSystemInfoSync) {
        let info = wx.getSystemInfoSync();
        if (info && info.language) {
          lang = info.language == 'zh' ? 'zh_CN' : info.language;
        }
      }
    }
    callback(lang);
  },
  // _clearStorageSync(){

  // },
  globalData: {
    userEmpcode: null,
    lang: null,
  },
})
