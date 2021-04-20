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
/******/ 	return __webpack_require__(__webpack_require__.s = "../devtool/assets/biz/index$.web.js");
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

/***/ "../devtool/assets/biz/index$.web.js":
/*!*******************************************!*\
  !*** ../devtool/assets/biz/index$.web.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! compiler/lib/sjsEnvInit */ "./lib/sjsEnvInit.js");
__webpack_require__(/*! ./config$ */ "../devtool/assets/biz/config$.js");
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


/***/ }),

/***/ "./example/oa/app.wxss":
/*!*****************************!*\
  !*** ./example/oa/app.wxss ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'app.wxss' });
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.a-page, .a-body {
    background-color: #F0F2F5;
    height: 100%;
    font-size: 0.28rem;
    line-height: 1.6;
  }
  .a-checkbox, .a-radio {
    margin-right: 0.1rem;
  }
  .a-form {
    width: 100%;
  }
  .a-input {
    cursor: auto;
    display: block;
    height: 1.4rem;
    text-overflow: clip;
    overflow: hidden;
    white-space: nowrap;
    font-family: UICTFontTextStyleBody;
    min-height: 1.4rem;
    width: 100%;
    margin: 0;
  }
  .a-textarea {
    cursor: auto;
    display: block;
    position: relative;
    margin: 0;
    resize: none;
    outline: 0;
    border: 0 none;
    outline-style: none;
  }
  .a-image, .a-img {
    border: 0 none;
  }
  .a-button {
    border: none;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
    box-sizing: border-box;
    font-size: 12px;
  }
  .container {
    height: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding: 0.24rem;
    box-sizing: border-box;
    font-family: -apple-system-font,Helvetica Neue,Helvetica,sans-serif;
  }
@font-face {
  font-family: "oa-office";
  src: url('http://pic.c-ctrip.com/platform/h5/miniapp/oaoffice/oa-office.ttf?20200116') format('truetype');
  /* iOS 4.1- */
}
  .iconfont {
    font-family: "oa-office" !important;
    font-size: 16px;
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: 0.2px;
    -moz-osx-font-smoothing: grayscale;
    color: #999;
    width: 0.32rem;
    height: 0.32rem;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .iconfont:before {
    font-size: 0.36rem;
  }
  .icon-del:before {
    content: "\\e92d";
  }
  .icon-right-arrow {
    -webkit-transform: rotate(180deg);
            transform: rotate(180deg);
  }
  .icon-right-arrow:before {
    content: "\\e943";
  }
  .icon-add:before {
    content: "\\e93e";
  }
  .icon-drop-down:before {
    content: "\\e945";
  }
  .icon-drop-up:before {
    content: "\\e946";
  }
  .icon-drop-up_solid:before {
    content: "\\e948";
  }
  .icon-drop-down_solid:before {
    content: "\\e949";
  }
  .icon-back:before {
    content: "\\e943";
  }
  .icon-subtract_shapeed:before {
    content: "\\ed1b";
  }
  .icon-closed_shapeed:before {
    content: "\\ed1f";
  }
  .icon-close:before {
    content: "\\e940";
  }
  .icon-ranke:before {
    font-size: 0.34rem;
    content: "\\e941";
  }
  .icon-search:before {
    content: "\\e92a";
  }
  .icon-clock_shape:before {
    content: "\\ee32";
  }
  .icon-left-arrow_solid:before {
    content: "\\ef8b";
  }
  .icon-right-arrow_solid:before {
    content: "\\ef8c";
  }
  .icon-check:before {
    content: "\\f1c8";
  }
  .icon-information {
    -webkit-margin-end: 0.06rem;
            margin-inline-end: 0.06rem;
  }
  .icon-information:before {
    content: "\\ef89";
    font-size: 0.32rem;
  }
  .icon-add_line:before {
    content: "\\f36e";
  }
  .icon-subtract_line:before {
    content: "\\f37c";
  }
  .icon-memberinfo:before {
    content: "\\f37f";
  }
  .icon-more_solid:before {
    content: "\\f433";
  }
  .icon-cchat-copy:before {
    content: "\\f439";
  }
  .icon-edit:before {
    content: "\\e93c";
  }
  .btn-default, .btn-primary {
    background: #FFFFFF;
    border-radius: 0.08rem;
    width: 1.52rem!important;
    height: 0.6rem;
    min-height: 0.6rem!important;
    box-sizing: border-box;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    font-size: 0.26rem;
    color: #1466DE;
    font-weight: normal;
    position: relative;
    padding: 1px;
    border: none;
    overflow: hidden;
  }
  .btn-default::after, .btn-primary::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    border: 1px solid #1466DE!important;
    -webkit-transform: scale(.5);
    transform: scale(0.5);
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    box-sizing: border-box;
    border-radius: 8px;
    overflow: hidden;
    display: block;
  }
  .btn-primary {
    background: #1466DE;
    color: #fff;
  }
  .btn-refuse {
    color: #333;
  }
  .btn-refuse::after {
    border-color: #999!important;
  }
  .btn-default.middle, .btn-primary.middle {
    width: 3.3rem!important;
    font-size: 0.3rem;
    height: 0.72rem;
    line-height: 0.72rem;
  }
  .btn-default.large, .btn-primary.large {
    width: 100%!important;
    border-radius: 0.12rem;
    height: 0.88rem;
    line-height: 0.88rem;
    font-size: 0.34rem;
    display: -webkit-box!important;
    display: -webkit-flex!important;
    display: flex!important;
  }
  .btn-default.large::after, .btn-primary.large::after {
    border-radius: 0.24rem;
  }
  .btn-default.small, .btn-primary.small {
    width: 2.16rem!important;
    font-size: 0.3rem;
    height: 0.72rem;
    line-height: 0.72rem;
  }
  .btn-default .iconfont, .btn-primary .iconfont {
    margin-right: 0.15rem;
  }
  .btn-default .iconfont {
    color: #1466DE;
  }
  .btn-primary .iconfont {
    color: #fff;
  }
  .btn-default.disabled, .btn-primary.disabled {
    background: #eee!important;
    color: #999!important;
  }
  .btn-default.disabled::after, .btn-primary.disabled::after {
    border-color: #eee!important;
  }
  .empty-box {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    margin-top: 2.4rem;
  }
  .empty-box .image {
    width: 3rem;
    height: 3rem;
  }
  .empty-box .text {
    margin-top: 0.56rem;
    display: block;
    font-size: 0.28rem;
    color: #333;
    text-align: center;
  }
  .border-bottom-1px {
    padding-bottom: 1px;
    background-position: center bottom;
    background-image: -webkit-linear-gradient(top, transparent 50%, #DEDFE0 50%);
    background-image: linear-gradient(to bottom, transparent 50%, #DEDFE0 50%);
    background-repeat: no-repeat;
    background-size: 100% 1px;
  }
  .border-all-1px {
    position: relative;
    padding: 1px;
    border: none;
  }
  .border-all-1px:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    border-radius: 8px;
    border: 1px solid #DEDFE0;
    -webkit-transform: scale(0.5);
            transform: scale(0.5);
    -webkit-transform-origin: 0 0;
            transform-origin: 0 0;
    box-sizing: border-box;
    border-radius: 4px;
  }
  .border-all-1px-noleft {
    position: relative;
    padding: 1px 0px;
    border: none;
  }
  .border-all-1px-noleft:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    border-top: 1px solid #DEDFE0;
    border-bottom: 1px solid #DEDFE0;
    -webkit-transform: scale(0.5);
            transform: scale(0.5);
    -webkit-transform-origin: 0 0;
            transform-origin: 0 0;
    box-sizing: border-box;
  }
  .view-fixed {
    overflow: hidden;
    height: 100%;
  }`));

/***/ }),

/***/ "./example/oa/pages/approve/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!********************************************************************************!*\
  !*** ./example/oa/pages/approve?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/approve/index',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/approve/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/approve/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/approve/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/approve/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([_react2.default.createElement(
    View,
    {
      className: "swiper-tab"
    },
    [_react2.default.createElement(
      View,
      {
        className: "swiper-tab-item " + (data['currentTab'] == 0 ? 'active' : ''), 'data-current': "0", ontap: $getEventHandler(this, "getProcessorsData")
      },
      _react2.default.createElement(
        Text,
        {
          className: "swiper-tab-txt", 'data-current': "0"
        },
        $toString(data['tabNameApproval'])
      )
    ), _react2.default.createElement(
      View,
      {
        className: "swiper-tab-item " + (data['currentTab'] == 1 ? 'active' : ''), 'data-current': "1", ontap: $getEventHandler(this, "getProcessedData")
      },
      _react2.default.createElement(
        Text,
        {
          className: "swiper-tab-txt", 'data-current': "1"
        },
        $toString(data['tabNameApproved'])
      )
    )]
  ), _react2.default.createElement(
    View,
    {
      className: "search-group"
    },
    [_react2.default.createElement(
      View,
      {
        className: "search-box nomargin"
      },
      [_react2.default.createElement(
        View,
        {
          className: "search-item " + (data['inputStatus'] ? 'focus' : '')
        },
        [!data['inputStatus'] ? _react2.default.createElement(
          View,
          {
            className: "search-view"
          },
          [_react2.default.createElement(Icon, {
            className: "iconfont icon-search"
          }), _react2.default.createElement(
            Text,
            {
              className: "placeholder-txt"
            },
            $toString(data['searchDetail'])
          )]
        ) : null, data['inputStatus'] ? _react2.default.createElement(Icon, {
          className: "iconfont icon-search"
        }) : null, _react2.default.createElement(Input, {
          className: "search-bar", type: "text", oninput: $getEventHandler(this, "inputFun"), placeholder: data['searchDetail'], value: data['inputVal'], confirmType: data['searchDetail'], onconfirm: $getEventHandler(this, "search"), focus: data['inputStatus'], onfocus: $getEventHandler(this, "focusFun")
        }), data['inputStatus'] ? _react2.default.createElement(Icon, {
          className: "iconfont icon-closed_shapeed", ontap: $getEventHandler(this, "clearValue")
        }) : null]
      ), data['inputStatus'] ? _react2.default.createElement(
        View,
        {
          className: "search-btn", ontap: $getEventHandler(this, "search")
        },
        $toString(data['btnValue'])
      ) : null]
    ), !data['inputStatus'] ? _react2.default.createElement(
      View,
      {
        className: "sort-box " + (data['sortStatus'] ? 'active' : '') + " " + (data['mode'] ? 'new' : ''), ontap: $getEventHandler(this, "sortStatusFun")
      },
      [_react2.default.createElement(Icon, {
        className: "iconfont icon-ranke"
      }), _react2.default.createElement(
        View,
        {
          className: "sort-box-title"
        },
        $toString(data['searchSort'])
      )]
    ) : null, data['sortStatus'] ? _react2.default.createElement(
      View,
      {
        className: "sort-group"
      },
      $iterate(data['sortData'], function (item, index) {
        return _react2.default.createElement(
          View,
          {
            className: "sort-item " + (data['sortId'] === $getLooseDataMember([item, "id"]) ? 'active' : ''), ontap: $getEventHandler(_this, "changeSort"), 'data-id': $getLooseDataMember([item, "id"]), 'data-key': $getLooseDataMember([item, "key"])
          },
          [_react2.default.createElement(
            View,
            {
              className: "sort-item-txt"
            },
            $toString($getLooseDataMember([item, "name"]))
          ), _react2.default.createElement(Icon, {
            className: "iconfont icon-check"
          })]
        );
      })
    ) : null]
  ), _react2.default.createElement(
    View,
    {
      className: "swiper-panel", current: data['currentTab']
    },
    [_react2.default.createElement(
      View,
      {
        className: "swiper-panel-item"
      },
      data['currentTab'] == 0 ? _react2.default.createElement(
        View,
        {
          className: "form-list"
        },
        [$iterate(data['processorsData'], function (item, index) {
          return _react2.default.createElement(
            View,
            {
              key: item.index, className: "border-bottom-1px"
            },
            $getLooseDataMember([data['processorsData'], "length"]) > 0 ? _react2.default.createElement(
              View,
              {
                className: "form-card", ontap: $getEventHandler(_this, "goDetail"), 'data-id': $getLooseDataMember([item, "APP_ID"]), 'data-formid': $getLooseDataMember([item, "APP_FormType"]), 'data-title': $getLooseDataMember([item, "APP_Subject"]), 'data-app-type': $getLooseDataMember([item, "APP_Type"]), 'data-app-sub-type': $getLooseDataMember([item, "APP_SubType"])
              },
              [_react2.default.createElement(
                View,
                {
                  className: "form-card-title"
                },
                [$toString($getLooseDataMember([item, "APP_SubmitUser"])), $toString("-"), $toString($getLooseDataMember([item, "APP_Subject"]))]
              ), _react2.default.createElement(
                View,
                {
                  className: "form-card-text"
                },
                [$toString(data['textOANumber']), $toString(":"), $toString($getLooseDataMember([item, "APP_ID"]))]
              ), _react2.default.createElement(
                View,
                {
                  className: "form-card-text"
                },
                [$toString(data['textOADate']), $toString(":"), $toString($getLooseDataMember([item, "APP_CreateDT"]))]
              ), _react2.default.createElement(
                View,
                {
                  className: "form-card-status"
                },
                _react2.default.createElement(
                  Text,
                  {
                    className: "wait"
                  },
                  $toString($getLooseDataMember([item, "APP_Status"]))
                )
              )]
            ) : null
          );
        }), $getLooseDataMember([data['processorsData'], "length"]) == 0 && data['processorsDataStatus'] ? _react2.default.createElement(
          View,
          {
            className: "empty-box"
          },
          [_react2.default.createElement(Image, {
            className: "image", src: "/image/empty.png"
          }), _react2.default.createElement(
            Text,
            {
              className: "text"
            },
            $toString(data['extPromp'])
          )]
        ) : null]
      ) : null
    ), _react2.default.createElement(
      View,
      {
        className: "swiper-panel-item"
      },
      data['currentTab'] == 1 ? _react2.default.createElement(
        View,
        {
          className: "form-list"
        },
        [$iterate(data['processedData'], function (item, index) {
          return _react2.default.createElement(
            View,
            {
              key: item.index, className: "border-bottom-1px"
            },
            $getLooseDataMember([data['processedData'], "length"]) > 0 ? _react2.default.createElement(
              View,
              {
                className: "form-card", ontap: $getEventHandler(_this, "goDetail"), 'data-id': $getLooseDataMember([item, "APP_ID"]), 'data-formid': $getLooseDataMember([item, "APP_FormType"]), 'data-title': $getLooseDataMember([item, "APP_Subject"]), 'data-app-type': $getLooseDataMember([item, "APP_Type"]), 'data-app-sub-type': $getLooseDataMember([item, "APP_SubType"])
              },
              [_react2.default.createElement(
                View,
                {
                  className: "form-card-title"
                },
                [$toString($getLooseDataMember([item, "APP_SubmitUser"])), $toString("-"), $toString($getLooseDataMember([item, "APP_Subject"]))]
              ), _react2.default.createElement(
                View,
                {
                  className: "form-card-text"
                },
                [$toString(data['textOANumber']), $toString(":"), $toString($getLooseDataMember([item, "APP_ID"]))]
              ), _react2.default.createElement(
                View,
                {
                  className: "form-card-text"
                },
                [$toString(data['textOADate']), $toString(":"), $toString($getLooseDataMember([item, "APP_CreateDT"]))]
              ), _react2.default.createElement(
                View,
                {
                  className: "form-card-status"
                },
                _react2.default.createElement(
                  Text,
                  {
                    className: "wait"
                  },
                  $toString($getLooseDataMember([item, "APP_Status"]))
                )
              )]
            ) : null
          );
        }), $getLooseDataMember([data['processedData'], "length"]) == 0 && data['processedDataStatus'] ? _react2.default.createElement(
          View,
          {
            className: "empty-box"
          },
          [_react2.default.createElement(Image, {
            className: "image", src: "/image/empty.png"
          }), _react2.default.createElement(
            Text,
            {
              className: "text"
            },
            $toString(data['extPromp'])
          )]
        ) : null]
      ) : null
    )]
  ), data['sortStatus'] ? _react2.default.createElement(View, {
    className: "mask", ontap: $getEventHandler(this, "closeSortStatus")
  }) : null]);
};

/***/ }),

/***/ "./example/oa/pages/approve/index.wxss":
/*!*********************************************!*\
  !*** ./example/oa/pages/approve/index.wxss ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/approve/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.form-card {
    position: relative;
    padding: 0.4rem 0.32rem;
    background: #fff;
    font-size: 0.28rem;
    color: #666;
    letter-spacing: 0;
    line-height: 0.36rem;
  }
  .form-card-title {
    margin-bottom: 0.2rem;
    font-size: 0.32rem;
    color: #333333;
  }
  .form-card-text {
    font-size: 0.28rem;
    color: #666666;
    letter-spacing: 0;
    line-height: 0.36rem;
    margin-bottom: 0.16rem;
  }
  .form-card-text:last-of-type {
    margin-bottom: 0;
  }
  .form-card-status {
    text-align: right;
  }
  .form-card.cancel .form-card-title {
    color: rgba(51,51,51,0.50);
  }
  .form-card.cancel .form-card-text {
    color: rgba(102,102,102,0.50);
  }
  .wait {
    color: #FF6F00;
  }
  .cancel {
    color: #ccc;
  }
  .accept {
    color: #00B87A;
  }
  .refuse {
    color: #000;
  }
  .swiper-tab {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-flow: row;
            flex-flow: row;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
    height: 1.02rem;
    line-height: 1.02rem;
    margin-bottom: 0.16rem;
  }
  .swiper-tab-item {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    font-size: 0.3rem;
    color: #666;
    line-height: 2.5;
  }
  .swiper-tab-item .swiper-tab-txt {
    position: relative;
  }
  .swiper-tab-item .swiper-tab-txt:after {
    position: absolute;
    bottom: -0.04rem;
    left: 0;
    right: 0;
    content: '';
    height: 0.04rem;
    background: transparent;
  }
  .swiper-tab-item.active .swiper-tab-txt {
    color: #333;
    font-weight: bold;
  }
  .swiper-tab-item.active .swiper-tab-txt:after {
    background: #1466DE;
  }
  .swiper-panel {
    position: fixed;
    top: 2.14rem;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(100vh - 2.14rem);
    overflow-y: scroll;
  }
  .swiper-panel-item {
    overflow: scroll;
  }
  .search-group {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    position: fixed;
    top: 1.18rem;
    left: 0;
    right: 0;
    height: 0.96rem;
    z-index: 2;
  }
  .search-box {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .search-box.nomargin {
    margin-top: 0;
  }
  .search-item {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    background-color: #fff;
    border-radius: 0.12rem;
    padding: 0 0.06rem;
    margin: 0 0 0 0.24rem;
  }
  .search-bar {
    height: 0.68rem;
  }
  .search-item.focus .search-bar {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    width: 100%;
    margin: 0 0.06rem;
  }
  .placeholder-txt {
    font-size: 0.3rem;
    color: #CCC;
    line-height: 0.38rem;
  }
  .search-btn {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #666;
    margin: 0 0.1rem;
    padding: 0.13rem 0.16rem;
  }
  .icon-closed_shapeed {
    padding: 0 0.1rem 0 0.16rem;
  }
  .icon-search:before, .icon-closed_shapeed:before {
    color: #ccc;
  }
  .sort-box {
    position: relative;
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding: 0 0.26rem 0 0.14rem;
    margin-left: 0.08rem;
  }
  .search-box .icon-search {
    margin-right: 8px;
  }
  .sort-box.new:after {
    content: "";
    position: absolute;
    top: 0.08rem;
    right: 0.16rem;
    width: 0.1rem;
    height: 0.1rem;
    border-radius: 100%;
    background-color: #F34500;
  }
  .icon-ranke:before {
    color: #666;
  }
  .sort-box-title {
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #666;
    margin-left: 0.08rem;
  }
  .sort-box.active .icon-ranke:before {
    color: #1466DE;
  }
  .sort-box.active .sort-box-title {
    color: #1466DE;
  }
  .sort-group {
    position: absolute;
    top: 0.96rem;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 100;
  }
  .sort-item {
    position: relative;
    text-align: center;
    border-bottom: 0.01rem solid #DEDFE0;
  }
  .sort-item-txt {
    font-size: 0.32rem;
    color: #333;
    line-height: 0.42rem;
    padding: 0.32rem 0;
  }
  .icon-check {
    position: absolute;
    right: 0.4rem;
    top: 0.22rem;
    display: none;
  }
  .icon-check:before {
    color: #1466DE;
  }
  .sort-item.active .sort-item-txt {
    color: #1466DE;
  }
  .sort-item.active .icon-check {
    display: block;
  }
  .mask {
    position: fixed;
    top: 2.16rem;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.7);
  }
  .search-item {
    position: relative;
  }
  .search-view {
    position: absolute;
    top: 0;
    left: 0;
    height: 0.64rem;
    width: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    z-index: 2;
    border-radius: 0.12rem;
    background-color: #fff;
    pointer-events: none;
  }`));

/***/ }),

