const api = require('../../utils/js/api.js');
const client = typeof nwx == 'undefined' ? 'weixin' : 'nfes';
const downUrlHost = 'http://cgjupload-it.ctrip.com'
const {
  getValue,
  getArraysbysearchStr,
  getProcessors,
  showProgressButton,
  getpreUser,
  getFormatValue,
  getFieldValue,
  getFieldValueEquipmentPurchaseValue
} = require('../../utils/js/dataformat.js');

const {
  getBudgetRatio,
  getFormDetailByApplyCode,
  getattachments,
  getAllDetailSpecile,
  getContractData,
  getGiftDetail,
  getfixedAssertsDetail,
  getLetterDetail,
  getOfficeSuppliesDetail,
  getSendCarDetail,
  getfixedAssertsAllocationDetail,
  getRecipientItem,
  getPayOitem,
} = require('../../utils/js/getDetailCommon.js');
const {
  isArr,
  Outputmoney,
  isNumber
} = require('../../utils/js/util.js');

const commonForm = require('../../utils/js/commonForm.js');
const app = getApp();







Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textApplyNum: app.globalData.lang['OA_addpointsapplydetail_text_applynumber'], //申请单号
    textApplytime: app.globalData.lang['OA_addpointsapplydetail_text_applytime'], //申请时间
    textOperator: app.globalData.lang['OA_addpointsapplydetail_text_operator'], //处理人
    textCostcenter: app.globalData.lang['OA_addpointsapplydetail_text_Costcenter'], // 费用中心
    textExpectedapprovers: app.globalData.lang['OA_addpointsapplydetail_text_Expectedapprovers'], //预计审批人
    textViewexpectedapprovers: app.globalData.lang['OA_formdetail_text_viewexpectedapprovers'], //查看预计审批人
    textTravelitem: app.globalData.lang['OA_travelitemDetailModal_text_item'], //项目
    textTravelitemTotalAmount: app.globalData.lang['OA_travelItem_text_ItemdetailtotalAmount'], //项目明细总金额
    textAttachment: app.globalData.lang['OA_addpointsapplydetail_text_attachment'], //附件
    textWorkflowlog: app.globalData.lang['OA_addpointsapplydetail_text_workflowlog'], //流转日志
    textQuantity: app.globalData.lang['OA_devicepurchasedetail_text_quantity'], //数量
    textFormtype: app.globalData.lang['OA_NewtravelAccount_text_formtype'], //差旅报销单
    textOpen: app.globalData.lang['OA_NewtravelItem_open'], //展开
    textClose: app.globalData.lang['OA_NewtravelItem_close'], //收起
    textBtnCountersign: app.globalData.lang['OA_formbutton_btn_countersign'], //会签
    textBtnApproval: app.globalData.lang['OA_formbutton_btn_approval'], //审批
    textBtnRefuse: app.globalData.lang['OA_formbutton_btn_refuse'], //拒绝
    textBtnNext: app.globalData.lang['OA_formbutton_btn_next'], //下一单
    textBtnSure: app.globalData.lang['OA_index_alert_confirm'], //  确定
    textBtnCancel: app.globalData.lang['OA_formlist_btn_cancel'], // 取消
    textNoDownTitle: app.globalData.lang['OA_no_Down_Title'],
    textNoDownTips: app.globalData.lang['OA_no_Down_Tips'] ,
    operateTitleAgree: app.globalData.lang['OA_AddPointsApplyDetailCtrl_text_approval comments'],// 审批意见
    operateTitleRefuse: app.globalData.lang['OA_AddPointsApplyDetailCtrl_text_ReasontoRefuse'],// 审批意见


    commonHeaderData: {
      code: "",
      fullname: "", // 申请人全名
      account: "", // 申请员工编号
      created: "", // 创建时间
      status: "", // 状态
      activityId: "", // id编号
      actionId: "", // actionId编号
      userId: "", // 用户编号
      workflow_id: "", // 调取预计审批人
      isMutilpCostCenter: "", // 是否是多费用中心
      priority: "", // 优先级
      prioritycode: "", // 优先级状态码
    },
    formDetailkey: [app.globalData.lang['OA_addpointsapplydetail_text_operator'], app.globalData.lang['OA_addpointsapplydetail_text_Costcenter']],
    formDetail: [{
        key: app.globalData.lang['OA_addpointsapplydetail_text_operator'],
        keyCode: "processors",
        value: ""
      },
      {
        key: app.globalData.lang['OA_addpointsapplydetail_text_Costcenter'],
        keyCode: "budget_costcenter",
        value: ""
      },
    ],

    showCostDetail: false,
    loadAgain: false,
    showAgreeCommit: false,
    submitRemark: '',
    operateTitle: '',
    preUserList: [],
    showPreList: false,
    formDetailCostkey: [],
    workflowLogs: [],
    buttonData: [],
    showAttachmentDetail: false,
    // 显示各类的详情的显示
    showDetail: '',
    detailTitle: '', // 特殊明细部分title
    detailValue: [],
    detailValueList: [],
    // 特殊订单的特殊处理
    purchaseContractReviewData: [], // 采购合同的数据
    langStr: app.globalData.langStr, //获取语言信息
    showpreUserList: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取请求的数据
    this.setData({
      optionsId: options.id,
      formId: options.formId,
      title: options.title,
    })
    wx.setNavigationBarTitle({
      title: options.title // 标题
    })
    // 判断当前的表单类型
    switch (options.formId) {
      // case  "采购合同评审": 
      case '01':
        this.setData({
          formDetailkey: commonForm.purchaseContractReview.key,
          formDetail: commonForm.purchaseContractReview.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.purchaseContractReview.detailValue,
          detailTitle: commonForm.purchaseContractReview.title
        })
        break;
        //case  "合同付款": --- todo 项目明细
      case '02':
        this.setData({
          formDetailkey: commonForm.contractPaymentDetail.key,
          formDetail: commonForm.contractPaymentDetail.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.contractPaymentDetail.detailValue,
          detailTitle: commonForm.contractPaymentDetail.title
        })
        break;
        //case  "收入合同评审单":
      case '03':
        this.setData({
          formDetailkey: commonForm.incomeContractReviewDetail.key,
          formDetail: commonForm.incomeContractReviewDetail.value,
        })
        break;
        //case  "费用报销单,亲子园报销单，百事通报销单": 
      case '120':
      case '121':
      case '11':
        this.setData({
          formDetailkey: commonForm.costForm.key,
          formDetail: commonForm.costForm.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.costForm.detailValue,
          detailTitle: commonForm.costForm.title
        })
        break;
        //case  "MICE内部团队申请":
      case '17':
        this.setData({
          formDetailkey: commonForm.mICEGroupApplyDetail.key,
          formDetail: commonForm.mICEGroupApplyDetail.value,
        })
        break;
        // 差旅报销单 
      case '12':
        this.setData({
          formDetailkey: commonForm.travelForm.key,
          formDetail: commonForm.travelForm.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.travelForm.detailValue,
          detailTitle: commonForm.travelForm.title,
          detailValueList: [],
        })
        break;
        //case  "添加积分申请单": 
      case '24':
        this.setData({
          formDetailkey: commonForm.addPointsApplyDetail.key,
          formDetail: commonForm.addPointsApplyDetail.value,
        })
        break;
        //case  "优惠券申领单":
      case '27':
        this.setData({
          formDetailkey: commonForm.couponApplyDetail.key,
          formDetail: commonForm.couponApplyDetail.value,
        })
        break;
        //case  "费用类礼品卡/游票申领单": 
      case '25':
        this.setData({
          formDetailkey: commonForm.costTicketsApplyDetail.key,
          formDetail: commonForm.costTicketsApplyDetail.value,
        })
        break;
        //case  "收入类游票申领单": 
      case '26':
        this.setData({
          formDetailkey: commonForm.incomeTicketsApplyDetail.key,
          formDetail: commonForm.incomeTicketsApplyDetail.value,
        })
        break;
        //case  "员工借款单": 
      case '13':
        this.setData({
          formDetailkey: commonForm.staffLoanDetail.key,
          formDetail: commonForm.staffLoanDetail.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.staffLoanDetail.detailValue,
          detailTitle: commonForm.staffLoanDetail.title,
          detailValueList: [],
        })
        break;
        //case  "设备物品采购单": --
      case '51':
        this.setData({
          formDetailkey: commonForm.devicePurchaseDetail.key,
          formDetail: commonForm.devicePurchaseDetail.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.devicePurchaseDetail.detailValue,
          detailTitle: commonForm.devicePurchaseDetail.title,
          detailValueList: [],
        })
        break;
        //case  "固定资产领用单":
      case '52':
        this.setData({
          formDetailkey: commonForm.fixedAssertsApplyDetail.key,
          formDetail: commonForm.fixedAssertsApplyDetail.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.fixedAssertsApplyDetail.detailValue,
          detailTitle: commonForm.fixedAssertsApplyDetail.title,
          detailValueList: [],
        })
        break;
        // 固定资产调拨单
      case '53':
        this.setData({
          formDetailkey: commonForm.fixedAssertsAllocationDetail.key,
          formDetail: commonForm.fixedAssertsAllocationDetail.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.fixedAssertsAllocationDetail.detailValue,
          detailTitle: commonForm.fixedAssertsAllocationDetail.title,
          detailValueList: [],
        })
        break;
        // 固定资产报废单
      case '54':
        this.setData({
          formDetailkey: commonForm.fixedAssertsScrappedForm.key,
          formDetail: commonForm.fixedAssertsScrappedForm.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.fixedAssertsScrappedForm.detailValue,
          detailTitle: commonForm.fixedAssertsScrappedForm.title,
          detailValueList: [],
        })
        break;
        // 积分政策申领单
      case '28':
        this.setData({
          formDetailkey: commonForm.pointsPolicyApplyForm.key,
          formDetail: commonForm.pointsPolicyApplyForm.value
        })
        break;
        // 法人章申请
      case '72':
        this.setData({
          formDetailkey: commonForm.chapterLegalPersonForm.key,
          formDetail: commonForm.chapterLegalPersonForm.value
        })
        break;
        // 公章用章申请(信函以及公文专用)
      case '73':
        this.setData({
          formDetailkey: commonForm.chapterOfficialSealForm.key,
          formDetail: commonForm.chapterOfficialSealForm.value
        })
        break;
        // 业务章使用申请(全国)
      case '74':
        this.setData({
          formDetailkey: commonForm.chapterBusinessForm.key,
          formDetail: commonForm.chapterBusinessForm.value
        })
        break;
        // 印章刻制申请(全国)
      case '75':
        this.setData({
          formDetailkey: commonForm.chapterSealEngravingForm.key,
          formDetail: commonForm.chapterSealEngravingForm.value
        })
        break;
        // 投资文件用章
      case '76':
        this.setData({
          formDetailkey: commonForm.chapterInvestmentForm.key,
          formDetail: commonForm.chapterInvestmentForm.value
        })
        break;
        // 名片申印单
      case '62':
        this.setData({
          formDetailkey: commonForm.businessCardForm.key,
          formDetail: commonForm.businessCardForm.value
        })
        break;
        // 快递单
      case '65':
        this.setData({
          formDetailkey: commonForm.deliveryForm.key,
          formDetail: commonForm.deliveryForm.value
        })
        break;
        // 出门单
      case '64':
        this.setData({
          formDetailkey: commonForm.goOutForm.key,
          formDetail: commonForm.goOutForm.value
        })
        break;
        // 信件单
      case '66':
        this.setData({
          formDetailkey: commonForm.letterForm.key,
          formDetail: commonForm.letterForm.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.letterForm.detailValue,
          detailTitle: commonForm.letterForm.title,
          detailValueList: [],
        })
        break;
        // 办公物品领用单
      case '60':
        this.setData({
          formDetailkey: commonForm.officeSuppliesForm.key,
          formDetail: commonForm.officeSuppliesForm.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.officeSuppliesForm.detailValue,
          detailTitle: commonForm.officeSuppliesForm.title,
          detailValueList: [],
        })
        break;
        // 派车单
      case '63':
        this.setData({
          formDetailkey: commonForm.sendCarForm.key,
          formDetail: commonForm.sendCarForm.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.sendCarForm.detailValue,
          detailTitle: commonForm.sendCarForm.title,
          detailValueList: [],
        })
        break;
        // 礼品领用单
      case '61':
        this.setData({
          formDetailkey: commonForm.giftCollarForm.key,
          formDetail: commonForm.giftCollarForm.value,
          showDetail: 'chargeDetails',
          detailValue: commonForm.giftCollarForm.detailValue,
          detailTitle: commonForm.giftCollarForm.title,
          detailValueList: [],
        })
        break;

      case '1002': // 申请单
      case '1000': // 领用单
        console.log(123)
        this.setData({
          showDetail: 'chargeDetails',
          detailValue: commonForm.equipmentPurchaseApplicationCtrl.detailValue,
          detailTitle: commonForm.equipmentPurchaseApplicationCtrl.title,
          detailValueList: [],
        })
        break;
      case '1001': // 付款单
        this.setData({
          showDetail: 'chargeDetails',
          detailValue: commonForm.equipmentPayCtrl.detailValue,
          detailTitle: commonForm.equipmentPayCtrl.title,
          detailValueList: [],
        })
        break;
      default:
        this.setData({
          showDetail: 'chargeDetails',
          detailValue: commonForm.commonDetail.detailValue,
          detailTitle: commonForm.commonDetail.title,
          detailValueList: [],
        })
        break;
    }
    this.getDetail(options.id);
  },
  onShow() {
    if (this.data.loadAgain == true) {
      this.getDetail(this.data.optionsId)
    }
  },
  // 获取详情的数据
  getDetail(id) {
    var that = this;
    var formId = that.data.formId;
    let request_body = {
      code: id
    };
    api.PostData('itapp02_getApplyDetail', request_body, function(res) {
      if (res.data) {
        // 获取所有的详情数据，进行格式化
        var data = res.data; // 所有的data
        var headerData = data.left ? (isArr(data.left) ? data.left[0] : {}) : {}; // 顶部的公共信息
        if (headerData) {
          var actionId = "";
          var userId = "";
          var workflow_id = "";
          // 日志
          if (headerData.activity && typeof(headerData.activity.workflowId) != 'undefined' && headerData.activity.workflowId != null) {
            workflow_id = headerData.activity.workflowId;
          }

          if (isArr(data.actions) && data.actions[0] != null) {
            actionId = data.actions[0].wip_id + "";
            userId = data.actions[0].user_id + "";
          }
          var isMutilpCostCenter = false;
          if (getValue(headerData.fields, "budget_application_type") == "多费用中心") {
            isMutilpCostCenter = true;
          }
          // 设置顶部的公共信息
          that.setData({
            // 公共的数据
            commonHeaderData: {
              code: headerData.activity.code,
              fullname: headerData.activity.creator.fullname, // 申请人全名
              account: headerData.activity.creator.account, // 申请员工编号
              created: headerData.activity.created, // 创建时间
              status: headerData.activity.status.name,
              statusCategory: headerData.activity.status.category,
              statusCode: headerData.activity.status.code,
              activityId: headerData.activity.id,
              actionId: actionId,
              userId: userId,
              workflow_id: workflow_id,
              isMutilpCostCenter: isMutilpCostCenter, // 
              priority: headerData.activity.priority.name,
              prioritycode: headerData.activity.priority.code.toLowerCase(),
              budget_isacrossmonth: getValue(headerData.fields, "budget_isacrossmonth"), // 是否跨月
              budget_share_startdate: getValue(headerData.fields, "budget_share_startdate"), // 跨月开始
              budget_share_enddate: getValue(headerData.fields, "budget_share_enddate"), // 跨月结束
            },
          });
          // 各类表单的特殊操作
          switch (formId) {
            // case  "采购合同评审" "收入合同评审单" MICE内部团队申请 添加积分 
            // 优惠券申领单 费用类礼品卡/游票申领单 收入类游票申领单 积分政策申领单:
            // 法人章申请  公章用章申请(信函以及公文专用) 
            // 业务章使用申请(全国)
            // 印章刻制申请(全国)
            // 投资文件用章
            // 名片申印单
            // 快递单
            // 出门单
            case '03':
            case '17':
            case '24':
            case '27':
            case '25':
            case '26':
            case '28':
            case '72':
            case '74':
            case '73':
            case '75':
            case '76':
            case '62':
            case '65':
            case '64':
              break;
              //  采购合同
            case '01':
              getRecipientItem(that.data.commonHeaderData.activityId, that)
              break;
              // 合同付款
            case '02':
              that.getContractPayData(headerData);
              getRecipientItem(that.data.commonHeaderData.activityId, that)
              break;
              // case  "费用报销单,亲子园报销单，百事通报销单 差旅报销":
            case '120':
            case '121':
            case '11':
            case '12':
            case '13':
              getFormDetailByApplyCode(that.data.commonHeaderData.activityId, that)
              break;
              // 设备物品采购单
            case '51':
              console.log(that.data.commonHeaderData.activityId)
              getFormDetailByApplyCode(that.data.commonHeaderData.activityId, that)
              break;
              // 固定资产领用单
            case '52':
              getFormDetailByApplyCode(that.data.commonHeaderData.activityId, that)
              break;
              // 获取礼品明细
            case '61':
              getGiftDetail(that.data.commonHeaderData.activityId, that)
              break;
              // 获取固定资产报废项目明细
            case '54':
              getfixedAssertsDetail(that.data.commonHeaderData.activityId, that)
              break;
              // 获取固定资产调拨项目明细
            case '53':
              getfixedAssertsAllocationDetail(that.data.commonHeaderData.activityId, that)
              break;
              // 获取信件明细
            case '66':
              getLetterDetail(that.data.commonHeaderData.activityId, that)
              break;
              // 获取办公用品明细
            case '60':
              getOfficeSuppliesDetail(that.data.commonHeaderData.activityId, that)
              break;
              // 派车明细
            case '63':
              getSendCarDetail(that.data.commonHeaderData.activityId, that)
              break;
            case '1000':

            case '1002':
              var otherFieldsValue = getFieldValueEquipmentPurchaseValue(headerData);

              var formDetail = that.data.formDetail;
              var tempDetail = formDetail.concat(otherFieldsValue);
              console.log(otherFieldsValue)
              that.setData({
                formDetail: tempDetail
              })
              getFormDetailByApplyCode(that.data.commonHeaderData.activityId, that)
              break;
            case '1001':
              var otherFieldsValue = getFieldValueEquipmentPurchaseValue(headerData);
              var formDetail = that.data.formDetail;
              var tempDetail = formDetail.concat(otherFieldsValue);
              console.log(otherFieldsValue)
              that.setData({
                formDetail: tempDetail
              })
              getPayOitem(that.data.commonHeaderData.activityId, that)
              break;
            default:
              // 公共的表单进入不一样的信息 
              console.log('进入')
              var otherFieldsValue = getFieldValue(headerData);
              var formDetail = that.data.formDetail;
              var tempDetail = formDetail.concat(otherFieldsValue);
              that.setData({
                formDetail: tempDetail
              })
              getFormDetailByApplyCode(that.data.commonHeaderData.activityId, that)
              break;
          }

          that.renderData(data, that.data.formDetail, that.data.formDetailkey)

          // 获取预计审批人
          let getPreUserListFlag = true;
          if (that.data.commonHeaderData.statusCategory === 'COMPLETE'){
            getPreUserListFlag = false 
          }else{
            if ((that.data.commonHeaderData.statusCode === 'Refused')) {
              getPreUserListFlag = false 
            }
          }
          if (getPreUserListFlag){
            that.getPreUserList(workflow_id);
          }
          // 判断当前的底部按钮的状态
          showProgressButton(data, function(buttonData) {
            that.setData({
              buttonData: buttonData
            })
          });
        }
      }
    })
  },
  // 渲染表单数据
  renderData(data, formDetail, formDetailkey) {
    var that = this;
    var commonHeaderData = that.data.commonHeaderData;
    var resData = data;
    var data = resData.left[0];
    var data2 = resData.left[2];
    var formDetailData = {}; // 需要格式化的数据
    formDetailData = getAllDetailSpecile(formDetailData, data); // 获取的是所有的特殊的字段信息的
    formDetailkey.forEach((item, index) => {
      formDetail.forEach((citem, cindex) => {
        if (item == citem.key) {
          citem.value = formDetailData[citem.keyCode] ? getFormatValue(citem.keyCode, formDetailData[citem.keyCode], commonHeaderData) : "";
          citem.showArr = formDetailData[citem.keyCode] ? isArr(formDetailData[citem.keyCode]) : false;
        }
        if (item == '合同有效期') {
          // 删除当前的元素
          var tempValue = formDetailData[citem.keyCode] ? getFormatValue(citem.keyCode, formDetailData[citem.keyCode], commonHeaderData) : "";
          if (tempValue == '长期合同') {
            formDetail.splice(index, 1);
          }
        }
      })
    })
    that.setData({
      formDetail: formDetail,
    });

    console.log(that.data.formDetail)
    // 获取工作日志
    this.setData({
      workflowLogs: getArraysbysearchStr(data2.workflowLogs, "workflowLogs")
    })
    // 获取预算比例
    getBudgetRatio(that.data.commonHeaderData.activityId, that.data.formDetail, that);

    // 获取附件
    getattachments(that.data.commonHeaderData.activityId, that)
  },
  // 获取合同付款单的数据
  getContractPayData(headerData) {
    var that = this;
    var payment_contract = getValue(headerData.fields, "payment_contract_no");
    var payment_contract_no = payment_contract.contractno;
    var contractId = "";
    //获取是否是老oa合同
    var isFromOld = getValue(headerData.fields, "payment_contract_no").isFromOld;
    if (typeof(payment_contract.contract) != 'undefined' &&
      typeof(payment_contract.contract.id) != 'undefined') {
      contractId = getValue(headerData.fields, "payment_contract_no").contract.id;
    } else {
      contractId = payment_contract.contractno;
    }
    var getParams = {
      contractId: contractId,
      isFromOld: isFromOld,
      payment_current_pay_amount: getValue(headerData.fields, "payment_current_pay_amount"), // 本次付款
      activity_currency: getValue(headerData.fields, "activity_currency"),
      payment_current_deposit: getValue(headerData.fields, "payment_current_deposit"), // 本次押金
      payment_current_deposit_offset: getValue(headerData.fields, "payment_current_deposit_offset"), // 本次抵充
    }
    getContractData(getParams, function(res) {
      // "合同编号", "合同总价", "已付金额", "本次付款", "本次押金", "本次抵充", "欠款余额", 
      // 首先判断当前的币种
      if (getParams.activity_currency.code == 'CNY') {
        // 当前币种是人民币
        that.setData({
          contractData: [{
            key: app.globalData.lang['ehr_AdjustmentApplication_p_BZ'],
            value: getParams.activity_currency.code,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_totalcontractamount'],
            value: res.contract_amount_isindefinite == 'Y' ? app.globalData.lang['OA_contractpaymentdetail_text_unsure'] : res.payment_contract_amount,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_amountpaid'],
            value: res.payment_contract_paid_amount,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_amountpaidforthistime'],
            value: getParams.activity_currency.sign + res.payment_current_pay_amount
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_depositforthistime'],
            value: getParams.activity_currency.sign + res.payment_current_deposit
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_depositoffsetforthistime'],
            value: getParams.activity_currency.sign + res.payment_current_deposit_offset
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_paymentbalance'],
            value: res.payment_balance,
            isRed: res.isRed
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_paymentreason'],
            value: getValue(headerData.fields, "payment_reason"),
          }]
        })
      } else {
        that.setData({
          contractData: [{
            key: app.globalData.lang['ehr_AdjustmentApplication_p_BZ'],
            value: getParams.activity_currency.code,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_totalcontractamount'],
            value: res.contract_amount_isindefinite == 'Y' ? '不定' : res.payment_contract_amount,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_amountpaid'],
            value: res.payment_contract_paid_amount,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_amountpaidforthistime'],
            value: getParams.activity_currency.sign + res.payment_current_pay_amount
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_depositoffsetforthistimeRMB'],
            value: res.payment_current_pay_amountRMB,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_depositforthistime'],
            value: getParams.activity_currency.sign + res.payment_current_deposit
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_depositoffsetforthistimeRMB'],
            value: res.payment_current_depositRMB,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_depositoffsetforthistime'],
            value: getParams.activity_currency.sign + res.payment_current_deposit_offset
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_depositoffsetforthistimeRMB'],
            value: res.payment_current_deposit_offsetRMB,
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_paymentbalance'],
            value: res.payment_balance,
            isRed: res.isRed
          }, {
            key: app.globalData.lang['OA_contractpaymentdetail_text_paymentreason'],
            value: getValue(headerData.fields, "payment_reason"),
          }]
        })
      }
      // 渲染单独的表单信息
      var formDetail = that.data.formDetail
      var tempData = that.data.contractData;
      formDetail.splice(7, 0, ...tempData);
      that.setData({
        formDetail: formDetail
      })
    })
  },
  // 获取预计审批人的接口
  getPreUserList(workflow_id) {
    var that = this;
    var request_body = {
      workflow_id: workflow_id
    }
    api.PostData('itapp02_queryPreUser', request_body, function(res) {
      if (res.data && res.data.alluser) {
        var alluser = getpreUser(res.data.alluser);
        that.setData({
          preUserList: alluser,
          showpreUserList: true,
        })
      }
    }, true)
  },

  // 显示明细详情
  showCostDetailFunc() {
    var showCostDetail = this.data.showCostDetail
    this.setData({
      showCostDetail: !showCostDetail
    })
  },
  // 显示附件明细
  showAttachmentDetailFunc() {
    var showAttachmentDetail = this.data.showAttachmentDetail;
    this.setData({
      showAttachmentDetail: !showAttachmentDetail
    })
  },
  // 审批
  agreeConfirm() {
    this.setData({
      showAgreeCommit: true,
      operateTitle: this.data.operateTitleAgree
    })
  },
  // 拒绝
  refuseConfirm() {
    this.setData({
      showAgreeCommit: true,
      operateTitle: this.data.operateTitleRefuse
    })
  },
  // 添加会签
  addFlowAgent() {
    var actionId = this.data.commonHeaderData.actionId;
    var activityId = this.data.commonHeaderData.activityId;
    wx.navigateTo({
      url: `/pages/detail/addFlow?actionId=${actionId}&activityId=${activityId}`,
    })
  },
  // 下一步的逻辑
  goNext() {
    // 直接跳转到下一步的页面的逻辑，不是渲染当前的页面
    // 获取当前所有的列表的数据、
    var spliceId = "";
    var nextId = ""; // 下一单的表单ID
    var nextType = ""; // 下一单的表单类型
    var nextTitle = "";
    var nextAppType = "";
    var nextAppSubType = ""
    var listData = wx.getStorageSync("listData");
    // 如果listData的长度为0
    if (listData.length == 0) {
      // 返回首页
      wx.redirectTo({
        url: '/pages/index/index'
      })
    } else {
      // 进入下一单的处理
      for (var i = 0; i < listData.length; i++) {
        if (listData[i].APP_ID === this.data.optionsId) {
          spliceId = i; // 暂时记下当前的id
          listData.splice(i, 1); // 
        }
      }
      wx.setStorageSync("listData", listData)
      if (listData.length > 0) {

        if (spliceId === listData.length) {
          nextId = listData[0].APP_ID;
          nextType = listData[0].APP_FormType;
          nextTitle = listData[0].APP_Subject;
          nextAppType = listData[0].APP_Type;
          nextAppSubType = listData[0].APP_SubType;
        } else {
          for (var i = 0; i < listData.length; i++) {

            if (spliceId === i) {
              nextId = listData[i].APP_ID;
              nextType = listData[i].APP_FormType;
              nextTitle = listData[i].APP_Subject;
              nextAppType = listData[0].APP_Type;
              nextAppSubType = listData[0].APP_SubType;
            }
          }
        }
        if (nextAppType == 'HoldingOA') {
          wx.redirectTo({
            url: `/pages/holdOAdetail/index?id=${nextId}&formId=${nextType}&title=${nextTitle}&appSubType=${nextAppSubType}`,
          });
        } else {
          wx.redirectTo({
            url: `/pages/detail/index?id=${nextId}&formId=${nextType}&title=${nextTitle}`,
          });
        }
      } else {
        wx.redirectTo({
          url: '/pages/index/index'
        })
      }
    }
  },
  changeRemark(e) {
    let value = e.detail.value;
    this.setData({
      submitRemark: value,
    })
  },
  sureConfirm() {
    var request_body = {
      "activityid": this.data.commonHeaderData.activityId,
      "actionId": this.data.commonHeaderData.actionId,
      "code": this.data.commonHeaderData.code,
      "userId": this.data.commonHeaderData.userId,
      "remark": this.data.submitRemark,
      "dealtype": 1,
      "activity": {}
    }
    if (this.data.operateTitle == this.data.operateTitleRefuse) {
      request_body.dealtype = 2;

      this.submitFunc(request_body, 'itapp02_appRefuseOperate');
    } else {

      this.submitFunc(request_body, 'itapp02_appCommitOperate');
    }
  },
  submitFunc(request_body, url) {
    var that = this;
    let submitFlag = false;
    if (url === 'itapp02_appCommitOperate') submitFlag = true;
    if (url === 'itapp02_appRefuseOperate') submitFlag = request_body.remark.length > 0 ? true : false; 
    if (submitFlag) {
      wx.showLoading({
        title: '提交中。。。',
      });
      api.PostData(url, request_body, function(res) {
        const {
          data = {
            msg: ''
          }
        } = res;
        if (data.msg === "审批成功！") {
          // wx.showToast({
          //   title: 'success',
          //   success: () => {
              that.goNext();
          //   }
          // })
        } else {
          wx.showToast({
            icon: 'none',
            title: app.globalData.lang['OA_AddItemDetail_alert_ConfirmSubmit_Error'],
          })
        }
      })
    } else {
      wx.showToast({
        title: that.data.operateTitle,
        icon: 'none',
        duration: 2000
      })
    }
  },
  cancelConfirm() {
    // 取消
    this.setData({
      submitRemark: "",
      showAgreeCommit: false
    })
  },
  showPreListFunc() {
    this.setData({
      showPreList: true
    })
  },
  hidePreListFunc() {
    this.setData({
      showPreList: false
    })
  },
  // 查看个人信息
  goUserInfo(e) {
    let empcode = e.currentTarget.dataset.empcode;
    if (client == 'nfes') {
      nwx.openURL({
        url: `ctripoaapp://?type=_native&page=cContactsUserDetail&tips=${empcode}`
      })
    }
  },
  // 下载附件功能
  downLoadFile(e) {
    let index = e.currentTarget.dataset.idx;
    let {
      oaattachmentList
    } = this.data;

    let {
      fileType,
      tempFileUrl
    } = oaattachmentList[index]
    if (fileType.isCanDown) {
      // 可以下载的类型
      if (fileType.mimetype === "image") {
        let imgUrl = downUrlHost + tempFileUrl + '&disable_redirect_https=1';
        wx.previewImage({
          current: imgUrl,
          urls: [imgUrl]
        })
      } else {
        let url = downUrlHost + tempFileUrl;
        wx.downloadFile({
          url,
          success(res) {
            wx.openDocument({
              filePath: res.tempFilePath,
              fileType: fileType.mimetype
            })
          }
        })
      }
    } else {
      wx.showModal({
        title: this.data.textNoDownTitle,
        content: this.data.textNoDownTips,
        showCancel: false,
      })
    }
  }

})