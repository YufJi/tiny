const api = require('../../utils/js/api.js');
const {
  alertFunc,
  appendZero
} = require('../../utils/js/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textPrompt: app.globalData.lang['OA_travelaccount_text_prompt'], //顶部提示
    textBasicInfo: app.globalData.lang['OA_costaccount_text_basic_information'], //基础信息
    textCostcenterorbudgettype: app.globalData.lang['OA_NewtravelAccount_text_costcenterorbudgettype"'], //单费用中心/单预算分类
    textBudgettype: app.globalData.lang['OA_travelaccount_text_budgettype'], //预算类型 
    textCostcenter: app.globalData.lang['OA_travelaccount_text_costcenter'], //费用中心 
    textPaymentcompany: app.globalData.lang['OA_travelaccount_text_paymentcompany'], //付款公司
    textApportionmentmonth: app.globalData.lang['OA_travelaccount_text_Apportionmentmonth'], // 分摊月份
    textBudgetclassification: app.globalData.lang['OA_travelaccount_text_budgetclassification'], // 预算分类
    textSelectBudgettype: app.globalData.lang['OA_travelaccount_text_select_budgettype'], // 预算类型查询
    textCompanyInquiry: app.globalData.lang['OA_travelaccount_text_company_inquiry'], // 公司查询
    textNumberofinvoice: app.globalData.lang['OA_costaccount_text_numberofinvoice'], // 发票张数
    textAlertinvoice: app.globalData.lang['OA_Newcostaccount_alert_invoice'], // 请输入正整数
    textAccountInfo: app.globalData.lang['OA_costaccount_text_account_information'], // 账号信息
    textPayee: app.globalData.lang['OA_travelaccount_text_payee'], // 收款人
    textPayeeName: app.globalData.lang['OA_travelaccount_text_payee_name'], // 请输入收款人姓名
    textReceiptaccount: app.globalData.lang['OA_costaccount_text_receiptaccount'], // 收款账号
    textReceiptaccountTip: app.globalData.lang['OA_costaccount_text_receiptaccount_tip'], // 请输入收款银行账号
    textBankname: app.globalData.lang['OA_costaccount_text_bankname'], // 开户银行
    textBanknameTip: app.globalData.lang['OA_costaccount_text_bankname_tip'], // 请输入开户银行名称
    textCityofbank: app.globalData.lang['OA_costaccount_text_cityofbank'], // 开户行所在城市
    textCityofbankTip: app.globalData.lang['OA_costaccount_text_cityofbank_tip'], // 请输入开户行所在城市
    textNumberInvoices: app.globalData.lang['OA_costaccount_text_number_invoices'], // 请填写发票张数
    textRemarks: app.globalData.lang['OA_costaccount_text_remarks'], // 备注
    textLimited: app.globalData.lang['OA_costaccount_text_limited'], // 限制最多800个字符
    textNext: app.globalData.lang['OA_costaccount_text_next'], // 下一步
    textItemdetail: app.globalData.lang['OA_additemdetail_text_itemdetail'], // 项目明细
    textTravelInformation: app.globalData.lang['OA_costaccount_text_travel_information'], //出差信息
    textStartdate: app.globalData.lang['OA_travelaccount_text_startdate'], //出差开始时间
    textEnddate: app.globalData.lang['OA_travelaccount_text_enddate'], //出差结束时间
    textAddress: app.globalData.lang['OA_travelaccount_text_address'], //出差地点
    textAddressPlace: app.globalData.lang['OA_travelaccount_text_address_place'], //请输入出差地点
    textReason: app.globalData.lang['OA_travelaccount_text_reason'], //事由
    textBusinessType: app.globalData.lang['OA_detail_business_type'],
    textBusinessTypePlaceholder: app.globalData.lang['OA_detail_business_type_placeholder'],

    // 表单的数据信息
    budgetType: '', // 费用类型
    costCenter: '', // 费用中心
    payCompany: '', // 付款公司
    shareDate: '', // 分摊月份
    budgetClass: '', // 预算分类
    budgetCode: '', // 预算分类code
    invoiceNumber: "", // 发票张数
    payeeName: '', // 收款人姓名
    payeeAccount: '', // 收款账号
    payeeBank: '', // 收款银行
    bankCity: '', // 开户行城市
    remarkAll: '', // 说明
    componyCode: '',
    expenseStartDate: '',
    expenseEndDate: '',
    // 页面交互的信息
    error: '错误信息',
    dateFormat: '',
    fields: "month",
    showMsg: false,
    langStr: app.globalData.langStr, //获取语言信息
    isNeedBusinessTypeRequired: false,
    textSelectBusinesstype: app.globalData.lang['OA_detail_business_type_placeholder'],
    businessType: '',
    businessTypeCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初始化当前的数据
    let defaultTravelData = wx.getStorageSync('defaultTravelData')
    if (defaultTravelData){
      this.formatDefaultData(this,defaultTravelData)
    }else{
      this.getDefaultInfo();
    }


    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_NewtravelAccount_text_formtype'],
    })


  },

  // 函数方法
  // 获取表单的默认信息
  getDefaultInfo() {
    var that = this;
    var currentDate = new Date();
    var cMonth = appendZero(currentDate.getMonth() + 1);
    var cDay = appendZero(currentDate.getDate());
    var shareDate = `${currentDate.getFullYear()}-${cMonth}`;
    var dateFormat = `${currentDate.getFullYear()}年${cMonth}月`;
    var expenseDate = `${currentDate.getFullYear()}-${cMonth}-${cDay}`;
    api.PostData('itapp02_getInitFormInfo', {}, function(res) {
      // 获取表单的默认信息
      if (res.data) {
        // 判断初始化文件的格式有没有数据
        var resData = res.data.fieldUnit && res.data.fieldUnit.defaultValue;
        var userData = res.data.userInfo || {}; // 判断初始化用户信息;
        if (resData) {
          const {
            accountName = '',
            account = '',
            bank = '',
            city = '',
            ...others
          } = userData;
          const {
            regional = {
              name: ""
            },
            company = {
              name: ""
            },
            code = '',
            name = '',
            businessTypeRequired = false,
            id = ''
          } = resData;
          let costCenter = `${regional.name}-${name}(${code})`;
          let payCompany = `${regional.name}-${company.name}(${company.code})`
          // 缓存数据
          let defaultTravelData = {
              budgetType: app.globalData.lang['OA_NewtravelAccount_text_costcenterorbudgettype'],
              costCenter: costCenter,
              cosCenterCode: code,
              payCompany: payCompany,
              componyCode: company.code,
              shareDate: shareDate, // 当前时间
              budgetClass: '', // 预算分类
              invoiceNumber: '', // 发票张数
              payeeName: accountName , // 收款人姓名
              payeeAccount: account, // 收款账号
              payeeBank: bank, // 收款银行
              bankCity: city, // 开户行城市
              dateFormat: dateFormat,
              expenseStartDate: expenseDate,
              expenseEndDate: expenseDate,
              expensePlace: '',
              miceReason: '', // 出差原因
              businessTypeRequired: businessTypeRequired,
              businessTypeID: id
          };
          wx.setStorageSync('defaultTravelData', defaultTravelData);
          that.formatDefaultData(that,defaultTravelData)
        } else {
          alertFunc('oa_error_system_info')
        }
      } else {
        alertFunc('oa_error_system_info')
      }
    })
  },
  formatDefaultData(that,defaultData){
    this.setData({
      budgetType: defaultData.budgetType,
      costCenter: defaultData.costCenter,
      cosCenterCode: defaultData.cosCenterCode,
      payCompany: defaultData.payCompany,
      componyCode: defaultData.componyCode,
      shareDate: defaultData.shareDate, // 当前时间
      budgetClass: defaultData.budgetClass, // 预算分类
      invoiceNumber: defaultData.invoiceNumber, // 发票张数
      payeeName: defaultData.payeeName, // 收款人姓名
      payeeAccount: defaultData.payeeAccount, // 收款账号
      payeeBank: defaultData.payeeBank, // 收款银行
      bankCity: defaultData.bankCity, // 开户行城市
      dateFormat: defaultData.dateFormat,
      expenseStartDate: defaultData.expenseStartDate,
      expenseEndDate: defaultData.expenseEndDate,
      expensePlace: defaultData.expensePlace,
      miceReason: defaultData.miceReason, // 出差原因
      isNeedBusinessTypeRequired: defaultData.businessTypeRequired,
      businessTypeID: defaultData.businessTypeID
    })
    console.log(this.data.isNeedBusinessTypeRequired)
  },
  bindPlace(e) {
    var value = e.detail.value;
    if (!e.detail.value) {
      this.hasNull(value)
    } else {
      this.setData({
        expensePlace: value
      })
      this.hasTxt();
    }
  },
  bindReson(e) {
    var value = e.detail.value;
    if (!e.detail.value) {
      this.hasNull(value)
    } else {
      this.setData({
        miceReason: value
      })
      this.hasTxt();
    }
  },
  // 发票张数的绑定
  bindInvoice(e) {
    var r1 = /^[1-9]\d*$/ // 正整数的正则
    var value = e.detail.value;
    if (!e.detail.value) {
      this.hasNull(value)
    } else {
      if (!r1.test(value)) {
        // 正则验证不通过
        this.setData({
          showMsg: true,
          error: app.globalData.lang['OA_Newcostaccount_alert_invoice'],
          invoiceNumber: '',
        })
      } else {
        this.setData({
          invoiceNumber: value
        })
        this.hasTxt();
      }
    }
  },
  // 收款人的姓名
  bindPayeeName(e) {
    var value = e.detail.value;
    if (!e.detail.value) {
      this.hasNull(value)
    } else {
      this.setData({
        payeeName: value
      })
      this.hasTxt();
    }
  },
  // 收款账号
  bindBankAccountName(e) {
    var value = e.detail.value;
    if (!e.detail.value) {
      this.hasNull(value)
    } else {
      this.setData({
        payeeAccount: value
      })
      this.hasTxt();
    }
  },
  // 开户行
  bindBankName(e) {
    var value = e.detail.value;
    if (!e.detail.value) {
      this.hasNull(value)
    } else {
      this.setData({
        payeeBank: value
      })
      this.hasTxt();
    }
  },
  // 开户行城市
  bindBankCity(e) {
    var value = e.detail.value;
    if (!e.detail.value) {
      this.hasNull(value)
    } else {
      this.setData({
        bankCity: value
      })
      this.hasTxt();
    }
  },
  // 点击跳转 -- 查询公司
  goSearchCompany(e) {
    var name = e.currentTarget.dataset.company;
    var searchName = app.globalData.lang['OA_travelaccount_text_company_inquiry']; //公司查询
    wx.navigateTo({
      url: '/pages/search/searchCompany?name=' + name + '&searchName=' + searchName,
    })
  },
 
  // 点击跳转 -- 查询预算分类
  goSearchBudgeClass(e) {
    var budgetClass = this.data.budgetClass;
    var searchName = app.globalData.lang['OA_travelaccount_text_select_budgettype'];
    wx.navigateTo({
      url: '/pages/search/searchBudgetList?name=' + budgetClass + '&searchName=' + searchName,
    })
  },
  // 点击跳转  ---- 查询业务分组
  goSearchBusinessType(e) {
    var businessType = this.data.businessType;
    var businessTypeID = this.data.businessTypeID;
    var searchName = this.data.textBusinessTypePlaceholder;
    wx.navigateTo({
      url: '/pages/search/searchBusinessType?name=' + businessType + '&searchName=' + searchName + '&id=' + businessTypeID,
    })
  },
  bindDateChange: function(e) {
    // 数据格式化
    let date = e.detail.value;
    date.replace('-', app.globalData.lang['OA_feereportCtrl_text_year']); //年
    date = date.replace('-', app.globalData.lang['OA_feereportCtrl_text_year']) + app.globalData.lang['OA_feereportCtrl_text_month'];
    this.setData({
      shareDate: e.detail.value,
      dateFormat: date,
    })
  },
  bindStartChange: function(e) {
    // 数据格式化
    let date = e.detail.value;
    this.setData({
      expenseStartDate: e.detail.value,
    })
  },
  bindEndChange: function(e) {
    // 数据格式化
    let date = e.detail.value;
    this.setData({
      expenseEndDate: e.detail.value,
    })

    // 
  },
  bindRemark(e) {
    this.setData({
      remarkAll: e.detail.value,
    })
  },
  // 发票数量的判断
  hasTxt() {
    var that = this;　
    that.setData({
      showMsg: false,
      error: ''
    })
  },
  invoiceBlur(e) {
    var that = this;
    var value = e.detail.value;
    that.hasInvNum(value);
  },
  hasInvNum(value) {
    var that = this;
    var r1 = /^[0-9]*$/ // 正整数的正则
    if (value) {
      if (!r1.test(value)) {
        // 正则验证不通过
        that.setData({
          showMsg: true,
          error: app.globalData.lang['OA_Newcostaccount_alert_invoice']
        })
      } else {
        that.setData({
          showMsg: false,
          error: ''
        })
      }
    } else {
      that.setData({
        showMsg: true,
        error: app.globalData.lang['OA_Newcostaccount_alert_invoice']
      })
    }
  },
  hasNull(value) {
    if (!value) {
      this.setData({
        showMsg: true,
        error: app.globalData.lang['OA_Newcostaccount_alert_fill']
      })
    }
  },
  bankNumber(e) {
    var regBank = /^([1-9]{1})(\d{11}|\d{15}|\d{16}|\d{17}|\d{18})$/;
    var that = this;
    var value = e.detail.value;
    if (value) {
      if (!regBank.test(value)) {
        // 正则验证不通过
        that.setData({
          showMsg: true,
          error: '请输入正确的银行账户哦～'
        })
      } else {
        that.setData({
          showMsg: false,
          error: ''
        })
      }
    } else {
      that.setData({
        showMsg: true,
        error: app.globalData.lang['OA_costaccount_text_receiptaccount_tip']
      })
    }
  },
  nextStep() {
    // 数据的提交
    var formData = this.data;
    var addFormDetail = {
      activity_remark: formData.remarkAll, // 第一步的说明
      budget_application_type: "BAT003", // 预算类型
      budget_budgettype: [{
        budgettype: formData.budgetCode, // 预算分类的code
        amount: 0, // 数量
      }], // 预算分类

      budget_costcenter: [{
        amount: "0", // 数量为0
        costcenter: formData.cosCenterCode, // 费用中心的code
      }], // 费用中心
      budget_isacrossmonth: "N", // 是否跨月的处理
      budget_isautosign: "N", // // 预算签名
      budget_isinbudget: "Y", // 预算不足
      budget_share_month: formData.shareDate, // 分摊月份
      expense_invoice_number: formData.invoiceNumber, // 发票张数
      payment_bankcity: formData.bankCity, // 开户银行所在城市
      payment_bankname: formData.payeeBank, // 开户银行名称
      payment_company: formData.componyCode, // 付款公司
      payment_feetype: "FT002", // 付款费用类型
      payment_isicbc: "N", // 付款方式
      payment_payee: formData.payeeName, // 收款人信息
      payment_payee_account: formData.payeeAccount, // 收款账户
      priority: "normal", // 优先级
      expense_start_date: formData.expenseStartDate,
      expense_end_date: formData.expenseEndDate,
      mice_reason: formData.miceReason,
      expense_place: formData.expensePlace,


      type: "12", //费用报销类型、
      activity_businessgroup: formData.isNeedBusinessTypeRequired ? formData.businessTypeCode : null
      // 下一步的操作
      // expense_items: [], 
      // activity_businessgroup: null,// 活动业务组
      // linkto_activity_id: '',
      // budget_share_enddate:'',
      // budget_share_startdate:'',

      //payment_conditions_effect_date: "", // 付款条件生效日期
      // sum: '', // 金额
    };
    var submitData = addFormDetail;

    // 数据是否填写完整
    for (var i in submitData) {
      if (i === 'budget_budgettype' || i === 'budget_costcenter') {
        if (!(submitData[i][0].budgettype != '' && submitData[i][0].costcenter != '')) {
          this.setData({
            showMsg: true,
            error: app.globalData.lang['OA_Newcostaccount_alert_fill']
          })
        }
      } else if (i !== 'activity_remark') {
        if (i === 'expense_invoice_number') {
          var r1 = /^[1-9]\d*$/;
          if (!r1.test(submitData[i])) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_Newcostaccount_alert_invoice'], //'带*号的为必填项哦～'
            })
          }
        } else if (i === 'activity_businessgroup') {
          // 如果非必填的时候
          if (formData.isNeedBusinessTypeRequired && !submitData[i]) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_AddItemDetail_alert_fill'], //'带*号的为必填项哦～'
            })
          }
        }else{
          if (!submitData[i]) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_Newcostaccount_alert_fill']
            })
          }
        }
        
      }
    }


    if (this.data.showMsg !== true) {
      // 进入下一步，将数据进行缓存
      submitData.budget_share_month = submitData.budget_share_month.replace("-", "");
      wx.setStorageSync('submitData', submitData);
      wx.navigateTo({
        url: '/pages/travelPay/travelDetail',
      })
    }

  }
})