/***/ "./example/oa/pages/approve/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/approve/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/approve/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.form-card {
    position: relative;
    padding: 0.4rem 0.32rem;
    background: #fff;
    font-size: 0.28rem;
    color: #666;
    letter-spacing: 0;
    line-height: 0.36rem;
  }
  .form-card-title {
    margin-bottom: 0.2rem;
    font-size: 0.32rem;
    color: #333333;
  }
  .form-card-text {
    font-size: 0.28rem;
    color: #666666;
    letter-spacing: 0;
    line-height: 0.36rem;
    margin-bottom: 0.16rem;
  }
  .form-card-text:last-of-type {
    margin-bottom: 0;
  }
  .form-card-status {
    text-align: right;
  }
  .form-card.cancel .form-card-title {
    color: rgba(51,51,51,0.50);
  }
  .form-card.cancel .form-card-text {
    color: rgba(102,102,102,0.50);
  }
  .wait {
    color: #FF6F00;
  }
  .cancel {
    color: #ccc;
  }
  .accept {
    color: #00B87A;
  }
  .refuse {
    color: #000;
  }
  .swiper-tab {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-flow: row;
            flex-flow: row;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
    height: 1.02rem;
    line-height: 1.02rem;
    margin-bottom: 0.16rem;
  }
  .swiper-tab-item {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    font-size: 0.3rem;
    color: #666;
    line-height: 2.5;
  }
  .swiper-tab-item .swiper-tab-txt {
    position: relative;
  }
  .swiper-tab-item .swiper-tab-txt:after {
    position: absolute;
    bottom: -0.04rem;
    left: 0;
    right: 0;
    content: '';
    height: 0.04rem;
    background: transparent;
  }
  .swiper-tab-item.active .swiper-tab-txt {
    color: #333;
    font-weight: bold;
  }
  .swiper-tab-item.active .swiper-tab-txt:after {
    background: #1466DE;
  }
  .swiper-panel {
    position: fixed;
    top: 2.14rem;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(100vh - 2.14rem);
    overflow-y: scroll;
  }
  .swiper-panel-item {
    overflow: scroll;
  }
  .search-group {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    position: fixed;
    top: 1.18rem;
    left: 0;
    right: 0;
    height: 0.96rem;
    z-index: 2;
  }
  .search-box {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .search-box.nomargin {
    margin-top: 0;
  }
  .search-item {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    background-color: #fff;
    border-radius: 0.12rem;
    padding: 0 0.06rem;
    margin: 0 0 0 0.24rem;
  }
  .search-bar {
    height: 0.68rem;
  }
  .search-item.focus .search-bar {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    width: 100%;
    margin: 0 0.06rem;
  }
  .placeholder-txt {
    font-size: 0.3rem;
    color: #CCC;
    line-height: 0.38rem;
  }
  .search-btn {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #666;
    margin: 0 0.1rem;
    padding: 0.13rem 0.16rem;
  }
  .icon-closed_shapeed {
    padding: 0 0.1rem 0 0.16rem;
  }
  .icon-search:before, .icon-closed_shapeed:before {
    color: #ccc;
  }
  .sort-box {
    position: relative;
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding: 0 0.26rem 0 0.14rem;
    margin-left: 0.08rem;
  }
  .search-box .icon-search {
    margin-right: 8px;
  }
  .sort-box.new:after {
    content: "";
    position: absolute;
    top: 0.08rem;
    right: 0.16rem;
    width: 0.1rem;
    height: 0.1rem;
    border-radius: 100%;
    background-color: #F34500;
  }
  .icon-ranke:before {
    color: #666;
  }
  .sort-box-title {
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #666;
    margin-left: 0.08rem;
  }
  .sort-box.active .icon-ranke:before {
    color: #1466DE;
  }
  .sort-box.active .sort-box-title {
    color: #1466DE;
  }
  .sort-group {
    position: absolute;
    top: 0.96rem;
    left: 0;
    right: 0;
    background-color: #fff;
    z-index: 100;
  }
  .sort-item {
    position: relative;
    text-align: center;
    border-bottom: 0.01rem solid #DEDFE0;
  }
  .sort-item-txt {
    font-size: 0.32rem;
    color: #333;
    line-height: 0.42rem;
    padding: 0.32rem 0;
  }
  .icon-check {
    position: absolute;
    right: 0.4rem;
    top: 0.22rem;
    display: none;
  }
  .icon-check:before {
    color: #1466DE;
  }
  .sort-item.active .sort-item-txt {
    color: #1466DE;
  }
  .sort-item.active .icon-check {
    display: block;
  }
  .mask {
    position: fixed;
    top: 2.16rem;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0,0,0,.7);
  }
  .search-item {
    position: relative;
  }
  .search-view {
    position: absolute;
    top: 0;
    left: 0;
    height: 0.64rem;
    width: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    z-index: 2;
    border-radius: 0.12rem;
    background-color: #fff;
    pointer-events: none;
  }`));

/***/ }),

/***/ "./example/oa/pages/component/search/search.js?hash=dcbe94866d3a665efd3557072bc33b52208803de":
/*!***************************************************************************************************!*\
  !*** ./example/oa/pages/component/search/search.js?hash=dcbe94866d3a665efd3557072bc33b52208803de ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Component: $Component } = self.MP;
var Component = $Component || function(){};

Component(
{
  is: "/pages/component/search/search",
  usingComponents: {},
  render: function() { return __webpack_require__(/*! ./search.wxml?hash=dcbe94866d3a665efd3557072bc33b52208803de */ "./example/oa/pages/component/search/search.wxml?hash=dcbe94866d3a665efd3557072bc33b52208803de"); },
  
});


/***/ }),

/***/ "./example/oa/pages/component/search/search.wxml?hash=dcbe94866d3a665efd3557072bc33b52208803de":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/component/search/search.wxml?hash=dcbe94866d3a665efd3557072bc33b52208803de ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "oa-page search-page"
    },
    [_react2.default.createElement(
      View,
      {
        className: "page__bd"
      },
      [_react2.default.createElement(
        View,
        {
          className: "search-box"
        },
        [_react2.default.createElement(
          View,
          {
            className: "search-item " + (data['inputStatus'] ? 'focus' : '')
          },
          [!data['inputStatus'] ? _react2.default.createElement(
            View,
            {
              className: "search-view"
            },
            [_react2.default.createElement(Icon, {
              className: "iconfont icon-search"
            }), _react2.default.createElement(
              Text,
              {
                className: "placeholder-txt"
              },
              $toString(data['textSearchPlace'])
            )]
          ) : null, data['inputStatus'] ? _react2.default.createElement(Icon, {
            className: "iconfont icon-search"
          }) : null, _react2.default.createElement(Input, {
            className: "search-bar", type: "text", oninput: $getEventHandler(this, "inputFun"), value: data['inputVal'], placeholder: data['textSearchPlace'], focus: data['inputStatus'], onfocus: $getEventHandler(this, "focusFun")
          }), data['inputVal'] ? _react2.default.createElement(Icon, {
            className: "iconfont icon-closed_shapeed", ontap: $getEventHandler(this, "clearValue")
          }) : null]
        ), false ? undefined : null]
      ), $getLooseDataMember([data['associateData'], "length"]) ? _react2.default.createElement(
        View,
        {
          className: "associate-box"
        },
        $iterate(data['associateData'], function (item, index) {
          return _react2.default.createElement(
            View,
            {
              className: "border-bottom-1px", ontap: $getEventHandler(_this, "selectResult"), 'data-text': $getLooseDataMember([item, "text"]), 'data-uid': $getLooseDataMember([item, "uid"])
            },
            _react2.default.createElement(
              View,
              {
                className: "associate-item"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "associate-name"
                },
                $toString($getLooseDataMember([item, "text"]))
              ), _react2.default.createElement(
                View,
                {
                  className: "associate-des"
                },
                $toString($getLooseDataMember([item, "org"]))
              )]
            )
          );
        })
      ) : null]
    ), _react2.default.createElement(
      View,
      {
        className: "history-group"
      },
      [_react2.default.createElement(
        View,
        {
          className: "history-group-title"
        },
        [_react2.default.createElement(
          View,
          {
            className: "history-group-title-txt"
          },
          $toString(data['historyHeadTxt'])
        ), $getLooseDataMember([data['historys'], "length"]) ? _react2.default.createElement(Icon, {
          className: "iconfont icon-del", ontap: $getEventHandler(this, "clearHistory")
        }) : null]
      ), _react2.default.createElement(
        View,
        {
          className: "history-group-con"
        },
        $iterate(data['historys'], function (item, index) {
          return $getLooseDataMember([data['historys'], "length"]) ? _react2.default.createElement(
            View,
            {
              className: "history-list", ontap: $getEventHandler(_this, "changeValue"), 'data-value': item
            },
            $toString(item)
          ) : null;
        })
      )]
    )]
  ));
};

/***/ }),

/***/ "./example/oa/pages/component/search/search.wxss":
/*!*******************************************************!*\
  !*** ./example/oa/pages/component/search/search.wxss ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/component/search/search.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.oa-page {
    position: relative;
    height: 100%;
  }
  .page__bd {
    position: relative;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    height: 100%;
    overflow: hidden;
  }
  .search-box {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    margin-top: 0.2rem;
  }
  .search-box .icon-search {
    margin-right: 8px;
  }
  .search-item {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    background-color: #fff;
    border-radius: 0.12rem;
    padding: 0 0.06rem 0 0.12rem;
    margin: 0 0.24rem;
  }
  .placeholder-txt {
    font-size: 0.3rem;
    color: #CCC;
    line-height: 0.38rem;
  }
  .search-bar {
    height: 0.64rem;
  }
  .search-item.focus .search-bar {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    width: 100%;
    margin: 0 0.06rem;
  }
  .search-item.focus {
  }
  .search-btn {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #666;
    margin-right: 0.1rem;
    padding: 0.13rem 0.14rem 0.13rem 0.24rem;
  }
  .icon-closed_shapeed {
    padding: 0 0.1rem 0 0.16rem;
  }
  .associate-box {
    position: relative;
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    overflow-y: auto;
    background-color: #fff;
    margin-top: 0.2rem;
    z-index: 2;
  }
  .associate-item {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    overflow: hidden;
    padding: 0.32rem 0.32rem 0.32rem 0;
    margin-left: 0.32rem;
  }
  .associate-item:last-child {
    border-bottom: none;
  }
  .border-bottom-1px {
    padding-bottom: 1px;
    background-position: center bottom;
    background-image: -webkit-linear-gradient(top, transparent 50%, #DEDFE0 50%);
    background-image: linear-gradient(to bottom, transparent 50%, #DEDFE0 50%);
    background-repeat: no-repeat;
    background-size: 100% 1px;
  }
  .border-bottom-1px:last-child {
    padding-bottom: 0px;
    background: none;
  }
  .associate-name {
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .associate-des {
    font-size: 0.28rem;
    color: #999;
    line-height: 0.36rem;
    margin-top: 0.1rem;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .history-group {
    position: absolute;
    top: 1.2rem;
    left: 0;
    right: 0;
    z-index: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
  }
  .history-group-title {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding: 0.2rem 0.32rem 0.14rem;
  }
  .history-group-title-txt {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    font-size: 0.3rem;
    color: "#333";
    line-height: 0.38rem;
  }
  .icon-del {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    padding: 0 0.2rem;
  }
  .history-group-con {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
            flex-wrap: wrap;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    padding: 0.14rem 0.32rem;
  }
  .history-list {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    font-size: 0.26rem;
    color: "#666";
    line-height: 0.34rem;
    padding: 0.13rem 0.28rem;
    border-radius: 0.38rem;
    margin-left: 0.2rem;
    margin-bottom: 0.2rem;
    background-color: #fff;
  }
  .history-list:nth-of-type(1) {
    margin-left: 0;
  }
  .search-item {
    position: relative;
  }
  .search-view {
    position: absolute;
    top: 0;
    left: 0;
    height: 0.64rem;
    width: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    z-index: 2;
    border-radius: 0.12rem;
    background-color: #fff;
    pointer-events: none;
  }`));

/***/ }),

/***/ "./example/oa/pages/component/searchbar/searchbar.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8":
/*!*********************************************************************************************************!*\
  !*** ./example/oa/pages/component/searchbar/searchbar.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Component: $Component } = self.MP;
var Component = $Component || function(){};

Component(
{
  is: "/pages/component/searchbar/searchbar",
  usingComponents: {},
  render: function() { return __webpack_require__(/*! ./searchbar.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 */ "./example/oa/pages/component/searchbar/searchbar.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8"); },
  
});


/***/ }),

/***/ "./example/oa/pages/component/searchbar/searchbar.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8":
/*!***********************************************************************************************************!*\
  !*** ./example/oa/pages/component/searchbar/searchbar.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 ***!
  \***********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var Label_ = self.MPUI['label'];
var Label = Label_ || $EmptyComponentFactory("label");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([_react2.default.createElement(
    View,
    {
      className: "cweui-search-bar " + data['extClass']
    },
    [_react2.default.createElement(
      View,
      {
        className: "cweui-search-bar__form"
      },
      [_react2.default.createElement(
        View,
        {
          className: "cweui-search-bar__box"
        },
        [_react2.default.createElement(Icon, {
          className: "cweui-icon-search_in-box", type: "search"
        }), _react2.default.createElement(Input, {
          type: "text", className: "cweui-search-bar__input", placeholder: data['placeholder'], value: data['value'], focus: data['focus'], onblur: $getEventHandler(this, "inputBlur"), onfocus: $getEventHandler(this, "inputFocus"), oninput: $getEventHandler(this, "inputChange")
        }), $getLooseDataMember([data['value'], "length"]) > 0 ? _react2.default.createElement(
          View,
          {
            className: "cweui-icon-clear", ontap: $getEventHandler(this, "clearInput")
          },
          _react2.default.createElement(Icon, {
            type: "clear", size: "12"
          })
        ) : null]
      ), !data['searchState'] ? _react2.default.createElement(
        Label,
        {
          className: "cweui-search-bar__label", ontap: $getEventHandler(this, "showInput")
        },
        [_react2.default.createElement(Icon, {
          className: "cweui-icon-search", type: "search", size: "20"
        }), _react2.default.createElement(
          View,
          {
            className: "cweui-search-bar__text"
          },
          $toString(data['btnSearch'])
        )]
      ) : null]
    ), data['cancel'] && data['searchState'] ? _react2.default.createElement(
      View,
      {
        className: "cweui-search-bar__cancel-btn", ontap: $getEventHandler(this, "hideInput")
      },
      $toString(data['cancelText'])
    ) : null]
  ), data['searchState'] && $getLooseDataMember([data['result'], "length"]) > 0 && data['showCell'] == true ? _react2.default.createElement(
    View,
    {
      className: "searchbar-result"
    },
    $iterate(data['result'], function (item, index) {
      return _react2.default.createElement(
        View,
        {
          className: "border-bottom-1px", 'data-index': index, ontap: $getEventHandler(_this, "selectResult")
        },
        _react2.default.createElement(
          View,
          {
            className: "searchItem"
          },
          [_react2.default.createElement(
            View,
            {
              className: "view-text"
            },
            $toString($getLooseDataMember([item, "text"]))
          ), _react2.default.createElement(
            View,
            {
              className: "des"
            },
            $toString($getLooseDataMember([item, "org"]))
          )]
        )
      );
    })
  ) : null]);
};

/***/ }),

/***/ "./example/oa/pages/component/searchbar/searchbar.wxss":
/*!*************************************************************!*\
  !*** ./example/oa/pages/component/searchbar/searchbar.wxss ***!
  \*************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/component/searchbar/searchbar.wxss' });
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.cweui-search-bar {
    position: relative;
    padding: 8px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    box-sizing: border-box;
    background-color: #F5F6F9;
    -webkit-text-size-adjust: 100%;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .cweui-icon-search {
    margin-right: 8px;
    font-size: 14px;
    vertical-align: top;
    margin-top: .4em;
    height: 1em;
    line-height: 1em;
  }
  .cweui-icon-search_in-box {
    position: absolute;
    left: 12px;
    top: 50%;
    margin-top: -12px;
  }
  .cweui-search-bar__text {
    display: inline-block;
    font-size: 14px;
    vertical-align: top;
  }
  .cweui-search-bar__form {
    position: relative;
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    border-radius: 4px;
    background: #FFFFFF;
  }
  .cweui-search-bar__box {
    position: relative;
    padding-left: 42px;
    padding-right: 32px;
    width: 100%;
    box-sizing: border-box;
    z-index: 1;
  }
  .cweui-search-bar__input {
    height: 32px;
    line-height: 32px;
    font-size: 14px;
    caret-color: #07C160;
  }
  .cweui-icon-clear {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    padding: 0 12px;
    font-size: 0;
  }
  .cweui-icon-clear:after {
    content: "";
    height: 100%;
    vertical-align: middle;
    display: inline-block;
    width: 0;
    overflow: hidden;
  }
  .cweui-icon-clear .a-icon {
    vertical-align: middle;
  }
  .cweui-search-bar__label {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2;
    border-radius: 4px;
    text-align: center;
    color: rgba(0,0,0,0.5);
    background: #FFFFFF;
    line-height: 32px;
  }
  .cweui-search-bar__cancel-btn {
    margin-left: 8px;
    line-height: 32px;
    font-size: 0.3rem;
    color: #666;
    white-space: nowrap;
  }
  .searchbar-result {
    padding-left: 0.32rem;
    background: #fff;
    position: relative;
    top: 0rem;
    left: 0rem;
    right: 0rem;
  }
  .searchbar-result .searchItem {
    padding: 0.32rem 0.32rem 0.32rem 0rem;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: start;
    -webkit-justify-content: start;
            justify-content: start;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .searchbar-result .searchItem:last-child {
    border-bottom: none;
  }
  .searchbar-result .view-text {
    font-size: 0.32rem;
    color: #333;
  }
  .searchbar-result .view-text.des {
    font-size: 0.28rem;
    color: #999;
    line-height: 0.36rem;
    margin-top: 0.1rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/component/toptips/toptips.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/component/toptips/toptips.js?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Component: $Component } = self.MP;
var Component = $Component || function(){};

Component(
{
  is: "/pages/component/toptips/toptips",
  usingComponents: {},
  render: function() { return __webpack_require__(/*! ./toptips.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 */ "./example/oa/pages/component/toptips/toptips.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8"); },
  
});


/***/ }),

/***/ "./example/oa/pages/component/toptips/toptips.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8":
/*!*******************************************************************************************************!*\
  !*** ./example/oa/pages/component/toptips/toptips.wxml?hash=6c359315a7ada66c6dfaac019bb0ff915df3f4b8 ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "cweui-toptips " + data['className'] + " " + data['extClass'] + " " + (data['show'] ? 'cweui-toptips_show' : '')
    },
    $toString(data['msg'])
  ));
};

/***/ }),

/***/ "./example/oa/pages/component/toptips/toptips.wxss":
/*!*********************************************************!*\
  !*** ./example/oa/pages/component/toptips/toptips.wxss ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/component/toptips/toptips.wxss' });
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.cweui-toptips {
    position: fixed;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    top: 0px;
    left: 0px;
    right: 0px;
    padding: 10px;
    border-radius: 0px;
    font-size: 14px;
    text-align: center;
    color: #FFF;
    z-index: 5000;
    word-wrap: break-word;
    word-break: break-all;
  }
  .cweui-toptips_warn {
    background-color: #fa5151;
  }
  .cweui-toptips_success {
    background-color: #09bb07;
  }
  .cweui-toptips_error {
    background-color: #F34500;
  }
  .cweui-toptips_info {
    background-color: #10aeff;
  }`));

/***/ }),

/***/ "./example/oa/pages/costaccount/accountDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/costaccount/accountDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/costaccount/accountDetail',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
  render: function() { return __webpack_require__(/*! ./accountDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/costaccount/accountDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
  stylesheet: function() { return __webpack_require__(/*! ./accountDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/costaccount/accountDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
});


/***/ }),

/***/ "./example/oa/pages/costaccount/accountDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!*******************************************************************************************************!*\
  !*** ./example/oa/pages/costaccount/accountDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var ComToptips_ = $getComponentClass("/pages/component/toptips/toptips");
var ComToptips = ComToptips_ || $EmptyComponentFactory("com-toptips");
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var I_ = self.MPUI['i'];
var I = I_ || $EmptyComponentFactory("i");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var Picker_ = self.MPUI['picker'];
var Picker = Picker_ || $EmptyComponentFactory("picker");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([data['showMsg'] == true ? _react2.default.createElement(ComToptips, {
    msg: data['error'], type: "error", $isCustomComponent: this.$isCustomComponent, __tag: "com-toptips"
  }) : null, _react2.default.createElement(
    View,
    {
      className: "account-wrapper"
    },
    [data['showAdd'] === false ? _react2.default.createElement(
      View,
      null,
      [_react2.default.createElement(
        View,
        {
          className: "accout-totalNumber"
        },
        [[$toString(data['textItemdetailtotalamount']), $toString(" (¥)")], _react2.default.createElement(
          Text,
          {
            className: "accout-total-num"
          },
          $toString(data['sum'])
        )]
      ), $iterate(data['detailItemList'], function (item, index) {
        return _react2.default.createElement(
          View,
          {
            className: "accout-card " + (data['langStr'] == 'en_US' ? 'en' : '')
          },
          [_react2.default.createElement(
            View,
            {
              className: "border-bottom-1px"
            },
            _react2.default.createElement(
              View,
              {
                className: "accout-card-hd"
              },
              [[$toString(data['textItemdetail']), $toString(" "), $toString(index + 1)], _react2.default.createElement(I, {
                className: "accout-card-hd-icon iconfont icon-del", ontap: $getEventHandler(_this, "delDetail"), "data-index": index
              }), _react2.default.createElement(I, {
                className: "accout-card-hd-icon-edit iconfont icon-edit", ontap: $getEventHandler(_this, "editDetail"), "data-index": index
              })]
            )
          ), _react2.default.createElement(
            View,
            {
              className: "accout-card-bd"
            },
            _react2.default.createElement(
              View,
              {
                className: "account-group-box"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "border-bottom-1px"
                },
                _react2.default.createElement(
                  View,
                  {
                    className: "account-box-list"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "account-box-title accou account-box-imp"
                    },
                    $toString(data['textItemname'])
                  ), _react2.default.createElement(
                    View,
                    {
                      className: "account-box-content"
                    },
                    _react2.default.createElement(
                      View,
                      {
                        className: "account-box-content-txt"
                      },
                      $toString($getLooseDataMember([item, "itemName"]))
                    )
                  )]
                )
              ), _react2.default.createElement(
                View,
                {
                  className: "border-bottom-1px"
                },
                _react2.default.createElement(
                  View,
                  {
                    className: "account-box-list"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "account-box-title account-box-imp"
                    },
                    $toString(data['textDateofoccurance'])
                  ), _react2.default.createElement(
                    View,
                    {
                      className: "account-box-content"
                    },
                    _react2.default.createElement(
                      View,
                      {
                        className: "account-box-content-txt"
                      },
                      $toString($getLooseDataMember([item, "useDate"]))
                    )
                  )]
                )
              ), _react2.default.createElement(
                View,
                {
                  className: "border-bottom-1px"
                },
                _react2.default.createElement(
                  View,
                  {
                    className: "account-box-list"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "account-box-title account-box-imp"
                    },
                    $toString(data['textUnitprice'])
                  ), _react2.default.createElement(
                    View,
                    {
                      className: "account-box-content"
                    },
                    _react2.default.createElement(
                      View,
                      {
                        className: "account-box-content-txt"
                      },
                      $toString($getLooseDataMember([item, "amount"]))
                    )
                  )]
                )
              ), _react2.default.createElement(
                View,
                {
                  className: "account-box-list-remark"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "account-group-title"
                  },
                  $toString(data['textExplanation'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "account-group-box"
                  },
                  _react2.default.createElement(
                    View,
                    {
                      className: "account-box-content-txt-desc"
                    },
                    $toString($getLooseDataMember([item, "explanation"]))
                  )
                )]
              )]
            )
          )]
        );
      }), _react2.default.createElement(
        View,
        {
          className: "btn-area"
        },
        _react2.default.createElement(
          Button,
          {
            className: "btn-default btn-block ", ontap: $getEventHandler(this, "addDetialItem")
          },
          [_react2.default.createElement(Icon, {
            className: "iconfont icon-add"
          }), [$toString(data['btnAdd']), $toString(data['textItemdetail'])]]
        )
      )]
    ) : null, data['showAdd'] ? _react2.default.createElement(
      View,
      null,
      [_react2.default.createElement(
        View,
        {
          className: "accout-card " + (data['langStr'] == 'en_US' ? 'en' : '')
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "accout-card-hd"
            },
            [$toString(data['textItemdetail']), $toString(" "), $toString(data['curIndex'] + 1 || $getLooseDataMember([data['detailItemList'], "length"]) + 1)]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "accout-card-bd"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-group-box"
            },
            [_react2.default.createElement(
              View,
              {
                className: "border-bottom-1px"
              },
              _react2.default.createElement(
                View,
                {
                  className: "account-box-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "account-box-title accou account-box-imp"
                  },
                  $toString(data['textItemname'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "account-box-content"
                  },
                  _react2.default.createElement(Input, {
                    className: "account-box-content-txt", value: $getLooseDataMember([data['currentItem'], "itemName"]), oninput: $getEventHandler(this, "bindProjectName")
                  })
                )]
              )
            ), _react2.default.createElement(
              View,
              {
                className: "border-bottom-1px"
              },
              _react2.default.createElement(
                View,
                {
                  className: "account-box-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "account-box-title account-box-imp"
                  },
                  $toString(data['textDateofoccurance'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "account-box-content"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "account-box-content-txt"
                    },
                    _react2.default.createElement(
                      Picker,
                      {
                        mode: "date", value: $getLooseDataMember([data['currentItem'], "useDate"]), onchange: $getEventHandler(this, "bindDateChange")
                      },
                      _react2.default.createElement(
                        View,
                        {
                          className: "picker"
                        },
                        $toString($getLooseDataMember([data['currentItem'], "useDate"]))
                      )
                    )
                  ), _react2.default.createElement(Icon, {
                    className: "iconfont icon-right-arrow"
                  })]
                )]
              )
            ), _react2.default.createElement(
              View,
              {
                className: "border-bottom-1px"
              },
              _react2.default.createElement(
                View,
                {
                  className: "account-box-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "account-box-title account-box-imp"
                  },
                  $toString(data['textUnitprice'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "account-box-content"
                  },
                  _react2.default.createElement(Input, {
                    className: "account-box-content-txt", value: $getLooseDataMember([data['currentItem'], "amount"]), oninput: $getEventHandler(this, "bindAmount")
                  })
                )]
              )
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-list-remark"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-group-title"
                },
                $toString(data['textExplanation'])
              ), _react2.default.createElement(
                View,
                {
                  className: "account-group-box"
                },
                _react2.default.createElement(Textarea, {
                  className: "account-group-box-textarea", maxlength: "800", value: $getLooseDataMember([data['currentItem'], "explanation"]), placeholder: data['textLimited'], oninput: $getEventHandler(this, "bindExplanation")
                })
              )]
            )]
          )
        )]
      ), _react2.default.createElement(
        View,
        {
          className: "btn-area btn-middle"
        },
        [_react2.default.createElement(
          Button,
          {
            className: "btn-default middle", ontap: $getEventHandler(this, "cancelAdd")
          },
          $toString(data['textBtnCancel'])
        ), _react2.default.createElement(
          Button,
          {
            className: "btn-primary middle", ontap: $getEventHandler(this, "submitItemDetail")
          },
          $toString(data['textBtnSure'])
        )]
      )]
    ) : null]
  ), data['showAdd'] === false ? _react2.default.createElement(
    View,
    {
      className: "fixed-bottom"
    },
    _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default middle", ontap: $getEventHandler(this, "beforeStep")
        },
        $toString(data['btnBack'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary middle", ontap: $getEventHandler(this, "submitFunc")
        },
        $toString(data['btnSubmit'])
      )]
    )
  ) : null]);
};

