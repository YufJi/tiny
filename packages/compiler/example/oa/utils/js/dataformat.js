const {
  contains,
  isArr,
  isNull,
  Outputmoney,
  isJSON
} = require('./util.js');
const langStr = wx.getStorageSync('langStr');
const getValue = (data, searchStr) => {
  var keepGoing = true;
  var detail = "";
  var detaillist = [];
  if (isArr(data)) {
    data.forEach((item, key) => {
      if (keepGoing) {
        if (item.number == searchStr && item.number != undefined) {
          switch (searchStr) {
            case "budget_share_month":
            case "activity_remark":
            case "mice_reason":
            case "coupons_effectdata":
            case "coupons_project_name":
            case "coupons_project_nature":
            case "payment_reason":
            case "coupons_use_rate":
            case "payment_payee":
            case "contract_startdate":
            case "contract_enddate":
            case "contract_name":
            case "contract_agreement_unit":
            case "contract_keyword":
            case "payment_payee_account":
            case "budget_isacrossmonth":
            case "budget_share_startdate":
            case "budget_share_enddate":
            case "integral_year_points":
            case "expense_start_date":
            case "expense_end_date":
            case "expense_place":
            case "integral_name":
            case "integral_total_points":
            case "integral_rule":
            case "mice_teamno":
            case "expense_invoice_number":
            case "inkto_activity_id":
            case "coupons_project_name":
            case "coupons_project_no":
            case "integral_total_points":
            case "contract_islongtime":
            case "contract_amount_isindefinite":
            case "contract_amount_isindefinite":
            case "business_chapter_dept":
            case "business_chapter_company":
            case "business_chapter_usereason":
            case "stamper_usefor":
            case "stamper_unit":
            case "stamper_content":
            case "activity_remark":
            case "investment_filetype":
            case "seal_reason":
            case "recipient_address":
            case "recipient_phone":
            case "recipient_name":
            case "Express_carrier":
            case "waybill_number":
            case "express_type_new":
            case "express_details":
            case "office_supplies":
            case "Customer_name":
            case "Apply_for_use":
            case "biz_company_cn":
            case "biz_company_en":
            case "applicant_name_chinese":
            case "applicant_name_english":
            case "position_chinese":
            case "position_english":
            case "biz_dept_chinese":
            case "biz_dept_english":
            case "biz_addr_chinese":
            case "biz_addr_english":
            case "office_telephone":
            case "mobile_phone":
            case "e_mail":
            case "personal_wechat":
            case "apply_number":
            case "use_car_reason":
            case "go_out_date":
            case "res_list":
            case "letter_detail":
            case "letter_items":
            case "fax_telephone":
            case "recipient_address_select":
            case "is_branch_office":
            case "payment_conditions_effect_date":
            case "payment_earliest_date":
            case "budget_isautosign":
            case "payment_isicbc":
            case "payment_bankname":
            case "payment_bankno":
            case "payment_bankcity":
            case "actual_payment_amount":
            case "budget_isinbudget":
            case "invoice_audit_remark":
            case "receipt_invoice":
            case "price_tax_invoice_detail":
            case "linkto_activity_list":
            case "purchase_items":
            case "uploadEInvoiceFile":
            case "activity_businessgroup":
              detail = item.value;
              break;
            case "payment_contract_no":
              if (typeof (item.value) != 'undefined' && item.value != null) {
                var obj = JSON.parse(item.value);
                detail = obj;
              } else {
                detail = "";
              }

              break;

            case "mice_teamamount":
            case "coupons_total":
            case "coupons_total_cost":
            case "coupons_actual_receipts":
              detail = "￥" + Outputmoney(item.value);
              break;
            case "activity_currency":
              if (typeof (item.value) != 'undefined' && item.value != null) {
                var obj = JSON.parse(item.value);
                detail = obj;
              } else {
                detail = "";
              }


              break;
            case "contract_amount":
            case "contract_deposit":
              if (getValue(data, "activity_currency") != '' &&
                typeof (getValue(data, "activity_currency") != 'undefined')) {
                var sign = getValue(data, "activity_currency").sign;
                detail = "" + sign + Outputmoney(item.value);
              } else {
                detail = "";
              }

              break;


            case "payment_contract_amount":
            case "payment_contract_paid_amount":
            case "payment_current_pay_amount":
            case "payment_current_deposit":
            case "payment_current_deposit_offset":
            case "payment_balance":

              detail = item.value;
              break;
            case "contract_no":
              detail = item.value[0];
              break;
            case "budget_application_type":
            case "payment_feetype":
            case "coupons_type":
            case "coupons_form":
            case "activity_assetsauditdepartment":
            case "activity_suppliercategory":
            case "integral_type":
              if (typeof (item.value) != 'undefined' && item.value != null) {
                detail = item.value ? (item.value.value ? item.value.value : '') : '';
              } else {
                detail = "";
              }

              break;
            case "payment_company":
            case "recipients_costcenter":
            case "allocation_out_costcenter":
            case "allocation_in_costcenter":
            case "retirement_costcenter":
            case "recipients_company":
              if (typeof(item.value) != 'undefined' && item.value != null) {
                detail = (item.value ? (item.value.name ? item.value.name : '') : '') + "(" + (item.value ? (item.value.code ? item.value.code : '') : '') + ")";
              } else {
                detail = "";
              }

              break;
            case "oa_service_attachment":
              detail = item.description;
              break;
            case "coupons_project_no":
              detail = "TS" + item.value;
              break;
            default:
              break;
          }
          keepGoing = false;
        }
      }
    });
  }
  return detail;
}

