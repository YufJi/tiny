const api = require('./api.js');
const app = getApp();


// 费用报销单,亲子园报销单，百事通报销单
const textOperator = app.globalData.lang['OA_addpointsapplydetail_text_operator'], //处理人
  textCostcenter = app.globalData.lang['OA_costaccount_text_costcenter'], //费用中心
  textPaymentcompany = app.globalData.lang['OA_costaccount_text_paymentcompany'], //付款公司
  textNumberofinvoice = app.globalData.lang['OA_costaccount_text_numberofinvoice'], //发票张数
  textBudgettype = app.globalData.lang['OA_costaccount_text_budgettype'], //费用种类
  textApportionmentmonth = app.globalData.lang['OA_costaccount_text_Apportionmentmonth'], //分摊月份
  textBudgetclassification = app.globalData.lang['OA_costaccount_text_budgetclassification'], //预算分类
  textRemarks = app.globalData.lang['OA_costaccount_text_remarks'], //备注
  textItem = app.globalData.lang['OA_itemDetailModal_text_item'], //项目
  textStartdate = app.globalData.lang['OA_itemDetailModal_text_startdate'], //开始日期
  textAmount = app.globalData.lang['OA_itemDetailModal_text_amount'], //金额
  textExplanation = app.globalData.lang['OA_itemDetailModal_text_explanation'], //说明
  textPaymentPayee = app.globalData.lang['OA_text_payment_payee'],
  textWorkingHours = app.globalData.lang['OA_costaccountdetail_text_workinghours'],
  textOvertime = app.globalData.lang['OA_costaccountdetail_text_overtime'],


  //差旅报销单多语言变量设置
  textTravelCostcenter = app.globalData.lang['OA_travelaccount_text_costcenter'], //费用中心
  textTravelpaymentcompany = app.globalData.lang['OA_travelaccount_text_paymentcompany'], //付款公司
  textTravelApportionmentmonth = app.globalData.lang['OA_travelaccount_text_Apportionmentmonth'], //分摊月份
  textTravelStartdate = app.globalData.lang['OA_travelaccount_text_startdate'], //出差开始时间
  textTravelEnddate = app.globalData.lang['OA_travelaccount_text_enddate'], //出差结束时间
  textTravelReason = app.globalData.lang['OA_travelaccount_text_reason'], //出差事由
  textTravelAddress = app.globalData.lang['OA_travelaccount_text_address'], //出差地点
  textTravelTextBudgettype = app.globalData.lang['OA_travelaccount_text_budgettype'], //预算分类
  textBudgetproportion = app.globalData.lang['OA_contractpaymentdetail_text_budgetproportion'], //预算比例
  textTravelRemarks = app.globalData.lang['OA_travelaccount_text_remarks'], //备注
  textTravelItem = app.globalData.lang['OA_travelitemDetailModal_text_item'], //项目
  textTravelAmount = app.globalData.lang['OA_travelitemDetailModal_text_Amount'], //金额
  textTravelExplanation = app.globalData.lang['OA_travelitemDetailModal_text_explanation'], //说明

  //固定资产调拨单多语言变量设置
  textFixedAssertsAffiliatedcompany = app.globalData.lang['OA_fixedassertallocationdetail_text_Affiliatedcompany'], //所属公司
  textFixedAssertsAuditdepartment = app.globalData.lang['OA_devicepurchasedetail_text_auditdepartment'], // 审核部门
  textFixedAssertsfromdepartment = app.globalData.lang['OA_fixedassertallocationdetail_text_fromdepartment'], // 调出部门
  textFixedAssertstodepartment = app.globalData.lang['OA_fixedassertallocationdetail_text_todepartment'], // 调入部门
  textFixedAssertsRemarks = app.globalData.lang['OA_ChapterSealEngravingdetai_text_remark'], // 备注
  textFixedAssertsitemdetail = app.globalData.lang['OA_additemdetail_text_itemdetail'], // 项目明细
  textFixedAssertsassettype = app.globalData.lang['OA_fixedassertallocationdetail_text_assettype'], // 资产类型
  textFixedAssertsitem = app.globalData.lang['OA_additemdetail_text_item'], // 项目
  textFixedAssertsassetnumber = app.globalData.lang['OA_fixedassertallocationdetail_text_assetnumber'], // 资产编号
  textFixedAssertsquantity = app.globalData.lang['OA_devicepurchasedetail_text_quantity'], // 数量
  textFixedAssertsunitprice = app.globalData.lang['OA_devicepurchasedetail_text_unitprice'], // 单价
  textFixedAssertstotalprice = app.globalData.lang['OA_devicepurchasedetail_text_totalprice'], // 总价
  textFixedAssertsusedate = app.globalData.lang['OA_fixedassertallocationdetail_text_usedate'], // 使用日期
  textFixedAssertsexplanation = app.globalData.lang['OA_devicepurchasedetail_text_explanation'], // 用途
  textFixedAssertsplace = app.globalData.lang['OA_fixedassertallocationdetail_text_place'], // 地点

  //固定资产报废单多语言变量设置
  textFixedAssertsScrappeddepartment = app.globalData.lang['OA_fixedassetsscrappeddetail_text_scrappeddepartment'], //报废部门
  textFixedAssertsScrappedresidualvalue = app.globalData.lang['OA_fixedassetsscrappeddetail_text_residualvalue'], // 残值

  // 固定资产领用单
  textFixedAssetsapplyreceiptdepartment = app.globalData.lang['OA_fixedassetsapplydetail_text_receiptdepartment'], // 领用部门
  textFixedAssetsapplyauditnumber = app.globalData.lang['OA_fixedassetsapplydetail_text_auditnumber'], // 评审编号

  //名片申印单多语言变量设置
  textBusinessCardCostcenter = app.globalData.lang['OA_addpointsapplydetail_text_Costcenter'], //费用中心
  textBusinessCardcompanyChinese = app.globalData.lang['OA_businesscardprintingdetail_text_companyChinese'], // 公司(CN)
  textBusinessCardcompanyEnglish = app.globalData.lang['OA_businesscardprintingdetail_text_companyEnglish'], // 公司(EN)
  textBusinessCardnameChinese = app.globalData.lang['OA_businesscardprintingdetail_text_nameChinese'], // 姓名(CN)
  textBusinessCardnameEnglish = app.globalData.lang['OA_businesscardprintingdetail_text_nameEnglish'], // 姓名(EN)
  textBusinessCardpositionChinese = app.globalData.lang['OA_businesscardprintingdetail_text_positionChinese'], // 职位(CN)
  textBusinessCardpositionEnglish = app.globalData.lang['OA_businesscardprintingdetail_text_positionEnglish'], // 职位(EN)
  textBusinessCarddepartmentChinese = app.globalData.lang['OA_businesscardprintingdetail_text_departmentChinese'], // 部门(CN)
  textBusinessCarddepartmentEnglish = app.globalData.lang['OA_businesscardprintingdetail_text_departmentEnglish'], // 部门(EN)
  textBusinessCardaddressChinese = app.globalData.lang['OA_businesscardprintingdetail_text_addressChinese'], // 地址(CN)
  textBusinessCardaddressEnglish = app.globalData.lang['OA_businesscardprintingdetail_text_addressEnglish'], // 地址(EN)
  textBusinessCardofficetelphone = app.globalData.lang['OA_businesscardprintingdetail_text_officetelphone'], // 办公电话
  textBusinessCardofficefaxnumber = app.globalData.lang['OA_businesscardprintingdetail_text_officefaxnumber'], // 传真电话
  textBusinessCardmobilephone = app.globalData.lang['OA_businesscardprintingdetail_text_mobilephone'], // 手机寻呼
  textBusinessCardemail = app.globalData.lang['OA_businesscardprintingdetail_text_email'], // 电子邮件
  textBusinessCardwechatID = app.globalData.lang['OA_businesscardprintingdetail_text_wechatID'], // 微信号
  textBusinessCardnumberofboxes = app.globalData.lang['OA_businesscardprintingdetail_text_numberofboxes'], // 申印盒数

  // 积分政策申领单
  textPointsPolicyintegralname = app.globalData.lang['OA_pointspolicyapply_text_integralname'], // 政策名称
  textPointsPolicyintegraltype = app.globalData.lang['OA_pointspolicyapply_text_integraltype'], // 政策类型
  textPointsPolicyreleasedintegral = app.globalData.lang['OA_pointspolicyapply_text_releasedintegral'], // 发放积分
  textPointsPolicyexpectedintegral = app.globalData.lang['OA_pointspolicyapply_text_expectedintegral'], // 预发积分
  textPointsPolicyintegralrule = app.globalData.lang['OA_pointspolicyapply_text_integralrule'], // 发放规则
  textPointsPolicyRemarks = app.globalData.lang['OA_addpointsapplydetail_text_remark'], // 备注

  //法人章申请、公章用章申请(信函以及公文专用)
  textChapterLegalPersoncompany = app.globalData.lang['OA_chapterBusinessdetail_text_chapter_company'], // 用章公司
  textChapterLegalPersonreason = app.globalData.lang['OA_ChapterInvestmentdetail_text_reason'], // 事由

  // 业务章使用申请(全国)
  textChapterBusinessdepartment = app.globalData.lang['OA_chapterBusinessdetail_text_chapter_department'], // 用章部门
  textChapterBusinessreason = app.globalData.lang['OA_chapterBusinessdetail_text_chapter_reason'], // 用章理由

  //印章刻制申请(全国)
  textChapterSealEngravingusefor = app.globalData.lang['OA_ChapterSealEngravingdetai_text_stamper_usefor'], // 印章用途
  textChapterSealEngravingunit = app.globalData.lang['OA_ChapterSealEngravingdetai_text_stamper_unit'], // 印章单位
  textChapterSealEngravingcontent = app.globalData.lang['OA_ChapterSealEngravingdetai_text_stamper_content'], // 印章内容

  // 投资文件用章
  textChapterInvestmentfiletype = app.globalData.lang['OA_ChapterInvestmentdetail_text_filetype'], // 文件类型

  // 快递单
  textDeliveryrecipientaddress = app.globalData.lang['OA_delieverydetail_text_recipientaddress'], // 收件地址
  textDeliveryrecipientname = app.globalData.lang['OA_delieverydetail_text_recipientname'], // 收件姓名
  textDeliveryrecipientphone = app.globalData.lang['OA_delieverydetail_text_recipientphone'], // 收件电话
  textDeliverycarrier = app.globalData.lang['OA_delieverydetail_text_carrier'], // 承运商
  textDeliverywaybillnumber = app.globalData.lang['OA_delieverydetail_text_waybillnumber'], // 运单号
  textDeliveryexpresstype = app.globalData.lang['OA_delieverydetail_text_expresstype'], // 快递类型
  textDeliveryexpressdetail = app.globalData.lang['OA_delieverydetail_text_expressdetail'], // 快递详情

  // 出门单
  textGoOutdate = app.globalData.lang['OA_additemdetail_text_date'], // 日期
  textGoOutlistofitems = app.globalData.lang['OA_giftcollardetail_text_listofitems'], // 物品清单

  // 信件单
  textLetterdetail = app.globalData.lang['OA_letterdetail_text_letterdetai'], // 信件详情
  textLetteritemdetail = app.globalData.lang['OA_letterdetail_text_letteritemdetai'], // 信件明细
  textLettertype = app.globalData.lang['OA_letterdetail_text_lettertype'], // 信件类型

  // 办公物品领用单
  textOfficeSuppliesdetail = app.globalData.lang['OA_officesuppliescollardetail_text_officesuppliesdetail'], // 办公用品明细
  textOfficeSuppliesitemname = app.globalData.lang['OA_officesuppliescollardetail_text_itemname'], // 物品名称

  // 派车单
  textSendCarreason = app.globalData.lang['OA_sendcardetail_text_usecarreason'], // 用车原因
  textSendCardetail = app.globalData.lang['OA_sendcardetail_text_usecardetail'], // 派车明细  
  textSendCardate = app.globalData.lang['OA_sendcardetail_text_usecardate'], // 用车时间
  textSendCarorigin = app.globalData.lang['OA_sendcardetail_text_usecarorigin'], // 始发地
  textSendCardestination = app.globalData.lang['OA_sendcardetail_text_usecardestination'], // 目的地

  // 礼品领用单
  textGifttime = app.globalData.lang['OA_contractpaymentdetail_text_allocationtime'], // 分摊时间
  textGiftbudgetclassification = app.globalData.lang['OA_costaccount_text_budgetclassification'], // 预算分类
  textGiftcustomername = app.globalData.lang['OA_giftcollardetail_text_customername'], // 客户名称
  textGiftapplyforuse = app.globalData.lang['OA_giftcollardetail_text_applyforuse'], // 申领用途
  textGiftdetail = app.globalData.lang['OA_giftcollardetail_text_giftdetail'], // 礼品明细
  textGiftname = app.globalData.lang['OA_giftcollardetail_text_giftname'], // 礼品名称

  // 采购合同评审单
  textPurchaseContractcompany = app.globalData.lang['OA_incomecontractreviewdetail_text_contractingcompany'], // 签约公司
  textPurchaseContractvendor = app.globalData.lang['OA_purchasecontractreview_text_vendor'], // 供应商
  textPurchaseContractlimit = app.globalData.lang['OA_incometicketsapplydetail_text_limit'], // 合同有效期
  textPurchaseContractnumber = app.globalData.lang['OA_contractpaymentdetail_text_contractnumber'], // 合同编号
  textPurchaseContractname = app.globalData.lang['OA_incomecontractreviewdetail_text_contractname'], // 合同名称
  textPurchaseContractagreementunit = app.globalData.lang['OA_incomecontractreviewdetail_text_agreementunit'], // 协议单位
  textPurchaseContractamount = app.globalData.lang['OA_incomecontractreviewdetail_text_contractamount'], // 合同金额
  textPurchaseContractdeposit = app.globalData.lang['OA_incomecontractreviewdetail_text_contractdeposit'], // 押金
  textpurchaseContract = app.globalData.lang['OA_recipient_item_detail'], // 收款单位账号信息
  recipientPersonText = app.globalData.lang['OA_text_payment_payee'], // 收款单位人
  recipientAccountNumberText = app.globalData.lang['OA_recipient_itemdetail_text_account'], // 收款单位账号
  bankNameText = app.globalData.lang['OA_recipient_itemdetail_text_bankName'],
  bankCityText = app.globalData.lang['OA_recipient_itemdetail_text_city'],

  // 合同付款
  textContractpaymentpayee = app.globalData.lang['OA_contractpaymentdetail_text_paymentpayee'], // 收款单位
  textContractreceiptaccount = app.globalData.lang['OA_travelaccount_text_receiptaccount'], // 收款账号
  textContractPaymentAmount = app.globalData.lang['OA_recipient_itemdetail_text_contractPaymentAmount'], // 付款
  textCashPledgeAmount = app.globalData.lang['OA_recipient_itemdetail_text_cashPledgeAmount'], // 押金金额

  // 收入合同评审单
  textIncomeContractReviewnumber = app.globalData.lang['OA_incomecontractreviewdetail_text_contractnumber'], // 合同编号
  textIncomeContractReviewkeyword = app.globalData.lang['OA_incomecontractreviewdetail_text_keyword'], // 关键字

  // MICE内部团队申请
  textMiceteamnumer = app.globalData.lang['OA_MICEgroupapplydetail_text_miceteamnumer'], // 团队号
  textMiceteamamount = app.globalData.lang['OA_MICEgroupapplydetail_text_miceteamamount'], // 团队金额

  // 添加积分申请单
  textAddpointitemname = app.globalData.lang['OA_addpointsapplydetail_text_itemname'], // 项目名称
  textAddpointitemnumber = app.globalData.lang['OA_addpointsapplydetail_text_itemnumber'], // 项目编号
  textAddpointtotalpoints = app.globalData.lang['OA_addpointsapplydetail_text_totalpoints'], // 总积分
  textAddpointamount = app.globalData.lang['OA_addpointsapplydetail_text_amount'], // 总成本

  // 优惠券申领单
  textCouponapplynumber = app.globalData.lang['OA_couponapplydetail_text_couponsnumber'], // 项目编号

  // 费用类礼品卡/游票申领单
  textTickettype = app.globalData.lang['OA_costticketsapplydetail_text_tickettype'], // 游票类型
  textTicketform = app.globalData.lang['OA_costticketsapplydetail_text_ticketform'], // 游票形式
  textTicketnumber = app.globalData.lang['OA_costticketsapplydetail_text_ticketnumber'], // 项目编号
  textTicketdateofeffect = app.globalData.lang['OA_costticketsapplydetail_text_dateofeffect'], // 生效日期
  textTicketname = app.globalData.lang['OA_costticketsapplydetail_text_ticketname'], // 项目名称
  textTicketnature = app.globalData.lang['OA_costticketsapplydetail_text_ticketnature'], // 项目性质
  textTicketamount = app.globalData.lang['OA_costticketsapplydetail_text_amount'], // 发放金额
  textTicketexpectedcost = app.globalData.lang['OA_costticketsapplydetail_text_expectedcost'], // 预计成本
  textTicketexpecteduserate = app.globalData.lang['OA_costticketsapplydetail_text_expecteduserate'], // 预计使用

  // 收入类礼品卡/游票申领单
  textCouponsissuingcompany = app.globalData.lang['OA_incometicketsapplydetail_text_couponsissuingcompany'], // 开票公司
  textCouponsdiscountrate = app.globalData.lang['OA_incometicketsapplydetail_text_couponsdiscountrate'], // 折扣率
  textCouponsactualreceipt = app.globalData.lang['OA_incometicketsapplydetail_text_couponsactualreceipt'], // 实际收款

  // 员工借款单
  textDateofoccurance = app.globalData.lang['OA_costaccountdetail_text_dateofoccurance'], // 发生日期
  textApplyamount = app.globalData.lang['OA_staffloandetail_text_applyamount'], // 申请金额
  textStaffLoanExplanation = app.globalData.lang['OA_additemdetail_text_explanation'], // 说明
  textItemdetail = app.globalData.lang['OA_itemDetailModal_text_itemdetail'], // 项目明细

  // 设备物品采购单
  textDevicePurchaseDetailItemModel = app.globalData.lang['OA_devicepurchasedetail_text_model'], // 规格、型号
  textAdjustmentApplication_p_BZ = app.globalData.lang['ehr_AdjustmentApplication_p_BZ'], // 币种


  textPayDetail = app.globalData.lang['OA_additemdetail_text_paymentdetail'],
  textRecipientAccountNumber = app.globalData.lang['OA_itemDetail_text_recipientAccountNumber'],
  textCityBank = app.globalData.lang['OA_costaccount_text_cityofbank'],
  textAddressBank = app.globalData.lang['OA_itemDetail_text_bankAddress'],
  textNameBank = app.globalData.lang['OA_costaccount_text_bankname'];





