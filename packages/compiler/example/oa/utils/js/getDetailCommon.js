const api = require('./api.js');
const app = getApp();
const {
  getValue,
  getArraysbysearchStr,
  getProcessors,
  showProgressButton,
  getpreUser
} = require('./dataformat.js');

const {
  isArr,
  Outputmoney,
  getImgSrc,
  getMimeType
} = require('./util.js');

const textTotalprice = app.globalData.lang['OA_devicepurchasedetail_text_totalprice'], // 总价
  textTotalamount = app.globalData.lang['OA_costaccountdetail_text_totalamount'], // 总额
  textTotalquantity = app.globalData.lang['OA_letterdetail_text_totalquantity'] // 总数


const getAllDetailSpecile = (formDetailData, data) => {
  formDetailData.processors = getProcessors(data.activity.processors);; // 处理人
  formDetailData.budget_costcenter = getArraysbysearchStr(data.fields, "budget_costcenter"); // 费用中心
  formDetailData.payment_company = getValue(data.fields, "payment_company"); // 付款公司
  formDetailData.budget_share_month = getValue(data.fields, "budget_share_month"); // 分摊月份
  formDetailData.expense_start_date = getValue(data.fields, "expense_start_date"); // 出差开始时间
  formDetailData.expense_end_date = getValue(data.fields, "expense_end_date"); // 出差结束时间
  formDetailData.mice_reason = getValue(data.fields, "mice_reason"); // 事由
  formDetailData.expense_place = getValue(data.fields, "expense_place"); // 出差地点
  formDetailData.budget_budgettype = getArraysbysearchStr(data.fields, "budget_budgettype"); // 预算分类
  formDetailData.BudgetRatio = []; // 预算比例
  formDetailData.activity_remark = getValue(data.fields, "activity_remark");; // 备注
  formDetailData.expense_invoice_number = getValue(data.fields, "expense_invoice_number"); // 发票张数
  formDetailData.budget_application_type = getValue(data.fields, "budget_application_type"); // 预算填报类型
  formDetailData.payment_feetype = getValue(data.fields, "payment_feetype"); // 费用种类

  formDetailData.biz_company_cn = getValue(data.fields, "biz_company_cn"); // 公司名称（中文）
  formDetailData.biz_company_en = getValue(data.fields, "biz_company_en"); // 公司名称（英文）
  formDetailData.applicant_name_chinese = getValue(data.fields, "applicant_name_chinese"); // 申请人姓名（中文）
  formDetailData.applicant_name_english = getValue(data.fields, "applicant_name_english"); // 申请人姓名（英文）
  formDetailData.position_chinese = getValue(data.fields, "position_chinese"); // 申请职位（中文）
  formDetailData.position_english = getValue(data.fields, "position_english"); // 申请职位（英文）
  formDetailData.biz_dept_chinese = getValue(data.fields, "biz_dept_chinese"); // 申请人部门（中文）
  formDetailData.biz_dept_english = getValue(data.fields, "biz_dept_english"); // 申请人部门（英文）
  formDetailData.biz_addr_chinese = getValue(data.fields, "biz_addr_chinese"); // 申请人地址（中文）
  formDetailData.biz_addr_english = getValue(data.fields, "biz_addr_english"); // 申请人地址（英文）
  formDetailData.office_telephone = getValue(data.fields, "office_telephone"); // 办公电话
  formDetailData.fax_telephone = getValue(data.fields, "fax_telephone"); // 传真电话
  formDetailData.mobile_phone = getValue(data.fields, "mobile_phone"); // 手机寻呼
  formDetailData.e_mail = getValue(data.fields, "e_mail"); // 电子邮件
  formDetailData.personal_wechat = getValue(data.fields, "personal_wechat"); // 个人微信号
  formDetailData.apply_number = getValue(data.fields, "apply_number"); // 申印盒数
  formDetailData.retirement_costcenter = getValue(data.fields, "retirement_costcenter"); // 报废部门
  formDetailData.recipients_company = getValue(data.fields, "recipients_company"); // 所属公司
  formDetailData.allocation_out_costcenter = getValue(data.fields, "allocation_out_costcenter"); // 调出部门
  formDetailData.allocation_in_costcenter = getValue(data.fields, "allocation_in_costcenter"); // 调入部门
  formDetailData.integral_name = getValue(data.fields, "integral_name"); // 积分政策名称
  formDetailData.integral_type = getValue(data.fields, "integral_type"); // 积分政策类型
  formDetailData.integral_total_points = getValue(data.fields, "integral_total_points"); // 发放积分
  formDetailData.integral_year_points = getValue(data.fields, "integral_year_points"); // 预发积分
  formDetailData.integral_rule = getValue(data.fields, "integral_rule"); // 发放规则
  formDetailData.business_chapter_company = getValue(data.fields, "business_chapter_company"); // 用章公司
  if (typeof(formDetailData.business_chapter_company) == 'undefined') {
    formDetailData.business_chapter_company = "";
  } else {
    formDetailData.business_chapter_company = formDetailData.business_chapter_company.name
  }
  formDetailData.business_chapter_dept = getValue(data.fields, "business_chapter_dept"); // 用章部门
  if (typeof(formDetailData.business_chapter_dept) == 'undefined') {
    formDetailData.business_chapter_dept = "";
  } else {
    formDetailData.business_chapter_dept = formDetailData.business_chapter_dept.name
  }
  formDetailData.seal_reason = getValue(data.fields, "seal_reason"); // 公章用章申请(信函以及公文专用)事由
  formDetailData.business_chapter_usereason = getValue(data.fields, "business_chapter_usereason"); // 业务章使用申请(全国)用章理由
  formDetailData.stamper_usefor = getValue(data.fields, "stamper_usefor"); // 印章用途
  formDetailData.stamper_unit = getValue(data.fields, "stamper_unit"); // 印章单位
  formDetailData.stamper_content = getValue(data.fields, "stamper_content"); // 印章内容
  formDetailData.investment_filetype = getValue(data.fields, "investment_filetype").value; // 文件类型
  // 快递单 收件地址部分
  if (getValue(data.fields, "is_branch_office") == 'N') { // 是否分公司
    formDetailData.recipient_address_result = getValue(data.fields, "recipient_address"); // 收件地址
  } else {
    if (typeof(getValue(data.fields, "recipient_address_select")) == 'undefined') {
      formDetailData.recipient_address_result = '';
    } else {
      formDetailData.recipient_address_result = getValue(data.fields, "recipient_address_select").value;
    }
  };
  formDetailData.recipient_name = getValue(data.fields, "recipient_name"); // 收件人姓名
  formDetailData.recipient_phone = getValue(data.fields, "recipient_phone"); // 收件人电话
  formDetailData.carrier = getValue(data.fields, "Express_carrier"); // 承运商
  if (typeof(formDetailData.carrier) != 'undefined') {
    formDetailData.carrier = formDetailData.carrier.value;
  }
  formDetailData.waybill_number = getValue(data.fields, "waybill_number"); // 运单号
  formDetailData.express_type = getValue(data.fields, "express_type_new"); // 快递类型
  if (typeof(formDetailData.express_type) != 'undefined') {
    formDetailData.express_type = formDetailData.express_type.value;
  }
  formDetailData.express_details = getValue(data.fields, "express_details"); // 快递详情
  formDetailData.go_out_date = getValue(data.fields, "go_out_date"); // 日期
  formDetailData.res_list = getValue(data.fields, "res_list"); // 物品清单
  formDetailData.letter_detail = getValue(data.fields, "letter_detail"); // 信件详情
  formDetailData.use_car_reason = getValue(data.fields, "use_car_reason"); // 用车原因
  formDetailData.customer_name = getValue(data.fields, "Customer_name"); // 客户名称
  formDetailData.apply_for_use = getValue(data.fields, "Apply_for_use"); // 申领用途


  // 采购合同评审
  formDetailData.contract_company = getArraysbysearchStr(data.fields, "contract_company");; // 签约公司
  formDetailData.activity_assetsauditdepartment = getValue(data.fields, "activity_assetsauditdepartment");; // 审核部门
  formDetailData.activity_suppliercategory = getValue(data.fields, "activity_suppliercategory");; // 供应商
  formDetailData.contract_no = getArraysbysearchStr(data.fields, "contract_no"); // 合同编号
  formDetailData.contract_name = getValue(data.fields, "contract_name");; // 合同名称
  formDetailData.contract_agreement_unit = getValue(data.fields, "contract_agreement_unit"); // 协议单位
  formDetailData.contract_deposit = getValue(data.fields, "contract_deposit");; // 押金
  formDetailData.contract_duration = getValue(data.fields, "contract_islongtime") != 'Y' ? `${getValue(data.fields, "contract_startdate")}  ～   ${getValue(data.fields, "contract_enddate")}` : `长期合同`; // 合同有效期
  formDetailData.contract_amount = getValue(data.fields, "contract_amount_isindefinite") != 'Y' ? `${getValue(data.fields, "contract_amount")}` : `${getValue(data.fields, "activity_currency")}不定`; // 合同金额
  // 合同付款
  formDetailData.payment_payee = getValue(data.fields, "payment_payee");; // 收款单位
  formDetailData.payment_payee_account = getValue(data.fields, "payment_payee_account");; // 收款账号
  formDetailData.payment_reason = getValue(data.fields, "payment_reason");; // 付款理由
  formDetailData.payment_contract_no = [getValue(data.fields, "payment_contract_no").contractno]; // 采购合同编号
  // 收入合同评审单
  formDetailData.contract_keyword = getValue(data.fields, "contract_keyword"); // 关键字
  // MICE内部团队申请
  formDetailData.mice_teamno = getValue(data.fields, "mice_teamno"); // 团队号
  formDetailData.mice_teamamount = getValue(data.fields, "mice_teamamount"); // 团队金额
  // 添加积分申请单
  formDetailData.coupons_project_name = getValue(data.fields, "coupons_project_name"); // 项目名称
  formDetailData.coupons_project_no = getValue(data.fields, "coupons_project_no"); // 项目编号
  formDetailData.integral_total_points = getValue(data.fields, "integral_total_points"); // 总积分
  formDetailData.integral_total_amount = formDetailData.integral_total_points && (formDetailData.integral_total_points / 100); // 总成本
  // 费用类礼品卡/游票申领单
  formDetailData.coupons_type = getValue(data.fields, "coupons_type"); // 游票类型
  formDetailData.coupons_form = getValue(data.fields, "coupons_form"); // 游票形式
  formDetailData.coupons_project_no_giftcard = getCoupons_Project_no(getValue(data.fields, "coupons_form"), getValue(data.fields, "coupons_project_no")); // 游票类项目编号
  formDetailData.coupons_effectdata = getValue(data.fields, "coupons_effectdata"); // 生效日期
  formDetailData.coupons_project_nature = getValue(data.fields, "coupons_project_nature"); //项目性质
  formDetailData.coupons_total = getValue(data.fields, "coupons_total"); //发放金额
  formDetailData.coupons_use_rate = getValue(data.fields, "coupons_use_rate") + '%'; //预计使用率或者折扣率
  formDetailData.coupons_total_cost = getValue(data.fields, "coupons_total_cost"); //预计成本
  // 收入类礼品卡/游票申领单
  formDetailData.coupons_actual_receipts = getValue(data.fields, "coupons_actual_receipts"); //实际收款额
  // 设备物品采购单
  formDetailData.payment_conditions_effect_date = getValue(data.fields, "payment_conditions_effect_date"); // 付款条件生效日期
  formDetailData.payment_earliest_date = getValue(data.fields, "payment_earliest_date"); // 预计支付日期 
  formDetailData.budget_isautosign = getValue(data.fields, "budget_isautosign") != 'N' ? '是' : '否'; // 是否邀请自动会签
  formDetailData.activity_businessgroup = getValue(data.fields, "activity_businessgroup"); // 业务分组
  formDetailData.linkto_activity_id = getValue(data.fields, "linkto_activity_id"); // 关联 表单
  formDetailData.payment_isicbc = getValue(data.fields, "payment_isicbc"); // 是否工商银行
  formDetailData.payment_bankname = getValue(data.fields, "payment_bankname"); // 银行名称
  formDetailData.payment_bankno = getValue(data.fields, "payment_bankno"); // 开户行联行号 
  formDetailData.payment_bankcity = getValue(data.fields, "payment_bankcity"); // 开户行所在城市
  formDetailData.actual_payment_amount = getValue(data.fields, "actual_payment_amount"); // 实际付款金额
  formDetailData.budget_isinbudget = getValue(data.fields, "budget_isinbudget") == 'Y' ? '是' : '否'; // 是否预算内
  formDetailData.invoice_audit_remark = getValue(data.fields, "invoice_audit_remark"); // 发票审核备注 
  formDetailData.receipt_invoice = getValue(data.fields, "receipt_invoice"); // 收到发票状态
  formDetailData.price_tax_invoice_detail = getValue(data.fields, "price_tax_invoice_detail"); // 价税分离发票详情
  formDetailData.linkto_activity_list = getValue(data.fields, "linkto_activity_list"); // 关联表单列表
  formDetailData.purchase_items = getValue(data.fields, "purchase_items"); // 设备物品采购项目明细
  formDetailData.uploadEInvoiceFile = getValue(data.fields, "uploadEInvoiceFile"); // 电子发票
  formDetailData.uploadEInvoiceFile = getValue(data.fields, "uploadEInvoiceFile"); // 电子发票
  // 固定资产领用单
  //领用部门
  formDetailData.recipients_costcenter = getValue(data.fields, "recipients_costcenter"); // 领用部门
  formDetailData.recipients_company = getValue(data.fields, "recipients_company"); // 所属公司
  formDetailData.arrival_area = getValue(data.fields, "Arrival_area"); // 评审编号 
  return formDetailData;
}

