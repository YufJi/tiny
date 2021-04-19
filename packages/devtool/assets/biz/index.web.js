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
    "$homepage": "pages/todos/todos"
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
__webpack_require__(/*! ./example/miniRoot/components/add-button/add-button */ "./example/miniRoot/components/add-button/add-button.js");
__webpack_require__(/*! ./example/miniRoot/pages/todos/todos */ "./example/miniRoot/pages/todos/todos.js");
__webpack_require__(/*! ./example/miniRoot/pages/add-todo/add-todo */ "./example/miniRoot/pages/add-todo/add-todo.js");


/***/ }),

/***/ "./example/miniRoot/app.wxss":
/*!***********************************!*\
  !*** ./example/miniRoot/app.wxss ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'app.wxss' });
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.a-page {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    background: #323239;
    font-family: "pingFang SC" "pingFang";
  }`));

/***/ }),

/***/ "./example/miniRoot/components/add-button/add-button.js":
/*!**************************************************************!*\
  !*** ./example/miniRoot/components/add-button/add-button.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Component: $Component } = self.MP;
var Component = $Component || function(){};

Component(
{
  is: "/components/add-button/add-button",
  usingComponents: {"add-button":"/components/add-button/add-button"},
  render: function() { return __webpack_require__(/*! ./add-button.wxml */ "./example/miniRoot/components/add-button/add-button.wxml"); },
  
});


/***/ }),

/***/ "./example/miniRoot/components/add-button/add-button.wxml":
/*!****************************************************************!*\
  !*** ./example/miniRoot/components/add-button/add-button.wxml ***!
  \****************************************************************/
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

var Button_ = self.MPUI['button'];
var Button = Button_ || $EmptyComponentFactory("button");
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
  return $createRoot(_react2.default.createElement(
    Button,
    {
      className: "add-button", hoverClass: "none", ontap: $getEventHandler(this, "onClickMe")
    },
    [_react2.default.createElement(
      Text,
      {
        className: "add-icon"
      },
      $toString("+")
    ), _react2.default.createElement(
      Text,
      null,
      $toString(data['text'])
    )]
  ));
};

/***/ }),

/***/ "./example/miniRoot/components/add-button/add-button.wxss":
/*!****************************************************************!*\
  !*** ./example/miniRoot/components/add-button/add-button.wxss ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'components/add-button/add-button.wxss' });
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.add-button {
    display: inline-block;
    background: none;
    color: #FFF;
    border: none;
    width: 3rem;
  }
  .add-icon {
    font-size: 0.52rem;
    color: #00FFD6;
    margin-right: 0.1rem;
  }
  .user {
    font-size: 150px;
  }`));

/***/ }),

/***/ "./example/miniRoot/pages/add-todo/a.wxml":
/*!************************************************!*\
  !*** ./example/miniRoot/pages/add-todo/a.wxml ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$ownTemplates = undefined;
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

var $template = void 0;
var $ownTemplates = exports.$ownTemplates = {};
$template = $ownTemplates["abc"] = function (data) {
  return _react2.default.createElement(
    View,
    null,
    $toString("21212")
  );
};

$template.Component = $createTemplate("abc", $template);

var $templates = {};
$templates = $ownTemplates;
function render(data) {
  return $createRoot(null);
};

/***/ }),

/***/ "./example/miniRoot/pages/add-todo/add-todo.js":
/*!*****************************************************!*\
  !*** ./example/miniRoot/pages/add-todo/add-todo.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/add-todo/add-todo',
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
  render: function() { return __webpack_require__(/*! ./add-todo.wxml */ "./example/miniRoot/pages/add-todo/add-todo.wxml"); },
  stylesheet: function() { return __webpack_require__(/*! ./add-todo.wxss */ "./example/miniRoot/pages/add-todo/add-todo.wxss"); },
});


/***/ }),

/***/ "./example/miniRoot/pages/add-todo/add-todo.wxml":
/*!*******************************************************!*\
  !*** ./example/miniRoot/pages/add-todo/add-todo.wxml ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

var _a = __webpack_require__(/*! ./a.wxml */ "./example/miniRoot/pages/add-todo/a.wxml");

var _b = __webpack_require__(/*! ./b.wxml */ "./example/miniRoot/pages/add-todo/b.wxml");

