/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "../devtool/assets/biz/index$.worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../devtool/assets/biz/config$.js":
/*!****************************************!*\
  !*** ../devtool/assets/biz/config$.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
const g = typeof global !== 'undefined' ? global : self;
g.mpAppJson = {
  "app": {
    "$homepage": "pages/index/index"
  }
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../compiler/node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../devtool/assets/biz/index$.worker.js":
/*!**********************************************!*\
  !*** ../devtool/assets/biz/index$.worker.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

if(!self.__mpInited) {
self.__mpInited = 1;

__webpack_require__(/*! ./config$ */ "../devtool/assets/biz/config$.js");


var MP = self.MP;
self.getCurrentPages = MP.getCurrentPages;
self.getApp = MP.getApp;
self.Page = MP.Page;
self.App = MP.App;
self.wx = MP.bridge;
self.Component = MP.Component;
self.$global = MP.$global;
self.requirePlugin = MP.requirePlugin;


if(MP.registerApp) {
  MP.registerApp({
    appJSON: mpAppJson,
  });
}


function success() {
__webpack_require__(/*! ./example/oa/app */ "./example/oa/app.js");
__webpack_require__(/*! ./example/oa/pages/component/searchbar/searchbar?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 */ "./example/oa/pages/component/searchbar/searchbar.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8");
__webpack_require__(/*! ./example/oa/pages/component/toptips/toptips?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 */ "./example/oa/pages/component/toptips/toptips.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8");
__webpack_require__(/*! ./example/oa/pages/component/search/search?hash=dcbe94866d3a665efd3557072bc33b52208803de */ "./example/oa/pages/component/search/search.js?hash=dcbe94866d3a665efd3557072bc33b52208803de");
__webpack_require__(/*! ./example/oa/pages/index/index?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/index/index.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/taxNumber/index?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/taxNumber/index.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4");
__webpack_require__(/*! ./example/oa/pages/approve/index?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/approve/index.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/costaccount/index?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/costaccount/index.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2");
__webpack_require__(/*! ./example/oa/pages/costaccount/accountDetail?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/costaccount/accountDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2");
__webpack_require__(/*! ./example/oa/pages/search/searchCompany?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchCompany.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4");
__webpack_require__(/*! ./example/oa/pages/search/searchBudgetList?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchBudgetList.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4");
__webpack_require__(/*! ./example/oa/pages/search/searchBusinessType?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchBusinessType.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4");
__webpack_require__(/*! ./example/oa/pages/travelPay/index?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/travelPay/index.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2");
__webpack_require__(/*! ./example/oa/pages/travelPay/travelDetail?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/travelPay/travelDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2");
__webpack_require__(/*! ./example/oa/pages/warrant/index?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/warrant/index.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/warrant/warrant?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/warrant/warrant.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/submitted/index?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/submitted/index.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/detail/index?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/detail/index.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/detail/addFlow?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/detail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/detail/search?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/detail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1");
__webpack_require__(/*! ./example/oa/pages/holdOAdetail/index?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/holdOAdetail/index.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/holdOAdetail/addFlow?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/holdOAdetail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400");
__webpack_require__(/*! ./example/oa/pages/holdOAdetail/search?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/holdOAdetail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1");
__webpack_require__(/*! ./example/oa/pages/warrant/search?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/warrant/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1");
}
self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}

/***/ }),

/***/ "./example/oa/app.js":
/*!***************************!*\
  !*** ./example/oa/app.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const config = __webpack_require__(/*! ./config.js */ "./example/oa/config.js");
const lang = __webpack_require__(/*! ./utils/js/lang.js */ "./example/oa/utils/js/lang.js");

const client = typeof nwx == 'undefined' ? 'weixin' : 'nfes';
let env = "uat"; // dev环境
const localID = '20200514'; // 涉及到缓存的时候需要更新缓存的版本号
App({
  onLaunch: function () {
    let that = this;
    // 手动控制缓存的版本
    // 入股当前没有localID的时候，需要设置localID
    if (!wx.getStorageSync('localID') || wx.getStorageSync('localID') != localID) {
      wx.clearStorageSync();
      setTimeout(() => {
        wx.setStorageSync('localID', localID)
      }, 100);
    }; 
    if (client == 'nfes' && wx.getSystemInfoSync) {
      let info = wx.getSystemInfoSync();
      if (info.env == 'PROD') {
        env = 'prod';
      }
    }

    // 手动切换环境的时候
    if (env != wx.getStorageSync('env')) {
      wx.clearStorageSync(); // 清除缓存
    }
    config.update(env);

    // 获取当前用户的  "userEmpcode":
    // 用户信息
    that.getUserEmpcode(function () {
      // empty
    }, function () {
      wx.showToast({
        title: 'Invalid UserInfo',
        icon: 'none'
      });
    });

    // 系统信息
    that.getSystemLang(function (res) {
      let langT;
      if (res == "zh_CN") {
        langT = lang.lang_ZH;
      } else {
        langT = lang.lang_EN;
      }
      that.globalData.lang = langT;
      that.globalData.langStr = res;
      wx.setStorageSync("lang", langT);
      wx.setStorageSync("langStr", res);
    });
  },


  getUserEmpcode(successCallback, failCallback) {
    let AuthData = {
      userEmpcode: "",
      identityauth2: "",
    }
    let that = this;
    let wrapSuccessCallback = function () {
      wx.setStorageSync("userEmpcode", AuthData.userEmpcode);
      wx.setStorageSync("identityauth2", JSON.stringify(AuthData.identityauth2));
      successCallback && successCallback(AuthData);
      that.globalData.userEmpcode = AuthData.userEmpcode;
    };
    let wrapFailCallback = function () {
      failCallback && failCallback();
    };
    if (client == 'weixin') {
      AuthData = {
        userEmpcode: "S80060", // S18251
        identityauth2: {
          Str_Signature: "31854f8a58a0bbe49047310906ce4e57",
          SessionID: "71e078acb4ac479fa945ba6774d511adcCaddOfnk8rCOazxGjY34NoOBYZJ0ghk",
          Str_TimeStamp: "2020-01-12 15:07:15"
        }
      }
      wrapSuccessCallback(AuthData);
    } else {
      // 调取用户信息的接口数据
      wx.getUserInfo({
        success: function (res) {
          // 如果成功了，通过res的返回值去判断
          if (res.userInfo && res.userInfo.user_EmpCode && res.Str_Signature && res.SessionID && res.Str_TimeStamp) {
            // 可以拿到当前的用户的员工信息以及鉴权信息
            AuthData = {
              userEmpcode: res.userInfo.user_EmpCode,
              identityauth2: {
                Str_Signature: res.Str_Signature,
                SessionID: res.SessionID,
                Str_TimeStamp: res.Str_TimeStamp
              }
            }
            wrapSuccessCallback(AuthData)
          } else {
            wrapFailCallback();
          }
        },
        fail: function () {
          wrapFailCallback();
        }
      });
    }
  },
  getSystemLang(callback) {
    let lang = 'zh_CN';
    if (client && client == 'weixin') {
      lang = 'zh_CN'; // 中文的
    } else {
      // 调取系统信息的接口数据
      if (wx.getSystemInfoSync) {
        let info = wx.getSystemInfoSync();
        if (info && info.language) {
          lang = info.language == 'zh' ? 'zh_CN' : info.language;
        }
      }
    }
    callback(lang);
  },
  // _clearStorageSync(){

  // },
  globalData: {
    userEmpcode: null,
    lang: null,
  },
})


/***/ }),

/***/ "./example/oa/config.js":
/*!******************************!*\
  !*** ./example/oa/config.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

/**
 * 小程序配置文件
 */
// 接口请求的API

var config = {
  platform: wx.getSystemInfoSync().platform,
  get env () {
    return wx.getStorageSync('env') || 'uat';
  },
  get apiHost () {
    let env = wx.getStorageSync('env');
    if (env == 'prod') {
      if (config.platform == 'devtools') {
        return 'http://itosgexternal.it.ctripcorp.com/api/';
      } else {
        return 'https://cchatws.ctrip.com/api/';
      }
    } else {
      return 'http://osg.uat.ops.qa.nt.ctripcorp.com/api/';
    }


  },
  get token () {
    let env = wx.getStorageSync('env');
    if (env == 'prod') {
      return '5c19a943160dc6d029ade17639318a6e';
    } else {
      return '231ca392549e3e6e1d0fbede446250a5';
    }
  },
  update: function (env) {
    wx.setStorageSync('env', env);
  }
};

module.exports = config;

/***/ }),

/***/ "./example/oa/pages/approve/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!********************************************************************************!*\
  !*** ./example/oa/pages/approve?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/approve/index',
  usingComponents: {},
  
};

// pages/submitted/index.js
const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const {isArr,alertFunc} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
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


/***/ }),

/***/ "./example/oa/pages/component/search/search.js?hash=dcbe94866d3a665efd3557072bc33b52208803de":
/*!***************************************************************************************************!*\
  !*** ./example/oa/pages/component/search/search.js?hash=dcbe94866d3a665efd3557072bc33b52208803de ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentComponentConfig = 
{
  is: "/pages/component/search/search",
  usingComponents: {},
};

const api = __webpack_require__(/*! ../../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const {isArr} = __webpack_require__(/*! ../../../utils/js/util.js */ "./example/oa/utils/js/util.js");
const app = getApp();
const UID = wx.getStorageSync("userEmpcode");

Component({
  
  properties: {
    historyHeadTxt: { // 搜索历史模块标题
      type: String,
      value: '搜索历史'
    },
    title: { // 页面标题
      type: String,
      value: '选择人员'
    },
    historyKey: { // 本地存储key
      type: String,
      value: ''
    },
    inputStatus: { // 是否自动聚焦
      type: Boolean,
      value: false
    },
    isHoldOA: { // 是否是控股的
      type: Boolean,
      value: false
    },
    syscode: { // 是否是控股的
      type: "String",
      value: ""
    },
  },

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textSearchPlace: app.globalData.lang['OA_authupdateAndAdd_text_search'],  //姓名/首字母/拼音/域帐号
    btnCancel: app.globalData.lang['OA_formlist_btn_cancel'],//选择代理人

    historys:[], // 搜索历史
    inputVal: "", // 输入框内容
    lastSearch: Date.now(), // 防抖 时间戳
    associateData:[] // 搜索联想内容
  },

  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      let that = this;

      // 获取搜索历史
      let history = wx.getStorageSync(that.properties.historyKey);
      if (history) {
        that.setData({
          historys: history
        });
      }

      // 页面标题
      wx.setNavigationBarTitle({
        title: this.properties.title
      })

    },
  },

  methods:{
    // 选择搜索联想列表内容
    selectResult: function (e) {
      let that = this;
      
      let { text, uid } = e.currentTarget.dataset;

      // 搜索历史存至Storage
      let { historys } = that.data;
      let data = historys.concat();
      if (data.indexOf(text) === -1) {
        data.unshift(text);
      } else {
        data.splice(data.indexOf(text), 1);
        data.unshift(text);
      }
      data = data.slice(0, 10);
      wx.setStorageSync(that.properties.historyKey, data);

      let pages = getCurrentPages();
      let currPage = pages[pages.length - 1];   //当前页面
      let prevPage = pages[pages.length - 2];  //上一个页面
      // 设置当前页面的元素
      that.setData({
        inputVal: ''
      })
      // 进行跳转返回上一个页面，设置上一个页面的元素
      prevPage.setData({
        'userInfo.name': text,
        'userInfo.uid': uid
      })
      wx.navigateBack();
    },

    // 点击搜索历史内容
    changeValue: function(e) {
      
      let {value} = e.currentTarget.dataset;
      this.setData({
        inputVal: value,
        inputStatus: true
      });
      let data = {
        detail : {
          value
        }
      };
      this.inputFun(data);
    },

    // 搜索事件（输入中、点击搜索历史）
    inputFun: function (e) {
      let that = this;
      let { value } = e.detail;

      that.setData({
        inputVal: value
      });

      // 输入内容为空时，默认搜索前一个点击搜索过的内容
      if (value.length == 0) {
        that.setData({
          associateData: []
        });
      }

      if (Date.now() - that.data.lastSearch < 400) {
        return;
      }
      that.setData({
        lastSearch: Date.now()
      });
      var url = this.data.isHoldOA ? 'itapp02_getHoldingOAUserInfoList' : `itapp02_SearchEmpinfo?q=${encodeURIComponent(value)}&empcode=${UID}&pageno=1` 
      var reuquest_data = this.data.isHoldOA ? { keyword: value, syscode: this.data.syscode} : {}
      api.PostData(url, reuquest_data, function (res) {
        let list = [];
        if (that.data.isHoldOA) {
          if (res.data && (res.data.empInfoList && isArr(res.data.empInfoList))){
            res.data.empInfoList.forEach(e => {
              let org = e.cpBsDpInfo;
              list.push({
                text: e.cName, // 用户名
                org, // 用户组织信息
                uid: e.empCode // 用户工号
              })
            });
            that.setData({
              associateData: list
            });
          }
        }else{
          if (res.data && (isArr(res.data))) {
            res.data.forEach(e => {
              let arr = e.org_structure.split(">").slice(-5);
              let org = arr.join('/');
              list.push({
                text: e.displayname, // 用户名
                org, // 用户组织信息
                uid: e.empcode // 用户工号
              })
            });
            that.setData({
              associateData: list
            });
          }
        }
       
      },true)
    },

    // 搜索框聚焦
    focusFun: function () {
      this.setData({
        inputStatus: true
      });
    },

    // 清空搜索框
    clearValue: function () {
      this.setData({
        inputVal: "",
        associateData: []
      });
    },

    // 取消
    cancelFun: function(){
      this.setData({
        inputStatus: false,
        inputVal: "",
        associateData: []
      });
    }, 

    // 清空搜索历史
    clearHistory: function() {
      let that = this;
      wx.showModal({
        title: '提示',
        content: `确认要清空${that.properties.historyHeadTxt}吗？`,
        success(res) {
          if (res.confirm) {
            that.setData({
              historys: []
            });
            wx.setStorageSync(that.properties.historyKey, []);
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }
      })
    } 
  }
})
  

/***/ }),

/***/ "./example/oa/pages/component/searchbar/searchbar.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8":
/*!*********************************************************************************************************!*\
  !*** ./example/oa/pages/component/searchbar/searchbar.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentComponentConfig = 
{
  is: "/pages/component/searchbar/searchbar",
  usingComponents: {},
};


"use strict";

const api = __webpack_require__(/*! ../../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const app = getApp();

Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        extClass: {
            type: String,
            value: ''
        },
        focus: {
            type: Boolean,
            value: false
        },
        placeholder: {
            type: String,
            value: app.globalData.lang['OA_formlist_btn_search']  //搜索
        },
        value: {
            type: String,
            value: ''
        },
        search: {
            type: Function,
            value: null
        },
        throttle: {
            type: Number,
            value: 500
        },
        cancelText: {
            type: String,
            value: app.globalData.lang['OA_formlist_btn_cancel']  //取消
        },
        cancel: {
            type: Boolean,
            value: true
        },
        cancelFunc:{
          type: Function,
          value: null
        },
        searchState:{
          type: Boolean,
          value: false
        },
        focusFunc:{
          type: Function,
          value: null
        }
    },
    data: {
        // 多语言变量
        btnSearch: app.globalData.lang['OA_formlist_btn_search'],   //搜索
        result: []
    },
    lastSearch: Date.now(),
    lifetimes: {
        attached: function attached() {
            if (this.data.focus) {
                this.setData({
                    searchState: true
                });
            }
        }
    },
    methods: {
        clearInput: function clearInput() {
            this.setData({
              value: '',
              result:[],
              showCell:false
            });
            this.triggerEvent('clear');
        },
        inputFocus: function inputFocus(e) {
          this.triggerEvent('focus', e.detail);
          // focus的时候，我希望也能够请求事件
          var _this = this;
          this.setData({
            value: e.detail.value,
            showCell: true,
          });
          this.triggerEvent('input', e.detail);
          if (typeof this.data.focusFunc !== 'function') {
            return;
          }
          this.lastSearch = Date.now();
          this.timerId = setTimeout(function () {
            _this.data.focusFunc(e.detail.value).then(function (json) {
              _this.setData({
                result: json
              });
            }).catch(function (err) {
              // console.log('search error', err);
            });
          }, this.data.throttle);
        },
        inputBlur: function inputBlur(e) {
            this.setData({
                focus: false
            });
            this.triggerEvent('blur', e.detail);
        },
        showInput: function showInput() {
            this.setData({
                focus: true,
                searchState: true
            });
        },
        hideInput: function hideInput() {
          this.setData({
            searchState: false,
            result:[],
            showCell:false
          });
          if (typeof this.data.cancelFunc !== 'function') {
            return;
          }
          this.data.cancelFunc()
        },
        inputChange: function inputChange(e) {
            var _this = this;
            this.setData({
                value: e.detail.value,
                showCell: true,
            });
            this.triggerEvent('input', e.detail);
            if (typeof this.data.search !== 'function') {
                return;
            }
            this.lastSearch = Date.now();
            clearTimeout(this.timerId);
            this.timerId = setTimeout(function () {
                _this.data.search(e.detail.value).then(function (json) {
                    _this.setData({
                        result: json
                    });
                }).catch(function (err) {
                    // console.log('search error', err);
                });
            }.bind(this), this.data.throttle);
        },
        selectResult: function selectResult(e) {
            var index = e.currentTarget.dataset.index;

            var item = this.data.result[index];
            this.triggerEvent('selectresult', { index: index, item: item });
            this.setData({
              showCell:false,
            })
        }
    }
});

  

/***/ }),

/***/ "./example/oa/pages/component/toptips/toptips.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/component/toptips/toptips.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentComponentConfig = 
{
  is: "/pages/component/toptips/toptips",
  usingComponents: {},
};



"use strict";


Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        type: {
            type: String,
            value: 'error',
            observer: '_typeChange'
        },
        show: {
            type: Boolean,
            value: false,
            observer: '_showChange'
        },
        msg: {
            type: String,
            value: ''
        },
        delay: {
            type: Number,
            value: 2000
        },
        extClass: {
            type: String,
            value: ''
        }
    },
    data: {
        typeClassMap: {
            'warn': 'cweui-toptips_warn',
            'info': 'cweui-toptips_info',
            'success': 'cweui-toptips_success',
            'error': 'cweui-toptips_error'
        }
    },
    attached: function attached() {
        var data = this.data;
        this.setData({
            className: data.typeClassMap[data.type] || ''
        });
    },

    methods: {
        _typeChange: function _typeChange(newVal) {
            this.setData({
                className: this.data.typeClassMap[newVal] || ''
            });
            return newVal;
        },
        _showChange: function _showChange(newVal) {
            this._showToptips(newVal);
        },
        _showToptips: function _showToptips(newVal) {
            var _this = this;

            if (newVal && this.data.delay) {
                setTimeout(function () {
                    _this.setData({
                        show: false
                    }, function () {
                        _this.triggerEvent('hide', {}, {});
                    });
                }, this.data.delay);
            }
            this.setData({
                show: newVal
            });
        }
    }
});
  

/***/ }),

/***/ "./example/oa/pages/costaccount/accountDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/costaccount/accountDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/costaccount/accountDetail',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const { appendZero } = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
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


/***/ }),

/***/ "./example/oa/pages/costaccount/index.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!************************************************************************************!*\
  !*** ./example/oa/pages/costaccount?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/costaccount/index',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const { alertFunc, appendZero} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 多语言变量
    textPrompt: app.globalData.lang['OA_costaccount_text_prompt'],  //顶部提示
    textBasicInfo: app.globalData.lang['OA_costaccount_text_basic_information'],  //基础信息
    textCostcenterorbudgettype: app.globalData.lang['OA_NewtravelAccount_text_costcenterorbudgettype'], //单费用中心/单预算分类
    textBudgettype: app.globalData.lang['OA_travelaccount_text_budgettype'],  //预算类型 
    textCostcenter: app.globalData.lang['OA_travelaccount_text_costcenter'],  //费用中心 
    textPaymentcompany: app.globalData.lang['OA_travelaccount_text_paymentcompany'],  //付款公司
    textApportionmentmonth: app.globalData.lang['OA_travelaccount_text_Apportionmentmonth'],  // 分摊月份
    textBudgetclassification: app.globalData.lang['OA_travelaccount_text_budgetclassification'],  // 预算分类
    textSelectBudgettype: app.globalData.lang['OA_travelaccount_text_select_budgettype'],  // 预算类型查询
    textCompanyInquiry: app.globalData.lang['OA_travelaccount_text_company_inquiry'],  // 公司查询
    textNumberofinvoice: app.globalData.lang['OA_costaccount_text_numberofinvoice'],  // 发票张数
    textAlertinvoice: app.globalData.lang['OA_Newcostaccount_alert_invoice'],  // 请输入正整数

    textAccountInfo: app.globalData.lang['OA_costaccount_text_account_information'],  // 账号信息
    textPayee: app.globalData.lang['OA_travelaccount_text_payee'],  // 收款人
    textPayeeName: app.globalData.lang['OA_travelaccount_text_payee_name'],  // 请输入收款人姓名
    textReceiptaccount: app.globalData.lang['OA_costaccount_text_receiptaccount'],  // 收款账号
    textReceiptaccountTip: app.globalData.lang['OA_costaccount_text_receiptaccount_tip'],  // 请输入收款银行账号
    textBankname: app.globalData.lang['OA_costaccount_text_bankname'],  // 开户银行
    textBanknameTip: app.globalData.lang['OA_costaccount_text_bankname_tip'],  // 请输入开户银行名称
    textCityofbank: app.globalData.lang['OA_costaccount_text_cityofbank'],  // 开户行所在城市
    textCityofbankTip: app.globalData.lang['OA_costaccount_text_cityofbank_tip'],  // 请输入开户行所在城市
    textNumberInvoices: app.globalData.lang['OA_costaccount_text_number_invoices'],  // 请填写发票张数
    textAlert_fill: app.globalData.lang['OA_AddItemDetail_alert_fill'],  // 注意带 * 为必填项！
    textRemarks: app.globalData.lang['OA_costaccount_text_remarks'],  // 备注
    textLimited: app.globalData.lang['OA_costaccount_text_limited'],  // 限制最多800个字符
    textNext: app.globalData.lang['OA_costaccount_text_next'],  // 下一步
    textItemdetail: app.globalData.lang['OA_additemdetail_text_itemdetail'],  // 项目明细
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
    payeeBank: '',// 收款银行
    bankCity:'', // 开户行城市
    remarkAll:'', // 说明
    componyCode:'',
    // 页面交互的信息
    error: '错误信息', 
    dateFormat: '',
    fields: "month",
    showMsg: false,
    langStr: app.globalData.langStr ,  //获取语言信息
    isNeedBusinessTypeRequired:false,
    textSelectBusinesstype: app.globalData.lang['OA_detail_business_type_placeholder'],
    businessType:'',
    businessTypeCode:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初始化当前的数据
    let defaultCostData = wx.getStorageSync('defaultCostData');
    if (defaultCostData) {
      this.formatDefaultData(this,defaultCostData)
    } else {
      this.getDefaultInfo();
    }
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_costaccount_text_fill'],
    })

  },
  // 函数方法
  // 获取表单的默认信息
  getDefaultInfo() {
    var that = this;
    var currentDate = new Date();
    var cMonth = appendZero(currentDate.getMonth() + 1)
    var shareDate = `${currentDate.getFullYear()}-${cMonth}`;
    var dateFormat = `${currentDate.getFullYear()}年${cMonth}月`;
    api.PostData('itapp02_getInitFormInfo', {}, function(res) {
      if (res.data){
        var resData = res.data.fieldUnit && res.data.fieldUnit.defaultValue;
        var userData = res.data.userInfo || {}; // 判断初始化用户信息;
        if (resData){
          const {
            accountName = '',
            account = '',
            bank = '',
            city = '',
            ...others
          } = userData;
          const {
            company = {
              name: '',
              code:'',
            },
            regional = {
              name: ''
            },
            name = '',
            code = '',
            businessTypeRequired=false,
            id=''
          } = resData;
          let costCenter = `${regional.name}-${name}(${code})`;
          let payCompany = `${regional.name}-${company.name}(${company.code})`;
          let defaultCostData = {
            budgetType: app.globalData.lang['OA_NewtravelAccount_text_costcenterorbudgettype'], //单费用中心/单预算分类
            costCenter: costCenter,
            cosCenterCode: code,
            payCompany: payCompany,
            componyCode: company.code,
            shareDate: shareDate, // 当前时间
            budgetClass: '', // 预算分类
            invoiceNumber: '', // 发票张数
            payeeName: accountName, // 收款人姓名
            payeeAccount: account, // 收款账号
            payeeBank: bank,// 收款银行
            bankCity: city, // 开户行城市
            dateFormat: dateFormat,
            businessTypeRequired: businessTypeRequired,
            businessTypeID:id
          }
          wx.setStorageSync('defaultCostData', defaultCostData)
          that.formatDefaultData(that,defaultCostData)
        }else{
          alertFunc('oa_error_system_info');
        }
      }else{
        alertFunc('oa_error_system_info');
      }
    })
  },
  formatDefaultData(that,defaultCostData){
    that.setData({
      budgetType: defaultCostData.budgetType, //单费用中心/单预算分类
      costCenter: defaultCostData.costCenter,
      cosCenterCode: defaultCostData.cosCenterCode,
      payCompany: defaultCostData.payCompany,
      componyCode: defaultCostData.componyCode,
      shareDate: defaultCostData.shareDate, // 当前时间
      budgetClass: defaultCostData.budgetClass, // 预算分类
      invoiceNumber: defaultCostData.invoiceNumber, // 发票张数
      payeeName: defaultCostData.payeeName, // 收款人姓名
      payeeAccount: defaultCostData.payeeAccount, // 收款账号
      payeeBank: defaultCostData.payeeBank,// 收款银行
      bankCity: defaultCostData.bankCity, // 开户行城市
      dateFormat: defaultCostData.dateFormat,
      isNeedBusinessTypeRequired: defaultCostData.businessTypeRequired,
      businessTypeID: defaultCostData.businessTypeID
    })
    
  },
  // 发票张数的绑定
  bindInvoice(e){
    var r1 = /^[1-9]\d*$/ // 正整数的正则
    var value = e.detail.value;
    if (!e.detail.value){
      this.hasNull(value)
    }else{
      if (!r1.test(value)) {
        // 正则验证不通过
        this.setData({
          showMsg: true,
          error: app.globalData.lang['OA_Newcostaccount_alert_invoice'],  //请输入大于0的正整数哦～
          invoiceNumber:'',
        })
      }else{
        this.setData({
          invoiceNumber: value
        })
        this.hasTxt();
      }
    }
  },
  // 收款人的姓名
  bindPayeeName(e){
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
  changeRemark(e) {
    var value = e.detail.value;
    this.setData({
      remarkAll:value
    })
  },
  // 点击跳转 -- 查询公司
  goSearchCompany(e) {
    var name = e.currentTarget.dataset.company;
    var searchName = app.globalData.lang['OA_travelaccount_text_company_inquiry'];
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
    date.replace('-', app.globalData.lang['OA_feereportCtrl_text_year']);  //年
    date = date.replace('-', app.globalData.lang['OA_feereportCtrl_text_year']) + app.globalData.lang['OA_feereportCtrl_text_month'];
    this.setData({
      shareDate: e.detail.value,
      dateFormat: date,
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
  hasNull(value) {
    if (!value) {
      this.setData({
        showMsg: true,
        error: app.globalData.lang['OA_AddItemDetail_alert_fill'], //'带*号的为必填项哦～'
      })
    } 
  },
  
  nextStep() {
    // 数据的提交
    var formData = this.data;
    var addFormDetail = {
      activity_remark: formData.remarkAll, // 第一步的说明
      budget_application_type: "BAT003", // 预算类型
      budget_budgettype: [
        {
          budgettype: formData.budgetCode, // 预算分类的code
          amount: 0, // 数量
        }
      ], // 预算分类
      
      budget_costcenter: [
        {
          amount: "0", // 数量为0
          costcenter: formData.cosCenterCode, // 费用中心的code
        }
      ], // 费用中心
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
      payment_method: "PAY001", // 付款方法
      payment_payee: formData.payeeName, // 收款人信息
      payment_payee_account: formData.payeeAccount, // 收款账户
      priority: "normal", // 优先级
      
      type: "11", //费用报销类型、

      activity_businessgroup: formData.isNeedBusinessTypeRequired ?  formData.businessTypeCode : null
      // 下一步的操作
      // expense_items: [], 

      //payment_conditions_effect_date: "", // 付款条件生效日期
      // sum: '', // 金额
    };
    var submitData = addFormDetail;

    // 数据是否填写完整
    for(var i in submitData){
      if (i === 'budget_budgettype' || i === 'budget_costcenter'){
        if (!(submitData[i][0].budgettype != '' && submitData[i][0].costcenter != '')){
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_AddItemDetail_alert_fill'], //'带*号的为必填项哦～'
            })
        }
      } else if (i !== 'activity_remark'){
        if (i === 'expense_invoice_number'){
          var r1 = /^[1-9]\d*$/;
          if (!r1.test(submitData[i])){
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_Newcostaccount_alert_invoice'], //'带*号的为必填项哦～'
            })
          }
        } else if (i === 'activity_businessgroup'){
          // 如果非必填的时候
          if (formData.isNeedBusinessTypeRequired && !submitData[i]){
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_AddItemDetail_alert_fill'], //'带*号的为必填项哦～'
            })
          }
        }else{
          if (!submitData[i]) {
            this.setData({
              showMsg: true,
              error: app.globalData.lang['OA_AddItemDetail_alert_fill'], //'带*号的为必填项哦～'
            })
          }
        }
        
      }
    }


    if(this.data.showMsg !== true){
      // 进入下一步，将数据进行缓存
      submitData.budget_share_month = submitData.budget_share_month.replace("-","");
      wx.setStorageSync('submitData', submitData);
      wx.navigateTo({
        url: '/pages/costaccount/accountDetail',
      })
    }

  }
})


