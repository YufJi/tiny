// pages/submitted/index.js
const api = require('../../utils/js/api.js');
const {isArr,alertFunc} = require('../../utils/js/util.js');
const app = getApp();
const UID = wx.getStorageSync("userEmpcode");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    tabNameApproval: app.globalData.lang['OA_formlist_btn_waitapproval'],  //待审批
    tabNameApproved: app.globalData.lang['OA_formlist_btn_approved'],   //已审批
    searchDetail: app.globalData.lang['OA_formlist_btn_searchdetail'],   //主题/提交人/编号搜索
    searchSearch: app.globalData.lang['OA_formlist_btn_search'],   //搜索
    searchSort: app.globalData.lang['OA_formlist_btn_priority'],   //排序
    extPromp: app.globalData.lang['OA_formlist_text_prompt'],   //无结果
    loading: app.globalData.lang['OA_loading_text'],   //加载中
    textNoapproval: app.globalData.lang['OA_formlist_text_noapproval'],   //没有待审批申请
    textOANumber: app.globalData.lang['OA_formlist_OA_number'],   //报销单号
    textOADate: app.globalData.lang['OA_formlist_OA_data_submit'],   //提交时间
    currentTab: 0,
    processedData: [],
    processorsData: [],
    inputVal: "", // 输入框内容
    inputStatus: false, // 输入框是否聚焦态
    btnValue: app.globalData.lang['OA_formlist_btn_cancel'], // 按钮文本搜索态
    sortStatus: false, // 排序点击态
    mode: false, // 排序状态 按照时间为false，按照其他方式排序为true
    sortData: [ // 排序类别汇总
      { id: "time", name: app.globalData.lang['OA_formlist_btn_orderbytime'], key:"APP_CreateDT" },
      { id: "sort", name: app.globalData.lang['OA_formlist_btn_orderbytype'], key: "APP_FormType" },
      { id: "priority", name: app.globalData.lang['OA_formlist_btn_orderbypriority'], key: "priority" },
      { id: "submitter", name: app.globalData.lang['OA_formlist_btn_orderbysubmitter'], key: "APP_SubmitUser" }
    ],
    sortId:"time", // 当前选择的排序类别
    key: "APP_CreateDT", // 排序关键字
    processorsDataStatus: false, // 待审批数据请求状态
    processedDataStatus: false // 已审批数据请求状态

  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:function(){
    this.setData({
      search: this.search.bind(this)
    });
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_formlist_btn_my_approval'],
    })
  },
  onShow: function (options) {
    // 初始化当前的数据
    var that = this;
    // this.osgDataShow();
    this.getData(that.data.currentTab, function (res) {
      that.setData({
        processorsData: res,
        processorsDataStatus: true
      })
    })
  },

  //滑动切换
  swiperTab: function (e) {
  },

  // 加载待审批数据
  getProcessorsData: function(e) {
    var that = this;
    var currentTab = e.target.dataset.current;
    var dataArr = that.data.processorsData;
    that.setData({
      processorsDataStatus: false
    })
    that.getDataCommon(currentTab, dataArr, (res) => {
      that.setData({
        processorsData: res,
        processorsDataStatus: true
      })
    })
  },

  // 加载已审批数据
  getProcessedData: function (e) {
    var that = this;
    var currentTab = e.target.dataset.current;
    var dataArr = that.data.processedData;
    that.setData({
      processedDataStatus: false
    })
    that.getDataCommon(currentTab, dataArr,(res)=>{
      // 选择我已经审批的数据
      res = res.filter(item => {
        return item.account != UID;
      });
      that.setData({
        processedData: res,
        processedDataStatus: true
      })
    })
    
  },

  // 封装审批数据方法
  getDataCommon (currentTab, dataArr,callback) {
    var that = this;

    // tab切换时，搜索框、排序状态初始化
    that.setData({
      sortStatus: false,
      mode: false,
      sortId: "time",
      inputStatus: false,
      inputVal: "",
      btnValue: app.globalData.lang['OA_formlist_btn_cancel'],
    });


    var currentTab = currentTab;
    if (this.data.currentTab === currentTab) {
      return false;
    } else {
      that.getData(currentTab, function (res) {
        callback(res)
      })
      that.setData({
        currentTab: currentTab
      });
    }
  },

  // 获取待审批数据和已审批数据
  getData(currentTab,callback){
    var that = this;
    var queryData = {};

    // 待审批选项卡
    if (currentTab == 0) {
      queryData =  {
        start: 0,
        length: 20,
        sort: "lastUpdate desc",
        query:"processors"
      }
    } else {   // 已审批选项卡
      queryData = {
        start: 0,
        length: 20,
        sort: "lastUpdate desc",
        query: "processed"
      }
    }

    if (this.data.inputVal.length){
      queryData.search = this.data.inputVal
    }
    wx.showLoading({
      title: that.data.loading
    })
    // 非控股的数据的获取
    api.PostData('itapp02_getApplyList', queryData, function (res) {
      if (res.data && (res.data.aaData && isArr(res.data.aaData))){
        var aaData = res.data.aaData
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
            account: aaData[d].creator.account,
            APP_Type: aaData[d].syscode ? "HoldingOA" : "OA",
            APP_SubType: aaData[d].syscode ? aaData[d].syscode : "",
          })
        }
        // 控股的数据的获取
        wx.showLoading({
          title: that.data.loading
        })
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
            // 回调
            callback(dataArr);
          } else {
            alertFunc('oa_error_system_info');
          }        
        },true,function(){
          wx.hideLoading({
            complete: (res) => {
              callback([]);
            },
          })
        })
      }else{
       
        alertFunc('oa_error_system_info');
      }
    })
    
  },

  // 排序弹窗控制
  sortStatusFun: function(){
    this.setData({
      sortStatus: !this.data.sortStatus
    })
  },

  //  关闭排序弹窗
  closeSortStatus: function() {
    this.setData({
      sortStatus: false
    })
  },

  // 改变排序类别
  changeSort: function(e) {
    let {id,key} = e.currentTarget.dataset;
    this.setData({
      sortId: id,
      mode: id == "time" ? false : true,
      sortStatus: false,
      key
    });
    let tempProcessorsData = this.data.processorsData;
    let tempProcessedData = this.data.processedData;
    if (this.data.currentTab == 0){
      this.sortFun(tempProcessorsData, key);
      this.setData({
        processorsData: tempProcessorsData
      });
    } else {
      this.sortFun(tempProcessedData, key);
      this.setData({
        processedData: tempProcessedData
      });
    }
  },

  // 排序函数
  sortFun: function(data,key){
    if (key == 'APP_SubmitUser'){ // 按照人名排序
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
  inputFun: function(e) {
    let {value} = e.detail;
    this.setData({
      inputVal: value
    });
    if (value.length != 0){
      this.setData({
        btnValue: app.globalData.lang['OA_formlist_btn_search']
      });
    } else {
      this.setData({
        btnValue: app.globalData.lang['OA_formlist_btn_cancel']
      });
    }
  },

  // 搜索框聚焦
  focusFun: function() {
    this.setData({
      inputStatus: true
    });
  },

  // 清空搜索框
  clearValue: function(){
    this.setData({
      inputVal: "",
      btnValue: app.globalData.lang['OA_formlist_btn_cancel']
    });
  },

  // 搜索
  search: function() {
    let that = this;
    let { btnValue, inputVal } = that.data;

    if (btnValue == app.globalData.lang['OA_formlist_btn_search']){
      if (inputVal.length){
        that.setData({
          btnValue: app.globalData.lang['OA_formlist_btn_cancel']
        }); 
      } else {
        return;
      }
    }

    if (btnValue == app.globalData.lang['OA_formlist_btn_cancel']){
      that.setData({
        inputVal: "",
        inputStatus: false
      });  
    }

    let currentTab = that.data.currentTab;
    if (currentTab==0){
      that.getData(currentTab, (res) => {
        that.setData({
          processorsData: res
        })
      })
    } else {
      that.getData(currentTab, (res) => {
        that.setData({
          processedData: res
        })
      })
    }

  },
  // 详情页面的跳转
  goDetail(e) {
    let currentId = e.currentTarget.dataset.id;
    let formId = e.currentTarget.dataset.formid;
    let title = e.currentTarget.dataset.title;
    let appSubType = e.currentTarget.dataset.appSubType;
    let appType = e.currentTarget.dataset.appType;
    // 清除缓存 ---每次跳转的时候需要重新置入新的listData
    wx.removeStorageSync('listData')
    // 进行缓存
    var currentTab = this.data.currentTab;
    var StorageData = [];
    if(currentTab == 0){
      StorageData = this.data.processorsData
    }else{
      StorageData = this.data.processedData
    }
    wx.setStorageSync('listData', StorageData)
    // 判断是否是控股的表单
    console.log(`/pages/holdOAdetail/index?id=${currentId}&formId=${formId}&title=${title}&appSubType=${appSubType}`)
    if (appType == 'HoldingOA'){
      wx.navigateTo({
        url: `/pages/holdOAdetail/index?id=${currentId}&formId=${formId}&title=${title}&appSubType=${appSubType}`,
      });
    }else{
      wx.navigateTo({
        url: `/pages/detail/index?id=${currentId}&formId=${formId}&title=${title}`,
      });
    }
    
  },
})