const getCoupons_Project_no = (coupons_form, coupons_project_no) => {
  var coupons_form_code = "";
  switch (coupons_form) {
    case "游票":
    case "TS":
      coupons_form_code = "TS";
      break;
    case "游票券":
    case "CS":
      coupons_form_code = "CS";
      break;
    case "后赋值游票券":
    case "LS":
      coupons_form_code = "LS";
      break;
  }
  return coupons_form_code + coupons_project_no;
}

const getContractData = (getParams, callback) => {
  var request_body = {
    activityId: getParams.contractId + '', // 转为字符串
    isFromOld: getParams.isFromOld,
  }
  api.PostData('itapp02_getContractData', request_body, function(res) {
    if (res.data) {
      var contractData = formatContractData(res.data, getParams);
      callback(contractData)
    }
  },true)
};

const formatContractData = (data, getParams) => {
  var ContractAmount = data.amount;
  var ContractData = {};
  var payment_contract_paid_amount = data.payment_contract_paid_amount;
  if (typeof(data.currency) != 'undefined' &&
    data.currency != null &&
    data.currency.length > 0) {
    var currency = JSON.parse(data.currency);
  }
  if (data.currency.length > 0 &&
    typeof(currency) != 'undefined' &&
    currency != null &&
    typeof(currency.currentRate) != 'undefined') {
    ContractAmount = currency.currentRate * data.amount;
    payment_contract_paid_amount = currency.currentRate * data.payment_contract_paid_amount;
  }


  var currentAmount = getParams.payment_current_pay_amount;
  if (typeof(getParams.activity_currency) != 'string' &&
    typeof(getParams.activity_currency) != 'undefined' &&
    getParams.activity_currency != null &&
    typeof(getParams.activity_currency.currentRate) != 'undefined') {
    currentAmount = getParams.activity_currency.currentRate * parseFloat(currentAmount);
  }
  //本次付款金额人民币
  ContractData.payment_current_pay_amount = Outputmoney(getParams.payment_current_pay_amount);
  ContractData.payment_current_pay_amountRMB = "¥" + Outputmoney(currentAmount);
  //本次押金RMB  
  var payment_current_deposit = getParams.payment_current_deposit;
  ContractData.payment_current_depositRMB = getParams.activity_currency.currentRate * parseFloat(payment_current_deposit);
  ContractData.payment_current_depositRMB = "¥" + Outputmoney(ContractData.payment_current_depositRMB);
  ContractData.payment_current_deposit = Outputmoney(payment_current_deposit);
  //本次抵充RMB
  var payment_current_deposit_offset = getParams.payment_current_deposit_offset;
  ContractData.payment_current_deposit_offsetRMB = getParams.activity_currency.currentRate * parseFloat(payment_current_deposit_offset);
  ContractData.payment_current_deposit_offsetRMB = "¥" + Outputmoney(ContractData.payment_current_deposit_offsetRMB);
  ContractData.payment_current_deposit_offset = Outputmoney(payment_current_deposit_offset);

  //合同金额
  if (data.currency.length > 0 && currency != null && typeof(currency.sign) != 'undefined') {
    ContractData.payment_contract_amount = currency.sign + Outputmoney(data.amount);
    //已付款金额
    ContractData.payment_contract_paid_amount = currency.sign + Outputmoney(data.payment_contract_paid_amount);
  }


  if (typeof(data.isindefinite) != 'undefined' && data.isindefinite != null && data.isindefinite.length > 0) {
    ContractData.contract_amount_isindefinite = data.isindefinite;

  }
  if (ContractData.contract_amount_isindefinite == 'Y') {
    ContractData.payment_balance = "";
    ContractData.payment_contract_paid_amount = "¥" + Outputmoney(data.payment_contract_paid_amount);
  } else {
    ContractData.payment_balance = parseFloat(ContractAmount) - parseFloat(payment_contract_paid_amount) - parseFloat(currentAmount);
    ContractData.isRed = ContractData.payment_balance < 0;
    ContractData.payment_balance = '¥' + Outputmoney(ContractData.payment_balance);
  }
  return ContractData;
}