/***/ }),

/***/ "./example/oa/pages/detail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!******************************************************************************************!*\
  !*** ./example/oa/pages/detail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/detail/addFlow',
  usingComponents: {},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textAddJoiner: app.globalData.lang['OA_joiner_text_add'],  //添加会签人
    textAddJoinerList: app.globalData.lang['OA_joiner_text_addedlist'],  //请填写添加会签人的理由
    textAddJoinerSelect: app.globalData.lang['OA_joiner_text_select'],  //选填
    btnAddConfirm: app.globalData.lang['OA_index_alert_confirm'],  //确定

    userInfo: { // 用户信息 来自搜索组件
      uid: "",
      name: "",
      avatar: ""
    },
    flowData:[], // 会签人员
    value:"", // 会签原因
    actionId:"",
    activityId:""
  },


  //搜索框自动激活

  //添加搜索结果

  //点击删除icon删除对应会签人



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { actionId, activityId} = options;
    this.setData({
      actionId,
      activityId
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let { uid, name } = that.data.userInfo;
    if (uid.length != 0 && name.length != 0)  {
      let info = { id: uid, name: name};
      let arr = that.data.flowData;

      let result = arr.some(item => {
        if (item.id == info.id) {
          return true
        }
      })

      if (!result) {
        let data = {
          "empcode": uid
        }
         // itapp02GetEmpInfo --- 暂用的地址，itapp01_getEmpInfo 这个接口暂时不对外网开放
        // 暂时兼容生产和uat
        let env = wx.getStorageSync('env');
        let urlGetEmpInfo = env === 'prod' ? 'itapp02GetEmpInfo' : 'itapp01_getEmpInfo';
        api.PostData(urlGetEmpInfo, data, function (res) {
          info.avatar = res.data.avatar;
          arr.unshift(info);
          that.setData({
            flowData: arr
          });
        })
      }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  openSearch: function(){
    wx.navigateTo({
      url: '/pages/detail/search'
    })
  },
  deleteInfo:function(e){
    let {id} = e.currentTarget.dataset;
    let arr = this.data.flowData;

    arr = arr.filter(res => {
      return res.id != id
    });

    this.setData({
      flowData: arr
    });

  },
  inputFun: function(e){
    this.setData({
      value: e.detail.value
    });
  },
  submitAddFlow:function() {
    let that = this;
    let { actionId, activityId, value } = that.data;
    let userIds = this.data.flowData;
    userIds = userIds.map(res => {
      return res.id
    });

    if (!userIds.length) {
      wx.showModal({
        title: app.globalData.lang['OA_index_alert_prompt'], //'提示'
        content: app.globalData.lang['OA_joiner_text_add_prompt'],  //'添加会签人不能为空',
        showCancel: false,
        confirmText: app.globalData.lang['OA_index_alert_confirm'],
        success(res) { }
      })
      return;
    }

    let data = {
      id: activityId,
      action: actionId,
      userIds,
      remark: value
    }

    api.PostData(`itapp02_counterSign`, data, function (res) {
      if (res.statusCode == 200 ){
        var that = this;
        let pages = getCurrentPages(); //页面栈
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          loadAgain: true //获取上上级页面传的参数
        })
        wx.navigateBack()
      }
    })
  }
})


/***/ }),

/***/ "./example/oa/pages/detail/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************!*\
  !*** ./example/oa/pages/detail?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/detail/index',
  usingComponents: {},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
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
} = __webpack_require__(/*! ../../utils/js/dataformat.js */ "./example/oa/utils/js/dataformat.js");

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
} = __webpack_require__(/*! ../../utils/js/getDetailCommon.js */ "./example/oa/utils/js/getDetailCommon.js");
const {
  isArr,
  Outputmoney,
  isNumber
} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");

const commonForm = __webpack_require__(/*! ../../utils/js/commonForm.js */ "./example/oa/utils/js/commonForm.js");
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


/***/ }),

/***/ "./example/oa/pages/detail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!*****************************************************************************************!*\
  !*** ./example/oa/pages/detail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/detail/search',
  usingComponents: {"com-search":"/pages/component/search/search"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const app = getApp();

// pages/detail/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    textAddHistory: app.globalData.lang['OA_joiner_text_name'],  //添加历史
    textAddJoiner: app.globalData.lang['OA_joiner_text_add'],  //添加会签人
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


/***/ }),

/***/ "./example/oa/pages/holdOAdetail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/holdOAdetail/addFlow',
  usingComponents: {},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: { // 用户信息 来自搜索组件
      uid: "",
      name: "",
      avatar: ""
    },
    flowData:[], // 会签人员
    value:"", // 会签原因
    actionId:"",
    activityId:""
  },


  //搜索框自动激活

  //添加搜索结果

  //点击删除icon删除对应会签人



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { actionId, activityId,syscode} = options;
    this.setData({
      actionId,
      activityId,
      syscode
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    let { uid, name } = that.data.userInfo;
    if (uid.length != 0 && name.length != 0)  {
      let info = { id: uid, name: name};
      let arr = that.data.flowData;

      let result = arr.some(item => {
        if (item.id == info.id) {
          return true
        }
      })

      if (!result) {
        let data = {
          "empcode": uid,
          'syscode':this.data.syscode
        }
        api.PostData(`itapp02_getHoldingOAUserInfoList`, data, function (res) {
          info.avatar = res.data.avatar;
          arr.unshift(info);
          that.setData({
            flowData: arr
          });
        })
      }
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  openSearch: function(){
    wx.navigateTo({
      url: '/pages/holdOAdetail/search?syscode=' + this.data.syscode
    })
  },
  deleteInfo:function(e){
    let {id} = e.currentTarget.dataset;
    let arr = this.data.flowData;

    arr = arr.filter(res => {
      return res.id != id
    });

    this.setData({
      flowData: arr
    });

  },
  inputFun: function(e){
    this.setData({
      value: e.detail.value
    });
  },
  submitAddFlow:function() {
    let that = this;
    let { actionId, activityId, value } = that.data;
    let userIds = this.data.flowData;
    userIds = userIds.map(res => {
      return res.id
    });

    if (!userIds.length) {
      wx.showModal({
        title: '提示',
        content: '添加会签人不能为空',
        showCancel: false,
        success(res) { }
      })
      return;
    }

    let data = {
      id: activityId,
      action: actionId,
      userIds,
      remark: value,
      syscode:that.data.syscode
    }

    api.PostData(`itapp02_HoldingcounterSign`, data, function (res) {
      if (res.statusCode == 200 ){
        var that = this;
        let pages = getCurrentPages(); //页面栈
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          loadAgain: true //获取上上级页面传的参数
        })
        wx.navigateBack()
      }
    })
  }
})


/***/ }),

/***/ "./example/oa/pages/holdOAdetail/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/holdOAdetail/index',
  usingComponents: {},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
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
} = __webpack_require__(/*! ../../utils/js/dataformat.js */ "./example/oa/utils/js/dataformat.js");

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
} = __webpack_require__(/*! ../../utils/js/getDetailCommon.js */ "./example/oa/utils/js/getDetailCommon.js");
const {
  isArr,
  Outputmoney
} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");

const commonForm = __webpack_require__(/*! ../../utils/js/commonForm.js */ "./example/oa/utils/js/commonForm.js");
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


/***/ }),

/***/ "./example/oa/pages/holdOAdetail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!***********************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/holdOAdetail/search',
  usingComponents: {"com-search":"/pages/component/search/search"},
  
};

// pages/detail/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      syscode:options.syscode
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


/***/ }),

/***/ "./example/oa/pages/index/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!******************************************************************************!*\
  !*** ./example/oa/pages/index?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/index/index',
  usingComponents: {},
  
};

//index.js
//获取应用实例
const config = __webpack_require__(/*! ../../config.js */ "./example/oa/config.js");
const app = getApp()

let envSwitchKeys = '';
Page({
  data: {
    env: config.env,
    firstEntry: [{
        id: 'approve',
        name: app.globalData.lang['OA_formlist_btn_my_approval'],
        url: '/pages/approve/index'
      },
      {
        id: 'commit',
        name: app.globalData.lang['OA_formlist_btn_my_submitted'],
        url: '/pages/submitted/index'
      }
    ],
    secondEntry: [{
        id: 'money',
        name: app.globalData.lang['OA_index_link_reimbursement'],
        url: '/pages/costaccount/index'
      },
      {
        id: 'travel',
        name: app.globalData.lang['OA_index_link_businesstravel'],
        url: '/pages/travelPay/index'
      },
      {
        id: 'taxNumber',
        name: app.globalData.lang['OA_index_link_taxnumber'],
        url: '/pages/taxNumber/index'
      },
      {
        id: 'approving',
        name: app.globalData.lang['OA_index_link_authorize'],
        url: '/pages/warrant/index'
      },
      {
        id: '',
        name: '',
        url: '',
        key: '@'
      },
      {
        id: '',
        name: '',
        url: '',
        key: '#'
      }
    ]

  },
  // 路由跳转
  navRouterTo(event) {
    this.callbackInfo(event);
  },

  callbackInfo(event) {
    let that = this;
    if (!app.globalData.userEmpcode) {
        wx.showToast({
          title: 'Invalid User Info',
          icon: 'none'
        })
    } else {
      let userEmpcode = wx.getStorageSync('userEmpcode');
      let identityauth2 = wx.getStorageSync('identityauth2');
      let langStr = wx.getStorageSync('langStr');
      if (userEmpcode && identityauth2 && langStr) {
        // 信息存在
        var url = event.currentTarget.dataset.url;
        if (url) {
          wx.navigateTo({
            url: event.currentTarget.dataset.url
          });
        } else {
          var key = event.currentTarget.dataset.key;
          envSwitchKeys += key;
          if (envSwitchKeys.length > 12) {
            envSwitchKeys = envSwitchKeys.slice(-12);
          }
          if (envSwitchKeys == '@@##@#@##@#@') {
            envSwitchKeys = '';
            config.update('uat');
            this.setData({
              env: config.env
            });
          }
        }
      } else {
        wx.showToast({
          title: 'Invalid User Info',
          icon: 'none'
        })
      }
    }
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: app.globalData.lang['OA_index_share_title'],
      content: app.globalData.lang['OA_index_share_content'],
      imageUrl: 'https://pic.c-ctrip.com/platform/h5/miniapp/oaoffice/oa.png',
      path: '/page/index',
      webpageUrl: '/page/index'
    }
  },

  switchToProd: function() {
    wx.showModal({
      title: '切换到生产环境?',
      success: (res) => {
        if (res.confirm) {
          // 需要更新缓存
          config.update('prod');
          this.setData({
            env: config.env
          });
          wx.removeStorageSync('defaultCostData');
          wx.removeStorageSync('defaultTravelData');
        }
      }
    })
  }
})


/***/ }),

/***/ "./example/oa/pages/search/searchBudgetList.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!***************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBudgetList.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/search/searchBudgetList',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const { isNullObj, isArr,alertFunc } = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: false,
    inputVal: '',
    budgetList:[],
    langStr: app.globalData.langStr,   //获取语言信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化当前提交的表单的默认的值
   
    wx.setNavigationBarTitle({
      title: options.searchName//页面标题为路由参数
    })

  


    // 搜索的函数
    this.setData({
      search: this.search.bind(this),
      focusFunc: this.focusFunc.bind(this),
      inputVal: options.name
    })
  },
  // 
  // 搜索的函数
  focusFunc:function(value){
    var that = this;
    return new Promise((resolve, reject) => {
      if(!value){
        that.getBudgetList('', function (data) {
          // 格式化当前的数据
          var budgetList = [];
          if (data.data.length > 0) {
            // 获取选择的公司的名称的列表        
            data.data.forEach((e, i) => {
              budgetList.push({
                'text': `${e.parentDO.value}-${e.value}`
              })
            });
            that.setData({
              budgetList: data.data
            })
          }else {
            budgetList = [];
          }
          resolve(budgetList)
        })
      }
    })
  },
  search: function (value) {
    var that = this;
    return new Promise((resolve, reject) => {
      // 当前如果是默认的时候，首先显示
      that.getBudgetList(value, function (data) {
        // 格式化当前的数据
        var budgetList = [];
        if (data.data.length > 0) {
          // 获取选择的公司的名称的列表        
          data.data.forEach((e, i) => {
            budgetList.push({
              'text': `${e.parentDO.value}-${e.value}`
            })
          });
          that.setData({
            budgetList: data.data
          })
        } else {
          budgetList = [];
        }
        resolve(budgetList)
      })
    })
  },
  // 实时请求当前的公司名称
  getBudgetList(value, callback) {
    var that = this;
    let request_body = {
      'locale': that.data.langStr,
      'budgetTypeName': value,
    }
    api.PostData('itapp02_getBudgetType', request_body, function (res) {
      // 获取当前的用户的公司名称
      if(res.data){
        callback(res.data);
      } else {
        alertFunc('oa_error_system_info');
      }
    },true)
  },
  selectResult: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    // 选择当前的元素
    this.setData({
      inputVal: e.detail.item.text,
    })
    // 进行跳转返回上一个页面
    prevPage.setData({
      budgetClass: e.detail.item.text,
      budgetCode: this.data.budgetList[e.detail.index].code,
      showMsg: false,
      error: ''
    })
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


/***/ }),

/***/ "./example/oa/pages/search/searchBusinessType.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBusinessType.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/search/searchBusinessType',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const {
  isNullObj,
  isArr,
  alertFunc
} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cancel: false,
    inputVal: '',
    businessTypeList: [],
    langStr: app.globalData.langStr, //获取语言信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 初始化当前提交的表单的默认的值

    wx.setNavigationBarTitle({
      title: options.searchName //页面标题为路由参数
    })




    // 搜索的函数
    this.setData({
      search: this.search.bind(this),
      focusFunc: this.focusFunc.bind(this),
      inputVal: options.name,
      id:options.id
    })
  },
  // 
  // 搜索的函数
  focusFunc: function(value) {
    var that = this;
    return new Promise((resolve, reject) => {
      // if (!value) {
      //   console.log(value)
        
      // }
      that.getBusinessTypeList(value, function (data) {
        // 格式化当前的数据
        var businessTypeList = [];
        if (data.length > 0) {
          // 获取选择的公司的名称的列表
          data.forEach((e, i) => {
            businessTypeList.push({
              'text': `${e.name}(${e.code})`
            })
          });
          that.setData({
            businessTypeList: data
          })
        } else {
          businessTypeList = [];
        }
        resolve(businessTypeList)
      })
    })
  },
  search: function(value) {
    var that = this;
    return new Promise((resolve, reject) => {
      // 当前如果是默认的时候，首先显示
      that.getBusinessTypeList(value, function (data) {
        // 格式化当前的数据
        var businessTypeList = [];
        if (data.length > 0) {
          // 获取选择的公司的名称的列表
          data.forEach((e, i) => {
            businessTypeList.push({
              'text': `${e.name}(${e.code})`
            })
          });
          that.setData({
            businessTypeList: data
          })
        } else {
          businessTypeList = [];
        }
        resolve(businessTypeList)
      })
    })
  },
  // 实时请求当前的公司名称
  getBusinessTypeList(value, callback) {
    var that = this;
    let request_body = {
      "start": 0,
      "length": 10,
      "rule": [
        [{
            "op": "like",
            "value": value,
            "key": "name"
          },
          {
            "op": "like",
            "value": value,
            "key": "code"
          }
        ],
        [{
          "value": "业务分组",
          "key": "category.name"
        }],
        [{
          "value": true,
          "key": "isvalid"
        }],
        [{
          "value": parseInt(that.data.id),
          "key": "bunit.id"
        }]
      ]
    }
    api.PostData('itapp02_getBusinessGroup', request_body, function(res) {
      // 获取当前的用户的公司名称s
      const {
        data:{
          data=null
        }
      } = res;
      if (data) {
        callback(data);
      } else {
        alertFunc('oa_error_system_info');
      }
    }, true)
  },
  selectResult: function(e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1]; //当前页面
    var prevPage = pages[pages.length - 2]; //上一个页面
    // 选择当前的元素
    this.setData({
      inputVal: e.detail.item.text,
    })
    // 进行跳转返回上一个页面
    prevPage.setData({
      businessType: e.detail.item.text,
      businessTypeCode: this.data.businessTypeList[e.detail.index].code,
      showMsg: false,
      error: ''
    })
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})


/***/ }),

/***/ "./example/oa/pages/search/searchCompany.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchCompany.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/search/searchCompany',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const { isNullObj, isArr, alertFunc } = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    search: () => {},
    cancelFunc: () => {},
    cancel: false,
    searchState: false,
    cancel:false,
    inputVal:'上海',
    componyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 初始化当前提交的表单的默认的值
    wx.setNavigationBarTitle({
      title: options.searchName//页面标题为路由参数
    })
    this.setData({
      search: this.search.bind(this),
      inputVal:options.name
    })
  },

  // 搜索的函数
  search: function (value) {
    var that = this;
    return new Promise((resolve, reject) => {
      // 当前如果是默认的时候，首先显示
      that.getCompanyList(value,function(data){
        // 格式化当前的数据
        var componyList = [];
        if (data.totalCount > 0 && (data.data && isArr(data.data))) {
          // 获取选择的公司的名称的列表        
          data.data.forEach((e, i) => {
            componyList.push({
              text: `${e.regional.name}-${e.name}(${e.code})`
            })
          });
          that.setData({
            componyList: data.data
          })
        } else {
          componyList = [];
        }
        resolve(componyList)
      })
    })
  },
  // 实时请求当前的公司名称
  getCompanyList(value, callback) {
    let request_body = {
      'companyName': value
    }
    api.PostData('itapp02_getCompanyList', request_body, function (res) {
      // 获取当前的用户的公司名称
      if(res.data){
        callback(res.data);
      } else {
        alertFunc('oa_error_system_info');
      }
    },true)
  },
  selectResult: function (e) {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];  //上一个页面
    // 选择当前的元素
    this.setData({
      inputVal: e.detail.item.text,
    })
    // 进行跳转返回上一个页面
    prevPage.setData({
      payCompany: e.detail.item.text,
      componyCode: this.data.componyList[e.detail.index].code,
      showMsg: false,
      error: ''
    })
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


/***/ }),

/***/ "./example/oa/pages/submitted/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!**********************************************************************************!*\
  !*** ./example/oa/pages/submitted?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/submitted/index',
  usingComponents: {},
  
};

// pages/submitted/index.js
const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js"); 
const { alertFunc,isArr} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js"); 
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    searchDetail: app.globalData.lang['OA_formlist_btn_searchdetail'],   //主题/提交人/编号搜索
    searchSearch: app.globalData.lang['OA_formlist_btn_search'],   //搜索
    searchSort: app.globalData.lang['OA_formlist_btn_priority'],   //排序
    extPromp: app.globalData.lang['OA_formlist_text_prompt'],   //无结果
    loading: app.globalData.lang['OA_loading_text'],   //加载中
    textPromptSubmit: app.globalData.lang['OA_formlist_text_prompt_submit'],   //近三个月你还没有提交过哦
    textOANumber: app.globalData.lang['OA_formlist_OA_number'],   //报销单号
    textOADate: app.globalData.lang['OA_formlist_OA_data_submit'],   //提交时间


    creatorData:[],
    inputVal: "", // 输入框内容
    inputStatus: false, // 输入框是否聚焦态
    btnValue: "取消", // 按钮文本搜索态
    sortStatus: false, // 排序点击态
    mode: false, // 排序状态 按照时间为false，按照其他方式排序为true
    sortData: [ // 排序类别汇总
      { id: "time", name: app.globalData.lang['OA_formlist_btn_orderbytime'], key: "APP_CreateDT" },
      { id: "sort", name: app.globalData.lang['OA_formlist_btn_orderbytype'], key: "APP_FormType" },
      { id: "priority", name: app.globalData.lang['OA_formlist_btn_orderbypriority'], key: "priority" },
      { id: "submitter", name: app.globalData.lang['OA_formlist_btn_orderbysubmitter'], key: "APP_SubmitUser" }
    ],
    sortId: "time", // 当前选择的排序类别
    key: "APP_CreateDT", // 排序关键字,
    creatorDataStatus: false // 数据请求状态
  },

  


  /**
   * 生命周期函数--监听页面加载
   */

 
  onLoad: function () {
    
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_formlist_btn_my_submitted'],
    })
  },
  onShow:function(){
    // 初始化当前的数据
    var that = this;
    that.getCreatorData();
  },


  
  // 获取已提交数据
  getCreatorData: function () {
    var that = this;
    var queryData = {
      "start": 0,
      "length": 20,
      "sort": "lastUpdate desc",
      "query": "creator"
    }

    if (that.data.inputVal.length) {
      queryData.search = that.data.inputVal
    }
    wx.showLoading({
      title: that.data.loading
    })

    api.PostData('itapp02_getApplyList', queryData, function (res) {
      if (res.data && (res.data.aaData && isArr(res.data.aaData))) {
        var aaData = res.data.aaData;
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
            APP_Type: aaData[d].syscode ? "HoldingOA" : "OA",
            APP_SubType: aaData[d].syscode ? aaData[d].syscode : "",
          })
        }
        // 控股的数据的获取
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
            that.setData({
              creatorData: dataArr,
              creatorDataStatus: true
            })
          } else {
            alertFunc('oa_error_system_info');
          }
        })
      }else{
        alertFunc('oa_error_system_info');
      }

    })
  },
  
  // 排序弹窗控制
  sortStatusFun: function () {
    this.setData({
      sortStatus: !this.data.sortStatus
    })
  },

  //  关闭排序弹窗
  closeSortStatus: function () {
    this.setData({
      sortStatus: false
    })
  },

  // 改变排序类别
  changeSort: function (e) {
    let { id, key } = e.currentTarget.dataset;
    this.setData({
      sortId: id,
      mode: id == "time" ? false : true,
      sortStatus: false,
      key
    });
    let tempCreatorData = this.data.creatorData;
    this.sortFun(tempCreatorData, key);
    this.setData({
      creatorData: tempCreatorData
    });
  },

  // 排序函数
  sortFun: function (data, key) {
    if (key == 'APP_SubmitUser') { // 按照人名排序
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
  inputFun: function (e) {
    let { value } = e.detail;
    this.setData({
      inputVal: value
    });
    if (value.length != 0) {
      this.setData({
        btnValue: "搜索"
      });
    } else {
      this.setData({
        btnValue: "取消"
      });
    }
  },

  // 搜索框聚焦
  focusFun: function () {
    this.setData({
      inputStatus: true
    });
  },

  // 清空搜索框
  clearValue: function () {
    this.setData({
      inputVal: "",
      btnValue: "取消"
    });
  },

  // 搜索
  search: function () {
    let that = this;
    let { btnValue, inputVal } = that.data;

    if (btnValue == "搜索") {
      if (inputVal.length) {
        that.setData({
          btnValue: "取消"
        });
      } else {
        return;
      }
    }

    if (btnValue == "取消") {
      that.setData({
        inputVal: "",
        inputStatus: false
      });
    }

    that.getCreatorData();

  },
  goDetail(e) {
    let currentId = e.currentTarget.dataset.id;
    let formId = e.currentTarget.dataset.formid;
    let title = e.currentTarget.dataset.title;
    let appSubType = e.currentTarget.dataset.appSubType;
    let appType = e.currentTarget.dataset.appType;
    // 清除缓存
    wx.removeStorageSync('listData')
    // 进行缓存
    var StorageData = this.data.creatorData;
    wx.setStorageSync("listData", StorageData)
    if (appType == 'HoldingOA') {
      wx.navigateTo({
        url: `/pages/holdOAdetail/index?id=${currentId}&formId=${formId}&title=${title}&appSubType=${appSubType}`,
      });
    } else {
      wx.navigateTo({
        url: `/pages/detail/index?id=${currentId}&formId=${formId}&title=${title}`,
      });
    }


    
  },




  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


/***/ }),