var _b2 = _interopRequireDefault(_b);

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
var Input_ = self.MPUI['input'];
var Input = Input_ || $EmptyComponentFactory("input");
var AddButton_ = $getComponentClass("/components/add-button/add-button");
var AddButton = AddButton_ || $EmptyComponentFactory("add-button");
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
$templates = Object.assign({}, _a.$ownTemplates);
function render(data) {
  return $createRoot(_react2.default.createElement(
    View,
    {
      className: "page-add-todo"
    },
    [_b2.default.apply(this, arguments), _react2.default.createElement(
      View,
      {
        className: "add-todo"
      },
      _react2.default.createElement(Input, {
        className: "add-todo-input", placeholder: "What needs to be done?", onBlur: "onBlur", value: data['inputValue']
      })
    ), _react2.default.createElement(
      View,
      {
        ontap: $getEventHandler(this, "add")
      },
      $toString("12121")
    ), _react2.default.createElement(
      View,
      {
        catchtap: $getEventHandler(this, "add")
      },
      $toString("12121")
    ), _react2.default.createElement(
      View,
      {
        className: "todo-footer"
      },
      _react2.default.createElement(AddButton, {
        text: "Add Todo", ontap: $getComponentEventHandler(this, "xx"), onclickme: $getComponentEventHandler(this, "add"), $isCustomComponent: this.$isCustomComponent, __tag: 'add-button'
      })
    ), _react2.default.createElement(
      View,
      {
        style: "color: red", catchtapcapture: $getEventHandler(this, "xxxx")
      },
      $toString("capture-catch:tap")
    ), $useTemplate($templates["abc"], {
      inputValue: data['inputValue']
    }, undefined, this)]
  ));
};

/***/ }),