/***/ }),

/***/ "./example/oa/pages/costaccount/accountDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!*******************************************************************************************************!*\
  !*** ./example/oa/pages/costaccount/accountDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \*******************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/toptips/toptips.wxss */ "./example/oa/pages/component/toptips/toptips.wxss");
/* harmony import */ var _travelPay_travelDetail_wxss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../travelPay/travelDetail.wxss */ "./example/oa/pages/travelPay/travelDetail.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/costaccount/accountDetail.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);

stylesheet.imports(_travelPay_travelDetail_wxss__WEBPACK_IMPORTED_MODULE_2__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/costaccount/index.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!************************************************************************************!*\
  !*** ./example/oa/pages/costaccount?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/costaccount/index',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/costaccount/index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/costaccount/index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
});


/***/ }),

/***/ "./example/oa/pages/costaccount/index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!***********************************************************************************************!*\
  !*** ./example/oa/pages/costaccount/index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var ComToptips_ = $getComponentClass("/pages/component/toptips/toptips");
var ComToptips = ComToptips_ || $EmptyComponentFactory("com-toptips");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Picker_ = self.MPUI['picker'];
var Picker = Picker_ || $EmptyComponentFactory("picker");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "account-page  " + (data['langStr'] == 'en_US' ? 'en' : '')
    },
    [data['showMsg'] == true ? _react2.default.createElement(ComToptips, {
      msg: data['error'], type: "error", $isCustomComponent: this.$isCustomComponent, __tag: 'com-toptips'
    }) : null, _react2.default.createElement(
      View,
      {
        className: "account-tip"
      },
      [_react2.default.createElement(Icon, {
        className: "iconfont icon-information"
      }), _react2.default.createElement(
        View,
        {
          className: "account-tip-txt"
        },
        $toString(data['textPrompt'])
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "account-group"
      },
      [_react2.default.createElement(
        View,
        {
          className: "account-group-title"
        },
        $toString(data['textBasicInfo'])
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-box"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title"
              },
              $toString(data['textBudgettype'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt unchange"
                },
                $toString(data['budgetType'])
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-arrow-right"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title"
              },
              $toString(data['textCostcenter'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt unchange "
                },
                $toString(data['costCenter'])
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-arrow-right"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textPaymentcompany'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content", ontap: $getEventHandler(this, "goSearchCompany"), 'data-company': data['payCompany']
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                $toString(data['payCompany'])
              ), _react2.default.createElement(Icon, {
                className: "iconfont  icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textApportionmentmonth'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(
                  Picker,
                  {
                    mode: "date", value: data['shareDate'], fields: data['fields'], onchange: $getEventHandler(this, "bindDateChange")
                  },
                  _react2.default.createElement(
                    View,
                    {
                      className: "picker"
                    },
                    $toString(data['dateFormat'])
                  )
                )
              ), _react2.default.createElement(Icon, {
                className: "iconfont  icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textBudgetclassification'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content", ontap: $getEventHandler(this, "goSearchBudgeClass")
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(Input, {
                  className: "account-box-content-txt", placeholder: data['textSelectBudgettype'], value: data['budgetClass'], readonly: "readonly"
                })
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textNumberofinvoice'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textNumberInvoices'], value: data['invoiceNumber'], oninput: $getEventHandler(this, "bindInvoice")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title " + (data['isNeedBusinessTypeRequired'] ? 'account-box-imp' : '')
              },
              $toString(data['textBusinessType'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content", ontap: $getEventHandler(this, "goSearchBusinessType")
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(Input, {
                  className: "account-box-content-txt", placeholder: data['textSelectBusinesstype'], value: data['businessType'], readonly: "readonly"
                })
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-right-arrow"
              })]
            )]
          )
        )]
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-title"
        },
        $toString(data['textAccountInfo'])
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-box"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textPayee'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textPayeeName'], value: data['payeeName'], oninput: $getEventHandler(this, "bindPayeeName")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textReceiptaccount'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textReceiptaccountTip'], value: data['payeeAccount'], oninput: $getEventHandler(this, "bindBankAccountName")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textBankname'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textBanknameTip'], value: data['payeeBank'], oninput: $getEventHandler(this, "bindBankName")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textCityofbank'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textCityofbankTip'], value: data['bankCity'], oninput: $getEventHandler(this, "bindBankCity")
              })
            )]
          )
        )]
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-title"
        },
        $toString(data['textRemarks'])
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-box"
        },
        _react2.default.createElement(Textarea, {
          className: "account-group-box-textarea", maxlength: "800", value: data['remarkAll'], placeholder: data['textLimited'], oninput: $getEventHandler(this, "changeRemark")
        })
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "btn"
      },
      _react2.default.createElement(
        Button,
        {
          className: "btn-blue", ontap: $getEventHandler(this, "nextStep")
        },
        [$toString(data['textNext']), $toString(" ( "), $toString(data['textItemdetail']), $toString(" )")]
      )
    )]
  ));
};

/***/ }),

/***/ "./example/oa/pages/costaccount/index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!***********************************************************************************************!*\
  !*** ./example/oa/pages/costaccount/index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \***********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/toptips/toptips.wxss */ "./example/oa/pages/component/toptips/toptips.wxss");
/* harmony import */ var _travelPay_index_wxss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../travelPay/index.wxss */ "./example/oa/pages/travelPay/index.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/costaccount/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);

stylesheet.imports(_travelPay_index_wxss__WEBPACK_IMPORTED_MODULE_2__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/detail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!******************************************************************************************!*\
  !*** ./example/oa/pages/detail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/detail/addFlow',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/detail/addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/detail/addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/detail/addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!********************************************************************************************!*\
  !*** ./example/oa/pages/detail/addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([_react2.default.createElement(
    View,
    {
      className: "addFlow-card"
    },
    [_react2.default.createElement(
      View,
      {
        className: "addFlow-card-hd"
      },
      $toString(data['textAddJoiner'])
    ), _react2.default.createElement(
      View,
      {
        className: "addFlow-card-bd"
      },
      _react2.default.createElement(
        View,
        {
          className: "list"
        },
        [$iterate(data['flowData'], function (item, index) {
          return _react2.default.createElement(
            View,
            {
              className: "item"
            },
            [_react2.default.createElement(
              View,
              {
                className: "avator"
              },
              _react2.default.createElement(Image, {
                className: "avator-img", src: $getLooseDataMember([item, "avatar"])
              })
            ), _react2.default.createElement(
              View,
              {
                className: "fullname"
              },
              $toString($getLooseDataMember([item, "name"]))
            ), _react2.default.createElement(
              View,
              {
                className: "close", ontap: $getEventHandler(_this, "deleteInfo"), 'data-id': $getLooseDataMember([item, "id"])
              },
              _react2.default.createElement(Icon, {
                className: "iconfont icon-closed_shapeed"
              })
            )]
          );
        }), _react2.default.createElement(
          View,
          {
            className: "item"
          },
          _react2.default.createElement(
            View,
            {
              className: "avator", ontap: $getEventHandler(this, "openSearch")
            },
            _react2.default.createElement(Icon, {
              className: "iconfont icon-add_line"
            })
          )
        )]
      )
    )]
  ), _react2.default.createElement(
    View,
    {
      className: "addFlow-card"
    },
    [_react2.default.createElement(
      View,
      {
        className: "addFlow-card-hd"
      },
      $toString(data['textAddJoinerList'])
    ), _react2.default.createElement(
      View,
      {
        className: "addFlow-card-bd"
      },
      _react2.default.createElement(Textarea, {
        placeholder: data['textAddJoinerSelect'], className: "textarea", value: data['value'], placeholderClass: "textarea-placeholder", oninput: $getEventHandler(this, "inputFun")
      })
    )]
  ), _react2.default.createElement(
    View,
    {
      className: "btn"
    },
    _react2.default.createElement(
      Button,
      {
        className: "btn-primary large", ontap: $getEventHandler(this, "submitAddFlow")
      },
      $toString(data['btnAddConfirm'])
    )
  )]);
};

/***/ }),

/***/ "./example/oa/pages/detail/addFlow.wxss":
/*!**********************************************!*\
  !*** ./example/oa/pages/detail/addFlow.wxss ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/detail/addFlow.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.addFlow-card {
    padding: 0.32rem;
    background: #fff;
    margin-bottom: 0.16rem;
  }
  .addFlow-card-hd {
    text-align: left;
    font-size: 0.32rem;
    color: #333;
    letter-spacing: 0;
    line-height: 0.4rem;
    margin-bottom: 0.32rem;
  }
  .addFlow-card-bd {
    text-align: left;
    font-size: 0.32rem;
    color: #333;
    letter-spacing: 0;
    line-height: 0.4rem;
  }
  .list {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    width: 100%;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-flow: row wrap;
            flex-flow: row wrap;
  }
  .item {
    position: relative;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    width: 25%;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    font-size: 0.28rem;
    color: #333;
    letter-spacing: 0;
    line-height: 0.36rem;
    margin-bottom: 0.5rem;
    padding: 0 0.24rem;
    box-sizing: border-box;
  }
  .avator {
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 100%;
    overflow: hideen;
    text-align: center;
    margin-bottom: 0.2rem;
  }
  .avator-img {
    height: 100%;
    width: 100%;
    border-radius: 100%;
  }
  .fullname {
    font-size: 0.28rem;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .close {
    position: absolute;
    right: 0;
    top: -0.1rem;
  }
  .close .icon-closed_shapeed {
    color: #F34500;
  }
  .icon-add_line, .icon-add_line {
    margin-top: 0.28rem;
  }
  .icon-add_line, .icon-add_line:before {
    font-size: 0.9rem;
    color: #ccc;
  }
  .textarea-placeholder {
    font-size: 0.3rem;
    color: #999;
    letter-spacing: 0;
    line-height: 0.38rem;
  }
  .textarea {
    width: 100%;
    height: 150px;
  }
  .btn {
    padding: 0.32rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/detail/addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!********************************************************************************************!*\
  !*** ./example/oa/pages/detail/addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/detail/addFlow.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.addFlow-card {
    padding: 0.32rem;
    background: #fff;
    margin-bottom: 0.16rem;
  }
  .addFlow-card-hd {
    text-align: left;
    font-size: 0.32rem;
    color: #333;
    letter-spacing: 0;
    line-height: 0.4rem;
    margin-bottom: 0.32rem;
  }
  .addFlow-card-bd {
    text-align: left;
    font-size: 0.32rem;
    color: #333;
    letter-spacing: 0;
    line-height: 0.4rem;
  }
  .list {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    width: 100%;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-flow: row wrap;
            flex-flow: row wrap;
  }
  .item {
    position: relative;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    width: 25%;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    font-size: 0.28rem;
    color: #333;
    letter-spacing: 0;
    line-height: 0.36rem;
    margin-bottom: 0.5rem;
    padding: 0 0.24rem;
    box-sizing: border-box;
  }
  .avator {
    width: 0.9rem;
    height: 0.9rem;
    border-radius: 100%;
    overflow: hideen;
    text-align: center;
    margin-bottom: 0.2rem;
  }
  .avator-img {
    height: 100%;
    width: 100%;
    border-radius: 100%;
  }
  .fullname {
    font-size: 0.28rem;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .close {
    position: absolute;
    right: 0;
    top: -0.1rem;
  }
  .close .icon-closed_shapeed {
    color: #F34500;
  }
  .icon-add_line, .icon-add_line {
    margin-top: 0.28rem;
  }
  .icon-add_line, .icon-add_line:before {
    font-size: 0.9rem;
    color: #ccc;
  }
  .textarea-placeholder {
    font-size: 0.3rem;
    color: #999;
    letter-spacing: 0;
    line-height: 0.38rem;
  }
  .textarea {
    width: 100%;
    height: 150px;
  }
  .btn {
    padding: 0.32rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/detail/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************!*\
  !*** ./example/oa/pages/detail?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/detail/index',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/detail/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/detail/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/detail/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!******************************************************************************************!*\
  !*** ./example/oa/pages/detail/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var I_ = self.MPUI['i'];
var I = I_ || $EmptyComponentFactory("i");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([_react2.default.createElement(
    View,
    {
      className: "detail-card-space " + (data['langStr'] == 'en_US' ? 'en' : '')
    },
    [_react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-all-1px-noleft"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd detail-form-title"
          },
          $toString(data['title'])
        )
      ), _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-submitor"
            },
            [_react2.default.createElement(
              View,
              {
                className: "detail-card-text detail-card-text-memberinfo", ontap: $getEventHandler(this, "goUserInfo"), 'data-empcode': $getLooseDataMember([data['commonHeaderData'], "account"])
              },
              [[$toString($getLooseDataMember([data['commonHeaderData'], "fullname"])), $toString(" ["), $toString($getLooseDataMember([data['commonHeaderData'], "account"])), $toString("]")], $getLooseDataMember([data['commonHeaderData'], "prioritycode"]) != 'normal' ? _react2.default.createElement(
                Text,
                {
                  className: "detail-item-txt-red m-10"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "priority"]))
              ) : null, _react2.default.createElement(Icon, {
                className: "iconfont icon-memberinfo"
              })]
            ), _react2.default.createElement(
              View,
              {
                className: "detail-card-info"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-card-status"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "status"]))
              ), data['showpreUserList'] ? _react2.default.createElement(
                View,
                {
                  className: "detail-card-handle", ontap: $getEventHandler(this, "showPreListFunc")
                },
                [$toString(data['textExpectedapprovers']), _react2.default.createElement(Icon, {
                  className: "iconfont icon-right-arrow"
                })]
              ) : null]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-list detail-list-relative"
            },
            [_react2.default.createElement(
              View,
              {
                className: "detail-item"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-item-title"
                },
                $toString(data['textApplyNum'])
              ), _react2.default.createElement(
                View,
                {
                  className: "detail-item-txt"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "code"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "detail-item"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-item-title"
                },
                $toString(data['textApplytime'])
              ), _react2.default.createElement(
                View,
                {
                  className: "detail-item-txt"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "created"]))
              )]
            )]
          )
        ), $getLooseDataMember([data['commonHeaderData'], "status"]) == '已生效' ? _react2.default.createElement(
          View,
          {
            className: "finiStatus"
          },
          _react2.default.createElement(Image, {
            className: "finiStatus-img", src: "../../image/detail_success.png"
          })
        ) : null, $getLooseDataMember([data['commonHeaderData'], "status"]) == '已拒绝' ? _react2.default.createElement(
          View,
          {
            className: "finiStatus"
          },
          _react2.default.createElement(Image, {
            className: "finiStatus-img", src: "../../image/detail_failed.png"
          })
        ) : null]
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-all-1px-noleft"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd detail-form-title"
          },
          $toString("表单详情")
        )
      ), _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-list detail-list-relative"
            },
            $iterate(data['formDetail'], function (item, index) {
              return _react2.default.createElement(
                View,
                {
                  className: "detail-item"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "detail-item-title", name: true
                  },
                  $toString($getLooseDataMember([item, "key"]))
                ), $getLooseDataMember([item, "showArr"]) == true ? _react2.default.createElement(
                  View,
                  {
                    className: "detail-item-txt"
                  },
                  ($getLooseDataMember([item, "value"]) ? $getLooseDataMember([item, "value", "length"]) > 0 : false) ? $getLooseDataMember([item, "keyCode"]) == 'BudgetRatio' ? $iterate($getLooseDataMember([item, "value"]), function (item, index) {
                    return _react2.default.createElement(
                      View,
                      null,
                      [$getLooseDataMember([data['commonHeaderData'], "isMutilpCostCenter"]) == true && $getLooseDataMember([item, "costCenter"]) && $getLooseDataMember([item, "costCenter", "length"]) > 0 ? _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "costCenter"])), $toString(" |")]
                      ) : null, $getLooseDataMember([data['commonHeaderData'], "isMutilpCostCenter"]) == false && $getLooseDataMember([item, "budgetType"]) && $getLooseDataMember([item, "budgetType", "length"]) > 0 ? _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "budgetType"])), $toString(" |")]
                      ) : null, _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "year"])), $toString("年"), $toString($getLooseDataMember([item, "quarter"])), $toString("季度 |")]
                      ), $getLooseDataMember([item, "ratio"]) >= 0 ? _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "ratio"])), $toString(" %")]
                      ) : null, $getLooseDataMember([item, "ratio"]) < 0 ? _react2.default.createElement(
                        Text,
                        {
                          className: "detail-item-txt-red"
                        },
                        [$toString($getLooseDataMember([item, "ratio"])), $toString(" %")]
                      ) : null]
                    );
                  }) : $iterate($getLooseDataMember([item, "value"]), function (item, index) {
                    return _react2.default.createElement(
                      View,
                      null,
                      $toString($getLooseDataMember([item, "value"]) || item)
                    );
                  }) : _react2.default.createElement(
                    View,
                    {
                      className: "detail-item-txt"
                    },
                    _react2.default.createElement(
                      Text,
                      null,
                      $toString("--")
                    )
                  )
                ) : _react2.default.createElement(
                  View,
                  {
                    className: "detail-item-txt"
                  },
                  _react2.default.createElement(
                    Text,
                    {
                      className: $getLooseDataMember([item, "isRed"]) == true ? 'detail-item-txt-red' : ''
                    },
                    $toString($getLooseDataMember([item, "value"]) ? $getLooseDataMember([item, "value"]) : '--')
                  )
                )]
              );
            })
          )
        )
      )]
    ), data['showDetail'] == 'chargeDetails' && $getLooseDataMember([data['detailValueList'], "length"]) > 0 ? _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd"
          },
          [_react2.default.createElement(
            View,
            {
              className: "detail-card-text"
            },
            [_react2.default.createElement(
              Text,
              {
                className: "title"
              },
              $toString(data['detailTitle'])
            ), data['formId'] != '63' ? _react2.default.createElement(
              Text,
              {
                className: "price"
              },
              $toString(data['totalAmt'])
            ) : null]
          ), _react2.default.createElement(
            View,
            {
              className: "toggle showUp", ontap: $getEventHandler(this, "showCostDetailFunc")
            },
            [_react2.default.createElement(
              Text,
              null,
              $toString(data['showCostDetail'] == false ? data['textOpen'] : data['textClose'])
            ), data['showCostDetail'] == true ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-up"
            }) : null, data['showCostDetail'] == false ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-down"
            }) : null]
          )]
        )
      ), data['showCostDetail'] == true ? _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        $iterate(data['detailValueList'], function (item, index) {
          return _react2.default.createElement(
            View,
            {
              className: "border-bottom-1px"
            },
            _react2.default.createElement(
              View,
              {
                className: "detail-list"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-list-title"
                },
                [$toString(data['textTravelitem']), $toString(" "), $toString(index + 1)]
              ), $iterate(item, function (item, index) {
                return _react2.default.createElement(
                  View,
                  {
                    className: "detail-item"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "detail-item-title"
                    },
                    $toString($getLooseDataMember([item, "key"]))
                  ), _react2.default.createElement(
                    View,
                    {
                      className: "detail-item-txt"
                    },
                    $toString($getLooseDataMember([item, "value"]))
                  )]
                );
              })]
            )
          );
        })
      ) : null]
    ) : null, data['totalattachmentCount'] > 0 ? _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd"
          },
          [_react2.default.createElement(
            View,
            {
              className: "detail-card-text"
            },
            _react2.default.createElement(
              Text,
              {
                className: "title"
              },
              [$toString(data['textAttachment']), $toString("("), $toString(data['totalattachmentCount'] || 0), $toString(")")]
            )
          ), data['totalattachmentCount'] > 0 ? _react2.default.createElement(
            View,
            {
              className: "toggle showUp", ontap: $getEventHandler(this, "showAttachmentDetailFunc")
            },
            [_react2.default.createElement(
              Text,
              null,
              $toString(data['showAttachmentDetail'] == false ? data['textOpen'] : data['textClose'])
            ), data['showAttachmentDetail'] == true ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-up"
            }) : null, data['showAttachmentDetail'] == false ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-down"
            }) : null]
          ) : null]
        )
      ), data['showAttachmentDetail'] == true && data['totalattachmentCount'] > 0 ? _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-list  detail-list-file"
            },
            $iterate(data['oaattachmentList'], function (item, index) {
              return _react2.default.createElement(
                View,
                {
                  className: "detail-item"
                },
                _react2.default.createElement(
                  View,
                  {
                    className: "detail-item-image", ontap: $getEventHandler(_this, "downLoadFile"), 'data-idx': index
                  },
                  $toString($getLooseDataMember([item, "fileName"]))
                )
              );
            })
          )
        )
      ) : null]
    ) : null, _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd detail-form-title"
          },
          $toString(data['textWorkflowlog'])
        )
      ), $getLooseDataMember([data['workflowLogs'], "length"]) > 0 ? _react2.default.createElement(
        View,
        {
          className: "step-list"
        },
        $iterate(data['workflowLogs'], function (item, index) {
          return index == $getLooseDataMember([data['workflowLogs'], "length"]) - 1 ? _react2.default.createElement(
            View,
            {
              className: "step-item active"
            },
            [_react2.default.createElement(I, {
              className: "icon-right"
            }), _react2.default.createElement(
              View,
              {
                className: "step-item-title"
              },
              $toString($getLooseDataMember([item, "fromstatusName"]))
            ), _react2.default.createElement(
              View,
              {
                className: "step-item-info"
              },
              $iterate($getLooseDataMember([item, "users"]), function (item, index) {
                return [_react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "fullName"]))
                ), _react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "remark"]))
                )];
              })
            )]
          ) : _react2.default.createElement(
            View,
            {
              className: "step-item"
            },
            [_react2.default.createElement(I, {
              className: "icon-right"
            }), _react2.default.createElement(
              View,
              {
                className: "step-item-title"
              },
              $toString($getLooseDataMember([item, "fromstatusName"]))
            ), _react2.default.createElement(
              View,
              {
                className: "step-item-info"
              },
              $iterate($getLooseDataMember([item, "users"]), function (item, index) {
                return [_react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "fullName"]))
                ), _react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "remark"]))
                )];
              })
            )]
          );
        })
      ) : null]
    )]
  ), _react2.default.createElement(
    View,
    {
      className: "fixed-bottom"
    },
    [$getLooseDataMember([data['buttonData'], "eform_onlycommit"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small disabled"
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small", ontap: $getEventHandler(this, "agreeConfirm")
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small disabled"
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "eform_onlyjoin"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small ", ontap: $getEventHandler(this, "addFlowAgent")
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small disabled"
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small disabled"
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "eform_join"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small ", ontap: $getEventHandler(this, "addFlowAgent")
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small ", ontap: $getEventHandler(this, "agreeConfirm")
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small disabled"
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "eform_app"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small ", ontap: $getEventHandler(this, "addFlowAgent")
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small ", ontap: $getEventHandler(this, "agreeConfirm")
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small ", ontap: $getEventHandler(this, "refuseConfirm")
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "has_approved"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      _react2.default.createElement(
        Button,
        {
          className: "btn-primary large ", ontap: $getEventHandler(this, "goNext")
        },
        $toString(data['textBtnNext'])
      )
    ) : null]
  ), data['showAgreeCommit'] ? _react2.default.createElement(
    View,
    {
      className: "mask"
    },
    _react2.default.createElement(
      View,
      {
        className: "toast-box"
      },
      [_react2.default.createElement(
        View,
        {
          className: "toast-box-hd"
        },
        $toString(data['operateTitle'])
      ), _react2.default.createElement(
        View,
        {
          className: "toast-box-bd"
        },
        _react2.default.createElement(Textarea, {
          placeholder: "最多可写200字", className: "textarea", placeholderClass: "textarea-placeholder", fixed: "true", value: data['submitRemark'], oninput: $getEventHandler(this, "changeRemark")
        })
      ), _react2.default.createElement(
        View,
        {
          className: "toast-box-ft"
        },
        [_react2.default.createElement(
          Button,
          {
            className: "btn-default small", ontap: $getEventHandler(this, "cancelConfirm")
          },
          $toString(data['textBtnCancel'])
        ), _react2.default.createElement(
          Button,
          {
            className: "btn-primary small", ontap: $getEventHandler(this, "sureConfirm")
          },
          $toString(data['textBtnSure'])
        )]
      )]
    )
  ) : null, data['showPreList'] ? _react2.default.createElement(
    View,
    {
      className: "mask"
    },
    _react2.default.createElement(
      View,
      {
        className: "toast-box bottom-modal"
      },
      [_react2.default.createElement(
        View,
        {
          className: "toast-box-hd"
        },
        [$toString(data['textViewexpectedapprovers']), _react2.default.createElement(Icon, {
          className: "iconfont icon-close", ontap: $getEventHandler(this, "hidePreListFunc")
        })]
      ), _react2.default.createElement(
        View,
        {
          className: "toast-box-bd"
        },
        _react2.default.createElement(
          View,
          {
            className: "step-list"
          },
          $iterate(data['preUserList'], function (item, index) {
            return _react2.default.createElement(
              View,
              {
                className: "step-item done"
              },
              [_react2.default.createElement(I, {
                className: "icon-right"
              }), _react2.default.createElement(
                View,
                {
                  className: "step-item-title"
                },
                $toString($getLooseDataMember([item, "fromstatusName"]))
              ), _react2.default.createElement(
                View,
                {
                  className: "step-item-info"
                },
                $iterate($getLooseDataMember([item, "usernames"]), function (item, index) {
                  return _react2.default.createElement(
                    Text,
                    null,
                    [$toString($getLooseDataMember([item, "username"])), $toString("["), $toString($getLooseDataMember([item, "account"])), $toString("]")]
                  );
                })
              )]
            );
          })
        )
      )]
    )
  ) : null]);
};

/***/ }),