// 获取预算
const getBudgetRatio = (activityId, formDetail, that) => {
  var request_body = {
    activityid: activityId
  };
  api.PostData('itapp02_getBudgetRatio', request_body, function(res) {
    if (res.data) {
      let BudgetRatio = [];
      var res = res.data
      // 格式化预算的数据
      BudgetRatio = formatBudgetData(res)
      // 设置预算比例的值
      if (isArr(formDetail)) {
        for (var i = 0; i < formDetail.length; i++) {
          if (formDetail[i].keyCode == "BudgetRatio") {
            formDetail[i].value = BudgetRatio;
          }
        }
      }
      that.setData({
        formDetail: formDetail,
      });
    }
  }, true)
}
const formatBudgetData = (res, that) => {
  var BudgetRatio = [];
  if (isArr(res)) {
    for (var d = 0; d < res.length; d++) {
      var item = {
        costCenter: '',
        year: '',
        quarter: '',
        ratio: 0,
        budgetType: ''
      };
      item.year = res[d].year;
      item.quarter = res[d].quarter;
      item.ratio = res[d].ratio;
      if (typeof(res[d].costCenter.regional.name) != 'undefined' &&
        typeof(res[d].costCenter.name) != 'undefined' &&
        typeof(res[d].costCenter.code) != 'undefined') {
        item.costCenter = res[d].costCenter.regional.name + '-' + res[d].costCenter.name + '(' + res[d].costCenter.code + ')';
      }

      if (typeof(res[d].budgetType) != 'undefined' &&
        typeof(res[d].budgetType.parentDO) != 'undefined' &&
        typeof(res[d].budgetType.parentDO.value) != 'undefined') {
        item.budgetType = res[d].budgetType.parentDO.value + '-' + res[d].budgetType.value;
      }
      BudgetRatio.push(item);
    }
  }
  return BudgetRatio
}
// 获取费用明细
const getFormDetailByApplyCode = (activityId, that) => {
  var request_body = {
    id: activityId
  }
  api.PostData('itapp02_getOaItemDetail', request_body, function(res) {
    formatDetailByApplyCode(res, that)
  }, true)
}
// 格式化费用的数据
const formatDetailByApplyCode = (data, that) => {
  
  var detailValue = JSON.parse(JSON.stringify(that.data.detailValue));
  var data = data.data;
  var oaItemPartList = [];
  var totalAmt = 0.00;
  if (isArr(data)) {
    data.forEach((item, index) => {
      let temp = deepCopy(detailValue);
      totalAmt += item.residue ? parseFloat(JSON.parse(item.residue)) * item.exchangeRate : parseFloat(JSON.parse(item.price)) * item.quantity;
      for (var i in item) {
        temp.forEach((citem, cindex) => {
          if (citem.keyCode == i) {
            if (i == 'residue') {
              citem.value = JSON.parse(item.currency).sign + Outputmoney(item.residue)
            } else if (i == 'price') {
              citem.value = '¥' + Outputmoney(item.price)
            } else if (i == 'assetClass') {
              citem.value = item.assetClass.value
            } else if (i == 'isOvertime') {
              citem.value = item.isOvertime === 'N' ? app.globalData.lang['oa_no'] : app.globalData.lang['oa_yes']
            } else {
              citem.value = item[i];
            }
          } else if (citem.keyCode == 'sum') {
            citem.value = '¥' + Outputmoney(item.price * item.quantity)
          }
        })

      }

      oaItemPartList.push(temp);
    })
  }
  totalAmt = `${textTotalprice}:¥${Outputmoney(totalAmt)}`;
  
  that.setData({
    detailValueList: oaItemPartList,
    totalAmt: totalAmt
  })
}
// 获取收入类明细
const getRecipientItem =  (activityId, that) => {
  var request_body = {
    formId: activityId
  }
  api.PostData('itapp02_recipientItemList', request_body, function (res) {
    formatRecipientItem(res, that)
  }, true)
}
const formatRecipientItem = (data, that) => {
  var detailValue = JSON.parse(JSON.stringify(that.data.detailValue));
  var data = data.data;
  var oaItemPartList = [];
  if (isArr(data)) {
    data.forEach((item, index) => {
      let temp = deepCopy(detailValue);
      for (var i in item) {
        temp.forEach((citem, cindex) => {
          if (citem.keyCode == i) {
              citem.value = item[i];
          } 
        })

      }
      oaItemPartList.push(temp);
    })
  }
  that.setData({
    detailValueList: oaItemPartList,
  })
}