const getArraysbysearchStr = (data, searchStr) => {
  var keepGoing = true;
  var detaillist = [];
  //预算填报类型
  var budget_application_type = getValue(data, "budget_application_type");

  if (isArr(data)) {
    data.forEach((item, key) => {
      if (keepGoing) {
        if (searchStr == "workflowLogs") {
          if (item.user.length > 1 || (item.user.length === 1 && (!item.user[0].do ||
            !contains(["自动跳空", "自动跳空(返回)", "按条件跳空", "按条件跳空(返回)", "连续审批跳空(返回)"], item.user[0].do)

          ))) {
            var oaitem = {};
            oaitem.users = [];
            oaitem.fromstatusName = item.from_status.name;
            if (typeof (item.to_status) != 'undefined' &&
              typeof (item.to_status.code) != 'undefined') {
              oaitem.statuscode = item.to_status.code.toLowerCase();
            }

            oaitem.tostatusName = "";
            if (item.from_status.code.toLowerCase() == "refused") {
              oaitem.fromstatusName = "重新提交";
            }
            if (typeof (item.to_status) != 'undefined') {
              oaitem.tostatusName = "【同意】";
              oaitem.tostatuscode = "agree";
              if (item.path_name == "跳转") {
                oaitem.tostatusName = "【退回上一步】";
                oaitem.tostatuscode = "refused";
              }
              if (item.path_name == "加签") {
                oaitem.tostatusName = "【会签】";
                oaitem.tostatuscode = "agree";
              }
              if (oaitem.statuscode == "refused") {
                oaitem.tostatusName = "【拒绝】";
                oaitem.tostatuscode = "refused";
              }

              if (typeof (item.from_status.code) != 'undefined' &&
                (item.from_status.code.toLowerCase() == "refused" ||
                  item.from_status.code.toLowerCase() == "sys_draft")) {
                oaitem.tostatusName = "";
              }

            } else {
              oaitem.tostatusName = "【会签】";
              oaitem.tostatuscode = "agree";
            }
            if (item.user.length > 0 || typeof (item.user[0].parent) != 'undefined') {

              for (var d = 0; d < item.user.length; d++) {
                if (typeof (item.user[d]) != "undefined") {
                  var user1 = {};
                  user1.isapproval = false;
                  user1.fullName = item.user[d].user.fullname;
                  if (typeof (item.user[d].parent) != 'undefined') {
                    user1.fullName = item.user[d].user.fullname;
                    user1.fullName += "(" + item.user[d].parent.fullname + "邀请加签" + ")"; //+(typeof(item.user[d].do)=="undefined"?"":item.user[d].do );
                    user1.isapproval = true;
                    if (typeof (item.user[d].do) != "undefined" && item.user[d].do.length > 0) {
                      user1.remark = item.user[d].do;
                    } else {

                      user1.remark = "";
                    }

                  } else if (typeof (item.user[d].principal) != 'undefined') {
                    user1.fullName = item.user[d].user.fullname;
                    user1.fullName += "(代理 " + item.user[d].principal.fullname + ")";
                    if (typeof (item.user[d].do) != "undefined" && item.user[d].do.length > 0) {

                      user1.remark = item.user[d].do;
                    } else {
                      user1.remark = "";
                    }
                  } else {

                    user1.remark = item.user[d].do;
                  }

                  if (user1.remark == "连续审批跳空") {
                    user1.remark = "";
                  }
                  oaitem.users.push(user1);
                }

              }

            }
            oaitem.id = key;
            oaitem.value = item;
            detaillist.push(oaitem);
          }
        } else if (searchStr == "contract_company") {
          if (item.number == "contract_company" && item.number != undefined && isArr(item.value)) {
            if (isArr(item.value)) {
              item.value.forEach((cc, keysub) => {
                var oaitem = {};
                oaitem.id = keysub;
                oaitem.value = cc.name;
                detaillist.push(oaitem);
              });
            }
          }
        } else if (searchStr == "budget_costcenter") {
          if (item.number == "budget_costcenter" && item.number != undefined && isArr(item.value)) {
            if (isArr(item.value)) {
              item.value.forEach((cc, keysub) => {
                var oaitem = {};
                oaitem.id = keysub;
                oaitem.value = cc.unit.regional.name + "-" + cc.unit.name + "(" + cc.unit.code + ")";
                oaitem.value += (budget_application_type == "多费用中心") ? "￥" + Outputmoney(cc.amount) : "";
                // console.log(oaitem)
                detaillist.push(oaitem);
              });
            }
          }
        } else if (searchStr == "budget_budgettype") {
          if (item.number == "budget_budgettype" && item.number != undefined && isArr(item.value)) {
            if (isArr(item.value)) {
              item.value.forEach((bt, keysub) => {
                var oaitem = {};
                oaitem.id = keysub;
                oaitem.value = bt.budgetType.parentDO.value + "-" + bt.budgetType.value;
                oaitem.value += (budget_application_type == "多预算分类") ? "￥" + Outputmoney(bt.amount) : "";
                detaillist.push(oaitem);
              });
            }
          }
        } else if (searchStr == "contract_no") {
          if (item.number == "contract_no" && item.number != undefined && isArr(item.value)) {
            if (isArr(item.value)) {
              item.value.forEach((bt, keysub) => {
                var oaitem = {};
                oaitem.id = keysub;
                oaitem.value = bt;

                detaillist.push(oaitem);
              });
            }
          }
        }
      }
    });
  }
  return detaillist;

}
const getProcessors = (data) => {
  var processors = [];
  if (isArr(data)) {
    data.forEach((proc, key) => {
      processors.push(proc.fullname + "(" + proc.account + ")")
      if (proc.agents != undefined && proc.agents.length > 0) {
        //循环
        proc.agents.forEach(function (agent, keysub) {
          processors.push(agent.fullname + "(" + agent.account + ")" + " 代理；")
        });
      }
    });
  }
  return processors;
}


