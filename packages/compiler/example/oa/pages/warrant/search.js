// pages/warrant/search.js
const api = require('../../utils/js/api.js');
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    titeSelectagent: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_selectagent'],  //选择代理人
    titeAgentHistory: app.globalData.lang['OA_authupdateAndAdd_text_authorize_history'],  //代理授权历史

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_selectagent'],  //选择代理人
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})