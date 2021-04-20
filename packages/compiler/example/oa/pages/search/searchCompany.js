const api = require('../../utils/js/api.js');
const { isNullObj, isArr, alertFunc } = require('../../utils/js/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search: () => {},
    cancelFunc: () => {},
    cancel: false,
    searchState: false,
    cancel:false,
    inputVal:'上海',
    componyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化当前提交的表单的默认的值
    wx.setNavigationBarTitle({
      title: options.searchName//页面标题为路由参数
    })
    this.setData({
      search: this.search.bind(this),
      inputVal:options.name
    })
  },

  // 搜索的函数
  search: function (value) {
    var that = this;
    return new Promise((resolve, reject) => {
      // 当前如果是默认的时候，首先显示
      that.getCompanyList(value,function(data){
        // 格式化当前的数据
        var componyList = [];
        if (data.totalCount > 0 && (data.data && isArr(data.data))) {
          // 获取选择的公司的名称的列表        
          data.data.forEach((e, i) => {
            componyList.push({
              text: `${e.regional.name}-${e.name}(${e.code})`
            })
          });
          that.setData({
            componyList: data.data
          })
        } else {
          componyList = [];
        }
        resolve(componyList)
      })
    })
  },
  // 实时请求当前的公司名称
  getCompanyList(value, callback) {
    let request_body = {
      'companyName': value
    }
    api.PostData('itapp02_getCompanyList', request_body, function (res) {
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
      payCompany: e.detail.item.text,
      componyCode: this.data.componyList[e.detail.index].code,
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