const showProgressButton = (data, callback) => {
  var buttonData = {};
  buttonData.eform_onlycommit = false;
  buttonData.eform_app = false;
  buttonData.eform_join = false;
  buttonData.eform_onlyjoin = false;
  buttonData.isshowProgressButton = true;
  buttonData.textvalue = "";
  buttonData.has_approved = true;

  var dataValue = data.actions;
  if (isArr(dataValue) && dataValue.length > 0) {
    for (var i = 0; i < dataValue.length; i++) {
      var textval = "";
      if (langStr == 'en_US') {
        textval = dataValue[i].enname;
      } else {
        textval = dataValue[i].name;
      }
      //当srceen ==null 和resubmit重新提交按钮和加入会签按钮
      /* -1 只有提交按钮*/
      if (dataValue[i].screen === "-1") {
        buttonData.has_approved = false;
        buttonData.eform_onlycommit = true;
        buttonData.textvalue = textval;
        buttonData.isshowProgressButton = true;
        break;
      }
      /* -2 当前等待会签人执行会签操作时，只有会签按钮 */
      if (dataValue[i].screen === "-2") {
        buttonData.has_approved = false;
        buttonData.eform_onlyjoin = true;
        buttonData.textvalue = textval;
        buttonData.isshowProgressButton = true;
        break;
      }
      if (!isNull(dataValue[i].enname)) {
        //如果是重新提交并且screen是代表的重新提交
        if (dataValue[i].enname.toLowerCase() == "resubmit" || dataValue[i].enname.toLowerCase() == 're' || dataValue[i].name == "重新提交") {
          buttonData.has_approved = false;
          buttonData.eform_join = true;
          buttonData.textvalue = textval;
          buttonData.isshowProgressButton = true;
          break;
        }
        //如果是审批的时候就出现审批的按钮
        else if (dataValue[i].enname.toLowerCase() == "approval") {
          buttonData.has_approved = false;
          buttonData.eform_app = true;
          buttonData.textvalue = textval;
          buttonData.isshowProgressButton = true;
          break;
        } else { //非审批的其他情况的按钮显示
          buttonData.has_approved = false;
          buttonData.eform_app = true;
          buttonData.textvalue = textval;
          buttonData.isshowProgressButton = true;
        }

      }
    }
  }
  callback(buttonData)
}

