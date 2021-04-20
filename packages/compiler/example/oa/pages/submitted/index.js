// pages/submitted/index.js
const api = require('../../utils/js/api.js'); 
const { alertFunc,isArr} = require('../../utils/js/util.js'); 
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    searchDetail: app.globalData.lang['OA_formlist_btn_searchdetail'],   //主题/提交人/编号搜索
    searchSearch: app.globalData.lang['OA_formlist_btn_search'],   //搜索
    searchSort: app.globalData.lang['OA_formlist_btn_priority'],   //排序
    extPromp: app.globalData.lang['OA_formlist_text_prompt'],   //无结果
    loading: app.globalData.lang['OA_loading_text'],   //加载中
    textPromptSubmit: app.globalData.lang['OA_formlist_text_prompt_submit'],   //近三个月你还没有提交过哦
    textOANumber: app.globalData.lang['OA_formlist_OA_number'],   //报销单号
    textOADate: app.globalData.lang['OA_formlist_OA_data_submit'],   //提交时间


    creatorData:[],
    inputVal: "", // 输入框内容
    inputStatus: false, // 输入框是否聚焦态
    btnValue: "取消", // 按钮文本搜索态
    sortStatus: false, // 排序点击态
    mode: false, // 排序状态 按照时间为false，按照其他方式排序为true
    sortData: [ // 排序类别汇总
      { id: "time", name: app.globalData.lang['OA_formlist_btn_orderbytime'], key: "APP_CreateDT" },
      { id: "sort", name: app.globalData.lang['OA_formlist_btn_orderbytype'], key: "APP_FormType" },
      { id: "priority", name: app.globalData.lang['OA_formlist_btn_orderbypriority'], key: "priority" },
      { id: "submitter", name: app.globalData.lang['OA_formlist_btn_orderbysubmitter'], key: "APP_SubmitUser" }
    ],
    sortId: "time", // 当前选择的排序类别
    key: "APP_CreateDT", // 排序关键字,
    creatorDataStatus: false // 数据请求状态
  },

  


  /**
   * 生命周期函数--监听页面加载
   */

 
  onLoad: function () {
    
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_formlist_btn_my_submitted'],
    })
  },
  onShow:function(){
    // 初始化当前的数据
    var that = this;
    that.getCreatorData();
  },


  
  // 获取已提交数据
  getCreatorData: function () {
    var that = this;
    var queryData = {
      "start": 0,
      "length": 20,
      "sort": "lastUpdate desc",
      "query": "creator"
    }

    if (that.data.inputVal.length) {
      queryData.search = that.data.inputVal
    }
    wx.showLoading({
      title: that.data.loading
    })

    api.PostData('itapp02_getApplyList', queryData, function (res) {
      if (res.data && (res.data.aaData && isArr(res.data.aaData))) {
        var aaData = res.data.aaData;
        var dataArr = [];
        for (var d = 0, leng = aaData.length; d < leng; d++) {
          var item = {};
          var ss = aaData[d].created.split(" ");
          dataArr.push({
            APP_FormType: aaData[d].type.num,
            APP_Subject: aaData[d].type.name,
            APP_CreateDT: ss[0],
            APP_SubmitUser: aaData[d].creator.fullname,
            APP_ID: aaData[d].code,
            APP_Status: aaData[d].status.name,
            backType: 0,
            APP_Signer_Status: aaData[d].iscontSign,
            priority: aaData[d].priority.code,
            APP_StatusCode: aaData[d].status.code.toLowerCase(),
            APP_Type: aaData[d].syscode ? "HoldingOA" : "OA",
            APP_SubType: aaData[d].syscode ? aaData[d].syscode : "",
          })
        }
        // 控股的数据的获取
        api.PostData('itapp02_getHoldingApplyList', queryData, function (res) {
          if (res.data && (res.data.aaData && isArr(res.data.aaData))) {
            var aaData = res.data.aaData
            for (var d = 0, leng = aaData.length; d < leng; d++) {
              var item = {};
              var ss = aaData[d].created.split(" ");
              dataArr.push({
                APP_FormType: aaData[d].type.num,
                APP_Subject: aaData[d].type.name,
                APP_CreateDT: ss[0],
                APP_SubmitUser: aaData[d].creator.fullname,
                APP_ID: aaData[d].code,
                APP_Status: aaData[d].status.name,
                backType: 0,
                APP_Signer_Status: aaData[d].iscontSign,
                priority: aaData[d].priority.code,
                APP_StatusCode: aaData[d].status.code.toLowerCase(),
                account: aaData[d].creator.account,
                APP_Type: aaData[d].syscode ? "HoldingOA" : "OA",
                APP_SubType: aaData[d].syscode ? aaData[d].syscode : "",
              })
            }
            that.setData({
              creatorData: dataArr,
              creatorDataStatus: true
            })
          } else {
            alertFunc('oa_error_system_info');
          }
        })
      }else{
        alertFunc('oa_error_system_info');
      }

    })
  },
  
  // 排序弹窗控制
  sortStatusFun: function () {
    this.setData({
      sortStatus: !this.data.sortStatus
    })
  },

  //  关闭排序弹窗
  closeSortStatus: function () {
    this.setData({
      sortStatus: false
    })
  },

  // 改变排序类别
  changeSort: function (e) {
    let { id, key } = e.currentTarget.dataset;
    this.setData({
      sortId: id,
      mode: id == "time" ? false : true,
      sortStatus: false,
      key
    });
    let tempCreatorData = this.data.creatorData;
    this.sortFun(tempCreatorData, key);
    this.setData({
      creatorData: tempCreatorData
    });
  },

  // 排序函数
  sortFun: function (data, key) {
    if (key == 'APP_SubmitUser') { // 按照人名排序
      data.sort(function (a, b) {
        return a[key].localeCompare(b[key]);
      });
    } else if (key == 'APP_CreateDT') { // 按照时间排序
      data.sort(function (a, b) {
        return new Date(b[key]).getTime() - new Date(a[key]).getTime();
      });
    } else {
      data.sort(function (a, b) {
        return a[key] - b[key];
      });
    }
  },

  // 输入事件
  inputFun: function (e) {
    let { value } = e.detail;
    this.setData({
      inputVal: value
    });
    if (value.length != 0) {
      this.setData({
        btnValue: "搜索"
      });
    } else {
      this.setData({
        btnValue: "取消"
      });
    }
  },

  // 搜索框聚焦
  focusFun: function () {
    this.setData({
      inputStatus: true
    });
  },

  // 清空搜索框
  clearValue: function () {
    this.setData({
      inputVal: "",
      btnValue: "取消"
    });
  },

  // 搜索
  search: function () {
    let that = this;
    let { btnValue, inputVal } = that.data;

    if (btnValue == "搜索") {
      if (inputVal.length) {
        that.setData({
          btnValue: "取消"
        });
      } else {
        return;
      }
    }

    if (btnValue == "取消") {
      that.setData({
        inputVal: "",
        inputStatus: false
      });
    }

    that.getCreatorData();

  },
  goDetail(e) {
    let currentId = e.currentTarget.dataset.id;
    let formId = e.currentTarget.dataset.formid;
    let title = e.currentTarget.dataset.title;
    let appSubType = e.currentTarget.dataset.appSubType;
    let appType = e.currentTarget.dataset.appType;
    // 清除缓存
    wx.removeStorageSync('listData')
    // 进行缓存
    var StorageData = this.data.creatorData;
    wx.setStorageSync("listData", StorageData)
    if (appType == 'HoldingOA') {
      wx.navigateTo({
        url: `/pages/holdOAdetail/index?id=${currentId}&formId=${formId}&title=${title}&appSubType=${appSubType}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/detail/index?id=${currentId}&formId=${formId}&title=${title}`,
      });
    }


    
  },




  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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