/***/ "./example/oa/pages/detail/index.wxss":
/*!********************************************!*\
  !*** ./example/oa/pages/detail/index.wxss ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/detail/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.detail-container {
    padding-bottom: 1.2rem;
  }
  .detail-card {
    background: #fff;
    margin-bottom: 0.16rem;
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #333;
    overflow-x: hidden;
  }
  .detail-card-hd {
    position: relative;
    padding: 0.32rem 0.32rem;
  }
  .detail-card-hd.detail-form-title {
    line-height: 0.4rem;
    padding: 0.26rem 0.32rem;
    font-size: 0.32rem;
    color: #000;
    font-family: "PingFangSC-Medium";
  }
  .detail-submitor {
    padding: 0.32rem 0;
  }
  .detail-card-text {
    font-size: 0.32rem;
    line-height: 0.4rem;
    color: #333;
  }
  .detail-card-text .title {
    font-family: "PingFangSC-Medium";
  }
  .detail-card-text-memberinfo {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .detail-card-info {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
  }
  .icon-memberinfo {
    padding-top: 0.05rem;
    margin-left: 0.16rem;
    margin-right: 0.36rem;
  }
  .detail-card-text+.detail-card-info {
    margin-top: 0.16rem;
  }
  .detail-card-status {
    font-size: 0.3rem;
    color: #ff6f00;
  }
  .detail-card-handle {
    font-size: 0.3rem;
    color: #006bff;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    margin-right: 0.24rem;
  }
  .detail-card-handle .icon-right-arrow {
    color: #006bff;
    font-size: 0.3rem;
  }
  .detail-card-bd {
    padding: 0 0 0 0.32rem;
    position: relative;
  }
  .detail-card-space {
    padding-bottom: calc(1.2rem + constant(safe-area-inset-bottom));
    padding-bottom: calc(1.2rem + env(safe-area-inset-bottom));
  }
  .detail-list {
    padding: 0 0rem 0.24rem 0;
  }
  .detail-list-title {
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    padding: 0.32rem 0.32rem 0.32rem 0rem;
  }
  .detail-list-relative {
    position: relative;
    padding-top: 0.24rem;
  }
  .detail-list:last-of-type {
    border-bottom: none;
  }
  .detail-item {
    padding: 0.12rem 0.32rem 0.12rem 0;
  }
  .detail-item-title, .detail-item-txt {
    line-height: 0.38rem;
    text-align: left;
    font-size: 0.3rem;
    margin-bottom: 0.08rem;
  }
  .detail-item-title {
    color: #999;
  }
  .detail-item-title.file {
    font-size: 0.32rem;
    color: #333;
  }
  .detail-item-txt {
    margin-bottom: 0rem;
  }
  .detail-item-txt-red {
    color: red;
  }
  .detail-list.detail-list-file {
    padding: 0.32rem 0rem;
  }
  .detail-list.detail-list-file .detail-item {
    padding: 0 0.32rem 0 0;
    margin-bottom: 0.16rem;
  }
  .detail-list.detail-list-file .detail-item:last-child {
    margin-bottom: 0rem;
  }
  .detail-item-image {
    color: #006bff;
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    line-height: 0.38rem;
    padding: 0.11rem 0;
  }
  .detail-item-image+.detail-item-image {
    margin-top: 0.16rem;
  }
  .price {
    color: #ff6f00;
    padding-left: 0.48rem;
  }
  .toggle {
    position: absolute;
    right: 0.32rem;
    top: 0.32rem;
    color: #006bff;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .toggle .iconfont {
    color: #006bff;
    font-size: 0.2rem;
  }
  .step-list {
    padding: 0.32rem 0.32rem 0.32rem 0.88rem;
  }
  .step-item {
    position: relative;
    padding-bottom: 0.56rem;
    padding-left: 0.34rem;
    font-size: 0.3rem;
    color: #ccc;
    box-sizing: border-box;
    margin-top: -0.06rem;
    line-height: 0.38rem;
  }
  .step-item:last-of-type {
    padding-bottom: 0;
  }
  .step-item .icon-right {
    display: none;
    position: absolute;
    left: -0.07rem;
    top: 0rem;
    z-index: 4;
  }
  .step-item:before {
    position: absolute;
    content: '';
    top: 0.26rem;
    bottom: 0;
    left: 0;
    width: 0.01rem;
    background: #ebeced;
  }
  .step-item:after {
    position: absolute;
    content: '';
    left: -0.14rem;
    top: 0.06rem;
    z-index: 3;
    width: 0.2rem;
    height: 0.2rem;
    background: #999;
    border-radius: 50%;
    border: 0.04rem solid #fff;
  }
  .step-item .step-item-time {
    position: absolute;
    right: 0.32rem;
    top: 0;
    font-size: 0.26rem;
  }
  .step-item.done {
    color: #999;
  }
  .step-item.active .step-item-title {
    margin-bottom: 0.08rem;
    color: #333;
  }
  .step-item.active .step-item-title .status {
    padding-left: 0.19rem;
    color: #ff6f00;
  }
  .step-item.active .step-item-info {
    color: #666;
  }
  .step-item-info {
    line-height: 0.4rem;
  }
  .item-userinfo {
    margin-bottom: 0.16rem;
  }
  .step-item.active .icon-right {
    display: block;
  }
  .step-item.active:after {
    background: #ff6f00;
    border-color: #ff6f00;
  }
  .step-item.active .time {
    display: block;
    color: #999;
  }
  .step-item:last-child:before {
    display: none;
  }
  .fixed-bottom {
    position: fixed;
    z-index: 99;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.05);
  }
  .btn-area.inline {
    margin-top: 0;
    padding: 0.16rem 0.32rem;
    padding-bottom: calc(0.16rem + constant(safe-area-inset-bottom));
    padding-bottom: calc(0.16rem + env(safe-area-inset-bottom));
  }
  .btn-area.inline .a-button {
    display: inline-block;
  }
  .btn-area.inline .a-button+.a-button {
    margin-left: 0.19rem;
  }
  .btn-area .a-button.btn-primary {
    background: #1466de;
    color: #fff;
  }
  .toast-box {
    background: #fff;
    border-radius: 0.16rem;
    padding: 0.4rem;
    width: 5.62rem;
    height: 5.52rem;
    box-sizing: border-box;
    margin: auto;
  }
  .mask {
    position: fixed;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    z-index: 999;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    touch-action: none;
  }
  .toast-box-hd {
    position: relative;
    font-size: 0.34rem;
    color: #333;
    text-align: center;
    line-height: 0.42rem;
    margin-bottom: 0.24rem;
  }
  .toast-box-hd .icon-close {
    position: absolute;
    left: 0.24rem;
    top: 0;
  }
  .toast-box-bd {
    margin-bottom: 0.4rem;
  }
  .textarea {
    width: 100%;
    text-align: left;
    border: 1px solid #ccc;
    border-radius: 0.16rem;
    padding: 0.24rem;
    box-sizing: border-box;
    height: 2.86rem;
  }
  .textarea-placeholder {
    font-size: 0.28rem;
    color: #ccc;
    line-height: 0.36rem;
  }
  .toast-box-ft {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: space-around;
            justify-content: space-around;
  }
  .toast-box-ft .btn-default, .toast-box-ft .btn-primary {
    width: 2.2rem !important;
  }
  .toast-box.bottom-modal {
    bottom: 0;
    position: absolute;
    width: 100%;
    height: auto;
    border-radius: 0.16rem 0.16rem 0 0;
    padding: 0.4rem 0;
  }
  .finiStatus {
    width: 3rem;
    height: 3rem;
    position: absolute;
    top: 0rem;
    right: 0.32rem;
    border-radius: 100%;
    -webkit-transform: rotate(-15deg);
            transform: rotate(-15deg);
    overflow: hidden;
  }
  .finiStatus .finiStatus-img {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .m-10 {
    margin-right: 0.2rem;
    margin-left: 0.2rem;
  }
  .en .detail-item-title {
    font-size: 0.26rem;
    width: 2rem;
  }
  .en .detail-item-txt {
    font-size: 0.26rem;
  }
  .detail-card-bd .border-bottom-1px:last-of-type {
    background-image: none;
  }`));

/***/ }),