const getpreUser = (data) => {
  var list = [];
  data.forEach(function (item, key) {
    var user = {};
    user.usernames = [];
    user.fromstatusName = item.from_status.name;
    for (var d = 0; d < item.user.length; d++) {
      var useritem = {};
      useritem.account = item.user[d].account;
      useritem.username = item.user[d].username;
      user.usernames.push(useritem);
    }
    list.push(user);
  })
  return list;
}



const getFormatValue = (str, value, commonHeaderData) => {
  var returnValue = null;
  switch (str) {
    // 预算中心
    case 'budget_costcenter':
      if (isArr(value) && value.length > 0) {
        returnValue = [];
        value.forEach((item, index) => {
          if (value.length == 1) {
            returnValue.push(`${item.value}`)
          } else {
            returnValue.push(`${index + 1}、${item.value}`)
          }
        })
      }
      break;
    // 预算分类
    // 付款公司
    // 合同编号
    case 'budget_budgettype':
    case 'contract_company':
    case 'contract_no':
      if (isArr(value) && value.length > 0) {
        returnValue = [];
        value.forEach((item, index) => {
          returnValue.push(`${item.value}`)
        })
      }
      break;
    case 'budget_share_month':
      if (commonHeaderData.budget_isacrossmonth == 'Y') {
        returnValue = `${commonHeaderData.budget_share_startdate}  ~  ${commonHeaderData.budget_share_enddate}`
      } else {
        returnValue = value
      }
      break;
    default:
      returnValue = value;
      break;
  }


  return returnValue
}



const getFieldValue = (data) => {
  let currencyobj = '';
  let otherFieldsValue = [];
  let { fields:dataFields=[]} = data;
  // 需要格式化的是data.fields
  if (isArr(dataFields) && dataFields.length > 0){
    dataFields.forEach((e,i)=>{
      let fieldValue = {
        key: '',
        value: '',
        keyCode: ''
      };
      let { value: iValue='',key:iKey='', renderer: iRenderer='',config:iConfig='',number:iNumber='',name:iName=''} = e;
      // 1、金额类的处理
      if (iRenderer == "com.sms.plugin.render.currencyProp") {
        currencyobj = iValue ? JSON.parse(iValue) : currencyobj;
      }
      if (iValue){
        let isMoney, isCurSign, currencysign;
        // 特殊的值的处理 --- 优先级，费用中心，费用类型等
        if (iKey != "priority" && iNumber != "budget_surplus_proportion" && iNumber != "budget_budgettype" && iNumber != "budget_costcenter"){
          // 特殊的单独处理
          if (iNumber == 'linkto_activity_id' && iRenderer == 'com.sms.plugin.render.linkActivityProp') {
            // 1、关联表单
            let { code:linkCode = ''} = iValue;
            // 如果可以拿到code的值的时候
            fieldValue.value = linkCode || iValue;
          } else if (iNumber == 'linkto_activity_id' && iRenderer == "com.sms.plugin.render.paymentcontractnoProp") {
            // 2、采购合同编号
            if (isJSON(iValue)){
              let {contractno: paymentContractNo = ''} = JSON.parse(value);
              fieldValue.value = paymentContractNo;
            }
          } else if (iRenderer == "com.sms.plugin.render.numberProp" || iRenderer == "com.sms.plugin.render.sumProp") {
            // 3、金额类型的处理
            isMoney = false;
            // 判断是否加符号
            if (iRenderer == "com.sms.plugin.render.sumProp") {
              currencysign = "¥"; 
              isCurSign = true
            }else{
              let { sign: curObjSign = '' } = currencyobj;
              currencysign = curObjSign.trim() || "";
              if (iConfig && isJSON(iConfig)) {
                let { money: objMoney = '',currency:objCurrency='' } = typeof iConfig == "string" ? JSON.parse(iConfig) : iConfig;
                isMoney = objMoney || isMoney;
                currencysign = (objCurrency && objCurrency == 'rmb') ? "¥" : currencysign;
              }
              isCurSign = (currencysign && isMoney) ? true : false;
            }
            // 判断值的正确性
            if (iValue || iValue === 0){
              let numvalue = iValue;
              if (isJSON(iValue)) {
                let {
                  value: objVal = '',
                  name: objName = ''
                } = typeof iValue == "string" ? JSON.parse(iValue) : iValue;
                numvalue = objVal || objName;
              }
              fieldValue.value = isCurSign ? currencysign + Outputmoney(numvalue) : numvalue;
            }
          } else{
            // 4、通用字段的处理
            //数组型
            if (isArr(iValue) && iValue.length > 0) {
              let tempItemArr = [];
              let tempResult = '';
              fieldValue.showArr = true;
              iValue.forEach(function (element) {
                // 数组item是json的时候
                if (isJSON(element)) {
                  let { value: objVal = '', name: objName = '' } = typeof element == "string" ? JSON.parse(element) : element;
                  tempResult = dataTranfer(objVal.trim()) || dataTranfer(objName.trim());
                } else {
                  tempResult = element;
                }
                if (tempResult) tempItemArr.push(tempResult);
              });
              fieldValue.value = tempItemArr.length > 0 ? tempItemArr : '';
              //JSON型
            } else if (isJSON(iValue)) {
              let { value: objVal = '', name: objName = '' } = typeof iValue == "string" ? JSON.parse(iValue) : iValue;
              fieldValue.value = dataTranfer(objVal.trim()) || dataTranfer(objName.trim());;
              //字符串型
            } else {
              fieldValue.value = dataTranfer(iValue);
            }
          }
          fieldValue.key = iName;
          if (fieldValue.value) otherFieldsValue.push(fieldValue); //过滤空值的时候的状态
        }
      }
    })


    return otherFieldsValue
  }
}