// "费用报销单,亲子园报销单，百事通报销单":
const costForm = {
  key: [textOperator, textCostcenter, textPaymentcompany, textNumberofinvoice, textBudgettype, textPaymentPayee, textApportionmentmonth, textBudgetclassification, textBudgetproportion, textRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textPaymentcompany,
      keyCode: "payment_company",
      value: ""
    },
    {
      key: textNumberofinvoice,
      keyCode: "expense_invoice_number",
      value: ""
    },
    {
      key: textBudgettype,
      keyCode: "payment_feetype",
      value: ""
    },
    {
      key: textPaymentPayee,
      keyCode: 'payment_payee',
      value: '',
    },
    {
      key: textApportionmentmonth,
      keyCode: "budget_share_month",
      value: ""
    },
    {
      key: textBudgetclassification,
      keyCode: "budget_budgettype",
      value: ""
    },
    {
      key: textBudgetproportion,
      keyCode: "BudgetRatio",
      value: ""
    },
    {
      key: textRemarks,
      keyCode: "activity_remark",
      value: ""
    },
  ],
  detailValue: [{
    key: textTicketname,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textDateofoccurance,
    keyCode: 'lastUpdate',
    value: '',
  }, {
    key: textOvertime,
    keyCode: 'isOvertime',
    value: '',
  }, {
    key: textWorkingHours,
    keyCode: 'workingHours',
    value: '',
  }, {
    key: textTravelAmount,
    keyCode: 'residue',
    value: '',
  }, {
    key: textExplanation,
    keyCode: 'explanation',
    value: '',
  }],
  title: textFixedAssertsitemdetail
};