/***/ "./example/oa/pages/detail/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!******************************************************************************************!*\
  !*** ./example/oa/pages/detail/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/detail/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.detail-container {
    padding-bottom: 1.2rem;
  }
  .detail-card {
    background: #fff;
    margin-bottom: 0.16rem;
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #333;
    overflow-x: hidden;
  }
  .detail-card-hd {
    position: relative;
    padding: 0.32rem 0.32rem;
  }
  .detail-card-hd.detail-form-title {
    line-height: 0.4rem;
    padding: 0.26rem 0.32rem;
    font-size: 0.32rem;
    color: #000;
    font-family: "PingFangSC-Medium";
  }
  .detail-submitor {
    padding: 0.32rem 0;
  }
  .detail-card-text {
    font-size: 0.32rem;
    line-height: 0.4rem;
    color: #333;
  }
  .detail-card-text .title {
    font-family: "PingFangSC-Medium";
  }
  .detail-card-text-memberinfo {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .detail-card-info {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
  }
  .icon-memberinfo {
    padding-top: 0.05rem;
    margin-left: 0.16rem;
    margin-right: 0.36rem;
  }
  .detail-card-text+.detail-card-info {
    margin-top: 0.16rem;
  }
  .detail-card-status {
    font-size: 0.3rem;
    color: #ff6f00;
  }
  .detail-card-handle {
    font-size: 0.3rem;
    color: #006bff;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    margin-right: 0.24rem;
  }
  .detail-card-handle .icon-right-arrow {
    color: #006bff;
    font-size: 0.3rem;
  }
  .detail-card-bd {
    padding: 0 0 0 0.32rem;
    position: relative;
  }
  .detail-card-space {
    padding-bottom: calc(1.2rem + constant(safe-area-inset-bottom));
    padding-bottom: calc(1.2rem + env(safe-area-inset-bottom));
  }
  .detail-list {
    padding: 0 0rem 0.24rem 0;
  }
  .detail-list-title {
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    padding: 0.32rem 0.32rem 0.32rem 0rem;
  }
  .detail-list-relative {
    position: relative;
    padding-top: 0.24rem;
  }
  .detail-list:last-of-type {
    border-bottom: none;
  }
  .detail-item {
    padding: 0.12rem 0.32rem 0.12rem 0;
  }
  .detail-item-title, .detail-item-txt {
    line-height: 0.38rem;
    text-align: left;
    font-size: 0.3rem;
    margin-bottom: 0.08rem;
  }
  .detail-item-title {
    color: #999;
  }
  .detail-item-title.file {
    font-size: 0.32rem;
    color: #333;
  }
  .detail-item-txt {
    margin-bottom: 0rem;
  }
  .detail-item-txt-red {
    color: red;
  }
  .detail-list.detail-list-file {
    padding: 0.32rem 0rem;
  }
  .detail-list.detail-list-file .detail-item {
    padding: 0 0.32rem 0 0;
    margin-bottom: 0.16rem;
  }
  .detail-list.detail-list-file .detail-item:last-child {
    margin-bottom: 0rem;
  }
  .detail-item-image {
    color: #006bff;
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    line-height: 0.38rem;
    padding: 0.11rem 0;
  }
  .detail-item-image+.detail-item-image {
    margin-top: 0.16rem;
  }
  .price {
    color: #ff6f00;
    padding-left: 0.48rem;
  }
  .toggle {
    position: absolute;
    right: 0.32rem;
    top: 0.32rem;
    color: #006bff;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .toggle .iconfont {
    color: #006bff;
    font-size: 0.2rem;
  }
  .step-list {
    padding: 0.32rem 0.32rem 0.32rem 0.88rem;
  }
  .step-item {
    position: relative;
    padding-bottom: 0.56rem;
    padding-left: 0.34rem;
    font-size: 0.3rem;
    color: #ccc;
    box-sizing: border-box;
    margin-top: -0.06rem;
    line-height: 0.38rem;
  }
  .step-item:last-of-type {
    padding-bottom: 0;
  }
  .step-item .icon-right {
    display: none;
    position: absolute;
    left: -0.07rem;
    top: 0rem;
    z-index: 4;
  }
  .step-item:before {
    position: absolute;
    content: '';
    top: 0.26rem;
    bottom: 0;
    left: 0;
    width: 0.01rem;
    background: #ebeced;
  }
  .step-item:after {
    position: absolute;
    content: '';
    left: -0.14rem;
    top: 0.06rem;
    z-index: 3;
    width: 0.2rem;
    height: 0.2rem;
    background: #999;
    border-radius: 50%;
    border: 0.04rem solid #fff;
  }
  .step-item .step-item-time {
    position: absolute;
    right: 0.32rem;
    top: 0;
    font-size: 0.26rem;
  }
  .step-item.done {
    color: #999;
  }
  .step-item.active .step-item-title {
    margin-bottom: 0.08rem;
    color: #333;
  }
  .step-item.active .step-item-title .status {
    padding-left: 0.19rem;
    color: #ff6f00;
  }
  .step-item.active .step-item-info {
    color: #666;
  }
  .step-item-info {
    line-height: 0.4rem;
  }
  .item-userinfo {
    margin-bottom: 0.16rem;
  }
  .step-item.active .icon-right {
    display: block;
  }
  .step-item.active:after {
    background: #ff6f00;
    border-color: #ff6f00;
  }
  .step-item.active .time {
    display: block;
    color: #999;
  }
  .step-item:last-child:before {
    display: none;
  }
  .fixed-bottom {
    position: fixed;
    z-index: 99;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #fff;
    box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.05);
  }
  .btn-area.inline {
    margin-top: 0;
    padding: 0.16rem 0.32rem;
    padding-bottom: calc(0.16rem + constant(safe-area-inset-bottom));
    padding-bottom: calc(0.16rem + env(safe-area-inset-bottom));
  }
  .btn-area.inline .a-button {
    display: inline-block;
  }
  .btn-area.inline .a-button+.a-button {
    margin-left: 0.19rem;
  }
  .btn-area .a-button.btn-primary {
    background: #1466de;
    color: #fff;
  }
  .toast-box {
    background: #fff;
    border-radius: 0.16rem;
    padding: 0.4rem;
    width: 5.62rem;
    height: 5.52rem;
    box-sizing: border-box;
    margin: auto;
  }
  .mask {
    position: fixed;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    z-index: 999;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    touch-action: none;
  }
  .toast-box-hd {
    position: relative;
    font-size: 0.34rem;
    color: #333;
    text-align: center;
    line-height: 0.42rem;
    margin-bottom: 0.24rem;
  }
  .toast-box-hd .icon-close {
    position: absolute;
    left: 0.24rem;
    top: 0;
  }
  .toast-box-bd {
    margin-bottom: 0.4rem;
  }
  .textarea {
    width: 100%;
    text-align: left;
    border: 1px solid #ccc;
    border-radius: 0.16rem;
    padding: 0.24rem;
    box-sizing: border-box;
    height: 2.86rem;
  }
  .textarea-placeholder {
    font-size: 0.28rem;
    color: #ccc;
    line-height: 0.36rem;
  }
  .toast-box-ft {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: space-around;
            justify-content: space-around;
  }
  .toast-box-ft .btn-default, .toast-box-ft .btn-primary {
    width: 2.2rem !important;
  }
  .toast-box.bottom-modal {
    bottom: 0;
    position: absolute;
    width: 100%;
    height: auto;
    border-radius: 0.16rem 0.16rem 0 0;
    padding: 0.4rem 0;
  }
  .finiStatus {
    width: 3rem;
    height: 3rem;
    position: absolute;
    top: 0rem;
    right: 0.32rem;
    border-radius: 100%;
    -webkit-transform: rotate(-15deg);
            transform: rotate(-15deg);
    overflow: hidden;
  }
  .finiStatus .finiStatus-img {
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .m-10 {
    margin-right: 0.2rem;
    margin-left: 0.2rem;
  }
  .en .detail-item-title {
    font-size: 0.26rem;
    width: 2rem;
  }
  .en .detail-item-txt {
    font-size: 0.26rem;
  }
  .detail-card-bd .border-bottom-1px:last-of-type {
    background-image: none;
  }`));

/***/ }),

/***/ "./example/oa/pages/detail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!*****************************************************************************************!*\
  !*** ./example/oa/pages/detail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/detail/search',
  usingComponents: {"com-search":"/pages/component/search/search"},
  
  render: function() { return __webpack_require__(/*! ./search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/detail/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1"); },
  stylesheet: function() { return __webpack_require__(/*! ./search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/detail/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1"); },
});


/***/ }),

/***/ "./example/oa/pages/detail/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/detail/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var ComSearch_ = $getComponentClass("/pages/component/search/search");
var ComSearch = ComSearch_ || $EmptyComponentFactory("com-search");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(ComSearch, {
    historyHeadTxt: data['textAddHistory'], title: data['textAddJoiner'], historyKey: "flower", inputStatus: true, $isCustomComponent: this.$isCustomComponent, __tag: "com-search"
  }));
};

/***/ }),

/***/ "./example/oa/pages/detail/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/detail/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_search_search_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/search/search.wxss */ "./example/oa/pages/component/search/search.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/detail/search.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_search_search_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/holdOAdetail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/addFlow.js?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/holdOAdetail/addFlow',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/holdOAdetail/addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/holdOAdetail/addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/holdOAdetail/addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!**************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/addFlow.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \**************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([_react2.default.createElement(
    View,
    {
      className: "addFlow-card"
    },
    [_react2.default.createElement(
      View,
      {
        className: "addFlow-card-hd"
      },
      $toString("添加会签人")
    ), _react2.default.createElement(
      View,
      {
        className: "addFlow-card-bd"
      },
      _react2.default.createElement(
        View,
        {
          className: "list"
        },
        [$iterate(data['flowData'], function (item, index) {
          return _react2.default.createElement(
            View,
            {
              className: "item"
            },
            [_react2.default.createElement(
              View,
              {
                className: "avator"
              },
              _react2.default.createElement(Image, {
                className: "avator-img", src: $getLooseDataMember([item, "avatar"])
              })
            ), _react2.default.createElement(
              View,
              {
                className: "fullname"
              },
              $toString($getLooseDataMember([item, "name"]))
            ), _react2.default.createElement(
              View,
              {
                className: "close", ontap: $getEventHandler(_this, "deleteInfo"), 'data-id': $getLooseDataMember([item, "id"])
              },
              _react2.default.createElement(Icon, {
                className: "iconfont icon-closed_shapeed"
              })
            )]
          );
        }), _react2.default.createElement(
          View,
          {
            className: "item"
          },
          _react2.default.createElement(
            View,
            {
              className: "avator", ontap: $getEventHandler(this, "openSearch")
            },
            _react2.default.createElement(Icon, {
              className: "iconfont icon-add_line"
            })
          )
        )]
      )
    )]
  ), _react2.default.createElement(
    View,
    {
      className: "addFlow-card"
    },
    [_react2.default.createElement(
      View,
      {
        className: "addFlow-card-hd"
      },
      $toString("添加会签人原因")
    ), _react2.default.createElement(
      View,
      {
        className: "addFlow-card-bd"
      },
      _react2.default.createElement(Textarea, {
        placeholder: "选填", className: "textarea", value: data['value'], placeholderClass: "textarea-placeholder", oninput: $getEventHandler(this, "inputFun")
      })
    )]
  ), _react2.default.createElement(
    View,
    {
      className: "btn"
    },
    _react2.default.createElement(
      Button,
      {
        className: "btn-primary large", ontap: $getEventHandler(this, "submitAddFlow")
      },
      $toString("确定")
    )
  )]);
};

/***/ }),

/***/ "./example/oa/pages/holdOAdetail/addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!**************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/addFlow.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \**************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _detail_addFlow_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../detail/addFlow.wxss */ "./example/oa/pages/detail/addFlow.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/holdOAdetail/addFlow.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_detail_addFlow_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/holdOAdetail/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/holdOAdetail/index',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/holdOAdetail/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/holdOAdetail/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/holdOAdetail/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var I_ = self.MPUI['i'];
var I = I_ || $EmptyComponentFactory("i");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([_react2.default.createElement(
    View,
    {
      className: "detail-card-space " + (data['langStr'] == 'en_US' ? 'en' : '')
    },
    [_react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-all-1px-noleft"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd detail-form-title"
          },
          $toString(data['title'])
        )
      ), _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-submitor"
            },
            [_react2.default.createElement(
              View,
              {
                className: "detail-card-text detail-card-text-memberinfo", ontap: $getEventHandler(this, "goUserInfo"), 'data-empcode': $getLooseDataMember([data['commonHeaderData'], "account"])
              },
              [[$toString($getLooseDataMember([data['commonHeaderData'], "fullname"])), $toString(" ["), $toString($getLooseDataMember([data['commonHeaderData'], "account"])), $toString("]")], $getLooseDataMember([data['commonHeaderData'], "prioritycode"]) != 'normal' ? _react2.default.createElement(
                Text,
                {
                  className: "detail-item-txt-red m-10"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "priority"]))
              ) : null, _react2.default.createElement(Icon, {
                className: "iconfont icon-memberinfo"
              })]
            ), _react2.default.createElement(
              View,
              {
                className: "detail-card-info"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-card-status"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "status"]))
              ), data['showpreUserList'] ? _react2.default.createElement(
                View,
                {
                  className: "detail-card-handle", ontap: $getEventHandler(this, "showPreListFunc")
                },
                [$toString(data['textExpectedapprovers']), $toString(" >")]
              ) : null]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-list detail-list-relative"
            },
            [_react2.default.createElement(
              View,
              {
                className: "detail-item"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-item-title"
                },
                $toString("申请单号")
              ), _react2.default.createElement(
                View,
                {
                  className: "detail-item-txt"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "code"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "detail-item"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-item-title"
                },
                $toString("申请时间")
              ), _react2.default.createElement(
                View,
                {
                  className: "detail-item-txt"
                },
                $toString($getLooseDataMember([data['commonHeaderData'], "created"]))
              )]
            )]
          )
        ), $getLooseDataMember([data['commonHeaderData'], "status"]) == '已生效' ? _react2.default.createElement(
          View,
          {
            className: "finiStatus"
          },
          _react2.default.createElement(Image, {
            className: "finiStatus-img", src: "../../image/detail_success.png"
          })
        ) : null, $getLooseDataMember([data['commonHeaderData'], "status"]) == '已拒绝' ? _react2.default.createElement(
          View,
          {
            className: "finiStatus"
          },
          _react2.default.createElement(Image, {
            className: "finiStatus-img", src: "../../image/detail_failed.png"
          })
        ) : null]
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-all-1px-noleft"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd detail-form-title"
          },
          $toString("表单详情")
        )
      ), _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-list detail-list-relative"
            },
            $iterate(data['formDetail'], function (item, index) {
              return _react2.default.createElement(
                View,
                {
                  className: "detail-item"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "detail-item-title", name: true
                  },
                  $toString($getLooseDataMember([item, "key"]))
                ), $getLooseDataMember([item, "showArr"]) == true ? _react2.default.createElement(
                  View,
                  {
                    className: "detail-item-txt"
                  },
                  ($getLooseDataMember([item, "value"]) ? $getLooseDataMember([item, "value", "length"]) > 0 : false) ? $getLooseDataMember([item, "keyCode"]) == 'BudgetRatio' ? $iterate($getLooseDataMember([item, "value"]), function (item, index) {
                    return _react2.default.createElement(
                      View,
                      null,
                      [$getLooseDataMember([data['commonHeaderData'], "isMutilpCostCenter"]) == true && $getLooseDataMember([item, "costCenter"]) && $getLooseDataMember([item, "costCenter", "length"]) > 0 ? _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "costCenter"])), $toString(" |")]
                      ) : null, $getLooseDataMember([data['commonHeaderData'], "isMutilpCostCenter"]) == false && $getLooseDataMember([item, "budgetType"]) && $getLooseDataMember([item, "budgetType", "length"]) > 0 ? _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "budgetType"])), $toString(" |")]
                      ) : null, _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "year"])), $toString("年"), $toString($getLooseDataMember([item, "quarter"])), $toString("季度 |")]
                      ), $getLooseDataMember([item, "ratio"]) >= 0 ? _react2.default.createElement(
                        Text,
                        null,
                        [$toString($getLooseDataMember([item, "ratio"])), $toString(" %")]
                      ) : null, $getLooseDataMember([item, "ratio"]) < 0 ? _react2.default.createElement(
                        Text,
                        {
                          className: "detail-item-txt-red"
                        },
                        [$toString($getLooseDataMember([item, "ratio"])), $toString(" %")]
                      ) : null]
                    );
                  }) : $iterate($getLooseDataMember([item, "value"]), function (item, index) {
                    return _react2.default.createElement(
                      View,
                      null,
                      $toString($getLooseDataMember([item, "value"]) || item)
                    );
                  }) : _react2.default.createElement(
                    View,
                    {
                      className: "detail-item-txt"
                    },
                    _react2.default.createElement(
                      Text,
                      null,
                      $toString("--")
                    )
                  )
                ) : _react2.default.createElement(
                  View,
                  {
                    className: "detail-item-txt"
                  },
                  _react2.default.createElement(
                    Text,
                    {
                      className: $getLooseDataMember([item, "isRed"]) == true ? 'detail-item-txt-red' : ''
                    },
                    $toString($getLooseDataMember([item, "value"]) ? $getLooseDataMember([item, "value"]) : '--')
                  )
                )]
              );
            })
          )
        )
      )]
    ), data['showDetail'] == 'chargeDetails' && $getLooseDataMember([data['detailValueList'], "length"]) > 0 ? _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd"
          },
          [_react2.default.createElement(
            View,
            {
              className: "detail-card-text"
            },
            [_react2.default.createElement(
              Text,
              {
                className: "title"
              },
              $toString(data['detailTitle'])
            ), data['formId'] != '63' ? _react2.default.createElement(
              Text,
              {
                className: "price"
              },
              $toString(data['totalAmt'])
            ) : null]
          ), _react2.default.createElement(
            View,
            {
              className: "toggle showUp", ontap: $getEventHandler(this, "showCostDetailFunc")
            },
            [_react2.default.createElement(
              Text,
              null,
              $toString(data['showCostDetail'] == false ? data['textOpen'] : data['textClose'])
            ), data['showCostDetail'] == true ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-up"
            }) : null, data['showCostDetail'] == false ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-down"
            }) : null]
          )]
        )
      ), data['showCostDetail'] == true ? _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          $iterate(data['detailValueList'], function (item, index) {
            return _react2.default.createElement(
              View,
              {
                className: "detail-list"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "detail-list-title"
                },
                [$toString(data['textTravelitem']), $toString(" "), $toString(index + 1)]
              ), $iterate(item, function (item, index) {
                return _react2.default.createElement(
                  View,
                  {
                    className: "detail-item"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "detail-item-title"
                    },
                    $toString($getLooseDataMember([item, "key"]))
                  ), _react2.default.createElement(
                    View,
                    {
                      className: "detail-item-txt"
                    },
                    $toString($getLooseDataMember([item, "value"]))
                  )]
                );
              })]
            );
          })
        )
      ) : null]
    ) : null, data['totalattachmentCount'] > 0 ? _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd"
          },
          [_react2.default.createElement(
            View,
            {
              className: "detail-card-text"
            },
            _react2.default.createElement(
              Text,
              {
                className: "title"
              },
              [$toString(data['textAttachment']), $toString("("), $toString(data['totalattachmentCount'] || 0), $toString(")")]
            )
          ), data['totalattachmentCount'] > 0 ? _react2.default.createElement(
            View,
            {
              className: "toggle showUp", ontap: $getEventHandler(this, "showAttachmentDetailFunc")
            },
            [_react2.default.createElement(
              Text,
              null,
              $toString(data['showAttachmentDetail'] == false ? data['textOpen'] : data['textClose'])
            ), data['showAttachmentDetail'] == true ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-up"
            }) : null, data['showAttachmentDetail'] == false ? _react2.default.createElement(Icon, {
              className: "iconfont icon-drop-down"
            }) : null]
          ) : null]
        )
      ), data['showAttachmentDetail'] == true && data['totalattachmentCount'] > 0 ? _react2.default.createElement(
        View,
        {
          className: "detail-card-bd"
        },
        _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "detail-list  detail-list-file"
            },
            $iterate(data['oaattachmentList'], function (item, index) {
              return _react2.default.createElement(
                View,
                {
                  className: "detail-item"
                },
                _react2.default.createElement(
                  View,
                  {
                    className: "detail-item-image", ontap: $getEventHandler(_this, "downLoadFile"), 'data-idx': index
                  },
                  $toString($getLooseDataMember([item, "fileName"]))
                )
              );
            })
          )
        )
      ) : null]
    ) : null, _react2.default.createElement(
      View,
      {
        className: "detail-card"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "detail-card-hd detail-form-title"
          },
          $toString(data['textWorkflowlog'])
        )
      ), $getLooseDataMember([data['workflowLogs'], "length"]) > 0 ? _react2.default.createElement(
        View,
        {
          className: "step-list"
        },
        $iterate(data['workflowLogs'], function (item, index) {
          return index == $getLooseDataMember([data['workflowLogs'], "length"]) - 1 ? _react2.default.createElement(
            View,
            {
              className: "step-item active"
            },
            [_react2.default.createElement(I, {
              className: "icon-right"
            }), _react2.default.createElement(
              View,
              {
                className: "step-item-title"
              },
              $toString($getLooseDataMember([item, "fromstatusName"]))
            ), _react2.default.createElement(
              View,
              {
                className: "step-item-info"
              },
              $iterate($getLooseDataMember([item, "users"]), function (item, index) {
                return [_react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "fullName"]))
                ), _react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "remark"]))
                )];
              })
            )]
          ) : _react2.default.createElement(
            View,
            {
              className: "step-item"
            },
            [_react2.default.createElement(I, {
              className: "icon-right"
            }), _react2.default.createElement(
              View,
              {
                className: "step-item-title"
              },
              $toString($getLooseDataMember([item, "fromstatusName"]))
            ), _react2.default.createElement(
              View,
              {
                className: "step-item-info"
              },
              $iterate($getLooseDataMember([item, "users"]), function (item, index) {
                return [_react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "fullName"]))
                ), _react2.default.createElement(
                  View,
                  null,
                  $toString($getLooseDataMember([item, "remark"]))
                )];
              })
            )]
          );
        })
      ) : null]
    )]
  ), _react2.default.createElement(
    View,
    {
      className: "fixed-bottom"
    },
    [$getLooseDataMember([data['buttonData'], "eform_onlycommit"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small disabled"
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small", ontap: $getEventHandler(this, "agreeConfirm")
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small disabled"
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "eform_onlyjoin"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small ", ontap: $getEventHandler(this, "addFlowAgent")
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small disabled"
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small disabled"
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "eform_join"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small ", ontap: $getEventHandler(this, "addFlowAgent")
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small ", ontap: $getEventHandler(this, "agreeConfirm")
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small disabled"
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "eform_app"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default small ", ontap: $getEventHandler(this, "addFlowAgent")
        },
        $toString(data['textBtnCountersign'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary small ", ontap: $getEventHandler(this, "agreeConfirm")
        },
        $toString($getLooseDataMember([data['buttonData'], "textvalue"]))
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-default btn-refuse small ", ontap: $getEventHandler(this, "refuseConfirm")
        },
        $toString(data['textBtnRefuse'])
      )]
    ) : null, $getLooseDataMember([data['buttonData'], "has_approved"]) ? _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      _react2.default.createElement(
        Button,
        {
          className: "btn-primary large ", ontap: $getEventHandler(this, "goNext")
        },
        $toString(data['textBtnNext'])
      )
    ) : null]
  ), data['showAgreeCommit'] ? _react2.default.createElement(
    View,
    {
      className: "mask"
    },
    _react2.default.createElement(
      View,
      {
        className: "toast-box"
      },
      [_react2.default.createElement(
        View,
        {
          className: "toast-box-hd"
        },
        $toString(data['operateTitle'])
      ), _react2.default.createElement(
        View,
        {
          className: "toast-box-bd"
        },
        _react2.default.createElement(Textarea, {
          placeholder: "最多可写200字", className: "textarea", placeholderClass: "textarea-placeholder", fixed: "true", value: data['submitRemark'], oninput: $getEventHandler(this, "changeRemark")
        })
      ), _react2.default.createElement(
        View,
        {
          className: "toast-box-ft"
        },
        [_react2.default.createElement(
          Button,
          {
            className: "btn-default small", ontap: $getEventHandler(this, "cancelConfirm")
          },
          $toString(data['textBtnCancel'])
        ), _react2.default.createElement(
          Button,
          {
            className: "btn-primary small", ontap: $getEventHandler(this, "sureConfirm")
          },
          $toString(data['textBtnSure'])
        )]
      )]
    )
  ) : null, data['showPreList'] ? _react2.default.createElement(
    View,
    {
      className: "mask"
    },
    _react2.default.createElement(
      View,
      {
        className: "toast-box bottom-modal"
      },
      [_react2.default.createElement(
        View,
        {
          className: "toast-box-hd"
        },
        [$toString(data['textViewexpectedapprovers']), _react2.default.createElement(Icon, {
          className: "iconfont icon-close", ontap: $getEventHandler(this, "hidePreListFunc")
        })]
      ), _react2.default.createElement(
        View,
        {
          className: "toast-box-bd"
        },
        _react2.default.createElement(
          View,
          {
            className: "step-list"
          },
          $iterate(data['preUserList'], function (item, index) {
            return _react2.default.createElement(
              View,
              {
                className: "step-item done"
              },
              [_react2.default.createElement(I, {
                className: "icon-right"
              }), _react2.default.createElement(
                View,
                {
                  className: "step-item-title"
                },
                $toString($getLooseDataMember([item, "fromstatusName"]))
              ), _react2.default.createElement(
                View,
                {
                  className: "step-item-info"
                },
                $iterate($getLooseDataMember([item, "usernames"]), function (item, index) {
                  return _react2.default.createElement(
                    Text,
                    null,
                    [$toString($getLooseDataMember([item, "username"])), $toString("["), $toString($getLooseDataMember([item, "account"])), $toString("]")]
                  );
                })
              )]
            );
          })
        )
      )]
    )
  ) : null]);
};

/***/ }),

/***/ "./example/oa/pages/holdOAdetail/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _detail_index_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../detail/index.wxss */ "./example/oa/pages/detail/index.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/holdOAdetail/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_detail_index_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/holdOAdetail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!***********************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \***********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/holdOAdetail/search',
  usingComponents: {"com-search":"/pages/component/search/search"},
  
  render: function() { return __webpack_require__(/*! ./search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/holdOAdetail/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1"); },
  stylesheet: function() { return __webpack_require__(/*! ./search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/holdOAdetail/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1"); },
});


/***/ }),

/***/ "./example/oa/pages/holdOAdetail/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!*************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \*************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var ComSearch_ = $getComponentClass("/pages/component/search/search");
var ComSearch = ComSearch_ || $EmptyComponentFactory("com-search");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(ComSearch, {
    historyHeadTxt: "添加历史", title: "添加会签人", historyKey: "flower", inputStatus: true, isHoldOA: true, syscode: data['syscode'], $isCustomComponent: this.$isCustomComponent, __tag: "com-search"
  }));
};

/***/ }),

/***/ "./example/oa/pages/holdOAdetail/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!*************************************************************************************************!*\
  !*** ./example/oa/pages/holdOAdetail/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \*************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_search_search_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/search/search.wxss */ "./example/oa/pages/component/search/search.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/holdOAdetail/search.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_search_search_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/index/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!******************************************************************************!*\
  !*** ./example/oa/pages/index?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/index/index',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/index/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/index/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/index/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*****************************************************************************************!*\
  !*** ./example/oa/pages/index/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([data['env'] != 'prod' ? _react2.default.createElement(
    View,
    {
      className: "envWarn", ontap: $getEventHandler(this, "switchToProd")
    },
    [$toString("当前环境： "), $toString(data['env'])]
  ) : null, _react2.default.createElement(
    View,
    {
      className: "container"
    },
    [_react2.default.createElement(
      View,
      {
        className: "box box-first"
      },
      $iterate(data['firstEntry'], function (item, index) {
        return _react2.default.createElement(
          View,
          {
            className: "box-item", ontap: $getEventHandler(_this, "navRouterTo"), 'data-url': $getLooseDataMember([item, "url"])
          },
          [_react2.default.createElement(Image, {
            src: "../../image/icon-" + $getLooseDataMember([item, "id"]) + ".png", className: "box-item-icon"
          }), _react2.default.createElement(
            Text,
            null,
            $toString($getLooseDataMember([item, "name"]))
          )]
        );
      })
    ), _react2.default.createElement(
      View,
      {
        className: "box box-second"
      },
      $iterate(data['secondEntry'], function (item, index) {
        return _react2.default.createElement(
          View,
          {
            className: "box-item", ontap: $getEventHandler(_this, "navRouterTo"), 'data-url': $getLooseDataMember([item, "url"]), 'data-key': $getLooseDataMember([item, "key"])
          },
          [$getLooseDataMember([item, "id"]) ? _react2.default.createElement(Image, {
            src: "../../image/icon-" + $getLooseDataMember([item, "id"]) + ".png", className: "box-item-icon"
          }) : _react2.default.createElement(Image, {
            src: "", className: "box-item-icon"
          }), _react2.default.createElement(
            Text,
            null,
            $toString($getLooseDataMember([item, "name"]))
          )]
        );
      })
    )]
  )]);
};

/***/ }),

/***/ "./example/oa/pages/index/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*****************************************************************************************!*\
  !*** ./example/oa/pages/index/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*****************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/index/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.envWarn {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    margin: 0.2rem 0.2rem 0 0.2rem;
    padding: 0.24rem;
    color: #fff;
    background: steelblue;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    border-radius: 0.16rem;
  }
  .box {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    background: #fff;
    width: 100%;
    border-radius: 0.16rem;
    overflow: hidden;
  }
  .box+.box {
    margin-top: 0.16rem;
  }
  .box-item {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    color: #333333;
    text-align: center;
  }
  .box-first {
    padding: 0.28rem 0;
  }
  .box-first .box-item {
    font-size: 0.32rem;
    line-height: 0.4rem;
    letter-spacing: -0.0077rem;
  }
  .box-first .box-item:first-of-type {
    background-image: -webkit-linear-gradient(left, transparent 50%, #EBECED 50%);
    background-image: linear-gradient(to right, transparent 50%, #EBECED 50%);
    background-size: 1px 100%;
    background-position: right center;
    background-repeat: no-repeat;
    padding-right: 1px;
  }
  .box-first .box-item-icon {
    width: 0.88rem;
    height: 0.88rem;
    vertical-align: middle;
    margin-right: 0.24rem;
  }
  .box-second {
    height: 4.68rem;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-flow: row wrap;
            flex-flow: row wrap;
  }
  .box-second .box-item {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    width: 2.34rem;
    height: 2.34rem;
    font-size: 0.28rem;
    letter-spacing: 0;
    line-height: 0.36rem;
    -webkit-box-flex: 0;
    -webkit-flex: 0 0 33%;
            flex: 0 0 33%;
    box-sizing: border-box;
    position: relative;
    padding: 1px;
    border: none;
  }
  .box-second .box-item:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    border: 1px solid #EBECED;
    border-width: 0 1px 1px 0;
    -webkit-transform: scale(0.5);
            transform: scale(0.5);
    -webkit-transform-origin: 0 0;
            transform-origin: 0 0;
    box-sizing: border-box;
    border-radius: 4px;
  }
  .box-second .box-item:nth-child(3n):before {
    border-right: none;
  }
  .box-second .box-item:nth-child(n+4):before {
    border-bottom: none;
  }
  .box-second .box-item-icon {
    width: 0.76rem;
    height: 0.76rem;
    margin-bottom: 0.28rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/search/searchBudgetList.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!***************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBudgetList.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/search/searchBudgetList',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
  render: function() { return __webpack_require__(/*! ./searchBudgetList.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchBudgetList.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
  stylesheet: function() { return __webpack_require__(/*! ./searchBudgetList.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchBudgetList.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
});


/***/ }),

/***/ "./example/oa/pages/search/searchBudgetList.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBudgetList.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var ComSearchbar_ = $getComponentClass("/pages/component/searchbar/searchbar");
var ComSearchbar = ComSearchbar_ || $EmptyComponentFactory("com-searchbar");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "oa-page search-page"
    },
    _react2.default.createElement(
      View,
      {
        className: "page__bd"
      },
      _react2.default.createElement(ComSearchbar, {
        onselectresult: $getComponentEventHandler(this, "selectResult"), search: data['search'], value: data['inputVal'], searchState: data['searchState'], throttle: "200", cancelFunc: data['cancelFunc'], cancel: data['cancel'], focusFunc: data['focusFunc'], focus: true, $isCustomComponent: this.$isCustomComponent, __tag: 'com-searchbar'
      })
    )
  ));
};

/***/ }),

/***/ "./example/oa/pages/search/searchBudgetList.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBudgetList.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*****************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/searchbar/searchbar.wxss */ "./example/oa/pages/component/searchbar/searchbar.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/search/searchBudgetList.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/search/searchBusinessType.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*****************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBusinessType.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/search/searchBusinessType',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
  render: function() { return __webpack_require__(/*! ./searchBusinessType.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchBusinessType.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
  stylesheet: function() { return __webpack_require__(/*! ./searchBusinessType.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchBusinessType.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
});


/***/ }),

/***/ "./example/oa/pages/search/searchBusinessType.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*******************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBusinessType.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*******************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var ComSearchbar_ = $getComponentClass("/pages/component/searchbar/searchbar");
var ComSearchbar = ComSearchbar_ || $EmptyComponentFactory("com-searchbar");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "oa-page search-page"
    },
    _react2.default.createElement(
      View,
      {
        className: "page__bd"
      },
      _react2.default.createElement(ComSearchbar, {
        onselectresult: $getComponentEventHandler(this, "selectResult"), search: data['search'], value: data['inputVal'], searchState: data['searchState'], throttle: "200", cancelFunc: data['cancelFunc'], cancel: data['cancel'], focusFunc: data['focusFunc'], focus: true, $isCustomComponent: this.$isCustomComponent, __tag: 'com-searchbar'
      })
    )
  ));
};

/***/ }),

/***/ "./example/oa/pages/search/searchBusinessType.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*******************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchBusinessType.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*******************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/searchbar/searchbar.wxss */ "./example/oa/pages/component/searchbar/searchbar.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/search/searchBusinessType.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/search/searchCompany.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchCompany.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/search/searchCompany',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
  render: function() { return __webpack_require__(/*! ./searchCompany.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchCompany.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
  stylesheet: function() { return __webpack_require__(/*! ./searchCompany.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/search/searchCompany.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
});


/***/ }),

/***/ "./example/oa/pages/search/searchCompany.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!**************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchCompany.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \**************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var ComSearchbar_ = $getComponentClass("/pages/component/searchbar/searchbar");
var ComSearchbar = ComSearchbar_ || $EmptyComponentFactory("com-searchbar");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "oa-page search-page"
    },
    _react2.default.createElement(
      View,
      {
        className: "page__bd"
      },
      _react2.default.createElement(ComSearchbar, {
        onselectresult: $getComponentEventHandler(this, "selectResult"), search: data['search'], value: data['inputVal'], searchState: data['searchState'], throttle: "200", cancelFunc: data['cancelFunc'], cancel: data['cancel'], focusFunc: data['focusFunc'], focus: true, $isCustomComponent: this.$isCustomComponent, __tag: 'com-searchbar'
      })
    )
  ));
};

/***/ }),

/***/ "./example/oa/pages/search/searchCompany.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!**************************************************************************************************!*\
  !*** ./example/oa/pages/search/searchCompany.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \**************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/searchbar/searchbar.wxss */ "./example/oa/pages/component/searchbar/searchbar.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/search/searchCompany.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/submitted/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!**********************************************************************************!*\
  !*** ./example/oa/pages/submitted?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/submitted/index',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/submitted/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/submitted/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/submitted/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/submitted/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([_react2.default.createElement(
    View,
    {
      className: "search-group"
    },
    [_react2.default.createElement(
      View,
      {
        className: "search-box nomargin"
      },
      [_react2.default.createElement(
        View,
        {
          className: "search-item " + (data['inputStatus'] ? 'focus' : '')
        },
        [!data['inputStatus'] ? _react2.default.createElement(
          View,
          {
            className: "search-view"
          },
          [_react2.default.createElement(Icon, {
            className: "iconfont icon-search"
          }), _react2.default.createElement(
            Text,
            {
              className: "placeholder-txt"
            },
            $toString(data['searchDetail'])
          )]
        ) : null, data['inputStatus'] ? _react2.default.createElement(Icon, {
          className: "iconfont icon-search"
        }) : null, _react2.default.createElement(Input, {
          className: "search-bar", type: "text", oninput: $getEventHandler(this, "inputFun"), placeholder: data['searchDetail'], value: data['inputVal'], confirmType: data['searchSearch'], onconfirm: $getEventHandler(this, "search"), focus: data['inputStatus'], ontap: $getEventHandler(this, "focusFun")
        }), data['inputStatus'] ? _react2.default.createElement(Icon, {
          className: "iconfont icon-closed_shapeed", ontap: $getEventHandler(this, "clearValue")
        }) : null]
      ), data['inputStatus'] ? _react2.default.createElement(
        View,
        {
          className: "search-btn", ontap: $getEventHandler(this, "search")
        },
        $toString(data['btnValue'])
      ) : null]
    ), !data['inputStatus'] ? _react2.default.createElement(
      View,
      {
        className: "sort-box " + (data['sortStatus'] ? 'active' : '') + " " + (data['mode'] ? 'new' : ''), ontap: $getEventHandler(this, "sortStatusFun")
      },
      [_react2.default.createElement(Icon, {
        className: "iconfont icon-ranke"
      }), _react2.default.createElement(
        View,
        {
          className: "sort-box-title"
        },
        $toString(data['searchSort'])
      )]
    ) : null, data['sortStatus'] ? _react2.default.createElement(
      View,
      {
        className: "sort-group"
      },
      $iterate(data['sortData'], function (item, index) {
        return _react2.default.createElement(
          View,
          {
            className: "sort-item " + (data['sortId'] === $getLooseDataMember([item, "id"]) ? 'active' : ''), ontap: $getEventHandler(_this, "changeSort"), 'data-id': $getLooseDataMember([item, "id"]), 'data-key': $getLooseDataMember([item, "key"])
          },
          [_react2.default.createElement(
            View,
            {
              className: "sort-item-txt"
            },
            $toString($getLooseDataMember([item, "name"]))
          ), _react2.default.createElement(Icon, {
            className: "iconfont icon-check"
          })]
        );
      })
    ) : null]
  ), _react2.default.createElement(
    View,
    {
      className: "form-list"
    },
    [$iterate(data['creatorData'], function (item, index) {
      return _react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        $getLooseDataMember([data['creatorData'], "length"]) > 0 ? _react2.default.createElement(
          View,
          {
            className: "form-card", ontap: $getEventHandler(_this, "goDetail"), 'data-id': $getLooseDataMember([item, "APP_ID"]), 'data-formid': $getLooseDataMember([item, "APP_FormType"]), 'data-title': $getLooseDataMember([item, "APP_Subject"]), 'data-app-type': $getLooseDataMember([item, "APP_Type"]), 'data-app-sub-type': $getLooseDataMember([item, "APP_SubType"])
          },
          [_react2.default.createElement(
            View,
            {
              className: "form-card-title"
            },
            [$toString($getLooseDataMember([item, "APP_SubmitUser"])), $toString("-"), $toString($getLooseDataMember([item, "APP_Subject"]))]
          ), _react2.default.createElement(
            View,
            {
              className: "form-card-text"
            },
            [$toString(data['textOANumber']), $toString(":"), $toString($getLooseDataMember([item, "APP_ID"]))]
          ), _react2.default.createElement(
            View,
            {
              className: "form-card-text"
            },
            [$toString(data['textOADate']), $toString(":"), $toString($getLooseDataMember([item, "APP_CreateDT"]))]
          ), _react2.default.createElement(
            View,
            {
              className: "form-card-status"
            },
            _react2.default.createElement(
              Text,
              {
                className: "wait"
              },
              $toString($getLooseDataMember([item, "APP_Status"]))
            )
          )]
        ) : null
      );
    }), $getLooseDataMember([data['creatorData'], "length"]) == 0 && data['creatorDataStatus'] ? _react2.default.createElement(
      View,
      {
        className: "empty-box"
      },
      [_react2.default.createElement(Image, {
        className: "image", src: "/image/empty.png"
      }), _react2.default.createElement(
        Text,
        {
          className: "text"
        },
        $toString(data['textPromptSubmit'])
      )]
    ) : null]
  ), data['sortStatus'] ? _react2.default.createElement(View, {
    className: "mask", ontap: $getEventHandler(this, "closeSortStatus")
  }) : null]);
};

/***/ }),

/***/ "./example/oa/pages/submitted/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/submitted/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _approve_index_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../approve/index.wxss */ "./example/oa/pages/approve/index.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/submitted/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_approve_index_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.a-page {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    overflow: hidden;
  }
  .search-group {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    position: static;
  }
  .form-list {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    overflow-y: auto;
  }`));

