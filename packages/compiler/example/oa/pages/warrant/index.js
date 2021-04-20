const api = require('../../utils/js/api.js'); 
const {isArr} = require('../../utils/js/util.js'); 
const app = getApp();
const eventChannel = require('../../utils/js/eventChannel.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    titeAccredit: app.globalData.lang['eform_updateAccredit_view_title'],  //审批授权
    btnAddAccredit: app.globalData.lang['OA_authUpdateAndAddCtrl_text_add'],  //新增授权
    textAddAgent: app.globalData.lang['OA_authupdateAndAdd_text_agent'],  //代理人
    textStartDate: app.globalData.lang['OA_authlist_text_startdate'],  //开始时间
    textEndDate: app.globalData.lang['OA_authupdateAndAdd_text_enddate'],  //结束时间
    btnUpdateAgent: app.globalData.lang['OA_authUpdateAndAddCtrl_text_update'],  //修改授权
    btnEndAgent: app.globalData.lang['OA_authUpdateAndAddCtrl_text_end'],  //结束授权
    btnDelAgent: app.globalData.lang['OA_authupdateAndAdd_text_delete'],  //删除授权
    loading: app.globalData.lang['OA_loading_text'],   //加载中
    textNotStarted: app.globalData.lang['OA_authListCtrl_status_NotStarted'],   //未开始
    textOngoing: app.globalData.lang['OA_authListCtrl_status_ongoing'],   //进行中
    textCompleted: app.globalData.lang['OA_authListCtrl_status_completed'],   //已结束
    textAlertCounts: app.globalData.lang['OA_authlist_alert_counts'], 
    textAlertPrompt: app.globalData.lang['OA_index_alert_prompt'],      //提示
    textAlertConfirmdelete: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_confirmdelete'],    //确认删除该授权？
    textAlertConfirmend: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_confirmend'],    //确认结束该授权？

    warrantList: [], // 列表数据
    warrantListStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['eform_updateAccredit_view_title'],
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
    this.getAgentList();
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
  // 获取授权列表
  getAgentList: function(e) {
    let that = this;
    let now = new Date().getTime();
    wx.showLoading({
      title: that.data.loading
    })
    api.PostData('itapp02_getAgentList', {}, function (res) {
      let result = [];
      
      if (res.data && isArr(res.data)){
        let resData = res.data;
        let key = 'status';
        let doData = [], doingData = [], doneData = [];
        // 按照是否完成分三个数组中
        resData.map(res => {
          let start = new Date(res.beginDate).getTime();
          let end = new Date(res.endDate).getTime();
          if (res.enabled === 'Y') {
            if (now < start) {
              res[key] = 'do';
              doData.push(res);
            } else if (start <= now && end >= now) {
              res[key] = 'doing';
              doingData.push(res);
            } else if (end <= now) {
              res[key] = 'done';
              doneData.push(res);
            }
          } else {
            res[key] = 'done';
            doneData.push(res);
          }
        })
        // 数组内排序
        that.sortFun(doingData);
        that.sortFun(doData);
        that.sortFun(doneData);
        result = [...doingData, ...doData, ...doneData];
      }
      that.setData({
        warrantList: result,
        warrantListStatus: true
      })
      wx.hideLoading()
    })
  },
  // 排序函数
  sortFun(res) {
    res.sort(function (a, b) {
      let time = new Date(a.beginDate).getTime() - new Date(b.beginDate).getTime();
      if (time == 0) {
        time = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      return time;
    });
  },
  // 跳转至授权修改页
  navWarrantTo: function (e) {
    let {status, id} = e.currentTarget.dataset;
    id = parseInt(id, 10);
    let item = this.data.warrantList.filter(res => res.id == id)[0];
    if (status === 'new' || status === 'update') {
      let data = status === 'new' ? '' : item;
      wx.setStorageSync('acceptDataFromOpenerPage', {data});
      wx.navigateTo({
        url: '/pages/warrant/warrant',
        success: function (res) {
          // eventChannel.emit('acceptDataFromOpenerPage', { data })
        }
      })      
    } else if (status == 'close' || status == 'delete') {
      this.closeWarrant(id, status, item);
    }

  },
  // 删除、结束授权弹窗
  closeWarrant: function (id, status, item) {
    let that = this;
    wx.showModal({
      title: that.data.textAlertPrompt,
      content: `${status == 'close' ? that.data.textAlertConfirmend : that.data.textAlertConfirmdelete}`,
      success(res) {
        if (res.confirm) {
          if (status == 'close'){
            let rule = {
              beginDate: item.beginDate,
              endDate: item.endDate,
              agent: item.agent.account,
              creator: "",
              enabled: "N",
              andRules: []
            }
            api.PostData('itapp02_updateAgent_new', { id, rule }, function (res) {
                that.getAgentList();
            })
          } else {
            api.PostData('itapp02_deleteAgent', { id }, function (res) {
                that.getAgentList();
            })
          }
          
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  }
})