// 差旅报销单
const travelForm = {
  key: [textOperator, textTravelCostcenter, textTravelpaymentcompany, textPaymentPayee, textTravelApportionmentmonth, textTravelStartdate, textTravelEnddate, textTravelReason, textTravelAddress, textTravelTextBudgettype, textBudgetproportion, textTravelRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textTravelCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textTravelpaymentcompany,
      keyCode: "payment_company",
      value: ""
    },
    {
      key: textPaymentPayee,
      keyCode: 'payment_payee',
      value: '',
    },
    {
      key: textTravelApportionmentmonth,
      keyCode: "budget_share_month",
      value: ""
    },
    {
      key: textTravelStartdate,
      keyCode: "expense_start_date",
      value: ""
    },
    {
      key: textTravelEnddate,
      keyCode: "expense_end_date",
      value: ""
    },
    {
      key: textTravelReason,
      keyCode: "mice_reason",
      value: ""
    },
    {
      key: textTravelAddress,
      keyCode: "expense_place",
      value: ""
    },
    {
      key: textTravelTextBudgettype,
      keyCode: "budget_budgettype",
      value: ""
    }, {
      key: textBudgetproportion,
      keyCode: "BudgetRatio",
      value: ""
    },
    {
      key: textTravelRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],
  detailValue: [{
    key: textTravelItem,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textTravelAmount,
    keyCode: 'residue',
    value: '',
  }, {
    key: textTravelExplanation,
    keyCode: 'explanation',
    value: '',
  }],
  title: textFixedAssertsitemdetail
};