const getFieldValueHoldOA = (data, commonHeaderData) => {
  let currencyobj = {};
  let otherFieldsValue = [];
  let isMutilpCostCenter = commonHeaderData.isMutilpCostCenter;
  let budget_costcenter = [];
  let budget_budgettype = [];
  let {
    prioritycode = ''
  } = commonHeaderData
  if (data == null || typeof (data) == "undefined") {
    return;
  }
  //获取币种
  var data = data.fields;
  // arrray的形式
  if (isArr(data)) {
    //获取自定义字段
    data.forEach(function (item) {
      let keepgoing = true;
      let resultvalue = "";
      let numvalue = 0;
      let fieldValue = {
        key: '',
        value: '',
        keyCode: ''
      };
      // 取值
      let {
        key = '',
        renderer = '',
        number = '',
        value: itemValue = '',
        config: itemConfig = '',
      } = item;
      if (item == null || typeof (item) == "undefined" || item == "") {
        keepgoing = false;
      };
      if (renderer && renderer == "com.sms.plugin.render.currencyProp") {
        let { value: currencyValue = '' } = item;
        // currencyobj赋值的时候
        if (currencyValue && isJSON(currencyValue)) {
          currencyobj = JSON.parse(currencyValue);
        }
      }

      // 格式化表单的自定义的字段
      if (key && renderer && keepgoing) {
        //跳过剩余预算比例，由其他接口实现
        if (number) {
          if (number == "budget_surplus_proportion" && renderer == "com.sms.plugin.render.budgetSurplusProportionProp") {
            return true;
          }
        }
        //优先级特殊处理
        if (key == "priority" && renderer == "com.sms.plugin.render.priorityProp") {
          let {
            defaultValue = '',
          } = item;
          let obj;
          if (defaultValue && isJSON(defaultValue)) {
            obj = typeof defaultValue == 'string' ? JSON.parse(defaultValue) : defaultValue;
            let { name: priorityName = '' } = obj;
            fieldValue.value = priorityName.trim() || '';
          }
          if (prioritycode && prioritycode != "normal") {
            return true;
          }
          //预算填报类型特殊处理
        } else if (number == "budget_application_type" && renderer == "com.sms.plugin.render.radioProp") {
          if (itemValue && isJSON(itemValue)) {
            let obj = typeof itemValue == 'string' ? JSON.parse(itemValue) : itemValue;
            let { value: budgetValue = '' } = obj;
            fieldValue.value = budgetValue.trim() || '';
          }
          //费用中心特殊处理
        } else if (number == "budget_costcenter" && renderer == "com.sms.plugin.render.orgunitsamountProp") {
          let detaillist = [];
          if (itemValue) {
            if (isArr(itemValue) && itemValue.length > 0) {
              itemValue.forEach(function (element, key) {
                let oaitem = { id: key };
                let currencysign = "¥";
                let amount = "0.00";
                let currency = "";
                let unit = "";
                let regional = "";
                let regionalname = "";
                let unitname = "";
                let unitcode = "";
                if (!isNull(element) && isJSON(element)) {
                  var obj = typeof element == 'string' ? JSON.parse(element) : element;
                  let { amount: amountEle = '', currency: currencyEle = '', unit: unitEle = '' } = obj;
                  amount = Outputmoney(amountEle.trim()) || amount;
                  if (currencyEle && isJSON(currencyEle)) {
                    currency = typeof currencyEle == 'string' ? JSON.parse(currencyEle) : currencyEle;
                    let { sign = '' } = currency;
                    currencysign = sign.trim() || currencysign;
                  }
                  if (unitEle && isJSON(unitEle)) {
                    unit = typeof unitEle == "string" ? JSON.parse(unitEle) : unitEle;
                    let { name: unitName = '', code: unitCode = '', regional: unitRegional = '', } = unit;
                    unitname = unitName.trim() || unitname;
                    unitcode = unitCode.trim() || unitcode;
                    if (unitRegional && isJSON(unitRegional)) {
                      regional = typeof unitRegional == "string" ? JSON.parse(unitRegional) : unitRegional;
                      let { name: regionalName = '' } = regional
                      regionalname = regionalName.trim() || regionalname;
                    }
                  }
                }
                oaitem.value = regionalname + "-" + unitname + "(" + unitcode + ")" + " " + currencysign + amount;
                detaillist.push(oaitem.value);
              });
              fieldValue.value = detaillist;
            }
          }
          //预算分类特殊处理
        } else if (item.number == "budget_budgettype" && item.renderer == "com.sms.plugin.render.budgettypesamountProp") {
          var detaillist = [];
          if (itemValue) {
            if (isArr(itemValue) && itemValue.length > 0) {
              itemValue.forEach(function (element, key) {
                var oaitem = { id: key };
                var budgetType = "";
                var parentDoValue = "";
                var budgetTypeValue = "";
                if (!isNull(element) && isJSON(element)) {
                  let obj = typeof element == "string" ? JSON.parse(element) : element;
                  let { budgetType: budgetTypeEle = '' } = obj;

                  if (budgetTypeEle && isJSON(budgetTypeEle)) {
                    budgetType = typeof budgetTypeEle == "string" ? JSON.parse(obj.budgetTypeEle) : budgetTypeEle;
                    let {
                      parentDO = '',
                      value: bTypeVal = ''
                    } = budgetType
                    budgetTypeValue = bTypeVal.trim() || budgetTypeValue;
                    if (parentDO && isJSON(parentDO)) {
                      parentDO = typeof parentDO == "string" ? JSON.parse(parentDO) : parentDO;

                      let { value: parentDOValItem = '' } = parentDO;
                      parentDoValue = parentDOValItem.trim() || parentDoValue;
                    }
                  }
                }
                oaitem.value = parentDoValue + "-" + budgetTypeValue;
                detaillist.push(oaitem.value);
              });
              fieldValue.value = detaillist;
            }
          }
          //数字型的自定义字段单独处理
        } else if (renderer == "com.sms.plugin.render.numberProp" || renderer == "com.sms.plugin.render.sumProp") {
          if (renderer == "com.sms.plugin.render.numberProp") {
            let currencysign = (!isNull(currencyobj) && !isNull(currencyobj.sign)) ? currencyobj.sign.trim() : "";
            let isMoney = false;
            if (itemConfig && isJSON(itemConfig)) {
              let obj = typeof itemConfig == "string" ? JSON.parse(itemConfig) : itemConfig;
              let { money: objMoney = '' } = obj;
              isMoney = objMoney || isMoney;
            }
            // 需要判断是否为0
            if (itemValue || itemValue === 0) {
              let numvalue = itemValue;
              if (isJSON(itemValue)) {
                let obj = typeof itemValue == "string" ? JSON.parse(itemValue) : itemValue;
                let { value: objVal = '', name: objName = '' } = obj
                numvalue = objVal || objName;
              }
              fieldValue.value = (currencysign != "" && isMoney) ? currencysign + Outputmoney(numvalue) : numvalue;
            }
          } else if (renderer == "com.sms.plugin.render.sumProp") {
            let currencysign = "¥";
            let numvalue;
            if (itemValue) {
              if (isJSON(itemValue)) {
                let obj = typeof itemValue == "string" ? JSON.parse(itemValue) : itemValue;
                let { value: objVal = '', name: objName = '' } = obj
                numvalue = objVal || objName;
              } else {
                numvalue = itemValue;
              }
              fieldValue.value = currencysign + Outputmoney(numvalue);
            }
          }
        } else {
          //通用字段
          if (itemValue) {
            //数组型
            if (isArr(itemValue) && itemValue.length > 0) {
              let tempItemArr = [];
              let tempResult = '';
              fieldValue.showArr = true;
              itemValue.forEach(function (element) {
                // 数组item是json的时候
                if (isJSON(element)) {
                  let obj = typeof element == "string" ? JSON.parse(element) : element;
                  let { value: objVal = '', name: objName = '' } = obj;
                  tempResult = dataTranfer(objVal.trim()) || dataTranfer(objName.trim());
                } else {
                  tempResult = element;
                }
                if (tempResult) tempItemArr.push(tempResult);

              });
              fieldValue.value = tempItemArr.length > 0 ? tempItemArr : '';
              //JSON型
            } else if (isJSON(itemValue)) {
              let obj = typeof itemValue == "string" ? JSON.parse(itemValue) : itemValue;
              let { value: objVal = '', name: objName = '' } = obj;
              fieldValue.value = dataTranfer(objVal.trim()) || dataTranfer(objName.trim());
              //字符串型
            } else {
              resultvalue = dataTranfer(item.value);
              fieldValue.value = resultvalue;
            }
          }
        }
      }
      if (item.name == '优先级') {
        fieldValue.keyCode = item.key
      } else {
        fieldValue.keyCode = item.number
      }
      fieldValue.key = item.name.trim();
      if (fieldValue.value) otherFieldsValue.push(fieldValue);
    });
  }
  return otherFieldsValue
}

