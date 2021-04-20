/**
 * 小程序配置文件
 */
// 接口请求的API

var config = {
  platform: wx.getSystemInfoSync().platform,
  get env () {
    return 'uat';
  },
  get apiHost () {
    let env = wx.getStorageSync('env');
    if (env == 'prod') {
      if (config.platform == 'devtools') {
        return 'http://itosgexternal.it.ctripcorp.com/api/';
      } else {
        return 'https://cchatws.ctrip.com/api/';
      }
    } else {
      return 'http://osg.uat.ops.qa.nt.ctripcorp.com/api/';
    }


  },
  get token () {
    let env = wx.getStorageSync('env');
    if (env == 'prod') {
      return '5c19a943160dc6d029ade17639318a6e';
    } else {
      return '231ca392549e3e6e1d0fbede446250a5';
    }
  },
  update: function (env) {
    wx.setStorageSync('env', env);
  }
};

module.exports = config;