// 名片申印单
const businessCardForm = {
  key: [textOperator, textBusinessCardCostcenter, textBusinessCardcompanyChinese, textBusinessCardcompanyEnglish, textBusinessCardnameChinese, textBusinessCardnameEnglish, textBusinessCardpositionChinese, textBusinessCardpositionEnglish, textBusinessCarddepartmentChinese, textBusinessCarddepartmentEnglish, textBusinessCardaddressChinese, textBusinessCardaddressEnglish, textBusinessCardofficetelphone, textBusinessCardofficefaxnumber, textBusinessCardmobilephone, textBusinessCardemail, textBusinessCardwechatID, textBusinessCardnumberofboxes, textTravelRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textBusinessCardcompanyChinese,
      keyCode: "biz_company_cn",
      value: ""
    },
    {
      key: textBusinessCardcompanyEnglish,
      keyCode: "biz_company_en",
      value: ""
    },
    {
      key: textBusinessCardnameChinese,
      keyCode: "applicant_name_chinese",
      value: ""
    },
    {
      key: textBusinessCardnameEnglish,
      keyCode: "applicant_name_english",
      value: ""
    },
    {
      key: textBusinessCardpositionChinese,
      keyCode: "position_chinese",
      value: ""
    },
    {
      key: textBusinessCardpositionEnglish,
      keyCode: "position_english",
      value: ""
    },
    {
      key: textBusinessCarddepartmentChinese,
      keyCode: "biz_dept_chinese",
      value: ""
    },
    {
      key: textBusinessCarddepartmentEnglish,
      keyCode: "biz_dept_english",
      value: ""
    },
    {
      key: textBusinessCardaddressChinese,
      keyCode: "biz_addr_chinese",
      value: ""
    },
    {
      key: textBusinessCardaddressEnglish,
      keyCode: "biz_addr_english",
      value: ""
    },
    {
      key: textBusinessCardofficetelphone,
      keyCode: "office_telephone",
      value: ""
    },
    {
      key: textBusinessCardofficefaxnumber,
      keyCode: "fax_telephone",
      value: ""
    },
    {
      key: textBusinessCardmobilephone,
      keyCode: "mobile_phone",
      value: ""
    },
    {
      key: textBusinessCardemail,
      keyCode: "e_mail",
      value: ""
    },
    {
      key: textBusinessCardwechatID,
      keyCode: "personal_wechat",
      value: ""
    },
    {
      key: textBusinessCardnumberofboxes,
      keyCode: "apply_number",
      value: ""
    },
    {
      key: textTravelRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ]
}

// 固定资产报废单
const fixedAssertsScrappedForm = {
  key: [textOperator, textFixedAssertsScrappeddepartment, textFixedAssertsAffiliatedcompany, textFixedAssertsAuditdepartment, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textFixedAssertsScrappeddepartment,
      keyCode: "retirement_costcenter",
      value: ""
    },
    {
      key: textFixedAssertsAffiliatedcompany,
      keyCode: "recipients_company",
      value: ""
    },
    {
      key: textFixedAssertsAuditdepartment,
      keyCode: "activity_assetsauditdepartment",
      value: ""
    },
    {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],
  title: textFixedAssertsitemdetail,
  detailValue: [{
    key: textFixedAssertsassettype,
    keyCode: 'assetClass',
    value: '',
  }, {
    key: textFixedAssertsitem,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textFixedAssertsassetnumber,
    keyCode: 'model',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'quantity',
    value: '',
  }, {
    key: textFixedAssertsunitprice,
    keyCode: 'price',
    value: '',
  }, {
    key: textFixedAssertsScrappedresidualvalue,
    keyCode: 'residue',
    value: '',
  }, {
    key: textFixedAssertstotalprice,
    keyCode: 'sum',
    value: '',
  }, {
    key: textFixedAssertsusedate,
    keyCode: 'useDate',
    value: '',
  }, {
    key: textFixedAssertsexplanation,
    keyCode: 'explanation',
    value: '',
  }, {
    key: textFixedAssertsplace,
    keyCode: 'site',
    value: '',
  }]
};

// 积分政策申领单
const pointsPolicyApplyForm = {
  key: [textOperator, textBusinessCardCostcenter, textPointsPolicyintegralname, textPointsPolicyintegraltype, textPointsPolicyreleasedintegral, textPointsPolicyexpectedintegral, textPointsPolicyintegralrule, textPointsPolicyRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textPointsPolicyintegralname,
      keyCode: "integral_name",
      value: ""
    },
    {
      key: textPointsPolicyintegraltype,
      keyCode: "integral_type",
      value: ""
    },
    {
      key: textPointsPolicyreleasedintegral,
      keyCode: "integral_total_points",
      value: ""
    },
    {
      key: textPointsPolicyexpectedintegral,
      keyCode: "integral_year_points",
      value: ""
    },
    {
      key: textPointsPolicyintegralrule,
      keyCode: "integral_rule",
      value: ""
    },
    {
      key: textPointsPolicyRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ]
};

// 法人章申请
const chapterLegalPersonForm = {
  key: [textOperator, textBusinessCardCostcenter, textChapterLegalPersoncompany, textChapterLegalPersonreason],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textChapterLegalPersoncompany,
      keyCode: "business_chapter_company",
      value: ""
    },
    {
      key: textChapterLegalPersonreason,
      keyCode: "mice_reason",
      value: ""
    }
  ]
};

// 公章用章申请(信函以及公文专用)
const chapterOfficialSealForm = {
  key: [textOperator, textBusinessCardCostcenter, textChapterLegalPersoncompany, textChapterLegalPersonreason],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textChapterLegalPersoncompany,
      keyCode: "business_chapter_company",
      value: ""
    },
    {
      key: textChapterLegalPersonreason,
      keyCode: "seal_reason",
      value: ""
    }
  ]
};