/***/ }),

/***/ "./example/oa/pages/taxNumber/index.js?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!**********************************************************************************!*\
  !*** ./example/oa/pages/taxNumber?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/taxNumber/index',
  usingComponents: {"com-searchbar":"/pages/component/searchbar/searchbar"},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/taxNumber/index.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 */ "./example/oa/pages/taxNumber/index.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4"); },
});


/***/ }),

/***/ "./example/oa/pages/taxNumber/index.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/taxNumber/index.wxml?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var ComSearchbar_ = $getComponentClass("/pages/component/searchbar/searchbar");
var ComSearchbar = ComSearchbar_ || $EmptyComponentFactory("com-searchbar");
var Span_ = self.MPUI['span'];
var Span = Span_ || $EmptyComponentFactory("span");
var Label_ = self.MPUI['label'];
var Label = Label_ || $EmptyComponentFactory("label");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "oa-page tax-number-page"
    },
    _react2.default.createElement(
      View,
      {
        className: "tax-number-content"
      },
      [_react2.default.createElement(
        View,
        {
          className: "tax-number-search"
        },
        _react2.default.createElement(
          View,
          {
            className: "page__bd"
          },
          _react2.default.createElement(ComSearchbar, {
            onselectresult: $getComponentEventHandler(this, "selectResult"), search: data['search'], value: data['inputVal'], searchState: data['searchState'], throttle: "200", focus: false, cancelFunc: data['cancelFunc'], $isCustomComponent: this.$isCustomComponent, __tag: 'com-searchbar'
          })
        )
      ), data['taxMyInfoStatus'] == true ? _react2.default.createElement(
        View,
        null,
        [data['showMyTax'] == true && data['taxMyInfo'] != null ? _react2.default.createElement(
          View,
          {
            className: "tax-info my-info"
          },
          [_react2.default.createElement(
            View,
            {
              className: "tax-title"
            },
            [_react2.default.createElement(Span, {
              className: "line"
            }), _react2.default.createElement(
              Span,
              null,
              $toString(data['titeMyTaxnumber'])
            ), _react2.default.createElement(Span, {
              className: "line"
            })]
          ), _react2.default.createElement(
            View,
            {
              className: "my-content"
            },
            [_react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textCompany'])
              ), _react2.default.createElement(
                View,
                {
                  className: "item-text", 'data-name': $getLooseDataMember([data['taxMyInfo'], "company"]), ontap: $getEventHandler(this, "clipTextNumber")
                },
                [_react2.default.createElement(
                  Text,
                  null,
                  $toString($getLooseDataMember([data['taxMyInfo'], "company"]))
                ), _react2.default.createElement(Icon, {
                  className: "iconfont icon-cchat-copy"
                })]
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textTaxnumber'])
              ), _react2.default.createElement(
                View,
                {
                  className: "item-text", 'data-name': $getLooseDataMember([data['taxMyInfo'], "taxNumber"]), ontap: $getEventHandler(this, "clipTextNumber")
                },
                [_react2.default.createElement(
                  Text,
                  null,
                  $toString($getLooseDataMember([data['taxMyInfo'], "taxNumber"]))
                ), _react2.default.createElement(Icon, {
                  className: "iconfont icon-cchat-copy"
                })]
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textBankaccount'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxMyInfo'], "bankAccount"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textBankname'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxMyInfo'], "bankName"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textTelephone'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxMyInfo'], "tel"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textAddress'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxMyInfo'], "address"]))
              )]
            )]
          )]
        ) : null, data['showMyTax'] == false && data['taxInfo'] != null ? _react2.default.createElement(
          View,
          {
            className: "tax-info my-info"
          },
          _react2.default.createElement(
            View,
            {
              className: "my-content", ontap: $getEventHandler(this, "clipTextNumber")
            },
            [_react2.default.createElement(
              View,
              {
                className: "my-tax-item my-tax-item-top"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textCompany'])
              ), _react2.default.createElement(
                View,
                {
                  className: "item-text", 'data-name': $getLooseDataMember([data['taxInfo'], "company"]), ontap: $getEventHandler(this, "clipTextNumber")
                },
                [_react2.default.createElement(
                  Text,
                  null,
                  $toString($getLooseDataMember([data['taxInfo'], "company"]))
                ), _react2.default.createElement(Icon, {
                  className: "iconfont icon-cchat-copy"
                })]
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textTaxnumber'])
              ), _react2.default.createElement(
                View,
                {
                  className: "item-text", 'data-name': $getLooseDataMember([data['taxInfo'], "taxNumber"]), ontap: $getEventHandler(this, "clipTextNumber")
                },
                [_react2.default.createElement(
                  Text,
                  null,
                  $toString($getLooseDataMember([data['taxInfo'], "taxNumber"]))
                ), _react2.default.createElement(Icon, {
                  className: "iconfont icon-cchat-copy"
                })]
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textBankaccount'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxInfo'], "bankAccount"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textBankname'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxInfo'], "bankName"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textTelephone'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxInfo'], "tel"]))
              )]
            ), _react2.default.createElement(
              View,
              {
                className: "my-tax-item"
              },
              [_react2.default.createElement(
                Label,
                {
                  className: "item-label"
                },
                $toString(data['textAddress'])
              ), _react2.default.createElement(
                Text,
                {
                  className: "item-text"
                },
                $toString($getLooseDataMember([data['taxInfo'], "address"]))
              )]
            )]
          )
        ) : null, (data['showMyTax'] == true ? !data['taxMyInfo'] : !data['taxInfo']) ? _react2.default.createElement(
          View,
          {
            className: "empty-box"
          },
          [_react2.default.createElement(Image, {
            className: "image", src: "/image/empty.png"
          }), _react2.default.createElement(
            Text,
            {
              className: "text"
            },
            $toString(data['noData'])
          )]
        ) : null]
      ) : null]
    )
  ));
};

/***/ }),

/***/ "./example/oa/pages/taxNumber/index.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/taxNumber/index.wxss?hash=6e2d98e6435d6a61031ff99729801114d253e1e4 ***!
  \*********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/searchbar/searchbar.wxss */ "./example/oa/pages/component/searchbar/searchbar.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/taxNumber/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_searchbar_searchbar_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.tax-number-page {
    width: 100%;
    height: 100%;
  }
  .tax-number-page .tax-number-content .tax-number-search {
    width: 100%;
    height: 1rem;
    box-sizing: border-box;
  }
  .tax-number-search .tax-number-input {
    width: 100%;
    height: 0.68rem;
    line-height: 0.68rem;
    border: 1px solid #ecedf0;
    border-radius: 0.08rem;
    box-sizing: border-box;
    background: #fff;
    font-size: 0.3rem;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    color: #CCCCCC;
  }
  .tax-number-search  .tax-search {
    color: #CCCCCC;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    margin-right: 0.16rem;
  }
  .tax-info {
    background: #fff;
    width: 100%;
    padding: 0.64rem 0;
    box-sizing: border-box;
  }
  .tax-info .tax-title {
    width: 5rem;
    height: 0.41rem;
    line-height: 0.41rem;
    font-size: 0.32rem;
    color: #333;
    text-align: center;
    margin: 0 auto 0.4rem;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: space-around;
            justify-content: space-around;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .line {
    width: 1.26rem;
    padding-bottom: 1px;
    background-position: center bottom;
    background-image: -webkit-linear-gradient(top, transparent 50%, #DEDFE0 50%);
    background-image: linear-gradient(to bottom, transparent 50%, #DEDFE0 50%);
    background-repeat: no-repeat;
    background-size: 100% 1px;
    box-sizing: border-box;
    display: block;
  }
  .my-content {
    width: 100%;
  }
  .my-tax-item {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    line-height: 0.36rem;
    margin-top: 0.2rem;
    font-size: 0.28rem;
  }
  .my-tax-item-top {
    margin-top: 0px;
  }
  .item-label {
    width: 1.77rem;
    text-align: right;
    color: #666;
  }
  .item-text {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    line-height: 0.36rem;
    padding-left: 0.33rem;
    box-sizing: border-box;
    color: #000;
  }
  .no-result {
    width: 100%;
    height: 3.17rem;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    color: #ccc;
  }
  .icon-cchat-copy {
    -webkit-margin-start: 0.08rem;
            margin-inline-start: 0.08rem;
    color: #1466de;
  }`));

/***/ }),

/***/ "./example/oa/pages/travelPay/index.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!**********************************************************************************!*\
  !*** ./example/oa/pages/travelPay?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/travelPay/index',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/travelPay/index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/travelPay/index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
});


/***/ }),

/***/ "./example/oa/pages/travelPay/index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/travelPay/index.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \*********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var ComToptips_ = $getComponentClass("/pages/component/toptips/toptips");
var ComToptips = ComToptips_ || $EmptyComponentFactory("com-toptips");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var Picker_ = self.MPUI['picker'];
var Picker = Picker_ || $EmptyComponentFactory("picker");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "account-page  " + (data['langStr'] == 'en_US' ? 'en' : '')
    },
    [data['showMsg'] == true ? _react2.default.createElement(ComToptips, {
      msg: data['error'], type: "error", $isCustomComponent: this.$isCustomComponent, __tag: 'com-toptips'
    }) : null, _react2.default.createElement(
      View,
      {
        className: "account-tip"
      },
      [_react2.default.createElement(Icon, {
        className: "iconfont icon-information"
      }), _react2.default.createElement(
        View,
        {
          className: "account-tip-txt"
        },
        $toString(data['textPrompt'])
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "account-group"
      },
      [_react2.default.createElement(
        View,
        {
          className: "account-group-title"
        },
        $toString(data['textBasicInfo'])
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-box"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title"
              },
              $toString(data['textBudgettype'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt unchange"
                },
                $toString(data['budgetType'])
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-arrow-right"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title"
              },
              $toString(data['textCostcenter'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt unchange "
                },
                $toString(data['costCenter'])
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-arrow-right"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textPaymentcompany'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content", ontap: $getEventHandler(this, "goSearchCompany"), 'data-company': data['payCompany']
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                $toString(data['payCompany'])
              ), _react2.default.createElement(Icon, {
                className: "iconfont  icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textBudgetclassification'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content", ontap: $getEventHandler(this, "goSearchBudgeClass")
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(Input, {
                  className: "account-box-content-txt", placeholder: data['textSelectBudgettype'], value: data['budgetClass'], readonly: "readonly"
                })
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textNumberofinvoice'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textNumberInvoices'], value: data['invoiceNumber'], oninput: $getEventHandler(this, "bindInvoice")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title  " + (data['isNeedBusinessTypeRequired'] ? 'account-box-imp' : '')
              },
              $toString(data['textBusinessType'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content", ontap: $getEventHandler(this, "goSearchBusinessType")
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(Input, {
                  className: "account-box-content-txt", placeholder: data['textSelectBusinesstype'], value: data['businessType'], readonly: "readonly"
                })
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textApportionmentmonth'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(
                  Picker,
                  {
                    mode: "date", value: data['shareDate'], fields: data['fields'], onchange: $getEventHandler(this, "bindDateChange")
                  },
                  _react2.default.createElement(
                    View,
                    {
                      className: "picker"
                    },
                    $toString(data['dateFormat'])
                  )
                )
              ), _react2.default.createElement(Icon, {
                className: "iconfont  icon-right-arrow"
              })]
            )]
          )
        )]
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-title"
        },
        $toString(data['textTravelInformation'])
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-box"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textStartdate'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(
                  Picker,
                  {
                    mode: "date", value: data['expenseStartDate'], onchange: $getEventHandler(this, "bindStartChange")
                  },
                  _react2.default.createElement(
                    View,
                    {
                      className: "picker"
                    },
                    $toString(data['expenseStartDate'])
                  )
                )
              ), _react2.default.createElement(Icon, {
                className: "iconfont  icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textEnddate'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-box-content-txt"
                },
                _react2.default.createElement(
                  Picker,
                  {
                    mode: "date", start: data['expenseStartDate'], value: data['expenseEndDate'], onchange: $getEventHandler(this, "bindEndChange")
                  },
                  _react2.default.createElement(
                    View,
                    {
                      className: "picker"
                    },
                    $toString(data['expenseEndDate'])
                  )
                )
              ), _react2.default.createElement(Icon, {
                className: "iconfont  icon-right-arrow"
              })]
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textAddress'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textAddressPlace'], value: data['expensePlace'], oninput: $getEventHandler(this, "bindPlace")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          [_react2.default.createElement(
            View,
            {
              className: "account-box-list account-box-list-txtarea"
            },
            _react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textReason'])
            )
          ), _react2.default.createElement(
            View,
            {
              className: "account-box-content"
            },
            _react2.default.createElement(Textarea, {
              className: "account-group-box-textarea  group-reson", maxlength: "800", value: data['miceReason'], oninput: $getEventHandler(this, "bindReson"), placeholder: data['textLimited']
            })
          )]
        )]
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-title"
        },
        $toString(data['textAccountInfo'])
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-box"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textPayee'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textPayeeName'], value: data['payeeName'], oninput: $getEventHandler(this, "bindPayeeName")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textReceiptaccount'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textReceiptaccountTip'], value: data['payeeAccount'], oninput: $getEventHandler(this, "bindBankAccountName")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textBankname'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textBanknameTip'], value: data['payeeBank'], oninput: $getEventHandler(this, "bindBankName")
              })
            )]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-box-list"
            },
            [_react2.default.createElement(
              View,
              {
                className: "account-box-title account-box-imp"
              },
              $toString(data['textCityofbank'])
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-content"
              },
              _react2.default.createElement(Input, {
                className: "account-box-content-txt", placeholder: data['textCityofbankTip'], value: data['bankCity'], oninput: $getEventHandler(this, "bindBankCity")
              })
            )]
          )
        )]
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-title"
        },
        $toString(data['textRemarks'])
      ), _react2.default.createElement(
        View,
        {
          className: "account-group-box"
        },
        _react2.default.createElement(Textarea, {
          className: "account-group-box-textarea", maxlength: "800", value: data['remarkAll'], placeholder: data['textLimited'], oninput: $getEventHandler(this, "bindRemark")
        })
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "btn"
      },
      _react2.default.createElement(
        Button,
        {
          className: "btn-blue", ontap: $getEventHandler(this, "nextStep")
        },
        [$toString(data['textNext']), $toString("（"), $toString(data['textItemdetail']), $toString("）")]
      )
    )]
  ));
};

/***/ }),

/***/ "./example/oa/pages/travelPay/index.wxss":
/*!***********************************************!*\
  !*** ./example/oa/pages/travelPay/index.wxss ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/toptips/toptips.wxss */ "./example/oa/pages/component/toptips/toptips.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/travelPay/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.account-page {
    background-color: #F0F2F5;
  }
  .account-tip {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    background-color: #DCE9FC;
    padding: 0.2rem 0.32rem;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .account-tip-txt {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.24rem;
    color: #666;
    line-height: 0.3rem;
  }
  .account-group {
  }
  .account-group-title {
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    margin: 0.52rem 0 0.28rem 0.32rem;
    font-weight: bold;
  }
  .account-group-box {
    background-color: #FFF;
  }
  .account-box-list {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding: 0.26rem 0;
    margin-left: 0.32rem;
    box-sizing: border-box;
  }
  .account-box-list:nth-last-of-type(1) {
    border-bottom: none;
  }
  .account-box-title {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    position: relative;
    width: 1.92rem;
    font-size: 0.32rem;
    color: #666;
    line-height: 0.4rem;
  }
  .account-box-imp:before {
    content: "*";
    position: absolute;
    top: 0.08rem;
    left: -0.16rem;
    color: #F34500;
  }
  .account-box-content {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    margin-left: 0.32rem;
    margin-right: 0.24rem;
    overflow: hidden;
    align-items: center;
  }
  .account-box-content-txt {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .account-box-content-txt.unchange {
    color: #999;
  }
  .account-group-box-textarea {
    width: 100%;
    height: 3.6rem;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    padding: 0.32rem;
    box-sizing: border-box;
  }
  .group-reson {
    padding: 0 0 0.1rem 0;
  }
  .account-box-list-txtarea {
    -webkit-box-align: start;
    -webkit-align-items: start;
            align-items: start;
  }
  .btn {
    width: 100%;
    padding: 0.4rem 0.32rem 0.32rem;
    box-sizing: border-box;
    padding-bottom: calc(0.32rem + env(safe-area-inset-bottom));
  }
  .btn .btn-blue {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    width: 100%;
    height: 0.88rem;
    font-size: 0.34rem;
    color: #FFF;
    background-color: #1466DE;
    border-radius: 0.12rem;
    margin: 0;
    padding: 0;
  }
  .en .account-box-title {
    width: 2.3rem;
    font-size: 0.26rem;
  }
  .en .account-box-content-txt, .en .account-group-box-textarea {
    font-size: 0.26rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/travelPay/index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/travelPay/index.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \*********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/toptips/toptips.wxss */ "./example/oa/pages/component/toptips/toptips.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/travelPay/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.account-page {
    background-color: #F0F2F5;
  }
  .account-tip {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    background-color: #DCE9FC;
    padding: 0.2rem 0.32rem;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .account-tip-txt {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.24rem;
    color: #666;
    line-height: 0.3rem;
  }
  .account-group {
  }
  .account-group-title {
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    margin: 0.52rem 0 0.28rem 0.32rem;
    font-weight: bold;
  }
  .account-group-box {
    background-color: #FFF;
  }
  .account-box-list {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding: 0.26rem 0;
    margin-left: 0.32rem;
    box-sizing: border-box;
  }
  .account-box-list:nth-last-of-type(1) {
    border-bottom: none;
  }
  .account-box-title {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    position: relative;
    width: 1.92rem;
    font-size: 0.32rem;
    color: #666;
    line-height: 0.4rem;
  }
  .account-box-imp:before {
    content: "*";
    position: absolute;
    top: 0.08rem;
    left: -0.16rem;
    color: #F34500;
  }
  .account-box-content {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    margin-left: 0.32rem;
    margin-right: 0.24rem;
    overflow: hidden;
    align-items: center;
  }
  .account-box-content-txt {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .account-box-content-txt.unchange {
    color: #999;
  }
  .account-group-box-textarea {
    width: 100%;
    height: 3.6rem;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    padding: 0.32rem;
    box-sizing: border-box;
  }
  .group-reson {
    padding: 0 0 0.1rem 0;
  }
  .account-box-list-txtarea {
    -webkit-box-align: start;
    -webkit-align-items: start;
            align-items: start;
  }
  .btn {
    width: 100%;
    padding: 0.4rem 0.32rem 0.32rem;
    box-sizing: border-box;
    padding-bottom: calc(0.32rem + env(safe-area-inset-bottom));
  }
  .btn .btn-blue {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    width: 100%;
    height: 0.88rem;
    font-size: 0.34rem;
    color: #FFF;
    background-color: #1466DE;
    border-radius: 0.12rem;
    margin: 0;
    padding: 0;
  }
  .en .account-box-title {
    width: 2.3rem;
    font-size: 0.26rem;
  }
  .en .account-box-content-txt, .en .account-group-box-textarea {
    font-size: 0.26rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/travelPay/travelDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!**************************************************************************************************!*\
  !*** ./example/oa/pages/travelPay/travelDetail.js?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \**************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/travelPay/travelDetail',
  usingComponents: {"com-toptips":"/pages/component/toptips/toptips"},
  
  render: function() { return __webpack_require__(/*! ./travelDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/travelPay/travelDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
  stylesheet: function() { return __webpack_require__(/*! ./travelDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 */ "./example/oa/pages/travelPay/travelDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2"); },
});


/***/ }),

/***/ "./example/oa/pages/travelPay/travelDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!****************************************************************************************************!*\
  !*** ./example/oa/pages/travelPay/travelDetail.wxml?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \****************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var ComToptips_ = $getComponentClass("/pages/component/toptips/toptips");
var ComToptips = ComToptips_ || $EmptyComponentFactory("com-toptips");
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var I_ = self.MPUI['i'];
var I = I_ || $EmptyComponentFactory("i");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Picker_ = self.MPUI['picker'];
var Picker = Picker_ || $EmptyComponentFactory("picker");
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var Textarea_ = self.MPUI['textarea'];
var Textarea = Textarea_ || $EmptyComponentFactory("textarea");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot([data['showMsg'] == true ? _react2.default.createElement(ComToptips, {
    msg: data['error'], type: "error", $isCustomComponent: this.$isCustomComponent, __tag: "com-toptips"
  }) : null, _react2.default.createElement(
    View,
    {
      className: "account-wrapper"
    },
    [data['showAdd'] === false ? _react2.default.createElement(
      View,
      null,
      [_react2.default.createElement(
        View,
        {
          className: "accout-totalNumber"
        },
        [[$toString(data['textItemdetailtotalamount']), $toString(" (¥)")], _react2.default.createElement(
          Text,
          {
            className: "accout-total-num"
          },
          $toString(data['sum'])
        )]
      ), $iterate(data['detailItemList'], function (item, index) {
        return _react2.default.createElement(
          View,
          {
            className: "accout-card"
          },
          [_react2.default.createElement(
            View,
            {
              className: "border-bottom-1px"
            },
            _react2.default.createElement(
              View,
              {
                className: "accout-card-hd"
              },
              [[$toString(data['textItemdetail']), $toString(" "), $toString(index + 1)], _react2.default.createElement(I, {
                className: "accout-card-hd-icon iconfont icon-del", ontap: $getEventHandler(_this, "delDetail"), "data-index": index
              }), _react2.default.createElement(I, {
                className: "accout-card-hd-icon-edit iconfont icon-edit", ontap: $getEventHandler(_this, "editDetail"), "data-index": index
              })]
            )
          ), _react2.default.createElement(
            View,
            {
              className: "accout-card-bd"
            },
            _react2.default.createElement(
              View,
              {
                className: "account-group-box"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "border-bottom-1px"
                },
                _react2.default.createElement(
                  View,
                  {
                    className: "account-box-list"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "account-box-title accou account-box-imp"
                    },
                    $toString(data['textItemname'])
                  ), _react2.default.createElement(
                    View,
                    {
                      className: "account-box-content"
                    },
                    _react2.default.createElement(
                      View,
                      {
                        className: "account-box-content-txt"
                      },
                      $toString($getLooseDataMember([item, "itemName"]))
                    )
                  )]
                )
              ), _react2.default.createElement(
                View,
                {
                  className: "border-bottom-1px"
                },
                _react2.default.createElement(
                  View,
                  {
                    className: "account-box-list"
                  },
                  [_react2.default.createElement(
                    View,
                    {
                      className: "account-box-title account-box-imp"
                    },
                    $toString(data['textUnitprice'])
                  ), _react2.default.createElement(
                    View,
                    {
                      className: "account-box-content"
                    },
                    _react2.default.createElement(
                      View,
                      {
                        className: "account-box-content-txt"
                      },
                      $toString($getLooseDataMember([item, "amount"]))
                    )
                  )]
                )
              ), _react2.default.createElement(
                View,
                {
                  className: "account-box-list-remark"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "account-group-title"
                  },
                  $toString(data['textExplanation'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "account-group-box"
                  },
                  _react2.default.createElement(
                    View,
                    {
                      className: "account-box-content-txt-desc"
                    },
                    $toString($getLooseDataMember([item, "explanation"]))
                  )
                )]
              )]
            )
          )]
        );
      }), _react2.default.createElement(
        View,
        {
          className: "btn-area"
        },
        _react2.default.createElement(
          Button,
          {
            className: "btn-default btn-block ", ontap: $getEventHandler(this, "addDetialItem")
          },
          [_react2.default.createElement(Icon, {
            className: "iconfont icon-add"
          }), [$toString(data['btnAdd']), $toString(data['textItemdetail'])]]
        )
      )]
    ) : null, data['showAdd'] ? _react2.default.createElement(
      View,
      null,
      [_react2.default.createElement(
        View,
        {
          className: "accout-card"
        },
        [_react2.default.createElement(
          View,
          {
            className: "border-bottom-1px"
          },
          _react2.default.createElement(
            View,
            {
              className: "accout-card-hd"
            },
            [$toString(data['textItemdetail']), $toString(" "), $toString(data['itemIndex'])]
          )
        ), _react2.default.createElement(
          View,
          {
            className: "accout-card-bd"
          },
          _react2.default.createElement(
            View,
            {
              className: "account-group-box"
            },
            [_react2.default.createElement(
              View,
              {
                className: "border-bottom-1px"
              },
              _react2.default.createElement(
                View,
                {
                  className: "account-box-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "account-box-title accou account-box-imp"
                  },
                  $toString(data['textItemname'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "account-box-content"
                  },
                  [_react2.default.createElement(
                    Picker,
                    {
                      onchange: $getEventHandler(this, "bindPickerChange"), value: data['pickeritemIndex'], range: data['array'], className: "pickerName"
                    },
                    _react2.default.createElement(
                      View,
                      {
                        className: "picker"
                      },
                      [!$getLooseDataMember([data['currentItem'], "itemName"]) ? _react2.default.createElement(
                        Text,
                        {
                          className: "placeholder"
                        },
                        [$toString(data['textChoose']), $toString("：")]
                      ) : null, $toString($getLooseDataMember([data['currentItem'], "itemName"]))]
                    )
                  ), _react2.default.createElement(Icon, {
                    className: "iconfont icon-right-arrow"
                  })]
                )]
              )
            ), _react2.default.createElement(
              View,
              {
                className: "border-bottom-1px"
              },
              _react2.default.createElement(
                View,
                {
                  className: "account-box-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "account-box-title account-box-imp"
                  },
                  $toString(data['textUnitprice'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "account-box-content"
                  },
                  _react2.default.createElement(Input, {
                    className: "account-box-content-txt", value: $getLooseDataMember([data['currentItem'], "amount"]), oninput: $getEventHandler(this, "bindAmount")
                  })
                )]
              )
            ), _react2.default.createElement(
              View,
              {
                className: "account-box-list-remark"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "account-group-title"
                },
                $toString(data['textExplanation'])
              ), _react2.default.createElement(
                View,
                {
                  className: "account-group-box"
                },
                _react2.default.createElement(Textarea, {
                  className: "account-group-box-textarea", maxlength: "800", value: $getLooseDataMember([data['currentItem'], "explanation"]), placeholder: data['textLimited'], oninput: $getEventHandler(this, "bindExplanation")
                })
              )]
            )]
          )
        )]
      ), _react2.default.createElement(
        View,
        {
          className: "btn-area btn-middle"
        },
        [_react2.default.createElement(
          Button,
          {
            className: "btn-default middle", ontap: $getEventHandler(this, "cancelAdd")
          },
          $toString(data['textBtnCancel'])
        ), _react2.default.createElement(
          Button,
          {
            className: "btn-primary middle", ontap: $getEventHandler(this, "submitItemDetail")
          },
          $toString(data['textBtnSure'])
        )]
      )]
    ) : null]
  ), data['showAdd'] === false ? _react2.default.createElement(
    View,
    {
      className: "fixed-bottom"
    },
    _react2.default.createElement(
      View,
      {
        className: "btn-area inline"
      },
      [_react2.default.createElement(
        Button,
        {
          className: "btn-default middle", ontap: $getEventHandler(this, "beforeStep")
        },
        $toString(data['btnBack'])
      ), _react2.default.createElement(
        Button,
        {
          className: "btn-primary middle", ontap: $getEventHandler(this, "submitFunc")
        },
        $toString(data['btnSubmit'])
      )]
    )
  ) : null]);
};

/***/ }),

/***/ "./example/oa/pages/travelPay/travelDetail.wxss":
/*!******************************************************!*\
  !*** ./example/oa/pages/travelPay/travelDetail.wxss ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/toptips/toptips.wxss */ "./example/oa/pages/component/toptips/toptips.wxss");
/* harmony import */ var _index_wxss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.wxss */ "./example/oa/pages/travelPay/index.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/travelPay/travelDetail.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);

stylesheet.imports(_index_wxss__WEBPACK_IMPORTED_MODULE_2__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.accout-totalNumber {
    background: #fff;
    font-size: 0.32rem;
    color: #666;
    letter-spacing: 0;
    line-height: 0.4rem;
    padding: 0.26rem 0.32rem;
  }
  .account-wrapper {
    padding-bottom: 80px;
  }
  .accout-total-num {
    padding-left: 0.4rem;
    color: #000;
  }
  .accout-card {
    margin: 0.16rem 0 0;
    background: #fff;
  }
  .accout-card-hd {
    position: relative;
    font-size: 0.32rem;
    color: #000;
    letter-spacing: 0;
    padding: 0.26rem 0.32rem;
  }
  .accout-card-hd-icon, .accout-card-hd-icon-edit {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
            transform: translateY(-50%);
  }
  .accout-card-hd-icon {
    right: 0.32rem;
  }
  .accout-card-hd-icon-edit {
    right: 1.08rem;
  }
  .btn-area {
    width: 100%;
    box-sizing: border-box;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding-bottom: 0.52rem;
  }
  .btn-area .a-button {
    position: relative;
    background: #FFFFFF;
    border-radius: 0.08rem;
    font-size: 0.34rem;
    width: 3.3rem;
    height: 0.88rem;
    line-height: 0.88rem;
    box-sizing: border-box;
    padding: 0;
    text-align: center;
    color: #1466DE;
    font-weight: normal;
  }
  .btn-area .a-button.btn-block {
    width: 6.86rem!important;
    border-radius: 0.08rem;
    margin-top: 0.32rem;
  }
  .btn-area.inline {
    margin-top: 0;
    padding: 0.16rem 0.32rem;
    padding-bottom: calc(0.16rem + constant(safe-area-inset-bottom));
    padding-bottom: calc(0.16rem + env(safe-area-inset-bottom));
  }
  .btn-area.inline .a-button {
    display: inline-block;
  }
  .btn-area.inline .a-button+.a-button {
    margin-left: 0.26rem;
  }
  .btn-area .a-button.btn-primary {
    background: #1466DE;
    color: #fff;
  }
  .fixed-bottom {
    position: fixed;
    z-index: 99;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #FFF;
    padding: 0.3rem 0rem;
    box-shadow: 0 -0.02rem 0.1rem 0 rgba(0,0,0,0.05);
  }
  .icon-add {
    color: #1466DE;
    margin-right: 0.16rem;
  }
  .account-group-box-textarea {
    width: 100%;
    height: 3.6rem;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    padding: 0.32rem;
    box-sizing: border-box;
  }
  .account-box-list-remark {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
  }
  .account-box-list-remark .account-group-title {
    line-height: 0.4rem;
    margin: 0.32rem 0 0.32rem 0.26rem;
    color: #666;
    width: 1.92rem;
  }
  .account-box-list-remark .account-group-box {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: start;
    -webkit-justify-content: start;
            justify-content: start;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    margin: 0.32rem 0.24rem 0.32rem 0.32rem;
  }
  .account-box-list-remark .account-box-content-txt-desc {
    word-wrap: break-word;
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
  }
  .account-box-list-remark .account-group-box-textarea {
    padding: 0rem;
  }
  .btn-block.btn-submit-add {
    color: #fff;
    background: #1466DE;
    border: none;
  }
  .pickerName {
    width: 100%;
  }
  .placeholder {
    color: #666;
  }
  .btn-middle {
    margin-top: 0.4rem;
  }
  .en .account-group-title {
    width: 2.3rem;
    font-size: 0.26rem;
  }
  .en .account-box-content-txt, .en .account-group-box-textarea {
    font-size: 0.26rem;
  }
  .btn-middle {
    margin-top: 0.4rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/travelPay/travelDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2":
/*!****************************************************************************************************!*\
  !*** ./example/oa/pages/travelPay/travelDetail.wxss?hash=f3f64c61b3b98da7f1f3d9ff9a0e65292a614ee2 ***!
  \****************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/toptips/toptips.wxss */ "./example/oa/pages/component/toptips/toptips.wxss");
/* harmony import */ var _index_wxss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./index.wxss */ "./example/oa/pages/travelPay/index.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/travelPay/travelDetail.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_toptips_toptips_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);

stylesheet.imports(_index_wxss__WEBPACK_IMPORTED_MODULE_2__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.accout-totalNumber {
    background: #fff;
    font-size: 0.32rem;
    color: #666;
    letter-spacing: 0;
    line-height: 0.4rem;
    padding: 0.26rem 0.32rem;
  }
  .account-wrapper {
    padding-bottom: 80px;
  }
  .accout-total-num {
    padding-left: 0.4rem;
    color: #000;
  }
  .accout-card {
    margin: 0.16rem 0 0;
    background: #fff;
  }
  .accout-card-hd {
    position: relative;
    font-size: 0.32rem;
    color: #000;
    letter-spacing: 0;
    padding: 0.26rem 0.32rem;
  }
  .accout-card-hd-icon, .accout-card-hd-icon-edit {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
            transform: translateY(-50%);
  }
  .accout-card-hd-icon {
    right: 0.32rem;
  }
  .accout-card-hd-icon-edit {
    right: 1.08rem;
  }
  .btn-area {
    width: 100%;
    box-sizing: border-box;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding-bottom: 0.52rem;
  }
  .btn-area .a-button {
    position: relative;
    background: #FFFFFF;
    border-radius: 0.08rem;
    font-size: 0.34rem;
    width: 3.3rem;
    height: 0.88rem;
    line-height: 0.88rem;
    box-sizing: border-box;
    padding: 0;
    text-align: center;
    color: #1466DE;
    font-weight: normal;
  }
  .btn-area .a-button.btn-block {
    width: 6.86rem!important;
    border-radius: 0.08rem;
    margin-top: 0.32rem;
  }
  .btn-area.inline {
    margin-top: 0;
    padding: 0.16rem 0.32rem;
    padding-bottom: calc(0.16rem + constant(safe-area-inset-bottom));
    padding-bottom: calc(0.16rem + env(safe-area-inset-bottom));
  }
  .btn-area.inline .a-button {
    display: inline-block;
  }
  .btn-area.inline .a-button+.a-button {
    margin-left: 0.26rem;
  }
  .btn-area .a-button.btn-primary {
    background: #1466DE;
    color: #fff;
  }
  .fixed-bottom {
    position: fixed;
    z-index: 99;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #FFF;
    padding: 0.3rem 0rem;
    box-shadow: 0 -0.02rem 0.1rem 0 rgba(0,0,0,0.05);
  }
  .icon-add {
    color: #1466DE;
    margin-right: 0.16rem;
  }
  .account-group-box-textarea {
    width: 100%;
    height: 3.6rem;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    padding: 0.32rem;
    box-sizing: border-box;
  }
  .account-box-list-remark {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
  }
  .account-box-list-remark .account-group-title {
    line-height: 0.4rem;
    margin: 0.32rem 0 0.32rem 0.26rem;
    color: #666;
    width: 1.92rem;
  }
  .account-box-list-remark .account-group-box {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: start;
    -webkit-justify-content: start;
            justify-content: start;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    margin: 0.32rem 0.24rem 0.32rem 0.32rem;
  }
  .account-box-list-remark .account-box-content-txt-desc {
    word-wrap: break-word;
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
  }
  .account-box-list-remark .account-group-box-textarea {
    padding: 0rem;
  }
  .btn-block.btn-submit-add {
    color: #fff;
    background: #1466DE;
    border: none;
  }
  .pickerName {
    width: 100%;
  }
  .placeholder {
    color: #666;
  }
  .btn-middle {
    margin-top: 0.4rem;
  }
  .en .account-group-title {
    width: 2.3rem;
    font-size: 0.26rem;
  }
  .en .account-box-content-txt, .en .account-group-box-textarea {
    font-size: 0.26rem;
  }
  .btn-middle {
    margin-top: 0.4rem;
  }`));

/***/ }),