/***/ "./example/oa/pages/taxNumber/index.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!**********************************************************************************!*\
  !*** ./example/oa/pages/taxNumber?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/taxNumber/index',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
};

//logs.js
const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const { isNullObj, isArr,alertFunc} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
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


/***/ }),

/***/ "./example/oa/pages/travelPay/index.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!**********************************************************************************!*\
  !*** ./example/oa/pages/travelPay?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/travelPay/index',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const {
  alertFunc,
  appendZero
} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
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


/***/ }),

/***/ "./example/oa/pages/travelPay/travelDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!**************************************************************************************************!*\
  !*** ./example/oa/pages/travelPay/travelDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \**************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/travelPay/travelDetail',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const {
  appendZero
} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js");
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


/***/ }),

/***/ "./example/oa/pages/warrant/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!********************************************************************************!*\
  !*** ./example/oa/pages/warrant?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/warrant/index',
  usingComponents: {},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js"); 
const {isArr} = __webpack_require__(/*! ../../utils/js/util.js */ "./example/oa/utils/js/util.js"); 
const app = getApp();
const eventChannel = __webpack_require__(/*! ../../utils/js/eventChannel.js */ "./example/oa/utils/js/eventChannel.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    titeAccredit: app.globalData.lang['eform_updateAccredit_view_title'],  //审批授权
    btnAddAccredit: app.globalData.lang['OA_authUpdateAndAddCtrl_text_add'],  //新增授权
    textAddAgent: app.globalData.lang['OA_authupdateAndAdd_text_agent'],  //代理人
    textStartDate: app.globalData.lang['OA_authlist_text_startdate'],  //开始时间
    textEndDate: app.globalData.lang['OA_authupdateAndAdd_text_enddate'],  //结束时间
    btnUpdateAgent: app.globalData.lang['OA_authUpdateAndAddCtrl_text_update'],  //修改授权
    btnEndAgent: app.globalData.lang['OA_authUpdateAndAddCtrl_text_end'],  //结束授权
    btnDelAgent: app.globalData.lang['OA_authupdateAndAdd_text_delete'],  //删除授权
    loading: app.globalData.lang['OA_loading_text'],   //加载中
    textNotStarted: app.globalData.lang['OA_authListCtrl_status_NotStarted'],   //未开始
    textOngoing: app.globalData.lang['OA_authListCtrl_status_ongoing'],   //进行中
    textCompleted: app.globalData.lang['OA_authListCtrl_status_completed'],   //已结束
    textAlertCounts: app.globalData.lang['OA_authlist_alert_counts'], 
    textAlertPrompt: app.globalData.lang['OA_index_alert_prompt'],      //提示
    textAlertConfirmdelete: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_confirmdelete'],    //确认删除该授权？
    textAlertConfirmend: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_confirmend'],    //确认结束该授权？

    warrantList: [], // 列表数据
    warrantListStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['eform_updateAccredit_view_title'],
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAgentList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 获取授权列表
  getAgentList: function(e) {
    let that = this;
    let now = new Date().getTime();
    wx.showLoading({
      title: that.data.loading
    })
    api.PostData('itapp02_getAgentList', {}, function (res) {
      let result = [];
      
      if (res.data && isArr(res.data)){
        let resData = res.data;
        let key = 'status';
        let doData = [], doingData = [], doneData = [];
        // 按照是否完成分三个数组中
        resData.map(res => {
          let start = new Date(res.beginDate).getTime();
          let end = new Date(res.endDate).getTime();
          if (res.enabled === 'Y') {
            if (now < start) {
              res[key] = 'do';
              doData.push(res);
            } else if (start <= now && end >= now) {
              res[key] = 'doing';
              doingData.push(res);
            } else if (end <= now) {
              res[key] = 'done';
              doneData.push(res);
            }
          } else {
            res[key] = 'done';
            doneData.push(res);
          }
        })
        // 数组内排序
        that.sortFun(doingData);
        that.sortFun(doData);
        that.sortFun(doneData);
        result = [...doingData, ...doData, ...doneData];
      }
      that.setData({
        warrantList: result,
        warrantListStatus: true
      })
      wx.hideLoading()
    })
  },
  // 排序函数
  sortFun(res) {
    res.sort(function (a, b) {
      let time = new Date(a.beginDate).getTime() - new Date(b.beginDate).getTime();
      if (time == 0) {
        time = new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      return time;
    });
  },
  // 跳转至授权修改页
  navWarrantTo: function (e) {
    let {status, id} = e.currentTarget.dataset;
    id = parseInt(id, 10);
    let item = this.data.warrantList.filter(res => res.id == id)[0];
    if (status === 'new' || status === 'update') {
      let data = status === 'new' ? '' : item;
      wx.setStorageSync('acceptDataFromOpenerPage', {data});
      wx.navigateTo({
        url: '/pages/warrant/warrant',
        success: function (res) {
          // eventChannel.emit('acceptDataFromOpenerPage', { data })
        }
      })      
    } else if (status == 'close' || status == 'delete') {
      this.closeWarrant(id, status, item);
    }

  },
  // 删除、结束授权弹窗
  closeWarrant: function (id, status, item) {
    let that = this;
    wx.showModal({
      title: that.data.textAlertPrompt,
      content: `${status == 'close' ? that.data.textAlertConfirmend : that.data.textAlertConfirmdelete}`,
      success(res) {
        if (res.confirm) {
          if (status == 'close'){
            let rule = {
              beginDate: item.beginDate,
              endDate: item.endDate,
              agent: item.agent.account,
              creator: "",
              enabled: "N",
              andRules: []
            }
            api.PostData('itapp02_updateAgent_new', { id, rule }, function (res) {
                that.getAgentList();
            })
          } else {
            api.PostData('itapp02_deleteAgent', { id }, function (res) {
                that.getAgentList();
            })
          }
          
        } else if (res.cancel) {
          // console.log('用户点击取消')
        }
      }
    })
  }
})


/***/ }),

/***/ "./example/oa/pages/warrant/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!******************************************************************************************!*\
  !*** ./example/oa/pages/warrant/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/warrant/search',
  usingComponents: {"com-search":"/pages/component/search/search"},
  
};

// pages/warrant/search.js
const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 多语言变量
    titeSelectagent: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_selectagent'],  //选择代理人
    titeAgentHistory: app.globalData.lang['OA_authupdateAndAdd_text_authorize_history'],  //代理授权历史

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_authUpdateAndAddCtrl_alert_selectagent'],  //选择代理人
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


/***/ }),

/***/ "./example/oa/pages/warrant/warrant.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/warrant/warrant.js?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentPageConfig = 
{
  pagePath: 'pages/warrant/warrant',
  usingComponents: {},
  
};

const api = __webpack_require__(/*! ../../utils/js/api.js */ "./example/oa/utils/js/api.js");
const app = getApp();
const eventChannel = __webpack_require__(/*! ../../utils/js/eventChannel.js */ "./example/oa/utils/js/eventChannel.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {

    // 多语言变量
    textAddAgent: app.globalData.lang['OA_authupdateAndAdd_text_agent'],  //代理人
    textStartDate: app.globalData.lang['OA_authlist_text_startdate'],  //开始时间
    textEndDate: app.globalData.lang['OA_authupdateAndAdd_text_enddate'],  //结束时间
    textauThorize: app.globalData.lang['OA_authupdateAndAdd_text_authorize'],  //授权

    id: null, // 待修改数据id
    fullname:"", // 用户名 来自前一个页面
    rule: { // 修改请求参数
      beginDate: "",
      endDate: "",
      agent: "",
      creator: "",
      enabled: "Y",
      andRules: []
    },
    userInfo:{ // 用户信息 来自搜索组件
      uid:"",
      name:""
    },
    langStr:app.globalData.langStr
  },
  acceptDataFromOpenerPage: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let result = wx.getStorageSync('acceptDataFromOpenerPage').data;
    // this.acceptDataFromOpenerPage = eventChannel.on('acceptDataFromOpenerPage', (data) => {
      // let result = data.data;
      if (result){
        this.setData({
          id: result.id,
          'fullname': result.agent.fullname,
          'rule.beginDate': result.beginDate,
          'rule.endDate': result.endDate,
          'rule.agent': result.agent.account
        })
      }
    // })

    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['OA_authUpdateAndAddCtrl_text_add'],
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let { uid, name } = this.data.userInfo;
    if (uid.length != 0 && name.length != 0){ 
      this.setData({
        'rule.agent': uid,
        'fullname': name
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // eventChannel.off('acceptDataFromOpenerPage', this.acceptDataFromOpenerPage);
    //设置当前页面标题
    wx.setNavigationBarTitle({
      title: app.globalData.lang['eform_updateAccredit_view_title'],
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 提交时间
  navRouterBack: function () {
    
    let { id, rule } = this.data;

    // 内容是否为空判断
    if (!rule.agent || !rule.beginDate || !rule.endDate){
      wx.showModal({
        title: '提示',
        content: '所有内容均为必填项',
        showCancel: false,
        success(res) {}
      })
      return ;
    }

    // 结束时间不能早于开始时间判断
    let start = new Date(rule.beginDate).getTime();
    let end = new Date(rule.endDate).getTime();
    if (start > end) {
      wx.showModal({
        title: '提示',
        content: '结束时间不能早于开始时间',
        showCancel: false,
        success(res) {}
      })
      return;
    }

    // 授权提醒
    wx.showLoading({
      title: app.globalData.lang['eform_AccreditListCtrl_item_status'],
    })

    // 根据id判断新增或者修改
    if (!!id) {
      api.PostData('itapp02_updateAgent_new', { id, rule }, function (res) {
        wx.navigateBack({
          url: '/pages/warrant/index'
        });
      })
    } else {
      api.PostData('itapp02_addAgentUser_new', { ...rule }, function (res) {
        wx.navigateBack({
          url: '/pages/warrant/index'
        });
      })
    }
  },
  // 修改开始时间
  bindBeginDateChange: function (e) {
    let date = e.detail.value
    this.setData({
      'rule.beginDate' : date
    })
  },
  // 修改结束时间
  bindEndDateChange: function (e) {
    let date = e.detail.value
    this.setData({
      'rule.endDate': date
    })
  },
  // 查询个人信息
  bindSearchAgent(e) {
    wx.navigateTo({
      url: '/pages/warrant/search'
    })
  },
})


/***/ }),

/***/ "./example/oa/utils/js/api.js":
/*!************************************!*\
  !*** ./example/oa/utils/js/api.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const config = __webpack_require__(/*! ../../config.js */ "./example/oa/config.js");
const {errFunTips} = __webpack_require__(/*! ../../utils/js/util */ "./example/oa/utils/js/util.js");
let hasLoading = false; // 判断如果已经在loading的状态不loading

var api = {
  // 接口鉴权的字段信息的获取；
  getIdentityAuth2(callback) {
    let identityauth2 = '';
    let wrapCallback = function () {
      if (identityauth2) {
        wx.setStorageSync("identityauth2", JSON.stringify(identityauth2));
      } else {
        identityauth2 = wx.getStorageSync("identityauth2");
      }
      callback && callback(identityauth2);
    };
    // 微信开发者工具的时候才进行mock数据
    if (config.platform == 'devtools') {
      // mock数据
      identityauth2 = JSON.stringify(
        { "Str_TimeStamp": "2020-05-13 10:16:28", "Str_Signature": "24e6232729a062f6c8c1707ffeae0106", "SessionID": "dev:5e489fd5071146309806c1c54d93a093kTDGGzg8jYjodoPCsmH7mURn0kGfJYlI" }
        );
      wrapCallback();
    } else {
      // 调取用户信息的接口数据
      wx.getUserInfo({
        success: function (res) {
          // 如果成功了，通过res的返回值去判断
          if (res.userInfo && res.Str_Signature && res.SessionID && res.Str_TimeStamp) {
            // 可以拿到当前的用户的员工信息以及鉴权信息
            identityauth2 = JSON.stringify({
              Str_Signature: res.Str_Signature,
              SessionID: res.SessionID,
              Str_TimeStamp: res.Str_TimeStamp
            });
          }
          wrapCallback();
        },
        fail: function () {
          wrapCallback();
        }
      });
    }
  },

  // 数据请求的封装
  PostData(url, data, callback, isShowLoading,complateCall) {
    // 是否需要发送loading，loading的拦截判断
    if (!isShowLoading && !hasLoading) {
      hasLoading = true;
      wx.showLoading({
        title: wx.getStorageSync('lang')['OA_loading_text'],
        icon: 'none'
      })
    }
    this.getIdentityAuth2(function (identityauth2) {
      wx.request({
        url: config.apiHost + url,
        data: {
          'access_token': config.token,
          'request_body': data,
        },
        method: 'POST', // 
        header: {
          "userEmpcode": wx.getStorageSync('userEmpcode'),
          "userlangsetting": wx.getStorageSync('langStr'),
          "identityauth2": identityauth2
        }, // 设置请求的 header
        success: function (res) {
          // 关闭loading
          if (!isShowLoading) {
            hasLoading = false;
            wx.hideLoading();
          }
          // 数据成功的
          if (res.statusCode === 200 || res.statusCode === 201) {
            callback(res); // code状态为200的时候进行数据的处理
          } else {
            // 提示报错
            if (!isShowLoading) {
              errFunTips(res);
            }
          }
        },
        fail: function (res) {
          // 关闭loading
          if (!isShowLoading) {
            hasLoading = false;
            wx.hideLoading();
          }
          // 提示报错
          errFunTips(res);
        },
        complete: function () {
          complateCall && complateCall();
        }
      })
    });
  }
}

module.exports = api;

/***/ }),

/***/ "./example/oa/utils/js/commonForm.js":
/*!*******************************************!*\
  !*** ./example/oa/utils/js/commonForm.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const api = __webpack_require__(/*! ./api.js */ "./example/oa/utils/js/api.js");
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

/***/ }),

/***/ "./example/oa/utils/js/dataformat.js":
/*!*******************************************!*\
  !*** ./example/oa/utils/js/dataformat.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const {
  contains,
  isArr,
  isNull,
  Outputmoney,
  isJSON
} = __webpack_require__(/*! ./util.js */ "./example/oa/utils/js/util.js");
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

/***/ }),

/***/ "./example/oa/utils/js/eventChannel.js":
/*!*********************************************!*\
  !*** ./example/oa/utils/js/eventChannel.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

let eventChannel = {};

let eventMap = {};
let eventQueue = [];

eventChannel.on = function (eventName, fn) {
  if (!eventMap.hasOwnProperty(eventName)) {
    eventMap[eventName] = [fn];
    let events = [];
    eventQueue = eventQueue.filter((event) => {
      if (event.eventName == eventName) {
        events.push(event);
        return false;
      }
      return true;
    });
    events.forEach((event) => {
      eventChannel.emit(event.eventName, ...event.args);
    });
  } else {
    eventMap[eventName].push(fn);
  }
  return fn;
};

eventChannel.off = function (eventName, fn) {
  if (!fn) {
    delete eventMap[eventName];
  } else {
    if (eventMap.hasOwnProperty(eventName)) {
      eventMap[eventName] = eventMap[eventName].filter((item) => {
        return item !== fn;
      });
      if (!eventMap[eventName].length) {
        delete eventMap[eventName];
      }
    }
  }
};

eventChannel.emit = function (eventName, ...args) {
  if (eventMap.hasOwnProperty(eventName)) {
    eventMap[eventName].forEach((fn) => {
      fn(...args);
    });
  } else {
    eventQueue.push({
      eventName,
      args
    });
  }
};

module.exports = eventChannel;

/***/ }),

/***/ "./example/oa/utils/js/getDetailCommon.js":
/*!************************************************!*\
  !*** ./example/oa/utils/js/getDetailCommon.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const api = __webpack_require__(/*! ./api.js */ "./example/oa/utils/js/api.js");
const app = getApp();
const {
  getValue,
  getArraysbysearchStr,
  getProcessors,
  showProgressButton,
  getpreUser
} = __webpack_require__(/*! ./dataformat.js */ "./example/oa/utils/js/dataformat.js");

const {
  isArr,
  Outputmoney,
  getImgSrc,
  getMimeType
} = __webpack_require__(/*! ./util.js */ "./example/oa/utils/js/util.js");

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

/***/ }),