// 业务章使用申请(全国)
const chapterBusinessForm = {
  key: [textOperator, textBusinessCardCostcenter, textChapterLegalPersoncompany, textChapterBusinessdepartment, textChapterBusinessreason],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textChapterLegalPersoncompany,
      keyCode: "business_chapter_company",
      value: ""
    },
    {
      key: textChapterBusinessdepartment,
      keyCode: "business_chapter_dept",
      value: ""
    },
    {
      key: textChapterBusinessreason,
      keyCode: "business_chapter_usereason",
      value: ""
    }
  ]
};

// 印章刻制申请(全国)
const chapterSealEngravingForm = {
  key: [textOperator, textBusinessCardCostcenter, textChapterSealEngravingusefor, textChapterSealEngravingunit, textChapterSealEngravingcontent, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textChapterSealEngravingusefor,
      keyCode: "stamper_usefor",
      value: ""
    },
    {
      key: textChapterSealEngravingunit,
      keyCode: "stamper_unit",
      value: ""
    },
    {
      key: textChapterSealEngravingcontent,
      keyCode: "stamper_content",
      value: ""
    },
    {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ]
};

// 投资文件用章
const chapterInvestmentForm = {
  key: [textOperator, textBusinessCardCostcenter, textChapterLegalPersoncompany, textChapterInvestmentfiletype, textChapterLegalPersonreason],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textChapterLegalPersoncompany,
      keyCode: "business_chapter_company",
      value: ""
    },
    {
      key: textChapterInvestmentfiletype,
      keyCode: "investment_filetype",
      value: ""
    },
    {
      key: textChapterLegalPersonreason,
      keyCode: "mice_reason",
      value: ""
    }
  ]
};

// 快递单
const deliveryForm = {
  key: [textOperator, textBusinessCardCostcenter, textDeliveryrecipientaddress, textDeliveryrecipientname, textDeliveryrecipientphone, textDeliverycarrier, textDeliverywaybillnumber, textDeliveryexpresstype, textDeliveryexpressdetail],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textDeliveryrecipientaddress,
      keyCode: "recipient_address_result",
      value: ""
    },
    {
      key: textDeliveryrecipientname,
      keyCode: "recipient_name",
      value: ""
    },
    {
      key: textDeliveryrecipientphone,
      keyCode: "recipient_phone",
      value: ""
    },
    {
      key: textDeliverycarrier,
      keyCode: "carrier",
      value: ""
    },
    {
      key: textDeliverywaybillnumber,
      keyCode: "waybill_number",
      value: ""
    },
    {
      key: textDeliveryexpresstype,
      keyCode: "express_type",
      value: ""
    },
    {
      key: textDeliveryexpressdetail,
      keyCode: "express_details",
      value: ""
    }
  ]
};

// 出门单
const goOutForm = {
  key: [textOperator, textBusinessCardCostcenter, textGoOutdate, textGoOutlistofitems, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textGoOutdate,
      keyCode: "go_out_date",
      value: ""
    },
    {
      key: textGoOutlistofitems,
      keyCode: "res_list",
      value: ""
    },
    {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ]
};

// 信件单
const letterForm = {
  key: [textOperator, textBusinessCardCostcenter, textLetterdetail],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textLetterdetail,
      keyCode: "letter_detail",
      value: ""
    }
  ],
  title: textLetteritemdetail,
  detailValue: [{
    key: textLettertype,
    keyCode: 'itemLetterType',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'itemLetterNum',
    value: '',
  }, {
    key: textPointsPolicyRemarks,
    keyCode: 'itemLetterRegion',
    value: '',
  }]
};

// 办公物品领用单
const officeSuppliesForm = {
  key: [textOperator, textBusinessCardCostcenter, textPointsPolicyRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textPointsPolicyRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],
  title: textOfficeSuppliesdetail,
  detailValue: [{
    key: textOfficeSuppliesitemname,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'itemnumber',
    value: '',
  }, {
    key: textFixedAssertstotalprice,
    keyCode: 'itemPrice',
    value: '',
  }, {
    key: textPointsPolicyRemarks,
    keyCode: 'itemremarks',
    value: '',
  }]
};

// 派车单
const sendCarForm = {
  key: [textOperator, textBusinessCardCostcenter, textSendCarreason, textPointsPolicyRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textSendCarreason,
      keyCode: "use_car_reason",
      value: ""
    },
    {
      key: textPointsPolicyRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],

  title: textSendCardetail,
  detailValue: [{
    key: textSendCardate,
    keyCode: 'itemUseDate',
    value: '',
  }, {
    key: textSendCarorigin,
    keyCode: 'itemStartPlace',
    value: '',
  }, {
    key: textSendCardestination,
    keyCode: 'itemEndPlace',
    value: '',
  }]
};

// 礼品领用单
const giftCollarForm = {
  key: [textOperator, textBusinessCardCostcenter, textGifttime, textGiftbudgetclassification, textGiftcustomername, textGiftapplyforuse, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textGifttime,
      keyCode: "budget_share_month",
      value: ""
    },
    {
      key: textGiftbudgetclassification,
      keyCode: "budget_budgettype",
      value: ""
    },
    {
      key: textGiftcustomername,
      keyCode: "customer_name",
      value: ""
    },
    {
      key: textGiftapplyforuse,
      keyCode: "apply_for_use",
      value: ""
    },
    {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],

  title: textGiftdetail,
  detailValue: [{
    key: textGiftname,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'itemNumber',
    value: '',
  }, {
    key: textFixedAssertsunitprice,
    keyCode: 'itemUnitPrice',
    value: '',
  }, {
    key: textFixedAssertstotalprice,
    keyCode: 'itemPrice',
    value: '',
  }]
};

// 采购合同评审单
const purchaseContractReview = {
  key: [textOperator, textBusinessCardCostcenter, textPurchaseContractcompany, textFixedAssertsAuditdepartment, textPurchaseContractvendor, textGifttime, textGiftbudgetclassification, textPurchaseContractlimit, textPurchaseContractnumber, textPurchaseContractname, textPurchaseContractagreementunit, textPurchaseContractamount, textPurchaseContractdeposit, textBudgetproportion, textPointsPolicyRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textPurchaseContractcompany,
      keyCode: "contract_company",
      value: ""
    },
    {
      key: textFixedAssertsAuditdepartment,
      keyCode: "activity_assetsauditdepartment",
      value: ""
    }, {
      key: textPurchaseContractvendor,
      keyCode: "activity_suppliercategory",
      value: ""
    }, {
      key: textGifttime,
      keyCode: "budget_share_month",
      value: ""
    }, {
      key: textGiftbudgetclassification,
      keyCode: "budget_budgettype",
      value: ""
    }, {
      key: textPurchaseContractlimit,
      keyCode: "contract_duration",
      value: ""
    }, {
      key: textPurchaseContractnumber,
      keyCode: "contract_no",
      value: ""
    }, {
      key: textPurchaseContractname,
      keyCode: "contract_name",
      value: ""
    }, {
      key: textPurchaseContractagreementunit,
      keyCode: "contract_agreement_unit",
      value: ""
    }, {
      key: textPurchaseContractamount,
      keyCode: "contract_amount",
      value: ""
    }, {
      key: textPurchaseContractdeposit,
      keyCode: "contract_deposit",
      value: ""
    }, {
      key: textBudgetproportion,
      keyCode: "BudgetRatio",
      value: ""
    }, {
      key: textPointsPolicyRemarks,
      keyCode: "activity_remark",
      value: ""
    }

  ],
  title: textpurchaseContract,
  detailValue: [{
    key: recipientPersonText,
    keyCode: 'recipientPerson',
    value: '',
  }, {
    key: recipientAccountNumberText,
    keyCode: 'recipientAccountNumber',
    value: '',
  }, {
    key: bankNameText,
    keyCode: 'bankName',
    value: '',
  }, {
    key: bankCityText,
    keyCode: 'bankCity',
    value: '',
  }]
};

