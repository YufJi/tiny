const api = require('../../utils/js/api.js');
const { isNullObj, isArr,alertFunc } = require('../../utils/js/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: false,
    inputVal: '',
    budgetList:[],
    langStr: app.globalData.langStr,   //获取语言信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化当前提交的表单的默认的值
   
    wx.setNavigationBarTitle({
      title: options.searchName//页面标题为路由参数
    })

  


    // 搜索的函数
    this.setData({
      search: this.search.bind(this),
      focusFunc: this.focusFunc.bind(this),
      inputVal: options.name
    })
  },
  // 
  // 搜索的函数
  focusFunc:function(value){
    var that = this;
    return new Promise((resolve, reject) => {
      if(!value){
        that.getBudgetList('', function (data) {
          // 格式化当前的数据
          var budgetList = [];
          if (data.data.length > 0) {
            // 获取选择的公司的名称的列表        
            data.data.forEach((e, i) => {
              budgetList.push({
                'text': `${e.parentDO.value}-${e.value}`
              })
            });
            that.setData({
              budgetList: data.data
            })
          }else {
            budgetList = [];
          }
          resolve(budgetList)
        })
      }
    })
  },
  search: function (value) {
    var that = this;
    return new Promise((resolve, reject) => {
      // 当前如果是默认的时候，首先显示
      that.getBudgetList(value, function (data) {
        // 格式化当前的数据
        var budgetList = [];
        if (data.data.length > 0) {
          // 获取选择的公司的名称的列表        
          data.data.forEach((e, i) => {
            budgetList.push({
              'text': `${e.parentDO.value}-${e.value}`
            })
          });
          that.setData({
            budgetList: data.data
          })
        } else {
          budgetList = [];
        }
        resolve(budgetList)
      })
    })
  },
  // 实时请求当前的公司名称
  getBudgetList(value, callback) {
    var that = this;
    let request_body = {
      'locale': that.data.langStr,
      'budgetTypeName': value,
    }
    api.PostData('itapp02_getBudgetType', request_body, function (res) {
      // 获取当前的用户的公司名称
      if(res.data){
        callback(res.data);
      } else {
        alertFunc('oa_error_system_info');
      }
    },true)
  },
  selectResult: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    // 选择当前的元素
    this.setData({
      inputVal: e.detail.item.text,
    })
    // 进行跳转返回上一个页面
    prevPage.setData({
      budgetClass: e.detail.item.text,
      budgetCode: this.data.budgetList[e.detail.index].code,
      showMsg: false,
      error: ''
    })
    wx.navigateBack();
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