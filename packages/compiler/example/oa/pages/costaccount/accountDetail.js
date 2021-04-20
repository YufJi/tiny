const api = require('../../utils/js/api.js');
const { appendZero } = require('../../utils/js/util.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textItemdetailtotalamount: app.globalData.lang['OA_additemdetail_text_itemdetailtotalamount'],  //费用项目总额
    btnAdd: app.globalData.lang['OA_additemdetail_btn_add'],  //添加
    textItemdetail: app.globalData.lang['OA_additemdetail_text_itemdetail'],  //项目明细
    btnBack: app.globalData.lang['OA_additemdetail_btn_back'],  //上一步
    btnSubmit: app.globalData.lang['OA_additemdetail_btn_submit'],  //提交
    btnConfirm: app.globalData.lang['OA_AddItemDetail_alert_confirm'],  //确认
    textItemname: app.globalData.lang['OA_addpointsapplydetail_text_itemname'],  //项目名称
    textDateofoccurance: app.globalData.lang['OA_costaccountdetail_text_dateofoccurance'],  //发生日期
    textUnitprice: app.globalData.lang['OA_devicepurchasedetail_text_unitprice'],  //金额
    textExplanation: app.globalData.lang['OA_additemdetail_text_explanation'],  //说明
    textLimited: app.globalData.lang['OA_costaccount_text_limited'],  //最多800个字符
    textSubmitDetail: app.globalData.lang['OA_additemdetail_content_prompt'], // 暂没有项目明细，请先添加
    submitItemDetailError: app.globalData.lang['OA_AddItemDetail_alert_ConfirmSubmit_Error'], // 网络异常
    textBtnSure: app.globalData.lang['OA_index_alert_confirm'], //  确定
    textBtnCancel: app.globalData.lang['OA_formlist_btn_cancel'], // 取消
    sum: '',
    detailItemList: [],
    curIndex: -1,
    currentItem: {},
    curEditStatus: false,
    showAdd: false,
    showMsg: false,
    error: '',
    langStr: app.globalData.langStr   //获取语言信息
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 判断缓存是否有数据
    var nextDetail = wx.getStorageSync('nextDetail');
    var sum = wx.getStorageSync('sum');
    if (nextDetail && nextDetail.length > 0) {
      this.setData({
        detailItemList: nextDetail
      })
    }
    if (sum) {
      this.setData({
        sum: sum
      })
    }

    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_additemdetail_text_itemdetail'],
    })
  },
  bindProjectName(e) {
    var value = e.detail.value;
    var currentItem = this.data.currentItem
    if (!e.detail.value) {
      this.setData({
        currentItem: {
          itemName: '',
          amount: currentItem.amount, // 金额
          currency: "CNY", // 货币类型
          explanation: currentItem.explanation, // 说明
          useDate: currentItem.useDate // 时间
        }
      })
      this.hasNull(value)
    } else {
      this.setData({
        currentItem: {
          itemName: e.detail.value,
          amount: currentItem.amount, // 金额
          currency: "CNY", // 货币类型
          explanation: currentItem.explanation, // 说明
          useDate: currentItem.useDate // 时间
        }
      })
      this.hasTxt();
    }
  },
  bindDateChange(e) {
    var currentItem = this.data.currentItem
    this.setData({
      currentItem: {
        itemName: currentItem.itemName,
        amount: currentItem.amount, // 金额
        currency: "CNY", // 货币类型
        explanation: currentItem.explanation, // 说明
        useDate: e.detail.value // 时间
      }
    })
  },
  bindAmount(e) {
    var r1 = /^(\d|[1-9]\d+)(\.\d+)?$/  // 正整数的正则
    var value = e.detail.value;
    var currentItem = this.data.currentItem
    if (!e.detail.value) {
      this.hasNull(value)
      this.setData({
        currentItem: {
          itemName: currentItem.itemName,
          amount: '', // 金额
          currency: "CNY", // 货币类型
          explanation: currentItem.explanation, // 说明
          useDate: currentItem.useDate // 时间
        }
      })
    } else {
      if (!r1.test((value * 1)) ) {
        // 正则验证不通过
        this.setData({
          showMsg: true,
          error: app.globalData.lang['OA_AddItemDetail_alert_FormatofAmount'], // 填写的金额格式不正确
          currentItem: {
            itemName: currentItem.itemName,
            amount: value, // 金额
            currency: "CNY", // 货币类型
            explanation: currentItem.explanation, // 说明
            useDate: currentItem.useDate // 时间
          }
        })
      } else {
        this.setData({
          currentItem: {
            itemName: currentItem.itemName,
            amount: value, // 金额
            currency: "CNY", // 货币类型
            explanation: currentItem.explanation, // 说明
            useDate: currentItem.useDate // 时间
          }
        })
        this.hasTxt();
      }
    }
  },
  bindExplanation(e){
    var value = e.detail.value;
    var currentItem = this.data.currentItem
    this.setData({
      currentItem: {
        itemName: currentItem.itemName,
        amount: currentItem.amount, // 金额
        currency: "CNY", // 货币类型
        explanation: value, // 说明
        useDate: currentItem.useDate // 时间
      }
    })
  },
  // 是否为空值
  hasTxt() {
    var that = this;
    that.setData({
      showMsg: false,
      error: ''
    })
  },
  hasNull(value) {
    if (!value) {
      this.setData({
        showMsg: true,
        error: app.globalData.lang['OA_AddItemDetail_alert_fill']   //注意带 * 为必填项！
      })
    }
  },
  // 点击追加项目
  addDetialItem() {
    var currentDate = new Date();
    var cMonth = appendZero(currentDate.getMonth() + 1);
    var cDay = appendZero(currentDate.getDate());
    currentDate = `${currentDate.getFullYear()}-${cMonth}-${cDay}`;
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_additemdetail_btn_add'] + app.globalData.lang['OA_additemdetail_text_itemdetail'] //页面标题为路由参数——添加项目明细
    })
    this.setData({
      showAdd: true,
      showMsg: false,
      error: '',
      curEditStatus: false,
      curIndex: -1,
      currentItem: {
        amount: "", // 金额
        currency: "CNY", // 货币类型
        explanation: "", // 说明
        itemName: "", // 名称
        useDate: currentDate // 时间
      }
    })
  },
  submitItemDetail() {
    var data = this.data.currentItem;
    var curIndex = this.data.curIndex;
    var detailItemList = this.data.detailItemList;
    var sum = 0;
    for (var i in data) {
      if (i != "explanation") {
        if(i === 'amount'){
          if (!data[i]) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_NewtravelAccount_alert_fill']  //注意带 * 为必填项！
            })
          } else {
            if (!(data[i] * 1 > 0)) {
              this.setData({
                showMsg: true,
                error: app.globalData.lang['OA_AddItemDetail_alert_FormatofAmount']  //注意带 * 为必填项！
              })
            }
          }
        }else{
          if (!data[i]) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_NewtravelAccount_alert_fill']
            })
          }
        }
      }
    }
    // 确定的逻辑
    if (this.data.curEditStatus ){
      let showMsg = app.globalData.lang['OA_travelItem_text_prompt'];
      if (!(this.data.showMsg == true)) {
        detailItemList.splice(curIndex, 1, data);
        var sum = 0;
        for (var i = 0; i < detailItemList.length; i++) {
          sum = sum * 1 + (detailItemList[i].amount * 1);
        }
        this.setData({
          showAdd: false,
          detailItemList: detailItemList,
          sum: sum,
          curIndex:''
        })
      } else {
        if (showMsg === this.data.error) {
          detailItemList.push(data);
          for (var i = 0; i < detailItemList.length; i++) {
            sum = sum * 1 + (detailItemList[i].amount * 1);
          }
          this.setData({
            showAdd: false,
            detailItemList: detailItemList,
            sum: sum,
            showMsg: false,
            error: ''
          })
        }
      }
    }else{
      let showMsg = app.globalData.lang['OA_travelItem_text_prompt'];
      if (!(this.data.showMsg == true)) {
        detailItemList.push(data);
        for (var i = 0; i < detailItemList.length; i++) {
          sum = sum * 1 + (detailItemList[i].amount * 1);
        }
        this.setData({
          showAdd: false,
          detailItemList: detailItemList,
          sum: sum
        })
      } else {
        if (showMsg === this.data.error) {
          detailItemList.push(data);
          for (var i = 0; i < detailItemList.length; i++) {
            sum = sum * 1 + (detailItemList[i].amount * 1);
          }
          this.setData({
            showAdd: false,
            detailItemList: detailItemList,
            sum: sum,
            showMsg: false,
            error: ''
          })
        }
      }
    }
   
    // if (this.data.curEditStatus){
    //   detailItemList.splice(curIndex, 1, data)
    //   for (var i = 0; i < detailItemList.length; i++) {
    //     sum = sum * 1 + (detailItemList[i].amount * 1);
    //   }
    //   this.setData({
    //     detailItemList,
    //     showAdd: false,
    //     sum: sum,
    //     btnAdd: app.globalData.lang['OA_additemdetail_text_itemdetail']
    //   })
    // } else {
      
    // }
  },
  delDetail(e) {
    var index = e.currentTarget.dataset.index
    var that = this;
    wx.showModal({
      title: app.globalData.lang['OA_Newcostaccount_alert_prompt'],
      content: app.globalData.lang['OA_AddItemDetail_alert_Confirmdelete'],
      success(res) {
        if (res.confirm) {
          var detailItemList = that.data.detailItemList;
          detailItemList.splice(index, 1);
          var sum = 0;
          for (var i = 0; i < detailItemList.length; i++) {
            sum = sum * 1 + (detailItemList[i].amount * 1);
          }
          that.setData({
            detailItemList: detailItemList,
            sum: sum
          })
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  },

  editDetail(e) {
    var index = e.currentTarget.dataset.index
    var item = this.data.detailItemList[index]
    var that = this;
    // wx.setNavigationBarTitle({
    //   title: app.globalData.lang['OA_additemdetail_btn_add'] + app.globalData.lang['OA_additemdetail_text_itemdetail'] //页面标题为路由参数——添加项目明细
    // })
    that.setData({
      curEditStatus: true, 
      curIndex: index,
      currentItem: item,
      showAdd: true,
      btnAdd: app.globalData.lang['OA_index_alert_confirm']
    })
  },

  cancelAdd() {
    this.setData({
      showAdd: false
    })
  },
  beforeStep() {
    // 缓存数据
    wx.setStorageSync('nextDetail', this.data.detailItemList);
    wx.setStorageSync('sum', this.data.sum);
    wx.navigateBack();
  },
  submitFunc() {
    var formData = {};
    var that = this;
    var firstData = wx.getStorageSync('submitData');
    var secondData = this.data.detailItemList;
    if (secondData.length){
      // 开始提交
      var sum = this.data.sum;
      formData = firstData;
      formData.payment_conditions_effect_date = "";
      formData.sum = sum;
      formData.expense_items = secondData;
      wx.showModal({
        title: app.globalData.lang['OA_Newcostaccount_alert_prompt'],
        content: app.globalData.lang['OA_AddItemDetail_alert_ConfirmSubmit'],
        success(res) {
          if (res.confirm) {
            var request_body = formData;
            wx.showLoading({
              title: app.globalData.lang['OA_additemdetail_btn_submitting'],
            })
            api.PostData('itapp02_SaveForm', request_body, function (res) {
              wx.hideLoading();
              const {
                data = {
                  status: ''
                }
              } = res;
              if (data.status == 'ok') {
                wx.showToast({
                  title: app.globalData.lang['OA_AddItemDetail_alert_addsucessful'],
                  icon: 'success',
                  duration: 700,
                  success: function () {
                    wx.removeStorageSync('submitData');
                    wx.removeStorageSync('nextDetail');
                    wx.removeStorageSync('sum');
                    wx.navigateBack({
                      delta:10
                    })
                  }
                })
              }else{
                const {
                  data:{
                    message=''
                  }
                } = res;
                wx.showToast({
                  icon: 'none',
                  title: message ? message : that.data.submitItemDetailError, // 提交失败
                })
              }
            },true)
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }else{
      this.setData({
        showMsg: true,
        error: app.globalData.lang['OA_travelItem_text_prompt']
      })
    }
  }
})