// 合同付款
const contractPaymentDetail = {
  key: [textOperator, textBusinessCardCostcenter, textPaymentcompany, textGiftbudgetclassification, textContractpaymentpayee, textContractreceiptaccount, textPurchaseContractnumber, textGifttime, textBudgetproportion, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textPaymentcompany,
      keyCode: "payment_company",
      value: ""
    },
    {
      key: textGiftbudgetclassification,
      keyCode: "budget_budgettype",
      value: ""
    },

    {
      key: textContractpaymentpayee,
      keyCode: "payment_payee",
      value: ""
    },
    {
      key: textContractreceiptaccount,
      keyCode: "payment_payee_account",
      value: ""
    },
    {
      key: textPurchaseContractnumber,
      keyCode: "payment_contract_no",
      value: ""
    },
    {
      key: textGifttime,
      keyCode: "budget_share_month",
      value: ""
    },
    {
      key: textBudgetproportion,
      keyCode: "BudgetRatio",
      value: ""
    },
    {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],
  title: textpurchaseContract,
  detailValue: [{
    key: recipientPersonText,
    keyCode: 'recipientPerson',
    value: '',
  }, {
    key: recipientAccountNumberText,
    keyCode: 'recipientAccountNumber',
    value: '',
  }, {
    key: bankNameText,
    keyCode: 'bankName',
    value: '',
  }, {
    key: bankCityText,
    keyCode: 'bankCity',
    value: '',
  }, {
    key: textContractPaymentAmount,
    keyCode: 'contractPaymentAmount',
    value: '',
  }, {
    key: textCashPledgeAmount,
    keyCode: 'cashPledgeAmount',
    value: '',
  }]
};

// 收入合同评审单
const incomeContractReviewDetail = {
  key: [textOperator, textBusinessCardCostcenter, textPurchaseContractcompany, textIncomeContractReviewnumber, textPurchaseContractname, textPurchaseContractagreementunit, textIncomeContractReviewkeyword, textPurchaseContractamount, textPurchaseContractlimit, textPurchaseContractdeposit, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textPurchaseContractcompany,
      keyCode: "contract_company",
      value: ""
    },
    {
      key: textIncomeContractReviewnumber,
      keyCode: "contract_no",
      value: ""
    }, {
      key: textPurchaseContractname,
      keyCode: "contract_name",
      value: ""
    }, {
      key: textPurchaseContractagreementunit,
      keyCode: "contract_agreement_unit",
      value: ""
    }, {
      key: textIncomeContractReviewkeyword,
      keyCode: "contract_keyword",
      value: ""
    }, {
      key: textPurchaseContractamount,
      keyCode: "contract_amount",
      value: ""
    }, {
      key: textPurchaseContractlimit,
      keyCode: "contract_duration",
      value: ""
    }, {
      key: textPurchaseContractdeposit,
      keyCode: "contract_deposit",
      value: ""
    }, {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }

  ],

};

// MICE内部团队申请
const mICEGroupApplyDetail = {
  key: [textOperator, textBusinessCardCostcenter, textMiceteamnumer, textMiceteamamount, textChapterLegalPersonreason, textGiftbudgetclassification, textGifttime, textBudgetproportion, textPointsPolicyRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textMiceteamnumer,
      keyCode: "mice_teamno",
      value: ""
    },
    {
      key: textMiceteamamount,
      keyCode: "mice_teamamount",
      value: ""
    }, {
      key: textChapterLegalPersonreason,
      keyCode: "mice_reason",
      value: ""
    }, {
      key: textGiftbudgetclassification,
      keyCode: "budget_budgettype",
      value: ""
    }, {
      key: textGifttime,
      keyCode: "budget_share_month",
      value: ""
    }, {
      key: textBudgetproportion,
      keyCode: "BudgetRatio",
      value: ""
    }, {
      key: textPointsPolicyRemarks,
      keyCode: "activity_remark",
      value: ""
    }

  ],

};

// 添加积分申请单
const addPointsApplyDetail = {
  key: [textOperator, textBusinessCardCostcenter, textAddpointitemname, textAddpointitemnumber, textAddpointtotalpoints, textAddpointamount, textPointsPolicyRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textAddpointitemname,
      keyCode: "coupons_project_name",
      value: ""
    },
    {
      key: textAddpointitemnumber,
      keyCode: "coupons_project_no",
      value: ""
    }, {
      key: textAddpointtotalpoints,
      keyCode: "integral_total_points",
      value: ""
    }, {
      key: textAddpointamount,
      keyCode: "integral_total_amount",
      value: ""
    }, {
      key: textPointsPolicyRemarks,
      keyCode: "activity_remark",
      value: ""
    }

  ],

};

// 优惠券申领单
const couponApplyDetail = {
  key: [textOperator, textBusinessCardCostcenter, textCouponapplynumber, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textCouponapplynumber,
      keyCode: "coupons_project_no",
      value: ""
    }, {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }

  ],

};

// 费用类礼品卡/游票申领单
const costTicketsApplyDetail = {
  key: [textOperator, textBusinessCardCostcenter, textTickettype, textTicketform, textTicketnumber, textTicketdateofeffect, textTicketname, textTicketnature, textTicketamount, textTicketexpectedcost, textTicketexpecteduserate, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textTickettype,
      keyCode: "coupons_type",
      value: ""
    }, {
      key: textTicketform,
      keyCode: "coupons_form",
      value: ""
    }, {
      key: textTicketnumber,
      keyCode: "coupons_project_no_giftcard",
      value: ""
    }, {
      key: textTicketdateofeffect,
      keyCode: "coupons_effectdata",
      value: ""
    }, {
      key: textTicketname,
      keyCode: "coupons_project_name",
      value: ""
    }, {
      key: textTicketnature,
      keyCode: "coupons_project_nature",
      value: ""
    }, {
      key: textTicketamount,
      keyCode: "coupons_total",
      value: ""
    }, {
      key: textTicketexpectedcost,
      keyCode: "coupons_total_cost",
      value: ""
    }, {
      key: textTicketexpecteduserate,
      keyCode: "coupons_use_rate",
      value: ""
    }, {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }

  ],

};

