const api = require('../../utils/js/api.js');
const app = getApp();
const eventChannel = require('../../utils/js/eventChannel.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 多语言变量
    textAddAgent: app.globalData.lang['OA_authupdateAndAdd_text_agent'],  //代理人
    textStartDate: app.globalData.lang['OA_authlist_text_startdate'],  //开始时间
    textEndDate: app.globalData.lang['OA_authupdateAndAdd_text_enddate'],  //结束时间
    textauThorize: app.globalData.lang['OA_authupdateAndAdd_text_authorize'],  //授权

    id: null, // 待修改数据id
    fullname:"", // 用户名 来自前一个页面
    rule: { // 修改请求参数
      beginDate: "",
      endDate: "",
      agent: "",
      creator: "",
      enabled: "Y",
      andRules: []
    },
    userInfo:{ // 用户信息 来自搜索组件
      uid:"",
      name:""
    },
    langStr:app.globalData.langStr
  },
  acceptDataFromOpenerPage: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let result = wx.getStorageSync('acceptDataFromOpenerPage').data;
    // this.acceptDataFromOpenerPage = eventChannel.on('acceptDataFromOpenerPage', (data) => {
      // let result = data.data;
      if (result){
        this.setData({
          id: result.id,
          'fullname': result.agent.fullname,
          'rule.beginDate': result.beginDate,
          'rule.endDate': result.endDate,
          'rule.agent': result.agent.account
        })
      }
    // })

    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_authUpdateAndAddCtrl_text_add'],
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
    let { uid, name } = this.data.userInfo;
    if (uid.length != 0 && name.length != 0){ 
      this.setData({
        'rule.agent': uid,
        'fullname': name
      })
    }
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
    // eventChannel.off('acceptDataFromOpenerPage', this.acceptDataFromOpenerPage);
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['eform_updateAccredit_view_title'],
    })
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

  },
  // 提交时间
  navRouterBack: function () {
    
    let { id, rule } = this.data;

    // 内容是否为空判断
    if (!rule.agent || !rule.beginDate || !rule.endDate){
      wx.showModal({
        title: '提示',
        content: '所有内容均为必填项',
        showCancel: false,
        success(res) {}
      })
      return ;
    }

    // 结束时间不能早于开始时间判断
    let start = new Date(rule.beginDate).getTime();
    let end = new Date(rule.endDate).getTime();
    if (start > end) {
      wx.showModal({
        title: '提示',
        content: '结束时间不能早于开始时间',
        showCancel: false,
        success(res) {}
      })
      return;
    }

    // 授权提醒
    wx.showLoading({
      title: app.globalData.lang['eform_AccreditListCtrl_item_status'],
    })

    // 根据id判断新增或者修改
    if (!!id) {
      api.PostData('itapp02_updateAgent_new', { id, rule }, function (res) {
        wx.navigateBack({
          url: '/pages/warrant/index'
        });
      })
    } else {
      api.PostData('itapp02_addAgentUser_new', { ...rule }, function (res) {
        wx.navigateBack({
          url: '/pages/warrant/index'
        });
      })
    }
  },
  // 修改开始时间
  bindBeginDateChange: function (e) {
    let date = e.detail.value
    this.setData({
      'rule.beginDate' : date
    })
  },
  // 修改结束时间
  bindEndDateChange: function (e) {
    let date = e.detail.value
    this.setData({
      'rule.endDate': date
    })
  },
  // 查询个人信息
  bindSearchAgent(e) {
    wx.navigateTo({
      url: '/pages/warrant/search'
    })
  },
})