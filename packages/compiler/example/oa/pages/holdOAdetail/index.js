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
  getFieldValueHoldOA
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
  formatBudgetData,
  formatAttachments,
  formatDetailByApplyCode
} = require('../../utils/js/getDetailCommon.js');
const {
  isArr,
  Outputmoney
} = require('../../utils/js/util.js');

const commonForm = require('../../utils/js/commonForm.js');
const app = getApp();







Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
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
    textNoDownTips: app.globalData.lang['OA_no_Down_Tips'],
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
    formDetailkey: [app.globalData.lang['OA_addpointsapplydetail_text_operator']],
    formDetail: [{
      key: app.globalData.lang['OA_addpointsapplydetail_text_operator'],
      keyCode: "processors",
      value: ""
    }],

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
    showDetail: 'chargeDetails',
    detailTitle: '项目明细', // 特殊明细部分title
    detailValue: [{
      key: app.globalData.lang['OA_addpointsapplydetail_text_itemname'], // 项目名称
      keyCode: 'itemName',
      value: '',
    }, {
      key: app.globalData.lang['OA_devicepurchasedetail_text_unitprice'], // 项目单价
      keyCode: 'price',
      value: '',
    }, {
      key: app.globalData.lang['OA_Form_Detail_Residue'], // 残值
      keyCode: 'residue',
      value: '',
    }, {
      key: app.globalData.lang['OA_devicepurchasedetail_text_totalprice'], // 总价
      keyCode: 'sum',
      value: '',
    }, {
      key: app.globalData.lang['OA_fixedassertallocationdetail_text_usedate'], // 使用日期
      keyCode: 'useDate',
      value: '',
    }, {
      key: app.globalData.lang['OA_devicepurchasedetail_text_explanation'], // 用途
      keyCode: 'explanation',
      value: '',
    }],
    detailValueList: [],
    // 特殊订单的特殊处理
    purchaseContractReviewData: [], // 采购合同的数据
    langStr: app.globalData.langStr, //获取语言信息
    showpreUserList:false,
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
      syscode: options.appSubType
    })
    wx.setNavigationBarTitle({
      title: options.title // 标题
    })
    this.getDetail(options.id, options.appSubType);
  },
  onShow() {
    if (this.data.loadAgain == true) {
      this.getDetail(this.data.optionsId)
    }
  },
  // 获取详情的数据
  getDetail(id, syscode) {
    var that = this;
    var formId = that.data.formId;
    let request_body = {
      code: id,
      syscode: syscode
    };
    // 控股的详情获取
    api.PostData('itapp02_getHoldingApplyDetail', request_body, function(res) {
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
              statusCode: headerData.activity.status.category,
              activityId: headerData.activity.id,
              actionId: actionId,
              userId: userId,
              workflow_id: workflow_id,
              isMutilpCostCenter: isMutilpCostCenter, // 
              priority: headerData.activity.priority.name,
              prioritycode: headerData.activity.priority.code.toLowerCase(),
              budget_isacrossmonth: getValue(headerData.fields, "budget_isacrossmonth"), // 是否跨月
              budget_share_startdate: getValue(headerData.fields, "budget_share_startdate"), // 跨月开始
              budget_share_enddate: getValue(headerData.fields, "budget_share_enddate") // 跨月结束
            },
          });
          // 各类表单的特殊操作
          // 公共的表单进入不一样的信息 
          var otherFieldsValue = getFieldValueHoldOA(headerData, that.data.commonHeaderData);
          var formDetail = that.data.formDetail;
          var tempDetail = formDetail.concat(otherFieldsValue);

          that.setData({
            formDetail: tempDetail
          })
          that.renderData(data, tempDetail, syscode)

          // 获取预计审批人
          if (!(that.data.commonHeaderData.statusCode === 'COMPLETE')) {
            that.getPreUserList(workflow_id, that.data.syscode);
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
  renderData(data, tempDetail, syscode) {
    var that = this;
    var commonHeaderData = that.data.commonHeaderData;
    var resData = tempDetail;
    var data2 = data.left[2]
    var data0 = data.left[0]
    var formDetailData = {};

    resData.forEach((item, index) => {
      if (item.keyCode == 'processors') {
        item.value = getProcessors(data0.activity.processors)
      }
      if (isArr(item.value)) {
        item.showArr = true;
      }
    })
    that.setData({
      formDetail: resData,
    });
    // 获取工作日志
    this.setData({
      workflowLogs: getArraysbysearchStr(data2.workflowLogs, "workflowLogs")
    })
    // 获取预算比例
    that.getBudgetRatio(that.data.commonHeaderData.activityId, that.data.formDetail, syscode);

    // 获取附件
    that.getattachments(that.data.commonHeaderData.activityId, that.data.syscode)

    // 获取明细
    that.getFormDetailByApplyCode(that.data.commonHeaderData.activityId, that.data.syscode)
  },
  // 获取明细
  getFormDetailByApplyCode(activityId, syscode) {
    var that = this;
    var request_body = {
      id: activityId,
      syscode: syscode
    }
    api.PostData('itapp02_getHoldingOaItemDetail', request_body, function(res) {
      formatDetailByApplyCode(res, that)
    })
  },
  // 获取预算比例
  getBudgetRatio(activityId, formDetail, syscode) {
    var that = this;
    var request_body = {
      activityid: activityId,
      syscode: syscode
    };
    api.PostData('itapp02_getHoldingOABudgetRatio', request_body, function(res) {
      if (res.data) {
        let BudgetRatio = [];
        var res = res.data
        // 格式化预算的数据
        BudgetRatio = formatBudgetData(res)
        // 设置预算比例的值
        formDetail.push({
          key: '预算比例',
          keyCode: 'BudgetRatio',
          value: BudgetRatio,
          showArr: true,
        })
        that.setData({
          formDetail: formDetail,
        });
      }
    })
  },
  // 获取附件
  getattachments(activityId, syscode) {
    var that = this;
    var request_body = {
      "activityid": activityId,
      "syscode": syscode
    };
    api.PostData('itapp02_HoldingAttachments', request_body, function(res) {
      formatAttachments(res, that)
    })
  },
  // 获取预计审批人的接口
  getPreUserList(workflow_id, syscode) {
    var that = this;
    var request_body = {
      workflow_id: workflow_id,
      syscode: syscode
    }
    api.PostData('itapp02_HoldingqueryPreUser', request_body, function(res) {
      if (res.data && res.data.alluser) {
        var alluser = getpreUser(res.data.alluser)
        that.setData({
          preUserList: alluser,
          showpreUserList: true,
        })
      }
    })
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
      url: `/pages/holdOAdetail/addFlow?actionId=${actionId}&activityId=${activityId}&syscode=${this.data.syscode}`,
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
      "syscode": this.data.syscode,
      "activity": {}
    }
    if (this.data.operateTitle == this.data.operateTitleRefuse) {
      // request_body.syscode = 2;
      request_body = {
        "remark":this.data.submitRemark,
        "activityId": this.data.commonHeaderData.activityId,
        "syscode":  this.data.syscode
    };

      this.submitFunc(request_body, 'itapp02_HoldingRefuseApply');
    } else {

      this.submitFunc(request_body, 'itapp02_HoldingCommitApply');
    }
  },
  submitFunc(request_body, url) {
    var that = this;
    let submitFlag = false;
    if (url === 'itapp02_HoldingCommitApply') submitFlag = true;
    if (url === 'itapp02_HoldingRefuseApply') submitFlag = request_body.remark.length > 0 ? true : false;
    if (submitFlag) {
      wx.showLoading();
      api.PostData(url, request_body, function(res) {
        const {
          data = {
            msg: ''
          }
        } = res;
        // 审批成功
          wx.showToast({
          title: 'success',
          success: () => {
            that.goNext();
          }
        })
        // if (data.msg === "审批成功！") {
       
        // } else {
        //   wx.showToast({
        //     icon: 'none',
        //     title: app.globalData.lang['OA_AddItemDetail_alert_ConfirmSubmit_Error'],
        //   })
        // }
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
        title:  this.data.textNoDownTitle,
        content: this.data.textNoDownTips,
        showCancel: false,
      })
    }
  }
})