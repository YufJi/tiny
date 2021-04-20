const api = require('../../utils/js/api.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textAddJoiner: app.globalData.lang['OA_joiner_text_add'],  //添加会签人
    textAddJoinerList: app.globalData.lang['OA_joiner_text_addedlist'],  //请填写添加会签人的理由
    textAddJoinerSelect: app.globalData.lang['OA_joiner_text_select'],  //选填
    btnAddConfirm: app.globalData.lang['OA_index_alert_confirm'],  //确定

    userInfo: { // 用户信息 来自搜索组件
      uid: "",
      name: "",
      avatar: ""
    },
    flowData:[], // 会签人员
    value:"", // 会签原因
    actionId:"",
    activityId:""
  },


  //搜索框自动激活

  //添加搜索结果

  //点击删除icon删除对应会签人



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { actionId, activityId} = options;
    this.setData({
      actionId,
      activityId
    });
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
    let that = this;
    let { uid, name } = that.data.userInfo;
    if (uid.length != 0 && name.length != 0)  {
      let info = { id: uid, name: name};
      let arr = that.data.flowData;

      let result = arr.some(item => {
        if (item.id == info.id) {
          return true
        }
      })

      if (!result) {
        let data = {
          "empcode": uid
        }
         // itapp02GetEmpInfo --- 暂用的地址，itapp01_getEmpInfo 这个接口暂时不对外网开放
        // 暂时兼容生产和uat
        let env = wx.getStorageSync('env');
        let urlGetEmpInfo = env === 'prod' ? 'itapp02GetEmpInfo' : 'itapp01_getEmpInfo';
        api.PostData(urlGetEmpInfo, data, function (res) {
          info.avatar = res.data.avatar;
          arr.unshift(info);
          that.setData({
            flowData: arr
          });
        })
      }
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
  openSearch: function(){
    wx.navigateTo({
      url: '/pages/detail/search'
    })
  },
  deleteInfo:function(e){
    let {id} = e.currentTarget.dataset;
    let arr = this.data.flowData;

    arr = arr.filter(res => {
      return res.id != id
    });

    this.setData({
      flowData: arr
    });

  },
  inputFun: function(e){
    this.setData({
      value: e.detail.value
    });
  },
  submitAddFlow:function() {
    let that = this;
    let { actionId, activityId, value } = that.data;
    let userIds = this.data.flowData;
    userIds = userIds.map(res => {
      return res.id
    });

    if (!userIds.length) {
      wx.showModal({
        title: app.globalData.lang['OA_index_alert_prompt'], //'提示'
        content: app.globalData.lang['OA_joiner_text_add_prompt'],  //'添加会签人不能为空',
        showCancel: false,
        confirmText: app.globalData.lang['OA_index_alert_confirm'],
        success(res) { }
      })
      return;
    }

    let data = {
      id: activityId,
      action: actionId,
      userIds,
      remark: value
    }

    api.PostData(`itapp02_counterSign`, data, function (res) {
      if (res.statusCode == 200 ){
        var that = this;
        let pages = getCurrentPages(); //页面栈
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          loadAgain: true //获取上上级页面传的参数
        })
        wx.navigateBack()
      }
    })
  }
})