/***/ "./example/oa/pages/warrant/index.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!********************************************************************************!*\
  !*** ./example/oa/pages/warrant?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/warrant/index',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/warrant/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/warrant/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/warrant/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/warrant/index.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  var _this = this;

  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "warrant-page"
    },
    [_react2.default.createElement(
      View,
      {
        className: "btn"
      },
      _react2.default.createElement(
        Button,
        {
          className: "btn-default large", ontap: $getEventHandler(this, "navWarrantTo"), 'data-status': "new"
        },
        [_react2.default.createElement(Icon, {
          className: "iconfont icon-add"
        }), $toString(data['btnAddAccredit'])]
      )
    ), $getLooseDataMember([data['warrantList'], "length"]) ? _react2.default.createElement(
      View,
      {
        className: "warrant-group"
      },
      $iterate(data['warrantList'], function (item, index) {
        return _react2.default.createElement(
          View,
          {
            className: "warrant-box"
          },
          [_react2.default.createElement(
            View,
            {
              className: "border-bottom-1px"
            },
            _react2.default.createElement(
              View,
              {
                className: "warrant-box-list"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "warrant-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "warrant-list-title"
                  },
                  $toString(data['textAddAgent'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "warrant-list-txt"
                  },
                  $toString($getLooseDataMember([item, "agent", "fullname"]))
                )]
              ), _react2.default.createElement(
                View,
                {
                  className: "warrant-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "warrant-list-title"
                  },
                  $toString(data['textStartDate'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "warrant-list-txt"
                  },
                  $toString($getLooseDataMember([item, "beginDate"]))
                )]
              ), _react2.default.createElement(
                View,
                {
                  className: "warrant-list"
                },
                [_react2.default.createElement(
                  View,
                  {
                    className: "warrant-list-title"
                  },
                  $toString(data['textEndDate'])
                ), _react2.default.createElement(
                  View,
                  {
                    className: "warrant-list-txt"
                  },
                  $toString($getLooseDataMember([item, "endDate"]))
                )]
              )]
            )
          ), _react2.default.createElement(
            View,
            {
              className: "warrant-box-operate"
            },
            [$getLooseDataMember([item, "status"]) === 'do' ? _react2.default.createElement(
              View,
              {
                className: "warrant-box-status"
              },
              [_react2.default.createElement(Icon, {
                className: "iconfont icon-more_solid"
              }), _react2.default.createElement(
                View,
                {
                  className: "warrant-box-status-txt"
                },
                $toString(data['textNotStarted'])
              )]
            ) : null, $getLooseDataMember([item, "status"]) === 'doing' ? _react2.default.createElement(
              View,
              {
                className: "warrant-box-status"
              },
              [_react2.default.createElement(Icon, {
                className: "iconfont icon-clock_shape"
              }), _react2.default.createElement(
                View,
                {
                  className: "warrant-box-status-txt"
                },
                $toString(data['textOngoing'])
              )]
            ) : null, $getLooseDataMember([item, "status"]) === 'done' ? _react2.default.createElement(
              View,
              {
                className: "warrant-box-status"
              },
              [_react2.default.createElement(Icon, {
                className: "iconfont icon-subtract_shapeed"
              }), _react2.default.createElement(
                View,
                {
                  className: "warrant-box-status-txt"
                },
                $toString(data['textCompleted'])
              )]
            ) : null, _react2.default.createElement(
              View,
              {
                className: "warrant-btn"
              },
              [_react2.default.createElement(
                Button,
                {
                  className: "btn-default", ontap: $getEventHandler(_this, "navWarrantTo"), 'data-status': "update", 'data-id': $getLooseDataMember([item, "id"])
                },
                $toString(data['btnUpdateAgent'])
              ), $getLooseDataMember([item, "status"]) === 'do' || $getLooseDataMember([item, "status"]) === 'doing' ? _react2.default.createElement(
                Button,
                {
                  className: "btn-default", ontap: $getEventHandler(_this, "navWarrantTo"), 'data-status': "close", 'data-id': $getLooseDataMember([item, "id"])
                },
                $toString(data['btnEndAgent'])
              ) : null, $getLooseDataMember([item, "status"]) === 'done' ? _react2.default.createElement(
                Button,
                {
                  className: "btn-default", ontap: $getEventHandler(_this, "navWarrantTo"), 'data-status': "delete", 'data-id': $getLooseDataMember([item, "id"])
                },
                $toString(data['btnDelAgent'])
              ) : null]
            )]
          )]
        );
      })
    ) : null, $getLooseDataMember([data['warrantList'], "length"]) == 0 && data['warrantListStatus'] ? _react2.default.createElement(
      View,
      {
        className: "empty-box"
      },
      [_react2.default.createElement(Image, {
        className: "image", src: "/image/empty.png"
      }), _react2.default.createElement(
        Text,
        {
          className: "text"
        },
        $toString(data['textAlertCounts'])
      )]
    ) : null]
  ));
};

/***/ }),

/***/ "./example/oa/pages/warrant/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/warrant/index.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/warrant/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.warrant-page {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    height: 100%;
    background-color: #F0F2F5;
    overflow: hidden;
  }
  .warrant-group {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    overflow-y: auto;
  }
  .warrant-box {
    width: 100%;
    background-color: #FFF;
    box-sizing: border-box;
    padding: 0.34rem 0 0 0.32rem;
    margin-bottom: 0.16rem;
  }
  .warrant-box-list {
    padding-bottom: 0.13rem;
  }
  .warrant-list {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    margin-bottom: 0.22rem;
  }
  .warrant-list-title {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    width: 1.5rem;
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #999;
  }
  .warrant-list-txt {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.3rem;
    line-height: 0.38rem;
    color: #333;
    margin-left: 0.24rem;
  }
  .warrant-box-operate {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
            justify-content: space-between;
    height: 0.92rem;
  }
  .warrant-box-status {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .warrant-box-status-txt {
    font-size: 0.28rem;
    line-height: 0.36rem;
    color: #333;
    margin-left: 0.17rem;
  }
  .warrant-btn {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
  }
  .btn {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    width: 100%;
    padding: 0.32rem;
    box-sizing: border-box;
  }
  .warrant-box-operate .btn-default {
    margin-right: 0.32rem;
  }
  .icon-clock_shape:before {
    color: #00B87A;
  }
  .icon-more_solid:before {
    color: #FFB400;
  }
  .icon-subtract_shapeed:before {
    color: #999;
  }`));

/***/ }),

/***/ "./example/oa/pages/warrant/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!******************************************************************************************!*\
  !*** ./example/oa/pages/warrant/search.js?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/warrant/search',
  usingComponents: {"com-search":"/pages/component/search/search"},
  
  render: function() { return __webpack_require__(/*! ./search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/warrant/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1"); },
  stylesheet: function() { return __webpack_require__(/*! ./search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 */ "./example/oa/pages/warrant/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1"); },
});


/***/ }),

/***/ "./example/oa/pages/warrant/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!********************************************************************************************!*\
  !*** ./example/oa/pages/warrant/search.wxml?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var getComponentClass = self.MP.getComponentClass;

var $getComponentClass = function $getComponentClass(name) {
  return getComponentClass && getComponentClass(name);
};

var ComSearch_ = $getComponentClass("/pages/component/search/search");
var ComSearch = ComSearch_ || $EmptyComponentFactory("com-search");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(ComSearch, {
    historyHeadTxt: data['titeAgentHistory'], title: data['titeSelectagent'], historyKey: "warrant", $isCustomComponent: this.$isCustomComponent, __tag: "com-search"
  }));
};

/***/ }),

/***/ "./example/oa/pages/warrant/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1":
/*!********************************************************************************************!*\
  !*** ./example/oa/pages/warrant/search.wxss?hash=36f562b2762ab92f3a4fd8c46f5a34325c16e0d1 ***!
  \********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
/* harmony import */ var _component_search_search_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../component/search/search.wxss */ "./example/oa/pages/component/search/search.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/warrant/search.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_component_search_search_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(``));

/***/ }),

/***/ "./example/oa/pages/warrant/warrant.js?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*******************************************************************************************!*\
  !*** ./example/oa/pages/warrant/warrant.js?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*******************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/warrant/warrant',
  usingComponents: {},
  
  render: function() { return __webpack_require__(/*! ./warrant.wxml?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/warrant/warrant.wxml?hash=f8f53b2631c7389810262145c2357935db847400"); },
  stylesheet: function() { return __webpack_require__(/*! ./warrant.wxss?hash=f8f53b2631c7389810262145c2357935db847400 */ "./example/oa/pages/warrant/warrant.wxss?hash=f8f53b2631c7389810262145c2357935db847400"); },
});


/***/ }),

/***/ "./example/oa/pages/warrant/warrant.wxml?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/warrant/warrant.wxml?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*********************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $createReactElement = _react2.default && _react2.default.createElement;
var $getComponentEventHandler = function $getComponentEventHandler(instance, name) {
  return instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
};
var $getEventHandler = function $getEventHandler(instance, name) {
  return instance.$getEventHandler(name);
};
var $getRefHandler = function $getRefHandler(instance, name) {
  return instance.$getRefHandler(name);
};
var $getComRefHandler = function $getComRefHandler(instance, name) {
  return instance.$getComRefHandler && instance.$getComRefHandler(name);
};

var $EmptyComponentFactory = self.RMLRuntime.EmptyComponentFactory;
var View_ = self.MPUI['view'];
var View = View_ || $EmptyComponentFactory("view");
var Icon_ = self.MPUI['icon'];
var Icon = Icon_ || $EmptyComponentFactory("icon");
var Picker_ = self.MPUI['picker'];
var Picker = Picker_ || $EmptyComponentFactory("picker");
var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
var $iterate = self.RMLRuntime.iterate;
var $createRoot = self.RMLRuntime.createRoot;
var $createBlock = self.RMLRuntime.createBlock;
var $useTemplate = self.RMLRuntime.useTemplate;
var $createTemplate = self.RMLRuntime.createTemplate;
var $renderSlot = self.RMLRuntime.renderSlot;
var $resolveScopedSlots = self.RMLRuntime.resolveScopedSlots;
var $getSJSMember = self.RMLRuntime.getSJSMember;
var $toString = self.RMLRuntime.toString;
var $getLooseDataMember = self.RMLRuntime.getLooseDataMember;

var $templates = {};
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "warrant-page"
    },
    [_react2.default.createElement(
      View,
      {
        className: "warrent-group-box"
      },
      [_react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "warrent-box-list"
          },
          [_react2.default.createElement(
            View,
            {
              className: "warrent-box-title"
            },
            $toString(data['textAddAgent'])
          ), _react2.default.createElement(
            View,
            {
              className: "warrent-box-content", ontap: $getEventHandler(this, "bindSearchAgent")
            },
            [_react2.default.createElement(
              View,
              {
                className: "warrent-box-content-txt"
              },
              $toString(data['fullname'])
            ), _react2.default.createElement(Icon, {
              className: "iconfont icon-right-arrow"
            })]
          )]
        )
      ), _react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "warrent-box-list"
          },
          [_react2.default.createElement(
            View,
            {
              className: "warrent-box-title"
            },
            $toString(data['textStartDate'])
          ), _react2.default.createElement(
            Picker,
            {
              className: "warrent-date-box", mode: "date", value: $getLooseDataMember([data['rule'], "beginDate"]), onchange: $getEventHandler(this, "bindBeginDateChange")
            },
            _react2.default.createElement(
              View,
              {
                className: "warrent-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "warrent-box-content-txt"
                },
                $toString($getLooseDataMember([data['rule'], "beginDate"]))
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-right-arrow"
              })]
            )
          )]
        )
      ), _react2.default.createElement(
        View,
        {
          className: "border-bottom-1px"
        },
        _react2.default.createElement(
          View,
          {
            className: "warrent-box-list"
          },
          [_react2.default.createElement(
            View,
            {
              className: "warrent-box-title"
            },
            $toString(data['textEndDate'])
          ), _react2.default.createElement(
            Picker,
            {
              className: "warrent-date-box", mode: "date", value: $getLooseDataMember([data['rule'], "endDate"]), onchange: $getEventHandler(this, "bindEndDateChange")
            },
            _react2.default.createElement(
              View,
              {
                className: "warrent-box-content"
              },
              [_react2.default.createElement(
                View,
                {
                  className: "warrent-box-content-txt"
                },
                $toString($getLooseDataMember([data['rule'], "endDate"]))
              ), _react2.default.createElement(Icon, {
                className: "iconfont icon-right-arrow"
              })]
            )
          )]
        )
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "btn"
      },
      _react2.default.createElement(
        Button,
        {
          className: "btn-primary large", ontap: $getEventHandler(this, "navRouterBack")
        },
        $toString(data['textauThorize'])
      )
    )]
  ));
};

/***/ }),

/***/ "./example/oa/pages/warrant/warrant.wxss?hash=f8f53b2631c7389810262145c2357935db847400":
/*!*********************************************************************************************!*\
  !*** ./example/oa/pages/warrant/warrant.wxss?hash=f8f53b2631c7389810262145c2357935db847400 ***!
  \*********************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/oa/app.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/warrant/warrant.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.warrant-page {
    height: 100%;
    background-color: #F0F2F5;
  }
  .warrent-group-box {
    background-color: #FFF;
  }
  .warrent-box-list {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    padding: 0.26rem 0;
    margin-left: 0.32rem;
    border-bottom: 1px solid #DEDFE0;
  }
  .warrent-box-list:nth-last-of-type(1) {
    border-bottom: none;
  }
  .warrent-box-title {
    -webkit-box-flex: 0;
    -webkit-flex: none;
            flex: none;
    position: relative;
    width: 1.92rem;
    font-size: 0.32rem;
    color: #666;
    line-height: 0.4rem;
  }
  .warrent-date-box {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
  }
  .warrent-box-content {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    margin-left: 0.32rem;
    margin-right: 0.24rem;
    overflow: hidden;
  }
  .warrent-box-content-txt {
    -webkit-box-flex: 1;
    -webkit-flex: auto;
            flex: auto;
    font-size: 0.32rem;
    color: #333;
    line-height: 0.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .btn {
    width: 100%;
    padding: 0.4rem 0.32rem 0.32rem;
    box-sizing: border-box;
  }`));