/***/ "./example/oa/utils/js/lang.js":
/*!*************************************!*\
  !*** ./example/oa/utils/js/lang.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const lang_ZH = {
  "OA_index_share_title":'OA小程序',
  "OA_index_share_content": '点击进入oa小程序',

  "OA_Form_Detail_Residue":'残值',
  "OA_no_message": "数据为空",
  "OA_loading_text": "加载中...",
  "OA_index_link_waitapproval": "待审批",
  "OA_index_link_submitted": "已提交",
  "OA_index_link_reimbursement": "费用报销",
  "OA_index_link_businesstravel": "差旅报销",
  "OA_index_link_budget": "预算统计",
  "OA_index_link_authorize": "授权",
  "OA_index_link_taxnumber": "财务税号",

  "OA_index_alert_authorization": "您没有权限查看该报表",
  "OA_index_alert_network": "网络异常",
  "OA_index_alert_data": "数据异常",
  "OA_index_alert_confirm": "确定",
  "OA_index_alert_prompt": "提示",


  "OA_notice_title_my_taxnumber": "我的财务税号",
  "OA_notice_title_taxnumber": "财务税号",
  "OA_notice_text_company": "公司：",
  "OA_notice_text_taxnumber": "税号：",
  "OA_notice_text_bankaccount": "银行帐号：",
  "OA_notice_text_bankname": "银行名称：",
  "OA_notice_text_telephone": "电话：",
  "OA_notice_text_address": "地址：",

  "OA_formlist_btn_my_approval": "我审批的",
  "OA_formlist_btn_my_submitted": "我提交的",
  "OA_formlist_btn_waitapproval": "待审批",
  "OA_formlist_btn_approved": "已审批",
  "OA_formlist_btn_submitted": "已提交",
  "OA_formlist_btn_orderbytime": "时间排序",
  "OA_formlist_btn_orderbytype": "类别排序",
  "OA_formlist_btn_orderbysubmitter": "提交人排序",
  "OA_formlist_btn_orderbypriority": "优先级排序",
  "OA_formlist_btn_priority": "排序",
  "OA_formlist_btn_cancel": "取消",
  "OA_formlist_btn_search": "搜索",
  "OA_formlist_btn_approving": "审",
  "OA_formlist_text_counts": "最多显示50条",
  "OA_formlist_OA_number": "报销单号",
  "OA_formlist_OA_data_submit": "提交时间",


  "OA_formlist_text_prompt_submit": "近三个月你还没有提交过哦",
  "OA_formlist_text_prompt": "近3个月没有您的审批单哟",
  "OA_formlist_text_noapproval": "没有待审批申请",
  "OA_oaFormList_alert_network": "网络异常",
  "OA_oaFormList_alert_prompt": "提示",
  "OA_oaFormList_alert_confirm": "确定",
  "OA_oaFormList_alert_effect": "生效",
  "OA_oaFormList_alert_refused": "拒绝",
  "OA_formlist_btn_searchdetail": "主题/提交人/编号搜索",
  "OA_formlist_btn_refresh": "下拉刷新...",


  "OA_costaccount_text_fill": "填写费用报销单",
  "OA_costaccount_text_basic_information": "基础信息",
  "OA_costaccount_text_account_information": "账号信息",
  "OA_costaccount_text_travel_information": "出差信息",
  "OA_costaccount_text_formtype": "表单类型",
  "OA_costaccount_text_unit": "机构",
  "OA_costaccount_text_budgettype": "预算类型",
  "OA_costaccount_text_costcenter": "费用中心",
  "OA_costaccount_text_paymentcompany": "付款公司",
  "OA_costaccount_text_payee": "收款人",
  "OA_costaccount_text_receiptaccount": "收款帐号",
  "OA_costaccount_text_receiptaccount_tip": "请输入收款银行账号",
  "OA_costaccount_text_bankname": "开户行名称",
  "OA_costaccount_text_bankname_tip": "请输入开户行名称",
  "OA_costaccount_text_cityofbank": "开户行所在城市",
  "OA_costaccount_text_cityofbank_tip": "请输入开户行所在城市",
  "OA_costaccount_text_number_invoices": "请填写发票张数",
  "OA_costaccount_text_numberofinvoice": "发票张数",
  "OA_costaccount_text_Apportionmentmonth": "分摊月份",
  "OA_costaccount_text_budgetclassification": "预算分类",
  "OA_costaccount_text_remarks": "备注",
  "OA_costaccount_text_next": "下一步",
  "OA_costaccount_text_prompt": "手机端只支持单费用中心，单预算分类，不跨月的费用报销单",
  "OA_costaccount_text_limited": "限制最多800个字符",

  "OA_Newcostaccount_alert_fill": "注意带 * 为必填项！",
  "OA_Newcostaccount_alert_invoice": "发票张数必须是正整数！",
  "OA_Newcostaccount_text_formtype": "费用报销单",
  "OA_Newcostaccount_text_costcenterorbudgettype": "单费用中心/单预算分类",
  "OA_Newcostaccount_alert_network": "网络异常",
  "OA_Newcostaccount_alert_prompt": "提示",
  "OA_Newcostaccount_alert_confirm": "确定",
  "OA_additemdetail_text_itemdetail": "项目明细",
  "OA_recipient_item_detail": "收款单位账户信息",
  "OA_itemDetail_text_recipientAccountNumber": "收款单位（人）账号",


  "OA_additemdetail_btn_add": "添加",
  "OA_additemdetail_text_itemdetailtotalamount": "项目总金额",
  "OA_additemdetail_text_item": "项目",
  "OA_additemdetail_text_date": "日期",
  "OA_additemdetail_text_amount": "金额",
  "OA_additemdetail_text_explanation": "说明",
  "OA_additemdetail_content_prompt": "暂没有项目明细，请先添加",
  "OA_additemdetail_btn_back": "上一步",
  "OA_additemdetail_btn_submit": "提交",
  "OA_additemdetail_btn_submitting": "提交中...",
  "OA_AddItemDetail_alert_fill": "注意带 * 为必填项！",
  "OA_AddItemDetail_alert_AddPrompt": "提示",
  "OA_AddItemDetail_alert_cancel": "取消",
  "OA_AddItemDetail_alert_confirm": "确认",
  "OA_AddItemDetail_alert_addsucessful": "添加成功",
  "OA_AddItemDetail_alert_network": "网络异常",
  "OA_AddItemDetail_alert_ConfirmSubmit": "确认提交",
  "OA_AddItemDetail_alert_ConfirmSubmit_Error": "提交失败",
  "OA_AddItemDetail_alert_FormatofAmount": "您填写的金额格式不正确！",
  "OA_AddItemDetail_alert_Confirmdelete": "确认删除？",
  "OA_AddItemDetail_alert_Prompt": "提示",


  "OA_itemDetailModal_text_itemdetail": "项目明细",
  "OA_itemDetailModal_text_item": "项目",
  "OA_itemDetailModal_text_startdate": "开始日期",
  "OA_itemDetailModal_text_amount": "金额",
  "OA_itemDetailModal_text_explanation": "说明",
  "OA_itemDetailModal_btn_add": "添加",
  "OA_itemDetailModal_btn_select": "请选择",
  "OA_itemDetailModal_btn_choose": "请选择",
  "OA_itemDetailModal_text_limited": "限制最多800字",


  "OA_travelaccount_text_prompt": "手机端只支持单费用中心，单预算分类，不跨月的报销单",
  "OA_travelaccount_text_select": "请选择",
  "OA_travelaccount_text_formtype": "表单类型",
  "OA_travelaccount_text_unit": "机构",
  "OA_travelaccount_text_budgettype": "预算类型",
  "OA_travelaccount_text_costcenter": "费用中心",
  "OA_travelaccount_text_paymentcompany": "付款公司",
  "OA_travelaccount_text_startdate": "出差开始时间",
  "OA_travelaccount_text_enddate": "出差结束时间",
  "OA_travelaccount_text_address": "出差地点",
  "OA_travelaccount_text_address_place": "请输入出差地点",
  "OA_travelaccount_text_reason": "事由",
  "OA_travelaccount_text_payee": "收款人",
  "OA_travelaccount_text_payee_name": "请输入收款人姓名",
  "OA_travelaccount_text_receiptaccount": "收款帐号",
  "OA_travelaccount_text_bankname": "开户行名称",
  "OA_travelaccount_text_cityofbank": "开户行所在城市",
  "OA_travelaccount_text_numberofinvoice": "发票张数",
  "OA_travelaccount_text_Apportionmentmonth": "分摊月份",
  "OA_travelaccount_text_budgetclassification": "预算分类",
  "OA_travelaccount_text_select_budgettype": "预算类型查询",
  "OA_travelaccount_text_company_inquiry": "公司查询",
  "OA_travelaccount_text_remarks": "备注",
  "OA_travelaccount_text_next": "下一步",


  "OA_travelItem_text_itemdetail": "项目明细",
  "OA_travelItem_btn_add": "添加",
  "OA_travelItem_text_ItemdetailtotalAmount": "项目明细总金额",
  "OA_travelItem_text_item": "项目",
  "OA_travelItem_text_amount": "金额",
  "OA_travelItem_text_explanation": "说明",
  "OA_travelItem_text_prompt": "暂没有项目明细，请先添加",
  "OA_travelItem_btn_back": "上一步",
  "OA_travelItem_btn_submit": "提交",
  "OA_travelitemDetailModal_text_itemdetail": "项目明细",
  "OA_travelitemDetailModal_text_item": "项目",
  "OA_travelitemDetailModal_text_choose": "请选择",
  "OA_travelitemDetailModal_text_Amount": "金额",
  "OA_travelitemDetailModal_text_explanation": "说明",
  "OA_travelitemDetailModal_btn_add": "添加",
  "OA_travelaccount_text_fill": "差旅报销单",
  "OA_NewtravelAccount_alert_date": "开始时间必须小于结束时间！",
  "OA_NewtravelAccount_alert_warning": "警告",
  "OA_NewtravelAccount_alert_fill": "注意带 * 为必填项！",
  "OA_NewtravelAccount_text_formtype": "差旅报销单",
  "OA_NewtravelAccount_text_costcenterorbudgettype": "单费用中心/单预算分类",
  "OA_NewtravelAccount_alert_network": "网络异常",
  "OA_NewtravelAccount_alert_prompt": "提示",
  "OA_NewtravelAccount_alert_confirm": "确定",
  "OA_NewtravelItem_alert_added": "你已经添加过该项目",
  "OA_NewtravelItem_alert_itemdetail": "请添加明细",
  "OA_NewtravelItem_alert_prompt": "提示",
  "OA_NewtravelItem_alert_cancel": "取消",
  "OA_NewtravelItem_alert_Confirm": "确认",
  "OA_NewtravelItem_alert_AddedSuccessfully": "添加成功",
  "OA_NewtravelItem_alert_network": "网络异常",
  "OA_NewtravelItem_list_flightandcar": "机票/车船票",
  "OA_NewtravelItem_list_airconstructionfee": "机场建设费",
  "OA_NewtravelItem_list_taxi": "出租车/市内车费",
  "OA_NewtravelItem_list_hotel": "宾馆",
  "OA_NewtravelItem_list_Hospitality": "招待费",
  "OA_NewtravelItem_list_correspondence": "通讯费",
  "OA_NewtravelItem_list_Conference": "会务费",
  "OA_NewtravelItem_list_Miscellaneous": "杂费",
  "OA_NewtravelItem_list_Gift": "礼品",
  "OA_NewtravelItem_list_others": "其他",
  "OA_NewtravelItem_list_formatofAmount": "您填写的金额格式不正确！",
  "OA_travelaccount_text_choose": "请选择",
  "OA_travelaccount_text_Limited": "限制最多800字",
  "OA_NewtravelAccount_alert_formatofinvoice": "发票张数必须是正整数！",
  "OA_NewtravelItem_open": "展开",
  "OA_NewtravelItem_close": "收起",


  "OA_authListCtrl_status_NotStarted": "未开始",
  "OA_authListCtrl_status_ongoing": "进行中",
  "OA_authListCtrl_status_completed": "已结束",
  "OA_authListCtrl_btn_Enabled": "已启用",
  "OA_authListCtrl_btn_Disabled": "未启用",
  "OA_authlist_text_authorization": "授权",
  "OA_authlist_alert_refreash": "下拉刷新…",
  "OA_authlist_text_startdate": "开始时间",
  "OA_authlist_text_enddate": "结束时间",
  "OA_authlist_alert_counts": "您近三个月没有授权记录哟~",
  "OA_authupdateAndAdd_text_startdate": "开始日期",
  "OA_authupdateAndAdd_text_choose": "请选择",
  "OA_authupdateAndAdd_text_enddate": "结束时间",
  "OA_authupdateAndAdd_text_agent": "代理人",
  "OA_authupdateAndAdd_text_delete": "删除",
  "OA_authupdateAndAdd_text_update": "更新",
  "OA_authupdateAndAdd_text_authorize": "授权",
  "OA_authupdateAndAdd_text_authorize_history": "代理授权历史",
  "OA_authupdateAndAdd_text_search": "姓名/首字母/拼音/域帐号",
  "OA_authUpdateAndAddCtrl_text_add": "新增授权",
  "OA_authUpdateAndAddCtrl_text_update": "修改授权",
  "OA_authUpdateAndAddCtrl_text_end": "结束授权",
  "OA_authUpdateAndAddCtrl_alert_prompt": "提示",
  "OA_authUpdateAndAddCtrl_alert_confirm": "确定",
  "OA_authUpdateAndAddCtrl_alert_enable": "启用",
  "OA_authUpdateAndAddCtrl_alert_updatefailed": "更新失败",
  "OA_authUpdateAndAddCtrl_alert_deletefailed": "删除失败",
  "OA_authUpdateAndAddCtrl_alert_warning": "警告",
  "OA_authUpdateAndAddCtrl_alert_confirmdelete": "确认删除该授权？",
  "OA_authUpdateAndAddCtrl_alert_confirmend": "确认结束该授权？",
  "OA_authUpdateAndAddCtrl_alert_cancel": "取消",
  "OA_authUpdateAndAddCtrl_alert_confirm": "确认",
  "OA_authUpdateAndAddCtrl_alert_selectstartdate": "请选择开始时间",
  "OA_authUpdateAndAddCtrl_alert_selectenddate": "请选择结束时间",
  "OA_authUpdateAndAddCtrl_alert_selectagent": "请选择代理人",
  "OA_authUpdateAndAddCtrl_alert_authorizefailed": "授权失败",
  "OA_authupdateAndAdd_text_choose": "请选择",


  "OA_addpointsapplydetail_text_formdetail": "表单详情",
  "OA_addpointsapplydetail_alert_refreash": "下拉刷新…",
  "OA_addpointsapplydetail_text_operator": "处理人",
  "OA_addpointsapplydetail_text_applynumber": "申请单号",
  "OA_addpointsapplydetail_text_applytime": "申请时间",
  "OA_addpointsapplydetail_text_applystatus": "申请状态",
  "OA_addpointsapplydetail_text_approving": "审",
  "OA_addpointsapplydetail_text_Expectedapprovers": "预计审批人",
  "OA_addpointsapplydetail_text_Costcenter": "费用中心",
  "OA_addpointsapplydetail_text_itemname": "项目名称",
  "OA_addpointsapplydetail_text_itemnumber": "项目编号",
  "OA_addpointsapplydetail_text_totalpoints": "总积分",
  "OA_addpointsapplydetail_text_amount": "总成本",
  "OA_addpointsapplydetail_text_remark": "备注",
  "OA_addpointsapplydetail_text_attachment": "附件",
  "OA_addpointsapplydetail_text_workflowlog": "流转日志",
  "OA_AddPointsApplyDetailCtrl_text_explanation": "可输入理由",
  "OA_AddPointsApplyDetailCtrl_text_approval comments": "请填写审批意见",
  "OA_AddPointsApplyDetailCtrl_text_approval explanationRequired": "可输入理由（必填）",
  "OA_AddPointsApplyDetailCtrl_text_refuse": "拒绝",
  "OA_AddPointsApplyDetailCtrl_text_ReasontoRefuse": "请填写拒绝理由",
  "OA_AddPointsApplyDetailCtrl_text_NoMoreForms": "您本次的审批已完成",

  "OA_businesscardprintingdetail_text_companyChinese": "公司(CN)",
  "OA_businesscardprintingdetail_text_companyEnglish": "公司(EN)",
  "OA_businesscardprintingdetail_text_nameChinese": "姓名(CN)",
  "OA_businesscardprintingdetail_text_nameEnglish": "姓名(EN)",
  "OA_businesscardprintingdetail_text_positionChinese": "职位(CN)",
  "OA_businesscardprintingdetail_text_positionEnglish": "职位(EN)",
  "OA_businesscardprintingdetail_text_departmentChinese": "部门(CN)",
  "OA_businesscardprintingdetail_text_departmentEnglish": "部门(EN)",
  "OA_businesscardprintingdetail_text_addressChinese": "地址(CN)",
  "OA_businesscardprintingdetail_text_addressEnglish": "地址(EN)",
  "OA_businesscardprintingdetail_text_officetelphone": "办公电话",
  "OA_businesscardprintingdetail_text_officefaxnumber": "传真电话",
  "OA_businesscardprintingdetail_text_mobilephone": "手机寻呼",
  "OA_businesscardprintingdetail_text_email": "电子邮件",
  "OA_businesscardprintingdetail_text_wechatID": "微信号",
  "OA_businesscardprintingdetail_text_numberofboxes": "申印盒数",

  "OA_chapterBusinessdetail_text_chapter_company": "用章公司",
  "OA_chapterBusinessdetail_text_chapter_department": "用章部门",
  "OA_chapterBusinessdetail_text_chapter_reason": "用章理由",
  "OA_ChapterInvestmentdetail_text_filetype": "文件类型",
  "OA_ChapterInvestmentdetail_text_reason": "事由",
  "OA_ChapterSealEngravingdetai_text_stamper_usefor": "印章用途",
  "OA_ChapterSealEngravingdetai_text_stamper_unit": "印章单位",
  "OA_ChapterSealEngravingdetai_text_stamper_content": "印章内容",
  "OA_ChapterSealEngravingdetai_text_remark": "备注",
  "OA_contractpaymentdetail_text_paymentpayee": "收款单位",
  "OA_contractpaymentdetail_text_contractnumber": "合同编号",
  "OA_contractpaymentdetail_text_totalcontractamount": "合同总价",
  "OA_contractpaymentdetail_text_unsure": "不定",
  "OA_contractpaymentdetail_text_amountpaid": "已付金额",
  "OA_contractpaymentdetail_text_amountpaidforthistime": "本次付款",
  "OA_contractpaymentdetail_text_amountpaidforthistimeRMB": "人民币",
  "OA_contractpaymentdetail_text_depositforthistime": "本次押金",
  "OA_contractpaymentdetail_text_depositforthistimeRMB": "人民币",
  "OA_contractpaymentdetail_text_depositoffsetforthistime": "本次抵充",
  "OA_contractpaymentdetail_text_depositoffsetforthistimeRMB": "人民币",
  "OA_contractpaymentdetail_text_paymentbalance": "欠款余额",
  "OA_contractpaymentdetail_text_paymentreason": "付款理由",
  "OA_contractpaymentdetail_text_allocationtime": "分摊时间",
  "OA_contractpaymentdetail_text_budgetproportion": "预算比例",
  "OA_contractpaymentdetail_text_multiplecostcenter": "多费用中心",
  "OA_costaccountdetail_text_expensetype": "费用种类",
  "OA_costaccountdetail_text_totalamount": "总额",
  "OA_costaccountdetail_text_dateofoccurance": "发生日期",
  "OA_costaccountcontroller_text_prompt": "请去PC端添加项目",

  "OA_costticketsapplydetail_text_tickettype": "游票类型",
  "OA_costticketsapplydetail_text_ticketform": "游票形式",
  "OA_costticketsapplydetail_text_ticketnumber": "项目编号",
  "OA_costticketsapplydetail_text_dateofeffect": "生效日期",
  "OA_costticketsapplydetail_text_ticketname": "项目名称",
  "OA_costticketsapplydetail_text_ticketnature": "项目性质",
  "OA_costticketsapplydetail_text_amount": "发放金额",
  "OA_costticketsapplydetail_text_expectedcost": "预计成本",
  "OA_costticketsapplydetail_text_expecteduserate": "预计使用",
  "OA_couponapplydetail_text_couponsnumber": "项目编号",
  
  "OA_delieverydetail_text_recipientaddress": "收件地址",
  "OA_delieverydetail_text_recipientname": "收件姓名",
  "OA_delieverydetail_text_recipientphone": "收件电话",
  "OA_delieverydetail_text_carrier": "承运商",
  "OA_delieverydetail_text_waybillnumber": "运单号",
  "OA_delieverydetail_text_expresstype": "快递类型",
  "OA_delieverydetail_text_expressdetail": "快递详情",
  "OA_devicepurchasedetail_text_model": "规格、型号",
  "OA_devicepurchasedetail_text_quantity": "数量",
  "OA_devicepurchasedetail_text_unitprice": "金额",
  "OA_devicepurchasedetail_text_totalprice": "总价",
  "OA_devicepurchasedetail_text_explanation": "说明/用途",
  "OA_devicepurchasedetail_text_auditdepartment": "审核部门",

  "OA_fixedassertallocationdetail_text_Affiliatedcompany": "所属公司",
  "OA_fixedassertallocationdetail_text_fromdepartment": "调出部门",
  "OA_fixedassertallocationdetail_text_todepartment": "调入部门",
  "OA_fixedassertallocationdetail_text_assettype": "资产类别",
  "OA_fixedassertallocationdetail_text_assetnumber": "资产编号",
  "OA_fixedassertallocationdetail_text_usedate": "使用日期",
  "OA_fixedassertallocationdetail_text_place": "地点",
  "OA_fixedassetsapplydetail_text_receiptdepartment": "领用部门",
  "OA_fixedassetsapplydetail_text_auditnumber": "评审编号",
  "OA_fixedassetsscrappeddetail_text_scrappeddepartment": "报废部门",
  "OA_fixedassetsscrappeddetail_text_residualvalue": "实际金额",

  "OA_formbutton_btn_countersign": "会签",
  "OA_formbutton_btn_approval": "审批",
  "OA_formbutton_btn_refuse": "拒绝",
  "OA_formbutton_btn_next": "下一单",

  "OA_giftcollardetail_text_customername": "客户名称",
  "OA_giftcollardetail_text_applyforuse": "申领用途",
  "OA_giftcollardetail_text_giftdetail": "礼品明细",
  "OA_giftcollardetail_text_giftname": "礼品名称",
  "OA_giftcollardetail_text_listofitems": "物品清单",

  "OA_incomecontractreviewdetail_text_contractingcompany": "签约公司",
  "OA_incomecontractreviewdetail_text_contractnumber": "合同编号",
  "OA_incomecontractreviewdetail_text_contractname": "合同名称",
  "OA_incomecontractreviewdetail_text_agreementunit": "协议单位",
  "OA_incomecontractreviewdetail_text_contractamount": "合同金额",
  "OA_incomecontractreviewdetail_text_contractdeposit": "押金",
  "OA_incomecontractreviewdetail_text_keyword": "关键字",
  "OA_incometicketsapplydetail_text_couponsissuingcompany": "开票公司",
  "OA_incometicketsapplydetail_text_couponsdiscountrate": "折扣率",
  "OA_incometicketsapplydetail_text_couponsactualreceipt": "实际收款",
  "OA_incometicketsapplydetail_text_limit": "合同有效期",

  "OA_letterdetail_text_letterdetai": "信件详情",
  "OA_letterdetail_text_letteritemdetai": "信件明细",
  "OA_letterdetail_text_totalquantity": "总数",
  "OA_letterdetail_text_lettertype": "信件类型",

  "OA_MICEgroupapplydetail_text_miceteamnumer": "团队号",
  "OA_MICEgroupapplydetail_text_miceteamamount": "团队金额",
  
  "OA_joinerctrl_alert_timeout": "网络请求超时！",
  "OA_joinerctrl_alert_chooseotherperson": "不能选择自己作为会签人",
  "OA_joinerctrl_alert_alreadychoosed": "已经选择此人",
  "OA_joinerctrl_alert_choosesomeone": "请选择会签人",
  "OA_joiner_text_add": "添加会签人",
  "OA_joiner_text_name": "添加历史",
  "OA_joiner_text_addhistory": "已添加列表",
  "OA_joiner_text_addedlist": "请填写添加会签人的理由",
  "OA_joiner_text_select": "(选填)",
  "OA_joiner_text_add_prompt": "添加会签人不能为空",

  "OA_officesuppliescollardetail_text_itemname": "物品名称",
  "OA_officesuppliescollardetail_text_officesuppliesdetail": "办公用品明细",

  "OA_pointspolicyapply_text_integralname": "政策名称",
  "OA_pointspolicyapply_text_integraltype": "政策类型",
  "OA_pointspolicyapply_text_releasedintegral": "发放积分",
  "OA_pointspolicyapply_text_expectedintegral": "预发积分",
  "OA_pointspolicyapply_text_integralrule": "发放规则",

  "OA_purchasecontractreview_text_vendor": "供应商",
  "OA_sendcardetail_text_usecarreason": "用车原因",
  "OA_sendcardetail_text_usecardetail": "派车明细",
  "OA_sendcardetail_text_usecardate": "用车时间",
  "OA_sendcardetail_text_usecarorigin": "始发地",
  "OA_sendcardetail_text_usecardestination": "目的地",
  "OA_staffloandetail_text_applyamount": "申请金额",

  "OA_feereport_text_feepeport": "费用统计",
  "OA_feereportCtrl_text_used": "已使用",
  "OA_feereportCtrl_text_unused": "未使用",
  "OA_feereportCtrl_text_costrate": "费用占比",
  "OA_feereportCtrl_text_withoutbudget": "无预算",
  "OA_feereportCtrl_text_Errorofbudget": "获取费用中心预算异常",
  "OA_feereportCtrl_budgettop10": "预算Top10",
  "OA_feereportCtrl_text_Errorofallbudget": "获取费用中心各类型预算异常",
  "OA_feereportCtrl_personalfeetop10": "个人费用Top10",
  "OA_feereportCtrl_text_Erroroffee": "获取费用中心费用异常",
  "OA_feereportCtrl_text_Q1costrate": "Q1费用占比",
  "OA_feereportCtrl_text_userate": "使用率",
  "OA_feereportCtrl_text_totalbudget": "总预算: ",
  "OA_feereportCtrl_text_usedrate": "已使用率：",
  "OA_feereportCtrl_text_year": "年",
  "OA_feereportCtrl_text_month": "月",

  "OA_applyapproval_text_countersign": "加入会签",
  "OA_applyapproval_text_searchcountersign": "搜索会签人",
  "OA_formdetail_text_viewexpectedapprovers": "查看预计审批人",
  
  "eform_warning": "通知",
  "eform_network": "网络异常",
  "eform_title": "待审批",
  "eform_index_tab_all": "全部",
  "eform_index_tab_ehr": "人事",
  "eform_index_refresher": "下拉刷新",
  "eform_index_order_time": "时间排序",
  "eform_index_order_user": "申请人排序",
  "eform_index_order_subject": "主题排序",
  "eform_index_span_sign": "代签",
  "eform_index_span_joinsign": "会签中",
  "eform_index_noapp_tip": "当前没有您的审批单哟",
  "eform_index_nooa_tip": "OA审批单暂不支持，敬请期待",
  "eform_index_click_goauth": "审批授权",
  "eform_index_click_goauthlist": "我的已授权",
  "eform_index_toggle_showjoinapp": "显示会签中的单据",
  "eform_index_OAgetAgentList_tipinfo": "OA授权列表获取失败，请稍后重试",
  "eform_index_OAupdateAgent_tipinfo": "OA授权收回失败，请稍后重试",
  "eform_index_EhrgetAgentList_tipinfo": "Ehr授权列表获取失败，请稍后重试",
  "eform_index_EhrupdateAgent_tipinfo": "Ehr授权收回失败，请稍后重试",
  "eform_index_ITAgent_tipinfo": "IT收回授权失败，请稍后重试",
  "eform_index_AllAgent_tipinfo": "您的权限已全部收回",

  "eform_it_span_process": "审批流程",
  "eform_it_checkbox_all": "全选",
  "eform_it_checkbox_selected": "已选",
  "eform_it_checkbox_item": "项",
  "eform_it_btn_joindecline": "会签拒绝",
  "eform_it_btn_joinapprove": "会签通过",
  "eform_it_btn_next": "下一单",
  "eform_it_btn_signer": "会签人",
  "eform_it_btn_decline": "拒绝",
  "eform_it_btn_approve": "通过",
  "eform_it_status_pending": "待审批",
  "eform_it_status_approve": "审批通过",
  "eform_it_status_decline": "审批驳回",
  "eform_it_status_cancel1": "本级节点已取消",
  "eform_it_status_cancel2": "上级节点已取消",
  "eform_it_warn_noselect": "您还没有选择任何单据",
  "eform_it_warn_noreason": "请输入理由！",
  "eform_it_warn_goctripteam": "获取跳转信息失败，请稍后重试！",
  "eform_itjoin_title": "添加会签人",
  "eform_itjoin_search_name": "姓名",
  "eform_itjoin_search_initials": "首字母",
  "eform_itjoin_search_pinyin": "拼音",
  "eform_itjoin_search_ad": "域帐号",
  "eform_itjoin_search_cancel": "取消",
  "eform_itjoin_signer_history": "添加历史",
  "eform_itjoin_signer_list": "已添加列表",
  "eform_itjoin_signer_reason": "请填写添加会签人的理由",
  "eform_itjoin_reason_placeholder": "选填",
  "eform_itjoin_btn_cancel": "取消",
  "eform_itjoin_btn_ok": "确认",
  "eform_itjoin_warn_self": "不能选择自己作为会签人",
  "eform_itjoin_warn_selected": "已经选择此人",
  "eform_itjoin_warn_nosigner": "请选择会签人",

  "eform_ehr_span_leavedate": "请假日期",
  "eform_ehr_span_datehours": "每天时段",
  "eform_ehr_span_leavedaynum": "请假小时数",
  "eform_ehr_span_day": "天",
  "eform_ehr_span_hours": "小时",
  "eform_ehr_span_tips": "说明",
  "eform_ehr_batchApplyTitle": "请假申请单",
  "eform_ehr_noAduiterList": "当前单据审批流为空!",
  "eform_ehr_status_0": "待审批",
  "eform_ehr_status_1": "已审批",
  "eform_ehr_status_3": "会签中",
  "eform_ehr_status_4": "退回申请人",
  "eform_ehr_status_5": "退回上一级审批人",
  "eform_ehr_AuditerStatus_3": "该单据在会签中,您暂时无法进行审批。",
  "eform_ehr_sign_comment": "请填写会签意见(选填)",
  "eform_ehr_sign_reason": "请填写拒绝理由(必填)",

  "eform_remedy_span_Apprvoers": "审批人",
  "eform_remedy_span_Summary": "概要",
  "eform_remedy_span_Detail": "描述",

  "eform_AccreditList_view_title": "我的已授权",
  "eform_AccreditList_tabs_all": "全部",
  "eform_AccreditList_tabs_remedy": "流程",
  "eform_AccreditList_refresher_pullingText": "下拉刷新...",
  "eform_AccreditList_div_noApproving": "当前没有您的授权单哟~",
  "eform_AccreditList_div_timeUntil": "至",
  "eform_AccreditList_div_deadline": "截止日期",
  "eform_AccreditList_checkbox_all": "全选",
  "eform_AccreditList_button_takeBack": "收回",
  "eform_AccreditListCtrl_item_status": "授权中",
  "eform_AccreditListCtrl_jsListStatus_authIn": "授权中",
  "eform_AccreditListCtrl_jsListStatus_unBegin": "未开始",
  "eform_AccreditListCtrl_jsrole_all": "所有权限",
  "eform_AccreditListCtrl_jsOnDelete_template": "您将会收回该授权",
  "eform_AccreditListCtrl_jsOnDelete_title": "温馨提示",
  "eform_AccreditListCtrl_jsOnDelete_buttonOK": "确认收回",
  "eform_AccreditListCtrl_jsOnDelete_buttonCancel": "我再想想",
  "eform_AccreditListCtrl_jsOAgetAgentList_callbackError": "OA授权列表获取失败，请稍后重试",
  "eform_AccreditListCtrl_jsGetAuthList_callbackError": "Ehr授权列表获取失败，请稍后重试",
  "eform_AccreditListCtrl_jsAuditAuthorizeQuery_callbackError": "IT授权列表获取失败，请稍后重试",
  "eform_AccreditListCtrl_jsQueryalternate_statusError": "流程授权列表获取失败，请稍后重试",
  "eform_AccreditListCtrl_jsSelectAll_selectNone": "您没有选中对象哟~",
  "eform_AccreditListCtrl_jsOAupdateAgent_callbackError": "OA授权收回失败，请稍后重试",
  "eform_AccreditListCtrl_jsCancelAuth_callbackError": "Ehr授权收回失败，请稍后重试",
  "eform_AccreditListCtrl_jsAuditAuthorizeDelete_callbackError": "IT收回授权失败，请稍后重试",
  "eform_AccreditListCtrl_jsRemedyCancel_callbackError": "Remedy收回授权失败，请稍后重试",
  "eform_AccreditListCtrl_jsWaitDelete_deleteSuccess": "授权收回成功",

  "eform_updateAccredit_view_title": "审批授权",
  "eform_updateAccredit_button_submit": "提交",
  "eform_updateAccredit_inputLable_startDate": "开始日期",
  "eform_updateAccredit_p_select": "请选择",
  "eform_updateAccredit_inputLable_endDate": "结束日期",
  "eform_updateAccredit_inputLable_Agent": "代理人",
  "eform_updateAccredit_input_placeholder": "姓名/首字母/拼音/域帐号",
  "eform_updateAccredit_span_searchHistory": "搜索历史",
  "eform_updateAccredit_label_clearSearchHistory": "清空搜索历史",
  "eform_updateAccredit_div_tip": "*以下方填写的代理人为准，可不填",

  "eform_accreditCtrl_jsmonthList_Jan": "一月",
  "eform_accreditCtrl_jsmonthList_Feb": "二月",
  "eform_accreditCtrl_jsmonthList_Mar": "三月",
  "eform_accreditCtrl_jsmonthList_Apr": "四月",
  "eform_accreditCtrl_jsmonthList_May": "五月",
  "eform_accreditCtrl_jsmonthList_June": "六月",
  "eform_accreditCtrl_jsmonthList_July": "七月",
  "eform_accreditCtrl_jsmonthList_Aug": "八月",
  "eform_accreditCtrl_jsmonthList_Sep": "九月",
  "eform_accreditCtrl_jsmonthList_Oct": "十月",
  "eform_accreditCtrl_jsmonthList_Nov": "十一月",
  "eform_accreditCtrl_jsmonthList_Dec": "十二月",
  "eform_accreditCtrl_jsweeklist_Sun": "日",
  "eform_accreditCtrl_jsweeklist_Mon": "一",
  "eform_accreditCtrl_jsweeklist_Tues": "二",
  "eform_accreditCtrl_jsweeklist_Wed": "三",
  "eform_accreditCtrl_jsweeklist_Thur": "四",
  "eform_accreditCtrl_jsweeklist_Fri": "五",
  "eform_accreditCtrl_jsweeklist_Sat": "六",
  "eform_accreditCtrl_jsdatePopup_todayLabel": "今天",
  "eform_accreditCtrl_jsdatePopup_closeLabel": "取消",
  "eform_accreditCtrl_jsdatePopup_setLabel": "确定",
  "eform_accreditCtrl_jsAlert_warnTitle": "警告",
  "eform_accreditCtrl_jsAlert_warnInfo": "开始时间必须小于结束时间！",
  "eform_accreditCtrl_jsAlert_startPopup": "开始日期",
  "eform_accreditCtrl_jsAlert_endPopup": "结束日期",
  "eform_accreditCtrl_jsScope_httpAlert": "网络请求超时!",
  "eform_accreditCtrl_jsPopup_title": "提示",
  "eform_accreditCtrl_jsTipInfo_noRole": "您没有角色可以授权",
  "eform_accreditCtrl_jsTipInfo_busyNetwork": "网络忙，请稍后",
  "eform_accreditCtrl_jsTipInfo_ehrError": "EHR授权失败，请稍后重试",
  "eform_accreditCtrl_jsTipInfo_itError": "IT授权失败，请稍后重试，谢谢",
  "eform_accreditCtrl_jsTipInfo_oaError": "OA授权失败，请稍后重试",
  "eform_accreditCtrl_jsTipInfo_openLicense": "您没有开启授权",
  "eform_accreditCtrl_jsTipInfo_noDate": "请选择日期",
  "eform_accreditCtrl_jsTipInfo_noOaAgent": "请填写OA代理人",
  "eform_accreditCtrl_jsTipInfo_noITAgent": "请填写IT代理人",
  "eform_accreditCtrl_jsTipInfo_noEhrAgent": "请填写EHR代理人",
  "eform_accreditCtrl_jsTipInfo_noRemedyAgent": "请填写流程代理人",
  "eform_accreditCtrl_jsTipInfo_approveSuccess": "授权成功",

  "ehr_quit_title": "待审批",
  "ehr_quit_btn_refresh": "下拉刷新",
  "ehr_quit_p_docutype": "离职申请交接单",
  "ehr_quit_p_basicinfo": "基本信息",
  "ehr_quit_p_approvalinfo": "审批信息",
  "ehr_quit_p_process": "审批流程",
  "ehr_quit_p_applicant": "离职人员",
  "ehr_quit_p_applyDate": "申请时间",
  "ehr_quit_p_department": "部门",
  "ehr_quit_p_hireValid": "入职日期",
  "ehr_quit_p_EmpLevel": "职级",
  "ehr_quit_p_ProbationEndDate": "试用期结束日",
  "ehr_quit_p_ContractEndDate": "合同结束日",
  "ehr_quit_p_QuitType": "辞退类型",
  "ehr_quit_p_PulishID": "处分关联单据号",
  "ehr_quit_p_EmpAttribute": "员工属性",
  "ehr_quit_p_ContractLimit": "合同期限",
  "ehr_quit_p_QuitStyle": "离职类型",
  "ehr_quit_p_QuitReason": "离职原因",
  "ehr_quit_p_IsMakeUp": "是否补偿",
  "ehr_quit_p_AvgSalary": "平均月薪",
  "ehr_quit_p_AgeReference": "年限参考",
  "ehr_quit_p_Compensation": "补偿金额",
  "ehr_quit_p_MakeUpType": "补偿类型",
  "ehr_quit_p_MakeUpProcess": "补偿计算过程",
  "ehr_quit_p_QuitRemark": "备注",
  "ehr_quit_p_EmpType": "员工分类",
  "ehr_quit_p_Injury": "工伤信息提示",
  "ehr_quit_p_ItemList": "物品交接清单",
  "ehr_quit_btn_Pass": "通过",
  "ehr_quit_btn_AddCounter": "会签人",
  "ehr_quit_btn_Refuse": "拒绝",
  "ehr_quit_btn_ReApplicant": "退回申请人",
  "ehr_quit_btn_ReApproval": "退回上一级",
  "ehr_quit_label_IsCompetition": "请选择竞业限制是否履行",
  "ehr_quit_label_QuitCode": "离职代码",
  "ehr_quit_label_QuitReaonRemark": "离职原因备注",
  "ehr_quit_label_HRNotes": "HR备注",
  "ehr_quit_label_AccCloseDate": "帐号关闭日期",
  "ehr_quit_label_TerminationMonth": "离职归入月",
  "ehr_quit_label_IsCardReturn": "门禁卡",
  "ehr_quit_label_IsHandBook": "员工手册",
  "ehr_quit_label_select": "请选择",
  "ehr_quit_jsalert_warn": "通知",
  "ehr_quit_jsalert_Network": "网络异常",
  "ehr_quit_jsalert_noAduiterList": "当前单据审批流为空",
  "ehr_quit_jstext_Status0": "待审批",
  "ehr_quit_jstext_Status1": "已审批",
  "ehr_quit_jstext_Status3": "会签中",
  "ehr_quit_jstext_Status4": "退回申请人",
  "ehr_quit_jstext_Status5": "退回上一级审批人",
  "ehr_quit_jsalert_min": "你选择的日期不得早于",
  "ehr_quit_jsalert_max": "你选择的日期必须早于",
  "ehr_quit_jsdate_Jan": "一月",
  "ehr_quit_jsdate_Feb": "二月",
  "ehr_quit_jsdate_Mar": "三月",
  "ehr_quit_jsdate_Apr": "四月",
  "ehr_quit_jsdate_May": "五月",
  "ehr_quit_jsdate_June": "六月",
  "ehr_quit_jsdate_July": "七月",
  "ehr_quit_jsdate_Aug": "八月",
  "ehr_quit_jsdate_Sep": "九月",
  "ehr_quit_jsdate_Oct": "十月",
  "ehr_quit_jsdate_Nov": "十一月",
  "ehr_quit_jsdate_Dec": "十二月",
  "ehr_quit_jsdate_Sun": "日",
  "ehr_quit_jsdate_Mon": "一",
  "ehr_quit_jsdate_Tues": "二",
  "ehr_quit_jsdate_Wed": "三",
  "ehr_quit_jsdate_Thur": "四",
  "ehr_quit_jsdate_Fri": "五",
  "ehr_quit_jsdate_Sat": "六",
  "ehr_quit_jsdate_selectDate": "选择日期",
  "ehr_quit_jsdate_todayLabel": "今天",
  "ehr_quit_jsalert_cancel": "取消",
  "ehr_quit_jsalert_confirm": "确定",
  "ehr_quit_jsalert_IsCompetition": "请选择竞业限制是否履行",
  "ehr_quit_jsalert_QuitCode": "请选择离职代码",
  "ehr_quit_jsalert_QuitReaonRemark": "请填写离职原因备注",
  "ehr_quit_jsalert_HRNotes": "请填写HR备注",
  "ehr_quit_jsalert_AccCloseDate": "请选择帐号关闭日期",
  "ehr_quit_jsalert_TerminationMonth": "请选择离职归入月",
  "ehr_quit_jsalert_success": "成功",
  "ehr_quit_jsalert_comment": "请填写会签意见",
  "ehr_quit_jsalert_ispass": "确认通过?",
  "ehr_quit_jsalert_isRefuse": "确认拒绝?",
  "ehr_quit_jsalert_reason": "请填写拒绝理由",
  "ehr_quit_label_SJLZRQ": "实际离职日期",
  "ehr_quit_label_QXZSJLZRQ": "请选择实际离职日期",
  "ehr_quit_label_QYWHSC": "企业文化手册",
  "ehr_quit_p_BZ": "币种",

  "ehr_addCountersign_title": "添加会签人",
  "ehr_addCountersign_search_name": "姓名",
  "ehr_addCountersign_search_initials": "首字母",
  "ehr_addCountersign_search_pinyin": "拼音",
  "ehr_addCountersign_search_ad": "域帐号",
  "ehr_addCountersign_search_cancel": "取消",
  "ehr_addCountersign_signer_history": "添加历史",
  "ehr_addCountersign_signer_list": "已添加列表",
  "ehr_addCountersign_signer_reason": "请填写添加会签人的理由",
  "ehr_addCountersign_reason_placeholder": "(选填)",
  "ehr_addCountersign_btn_cancel": "取消",
  "ehr_addCountersign_btn_ok": "确认",
  "ehr_addCountersign_warn_self": "不能选择自己作为会签人",
  "ehr_addCountersign_warn_selected": "已经选择此人",
  "ehr_addCountersign_warn_nosigner": "请选择会签人",
  "ehr_addCountersign_warn_warning": "通知",
  "ehr_addCountersign_warn_network": "网络异常",
  "ehr_addCountersign_jsalert_success": "成功",

  "ehr_transferApplication_title": "待审批",
  "ehr_transferApplication_btn_refresh": "下拉刷新",
  "ehr_transferApplication_p_docutype": "人员调动单",
  "ehr_transferApplication_p_basicinfo": "基本信息",
  "ehr_transferApplication_p_process": "审批流程",
  "ehr_transferApplication_p_applicant": "申请人",
  "ehr_transferApplication_p_applyDate": "申请时间",
  "ehr_transferApplication_p_TransferEmp": "调动人员",
  "ehr_transferApplication_p_EmpType": "员工分类 ",
  "ehr_transferApplication_p_OperateType": "操作类型",
  "ehr_transferApplication_p_MoveDate": "调动日期",
  "ehr_transferApplication_p_Department": "调出部门/岗位",
  "ehr_transferApplication_p_TransferDepart": "调入部门/岗位",
  "ehr_transferApplication_p_EmpLevel": "职级变动",
  "ehr_transferApplication_p_PerformanceB": "绩效变动",
  "ehr_transferApplication_p_WorkLocationB": "当前实际工作地",
  "ehr_transferApplication_p_WorkLocationA": "调动后实际工作地",
  "ehr_transferApplication_p_MoveReason": "调动原因",
  "ehr_transferApplication_p_ExtraRule": "附加约定",
  "ehr_transferApplication_p_BaseSalary": "调动后基本工资",
  "ehr_transferApplication_p_WealthSalary": "调动后财富工资",
  "ehr_transferApplication_p_TechSalary": "调动后技能工资",
  "ehr_transferApplication_p_PlaceSubsidy": "异地津贴",
  "ehr_transferApplication_p_MoveSubsidy": "搬家补贴",
  "ehr_transferApplication_p_HouseSubsidy": "住房报销",
  "ehr_transferApplication_p_GiveOutEndDate": "拟发放结束日",
  "ehr_transferApplication_btn_Pass": "通过",
  "ehr_transferApplication_btn_AddCounter": "会签人",
  "ehr_transferApplication_btn_Refuse": "拒绝",
  "ehr_transferApplication_btn_ReApplicant": "退回申请人",
  "ehr_transferApplication_btn_ReApproval": "退回上一级",
  "ehr_transferApplication_label_IsCompetition": "请选择竞业限制是否履行",
  "ehr_transferApplication_label_select": "请选择",
  "ehr_transferApplication_jsalert_warn": "通知",
  "ehr_transferApplication_jsalert_Network": "网络异常",
  "ehr_transferApplication_jsalert_noAduiterList": "当前单据审批流为空",
  "ehr_transferApplication_jstext_Status0": "待审批",
  "ehr_transferApplication_jstext_Status1": "已审批",
  "ehr_transferApplication_jstext_Status3": "会签中",
  "ehr_transferApplication_jstext_Status4": "退回申请人",
  "ehr_transferApplication_jstext_Status5": "退回上一级审批人",
  "ehr_transferApplication_jsalert_success": "成功",
  "ehr_transferApplication_jsalert_comment": "请填写会签意见",
  "ehr_transferApplication_jsalert_ispass": "确认通过?",
  "ehr_transferApplication_jsalert_isRefuse": "确认拒绝?",
  "ehr_transferApplication_jsalert_reason": "请填写拒绝理由",
  "ehr_transferApplication_p_DQCBD": "当前参保地",
  "ehr_transferApplication_p_DDHCBD": "调动后参保地",
  "ehr_transferApplication_p_BZ": "币种",
  "ehr_transferApplication_p_JYXZYW": "竞业限制义务",
  "ehr_transferApplication_p_DRZX": "调入小组",

  "ehr_ContractCtrl_title": "待审批",
  "ehr_ContractCtrl_p_docutype": "合同到期续签意见表",
  "ehr_ContractCtrl_btn_refresh": "下拉刷新",
  "ehr_ContractCtrl_p_basicinfo": "基本信息",
  "ehr_ContractCtrl_p_approvalinfo": "审批信息",
  "ehr_ContractCtrl_p_process": "审批流程",
  "ehr_ContractCtrl_p_xqry": "续签人员",
  "ehr_ContractCtrl_p_sqsj": "申请时间",
  "ehr_ContractCtrl_p_bm": "部门",
  "ehr_ContractCtrl_p_rzrq": "入职日期",
  "ehr_ContractCtrl_p_zj": "职级",
  "ehr_ContractCtrl_p_htjsr": "合同结束日",
  "ehr_ContractCtrl_p_lshtxx": "历史合同信息",
  "ehr_ContractCtrl_p_qdcs": "08年后签订次数",
  "ehr_ContractCtrl_p_ts": "可续签年限的提示",
  "ehr_ContractCtrl_p_cfxx": "处分信息",
  "ehr_ContractCtrl_p_jkzt": "健康状态",
  "ehr_ContractCtrl_p_ygfl": "员工分类",
  "ehr_ContractCtrl_p_gsxx": "工伤信息",
  "ehr_ContractCtrl_p_zysx": "注意事项",
  "ehr_ContractCtrl_label_htlx": "拟续约合同类型",
  "ehr_ContractCtrl_label_sfxq": "是否续签",
  "ehr_ContractCtrl_label_xqnx": "续签年限",
  "ehr_ContractCtrl_label_jyxzqd": "竞业限制签订",
  "ehr_ContractCtrl_label_htgs": "合同公司",
  "ehr_ContractCtrl_label_xqgw": "续签岗位",
  "ehr_ContractCtrl_label_xqgslx": "续签工时类型",
  "ehr_ContractCtrl_label_xqhtzzr": "续签合同终止日",
  "ehr_ContractCtrl_label_xqhdsl": "续签后的司龄",
  "ehr_ContractCtrl_label_bz": "备注",
  "ehr_ContractCtrl_btn_tg": "通过",
  "ehr_ContractCtrl_btn_hqr": "会签人",
  "ehr_ContractCtrl_btn_jj": "拒绝",
  "ehr_ContractCtrl_btn_thsqr": "退回申请人",
  "ehr_ContractCtrl_btn_thsyj": "退回上一级",
  "ehr_ContractCtrl_btn_qx": "取消",
  "ehr_ContractCtrl_p_xzhtgs": "选择合同公司",
  "ehr_ContractCtrl_p_xzxqgw": "选择续签岗位",
  "ehr_ContractCtrl_jsalert_warn": "通知",
  "ehr_ContractCtrl_jsalert_Network": "网络异常",
  "ehr_ContractCtrl_jsalert_noAduiterList": "当前单据审批流为空",
  "ehr_ContractCtrl_jstext_Status0": "待审批",
  "ehr_ContractCtrl_jstext_Status1": "已审批",
  "ehr_ContractCtrl_jstext_Status3": "会签中",
  "ehr_ContractCtrl_jstext_Status4": "退回申请人",
  "ehr_ContractCtrl_jstext_Status5": "退回上一级审批人",
  "ehr_ContractCtrl_jsalert_confirm": "确定",
  "ehr_ContractCtrl_jsalert_success": "成功",
  "ehr_ContractCtrl_jsalert_ispass": "确认通过?",
  "ehr_ContractCtrl_jsalert_isRefuse": "确认拒绝?",
  "ehr_ContractCtrl_jsalert_comment": "请填写会签意见",
  "ehr_ContractCtrl_jsalert_reason": "请填写拒绝理由",
  "ehr_ContractCtrl_jsdate_Jan": "一月",
  "ehr_ContractCtrl_jsdate_Feb": "二月",
  "ehr_ContractCtrl_jsdate_Mar": "三月",
  "ehr_ContractCtrl_jsdate_Apr": "四月",
  "ehr_ContractCtrl_jsdate_May": "五月",
  "ehr_ContractCtrl_jsdate_June": "六月",
  "ehr_ContractCtrl_jsdate_July": "七月",
  "ehr_ContractCtrl_jsdate_Aug": "八月",
  "ehr_ContractCtrl_jsdate_Sep": "九月",
  "ehr_ContractCtrl_jsdate_Oct": "十月",
  "ehr_ContractCtrl_jsdate_Nov": "十一月",
  "ehr_ContractCtrl_jsdate_Dec": "十二月",
  "ehr_ContractCtrl_jsdate_Sun": "日",
  "ehr_ContractCtrl_jsdate_Mon": "一",
  "ehr_ContractCtrl_jsdate_Tues": "二",
  "ehr_ContractCtrl_jsdate_Wed": "三",
  "ehr_ContractCtrl_jsdate_Thur": "四",
  "ehr_ContractCtrl_jsdate_Fri": "五",
  "ehr_ContractCtrl_jsdate_Sat": "六",
  "ehr_ContractCtrl_jsdate_selectDate": "选择日期",
  "ehr_ContractCtrl_jsdate_todayLabel": "今天",
  "ehr_ContractCtrl_jsalert_NXYHTLX": "请选择拟续约合同类型",
  "ehr_ContractCtrl_jsalert_SFXQ": "请选择是否续签",
  "ehr_ContractCtrl_jsalert_XQNX": "请选择续签年限",
  "ehr_ContractCtrl_jsalert_JYXZQD": "请选择竞业限制签订",
  "ehr_ContractCtrl_jsalert_XQGW": "请选择续签岗位",
  "ehr_ContractCtrl_jsalert_HTGS": "请选择合同公司",
  "ehr_ContractCtrl_jsalert_XQGSLX": "请选择续签工时类型",
  "ehr_ContractCtrl_jsalert_XQHTZZR": "请选择续签合同终止日",
  "ehr_ContractCtrl_jsalert_BZ": "请填写备注",
  "ehr_ContractCtrl_label_select": "请选择",
  "ehr_ContractCtrl_label_number": "编号",
  "ehr_ContractCtrl_label_name": "名称",

  "ehr_punish_title": "待审批",
  "ehr_punish_p_CFYGSQS": "处分员工申请书",
  "ehr_punish_btn_refresh": "下拉刷新",
  "ehr_punish_p_basicinfo": "基本信息",
  "ehr_punish_p_process": "审批流程",
  "ehr_punish_p_CFYG": "处分员工",
  "ehr_punish_p_SQSJ": "申请时间",
  "ehr_punish_p_BM": "部门",
  "ehr_punish_p_ZJ": "职级",
  "ehr_punish_p_SQCFDJ": "申请处分等级",
  "ehr_punish_p_ZGLD": "主管领导",
  "ehr_punish_p_CFSY": "处分事由",
  "ehr_punish_p_CFYJ": "处分依据",
  "ehr_punish_p_CFYJIAN": "处分意见",
  "ehr_punish_p_CFGZSH": "处分告知书号",
  "ehr_punish_btn_SC": "生成",
  "ehr_punish_btn_Pass": "通过",
  "ehr_punish_btn_AddCounter": "会签人",
  "ehr_punish_btn_Refuse": "拒绝",
  "ehr_punish_btn_ReApplicant": "退回申请人",
  "ehr_punish_btn_ReApproval": "退回上一级",
  "ehr_punish_jsalert_warn": "通知",
  "ehr_punish_jsalert_Network": "网络异常",
  "ehr_punish_jsalert_noAduiterList": "当前单据审批流为空",
  "ehr_punish_jstext_Status0": "待审批",
  "ehr_punish_jstext_Status1": "已审批",
  "ehr_punish_jstext_Status3": "会签中",
  "ehr_punish_jstext_Status4": "退回申请人",
  "ehr_punish_jstext_Status5": "退回上一级审批人",
  "ehr_punish_jsalert_ispass": "确认通过?",
  "ehr_punish_jsalert_cancel": "取消",
  "ehr_punish_jsalert_confirm": "确认",
  "ehr_punish_jsalert_success": "成功",
  "ehr_punish_jsalert_comment": "请填写会签意见",
  "ehr_punish_jsalert_isRefuse": "确认拒绝?",
  "ehr_punish_jsalert_reason": "请填写拒绝理由",
  "ehr_punishCancel_p_CXCFSQS": "处分撤销申请书",
  "ehr_punishCancel_p_CXYJ": "撤销依据",

  "ehr_AdjustmentApplication_title": "待审批",
  "ehr_AdjustmentApplication_btn_refresh": "下拉刷新",
  "ehr_AdjustmentApplication_p_docutype": "薪资职级变动单",
  "ehr_AdjustmentApplication_p_basicinfo": "基本信息",
  "ehr_AdjustmentApplication_p_process": "审批流程",
  "ehr_AdjustmentApplication_p_AdjustmentEmp": "变动人员",
  "ehr_AdjustmentApplication_p_MoveDate": "变动日期",
  "ehr_AdjustmentApplication_p_Department": "所在部门/岗位",
  "ehr_AdjustmentApplication_p_EmpLevel": "职级变动",
  "ehr_AdjustmentApplication_p_PerformanceB": "绩效变动",
  "ehr_AdjustmentApplication_p_applicant": "申请人",
  "ehr_AdjustmentApplication_p_applyDate": "申请时间",
  "ehr_AdjustmentApplication_p_BaseSalary": "变动后基本工资",
  "ehr_AdjustmentApplication_p_WealthSalary": "变动后财富工资",
  "ehr_AdjustmentApplication_p_TechSalary": "变动后技能工资",
  "ehr_AdjustmentApplication_p_IncompetentPost": "是否为不胜任变动",
  "ehr_AdjustmentApplication_p_Remark": "备注",
  "ehr_AdjustmentApplication_p_BZ": "币种",

  "ehr_seal_p_docutype": "人事专用章",
  "ehr_seal_p_sealcompany": "用章公司",
  "ehr_seal_p_sealfiletype": "用章文件",
  "ehr_seal_p_sealuse": "用章用途",
  "ehr_seal_p_remak": "备注",
  "ehr_seal_p_warning": "注意事项",
  
  "ehr_overtime_title": "加班申请单",
  "ehr_overtime_span_1": "加班日期",
  "ehr_overtime_span_2": "加班时段",
  "ehr_overtime_span_3": "加班小时数",
  "ehr_overtime_span_4": "说明",
  "ehr_overtime_span_5": "考勤信息",
  "ehr_overtime_span_6": "已申请加班合计",
  "ehr_overtime_span_7": "小时",
  "ehr_overtime_span_8": "无打卡信息",
  "ehr_regular_title": "待审批",
  "ehr_regular_p_docutype": "试用人员评估考核表",
  "ehr_regular_p_regularUser": "转正人员",
  "ehr_regular_span_1": "是否转正",
  "ehr_regular_span_2": "转正人员自评",
  "ehr_regular_span_3": "业务知识",
  "ehr_regular_span_4": "a.相关工作知识及业务能力",
  "ehr_regular_span_5": "b.领悟并接受新知识能力",
  "ehr_regular_span_6": "工作态度",
  "ehr_regular_span_7": "a.对待工作的积极性和进取心",
  "ehr_regular_span_8": "b.能否承受额外的工作压力",
  "ehr_regular_span_9": "工作能力",
  "ehr_regular_span_10": "a.能否控制工作节奏",
  "ehr_regular_span_11": "b.领悟并完成指派的工作",
  "ehr_regular_span_12": "工作业绩",
  "ehr_regular_span_13": "a.对期限完毕工作的执行情况",
  "ehr_regular_span_14": "b.能否胜任并创造性完成工作",
  "ehr_regular_span_15": "团队精神",
  "ehr_regular_span_16": "a.对公司的认同程度",
  "ehr_regular_span_17": "b.能否受他人信任及相互激励",
  "ehr_regular_span_18": "c.是否与同事及领导和睦相处",
  "ehr_regular_span_19": "d.对部门的向心力及责任感",
  "ehr_regular_span_20": "评估意见",
  "ehr_regular_span_21": "员工转正信息(技能工资只适用于预订部'S'序列员工)",
  "ehr_regular_span_22": "当前基本工资",
  "ehr_regular_span_23": "当前技能工资",
  "ehr_regular_span_24": "约定转正基本工资",
  "ehr_regular_span_25": "入职转正约定",
  "ehr_regular_span_26": "主管填写",
  "ehr_regular_span_27": "转正基本工资",
  "ehr_regular_span_28": "转正技能工资",
  "ehr_regular_span_29": "工资货币",
  "ehr_regular_span_30": "转正职级",
  "ehr_regular_span_31": "部门人事填写",
  "ehr_regular_span_32": "转正日期",
  "ehr_regular_span_33": "期权发放形式",
  "ehr_regular_span_34": "绩效",
  "ehr_regular_alert_0": "是否转正不能为空",
  "ehr_regular_alert_1": "请填写转正人员自评",
  "ehr_regular_alert_2": "请选择业务知识a",
  "ehr_regular_alert_3": "请选择业务知识b",
  "ehr_regular_alert_4": "请选择工作态度a",
  "ehr_regular_alert_5": "请选择工作态度b",
  "ehr_regular_alert_6": "请选择工作能力a",
  "ehr_regular_alert_7": "请选择工作能力b",
  "ehr_regular_alert_8": "请选择工作业绩a",
  "ehr_regular_alert_9": "请选择工作业绩b",
  "ehr_regular_alert_10": "请选择团队精神a",
  "ehr_regular_alert_11": "请选择团队精神b",
  "ehr_regular_alert_12": "请选择团队精神c",
  "ehr_regular_alert_13": "请选择团队精神d",
  "ehr_regular_alert_14": "请填写考核成绩",
  "ehr_regular_alert_15": "请填写评估意见",
  "ehr_regular_alert_16": "请填写当前基本工资",
  "ehr_regular_alert_17": "请填写当前技能工资",
  "ehr_regular_alert_18": "请填写约定转正基本工资",
  "ehr_regular_alert_19": "请填写入职转正约定",
  "ehr_regular_alert_20": "请填写转正基本工资",
  "ehr_regular_alert_21": "请填写转正技能工资",
  "ehr_regular_alert_22": "请选择币种",
  "ehr_regular_alert_23": "请选择转正职级",
  "ehr_regular_alert_24": "请填写转正日期",
  "ehr_regular_alert_25": "请选择期权发放形式",
  "ehr_regular_alert_26": "请选绩效",
  "oa_alert_response_null": "网络连接异常，请检查您的网络",
  "oa_error_status_403": "您沒有权限，请求被拒绝",
  "oa_error_system_info": "系统异常",
  "oa_error_status_1001": "Http必须POST请求",
  "oa_error_status_1002": "URL格式错误",
  "oa_error_status_1003": "缺失必要参数access_token",
  "oa_error_status_1004": "access_token未注册",
  "oa_error_status_1005": "access_token已过期",
  "oa_error_status_1006": "service code未注册",
  "oa_error_status_1007": "access_token对应的用户无权限访问该接口",
  "oa_error_status_1008": "URL创建失败",
  "oa_error_status_1009": "创建Token，提供openid或openkey错误",
  "oa_error_status_1010": "创建Token失败，数据库中未找到对应记录",
  "oa_error_status_1011": "刷新Token失败，数据库中未找到对应记录",
  "oa_error_status_400": "服务器域名解析失败",
  "oa_error_status_406": "超过服务配置的瞬时并发限制",
  "oa_error_status_408": "服务器端口不通",
  "oa_error_status_504": "服务器返回超时",
  "OA_fixedassertallocationdetail_text_model": "规格/型号/资产编号",
  "OA_oneCommit_warning": "不能重复提交！",
  "oa_copy_success": "内容已经复制到剪贴板",
  "OA_costaccountdetail_text_overtime": "夜间交通费",
  "OA_costaccountdetail_text_workinghours": "考勤记录",
  "oa_yes": "是",
  "oa_no": "否",
  "OA_text_usedate": "申请日期",
  "OA_Salary_text_unitprice": "申请金额",
  "OA_Salary_text_residualvalue": "报销金额",
  "OA_text_payment_payee": "收款单位(人)",
  "OA_travel_card_reimbursement": "差旅卡报销",
  "ehr_Intern_p_SXSLYSQPGB": "实习生留用申请评估表",
  "ehr_Intern_p_basicinfo": "基本信息",
  "ehr_Intern_p_process": "审批流程",
  "ehr_Intern_p_SXS": "实习生",
  "ehr_Intern_p_SQSJ": "申请时间",
  "ehr_Intern_p_SQBM": "申请部门",
  "ehr_Intern_p_DSYG": "导师员工",
  "ehr_Intern_p_GW": "岗位",
  "ehr_Intern_p_RZRQ": "入职日期",
  "ehr_Intern_p_SJGZSJ": "实际工作时间",
  "ehr_Intern_p_QZRQ": "最高学历起止时间",
  "ehr_Intern_p_XXMC": "学校名称",
  "ehr_Intern_p_ZY": "专业",
  "ehr_Intern_p_XLLX": "学历类型",
  "OA_item_total_amount": "项目总金额",
  "OA_recipient_itemdetail_text_item": "收单单位(人)",
  "OA_recipient_itemdetail_text_account": "收款帐号",
  "OA_recipient_itemdetail_text_bankName": "开户行",
  "OA_recipient_itemdetail_text_city": "开户城市",
  "OA_recipient_itemdetail_text_cashPledgeAmount": "押金付款金额",
  "OA_recipient_itemdetail_text_contractPaymentAmount": "合同付款金额",
  "OA_additemdetail_text_paymentdetail": "支付明细",
  "OA_itemDetail_text_contractPaymentAmount": "付款金额",
  "OA_itemDetail_text_bankAddress": "开户行地址",
  "OA_no_Down_Title": '无法下载',
  "OA_no_Down_Tips": '手机端暂不支持该格式文件的下载，请前往PC端对应待审批单据下载',
  "OA_detail_business_type": '业务分组',
  "OA_detail_business_type_placeholder":'业务分组查询',
}


const lang_EN = {
  "OA_index_share_title": 'OA小程序',
  "OA_index_share_content": '点击进入oa小程序',


  "OA_itemDetail_text_bankAddress": "Bank Address",
  "OA_Form_Detail_Residue": 'residue',
  "OA_no_message": "Data is Empty",
  "OA_loading_text":"Loading...",
  "OA_index_link_waitapproval": "Pending",
  "OA_index_link_submitted": "Submitted",
  "OA_index_link_reimbursement": "Reimbursement",
  "OA_index_link_businesstravel": "Businesstravel",
  "OA_index_link_budget": "Budget",
  "OA_index_link_authorize": "Authorize",
  "OA_index_link_taxnumber": "Taxnumber",
  "OA_index_alert_authorization": "NO Permission",
  "OA_index_alert_network": "Network error",
  "OA_index_alert_data": "Data error",
  "OA_index_alert_confirm": "Confirm",
  "OA_index_alert_prompt": "Prompt",

  "OA_notice_title_my_taxnumber": "My Taxnumber",
  "OA_notice_title_taxnumber": "FinanceTaxnumber",
  "OA_notice_text_company": "Company:",
  "OA_notice_text_taxnumber": "TaxNum:",
  "OA_notice_text_bankaccount": "A/C NO:",
  "OA_notice_text_bankname": "BankName:",
  "OA_notice_text_telephone": "Tel:",
  "OA_notice_text_address": "Address:",

  "OA_formlist_btn_my_approval": "My Approval",
  "OA_formlist_btn_my_submitted": "My Submitted",
  "OA_formlist_btn_waitapproval": "Pending",
  "OA_formlist_btn_approved": "Approved",
  "OA_formlist_btn_submitted": "Submitted",
  "OA_formlist_btn_orderbytime": "Time",
  "OA_formlist_btn_orderbytype": "Category",
  "OA_formlist_btn_orderbysubmitter": "Submitter",
  "OA_formlist_btn_orderbypriority": "Priority",
  "OA_formlist_btn_priority": "Sort",
  "OA_formlist_btn_cancel": "Cancel",
  "OA_formlist_btn_search": "Search",
  "OA_formlist_btn_approving": "Approving",
  "OA_formlist_text_counts": "50 most",
  "OA_formlist_OA_number": "OA Number",
  "OA_formlist_OA_data_submit": "Date of submittion",
  "OA_formlist_text_prompt_submit":"No requests in recent 3 months",
  "OA_formlist_text_prompt": "No forms to approve in recent 3 months",
  "OA_formlist_text_noapproval":"No Pending Requests",
  "OA_oaFormList_alert_network": "Network error",
  "OA_oaFormList_alert_prompt": "Prompt",
  "OA_oaFormList_alert_confirm": "Confirm",
  "OA_oaFormList_alert_effect": "Effect",
  "OA_oaFormList_alert_refused": "Refused",
  "OA_formlist_btn_searchdetail": "Subject/Submitter/Code",
  "OA_formlist_btn_refresh": "Refresh",
  "OA_costaccount_text_fill": "Expense Reimbursement Form",
  "OA_costaccount_text_basic_information": "Basic Information",
  "OA_costaccount_text_account_information": "Account Information",
  "OA_costaccount_text_travel_information": "Business Trip Information",
  "OA_costaccount_text_formtype": "FormType",
  "OA_costaccount_text_unit": "Unit",
  "OA_costaccount_text_budgettype": "BudgetType",
  "OA_costaccount_text_costcenter": "CostCenter",
  "OA_costaccount_text_paymentcompany": "PaymentCompany",
  "OA_costaccount_text_payee": "Payee",
  "OA_costaccount_text_receiptaccount": "ReceiptAccount",
  "OA_costaccount_text_receiptaccount_tip": "Please enter Payee account number",
  "OA_costaccount_text_bankname": "BnakName",
  "OA_costaccount_text_bankname_tip": "Please input BnakName",
  "OA_costaccount_text_cityofbank": "City",
  "OA_costaccount_text_cityofbank_tip": "Please enter Bank account location - city",
  "OA_costaccount_text_number_invoices": "Please enter Number of invoices",
  "OA_costaccount_text_numberofinvoice": "Invoices'number",
  "OA_costaccount_text_Apportionmentmonth": "Budget month",
  "OA_costaccount_text_budgetclassification": "Budget classification",
  "OA_costaccount_text_remarks": "Remarks",
  "OA_costaccount_text_next": "Next",
  "OA_costaccount_text_prompt": "APP only supports single cost center, single budget classifications Expense reimbursement form",
  "OA_costaccount_text_limited": "Limited to 800 charecters most",
  "OA_Newcostaccount_alert_fill": "With * can not be empty!",
  "OA_Newcostaccount_alert_invoice": "The  number of invoices must be positive integer.",
  "OA_Newcostaccount_text_formtype": "Expense Reimbursement Form",
  "OA_Newcostaccount_text_costcenterorbudgettype": "Single Costcenter and BudgetType",
  "OA_Newcostaccount_alert_network": "Network Error",
  "OA_Newcostaccount_alert_prompt": "Prompt",
  "OA_Newcostaccount_alert_confirm": "Confirm",
  "OA_additemdetail_text_itemdetail": "Itemdetail",
  "OA_recipient_item_detail": "recipientItemDetail",
  "OA_additemdetail_btn_add": "Add",
  "OA_additemdetail_text_itemdetailtotalamount": "TotalAmount",
  "OA_additemdetail_text_item": "Item",
  "OA_additemdetail_text_date": "Date",
  "OA_additemdetail_text_amount": "Amount",
  "OA_additemdetail_text_explanation": "Reason",
  "OA_additemdetail_content_prompt": "No itemdetail, Please add first.",
  "OA_additemdetail_btn_back": "Back",
  "OA_additemdetail_btn_submit": "Submit",
  "OA_additemdetail_btn_submitting": "Submitting",
  "OA_AddItemDetail_alert_fill": "With * can not be empty!",
  "OA_AddItemDetail_alert_AddPrompt": "Prompt",
  "OA_AddItemDetail_alert_cancel": "Cancel",
  "OA_AddItemDetail_alert_confirm": "Confirm",
  "OA_AddItemDetail_alert_addsucessful": "Successfully added",
  "OA_AddItemDetail_alert_network": "Network Error",
  "OA_AddItemDetail_alert_ConfirmSubmit": "Are you sure to submit?",
  "OA_AddItemDetail_alert_ConfirmSubmit_Error": "Submit Error",
  "OA_AddItemDetail_alert_FormatofAmount": "The format of amout is incorrect!",
  "OA_AddItemDetail_alert_Confirmdelete": "Are you sure to delete?",
  "OA_AddItemDetail_alert_Prompt": "Prompt",
  "OA_itemDetailModal_text_itemdetail": "Itemdetail",
  "OA_itemDetailModal_text_item": "Item",
  "OA_itemDetailModal_text_startdate": "StartDate",
  "OA_itemDetailModal_text_amount": "Amount",
  "OA_itemDetailModal_text_explanation": "Reason",
  "OA_itemDetailModal_btn_add": "Add",
  "OA_itemDetailModal_btn_select": "Please select",
  "OA_itemDetailModal_text_limited": "Limited to 800 charecters most.",
  "OA_travelaccount_text_prompt": "The mobile only supports single expense center, single budget classification, and no monthly expense reimbursement form",
  "OA_travelaccount_text_formtype": "Formtype",
  "OA_travelaccount_text_unit": "Unit",
  "OA_travelaccount_text_budgettype": "BudgetType",
  "OA_travelaccount_text_costcenter": "CostCenter",
  "OA_travelaccount_text_paymentcompany": "Paymentcompany",
  "OA_travelaccount_text_startdate": "StartDate",
  "OA_travelaccount_text_enddate": "EndDate",
  "OA_travelaccount_text_address": "Address",
  "OA_travelaccount_text_address_place": "Please enter Business Trip Loction",
  "OA_travelaccount_text_reason": "Reason",
  "OA_travelaccount_text_payee": "Payee",
  "OA_travelaccount_text_payee_name": "Please enter Payee",
  "OA_travelaccount_text_receiptaccount": "ReceiptAccount",
  "OA_travelaccount_text_bankname": "BankName",
  "OA_travelaccount_text_cityofbank": "CityofBank",
  "OA_travelaccount_text_numberofinvoice": "Invoice NO.",
  "OA_travelaccount_text_Apportionmentmonth": "Apportionment month",
  "OA_travelaccount_text_budgetclassification": "BudgetClassification",
  "OA_travelaccount_text_select_budgettype": "Budget classification inquiry",
  "OA_travelaccount_text_company_inquiry": "Payment company inquiry",
  "OA_travelaccount_text_remarks": "Remarks",
  "OA_travelaccount_text_next": "Next",
  "OA_travelItem_text_itemdetail": "ItemDetail",
  "OA_travelItem_btn_add": "Add",
  "OA_travelItem_text_ItemdetailtotalAmount": "TotalAmount",
  "OA_travelItem_text_item": "Item",
  "OA_travelItem_text_amount": "Amount",
  "OA_travelItem_text_explanation": "Reason",
  "OA_travelItem_text_prompt": "No itemdetail, Please add first.",
  "OA_travelItem_btn_back": "Back",
  "OA_travelItem_btn_submit": "Submit",
  "OA_travelitemDetailModal_text_choose": "Please select",
  "OA_travelitemDetailModal_text_itemdetail": "ItemDetail",
  "OA_travelitemDetailModal_text_item": "Item",
  "OA_travelitemDetailModal_text_select": "Please select",
  "OA_travelitemDetailModal_text_Amount": "Amount",
  "OA_travelitemDetailModal_text_explanation": "Reason",
  "OA_travelitemDetailModal_btn_add": "Add",
  "OA_travelaccount_text_fill": "Travel Expense Reimbursement",
  "OA_NewtravelAccount_alert_date": "The end date  must be later than start date!",
  "OA_NewtravelAccount_alert_warning": "Warning",
  "OA_NewtravelAccount_alert_fill": "With * can not be empty!",
  "OA_NewtravelAccount_text_formtype": "Travel Expense Reimbursement Form",
  "OA_NewtravelAccount_text_costcenterorbudgettype": "Single Costcenter and BudgetType",
  "OA_NewtravelAccount_alert_network": "Network error",
  "OA_NewtravelAccount_alert_prompt": "Prompt",
  "OA_NewtravelAccount_alert_confirm": "Confirm",
  "OA_NewtravelItem_alert_added": "The item has already been added. ",
  "OA_NewtravelItem_alert_itemdetail": "Please add item detail.",
  "OA_NewtravelItem_alert_prompt": "prompt",
  "OA_NewtravelItem_alert_cancel": "Cancel",
  "OA_NewtravelItem_alert_Confirm": "Confirm",
  "OA_NewtravelItem_alert_AddedSuccessfully": "Added Successfully!",
  "OA_NewtravelItem_alert_network": "Network error",
  "OA_NewtravelItem_list_flightandcar": "Air or car tickets",
  "OA_NewtravelItem_list_airconstructionfee": "Airport Construction Fee",
  "OA_NewtravelItem_list_taxi": "Taxi",
  "OA_NewtravelItem_list_hotel": "Hotel",
  "OA_NewtravelItem_list_Hospitality": "Hospitality Fee",
  "OA_NewtravelItem_list_correspondence": "Correspondence Fee",
  "OA_NewtravelItem_list_Conference": "Conference Fee",
  "OA_NewtravelItem_list_Miscellaneous": "Miscellaneous fees",
  "OA_NewtravelItem_list_Gift": "Gift",
  "OA_NewtravelItem_list_others": "Others",
  "OA_NewtravelItem_list_formatofAmount": "The format of amout is incorrect!",
  "OA_travelaccount_text_select": "Please select",
  "OA_travelaccount_text_Limited": "Limited to 800 charecters most.",
  "OA_NewtravelAccount_alert_formatofinvoice": "The  number of invoices must be positive integer.",
  "OA_NewtravelItem_open": "Unfold",
  "OA_NewtravelItem_close": "Fold",
  "OA_authListCtrl_status_NotStarted": "NotStarted",
  "OA_authListCtrl_status_ongoing": "ongoing",
  "OA_authListCtrl_status_completed": "completed",
  "OA_authListCtrl_btn_Enabled": "Enabled",
  "OA_authListCtrl_btn_Disabled": "Disabled",
  "OA_authlist_text_authorization": "Authorization",
  "OA_authlist_alert_refreash": "Down to Refreash",
  "OA_authlist_text_startdate": "StartDate",
  "OA_authlist_text_enddate": "EndDate",
  "OA_authlist_alert_counts": "No Authorized records in recent 3 months.",
  "OA_authupdateAndAdd_text_startdate": "StartDate",
  "OA_authupdateAndAdd_text_select": "Please select",
  "OA_authupdateAndAdd_text_enddate": "EndDate",
  "OA_authupdateAndAdd_text_agent": "Agent",
  "OA_authupdateAndAdd_text_delete": "Delete",
  "OA_authupdateAndAdd_text_update": "Update",
  "OA_authupdateAndAdd_text_authorize": "Authorize",
  "OA_authupdateAndAdd_text_authorize_history": "Authorized records",
  "OA_authupdateAndAdd_text_search": "Fullname or Firstname",
  "OA_authUpdateAndAddCtrl_text_add": "Add authorization",
  "OA_authUpdateAndAddCtrl_text_update": "Update",
  "OA_authUpdateAndAddCtrl_text_end":"End",
  "OA_authUpdateAndAddCtrl_alert_prompt": "Prompt",
  "OA_authUpdateAndAddCtrl_alert_confirm": "Confirm",
  "OA_authUpdateAndAddCtrl_alert_enable": "Enabled",
  "OA_authUpdateAndAddCtrl_alert_updatefailed": "Update Failed",
  "OA_authUpdateAndAddCtrl_alert_deletefailed": "Delate Failed",
  "OA_authUpdateAndAddCtrl_alert_warning": "Warning",
  "OA_authUpdateAndAddCtrl_alert_confirmdelete": "Are you sure to delete?",
  "OA_authUpdateAndAddCtrl_alert_confirmend": "Are you sure to end?",
  "OA_authUpdateAndAddCtrl_alert_cancel": "Cancel",
  "OA_authUpdateAndAddCtrl_alert_confirm": "Confirm",
  "OA_authUpdateAndAddCtrl_alert_selectstartdate": "Please select startdate",
  "OA_authUpdateAndAddCtrl_alert_selectenddate": "Please select enddate",
  "OA_authUpdateAndAddCtrl_alert_selectagent": "Please select agent",
  "OA_authUpdateAndAddCtrl_alert_authorizefailed": "Authorize Failed",
  "OA_authupdateAndAdd_text_choose": "Please select",
  "OA_addpointsapplydetail_text_formdetail": "Form detail",
  "OA_addpointsapplydetail_alert_refreash": "Down to Refreash",
  "OA_addpointsapplydetail_text_operator": "Operator",
  "OA_addpointsapplydetail_text_applynumber": "OA Number",
  "OA_addpointsapplydetail_text_applytime": "Apply time",
  "OA_addpointsapplydetail_text_applystatus": "Status",
  "OA_addpointsapplydetail_text_approving": "Approving",
  "OA_addpointsapplydetail_text_Expectedapprovers": "Expected approvers",
  "OA_addpointsapplydetail_text_Costcenter": "Costcenter",
  "OA_addpointsapplydetail_text_itemname": "Itemname",
  "OA_addpointsapplydetail_text_itemnumber": "Itemnumber",
  "OA_addpointsapplydetail_text_totalpoints": "Totalpoints",
  "OA_addpointsapplydetail_text_amount": "Totalcost",
  "OA_addpointsapplydetail_text_remark": "Remark",
  "OA_addpointsapplydetail_text_attachment": "Attachments",
  "OA_addpointsapplydetail_text_workflowlog": "Workflowlogs",
  "OA_AddPointsApplyDetailCtrl_text_explanation": "Explanation",
  "OA_AddPointsApplyDetailCtrl_text_approval comments": "Please fill in approval comments",
  "OA_AddPointsApplyDetailCtrl_text_approval explanationRequired": "Explanation(Required)",
  "OA_AddPointsApplyDetailCtrl_text_refuse": "Refuse",
  "OA_AddPointsApplyDetailCtrl_text_ReasontoRefuse": "Please fill in the reason for refusing",
  "OA_AddPointsApplyDetailCtrl_text_NoMoreForms": "Approval has been completed. Please refresh and continue",
  "OA_businesscardprintingdetail_text_companyChinese": "biz_company_cn",
  "OA_businesscardprintingdetail_text_companyEnglish": "biz_company_en",
  "OA_businesscardprintingdetail_text_nameChinese": "applicant_name_cn",
  "OA_businesscardprintingdetail_text_nameEnglish": "applicant_name_en",
  "OA_businesscardprintingdetail_text_positionChinese": "position_cn",
  "OA_businesscardprintingdetail_text_positionEnglish": "position_en",
  "OA_businesscardprintingdetail_text_departmentChinese": "Dept_cn",
  "OA_businesscardprintingdetail_text_departmentEnglish": "Dept_en",
  "OA_businesscardprintingdetail_text_addressChinese": "Addr_cn",
  "OA_businesscardprintingdetail_text_addressEnglish": "Addr_en",
  "OA_businesscardprintingdetail_text_officetelphone": "Office_telephone",
  "OA_businesscardprintingdetail_text_officefaxnumber": "Fax_telephone",
  "OA_businesscardprintingdetail_text_mobilephone": "Mobile_phone",
  "OA_businesscardprintingdetail_text_email": "E_mail",
  "OA_businesscardprintingdetail_text_wechatID": "Personal_wechat",
  "OA_businesscardprintingdetail_text_numberofboxes": "Apply_number",
  "OA_chapterBusinessdetail_text_chapter_company": "Company",
  "OA_chapterBusinessdetail_text_chapter_department": "Dept.",
  "OA_chapterBusinessdetail_text_chapter_reason": "Apply reason",
  "OA_ChapterInvestmentdetail_text_filetype": "Filetype",
  "OA_ChapterInvestmentdetail_text_reason": "Reason",
  "OA_ChapterSealEngravingdetai_text_stamper_usefor": "Stamper_usefor",
  "OA_ChapterSealEngravingdetai_text_stamper_unit": "Stamper_unit",
  "OA_ChapterSealEngravingdetai_text_stamper_content": "Stamper_content",
  "OA_ChapterSealEngravingdetai_text_remark": "Remark",
  "OA_contractpaymentdetail_text_paymentpayee": "Payee",
  "OA_contractpaymentdetail_text_contractnumber": "Contract number",
  "OA_contractpaymentdetail_text_totalcontractamount": "Total contract amount",
  "OA_contractpaymentdetail_text_unsure": "Unsure",
  "OA_contractpaymentdetail_text_amountpaid": "Amount paid",
  "OA_contractpaymentdetail_text_amountpaidforthistime": "Amount paid this time",
  "OA_contractpaymentdetail_text_amountpaidforthistimeRMB": "RMB",
  "OA_contractpaymentdetail_text_depositforthistime": "Deposit amount this time",
  "OA_contractpaymentdetail_text_depositforthistimeRMB": "RMB",
  "OA_contractpaymentdetail_text_depositoffsetforthistime": "Deposit offset this time",
  "OA_contractpaymentdetail_text_depositoffsetforthistimeRMB": "RMB",
  "OA_contractpaymentdetail_text_paymentbalance": "Overdraft balance",
  "OA_contractpaymentdetail_text_paymentreason": "Payment reason",
  "OA_contractpaymentdetail_text_allocationtime": "Budget allocation time",
  "OA_contractpaymentdetail_text_budgetproportion": "Budget ratio",
  "OA_contractpaymentdetail_text_multiplecostcenter": "Multiple costcenter",
  "OA_costaccountdetail_text_expensetype": "Expense type",
  "OA_costaccountdetail_text_totalamount": "Total amount",
  "OA_costaccountdetail_text_dateofoccurance": "Date",
  "OA_costaccountcontroller_text_prompt": "Please add item on computer first",
  "OA_costticketsapplydetail_text_tickettype": "Coupons'type",
  "OA_costticketsapplydetail_text_ticketform": "Coupons'form",
  "OA_costticketsapplydetail_text_ticketnumber": "Coupons'number",
  "OA_costticketsapplydetail_text_dateofeffect": "Date of effect",
  "OA_costticketsapplydetail_text_ticketname": "Coupons'name",
  "OA_costticketsapplydetail_text_ticketnature": "Coupons'nature",
  "OA_costticketsapplydetail_text_amount": "Released amount",
  "OA_costticketsapplydetail_text_expectedcost": "Estimated cost",
  "OA_costticketsapplydetail_text_expecteduserate": "Estimated use rate",
  "OA_couponapplydetail_text_couponsnumber": "Coupons number",
  "OA_delieverydetail_text_recipientaddress": "Recipient address",
  "OA_delieverydetail_text_recipientname": "Recipient name",
  "OA_delieverydetail_text_recipientphone": "Recipient phone",
  "OA_delieverydetail_text_carrier": "Carrier",
  "OA_delieverydetail_text_waybillnumber": "Waybill number",
  "OA_delieverydetail_text_expresstype": "Express type",
  "OA_delieverydetail_text_expressdetail": "Express detail",
  "OA_devicepurchasedetail_text_model": "Model",
  "OA_devicepurchasedetail_text_quantity": "Quantity",
  "OA_devicepurchasedetail_text_unitprice": "Amount",
  "OA_devicepurchasedetail_text_totalprice": "Totalprice",
  "OA_devicepurchasedetail_text_explanation": "Explanation",
  "OA_devicepurchasedetail_text_auditdepartment": "Audit Dept.",
  "OA_fixedassertallocationdetail_text_Affiliatedcompany": "Affiliated Co.",
  "OA_fixedassertallocationdetail_text_fromdepartment": "Dept.(from)",
  "OA_fixedassertallocationdetail_text_todepartment": "Dept.(to)",
  "OA_fixedassertallocationdetail_text_assettype": "Asset type",
  "OA_fixedassertallocationdetail_text_assetnumber": "Asset number",
  "OA_fixedassertallocationdetail_text_usedate": "Asset usedate",
  "OA_fixedassertallocationdetail_text_place": "Asset site",
  "OA_fixedassetsapplydetail_text_receiptdepartment": "Receipt Dept.",
  "OA_fixedassetsapplydetail_text_auditnumber": "Audit number",
  "OA_fixedassetsscrappeddetail_text_scrappeddepartment": "Scrapped Dept.",
  "OA_fixedassetsscrappeddetail_text_residualvalue": "Actual amount",
  "OA_formbutton_btn_countersign": "Countersign",
  "OA_formbutton_btn_approval": "Approval",
  "OA_formbutton_btn_refuse": "Refuse",
  "OA_formbutton_btn_next": "Next",
  "OA_giftcollardetail_text_customername": "Customer name",
  "OA_giftcollardetail_text_applyforuse": "Apply for use",
  "OA_giftcollardetail_text_giftdetail": "Gift detail",
  "OA_giftcollardetail_text_giftname": "Gift name",
  "OA_giftcollardetail_text_listofitems": "List of items",
  "OA_incomecontractreviewdetail_text_contractingcompany": "Contracting Co.",
  "OA_incomecontractreviewdetail_text_contractnumber": "Contract number",
  "OA_incomecontractreviewdetail_text_contractname": "Contract name",
  "OA_incomecontractreviewdetail_text_agreementunit": "Agreement unit",
  "OA_incomecontractreviewdetail_text_contractamount": "Contract amount",
  "OA_incomecontractreviewdetail_text_contractdeposit": "Contract deposit",
  "OA_incomecontractreviewdetail_text_keyword": "Keyword",
  "OA_incometicketsapplydetail_text_couponsissuingcompany": "Issuing company",
  "OA_incometicketsapplydetail_text_couponsdiscountrate": " Discount rate",
  "OA_incometicketsapplydetail_text_couponsactualreceipt": "Actual receipts",
  "OA_incometicketsapplydetail_text_limit": "Contract Term",
  "OA_letterdetail_text_letterdetai": "Letter detail",
  "OA_letterdetail_text_letteritemdetai": "Letter itemdetail",
  "OA_letterdetail_text_totalquantity": "Total quantity",
  "OA_letterdetail_text_lettertype": "Letter type",
  "OA_MICEgroupapplydetail_text_miceteamnumer": "TeamNumber",
  "OA_MICEgroupapplydetail_text_miceteamamount": "TeamAmount",
  "OA_joinerctrl_alert_timeout": "Time out.",
  "OA_joinerctrl_alert_chooseotherperson": "countersignature can not be yourself.",
  "OA_joinerctrl_alert_alreadychoosed": "You have already countersigned  the person.",
  "OA_joinerctrl_alert_choosesomeone": "Please choose someone to countersign.",
  "OA_joiner_text_add": "Add countersignature",
  "OA_joiner_text_name": "Added list",
  "OA_joiner_text_addhistory": "Added history",
  "OA_joiner_text_addedlist": "Please fill in the reason for countersigning.",
  "OA_joiner_text_add_prompt": "Null is forbidden",
  "OA_joiner_text_select": "Optional",
  "OA_officesuppliescollardetail_text_itemname": "Itemname",
  "OA_officesuppliescollardetail_text_officesuppliesdetail": "Office supplies detail",
  "OA_pointspolicyapply_text_integralname": "Integral name",
  "OA_pointspolicyapply_text_integraltype": "Integral type",
  "OA_pointspolicyapply_text_releasedintegral": "Total points",
  "OA_pointspolicyapply_text_expectedintegral": "Expected annual points ",
  "OA_pointspolicyapply_text_integralrule": "Integral rule",
  "OA_purchasecontractreview_text_vendor": "Vendor",
  "OA_sendcardetail_text_usecarreason": "Use reason",
  "OA_sendcardetail_text_usecardetail": "Sendcar detail",
  "OA_sendcardetail_text_usecardate": "Use Date",
  "OA_sendcardetail_text_usecarorigin": "Origin",
  "OA_sendcardetail_text_usecardestination": "Destination",
  "OA_staffloandetail_text_applyamount": "Application amount",
  "OA_feereport_text_feepeport": "Fee report",
  "OA_feereportCtrl_text_used": "Used",
  "OA_feereportCtrl_text_unused": "Unused",
  "OA_feereportCtrl_text_costrate": "Fee ratio",
  "OA_feereportCtrl_text_withoutbudget": "Without budget",
  "OA_feereportCtrl_text_Errorofbudget": "Error with accessing budget of cost center",
  "OA_feereportCtrl_budgettop10": "Budget Top10",
  "OA_feereportCtrl_text_Errorofallbudget": "Error with accessing all variety of budget of cost center",
  "OA_feereportCtrl_personalfeetop10": "Personal fee Top10",
  "OA_feereportCtrl_text_Erroroffee": "Error with accessing fee of cost center",
  "OA_feereportCtrl_text_Q1costrate": "Q1 fee ratio",
  "OA_feereportCtrl_text_userate": "Use rate",
  "OA_feereportCtrl_text_totalbudget": "Total budget: ",
  "OA_feereportCtrl_text_usedrate": "Used rate：",
  "OA_feereportCtrl_text_year": "-",
  "OA_feereportCtrl_text_month":" ",
  "OA_applyapproval_text_countersign": "Add countersign",
  "OA_applyapproval_text_searchcountersign": "Search countersign",
  "OA_formdetail_text_viewexpectedapprovers": "View expected approvers",
  "eform_warning": "warn",
  "eform_network": "no network",
  "eform_title": "Approval",
  "eform_index_tab_all": "All",
  "eform_index_tab_ehr": "EHR",
  "eform_index_refresher": "Drop refresh",
  "eform_index_order_time": "Time",
  "eform_index_order_user": "Applicant",
  "eform_index_order_subject": "Subject",
  "eform_index_span_sign": "allograph",
  "eform_index_span_joinsign": "countersign",
  "eform_index_noapp_tip": "There is no approval form for you at present",
  "eform_index_nooa_tip": "OA not supported，coming soon",
  "eform_index_click_goauth": "Authorization",
  "eform_index_click_goauthlist": "My Authorization",
  "eform_index_toggle_showjoinapp": "show countersign",
  "eform_index_OAgetAgentList_tipinfo": "OA authorization list failed to obtain",
  "eform_index_OAupdateAgent_tipinfo": "OA authorization failed to recover",
  "eform_index_EhrgetAgentList_tipinfo": "EHR authorization list failed to obtain",
  "eform_index_EhrupdateAgent_tipinfo": "EHR authorization failed to recover",
  "eform_index_ITAgent_tipinfo": "IT authorization failed to recover",
  "eform_index_AllAgent_tipinfo": "Your permissions have been fully recovered",
  "eform_it_span_process": "Approval process",
  "eform_it_checkbox_all": "Select",
  "eform_it_checkbox_selected": "Selected",
  "eform_it_checkbox_item": "items",
  "eform_it_btn_joindecline": "Decline",
  "eform_it_btn_joinapprove": "Approve",
  "eform_it_btn_next": "Next",
  "eform_it_btn_signer": "signer",
  "eform_it_btn_decline": "Decline",
  "eform_it_btn_approve": "Approved",
  "eform_it_status_pending": "Pending",
  "eform_it_status_approve": "Approve",
  "eform_it_status_decline": "Decline",
  "eform_it_status_cancel1": "The node has been canceled ",
  "eform_it_status_cancel2": "The higher node has been canceled",
  "eform_it_warn_noselect": "You haven't chosen any documents",
  "eform_it_warn_noreason": "Please enter the reason!",
  "eform_it_warn_goctripteam": "Failed to get jump information!",
  "eform_itjoin_title": "Add signer",
  "eform_itjoin_search_name": "Name",
  "eform_itjoin_search_initials": "Initials",
  "eform_itjoin_search_pinyin": "Pinyin",
  "eform_itjoin_search_ad": "Account",
  "eform_itjoin_search_cancel": "cancel",
  "eform_itjoin_signer_history": "history",
  "eform_itjoin_signer_list": "List added",
  "eform_itjoin_signer_reason": "Please fill in the reasons",
  "eform_itjoin_reason_placeholder": "optional",
  "eform_itjoin_btn_cancel": "Cancel",
  "eform_itjoin_btn_ok": "OK",
  "eform_itjoin_warn_self": "cannot choose yourself as a signer",
  "eform_itjoin_warn_selected": "This person has been selected",
  "eform_itjoin_warn_nosigner": "Please choose signer",
  "eform_ehr_span_leavedate": "Leave date",
  "eform_ehr_span_datehours": "Daily hours",
  "eform_ehr_span_leavedaynum": "Hours of leave",
  "eform_ehr_span_day": "day",
  "eform_ehr_span_hours": "hours",
  "eform_ehr_span_tips": "instruction",
  "eform_ehr_batchApplyTitle": "Leave Application Form",
  "eform_ehr_noAduiterList": "Approval flow is empty!",
  "eform_ehr_status_0": "Pending",
  "eform_ehr_status_1": "Approved",
  "eform_ehr_status_3": "Countersigned",
  "eform_ehr_status_4": "Canceled",
  "eform_ehr_status_5": "Canceled",
  "eform_ehr_AuditerStatus_3": "The document is countersigned。",
  "eform_ehr_sign_comment": "Please fill out your comments",
  "eform_ehr_sign_reason": "Please fill out your reason",
  "eform_remedy_span_Apprvoers": "Approver",
  "eform_remedy_span_Summary": "Summary",
  "eform_remedy_span_Detail": "Description",
  "eform_AccreditList_view_title": " My Authorized",
  "eform_AccreditList_tabs_all": "All",
  "eform_AccreditList_tabs_remedy": "Remedy",
  "eform_AccreditList_refresher_pullingText": "Pull Refresh...",
  "eform_AccreditList_div_noApproving": "There is no authorize records",
  "eform_AccreditList_div_timeUntil": "To",
  "eform_AccreditList_div_deadline": "Deadline",
  "eform_AccreditList_checkbox_all": "Select All",
  "eform_AccreditList_button_takeBack": "Revoke",
  "eform_AccreditListCtrl_item_status": "vaild",
  "eform_AccreditListCtrl_jsListStatus_authIn": "valid",
  "eform_AccreditListCtrl_jsListStatus_unBegin": "Not begin",
  "eform_AccreditListCtrl_jsrole_all": "All Roles",
  "eform_AccreditListCtrl_jsOnDelete_template": "You will revoke this authorization",
  "eform_AccreditListCtrl_jsOnDelete_title": "Reminder",
  "eform_AccreditListCtrl_jsOnDelete_buttonOK": "Revoke",
  "eform_AccreditListCtrl_jsOnDelete_buttonCancel": "Think Again",
  "eform_AccreditListCtrl_jsGetAuthList_callbackError": "Ehr authorization list failed to obtain. Please try again later",
  "eform_AccreditListCtrl_jsAuditAuthorizeQuery_callbackError": "IT authorization list failed to obtain. Please try again later",
  "eform_AccreditListCtrl_jsQueryalternate_statusError": "Remedy authorization list failed to obtain. Please try again later",
  "eform_AccreditListCtrl_jsSelectAll_selectNone": "You didn't select the object",
  "eform_AccreditListCtrl_jsOAupdateAgent_callbackError": "OA authorization failed to revoke. Please try again later",
  "eform_AccreditListCtrl_jsCancelAuth_callbackError": "Ehr authorization failed to revoke. Please try again later",
  "eform_AccreditListCtrl_jsAuditAuthorizeDelete_callbackError": "IT authorization failed to revoke. Please try again later",
  "eform_AccreditListCtrl_jsRemedyCancel_callbackError": "Remedy authorization failed to revoke. Please try again later",
  "eform_AccreditListCtrl_jsWaitDelete_deleteSuccess": "Revoking authority successed",
  "eform_updateAccredit_view_title": "Authorization",
  "eform_updateAccredit_button_submit": "submit",
  "eform_updateAccredit_inputLable_startDate": "Start Date",
  "eform_updateAccredit_p_select": "Please Select",
  "eform_updateAccredit_inputLable_endDate": "End Date",
  "eform_updateAccredit_inputLable_Agent": "Agent",
  "eform_updateAccredit_input_placeholder": "Fullname/Firstname/Account",
  "eform_updateAccredit_span_searchHistory": "Search History",
  "eform_updateAccredit_label_clearSearchHistory": "Clear search history",
  "eform_updateAccredit_div_tip": "*The Agent which filled in the below form  have priority.There are Optional.",
  "eform_accreditCtrl_jsmonthList_Jan": "Jan",
  "eform_accreditCtrl_jsmonthList_Feb": "Feb",
  "eform_accreditCtrl_jsmonthList_Mar": "Mar",
  "eform_accreditCtrl_jsmonthList_Apr": "Apr",
  "eform_accreditCtrl_jsmonthList_May": "May",
  "eform_accreditCtrl_jsmonthList_June": "June",
  "eform_accreditCtrl_jsmonthList_July": "July",
  "eform_accreditCtrl_jsmonthList_Aug": "Aug",
  "eform_accreditCtrl_jsmonthList_Sep": "Sep",
  "eform_accreditCtrl_jsmonthList_Oct": "Oct",
  "eform_accreditCtrl_jsmonthList_Nov": "Nov",
  "eform_accreditCtrl_jsmonthList_Dec": "Dec",
  "eform_accreditCtrl_jsweeklist_Sun": "S",
  "eform_accreditCtrl_jsweeklist_Mon": "M",
  "eform_accreditCtrl_jsweeklist_Tues": "T",
  "eform_accreditCtrl_jsweeklist_Wed": "W",
  "eform_accreditCtrl_jsweeklist_Thur": "T",
  "eform_accreditCtrl_jsweeklist_Fri": "F",
  "eform_accreditCtrl_jsweeklist_Sat": "S",
  "eform_accreditCtrl_jsdatePopup_todayLabel": "Today",
  "eform_accreditCtrl_jsdatePopup_closeLabel": "Cancel",
  "eform_accreditCtrl_jsdatePopup_setLabel": "OK",
  "eform_accreditCtrl_jsAlert_warnTitle": "Warning",
  "eform_accreditCtrl_jsAlert_warnInfo": "The start time must be less than the end time！",
  "eform_accreditCtrl_jsAlert_startPopup": "Start Date",
  "eform_accreditCtrl_jsAlert_endPopup": "End Date",
  "eform_accreditCtrl_jsScope_httpAlert": "Network request timeout!",
  "eform_accreditCtrl_jsPopup_title": "Hint",
  "eform_accreditCtrl_jsTipInfo_noRole": "You have no role to authorize",
  "eform_accreditCtrl_jsTipInfo_busyNetwork": "The network is busy, please wait a moment",
  "eform_accreditCtrl_jsTipInfo_ehrError": "EHR authorization failed. Please try again later",
  "eform_accreditCtrl_jsTipInfo_itError": "IT authorization failed. Please try again later",
  "eform_accreditCtrl_jsTipInfo_oaError": "OA authorization failed. Please try again later",
  "eform_accreditCtrl_jsTipInfo_openLicense": "You didn't open the permissions of the authorization.",
  "eform_accreditCtrl_jsTipInfo_noDate": "Please select date",
  "eform_accreditCtrl_jsTipInfo_noOaAgent": "OA agent,please",
  "eform_accreditCtrl_jsTipInfo_noITAgent": "IT agent,please",
  "eform_accreditCtrl_jsTipInfo_noEhrAgent": "Ehr agent,please",
  "eform_accreditCtrl_jsTipInfo_noRemedyAgent": "Remedy agent,please",
  "eform_accreditCtrl_jsTipInfo_approveSuccess": "Authorization successed",
  "ehr_quit_title": "Pending",
  "ehr_quit_btn_refresh": "Refresh",
  "ehr_quit_p_docutype": "Resignation Application",
  "ehr_quit_p_basicinfo": "Basic Info",
  "ehr_quit_p_approvalinfo": "Approval Info",
  "ehr_quit_p_process": "Workflow",
  "ehr_quit_p_applicant": "Applicant",
  "ehr_quit_p_applyDate": "Apply date",
  "ehr_quit_p_department": "Department",
  "ehr_quit_p_hireValid": "Date of Enrollment",
  "ehr_quit_p_EmpLevel": "Rank",
  "ehr_quit_p_ProbationEndDate": "Trial Period End Date",
  "ehr_quit_p_ContractEndDate": "End Date",
  "ehr_quit_p_QuitType": "Dismissal Reason",
  "ehr_quit_p_PulishID": "Pulish Document NO.",
  "ehr_quit_p_EmpAttribute": "Employment Type",
  "ehr_quit_p_ContractLimit": "Contract Term",
  "ehr_quit_p_QuitStyle": "Termination Reason",
  "ehr_quit_p_QuitReason": "Resignation Reason",
  "ehr_quit_p_IsMakeUp": "Compensatory Dismissal",
  "ehr_quit_p_AvgSalary": "Average monthly salary",
  "ehr_quit_p_AgeReference": "Employment Period",
  "ehr_quit_p_Compensation": "Compensation Amount",
  "ehr_quit_p_MakeUpType": "Compensation Reason",
  "ehr_quit_p_MakeUpProcess": "Calculate Compensation",
  "ehr_quit_p_QuitRemark": "Remarks",
  "ehr_quit_p_EmpType": "Classification",
  "ehr_quit_p_Injury": "Injury Information",
  "ehr_quit_p_ItemList": "Handover Checklist",
  "ehr_quit_btn_Pass": "Pass",
  "ehr_quit_btn_AddCounter": "signer",
  "ehr_quit_btn_Refuse": "Refuse",
  "ehr_quit_btn_ReApplicant": "Return to the applicant",
  "ehr_quit_btn_ReApproval": "Return to the previous",
  "ehr_quit_label_IsCompetition": "implement Competition Agreement or not",
  "ehr_quit_label_QuitCode": "Resignation Code",
  "ehr_quit_label_QuitReaonRemark": "Resignation reason remarks",
  "ehr_quit_label_HRNotes": "HR Remarks",
  "ehr_quit_label_AccCloseDate": "Account close date",
  "ehr_quit_label_TerminationMonth": "Month of last day",
  "ehr_quit_label_IsCardReturn": "Access Card",
  "ehr_quit_label_IsHandBook": "Employee Manual",
  "ehr_quit_label_select": "Please select",
  "ehr_quit_jsalert_warn": "warn",
  "ehr_quit_jsalert_Network": "no network",
  "ehr_quit_jsalert_noAduiterList": "Approval flow is empty",
  "ehr_quit_jstext_Status0": "Pending",
  "ehr_quit_jstext_Status1": "Approved",
  "ehr_quit_jstext_Status3": "Countersigned",
  "ehr_quit_jstext_Status4": "Canceled",
  "ehr_quit_jstext_Status5": "Canceled",
  "ehr_quit_jsalert_min": "Date need be after",
  "ehr_quit_jsalert_max": "Date need start",
  "ehr_quit_jsdate_Jan": "Jan",
  "ehr_quit_jsdate_Feb": "Feb",
  "ehr_quit_jsdate_Mar": "Mar",
  "ehr_quit_jsdate_Apr": "Apr",
  "ehr_quit_jsdate_May": "May",
  "ehr_quit_jsdate_June": "June",
  "ehr_quit_jsdate_July": "July",
  "ehr_quit_jsdate_Aug": "Aug",
  "ehr_quit_jsdate_Sep": "Sep",
  "ehr_quit_jsdate_Oct": "Oct",
  "ehr_quit_jsdate_Nov": "Nov",
  "ehr_quit_jsdate_Dec": "Dec",
  "ehr_quit_jsdate_Sun": "S",
  "ehr_quit_jsdate_Mon": "M",
  "ehr_quit_jsdate_Tues": "T",
  "ehr_quit_jsdate_Wed": "W",
  "ehr_quit_jsdate_Thur": "T",
  "ehr_quit_jsdate_Fri": "F",
  "ehr_quit_jsdate_Sat": "S",
  "ehr_quit_jsdate_selectDate": "select date",
  "ehr_quit_jsdate_todayLabel": "Today",
  "ehr_quit_jsalert_cancel": "Cancel",
  "ehr_quit_jsalert_confirm": "Confirm",
  "ehr_quit_jsalert_IsCompetition": "Please select if a Non-Competition Agreement will be implemented.",
  "ehr_quit_jsalert_QuitCode": "Please select Resignation Code",
  "ehr_quit_jsalert_QuitReaonRemark": "Resignation reason remarks",
  "ehr_quit_jsalert_HRNotes": "HR Remarks",
  "ehr_quit_jsalert_AccCloseDate": "Please select the Account close date.",
  "ehr_quit_jsalert_TerminationMonth": "Please select the Month of last day of employment.",
  "ehr_quit_jsalert_success": "success",
  "ehr_quit_jsalert_comment": "Please fill out your comments",
  "ehr_quit_jsalert_ispass": "Are you sure you want approve?",
  "ehr_quit_jsalert_isRefuse": "Are you sure you want refuse?",
  "ehr_quit_jsalert_reason": "Please fill out your reason",
  "ehr_quit_label_SJLZRQ": "Last day of employment",
  "ehr_quit_label_QXZSJLZRQ": "Please select the last day of employment.",
  "ehr_quit_label_QYWHSC": "Ctrip Culture Manual",
  "ehr_quit_p_BZ": "Currency",
  "ehr_addCountersign_title": "Add signer",
  "ehr_addCountersign_search_name": "Name",
  "ehr_addCountersign_search_initials": "Initials",
  "ehr_addCountersign_search_pinyin": "Pinyin",
  "ehr_addCountersign_search_ad": "Account",
  "ehr_addCountersign_search_cancel": "cancel",
  "ehr_addCountersign_signer_history": "history",
  "ehr_addCountersign_signer_list": "List added",
  "ehr_addCountersign_signer_reason": "Please fill in the reasons",
  "ehr_addCountersign_reason_placeholder": "optional",
  "ehr_addCountersign_btn_cancel": "Cancel",
  "ehr_addCountersign_btn_ok": "OK",
  "ehr_addCountersign_warn_self": "cannot choose yourself as a signer",
  "ehr_addCountersign_warn_selected": "This person has been selected",
  "ehr_addCountersign_warn_nosigner": "Please choose signer",
  "ehr_addCountersign_warn_warning": "warn",
  "ehr_addCountersign_warn_network": "no network",
  "ehr_addCountersign_jsalert_success": "success",
  "ehr_transferApplication_title": "Pending",
  "ehr_transferApplication_btn_refresh": "Refresh",
  "ehr_transferApplication_p_docutype": "Transfer Application",
  "ehr_transferApplication_p_basicinfo": "Basic Info",
  "ehr_transferApplication_p_process": "Workflow",
  "ehr_transferApplication_p_applicant": "Applicant",
  "ehr_transferApplication_p_applyDate": "Apply date",
  "ehr_transferApplication_p_TransferEmp": "Employee ",
  "ehr_transferApplication_p_EmpType": "Staff classification",
  "ehr_transferApplication_p_OperateType": "Operation type",
  "ehr_transferApplication_p_MoveDate": "Transfer date",
  "ehr_transferApplication_p_Department": "Department transferred from /Current position",
  "ehr_transferApplication_p_TransferDepart": "Department transferred to /Post transferred to",
  "ehr_transferApplication_p_EmpLevel": "Level change",
  "ehr_transferApplication_p_PerformanceB": "Performance change",
  "ehr_transferApplication_p_WorkLocationB": "Current working location",
  "ehr_transferApplication_p_WorkLocationA": "Working location after transfer",
  "ehr_transferApplication_p_MoveReason": "Transfer reason",
  "ehr_transferApplication_p_ExtraRule": "Additional agreement",
  "ehr_transferApplication_p_BaseSalary": "Basic salary after transfer",
  "ehr_transferApplication_p_WealthSalary": "Caifu salary after transfer ",
  "ehr_transferApplication_p_TechSalary": "Skill-based salary after transfer ",
  "ehr_transferApplication_p_PlaceSubsidy": "Off-site work allowance",
  "ehr_transferApplication_p_MoveSubsidy": "Moving allowance",
  "ehr_transferApplication_p_HouseSubsidy": "Housing allowance",
  "ehr_transferApplication_p_GiveOutEndDate": "Last date of allowance payment",
  "ehr_transferApplication_btn_Pass": "Pass",
  "ehr_transferApplication_btn_AddCounter": "signer",
  "ehr_transferApplication_btn_Refuse": "Refuse",
  "ehr_transferApplication_btn_ReApplicant": "Return to the applicant",
  "ehr_transferApplication_btn_ReApproval": "Return to the previous",
  "ehr_transferApplication_label_select": "Please select",
  "ehr_transferApplication_jsalert_warn": "warn",
  "ehr_transferApplication_jsalert_Network": "no network",
  "ehr_transferApplication_jsalert_noAduiterList": "Approval flow is empty",
  "ehr_transferApplication_jstext_Status0": "Pending",
  "ehr_transferApplication_jstext_Status1": "Approved",
  "ehr_transferApplication_jstext_Status3": "Countersigned",
  "ehr_transferApplication_jstext_Status4": "Canceled",
  "ehr_transferApplication_jstext_Status5": "Canceled",
  "ehr_transferApplication_jsalert_success": "success",
  "ehr_transferApplication_jsalert_comment": "Please fill out your comments",
  "ehr_transferApplication_jsalert_ispass": "Are you sure you want approve?",
  "ehr_transferApplication_jsalert_isRefuse": "Are you sure you want refuse?",
  "ehr_transferApplication_jsalert_reason": "Please fill out your reason",
  "ehr_transferApplication_p_DQCBD": "Current Insured Land",
  "ehr_transferApplication_p_DDHCBD": "Insured Land after transfer",
  "ehr_transferApplication_p_BZ": "Currency",
  "ehr_transferApplication_p_JYXZYW": "Non-Competition Agreement required or not",
  "ehr_transferApplication_p_DRZX": "Group transferred to",
  "ehr_ContractCtrl_title": "Pending",
  "ehr_ContractCtrl_p_docutype": "Labor Contract Renew Application",
  "ehr_ContractCtrl_btn_refresh": "Refresh",
  "ehr_ContractCtrl_p_basicinfo": "Basic Info",
  "ehr_ContractCtrl_p_approvalinfo": "Approval Info",
  "ehr_ContractCtrl_p_process": "Workflow",
  "ehr_ContractCtrl_p_xqry": "Employee",
  "ehr_ContractCtrl_p_sqsj": "Time of application",
  "ehr_ContractCtrl_p_bm": "Department",
  "ehr_ContractCtrl_p_rzrq": "Date of Enrollment",
  "ehr_ContractCtrl_p_zj": "Rank",
  "ehr_ContractCtrl_p_htjsr": "End Date",
  "ehr_ContractCtrl_p_lshtxx": "All Labor Contracts Information",
  "ehr_ContractCtrl_p_qdcs": "Renewed Number of Times Since 2008",
  "ehr_ContractCtrl_p_ts": "Suggestion for new contract term",
  "ehr_ContractCtrl_p_cfxx": "Disciplinary Information",
  "ehr_ContractCtrl_p_jkzt": "Health Status",
  "ehr_ContractCtrl_p_ygfl": "Classification",
  "ehr_ContractCtrl_p_gsxx": "Work Injury Information",
  "ehr_ContractCtrl_p_zysx": "Matters requiring attention",
  "ehr_ContractCtrl_label_htlx": "Type for the new contract",
  "ehr_ContractCtrl_label_sfxq": "Renew or not",
  "ehr_ContractCtrl_label_xqnx": "Term of the renewed contract",
  "ehr_ContractCtrl_label_jyxzqd": "Signing non-competition clause",
  "ehr_ContractCtrl_label_htgs": "Employer",
  "ehr_ContractCtrl_label_xqgw": "Position",
  "ehr_ContractCtrl_label_xqgslx": "Working hours system",
  "ehr_ContractCtrl_label_xqhtzzr": "Expiration of the renewed contract",
  "ehr_ContractCtrl_label_xqhdsl": "Length of service after contact renewal",
  "ehr_ContractCtrl_label_bz": "Remarks",
  "ehr_ContractCtrl_btn_tg": "Pass",
  "ehr_ContractCtrl_btn_hqr": "signer",
  "ehr_ContractCtrl_btn_jj": "Refuse",
  "ehr_ContractCtrl_btn_thsqr": "Return to the applicant",
  "ehr_ContractCtrl_btn_thsyj": "Return to the previous",
  "ehr_ContractCtrl_btn_qx": "Cancel",
  "ehr_ContractCtrl_p_xzhtgs": "select Employer",
  "ehr_ContractCtrl_p_xzxqgw": "select Position",
  "ehr_ContractCtrl_jsalert_warn": "warn",
  "ehr_ContractCtrl_jsalert_Network": "no network",
  "ehr_ContractCtrl_jsalert_noAduiterList": "Approval flow is empty",
  "ehr_ContractCtrl_jstext_Status0": "Pending",
  "ehr_ContractCtrl_jstext_Status1": "Approved",
  "ehr_ContractCtrl_jstext_Status3": "Countersigned",
  "ehr_ContractCtrl_jstext_Status4": "Canceled",
  "ehr_ContractCtrl_jstext_Status5": "Canceled",
  "ehr_ContractCtrl_jsalert_confirm": "Confirm",
  "ehr_ContractCtrl_jsalert_success": "success",
  "ehr_ContractCtrl_jsalert_ispass": "Are you sure you want approve?",
  "ehr_ContractCtrl_jsalert_isRefuse": "Are you sure you want refuse?",
  "ehr_ContractCtrl_jsalert_comment": "Please fill out your comments",
  "ehr_ContractCtrl_jsalert_reason": "Please fill out your reason",
  "ehr_ContractCtrl_jsdate_Jan": "Jan",
  "ehr_ContractCtrl_jsdate_Feb": "Feb",
  "ehr_ContractCtrl_jsdate_Mar": "Mar",
  "ehr_ContractCtrl_jsdate_Apr": "Apr",
  "ehr_ContractCtrl_jsdate_May": "May",
  "ehr_ContractCtrl_jsdate_June": "June",
  "ehr_ContractCtrl_jsdate_July": "July",
  "ehr_ContractCtrl_jsdate_Aug": "Aug",
  "ehr_ContractCtrl_jsdate_Sep": "Sep",
  "ehr_ContractCtrl_jsdate_Oct": "Oct",
  "ehr_ContractCtrl_jsdate_Nov": "Nov",
  "ehr_ContractCtrl_jsdate_Dec": "Dec",
  "ehr_ContractCtrl_jsdate_Sun": "S",
  "ehr_ContractCtrl_jsdate_Mon": "M",
  "ehr_ContractCtrl_jsdate_Tues": "T",
  "ehr_ContractCtrl_jsdate_Wed": "W",
  "ehr_ContractCtrl_jsdate_Thur": "T",
  "ehr_ContractCtrl_jsdate_Fri": "F",
  "ehr_ContractCtrl_jsdate_Sat": "S",
  "ehr_ContractCtrl_jsdate_selectDate": "select date",
  "ehr_ContractCtrl_jsdate_todayLabel": "Today",
  "ehr_ContractCtrl_jsalert_NXYHTLX": "Type of contract to be renewed",
  "ehr_ContractCtrl_jsalert_SFXQ": "Whether to renew the contract",
  "ehr_ContractCtrl_jsalert_XQNX": "The length of contract renewal",
  "ehr_ContractCtrl_jsalert_JYXZQD": "Whether to sign non-competition clause",
  "ehr_ContractCtrl_jsalert_XQGW": "Please select the Position",
  "ehr_ContractCtrl_jsalert_HTGS": "Please select the Employer",
  "ehr_ContractCtrl_jsalert_XQGSLX": "Type of working hour system",
  "ehr_ContractCtrl_jsalert_XQHTZZR": "Termination date of renewed contract",
  "ehr_ContractCtrl_jsalert_BZ": "Please fill out your Remarks",
  "ehr_ContractCtrl_label_select": "Please select",
  "ehr_ContractCtrl_label_number": "number",
  "ehr_ContractCtrl_label_name": "name",
  "ehr_punish_title": "Pending",
  "ehr_punish_p_CFYGSQS": "Disciplanary Action Application",
  "ehr_punish_btn_refresh": "Refresh",
  "ehr_punish_p_basicinfo": "Basic Info",
  "ehr_punish_p_process": "Workflow",
  "ehr_punish_p_CFYG": "Employee to be disciplined",
  "ehr_punish_p_SQSJ": "Time of application",
  "ehr_punish_p_BM": "Department",
  "ehr_punish_p_ZJ": "Rank",
  "ehr_punish_p_SQCFDJ": "Discipline level",
  "ehr_punish_p_ZGLD": "Supervisor/leader",
  "ehr_punish_p_CFSY": "Discipline reason",
  "ehr_punish_p_CFYJ": "Basis for discipline",
  "ehr_punish_p_CFYJIAN": "Remarks",
  "ehr_punish_p_CFGZSH": "Discipline notification number",
  "ehr_punish_btn_SC": "Notification number generated.",
  "ehr_punish_btn_Pass": "Pass",
  "ehr_punish_btn_AddCounter": "signer",
  "ehr_punish_btn_Refuse": "Refuse",
  "ehr_punish_btn_ReApplicant": "Return to the applicant",
  "ehr_punish_btn_ReApproval": "Return to the previous",
  "ehr_punish_jsalert_warn": "warn",
  "ehr_punish_jsalert_Network": "no network",
  "ehr_punish_jsalert_noAduiterList": "Approval flow is empty",
  "ehr_punish_jstext_Status0": "Pending",
  "ehr_punish_jstext_Status1": "Approved",
  "ehr_punish_jstext_Status3": "Countersigned",
  "ehr_punish_jstext_Status4": "Canceled",
  "ehr_punish_jstext_Status5": "Canceled",
  "ehr_punish_jsalert_ispass": "Are you sure you want approve?",
  "ehr_punish_jsalert_cancel": "Cancel",
  "ehr_punish_jsalert_confirm": "Confirm",
  "ehr_punish_jsalert_success": "success",
  "ehr_punish_jsalert_comment": "Please fill out your comments",
  "ehr_punish_jsalert_isRefuse": "Are you sure you want refuse?",
  "ehr_punish_jsalert_reason": "Please fill out your reason",
  "ehr_punishCancel_p_CXCFSQS": "Application for Discipline Revocation",
  "ehr_punishCancel_p_CXYJ": "Basis of revocation",
  "ehr_AdjustmentApplication_title": "Pending",
  "ehr_AdjustmentApplication_btn_refresh": "Refresh",
  "ehr_AdjustmentApplication_p_docutype": "Application for salary or level adjustment",
  "ehr_AdjustmentApplication_p_basicinfo": "Basic Info",
  "ehr_AdjustmentApplication_p_process": "Workflow",
  "ehr_AdjustmentApplication_p_AdjustmentEmp": "Employee",
  "ehr_AdjustmentApplication_p_MoveDate": "Date of adjustment",
  "ehr_AdjustmentApplication_p_Department": "Department/Post ",
  "ehr_AdjustmentApplication_p_EmpLevel": "Post rank change",
  "ehr_AdjustmentApplication_p_PerformanceB": "Performance change",
  "ehr_AdjustmentApplication_p_applicant": "Applicant",
  "ehr_AdjustmentApplication_p_applyDate": "Time of application",
  "ehr_AdjustmentApplication_p_BaseSalary": "Basic Pay",
  "ehr_AdjustmentApplication_p_WealthSalary": "Caifu salary",
  "ehr_AdjustmentApplication_p_TechSalary": "Skill-based Pay",
  "ehr_AdjustmentApplication_p_Remark": "Remarks",
  "ehr_AdjustmentApplication_p_IncompetentPost": "incompetence change or not",
  "ehr_AdjustmentApplication_p_BZ": "Currency",
  "ehr_seal_p_docutype": "HR stamp",
  "ehr_seal_p_sealcompany": "Company using the stamp",
  "ehr_seal_p_sealfiletype": "Documents which can be stamped",
  "ehr_seal_p_sealuse": "Uses of the stamp",
  "ehr_seal_p_remak": "Remarks",
  "ehr_seal_p_warning": "Note",
  "ehr_overtime_title": "Overtime Application Form",
  "ehr_overtime_span_1": "Date of overtime",
  "ehr_overtime_span_2": "Overtime date",
  "ehr_overtime_span_3": "Hours",
  "ehr_overtime_span_4": "Reason for overtime",
  "ehr_overtime_span_5": "Working attendance",
  "ehr_overtime_span_6": " has already applied for ",
  "ehr_overtime_span_7": " hour(s) of overtime",
  "ehr_overtime_span_8": "No Information",
  "ehr_regular_title": "Pending",
  "ehr_regular_p_docutype": "Trial Staff Appraisal Form",
  "ehr_regular_p_regularUser": "Regular Employees",
  "ehr_regular_span_1": "Whether to give positive",
  "ehr_regular_span_2": "Self-assessment",
  "ehr_regular_span_3": "Business Knowledge",
  "ehr_regular_span_4": "a.Working knowledge and operational capacity",
  "ehr_regular_span_5": "b.Comprehend and accept new knowledge capacity",
  "ehr_regular_span_6": "Work attitude",
  "ehr_regular_span_7": "a.Enthusiasm towards work and enterprising",
  "ehr_regular_span_8": "b.Able to cope with the extra work pressure Ability to cope with work pressure",
  "ehr_regular_span_9": "Work ability",
  "ehr_regular_span_10": "a.Ability to control the pace of work",
  "ehr_regular_span_11": "b.Comprehend and complete assigned work",
  "ehr_regular_span_12": "Job performance",
  "ehr_regular_span_13": "a.implementation deadline for completion of work ",
  "ehr_regular_span_14": "b.Ability to perform creative work done Ability to finish the job full of creativity",
  "ehr_regular_span_15": "Teamwork",
  "ehr_regular_span_16": "a.Company dedication and loyalty",
  "ehr_regular_span_17": "b.Whether others trust and mutual encouragement",
  "ehr_regular_span_18": "c.Whether to live in harmony with colleagues and leadership",
  "ehr_regular_span_19": "d.Centripetal force and sense of responsibility of the department",
  "ehr_regular_span_20": "Opinion",
  "ehr_regular_span_21": "Positive information(Skill-based Pay applies only to 'S' series employees.)",
  "ehr_regular_span_22": "Current Basic Pay",
  "ehr_regular_span_23": "Current Skill-based Pay",
  "ehr_regular_span_24": "Regular Basic Salary by the Agreement",
  "ehr_regular_span_25": "Regular Agreement before Employee Reports",
  "ehr_regular_span_26": "Filled in by Supervisor",
  "ehr_regular_span_27": "Regular Basic",
  "ehr_regular_span_28": "Regular Skill-based Pay",
  "ehr_regular_span_29": "Currency",
  "ehr_regular_span_30": "Regular Rank",
  "ehr_regular_span_31": "Filled in by HR",
  "ehr_regular_span_32": "Formaldate",
  "ehr_regular_span_33": "Options Form of Payment",
  "ehr_regular_span_34": "KPI",
  "ehr_regular_alert_0": "Please select regular",
  "ehr_regular_alert_1": "Please fill out Self-assessment",
  "ehr_regular_alert_2": "Please select business knowledge",
  "ehr_regular_alert_3": "Please select business knowledge",
  "ehr_regular_alert_4": "Please select work attitude",
  "ehr_regular_alert_5": "Please select work attitude",
  "ehr_regular_alert_6": "Please select work ability",
  "ehr_regular_alert_7": "Please select work ability",
  "ehr_regular_alert_8": "Please select job performance",
  "ehr_regular_alert_9": "Please select job performance",
  "ehr_regular_alert_10": "Please select teamwork",
  "ehr_regular_alert_11": "Please select teamwork",
  "ehr_regular_alert_12": "Please select teamwork",
  "ehr_regular_alert_13": "Please select teamwork",
  "ehr_regular_alert_14": "Please fill out total score",
  "ehr_regular_alert_15": "Please fill out opinion",
  "ehr_regular_alert_16": "Please fill out current basic pay",
  "ehr_regular_alert_17": "Please fill out current skill-based pay",
  "ehr_regular_alert_18": "Please fill out regular basic salary by the agreement",
  "ehr_regular_alert_19": "Please fill out regular agreement beofore employee reports",
  "ehr_regular_alert_20": "Please fill out regular basic",
  "ehr_regular_alert_21": "Please fill out regular skill-based pay",
  "ehr_regular_alert_22": "Please select currency",
  "ehr_regular_alert_23": "Please select regular rank",
  "ehr_regular_alert_24": "Please fill out formaldate",
  "ehr_regular_alert_25": "Please select options Ffrm of payment",
  "ehr_regular_alert_26": "Please select KPI",
  "oa_alert_response_null": "Network connection exception, please check your network!",
  "oa_error_status_403": "Access Denied",
  "oa_error_system_info": "Server Exception",
  "oa_error_status_1001": "Http request not post method",
  "oa_error_status_1002": "URL is invaild",
  "oa_error_status_1003": "Access_token is missing",
  "oa_error_status_1004": "Access_token is invaild",
  "oa_error_status_1005": "Access_token is expired",
  "oa_error_status_1006": "Service code has not registered",
  "oa_error_status_1007": "AccessToken has not permission to access",
  "oa_error_status_1008": "SOA Malformed URL",
  "oa_error_status_1009": "Token openid and openkey auth failed",
  "oa_error_status_1010": "Create token failed ,token not exists in database",
  "oa_error_status_1011": "Refresh token failed ,token not exists in database",
  "oa_error_status_400": "Service Host is invalid",
  "oa_error_status_406": "Limited max concurrent requests",
  "oa_error_status_408": "Connection time out",
  "oa_error_status_504": "Socket time out",
  "OA_fixedassertallocationdetail_text_model": "Model",
  "OA_oneCommit_warning": "No repeat submission!",
  "oa_copy_success": "Copy to the clipboard success",
  "OA_costaccountdetail_text_overtime": "Traffic Expense",
  "OA_costaccountdetail_text_workinghours": "Attendance Record",
  "oa_yes": "yes",
  "oa_no": "no",
  "OA_text_usedate": "Date of application",
  "OA_Salary_text_unitprice": "Application amount",
  "OA_Salary_text_residualvalue": "Actual amount",
  "OA_text_payment_payee": "Receiving unit(person)",
  "OA_travel_card_reimbursement": "Travel card reimbursement",
  "ehr_Intern_p_SXSLYSQPGB": "实习生留用申请评估表",
  "ehr_Intern_p_basicinfo": "基本信息",
  "ehr_Intern_p_process": "审批流程",
  "ehr_Intern_p_SXS": "实习生",
  "ehr_Intern_p_SQSJ": "申请时间",
  "ehr_Intern_p_SQBM": "申请部门",
  "ehr_Intern_p_DSYG": "导师员工",
  "ehr_Intern_p_GW": "岗位",
  "ehr_Intern_p_RZRQ": "入职日期",
  "ehr_Intern_p_SJGZSJ": "实际工作时间",
  "ehr_Intern_p_QZRQ": "最高学历起止时间",
  "ehr_Intern_p_XXMC": "学校名称",
  "ehr_Intern_p_ZY": "专业",
  "ehr_Intern_p_XLLX": "学历类型",
  "OA_item_total_amount": "Total amount of the project",
  "OA_recipient_itemdetail_text_item": "Payee",
  "OA_recipient_itemdetail_text_account": "Recipient Account",
  "OA_recipient_itemdetail_text_bankName": "Bank Name",
  "OA_recipient_itemdetail_text_city": "Bank City",
  "OA_recipient_itemdetail_text_cashPledgeAmount": "Deposit Payment",
  "OA_recipient_itemdetail_text_contractPaymentAmount": "Payment Amount",
  "OA_additemdetail_text_paymentdetail": "Payment Details",
  "OA_itemDetail_text_recipientAccountNumber": "Account of Receiving Unit",
  "OA_itemDetail_text_contractPaymentAmount": "Payment amount",
  "OA_no_Down_Title": 'Unable to download',
  "OA_no_Down_Tips": 'This file format is not supported on mobile phone, please download it on PC.',
  "OA_detail_business_type": 'Business group',
  "OA_detail_business_type_placeholder": 'Business group query', 
}

module.exports = {
  lang_ZH: lang_ZH,
  lang_EN: lang_EN,
}

/***/ }),