// 收入类礼品卡/游票申领单
const incomeTicketsApplyDetail = {
  key: [textOperator, textBusinessCardCostcenter, textCouponsissuingcompany, textTickettype, textTicketform, textTicketnumber, textTicketdateofeffect, textTicketname, textTicketnature, textTicketamount, textCouponsdiscountrate, textCouponsactualreceipt, textPointsPolicyRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    }, {
      key: textCouponsissuingcompany,
      keyCode: "payment_company",
      value: ""
    },
    {
      key: textTickettype,
      keyCode: "coupons_type",
      value: ""
    }, {
      key: textTicketform,
      keyCode: "coupons_form",
      value: ""
    }, {
      key: textTicketnumber,
      keyCode: "coupons_project_no_giftcard",
      value: ""
    }, {
      key: textTicketdateofeffect,
      keyCode: "coupons_effectdata",
      value: ""
    }, {
      key: textTicketname,
      keyCode: "coupons_project_name",
      value: ""
    }, {
      key: textTicketnature,
      keyCode: "coupons_project_nature",
      value: ""
    }, {
      key: textTicketamount,
      keyCode: "coupons_total",
      value: ""
    }, {
      key: textCouponsdiscountrate,
      keyCode: "coupons_use_rate",
      value: ""
    }, {
      key: textCouponsactualreceipt,
      keyCode: "coupons_actual_receipts",
      value: ""
    }, {
      key: textPointsPolicyRemarks,
      keyCode: "activity_remark",
      value: ""
    }

  ],

};

// 员工借款单  
const staffLoanDetail = {
  key: [textOperator, textBusinessCardCostcenter, textPaymentcompany, textTravelReason, textGiftbudgetclassification, textPaymentPayee, textGifttime, textBudgetproportion, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textBusinessCardCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textPaymentcompany,
      keyCode: "payment_company",
      value: ""
    }, {
      key: textTravelReason,
      keyCode: "mice_reason",
      value: ""
    }, {
      key: textGiftbudgetclassification,
      keyCode: "budget_budgettype",
      value: ""
    }, {
      key: textPaymentPayee,
      keyCode: 'payment_payee',
      value: '',
    }, {
      key: textGifttime,
      keyCode: "budget_share_month",
      value: ""
    }, {
      key: textBudgetproportion,
      keyCode: "BudgetRatio",
      value: ""
    }, {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],
  title: textItemdetail,
  detailValue: [{
    key: textFixedAssertsitem,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textDateofoccurance,
    keyCode: 'lastUpdate',
    value: '',
  }, {
    key: textApplyamount,
    keyCode: 'residue',
    value: '',
  }, {
    key: textStaffLoanExplanation,
    keyCode: 'explanation',
    value: '',
  }]
};

// 设备物品采购单
const devicePurchaseDetail = {
  key: [textOperator, textCostcenter, textBudgetclassification, textBudgetproportion, "付款条件生效日期", "预计支付日期", "预算填报类型", "是否自动邀请会签",
    "业务分组", "付款公司", "资产审核部门", "关联表单", "付款方式", "收款单位（人）", "收款单位（人）账号", "收款方开户行是否工商银行",
    "开户行名称", "开户行联行号", "开户行所在城市", "实际付款金额", "是否预算内", "分摊月份", "备注", "发票审核备注",
    "收到发票状态", "价税分离发票详情", "关联表单列表", "设备物品采购项目明细", "电子发票"
  ],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    }, {
      key: textCostcenter,
      keyCode: "budget_costcenter",
      value: ""
    },
    {
      key: textBudgetclassification,
      keyCode: "budget_budgettype",
      value: ""
    }, {
      key: textBudgetproportion,
      keyCode: "BudgetRatio",
      value: ""
    }, {
      key: "付款条件生效日期",
      keyCode: "payment_conditions_effect_date",
      value: ""
    }, {
      key: "预计支付日期",
      keyCode: "payment_earliest_date",
      value: ""
    }, {

      key: "预算填报类型",
      keyCode: "budget_application_type",
      value: ""
    }, {
      key: "是否自动邀请会签",
      keyCode: "budget_isautosign",
      value: ""
    }, {
      key: '业务分组',
      keyCode: 'activity_businessgroup',
      value: '',
    }, {
      key: '付款公司',
      keyCode: 'payment_company',
      value: '',
    }, {
      key: '资产审核部门',
      keyCode: 'activity_assetsauditdepartment',
      value: '',
    }, {
      key: '关联表单',
      keyCode: 'linkto_activity_id',
      value: '',
    }, {
      key: '付款方式',
      keyCode: 'payment_method',
      value: '',
    }, {
      key: '收款单位（人）',
      keyCode: 'payment_payee',
      value: '',
    }, {
      key: '收款单位（人）账号',
      keyCode: 'payment_payee_account',
      value: '',
    }, {

      key: '收款方开户行是否工商银行',
      keyCode: 'payment_isicbc',
      value: '',
    }, {
      key: '开户行名称',
      keyCode: 'payment_bankname',
      value: '',
    }, {
      key: '开户行联行号',
      keyCode: 'payment_bankno',
      value: '',
    }, {
      key: '开户行所在城市',
      keyCode: 'payment_bankcity',
      value: '',
    }, {
      key: '实际付款金额',
      keyCode: 'actual_payment_amount',
      value: '',
    }, {
      key: '是否预算内',
      keyCode: 'budget_isinbudget',
      value: '',
    }, {
      key: '分摊月份',
      keyCode: 'budget_share_month',
      value: '',
    }, {
      key: '备注',
      keyCode: 'activity_remark',
      value: '',
    }, {
      key: '发票审核备注',
      keyCode: 'invoice_audit_remark',
      value: '',
    }, {
      key: '收到发票状态',
      keyCode: 'receipt_invoice',
      value: '',
    }, {
      key: '价税分离发票详情',
      keyCode: 'price_tax_invoice_detail',
      value: '',
    }, {
      key: '关联表单列表',
      keyCode: 'linkto_activity_list',
      value: '',
    }, {
      key: '设备物品采购项目明细',
      keyCode: 'purchase_items',
      value: '',
    }, {
      key: '电子发票',
      keyCode: 'uploadEInvoiceFile',
    }
  ],
  detailValue: [{
    key: textTravelItem,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textDevicePurchaseDetailItemModel,
    keyCode: 'model',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'quantity',
    value: '',
  }, {
    key: textFixedAssertsunitprice,
    keyCode: 'price',
    value: '',
  }, {
    key: textFixedAssertstotalprice,
    keyCode: 'sum',
    value: '',
  }, {
    key: textStaffLoanExplanation,
    keyCode: 'explanation',
    value: '',
  }],
  title: textFixedAssertsitemdetail
}