/***/ "./example/miniRoot/pages/add-todo/add-todo.wxss":
/*!*******************************************************!*\
  !*** ./example/miniRoot/pages/add-todo/add-todo.wxss ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/miniRoot/app.wxss");
/* harmony import */ var _components_add_button_add_button_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/add-button/add-button.wxss */ "./example/miniRoot/components/add-button/add-button.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/add-todo/add-todo.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_components_add_button_add_button_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.page-add-todo {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
  }
  .add-todo {
    padding: 40px;
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
            flex-grow: 1;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
            justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .add-todo-input {
    display: block;
    font-size: 0.5rem;
    font-weight: 100;
    padding: 5px 5px;
    background: none;
    border: none;
    border-bottom: 1px solid #DFDFDF;
    color: #0EFFD6;
    width: 100%;
  }
  .todo-footer {
    padding: 0.5rem 0 1rem;
    font-size: 0.48rem;
    font-weight: 200;
    text-align: center;
  }`));

/***/ }),

/***/ "./example/miniRoot/pages/add-todo/b.wxml":
/*!************************************************!*\
  !*** ./example/miniRoot/pages/add-todo/b.wxml ***!
  \************************************************/
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
    null,
    $toString("include")
  ));
};

/***/ }),

/***/ "./example/miniRoot/pages/todos/todos.js":
/*!***********************************************!*\
  !*** ./example/miniRoot/pages/todos/todos.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


const { Page } = self.MP;


Page(
{
  pagePath: 'pages/todos/todos',
  usingComponents: {"add-button":"/components/add-button/add-button"},
  tabIndex: 10,
  render: function() { return __webpack_require__(/*! ./todos.wxml */ "./example/miniRoot/pages/todos/todos.wxml"); },
  stylesheet: function() { return __webpack_require__(/*! ./todos.wxss */ "./example/miniRoot/pages/todos/todos.wxss"); },
});


/***/ }),

/***/ "./example/miniRoot/pages/todos/todos.wxml":
/*!*************************************************!*\
  !*** ./example/miniRoot/pages/todos/todos.wxml ***!
  \*************************************************/
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
var Image_ = self.MPUI['image'];
var Image = Image_ || $EmptyComponentFactory("image");
var CheckboxGroup_ = self.MPUI['checkbox-group'];
var CheckboxGroup = CheckboxGroup_ || $EmptyComponentFactory("checkbox-group");
var Label_ = self.MPUI['label'];
var Label = Label_ || $EmptyComponentFactory("label");
var Checkbox_ = self.MPUI['checkbox'];
var Checkbox = Checkbox_ || $EmptyComponentFactory("checkbox");
var Text_ = self.MPUI['text'];
var Text = Text_ || $EmptyComponentFactory("text");
var AddButton_ = $getComponentClass("/components/add-button/add-button");
var AddButton = AddButton_ || $EmptyComponentFactory("add-button");
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
      className: "page-todos"
    },
    [_react2.default.createElement(
      View,
      {
        className: "user"
      },
      [_react2.default.createElement(Image, {
        className: "avatar", src: $getLooseDataMember([data['user'], "avatar"]) || '../../assets/logo.png', backgroundSize: "cover"
      }), _react2.default.createElement(
        View,
        {
          className: "nickname"
        },
        [$toString($getLooseDataMember([data['user'], "nickName"]) && $getLooseDataMember([data['user'], "nickName"]) + '\'s' || 'mp'), $toString(" Todo List")]
      ), _react2.default.createElement(
        View,
        {
          className: "test"
        },
        $toString("Todo List")
      )]
    ), _react2.default.createElement(
      View,
      {
        className: "todo-items"
      },
      _react2.default.createElement(
        CheckboxGroup,
        {
          className: "todo-items-group", onChange: "onTodoChanged"
        },
        $iterate(data['todos'], function (item, index) {
          return _react2.default.createElement(
            Label,
            {
              key: item, className: "todo-item " + ($getLooseDataMember([item, "completed"]) ? 'checked' : '')
            },
            [_react2.default.createElement(Checkbox, {
              className: "todo-item-checkbox", value: $getLooseDataMember([item, "text"]), checked: $getLooseDataMember([item, "completed"])
            }), _react2.default.createElement(
              Text,
              {
                className: "todo-item-text"
              },
              $toString($getLooseDataMember([item, "text"]))
            )]
          );
        })
      )
    ), _react2.default.createElement(
      View,
      {
        className: "todo-footer"
      },
      _react2.default.createElement(AddButton, {
        text: "Add Todo", onclickme: $getComponentEventHandler(this, "addTodo"), $isCustomComponent: this.$isCustomComponent, __tag: 'add-button'
      })
    )]
  ));
};

/***/ }),

/***/ "./example/miniRoot/pages/todos/todos.wxss":
/*!*************************************************!*\
  !*** ./example/miniRoot/pages/todos/todos.wxss ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./example/miniRoot/app.wxss");
/* harmony import */ var _components_add_button_add_button_wxss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../components/add-button/add-button.wxss */ "./example/miniRoot/components/add-button/add-button.wxss");
const { StyleSheet } = self.MP;
const stylesheet = new StyleSheet({ stylePath: 'pages/todos/todos.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);

stylesheet.imports(_components_add_button_add_button_wxss__WEBPACK_IMPORTED_MODULE_1__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.page-todos {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    width: 100%;
    max-height: 100vh;
  }
  .user {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-shrink: 0;
            flex-shrink: 0;
    padding: 30px;
    color: #FFF;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .avatar {
    width: 1.3rem;
    height: 1.3rem;
    border-radius: 50%;
    background-color: #FFF;
    -webkit-align-self: center;
            align-self: center;
  }
  .nickname {
    padding-top: 0.4rem;
    text-align: center;
    font-size: 0.4rem;
    font-weight: 100;
  }
  .test {
    font-size: 20px;
  }
  .todo-items {
    -webkit-box-flex: 1;
    -webkit-flex-grow: 1;
            flex-grow: 1;
    font-size: 0.34rem;
    padding: 0.5rem 1.2rem;
    color: #0EFFD6;
    overflow: auto;
  }
  .todo-items-group {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -webkit-flex-direction: column;
            flex-direction: column;
  }
  .todo-item {
    position: relative;
    margin-bottom: 0.5rem;
    padding-left: 0.8rem;
    line-height: 0.7rem;
    height: 0.8rem;
    box-sizing: border-box;
    border: 2px solid rgb(14, 255, 214);
    border-radius: 1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-transition: border 0.2s;
    transition: border 0.2s;
  }
  .todo-item:last-child {
    margin-bottom: 0;
  }
  .todo-item::before {
    content: '';
    position: absolute;
    left: 0.12rem;
    margin-right: 0.2rem;
    width: 0.45rem;
    height: 0.45rem;
    background-color: rgba(14, 222, 255, 0.3);
    border-radius: 50%;
    top: 50%;
    -webkit-transform: translateY(-50%);
            transform: translateY(-50%);
    -webkit-transition: background-color 0.2s;
    transition: background-color 0.2s;
  }
  .todo-item::after {
    content: '';
    position: absolute;
    left: 0.29rem;
    width: 0.08rem;
    height: 0.18rem;
    top: 50%;
    -webkit-transform: translateY(-60%) rotate(38deg);
            transform: translateY(-60%) rotate(38deg);
    border: 0.04rem solid #FFF;
    border-width: 0 0.04rem 0.04rem 0;
    opacity: 0;
    -webkit-transition: opacity 0.2s;
    transition: opacity 0.2s;
  }
  .todo-item-checkbox {
    display: none;
  }
  .checked .todo-item-text {
    text-decoration: line-through;
    color: #1AA0B8;
  }
  .checked.todo-item {
    border: 2px solid rgba(14, 222, 255, 0.2);
  }
  .checked.todo-item::before {
    background-color: rgba(14, 222, 255, 0.2);
  }
  .checked.todo-item::after {
    opacity: 1;
  }
  .todo-footer {
    -webkit-flex-shrink: 0;
            flex-shrink: 0;
    padding: 0.5rem 0 1rem;
    font-size: 0.48rem;
    font-weight: 200;
    text-align: center;
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