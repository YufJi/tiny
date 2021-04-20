//logs.js
const api = require('../../utils/js/api.js');
const { isNullObj, isArr,alertFunc} = require('../../utils/js/util.js');
const app = getApp();
Page({
  // 数据
  data: {
    // 多语言变量
    titeMyTaxnumber: app.globalData.lang['OA_notice_title_my_taxnumber'],  //我的财务税号
    textCompany: app.globalData.lang['OA_notice_text_company'],  //公司
    textTaxnumber: app.globalData.lang['OA_notice_text_taxnumber'],  //税号
    textBankaccount: app.globalData.lang['OA_notice_text_bankaccount'],  //银行帐号
    textBankname: app.globalData.lang['OA_notice_text_bankname'],  //银行名称
    textTelephone: app.globalData.lang['OA_notice_text_telephone'],  //电话
    textAddress: app.globalData.lang['OA_notice_text_address'],  //地址 
    btnSearch: app.globalData.lang['OA_formlist_btn_search'],   //搜索
    searchSort: app.globalData.lang['OA_formlist_btn_priority'],   //排序
    noData: app.globalData.lang['OA_no_message'],   //无结果
    loading: app.globalData.lang['OA_loading_text'],   //加载中
    taxMyInfo: null,
    taxInfo:null,
    inputShowed: false,
    inputVal: "",
    showMyTax: true,
    selectComponeList:[],
    searchState:false,
    taxMyInfoStatus: false,
    searchSeq: 0,
    curSearchSeq: 0,
    result:' '
  },
  // 页面初始化请求
  onLoad: function() {
    // 获取当前用户的用户
    let taxMyInfo =  wx.getStorageSync('taxMyInfo'); // 判断是否缓存有数据
    if (taxMyInfo){
      this.setData({
        taxMyInfo: taxMyInfo,
        taxMyInfoStatus: true
      })
    }else{
      this.getUserCompany();
    }
  
    this.setData({
      search: this.search.bind(this),
      cancelFunc: this.cancelFunc.bind(this)
    })
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_index_link_taxnumber'],
    })
  },
  // 跳转搜索
  goSearch: function() {
    wx.navigateTo({
      url: ''
    })
  },
  // 获取个人公司的名称
  getUserCompany() {
    var that = this;
    wx.showLoading({
      title: that.data.loading,
      icon:'loading'
    })
    api.PostData('itapp02_getUserCompany', {}, function(res) {
      if (res.data && res.data.companyName){
        // 获取当前的用户的公司名称
        that.getTaxInfo(res.data.companyName)
      }else{
        alertFunc('oa_error_system_info');
      }
    })
  },
  // 获取税号信息
  getTaxInfo(companyName) {
    var that = this;
    var request_body = {
      Company: companyName
    };
    api.PostData('itapp02_getOaTaxNumber', request_body, function(res) {
      // 获取当前的用户的公司名称
      if (isNullObj(res.data)){
        // 优化代码，第一次数据存入缓存
        wx.setStorageSync('taxMyInfo', res.data)
        that.setData({
          taxMyInfo: res.data,
          taxMyInfoStatus: true
        })
      }else{
        alertFunc('oa_error_system_info');
      }
    })
  },
  // 搜索的函数
  search: function (value) {
      var that = this;
      return new Promise((resolve, reject) => {
          that.data.searchSeq += 1;
          that.getCompanyResult(value, that.data.searchSeq, function (data, seq) {
              // 格式化当前的数据
              var componyList = [];
              if (seq >= that.data.curSearchSeq) {
                  that.data.curSearchSeq = seq
                  if (data.totalCount > 0 && (data.data && isArr(data.data))) {
                      // 获取选择的公司的名称的列表
                      data.data.forEach((e, i) => {
                          componyList.push({
                              text: e.company
                          })
                      });
                      // 设置当前的数组
                      that.setData({
                          selectComponeList: data.data
                      })
                  } else {
                      componyList = [];
                  }
              }
              resolve(componyList)
          });

      })
  },
  // 实时请求当前的公司名称
  getCompanyResult(value,seq,callback) {
    let request_body = {
      'Company': value
    }
    api.PostData('itapp02_getTaxNumberList', request_body, function(res) {
      // 数据返回并且是数组的形式
      if (res.data){
        callback(res.data,seq);
      }else{
        alertFunc('oa_error_system_info');
      }
    },true)
  },
  selectResult: function(e) {
    // 选择当前的元素
    this.setData({
      inputVal:e.detail.item.text,
      taxInfo: this.data.selectComponeList[e.detail.index],
      showMyTax:false,
      taxMyInfoStatus: true
    })
  },
  cancelFunc: function(){
    // 点击取消的时候显示我的财务税号
    this.setData({
      showMyTax: true, 
      inputVal: '',
    })
  },
  //复制财务税号
  clipTextNumber: function (e) {
    var that = this;
    wx.setClipboardData({
      data: e.currentTarget.dataset.name,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  }
})