/***/ }),

/***/ "./lib/sjsEnvInit.js":
/*!***************************!*\
  !*** ./lib/sjsEnvInit.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {(function (g) {
  // es5
  const PREFIX = '$sjs_';
  const PREFIX_LENGTH = PREFIX.length;

  function sjsInitObject() {
    Object.defineProperty(Object.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Object',
    });
    Object.defineProperty(Object.prototype, `${PREFIX}toString`, {
      writable: true,
      value: function value() {
        return '[object Object]';
      },
    });
  }

  function sjsInitFunction() {
    Object.defineProperty(Function.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Function',
    });
    Object.defineProperty(Function.prototype, `${PREFIX}length`, {
      get: function get() {
        return this.length;
      },
      set: function set() {},
    });
    Object.defineProperty(Function.prototype, `${PREFIX}toString`, {
      writable: true,
      value: function value() {
        return '[function Function]';
      },
    });
  }

  function sjsInitArray() {
    Object.defineProperty(Array.prototype, `${PREFIX}toString`, {
      writable: true,
      value: function value() {
        return this[`${PREFIX}join`]();
      },
    });
    Object.defineProperty(Array.prototype, `${PREFIX}join`, {
      writable: true,
      value: function value(s) {
        s = undefined === s ? ',' : s;
        let r = '';
        for (let i = 0; i < this.length; ++i) {
          if (i !== 0) {
            r += s;
          }
          if (this[i] === null || this[i] === undefined) {
            r += '';
          } else if (typeof this[i] === 'function') {
            r += this[i][`${PREFIX}toString`]();
          } else if (
            typeof this[i] === 'object'
            && this[i][`${PREFIX}constructor`] === 'Array'
          ) {
            r += this[i][`${PREFIX}join`]();
          } else {
            r += this[i].toString();
          }
        }
        return r;
      },
    });
    Object.defineProperty(Array.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Array',
    });
    Object.defineProperty(Array.prototype, `${PREFIX}concat`, {
      writable: true,
      value: Array.prototype.concat,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}pop`, {
      writable: true,
      value: Array.prototype.pop,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}push`, {
      writable: true,
      value: Array.prototype.push,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}reverse`, {
      writable: true,
      value: Array.prototype.reverse,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}shift`, {
      writable: true,
      value: Array.prototype.shift,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}slice`, {
      writable: true,
      value: Array.prototype.slice,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}sort`, {
      writable: true,
      value: Array.prototype.sort,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}splice`, {
      writable: true,
      value: Array.prototype.splice,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}unshift`, {
      writable: true,
      value: Array.prototype.unshift,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}indexOf`, {
      writable: true,
      value: Array.prototype.indexOf,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}lastIndexOf`, {
      writable: true,
      value: Array.prototype.lastIndexOf,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}every`, {
      writable: true,
      value: Array.prototype.every,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}some`, {
      writable: true,
      value: Array.prototype.some,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}forEach`, {
      writable: true,
      value: Array.prototype.forEach,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}map`, {
      writable: true,
      value: Array.prototype.map,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}filter`, {
      writable: true,
      value: Array.prototype.filter,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}reduce`, {
      writable: true,
      value: Array.prototype.reduce,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}reduceRight`, {
      writable: true,
      value: Array.prototype.reduceRight,
    });
    Object.defineProperty(Array.prototype, `${PREFIX}length`, {
      get: function get() {
        return this.length;
      },
      set: function set(value) {
        this.length = value;
      },
    });
  }

  function sjsInitString() {
    Object.defineProperty(String.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'String',
    });
    Object.defineProperty(String.prototype, `${PREFIX}toString`, {
      writable: true,
      value: String.prototype.toString,
    });
    Object.defineProperty(String.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: String.prototype.valueOf,
    });
    Object.defineProperty(String.prototype, `${PREFIX}charAt`, {
      writable: true,
      value: String.prototype.charAt,
    });
    Object.defineProperty(String.prototype, `${PREFIX}charCodeAt`, {
      writable: true,
      value: String.prototype.charCodeAt,
    });
    Object.defineProperty(String.prototype, `${PREFIX}concat`, {
      writable: true,
      value: String.prototype.concat,
    });
    Object.defineProperty(String.prototype, `${PREFIX}indexOf`, {
      writable: true,
      value: String.prototype.indexOf,
    });
    Object.defineProperty(String.prototype, `${PREFIX}lastIndexOf`, {
      writable: true,
      value: String.prototype.lastIndexOf,
    });
    Object.defineProperty(String.prototype, `${PREFIX}localeCompare`, {
      writable: true,
      value: String.prototype.localeCompare,
    });
    Object.defineProperty(String.prototype, `${PREFIX}match`, {
      writable: true,
      value: String.prototype.match,
    });
    Object.defineProperty(String.prototype, `${PREFIX}replace`, {
      writable: true,
      value: String.prototype.replace,
    });
    Object.defineProperty(String.prototype, `${PREFIX}search`, {
      writable: true,
      value: String.prototype.search,
    });
    Object.defineProperty(String.prototype, `${PREFIX}slice`, {
      writable: true,
      value: String.prototype.slice,
    });
    Object.defineProperty(String.prototype, `${PREFIX}split`, {
      writable: true,
      value: String.prototype.split,
    });
    Object.defineProperty(String.prototype, `${PREFIX}substring`, {
      writable: true,
      value: String.prototype.substring,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toLowerCase`, {
      writable: true,
      value: String.prototype.toLowerCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toLocaleLowerCase`, {
      writable: true,
      value: String.prototype.toLocaleLowerCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toUpperCase`, {
      writable: true,
      value: String.prototype.toUpperCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}toLocaleUpperCase`, {
      writable: true,
      value: String.prototype.toLocaleUpperCase,
    });
    Object.defineProperty(String.prototype, `${PREFIX}trim`, {
      writable: true,
      value: String.prototype.trim,
    });
    Object.defineProperty(String.prototype, `${PREFIX}length`, {
      get: function get() {
        return this.length;
      },
      set: function set(value) {
        this.length = value;
      },
    });
  }

  function sjsInitBoolean() {
    Object.defineProperty(Boolean.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Boolean',
    });
    Object.defineProperty(Boolean.prototype, `${PREFIX}toString`, {
      writable: true,
      value: Boolean.prototype.toString,
    });
    Object.defineProperty(Boolean.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: Boolean.prototype.valueOf,
    });
  }

  function sjsInitNumber() {
    Object.defineProperty(Number, `${PREFIX}MAX_VALUE`, {
      writable: false,
      value: Number.MAX_VALUE,
    });
    Object.defineProperty(Number, `${PREFIX}MIN_VALUE`, {
      writable: false,
      value: Number.MIN_VALUE,
    });
    Object.defineProperty(Number, `${PREFIX}NEGATIVE_INFINITY`, {
      writable: false,
      value: Number.NEGATIVE_INFINITY,
    });
    Object.defineProperty(Number, `${PREFIX}POSITIVE_INFINITY`, {
      writable: false,
      value: Number.POSITIVE_INFINITY,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Number',
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toString`, {
      writable: true,
      value: Number.prototype.toString,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toLocaleString`, {
      writable: true,
      value: Number.prototype.toLocaleString,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: Number.prototype.valueOf,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toFixed`, {
      writable: true,
      value: Number.prototype.toFixed,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toExponential`, {
      writable: true,
      value: Number.prototype.toExponential,
    });
    Object.defineProperty(Number.prototype, `${PREFIX}toPrecision`, {
      writable: true,
      value: Number.prototype.toPrecision,
    });
  }

  function sjsInitMath() {
    Object.defineProperty(Math, `${PREFIX}E`, {
      writable: false,
      value: Math.E,
    });
    Object.defineProperty(Math, `${PREFIX}LN10`, {
      writable: false,
      value: Math.LN10,
    });
    Object.defineProperty(Math, `${PREFIX}LN2`, {
      writable: false,
      value: Math.LN2,
    });
    Object.defineProperty(Math, `${PREFIX}LOG2E`, {
      writable: false,
      value: Math.LOG2E,
    });
    Object.defineProperty(Math, `${PREFIX}LOG10E`, {
      writable: false,
      value: Math.LOG10E,
    });
    Object.defineProperty(Math, `${PREFIX}PI`, {
      writable: false,
      value: Math.PI,
    });
    Object.defineProperty(Math, `${PREFIX}SQRT1_2`, {
      writable: false,
      value: Math.SQRT1_2,
    });
    Object.defineProperty(Math, `${PREFIX}SQRT2`, {
      writable: false,
      value: Math.SQRT2,
    });
    Object.defineProperty(Math, `${PREFIX}abs`, {
      writable: false,
      value: Math.abs,
    });
    Object.defineProperty(Math, `${PREFIX}acos`, {
      writable: false,
      value: Math.acos,
    });
    Object.defineProperty(Math, `${PREFIX}asin`, {
      writable: false,
      value: Math.asin,
    });
    Object.defineProperty(Math, `${PREFIX}atan`, {
      writable: false,
      value: Math.atan,
    });
    Object.defineProperty(Math, `${PREFIX}atan2`, {
      writable: false,
      value: Math.atan2,
    });
    Object.defineProperty(Math, `${PREFIX}ceil`, {
      writable: false,
      value: Math.ceil,
    });
    Object.defineProperty(Math, `${PREFIX}cos`, {
      writable: false,
      value: Math.cos,
    });
    Object.defineProperty(Math, `${PREFIX}exp`, {
      writable: false,
      value: Math.exp,
    });
    Object.defineProperty(Math, `${PREFIX}floor`, {
      writable: false,
      value: Math.floor,
    });
    Object.defineProperty(Math, `${PREFIX}log`, {
      writable: false,
      value: Math.log,
    });
    Object.defineProperty(Math, `${PREFIX}max`, {
      writable: false,
      value: Math.max,
    });
    Object.defineProperty(Math, `${PREFIX}min`, {
      writable: false,
      value: Math.min,
    });
    Object.defineProperty(Math, `${PREFIX}pow`, {
      writable: false,
      value: Math.pow,
    });
    Object.defineProperty(Math, `${PREFIX}random`, {
      writable: false,
      value: Math.random,
    });
    Object.defineProperty(Math, `${PREFIX}round`, {
      writable: false,
      value: Math.round,
    });
    Object.defineProperty(Math, `${PREFIX}sin`, {
      writable: false,
      value: Math.sin,
    });
    Object.defineProperty(Math, `${PREFIX}sqrt`, {
      writable: false,
      value: Math.sqrt,
    });
    Object.defineProperty(Math, `${PREFIX}tan`, {
      writable: false,
      value: Math.tan,
    });
  }

  function sjsInitDate() {
    Object.defineProperty(Date.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'Date',
    });
    Object.defineProperty(Date, `${PREFIX}parse`, {
      writable: true,
      value: Date.parse,
    });
    Object.defineProperty(Date, `${PREFIX}UTC`, {
      writable: true,
      value: Date.UTC,
    });
    Object.defineProperty(Date, `${PREFIX}now`, {
      writable: true,
      value: Date.now,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toString`, {
      writable: true,
      value: Date.prototype.toString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toDateString`, {
      writable: true,
      value: Date.prototype.toDateString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toTimeString`, {
      writable: true,
      value: Date.prototype.toTimeString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toLocaleString`, {
      writable: true,
      value: Date.prototype.toLocaleString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toLocaleDateString`, {
      writable: true,
      value: Date.prototype.toLocaleDateString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toLocaleTimeString`, {
      writable: true,
      value: Date.prototype.toLocaleTimeString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}valueOf`, {
      writable: true,
      value: Date.prototype.valueOf,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getTime`, {
      writable: true,
      value: Date.prototype.getTime,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getFullYear`, {
      writable: true,
      value: Date.prototype.getFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCFullYear`, {
      writable: true,
      value: Date.prototype.getUTCFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getMonth`, {
      writable: true,
      value: Date.prototype.getMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCMonth`, {
      writable: true,
      value: Date.prototype.getUTCMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getDate`, {
      writable: true,
      value: Date.prototype.getDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCDate`, {
      writable: true,
      value: Date.prototype.getUTCDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getDay`, {
      writable: true,
      value: Date.prototype.getDay,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCDay`, {
      writable: true,
      value: Date.prototype.getUTCDay,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getHours`, {
      writable: true,
      value: Date.prototype.getHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCHours`, {
      writable: true,
      value: Date.prototype.getUTCHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getMinutes`, {
      writable: true,
      value: Date.prototype.getMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCMinutes`, {
      writable: true,
      value: Date.prototype.getUTCMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getSeconds`, {
      writable: true,
      value: Date.prototype.getSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCSeconds`, {
      writable: true,
      value: Date.prototype.getUTCSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getMilliseconds`, {
      writable: true,
      value: Date.prototype.getMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getUTCMilliseconds`, {
      writable: true,
      value: Date.prototype.getUTCMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}getTimezoneOffset`, {
      writable: true,
      value: Date.prototype.getTimezoneOffset,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setTime`, {
      writable: true,
      value: Date.prototype.setTime,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setMilliseconds`, {
      writable: true,
      value: Date.prototype.setMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCMilliseconds`, {
      writable: true,
      value: Date.prototype.setUTCMilliseconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setSeconds`, {
      writable: true,
      value: Date.prototype.setSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCSeconds`, {
      writable: true,
      value: Date.prototype.setUTCSeconds,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setMinutes`, {
      writable: true,
      value: Date.prototype.setMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCMinutes`, {
      writable: true,
      value: Date.prototype.setUTCMinutes,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setHours`, {
      writable: true,
      value: Date.prototype.setHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCHours`, {
      writable: true,
      value: Date.prototype.setUTCHours,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setDate`, {
      writable: true,
      value: Date.prototype.setDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCDate`, {
      writable: true,
      value: Date.prototype.setUTCDate,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setMonth`, {
      writable: true,
      value: Date.prototype.setMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCMonth`, {
      writable: true,
      value: Date.prototype.setUTCMonth,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setFullYear`, {
      writable: true,
      value: Date.prototype.setFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}setUTCFullYear`, {
      writable: true,
      value: Date.prototype.setUTCFullYear,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toUTCString`, {
      writable: true,
      value: Date.prototype.toUTCString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toISOString`, {
      writable: true,
      value: Date.prototype.toISOString,
    });
    Object.defineProperty(Date.prototype, `${PREFIX}toJSON`, {
      writable: true,
      value: Date.prototype.toJSON,
    });
  }

  function sjsInitRegExp() {
    Object.defineProperty(RegExp.prototype, `${PREFIX}constructor`, {
      writable: true,
      value: 'RegExp',
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}exec`, {
      writable: true,
      value: RegExp.prototype.exec,
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}test`, {
      writable: true,
      value: RegExp.prototype.test,
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}toString`, {
      writable: true,
      value: RegExp.prototype.toString,
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}source`, {
      get: function get() {
        return this.source;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}global`, {
      get: function get() {
        return this.global;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}ignoreCase`, {
      get: function get() {
        return this.ignoreCase;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}multiline`, {
      get: function get() {
        return this.multiline;
      },
      set: function set() {},
    });
    Object.defineProperty(RegExp.prototype, `${PREFIX}lastIndex`, {
      get: function get() {
        return this.lastIndex;
      },
      set: function set(v) {
        this.lastIndex = v;
      },
    });
  }

  function is(target, type) {
    return Object.prototype.toString.call(target) === `[object ${type}]`;
  }

  // 所有`$sjs_`开头的变量需要作为自定义脚本的全局变量
  function sjsInitGlobals() {
    const sjsConsole = {};
    sjsConsole[`${PREFIX}log`] = function () {
      let res = 'SJS: ';
      for (let i = 0; i < arguments.length; ++i) {
        res += `${arguments[i]} `;
      }
      if (g.MP && g.MP.workerConsole) {
        g.MP.workerConsole.log(res);
      } else {
        // do not console log on worker
        // console.log(res);
      }
    };

    function converter(obj, prefix) {
      if (obj === null || obj === undefined) return obj;
      if (is(obj, 'String') || is(obj, 'Boolean') || is(obj, 'Number')) {
        return obj;
      }
      if (is(obj, 'Object')) {
        const copy = {};
        // eslint-disable-next-line
        for (var k in obj) {
          // eslint-disable-next-line no-prototype-builtins
          if (obj.hasOwnProperty(k)) {
            if (undefined === prefix) {
              copy[k.substring(PREFIX_LENGTH)] = converter(obj[k], prefix);
            } else {
              copy[prefix + k] = converter(obj[k], prefix);
            }
          }
        }
        return copy;
      }
      if (Array.isArray(obj)) {
        const _copy = [];
        for (let i = 0; i < obj.length; i++) {
          _copy.push(converter(obj[i], prefix));
        }
        return _copy;
      }
      if (is(obj, 'Date')) {
        const _copy2 = new Date();
        _copy2.setTime(obj.getTime());
        return _copy2;
      }
      if (is(obj, 'RegExp')) {
        let f = '';
        if (obj.global) f += 'g';
        if (obj.ignoreCase) f += 'i';
        if (obj.multiline) f += 'm';
        return new RegExp(obj.source, f);
      }
      if (is(obj, 'Function')) {
        return undefined;
      }
      return null;
    }

    const sjsJSON = {};
    sjsJSON[`${PREFIX}stringify`] = function (o) {
      JSON.stringify(o);
      return JSON.stringify(converter(o));
    };
    sjsJSON[`${PREFIX}parse`] = function (o) {
      if (o === undefined) {
        return undefined;
      }
      const t = JSON.parse(o);
      return converter(t, PREFIX);
    };

    const sjsObject = {};
    sjsObject[`${PREFIX}keys`] = function (o) {
      const keys = Object.keys(o);
      const ret = [];
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].substring(0, PREFIX_LENGTH) === PREFIX) {
          ret.push([keys[i].substring(PREFIX_LENGTH)]);
        }
      }
      return ret;
    };

    g[`${PREFIX}getDate`] = function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(Date);
      return new (Function.prototype.bind.apply(Date, args))();
    };
    g[`${PREFIX}getRegExp`] = function () {
      const args = Array.prototype.slice.call(arguments);
      args.unshift(RegExp);
      return new (Function.prototype.bind.apply(RegExp, args))();
    };
    g[`${PREFIX}parseInt`] = parseInt;
    g[`${PREFIX}parseFloat`] = parseFloat;
    g[`${PREFIX}isNaN`] = isNaN;
    g[`${PREFIX}isFinite`] = isFinite;
    g[`${PREFIX}decodeURI`] = decodeURI;
    g[`${PREFIX}decodeURIComponent`] = decodeURIComponent;
    g[`${PREFIX}encodeURI`] = encodeURI;
    g[`${PREFIX}encodeURIComponent`] = encodeURIComponent;
    g[`${PREFIX}console`] = sjsConsole;
    g[`${PREFIX}JSON`] = sjsJSON;
    g[`${PREFIX}Object`] = sjsObject;
    g[`_${PREFIX}p`] = function ($t) {
      return $t == null
        ? undefined
        : $t[`${PREFIX}constructor`] === 'Number'
          ? $t
          : PREFIX + $t;
    };
  }

  // 在sjsInit中初始化对native的更改
  function sjsInit() {
    sjsInitObject();
    sjsInitFunction();
    sjsInitArray();
    sjsInitString();
    sjsInitBoolean();
    sjsInitNumber();
    sjsInitMath();
    sjsInitDate();
    sjsInitRegExp();
    sjsInitGlobals();
  }

  if (!g.__sjsEnvInited) {
    g.__sjsEnvInited = 1;
    sjsInit();
  }
})(typeof global !== 'undefined' ? global : self);

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

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


/***/ }),

/***/ "react":
/*!*****************************!*\
  !*** external "self.React" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = self.React;

/***/ })

/******/ });