// 固定资产调拨单
const fixedAssertsAllocationDetail = {
  key: [textOperator, textFixedAssertsAffiliatedcompany, textFixedAssertsAuditdepartment, textFixedAssertsfromdepartment, textFixedAssertstodepartment, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textFixedAssertsAffiliatedcompany,
      keyCode: "recipients_company",
      value: ""
    },
    {
      key: textFixedAssertsAuditdepartment,
      keyCode: "activity_assetsauditdepartment",
      value: ""
    },
    {
      key: textFixedAssertsfromdepartment,
      keyCode: "allocation_out_costcenter",
      value: ""
    },
    {
      key: textFixedAssertstodepartment,
      keyCode: "allocation_in_costcenter",
      value: ""
    },
    {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],
  title: textFixedAssertsitemdetail,
  detailValue: [{
    key: textFixedAssertsassettype,
    keyCode: 'assetClass',
    value: '',
  }, {
    key: textFixedAssertsitem,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textFixedAssertsassetnumber,
    keyCode: 'model',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'quantity',
    value: '',
  }, {
    key: textFixedAssertsunitprice,
    keyCode: 'price',
    value: '',
  }, {
    key: textFixedAssertstotalprice,
    keyCode: 'sum',
    value: '',
  }, {
    key: textFixedAssertsusedate,
    keyCode: 'useDate',
    value: '',
  }, {
    key: textFixedAssertsexplanation,
    keyCode: 'explanation',
    value: '',
  }, {
    key: textFixedAssertsplace,
    keyCode: 'site',
    value: '',
  }],
}

// 固定资产领用单
const fixedAssertsApplyDetail = {
  key: [textOperator, textFixedAssetsapplyreceiptdepartment, textFixedAssertsAffiliatedcompany, textFixedAssertsAuditdepartment, textFixedAssetsapplyauditnumber, textFixedAssertsRemarks],
  value: [{
      key: textOperator,
      keyCode: "processors",
      value: ""
    },
    {
      key: textFixedAssetsapplyreceiptdepartment,
      keyCode: "recipients_company",
      value: ""
    },
    {
      key: textFixedAssertsAffiliatedcompany,
      keyCode: "recipients_company",
      value: ""
    },
    {
      key: textFixedAssertsAuditdepartment,
      keyCode: "activity_assetsauditdepartment",
      value: ""
    },
    {
      key: textFixedAssetsapplyauditnumber,
      keyCode: "inkto_activity_id",
      value: ""
    },
    {
      key: textFixedAssertsRemarks,
      keyCode: "activity_remark",
      value: ""
    }
  ],
  title: textFixedAssertsitemdetail,
  detailValue: [{
    key: textFixedAssertsassettype,
    keyCode: 'assetClass',
    value: '',
  }, {
    key: textFixedAssertsitem,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textFixedAssertsassetnumber,
    keyCode: 'model',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'quantity',
    value: '',
  }, {
    key: textFixedAssertsunitprice,
    keyCode: 'price',
    value: '',
  }, {
    key: textFixedAssertstotalprice,
    keyCode: 'sum',
    value: '',
  }, {
    key: textFixedAssertsusedate,
    keyCode: 'useDate',
    value: '',
  }, {
    key: textFixedAssertsexplanation,
    keyCode: 'explanation',
    value: '',
  }, {
    key: textFixedAssertsplace,
    keyCode: 'site',
    value: '',
  }]
}

// 设备物品的项目明细
const equipmentPurchaseApplicationCtrl = {
  title: textFixedAssertsitemdetail,
  detailValue: [{
    key: textFixedAssertsassettype,
    keyCode: 'assetClass',
    value: '',
  }, {
    key: textDevicePurchaseDetailItemModel,
    keyCode: 'model',
    value: '',
  }, {
    key: textFixedAssertsquantity,
    keyCode: 'quantity',
    value: '',
  }, {
    key: textFixedAssertsunitprice,
    keyCode: 'price',
    value: '',
  }, {
    key: textFixedAssertstotalprice,
    keyCode: 'sum',
    value: '',
    }, {
      key: textFixedAssertsusedate,
      keyCode: 'useDate',
      value: '',
    }, {
    key: textFixedAssertsexplanation,
    keyCode: 'explanation',
    value: '',
  }]
}


// 设备物品付款明细
const equipmentPayCtrl = {
  title: textPayDetail,
  detailValue: [{
    key: textPaymentPayee,
    keyCode: 'recipientPerson',
    value: '',
  }, {
      key: textRecipientAccountNumber,
      keyCode: 'recipientAccountNumber',
    value: '',
  }, {
      key: textNameBank,
      keyCode: 'bankName',
    value: '',
  }, {
      key: textAddressBank,
      keyCode: 'bankAddress',
    value: '',
  }, {
      key: textCityBank,
      keyCode: 'bankCity',
    value: '',
  }, {
      key: textContractPaymentAmount,
      keyCode: 'contractPaymentAmount',
    value: '',
  }]
}


// 公共的common
const commonDetail = {
  detailValue: [{
    key: textTicketname,
    keyCode: 'itemName',
    value: '',
  }, {
    key: textDateofoccurance,
    keyCode: 'lastUpdate',
    value: '',
  }, {
    key: textOvertime,
    keyCode: 'isOvertime',
    value: '',
  }, {
    key: textWorkingHours,
    keyCode: 'workingHours',
    value: '',
  }, {
    key: textTravelAmount,
    keyCode: 'residue',
    value: '',
  }, {
    key: textExplanation,
    keyCode: 'explanation',
    value: '',
  }],
  title: textFixedAssertsitemdetail
}








module.exports = {
  costForm: costForm,
  travelForm: travelForm,
  businessCardForm: businessCardForm,
  fixedAssertsScrappedForm: fixedAssertsScrappedForm,
  pointsPolicyApplyForm: pointsPolicyApplyForm,
  chapterLegalPersonForm: chapterLegalPersonForm,
  chapterOfficialSealForm: chapterOfficialSealForm,
  chapterBusinessForm: chapterBusinessForm,
  chapterSealEngravingForm: chapterSealEngravingForm,
  chapterInvestmentForm: chapterInvestmentForm,
  deliveryForm: deliveryForm,
  goOutForm: goOutForm,
  letterForm: letterForm,
  officeSuppliesForm: officeSuppliesForm,
  sendCarForm: sendCarForm,
  giftCollarForm: giftCollarForm,
  purchaseContractReview: purchaseContractReview,
  contractPaymentDetail: contractPaymentDetail,
  incomeContractReviewDetail: incomeContractReviewDetail,
  mICEGroupApplyDetail: mICEGroupApplyDetail,
  addPointsApplyDetail: addPointsApplyDetail,
  couponApplyDetail: couponApplyDetail,
  costTicketsApplyDetail: costTicketsApplyDetail,
  incomeTicketsApplyDetail: incomeTicketsApplyDetail,
  staffLoanDetail: staffLoanDetail,
  devicePurchaseDetail: devicePurchaseDetail,
  fixedAssertsAllocationDetail: fixedAssertsAllocationDetail,
  fixedAssertsApplyDetail: fixedAssertsApplyDetail,
  equipmentPurchaseApplicationCtrl: equipmentPurchaseApplicationCtrl,
  equipmentPayCtrl: equipmentPayCtrl,
  commonDetail: commonDetail
}