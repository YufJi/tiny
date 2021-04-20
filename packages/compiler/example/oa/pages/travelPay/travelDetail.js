const api = require('../../utils/js/api.js');
const {
  appendZero
} = require('../../utils/js/util.js');
const app = getApp();
// 项目选择的下拉框的内容
const nameList = [
  {
    id: 'flightTicket',
    value: app.globalData.lang['OA_NewtravelItem_list_flightandcar']  //机票/车船票
  }, 
  {
    id: 'airportConstructionFee',
    value: app.globalData.lang['OA_NewtravelItem_list_airconstructionfee']    //机场建设费
  }, 
  {
    id: 'taxiExpenses',
      value: app.globalData.lang['OA_NewtravelItem_list_taxi']      //出租车/市内车费
  }, 
  {
    id: 'hotel',
    value: app.globalData.lang['OA_NewtravelItem_list_hotel']       //宾馆
  }, 
  {
    id: 'entertainmentExpenses',
    value: app.globalData.lang['OA_NewtravelItem_list_Hospitality']     //招待费
  }, 
  {
    id: 'communicationExpenses',
    value: app.globalData.lang['OA_NewtravelItem_list_correspondence']  //通讯费
  }, 
  {
    id: 'meetingExpenses',
    value: app.globalData.lang['OA_NewtravelItem_list_Conference']      //会务费
  }, 
  {
    id: 'gift',
    value: app.globalData.lang['OA_NewtravelItem_list_Gift']          //礼品
  }, 
  {
    id: 'incidentalExpenses',
    value: app.globalData.lang['OA_NewtravelItem_list_Miscellaneous']     //杂费
  }, 
  {
    id: 'other',
    value: app.globalData.lang['OA_NewtravelItem_list_others']        //其他
  }];


Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textItemdetailtotalamount:  app.globalData.lang['OA_additemdetail_text_itemdetailtotalamount'], //费用项目总额
    btnAdd:                     app.globalData.lang['OA_additemdetail_btn_add'], //添加
    btnSure:                    app.globalData.lang['OA_index_alert_confirm'], //确定
    textItemdetail:             app.globalData.lang['OA_additemdetail_text_itemdetail'], //项目明细
    btnBack:                    app.globalData.lang['OA_additemdetail_btn_back'], //上一步
    btnSubmit:                  app.globalData.lang['OA_additemdetail_btn_submit'], //提交
    btnConfirm:                 app.globalData.lang['OA_AddItemDetail_alert_confirm'], //确认
    textItemname:               app.globalData.lang['OA_addpointsapplydetail_text_itemname'], //项目名称
    textDateofoccurance:        app.globalData.lang['OA_costaccountdetail_text_dateofoccurance'], //发生日期
    textUnitprice:              app.globalData.lang['OA_devicepurchasedetail_text_unitprice'], //金额
    textExplanation:            app.globalData.lang['OA_additemdetail_text_explanation'], //说明
    textLimited:                app.globalData.lang['OA_costaccount_text_limited'], //最多800个字符
    textChoose:                 app.globalData.lang['OA_travelaccount_text_select'], //请选择
    textSubmitDetail:           app.globalData.lang['OA_additemdetail_content_prompt'], // 暂没有项目明细，请先添加
    submitItemDetailError:      app.globalData.lang['OA_AddItemDetail_alert_ConfirmSubmit_Error'], // 网络异常
    textBtnSure:                app.globalData.lang['OA_index_alert_confirm'], //  确定
    textBtnCancel:              app.globalData.lang['OA_formlist_btn_cancel'], // 取消

    sum: '',
    detailItemList: [],
    currentItem: {},
    editItem: {},
    showAdd: false,
    showMsg: false,
    error: '',
    array: [],
    addBtnTxt: app.globalData.lang['OA_additemdetail_btn_add'],
    editIndex: null,
    itemIndex: 0,
    pickeritemIndex: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(this.data.textItemdetailtotalamount)

    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_additemdetail_btn_add'] + app.globalData.lang['OA_additemdetail_text_itemdetail'] //页面标题为路由参数——添加项目明细
    })

    //项目名称列表
    var nameListText = nameList.map(item => item.value );
    this.setData({
      array: nameListText
    })

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
  },

  bindPickerChange: function(e) {
    // 需要判断当前的报销是否已经提交过一次
    var index = e.detail.value;
    var currentItem = this.data.currentItem;

    this.setData({
      pickeritemIndex: index,

      currentItem: {
        itemName: nameList[index].value,
        amount: currentItem.amount, // 金额
        currency: "CNY", // 货币类型
        explanation: currentItem.explanation, // 说明
        useDate: "" // 时间
      },

      showMsg: false,
      error: ''
    })

  },
  bindAmount(e) {
    var r1 = /^(\d|[1-9]\d+)(\.\d+)?$/ // 正整数的正则
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
          useDate: "" // 时间
        }
      })
    } else {
      if (!r1.test(value * 1)) {
        // 正则验证不通过
        console.log(123)
        this.setData({
          showMsg: true,
          error: app.globalData.lang['OA_NewtravelItem_list_formatofAmount'],
          invoiceNumber: '',
          currentItem: {
            itemName: currentItem.itemName,
            amount: e.detail.value, // 金额
            currency: "CNY", // 货币类型
            explanation: currentItem.explanation, // 说明
            useDate: "" // 时间
          }
        })
      } else {
        this.setData({
          currentItem: {
            itemName: currentItem.itemName,
            amount: e.detail.value, // 金额
            currency: "CNY", // 货币类型
            explanation: currentItem.explanation, // 说明
            useDate: "" // 时间
          }
        })
        this.hasTxt();
      }
    }
  },
  bindExplanation(e) {
    var value = e.detail.value;
    var currentItem = this.data.currentItem
    this.setData({
      currentItem: {
        itemName: currentItem.itemName,
        amount: currentItem.amount, // 金额
        currency: "CNY", // 货币类型
        explanation: value, // 说明
        useDate: "" // 时间
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
        error: app.globalData.lang['OA_NewtravelAccount_alert_fill']
      })
    }
  },
  // 点击追加项目
  addDetialItem() {
    var currentDate = new Date();
    var cMonth = appendZero(currentDate.getMonth() + 1);
    var cDay = appendZero(currentDate.getDate());
    currentDate = `${currentDate.getFullYear()}-${cMonth}-${cDay}`;
    this.setData({
      showAdd: true,
      currentItem: {
        amount: "", // 金额
        currency: "CNY", // 货币类型
        explanation: "", // 说明
        itemName: "", // 名称
        useDate: "" // 时间
      },
      showMsg: false,
      error: '',
      addBtnTxt: this.data.btnAdd,
      itemIndex: this.data.detailItemList.length + 1
    })
  },
  submitItemDetail() {
    var data = this.data.currentItem;
    var detailItemList = this.data.detailItemList;
    for (var i in data) {
      if ((i != "explanation") && (i != 'useDate')) {
        if (i === 'amount') {
          if (!data[i]) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_NewtravelAccount_alert_fill'] //注意带 * 为必填项！
            })
          } else {
            if (!(data[i] * 1 > 0)) {
              this.setData({
                showMsg: true,
                error: app.globalData.lang['OA_AddItemDetail_alert_FormatofAmount'] //注意带 * 为必填项！
              })
            }
          }
        } else {
          if (!data[i]) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_NewtravelAccount_alert_fill']
            })
          }
        }
      }
    }
    if (this.data.addBtnTxt === this.data.btnAdd) {
      for (var i = 0; i < detailItemList.length; i++) {
        if (detailItemList[i].itemName == data.itemName) {
          this.setData({
            showMsg: true,
            error: app.globalData.lang['OA_NewtravelItem_alert_added']
          })
        }
      }
    } else {
      for (var i = 0; i < detailItemList.length; i++) {
        if (detailItemList[i].itemName == data.itemName && this.data.editItem.itemName != data.itemName) {
          this.setData({
            showMsg: true,
            error: app.globalData.lang['OA_NewtravelItem_alert_added']
          })
        }
      }
    }

    let showMsg = app.globalData.lang['OA_travelItem_text_prompt'];
    if (!(this.data.showMsg == true)) {
      if (JSON.stringify(this.data.editItem) == '{}') {
        detailItemList.push(data);
        var sum = 0;
        for (var i = 0; i < detailItemList.length; i++) {
          sum = sum * 1 + (detailItemList[i].amount * 1);
        }
        this.setData({
          showAdd: false,
          detailItemList: detailItemList,
          sum: sum,
        })

      } else {
        detailItemList.splice(this.data.editIndex, 1, data);
        var sum = 0;
        for (var i = 0; i < detailItemList.length; i++) {
          sum = sum * 1 + (detailItemList[i].amount * 1);
        }
        this.setData({
          showAdd: false,
          detailItemList: detailItemList,
          sum: sum,
          editItem: {}
        })
      }
    } else {
      if (showMsg === this.data.error) {
        detailItemList.push(data);
        var sum = 0;
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
    var currentIndex = e.currentTarget.dataset.index;
    var currentItem = this.data.detailItemList[currentIndex];
    this.setData({
      currentItem: currentItem,
      editItem: currentItem,
      showMsg: false,
      error: '',
      showAdd: true,
      addBtnTxt: this.data.btnSure,
      editIndex: currentIndex,
      itemIndex: currentIndex + 1
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
    var firstData = wx.getStorageSync('submitData');
    var secondData = this.data.detailItemList;

    // 提交
    if (secondData.length) {
      var that = this;
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
            api.PostData('itapp02_SaveForm', request_body, function(res) {
              wx.hideLoading();
              const {
                data = {
                  status: '',
                }
              } = res;
              if (data.status == 'ok') {
                wx.showToast({
                  title: app.globalData.lang['OA_AddItemDetail_alert_addsucessful'],
                  icon: 'success',
                  duration: 400,
                  success: function() {
                    wx.removeStorageSync('submitData');
                    wx.removeStorageSync('nextDetail');
                    wx.removeStorageSync('sum');
                    wx.navigateBack({
                      delta: 10
                    })
                  }
                })
              } else {
                console.log('errMsg: itapp02_SaveForm')
                console.log(res);
                wx.showToast({
                  icon: 'none',
                  title: that.data.submitItemDetailError, // 提交失败
                })
              }
            }, true)
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
    } else {
      this.setData({
        showMsg: true,
        error: app.globalData.lang['OA_travelItem_text_prompt']
      })
    }
  }
})