const getFieldValueEquipmentPurchaseValue = (data, commonHeaderData) => {
  var otherFieldsValue = [];
  var currencyobj = {};
  if (data == null || typeof (data) == "undefined") {
    return;
  }
  //获取币种
  const {
    activity = {
      priority: {
        name: ''
      }
    }
  } = data;
  var data = data.fields;
  if (isArr(data)) {
    data.forEach(function (item) {
      if (!isNull(item.renderer)) {
        if (item.renderer == "com.sms.plugin.render.currencyProp") {
          if (!isNull(item.value) && isJSON(item.value)) {
            currencyobj = JSON.parse(item.value);
          }
        }
      }
    });
    //获取自定义字段
    data.forEach(function (item) {
      var keepgoing = true;
      var resultvalue = "";
      var numvalue = 0;
      var fieldValue = { key: '', value: '' };
      if (item == null || typeof (item) == "undefined" || item == "") {
        keepgoing = false;
      } else {
        if (!isNull(item.number)) {
          if (item.number == "expense_items" || item.number == "uploadEInvoiceFile") {
            keepgoing = false;
          }
        }
      }

      if (!isNull(item.key) && !isNull(item.renderer) && keepgoing) {
        //跳过剩余预算比例，由其他接口实现
        if (!isNull(item.number)) {
          if (item.number == "budget_surplus_proportion" && item.renderer == "com.sms.plugin.render.budgetSurplusProportionProp" && item.number == "budget_costcenter" && item.renderer == "com.sms.plugin.render.orgunitsamountProp") {
            return true;
          }
        }
        //优先级特殊处理
        if (item.key == "priority" && item.renderer == "com.sms.plugin.render.priorityProp") {
          console.log('优先级')
          fieldValue.value = activity.priority.name
          //预算填报类型特殊处理
        } else if (item.number == "budget_application_type" && item.renderer == "com.sms.plugin.render.radioProp") {
          // 可以获取预算填报类型
          fieldValue.value = getValue(data, "budget_application_type")
          //费用中心特殊处理
        } else if (item.number == "budget_budgettype" && item.renderer == "com.sms.plugin.render.budgettypesamountProp") {
          fieldValue.value = getArraysbysearchStr(data, "budget_budgettype");
          fieldValue.showArr = true;
          //数字型的自定义字段单独处理
        } else if (item.renderer == "com.sms.plugin.render.numberProp" || item.renderer == "com.sms.plugin.render.sumProp") {
          if (item.renderer == "com.sms.plugin.render.numberProp") {
            var currencysign = "";
            var isMoney = false;
            if (!isNull(currencyobj) && !isNull(currencyobj.sign)) {
              currencysign = currencyobj.sign.trim();
            }
            if (!isNull(item.config)) {
              if (isJSON(item.config)) {
                if (typeof item.config == "string") {
                  var obj = JSON.parse(item.config);
                } else {
                  var obj = item.config;
                }
                if (!isNull(obj.money)) {
                  isMoney = obj.money;
                }
              }
            }
            if (!isNull(item.value)) {
              if (isJSON(item.value)) {
                if (typeof item.value == "string") {
                  var obj = JSON.parse(item.value);
                } else {
                  var obj = item.value;
                }
                if (!isNull(obj.value)) {
                  numvalue = obj.value;
                  if (currencysign != "" && isMoney) {
                    fieldValue.value = currencysign + Outputmoney(numvalue);
                  } else {
                    fieldValue.value = numvalue;
                  }
                } else if (!isNull(obj.name)) {
                  numvalue = obj.name;
                  if (currencysign != "" && isMoney) {
                    fieldValue.value = currencysign + Outputmoney(numvalue);
                  } else {
                    fieldValue.value = numvalue;
                  }
                }
              } else {
                numvalue = item.value;
                if (currencysign != "" && isMoney) {
                  fieldValue.value = currencysign + Outputmoney(numvalue);
                } else {
                  fieldValue.value = numvalue;
                }
              }
            }
          } else if (item.renderer == "com.sms.plugin.render.sumProp") {
            var currencysign = "¥";
            if (!isNull(item.value)) {
              if (isJSON(item.value)) {
                if (typeof item.value == "string") {
                  var obj = JSON.parse(item.value);
                } else {
                  var obj = item.value;
                }
                if (!isNull(obj.value)) {
                  numvalue = obj.value;
                  fieldValue.value = currencysign + Outputmoney(numvalue);
                } else if (!isNull(obj.name)) {
                  numvalue = obj.name;
                  fieldValue.value = currencysign + Outputmoney(numvalue);
                }
              } else {
                numvalue = item.value;
                fieldValue.value = currencysign + Outputmoney(numvalue);
              }
            }
          }
        } else {
          //通用字段
          let {value:itemVal=''} = item;
          if (itemVal) {
            //数组型
            if (isArr(itemVal) && itemVal.length > 0) {
              let tempItemArr = [];
              let tempResult = '';
              fieldValue.showArr = true;
              itemVal.forEach(function (element) {
                // 数组item是json的时候
                if (isJSON(element)) {
                  let obj = typeof element == "string" ? JSON.parse(element) : element;
                  let { value: objVal = '', name: objName = '' } = obj;
                  tempResult = dataTranfer(objVal.trim()) || dataTranfer(objName.trim());
                } else {
                  tempResult = element;
                }
                if (tempResult) tempItemArr.push(tempResult);
              });
              fieldValue.value = tempItemArr.length > 0 ? tempItemArr : '';
              //JSON型
            } else if (isJSON(item.value)) {
              if (typeof item.value == "string") {
                var obj = JSON.parse(item.value);
              } else {
                var obj = item.value;
              }
              if (!isNull(obj.value)) {
                resultvalue = dataTranfer(obj.value.trim());
                fieldValue.value = resultvalue;
              } else if (!isNull(obj.name)) {
                resultvalue = dataTranfer(obj.name.trim());
                fieldValue.value = resultvalue;
              }
              //字符串型
            } else {
              resultvalue = dataTranfer(item.value);
              fieldValue.value = resultvalue;
            }
          }
        }
      }

      //封装自定义字段
      if (fieldValue.value) {
        fieldValue.key = item.name.trim();
        otherFieldsValue.push(fieldValue);
      }
    });
  }
  console.log(otherFieldsValue)
  return otherFieldsValue
}


const dataTranfer = (data) => {
  var resultStr = "";
  if (data == null || typeof (data) == "undefined") {
   
    return resultStr;
  } else {
    if (data == 'Y') {
      resultStr = "是";
    } else if (data == 'N') {
      resultStr = "否";
    } else {
      console.log(data)
      if(isArr(data) && data.length > 0){
        data.forEach((e,i)=>{
          let { name:compName='',code:compCode=''} = e;
          if (compName && compCode) resultStr = resultStr + compName + '(' + compCode +')'
        })
      }else{
        resultStr = data;
      }
    }
  }
  return resultStr;
}


module.exports = {
  getValue: getValue,
  getArraysbysearchStr: getArraysbysearchStr,
  getProcessors: getProcessors,
  showProgressButton: showProgressButton,
  getpreUser: getpreUser,
  getFormatValue: getFormatValue,
  getFieldValue: getFieldValue,
  getFieldValueHoldOA: getFieldValueHoldOA,
  getFieldValueEquipmentPurchaseValue: getFieldValueEquipmentPurchaseValue
}