/***/ "./example/oa/utils/js/util.js":
/*!*************************************!*\
  !*** ./example/oa/utils/js/util.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {


var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const isArr = (arr) => {
  return Object.prototype.toString.call(arr) == '[object Array]';
}

const Outputmoney = (number) => {
  if (isNaN(number) || number === "") return "0.00";
  number = Math.round(number * 100) / 100;
  if (number < 0)
    return '-' + outputdollars(Math.floor(Math.abs(number) - 0) + '') + outputcents(Math.abs(number) - 0);
  else
    return outputdollars(Math.floor(number - 0) + '') + outputcents(number - 0);
}

const outputdollars = (number) => {
  if (number.length <= 3)
    return (number == '' ? '0' : number);
  else {
    var mod = number.length % 3;
    var output = (mod == 0 ? '' : (number.substring(0, mod)));
    for (var i = 0; i < Math.floor(number.length / 3); i++) {
      if ((mod == 0) && (i == 0))
        output += number.substring(mod + 3 * i, mod + 3 * i + 3);
      else
        output += ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
    }
    return (output);
  }
}

const outputcents = (amount) => {
  amount = Math.round(((amount) - Math.floor(amount)) * 100);
  return (amount < 10 ? '.0' + amount : '.' + amount);
}

const contains = (arr, obj) => {
  var i = arr.length;
  while (i--) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
}

const isNull = (data) => {
  if (data == null || typeof (data) == "undefined") {
    return true;
  } else {
    return false;
  }
}

const getImgSrc = (fileName) => {
  var extensions = fileName.substring(fileName.lastIndexOf('.') + 1);
  var imgsrc = "";
  extensions = extensions.toLowerCase();
  switch (extensions) {
    case "msg":
      imgsrc = "img/msg.png";
      break;
    case "pdf":
      imgsrc = "img/pdf.png";
      break;
    case "png":
    case "jpg":
    case "jpeg":
    case "jpe":
    case "tif":
    case "gif":
    case "bmp":
      imgsrc = "img/jpg.png";
      break;
    case "txt":
    case "text":
    case "conf":
    case "def":
    case "list":
    case "log":
    case "in":
      imgsrc = "img/txt.png";
      break;
    case "doc":
    case "dot":
    case "docx":
      imgsrc = "img/word.png";
      break;
    case "xls":
    case "xlm":
    case "xla":
    case "xlt":
    case "xlw":
    case "xlsx":
    case "csv":
      imgsrc = "img/excel.png";
      break;
    case "ppt":
    case "pps":
    case "pot":
    case "pptx":
      imgsrc = "img/ppt.png";
      break;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
      imgsrc = "img/zip.png";
      break;
    case "mp3":
    case "wav":
    case "wav":
    case "acc":
    case "acc":
    case "mp4":
    case "rmvb":
    case "avi":
    case "flv":
    case "flv":
    case "mkv":
    case "bmp":
      imgsrc = "img/avi.png";
      break;
    default:
      imgsrc = "img/txt.png";
      break;
  }
  return imgsrc;

}

const isNullObj = (data) => {
  if (JSON.stringify(data) === '{}') {
    return false // 如果为空,返回false
  }
  return true // 如果不为空，则会执行到这一步，返回true
}

const errFunTips = (res) => {
  console.log(res)
  // 处理错误的返回信息
  let {
      data = ''
  } = res;
  var errorMsg = data;
  var errormsg = "";
  // res是否有返回值；
  if (isNull(errorMsg)) {
    errormsg = "oa_alert_response_null";
  } else {
    // res的返回值是否是正常的数据结构类型

    if (isJSON(errorMsg)) {
      // 判断当前的错误的code 
      let {
        status = {
          status_code:''
        },
        errMsg = ''
      } = errorMsg;
      var status_code = status.status_code;
      // 如果code存在

      if (!isNull(status_code)) {
        // 存在的code的错误信息

        if (status_code == 1001) {
          errormsg = "oa_error_status_1001";
        } else if (status_code == 1002) {
          errormsg = "oa_error_status_1002";
        } else if (status_code == 1003) {
          errormsg = "oa_error_status_1003";
        } else if (status_code == 1004) {
          errormsg = "oa_error_status_1004";
        } else if (status_code == 1005) {
          errormsg = "oa_error_status_1005";
        } else if (status_code == 1006) {
          errormsg = "oa_error_status_1006";
        } else if (status_code == 1007) {
          errormsg = "oa_error_status_1007";
        } else if (status_code == 1008) {
          errormsg = "oa_error_status_1008";
        } else if (status_code == 1009) {
          errormsg = "oa_error_status_1009";
        } else if (status_code == 1010) {
          errormsg = "oa_error_status_1010";
        } else if (status_code == 1011) {
          errormsg = "oa_error_status_1011";
        } else if (status_code == 400) {
          errormsg = "oa_error_status_400";
        } else if (status_code == 406) {
          errormsg = "oa_error_status_406";
        } else if (status_code == 408) {
          errormsg = "oa_error_status_408";
        } else if (status_code == 504) {
          errormsg = "oa_error_status_504";
        } else if (status_code == 500) {
          // 当前错误信息为500的时候

         
          let {
              status = {
                message:''
              }
          } = errorMsg
          var errorMes = status.message;
          // 如果errorMes不是空的时候，抛出错误信息
          if (!isNull(errorMes) && isJSON(errorMes)) {
            var mesjson = JSON.parse(errorMes);
            errormsg = mesjson.message;
          }
        }
      }
    } else {
      // 403的code的时候
      errorMsg = errorMsg.toString();
      if (errorMsg.indexOf("HTTP Status 403") > -1) {
        errormsg = "oa_error_status_403";
      }
    }
  }
  // 如果message为空的时候
  if (errormsg == "") {
    errormsg = "oa_error_system_info";
  }
  // 提示报错信息
  alertFunc(errormsg);
}


// 网络请求的异常报错提示
const alertFunc = (msg) => {
  if (wx.getStorageSync('lang')[msg]){
    wx.showModal({
      title: wx.getStorageSync('lang')['OA_index_alert_prompt'], // 提示的title
      showCancel: false,
      content: wx.getStorageSync('lang')[msg], // 提示的报错信息
    })
  }else{
    wx.showModal({
      title: wx.getStorageSync('lang')['OA_index_alert_prompt'], // 提示的title
      showCancel: false,
      content: msg, // 提示的报错信息
    })
  }
  
}

const hasValue = (data, search, tempValue) => {
  if (data[search]) {
    return data[search]
  } else {
    null
  }
}

const isJSON = (str) => {
  if (typeof str == 'string') {
    try {
      var obj = JSON.parse(str);
      if (typeof obj == 'object' && obj) {
        return true;
      } else {
        return false;
      }

    } catch (e) {
      return false;
    }
  } else if (typeof (str) == "object" && Object.prototype.toString.call(str).toLowerCase() == "[object object]" && !str.length) {
    return true;
  }
}

const appendZero = (obj) => {
  if (obj < 10) return "0" + "" + obj;
  else return obj;
}



const isNumber = (inputData) => {
  if (parseFloat(inputData).toString() == 'NaN') {
    return false;
  } else {
    return true;
  }
}

const getMimeType = (fileType) => {
  let mimetype = "";
  let isCanDown = false;
  // 可支持的文件类型： doc docx xls xlsx ppt pptx pdf
  fileType = fileType.toLowerCase();
  switch (fileType) {

    case "doc":
      mimetype = "doc";
      isCanDown = true;
      break;
    case "docx":
      mimetype = "docx";
      isCanDown = true;
      break;
    case "xls":
      mimetype = "xls";
      isCanDown = true;
      break;
    case "xlsx":
      mimetype = "xlsx";
      isCanDown = true;
      break;
    case "ppt":
      mimetype = "ppt";
      isCanDown = true;
      break;
    case "pptx":
      mimetype = "pptx";
      isCanDown = true;
      break;
    case "pdf":
      mimetype = "pdf";
      isCanDown = true;
      break;
    case "png":
    case "jpg":
    case "jpeg":
    case "jpe":
    case "tif":
    case "gif":
      mimetype = "image";
      isCanDown = true;
      break;
    default:
      mimetype = "other";
      isCanDown = false;
      break;

  }
  return {
    mimetype,
    isCanDown
  };
}


module.exports = {
  formatTime: formatTime,
  isArr: isArr,
  Outputmoney: Outputmoney,
  outputdollars: outputdollars,
  outputcents: outputcents,
  contains: contains,
  isNull: isNull,
  getImgSrc: getImgSrc,
  isNullObj: isNullObj,
  errFunTips: errFunTips,
  alertFunc:alertFunc,
  hasValue: hasValue,
  isJSON: isJSON,
  appendZero: appendZero,
  isNumber: isNumber,
  getMimeType: getMimeType
}

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ })

/******/ });