// 获取支付明细
const getPayOitem = (activityId, that) => {
  var request_body = {
    activityId: activityId
  }
  api.PostData('itapp02_getPaymentDetails', request_body, function (res) {
    formatPaymentDetails(res, that)
  }, true)
}
const formatPaymentDetails = (data, that) => {
  var detailValue = JSON.parse(JSON.stringify(that.data.detailValue));
  var data = data.data;
  var oaItemPartList = [];
  if (isArr(data)) {
    data.forEach((item, index) => {
      let temp = deepCopy(detailValue);
      for (var i in item) {
        temp.forEach((citem, cindex) => {
          if (citem.keyCode == i) {
            
            if (i === 'contractPaymentAmount'){
              citem.value = '¥' + Outputmoney(item[i])
            }else{
              citem.value = item[i];
            }
          }
        })

      }
      oaItemPartList.push(temp);
    })
  }
  that.setData({
    detailValueList: oaItemPartList,
  })
}
// 获取附件
const getattachments = (activityId, that) => {
  var request_body = {
    "activityid": activityId
  };
  api.PostData('itapp02_attachments', request_body, function(res) {
    formatAttachments(res, that)
  }, true)
}
//  格式化附件的数据
const formatAttachments = (data, that) => {
  var oaattachmentList = [];
  var totalattachmentCount = 0;
  var data = data.data
  if (!isArr(data.attachments)) {
    return;
  }
  totalattachmentCount = data.attachments ? data.attachments.length : 0;
  if (isArr(data.attachments)) {
    for (var d = 0; d < data.attachments.length; d++) {
      var item = {};
      item.tempFileUrl = "";
      item.fileName = "";


      if (data.attachments[d].tempFileUrl.length > 0) {
        item.tempFileUrl = JSON.parse(data.attachments[d].tempFileUrl).tempFileUrl;
      }

      if (typeof (data.attachments[d].attachment) != 'undefined') {
        var ss = data.attachments[d].attachment.created.split(" ");
        item.fileName = data.attachments[d].attachment.fileName;
        item.fileType = getMimeType(item.fileName.substring(item.fileName.lastIndexOf('.') + 1));
      }
      oaattachmentList.push(item);
    }
  }
  that.setData({
    oaattachmentList: oaattachmentList,
    totalattachmentCount: totalattachmentCount
  })
}
// 获取礼品明细
const getGiftDetail = (activityId, that) => {
  var request_body = {
    "id": activityId
  };

  var detailValue = that.data.detailValue;
  api.PostData('itapp02_giftDetailList', request_body, function(res) {
    if (res.data) {
      var resp = isArr(res.data) ? res.data : [];
      var giftDetailList = [];
      var totalAmt = 0.00;
      if (isArr(resp)) {
        for (var d = 0; d < resp.length; d++) {
          let temp = deepCopy(detailValue);
          var item = {};
          var itemPrice;
          item.itemName = resp[d].name;
          item.itemNumber = resp[d].number;
          item.itemUnitPrice = resp[d].unitPrice.toFixed(2) + '元';
          itemPrice = resp[d].unitPrice * resp[d].number;
          item.itemPrice = itemPrice.toFixed(2) + '元';
          totalAmt += parseFloat(itemPrice);
          for (var i in item) {
            temp.forEach((citem, cindex) => {
              if (citem.keyCode == i) {
                citem.value = item[i];
              }
            })
          }
          giftDetailList.push(temp);
        }
      }
      totalAmt = `${textTotalamount}:¥${Outputmoney(totalAmt)}`;
      that.setData({
        detailValueList: giftDetailList,
        totalAmt: totalAmt
      })
    }
  }, true)
}
// 固定资产报废项目明细
const getfixedAssertsDetail = (activityId, that) => {
  var request_body = {
    "id": activityId
  };
  var detailValue = that.data.detailValue;
  api.PostData('itapp02_getOaItemDetail', request_body, function(res) {
    if (res.data) {
      var resp = isArr(res.data) ? res.data : [];
      var oaItemPartList = [];
      var totalAmt = 0.00;
      if(isArr(resp)){
        for (var d = 0; d < resp.length; d++) {
          let temp = deepCopy(detailValue);
          var item = {};
          item.assetClass = resp[d].assetClass.value;
          item.itemName = resp[d].itemName;
          item.model = resp[d].model;
          item.quantity = resp[d].quantity;
          item.price = '¥' + Outputmoney(resp[d].price);
          item.residue = '¥' + Outputmoney(resp[d].residue);
          item.sum = '¥' + Outputmoney(resp[d].price * item.quantity);
          totalAmt += resp[d].price * item.quantity;
          item.explanation = resp[d].explanation;
          item.useDate = resp[d].useDate;
          item.site = resp[d].site;
          for (var i in item) {
            temp.forEach((citem, cindex) => {
              if (citem.keyCode == i) {
                citem.value = item[i];
              }
            })
          }
          oaItemPartList.push(temp);
        }
      }
      totalAmt = `${textTotalprice}:¥${Outputmoney(totalAmt)}`;
      that.setData({
        detailValueList: oaItemPartList,
        totalAmt: totalAmt
      })
    }
  }, true)
}
// 固定资产调拨项目明细
const getfixedAssertsAllocationDetail = (activityId, that) => {
  var request_body = {
    "id": activityId
  };
  var detailValue = that.data.detailValue;
  api.PostData('itapp02_getOaItemDetail', request_body, function(res) {
    if (res.data) {
      var resp = isArr(res.data) ? res.data : [];
      var oaItemPartList = [];
      var totalAmt = 0.00;
      if(isArr(resp)){
        for (var d = 0; d < resp.length; d++) {
          let temp = deepCopy(detailValue);
          var item = {};
          item.assetClass = resp[d].assetClass.value;
          item.itemName = resp[d].itemName;
          item.model = resp[d].model;
          item.quantity = resp[d].quantity;
          item.price = '¥' + Outputmoney(resp[d].price);
          item.sum = '¥' + Outputmoney(item.quantity * resp[d].price);
          totalAmt += resp[d].price * item.quantity;
          item.explanation = resp[d].explanation;
          item.useDate = resp[d].useDate;
          item.site = resp[d].site;
          for (var i in item) {
            temp.forEach((citem, cindex) => {
              if (citem.keyCode == i) {
                citem.value = item[i];
              }
            })
          }
          oaItemPartList.push(temp);
        }
      }
      totalAmt = `${textTotalprice}:¥${Outputmoney(totalAmt)}`;
      that.setData({
        detailValueList: oaItemPartList,
        totalAmt: totalAmt
      })
    }
  }, true)
}
// 信件明细
const getLetterDetail = (activityId, that) => {
  var request_body = {
    "id": activityId
  };
  let detailValue = that.data.detailValue;
  api.PostData('itapp02_letterDetailList', request_body, function(res) {
    if (res.data) {
      var resp = isArr(res.data) ? res.data : [];
      var letterDetailList = [];
      var totalAmt = 0;
      if(isArr(resp)){
        for (let d = 0; d < resp.length; d++) {
          let temp = deepCopy(detailValue);
          totalAmt += parseInt(resp[d].letterNum);
          let item = {};
          item.itemLetterType = resp[d].letterType;
          item.itemLetterNum = resp[d].letterNum;
          item.itemLetterRegion = resp[d].letterRegion;
          for (let i in item) {
            temp.forEach((citem, cindex) => {
              if (citem.keyCode == i) {
                citem.value = item[i];
              }
            })
          }
          letterDetailList.push(temp);

        }
      }
      totalAmt = `${textTotalquantity}${totalAmt}`;

      that.setData({
        detailValueList: letterDetailList,
        totalAmt: totalAmt
      })
    }
  }, true)
}
// 办公用品明细
const getOfficeSuppliesDetail = (activityId, that) => {
  var request_body = {
    "id": activityId
  };
  let detailValue = that.data.detailValue;
  api.PostData('itapp02_OfficeDetailList', request_body, function(res) {
    if (res.data) {
      var resp = isArr(res.data) ? res.data : [];
      var officeDetailList = [];
      var totalAmt = 0.00;
      if (isArr(resp)){
        for (var d = 0; d < resp.length; d++) {
          let temp = deepCopy(detailValue);
          var nameItem = resp[d].name;
          var itemPrice = (nameItem.price * resp[d].number).toFixed(2);
          totalAmt += parseFloat(itemPrice);
          var item = {};
          item.itemPrice = '¥' + (nameItem.price * resp[d].number).toFixed(2);
          item.itemName = nameItem.name;
          item.itemremarks = resp[d].remarks;
          item.itemnumber = resp[d].number;
          for (let i in item) {
            temp.forEach((citem, cindex) => {
              if (citem.keyCode == i) {
                citem.value = item[i];
              }
            })
          }
          officeDetailList.push(temp);
        }
      }
      totalAmt = `${textTotalprice}:¥${Outputmoney(totalAmt)}`;

      that.setData({
        detailValueList: officeDetailList,
        totalAmt: totalAmt
      })
    }
  }, true)
}
// 派车明细
const getSendCarDetail = (activityId, that) => {
  var request_body = {
    "id": activityId
  };
  let detailValue = that.data.detailValue;
  api.PostData('itapp02_sendCarDetailList', request_body, function(res) {
    if (res.data) {
      var resp = isArr(res.data) ? res.data : [];
      var sendCarDetailList = [];
     if(isArr(resp)){
       for (var d = 0; d < resp.length; d++) {
         let temp = deepCopy(detailValue);
         var item = {};
         item.itemUseDate = resp[d].useDate;
         item.itemStartPlace = resp[d].startPlace;
         item.itemEndPlace = resp[d].endPlace;
         for (let i in item) {
           temp.forEach((citem, cindex) => {
             if (citem.keyCode == i) {
               citem.value = item[i];
             }
           })
         }
         sendCarDetailList.push(temp);
       }
     }

      that.setData({
        detailValueList: sendCarDetailList
      })
    }
  }, true)
}
// 深拷贝
function deepCopy(data) {
  if (data.constructor.name === 'Array') {
    // 判断为数组类型
    var arrCopy = []
    for (var i = 0, len = data.length; i < len; i++) {
      //遍历数组
      if (data[i] instanceof Object) {
        // arrary object null以下有关于instanceof的注解
        arrCopy.push(deepCopy(data[i]))
      } else {
        // 基本类型
        arrCopy.push(data[i])
      }
    }
    return arrCopy;
  } else { // 为对象
    var objCopy = {};
    for (let x in data) {
      if (data[x] instanceof Object) {
        objCopy[x] = deepCopy(data[x])
      } else { // 基本类型
        objCopy[x] = data[x];
      }
    }
    return objCopy;
  }
}

module.exports = {
  getBudgetRatio: getBudgetRatio,
  formatBudgetData: formatBudgetData,
  getFormDetailByApplyCode: getFormDetailByApplyCode,
  formatDetailByApplyCode: formatDetailByApplyCode,
  getattachments: getattachments,
  formatAttachments: formatAttachments,
  getAllDetailSpecile: getAllDetailSpecile,
  getContractData: getContractData,
  getGiftDetail: getGiftDetail,
  getfixedAssertsDetail: getfixedAssertsDetail,
  getLetterDetail: getLetterDetail,
  getOfficeSuppliesDetail: getOfficeSuppliesDetail,
  getSendCarDetail: getSendCarDetail,
  getCoupons_Project_no: getCoupons_Project_no,
  getfixedAssertsAllocationDetail: getfixedAssertsAllocationDetail,
  getRecipientItem: getRecipientItem,
  getPayOitem:getPayOitem
}