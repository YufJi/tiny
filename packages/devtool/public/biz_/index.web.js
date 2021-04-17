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
/******/ 	return __webpack_require__(__webpack_require__.s = "./packages/example/out/index$.web.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./packages/example/out/config$.js":
/*!*****************************************!*\
  !*** ./packages/example/out/config$.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
const g = typeof global !== 'undefined' ? global : self;
g.mpAppJson = {
  "app": {
    "$homepage": "pages/todos/todos"
  }
};

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../mp-compiler/node_modules/webpack/buildin/global.js */ "./packages/mp-compiler/node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./packages/example/out/index$.web.js":
/*!********************************************!*\
  !*** ./packages/example/out/index$.web.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! @hulk/mp-compiler/lib/sjsEnvInit */ "./packages/mp-compiler/lib/sjsEnvInit.js");
__webpack_require__(/*! ./config$ */ "./packages/example/out/config$.js");
__webpack_require__(/*! ../src/app */ "./packages/example/src/app.js");
__webpack_require__(/*! ../src/components/add-button/add-button */ "./packages/example/src/components/add-button/add-button.js");
__webpack_require__(/*! ../src/pages/todos/todos */ "./packages/example/src/pages/todos/todos.js");
__webpack_require__(/*! ../src/pages/add-todo/add-todo */ "./packages/example/src/pages/add-todo/add-todo.js");


/***/ }),

/***/ "./packages/example/src/app.acss":
/*!***************************************!*\
  !*** ./packages/example/src/app.acss ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");

const stylesheet = new _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["StyleSheet"]({ stylePath: 'app.acss' });
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

/***/ "./packages/example/src/app.js":
/*!*************************************!*\
  !*** ./packages/example/src/app.js ***!
  \*************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");



if(_hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["App"]) {
  Object(_hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["App"])({
    stylesheet(){return __webpack_require__(/*! ./app.acss */ "./packages/example/src/app.acss")},
  });
}


/***/ }),

/***/ "./packages/example/src/components/add-button/add-button.acss":
/*!********************************************************************!*\
  !*** ./packages/example/src/components/add-button/add-button.acss ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");

const stylesheet = new _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["StyleSheet"]({ stylePath: 'components/add-button/add-button.acss' });
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

/***/ "./packages/example/src/components/add-button/add-button.axml":
/*!********************************************************************!*\
  !*** ./packages/example/src/components/add-button/add-button.axml ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

var _EmptyComponentFactory = __webpack_require__(/*! @hulk/rml-runtime/es/EmptyComponentFactory */ "./packages/rml-runtime/es/EmptyComponentFactory.js");

var _EmptyComponentFactory2 = _interopRequireDefault(_EmptyComponentFactory);

var _framework = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");

var _button = __webpack_require__(/*! @hulk/mp/es/button */ "./packages/mp/es/button/index.js");

var _button2 = _interopRequireDefault(_button);

var _text = __webpack_require__(/*! @hulk/mp/es/text */ "./packages/mp/es/text/index.js");

var _text2 = _interopRequireDefault(_text);

var _iterate = __webpack_require__(/*! @hulk/rml-runtime/es/iterate */ "./packages/rml-runtime/es/iterate.js");

var _iterate2 = _interopRequireDefault(_iterate);

var _createRoot = __webpack_require__(/*! @hulk/rml-runtime/es/createRoot */ "./packages/rml-runtime/es/createRoot.js");

var _createRoot2 = _interopRequireDefault(_createRoot);

var _createBlock = __webpack_require__(/*! @hulk/rml-runtime/es/createBlock */ "./packages/rml-runtime/es/createBlock.js");

var _createBlock2 = _interopRequireDefault(_createBlock);

var _useTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/useTemplate */ "./packages/rml-runtime/es/useTemplate.js");

var _useTemplate2 = _interopRequireDefault(_useTemplate);

var _createTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/createTemplate */ "./packages/rml-runtime/es/createTemplate.js");

var _createTemplate2 = _interopRequireDefault(_createTemplate);

var _renderSlot = __webpack_require__(/*! @hulk/rml-runtime/es/renderSlot */ "./packages/rml-runtime/es/renderSlot.js");

var _renderSlot2 = _interopRequireDefault(_renderSlot);

var _resolveScopedSlots = __webpack_require__(/*! @hulk/rml-runtime/es/resolveScopedSlots */ "./packages/rml-runtime/es/resolveScopedSlots.js");

var _resolveScopedSlots2 = _interopRequireDefault(_resolveScopedSlots);

var _getSJSMember = __webpack_require__(/*! @hulk/rml-runtime/es/getSJSMember */ "./packages/rml-runtime/es/getSJSMember.js");

var _getSJSMember2 = _interopRequireDefault(_getSJSMember);

var _toString = __webpack_require__(/*! @hulk/rml-runtime/es/toString */ "./packages/rml-runtime/es/toString.js");

var _toString2 = _interopRequireDefault(_toString);

var _getLooseDataMember = __webpack_require__(/*! @hulk/rml-runtime/es/getLooseDataMember */ "./packages/rml-runtime/es/getLooseDataMember.js");

var _getLooseDataMember2 = _interopRequireDefault(_getLooseDataMember);

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

var $getComponentClass = function $getComponentClass(name) {
  return _framework.getComponentClass && (0, _framework.getComponentClass)(name);
};

var Button = _button2.default || (0, _EmptyComponentFactory2.default)("button");

var Text = _text2.default || (0, _EmptyComponentFactory2.default)("text");


var $templates = {};
function render(data) {
  return (0, _createRoot2.default)(_react2.default.createElement(
    Button,
    {
      className: "add-button", hoverClass: "none", onTap: "onClickMe"
    },
    _react2.default.createElement(
      Text,
      {
        className: "add-icon"
      },
      (0, _toString2.default)("+")
    ),
    _react2.default.createElement(
      Text,
      null,
      (0, _toString2.default)(data['text'])
    )
  ));
};

/***/ }),

/***/ "./packages/example/src/components/add-button/add-button.js":
/*!******************************************************************!*\
  !*** ./packages/example/src/components/add-button/add-button.js ***!
  \******************************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");



var Component = _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["WorkerComponent"] || function(){};

Component(
{
  is: "/components/add-button/add-button",
  
  usingComponents: {"add-button":"/components/add-button/add-button"},
  render: function() { return __webpack_require__(/*! ./add-button.axml */ "./packages/example/src/components/add-button/add-button.axml"); },
  stylesheet: function() { return __webpack_require__(/*! ./add-button.acss */ "./packages/example/src/components/add-button/add-button.acss"); },
});


/***/ }),

/***/ "./packages/example/src/pages/add-todo/a.axml":
/*!****************************************************!*\
  !*** ./packages/example/src/pages/add-todo/a.axml ***!
  \****************************************************/
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

var _EmptyComponentFactory = __webpack_require__(/*! @hulk/rml-runtime/es/EmptyComponentFactory */ "./packages/rml-runtime/es/EmptyComponentFactory.js");

var _EmptyComponentFactory2 = _interopRequireDefault(_EmptyComponentFactory);

var _view = __webpack_require__(/*! @hulk/mp/es/view */ "./packages/mp/es/view/index.js");

var _view2 = _interopRequireDefault(_view);

var _iterate = __webpack_require__(/*! @hulk/rml-runtime/es/iterate */ "./packages/rml-runtime/es/iterate.js");

var _iterate2 = _interopRequireDefault(_iterate);

var _createRoot = __webpack_require__(/*! @hulk/rml-runtime/es/createRoot */ "./packages/rml-runtime/es/createRoot.js");

var _createRoot2 = _interopRequireDefault(_createRoot);

var _createBlock = __webpack_require__(/*! @hulk/rml-runtime/es/createBlock */ "./packages/rml-runtime/es/createBlock.js");

var _createBlock2 = _interopRequireDefault(_createBlock);

var _useTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/useTemplate */ "./packages/rml-runtime/es/useTemplate.js");

var _useTemplate2 = _interopRequireDefault(_useTemplate);

var _createTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/createTemplate */ "./packages/rml-runtime/es/createTemplate.js");

var _createTemplate2 = _interopRequireDefault(_createTemplate);

var _renderSlot = __webpack_require__(/*! @hulk/rml-runtime/es/renderSlot */ "./packages/rml-runtime/es/renderSlot.js");

var _renderSlot2 = _interopRequireDefault(_renderSlot);

var _resolveScopedSlots = __webpack_require__(/*! @hulk/rml-runtime/es/resolveScopedSlots */ "./packages/rml-runtime/es/resolveScopedSlots.js");

var _resolveScopedSlots2 = _interopRequireDefault(_resolveScopedSlots);

var _getSJSMember = __webpack_require__(/*! @hulk/rml-runtime/es/getSJSMember */ "./packages/rml-runtime/es/getSJSMember.js");

var _getSJSMember2 = _interopRequireDefault(_getSJSMember);

var _toString = __webpack_require__(/*! @hulk/rml-runtime/es/toString */ "./packages/rml-runtime/es/toString.js");

var _toString2 = _interopRequireDefault(_toString);

var _getLooseDataMember = __webpack_require__(/*! @hulk/rml-runtime/es/getLooseDataMember */ "./packages/rml-runtime/es/getLooseDataMember.js");

var _getLooseDataMember2 = _interopRequireDefault(_getLooseDataMember);

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

var View = _view2.default || (0, _EmptyComponentFactory2.default)("view");


var $template = void 0;
var $ownTemplates = exports.$ownTemplates = {};
$template = $ownTemplates["abc"] = function (data) {
  return _react2.default.createElement(
    View,
    null,
    (0, _toString2.default)("21212")
  );
};

$template.Component = (0, _createTemplate2.default)("abc", $template);

var $templates = {};
$templates = $ownTemplates;
function render(data) {
  return (0, _createRoot2.default)(null);
};

/***/ }),

/***/ "./packages/example/src/pages/add-todo/add-todo.acss":
/*!***********************************************************!*\
  !*** ./packages/example/src/pages/add-todo/add-todo.acss ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");

const stylesheet = new _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["StyleSheet"]({ stylePath: 'pages/add-todo/add-todo.acss' });
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

/***/ "./packages/example/src/pages/add-todo/add-todo.axml":
/*!***********************************************************!*\
  !*** ./packages/example/src/pages/add-todo/add-todo.axml ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

var _EmptyComponentFactory = __webpack_require__(/*! @hulk/rml-runtime/es/EmptyComponentFactory */ "./packages/rml-runtime/es/EmptyComponentFactory.js");

var _EmptyComponentFactory2 = _interopRequireDefault(_EmptyComponentFactory);

var _framework = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");

var _view = __webpack_require__(/*! @hulk/mp/es/view */ "./packages/mp/es/view/index.js");

var _view2 = _interopRequireDefault(_view);

var _input = __webpack_require__(/*! @hulk/mp/es/input */ "./packages/mp/es/input/index.js");

var _input2 = _interopRequireDefault(_input);

var _iterate = __webpack_require__(/*! @hulk/rml-runtime/es/iterate */ "./packages/rml-runtime/es/iterate.js");

var _iterate2 = _interopRequireDefault(_iterate);

var _createRoot = __webpack_require__(/*! @hulk/rml-runtime/es/createRoot */ "./packages/rml-runtime/es/createRoot.js");

var _createRoot2 = _interopRequireDefault(_createRoot);

var _createBlock = __webpack_require__(/*! @hulk/rml-runtime/es/createBlock */ "./packages/rml-runtime/es/createBlock.js");

var _createBlock2 = _interopRequireDefault(_createBlock);

var _useTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/useTemplate */ "./packages/rml-runtime/es/useTemplate.js");

var _useTemplate2 = _interopRequireDefault(_useTemplate);

var _createTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/createTemplate */ "./packages/rml-runtime/es/createTemplate.js");

var _createTemplate2 = _interopRequireDefault(_createTemplate);

var _renderSlot = __webpack_require__(/*! @hulk/rml-runtime/es/renderSlot */ "./packages/rml-runtime/es/renderSlot.js");

var _renderSlot2 = _interopRequireDefault(_renderSlot);

var _resolveScopedSlots = __webpack_require__(/*! @hulk/rml-runtime/es/resolveScopedSlots */ "./packages/rml-runtime/es/resolveScopedSlots.js");

var _resolveScopedSlots2 = _interopRequireDefault(_resolveScopedSlots);

var _getSJSMember = __webpack_require__(/*! @hulk/rml-runtime/es/getSJSMember */ "./packages/rml-runtime/es/getSJSMember.js");

var _getSJSMember2 = _interopRequireDefault(_getSJSMember);

var _toString = __webpack_require__(/*! @hulk/rml-runtime/es/toString */ "./packages/rml-runtime/es/toString.js");

var _toString2 = _interopRequireDefault(_toString);

var _getLooseDataMember = __webpack_require__(/*! @hulk/rml-runtime/es/getLooseDataMember */ "./packages/rml-runtime/es/getLooseDataMember.js");

var _getLooseDataMember2 = _interopRequireDefault(_getLooseDataMember);

var _a = __webpack_require__(/*! ./a.axml */ "./packages/example/src/pages/add-todo/a.axml");

var _b = __webpack_require__(/*! ./b.axml */ "./packages/example/src/pages/add-todo/b.axml");

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

var $getComponentClass = function $getComponentClass(name) {
  return _framework.getComponentClass && (0, _framework.getComponentClass)(name);
};

var View = _view2.default || (0, _EmptyComponentFactory2.default)("view");

var Input = _input2.default || (0, _EmptyComponentFactory2.default)("input");
var AddButton_ = $getComponentClass("/components/add-button/add-button");
var AddButton = AddButton_ || (0, _EmptyComponentFactory2.default)("add-button");


var $templates = {};
$templates = Object.assign({}, _a.$ownTemplates);
function render(data) {
  return (0, _createRoot2.default)(_react2.default.createElement(
    View,
    {
      className: "page-add-todo"
    },
    _b2.default.apply(this, arguments),
    _react2.default.createElement(
      View,
      {
        className: "add-todo"
      },
      _react2.default.createElement(Input, {
        className: "add-todo-input", placeholder: "What needs to be done?", onBlur: "onBlur", value: data['inputValue']
      })
    ),
    _react2.default.createElement(
      View,
      {
        ontap: $getEventHandler(this, "add")
      },
      (0, _toString2.default)("12121")
    ),
    _react2.default.createElement(
      View,
      {
        catchtap: $getEventHandler(this, "add")
      },
      (0, _toString2.default)("12121")
    ),
    _react2.default.createElement(
      View,
      {
        className: "todo-footer"
      },
      _react2.default.createElement(AddButton, {
        text: "Add Todo", onclickme: $getComponentEventHandler(this, "add"), $isCustomComponent: this.$isCustomComponent, __tag: 'add-button'
      })
    ),
    _react2.default.createElement(
      View,
      {
        style: "color: red", catchtapcapture: $getEventHandler(this, "xxxx")
      },
      (0, _toString2.default)("capture-catch:tap")
    ),
    (0, _useTemplate2.default)($templates["abc"], {
      inputValue: data['inputValue']
    }, undefined, this)
  ));
};

/***/ }),

/***/ "./packages/example/src/pages/add-todo/add-todo.js":
/*!*********************************************************!*\
  !*** ./packages/example/src/pages/add-todo/add-todo.js ***!
  \*********************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");




Object(_hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["Page"])(
{
  pagePath: 'pages/add-todo/add-todo',
  
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
  render: function() { return __webpack_require__(/*! ./add-todo.axml */ "./packages/example/src/pages/add-todo/add-todo.axml"); },
  stylesheet: function() { return __webpack_require__(/*! ./add-todo.acss */ "./packages/example/src/pages/add-todo/add-todo.acss"); },
});


/***/ }),

/***/ "./packages/example/src/pages/add-todo/b.axml":
/*!****************************************************!*\
  !*** ./packages/example/src/pages/add-todo/b.axml ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

var _EmptyComponentFactory = __webpack_require__(/*! @hulk/rml-runtime/es/EmptyComponentFactory */ "./packages/rml-runtime/es/EmptyComponentFactory.js");

var _EmptyComponentFactory2 = _interopRequireDefault(_EmptyComponentFactory);

var _view = __webpack_require__(/*! @hulk/mp/es/view */ "./packages/mp/es/view/index.js");

var _view2 = _interopRequireDefault(_view);

var _iterate = __webpack_require__(/*! @hulk/rml-runtime/es/iterate */ "./packages/rml-runtime/es/iterate.js");

var _iterate2 = _interopRequireDefault(_iterate);

var _createRoot = __webpack_require__(/*! @hulk/rml-runtime/es/createRoot */ "./packages/rml-runtime/es/createRoot.js");

var _createRoot2 = _interopRequireDefault(_createRoot);

var _createBlock = __webpack_require__(/*! @hulk/rml-runtime/es/createBlock */ "./packages/rml-runtime/es/createBlock.js");

var _createBlock2 = _interopRequireDefault(_createBlock);

var _useTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/useTemplate */ "./packages/rml-runtime/es/useTemplate.js");

var _useTemplate2 = _interopRequireDefault(_useTemplate);

var _createTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/createTemplate */ "./packages/rml-runtime/es/createTemplate.js");

var _createTemplate2 = _interopRequireDefault(_createTemplate);

var _renderSlot = __webpack_require__(/*! @hulk/rml-runtime/es/renderSlot */ "./packages/rml-runtime/es/renderSlot.js");

var _renderSlot2 = _interopRequireDefault(_renderSlot);

var _resolveScopedSlots = __webpack_require__(/*! @hulk/rml-runtime/es/resolveScopedSlots */ "./packages/rml-runtime/es/resolveScopedSlots.js");

var _resolveScopedSlots2 = _interopRequireDefault(_resolveScopedSlots);

var _getSJSMember = __webpack_require__(/*! @hulk/rml-runtime/es/getSJSMember */ "./packages/rml-runtime/es/getSJSMember.js");

var _getSJSMember2 = _interopRequireDefault(_getSJSMember);

var _toString = __webpack_require__(/*! @hulk/rml-runtime/es/toString */ "./packages/rml-runtime/es/toString.js");

var _toString2 = _interopRequireDefault(_toString);

var _getLooseDataMember = __webpack_require__(/*! @hulk/rml-runtime/es/getLooseDataMember */ "./packages/rml-runtime/es/getLooseDataMember.js");

var _getLooseDataMember2 = _interopRequireDefault(_getLooseDataMember);

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

var View = _view2.default || (0, _EmptyComponentFactory2.default)("view");


var $templates = {};
function render(data) {
  return (0, _createRoot2.default)(_react2.default.createElement(
    View,
    null,
    (0, _toString2.default)("include")
  ));
};

/***/ }),

/***/ "./packages/example/src/pages/todos/todos.acss":
/*!*****************************************************!*\
  !*** ./packages/example/src/pages/todos/todos.acss ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");

const stylesheet = new _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["StyleSheet"]({ stylePath: 'pages/todos/todos.acss' });
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

/***/ "./packages/example/src/pages/todos/todos.axml":
/*!*****************************************************!*\
  !*** ./packages/example/src/pages/todos/todos.axml ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = render;

var _react = __webpack_require__(/*! react */ "react");

var _react2 = _interopRequireDefault(_react);

var _EmptyComponentFactory = __webpack_require__(/*! @hulk/rml-runtime/es/EmptyComponentFactory */ "./packages/rml-runtime/es/EmptyComponentFactory.js");

var _EmptyComponentFactory2 = _interopRequireDefault(_EmptyComponentFactory);

var _framework = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");

var _view = __webpack_require__(/*! @hulk/mp/es/view */ "./packages/mp/es/view/index.js");

var _view2 = _interopRequireDefault(_view);

var _image = __webpack_require__(/*! @hulk/mp/es/image */ "./packages/mp/es/image/index.js");

var _image2 = _interopRequireDefault(_image);

var _checkboxGroup = __webpack_require__(/*! @hulk/mp/es/checkbox-group */ "./packages/mp/es/checkbox-group/index.js");

var _checkboxGroup2 = _interopRequireDefault(_checkboxGroup);

var _label = __webpack_require__(/*! @hulk/mp/es/label */ "./packages/mp/es/label/index.js");

var _label2 = _interopRequireDefault(_label);

var _checkbox = __webpack_require__(/*! @hulk/mp/es/checkbox */ "./packages/mp/es/checkbox/index.js");

var _checkbox2 = _interopRequireDefault(_checkbox);

var _text = __webpack_require__(/*! @hulk/mp/es/text */ "./packages/mp/es/text/index.js");

var _text2 = _interopRequireDefault(_text);

var _iterate = __webpack_require__(/*! @hulk/rml-runtime/es/iterate */ "./packages/rml-runtime/es/iterate.js");

var _iterate2 = _interopRequireDefault(_iterate);

var _createRoot = __webpack_require__(/*! @hulk/rml-runtime/es/createRoot */ "./packages/rml-runtime/es/createRoot.js");

var _createRoot2 = _interopRequireDefault(_createRoot);

var _createBlock = __webpack_require__(/*! @hulk/rml-runtime/es/createBlock */ "./packages/rml-runtime/es/createBlock.js");

var _createBlock2 = _interopRequireDefault(_createBlock);

var _useTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/useTemplate */ "./packages/rml-runtime/es/useTemplate.js");

var _useTemplate2 = _interopRequireDefault(_useTemplate);

var _createTemplate = __webpack_require__(/*! @hulk/rml-runtime/es/createTemplate */ "./packages/rml-runtime/es/createTemplate.js");

var _createTemplate2 = _interopRequireDefault(_createTemplate);

var _renderSlot = __webpack_require__(/*! @hulk/rml-runtime/es/renderSlot */ "./packages/rml-runtime/es/renderSlot.js");

var _renderSlot2 = _interopRequireDefault(_renderSlot);

var _resolveScopedSlots = __webpack_require__(/*! @hulk/rml-runtime/es/resolveScopedSlots */ "./packages/rml-runtime/es/resolveScopedSlots.js");

var _resolveScopedSlots2 = _interopRequireDefault(_resolveScopedSlots);

var _getSJSMember = __webpack_require__(/*! @hulk/rml-runtime/es/getSJSMember */ "./packages/rml-runtime/es/getSJSMember.js");

var _getSJSMember2 = _interopRequireDefault(_getSJSMember);

var _toString = __webpack_require__(/*! @hulk/rml-runtime/es/toString */ "./packages/rml-runtime/es/toString.js");

var _toString2 = _interopRequireDefault(_toString);

var _getLooseDataMember = __webpack_require__(/*! @hulk/rml-runtime/es/getLooseDataMember */ "./packages/rml-runtime/es/getLooseDataMember.js");

var _getLooseDataMember2 = _interopRequireDefault(_getLooseDataMember);

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

var $getComponentClass = function $getComponentClass(name) {
  return _framework.getComponentClass && (0, _framework.getComponentClass)(name);
};

var View = _view2.default || (0, _EmptyComponentFactory2.default)("view");

var Image = _image2.default || (0, _EmptyComponentFactory2.default)("image");

var CheckboxGroup = _checkboxGroup2.default || (0, _EmptyComponentFactory2.default)("checkbox-group");

var Label = _label2.default || (0, _EmptyComponentFactory2.default)("label");

var Checkbox = _checkbox2.default || (0, _EmptyComponentFactory2.default)("checkbox");

var Text = _text2.default || (0, _EmptyComponentFactory2.default)("text");
var AddButton_ = $getComponentClass("/components/add-button/add-button");
var AddButton = AddButton_ || (0, _EmptyComponentFactory2.default)("add-button");


var $templates = {};
function render(data) {
  return (0, _createRoot2.default)(_react2.default.createElement(
    View,
    {
      className: "page-todos"
    },
    _react2.default.createElement(
      View,
      {
        className: "user"
      },
      _react2.default.createElement(Image, {
        className: "avatar", src: (0, _getLooseDataMember2.default)([data['user'], "avatar"]) || '../../assets/logo.png', backgroundSize: "cover"
      }),
      _react2.default.createElement(
        View,
        {
          className: "nickname"
        },
        [(0, _toString2.default)((0, _getLooseDataMember2.default)([data['user'], "nickName"]) && (0, _getLooseDataMember2.default)([data['user'], "nickName"]) + '\'s' || 'mp'), (0, _toString2.default)(" Todo List")]
      ),
      _react2.default.createElement(
        View,
        {
          className: "test"
        },
        (0, _toString2.default)("Todo List")
      )
    ),
    _react2.default.createElement(
      View,
      {
        className: "todo-items"
      },
      _react2.default.createElement(
        CheckboxGroup,
        {
          className: "todo-items-group", onChange: "onTodoChanged"
        },
        (0, _iterate2.default)(data['todos'], function (item, index) {
          return _react2.default.createElement(
            Label,
            {
              key: item, className: "todo-item " + ((0, _getLooseDataMember2.default)([item, "completed"]) ? 'checked' : '')
            },
            _react2.default.createElement(Checkbox, {
              className: "todo-item-checkbox", value: (0, _getLooseDataMember2.default)([item, "text"]), checked: (0, _getLooseDataMember2.default)([item, "completed"])
            }),
            _react2.default.createElement(
              Text,
              {
                className: "todo-item-text"
              },
              (0, _toString2.default)((0, _getLooseDataMember2.default)([item, "text"]))
            )
          );
        })
      )
    ),
    _react2.default.createElement(
      View,
      {
        className: "todo-footer"
      },
      _react2.default.createElement(AddButton, {
        text: "Add Todo", onClickMe: "addTodo", $isCustomComponent: this.$isCustomComponent, __tag: 'add-button'
      })
    )
  ));
};

/***/ }),

/***/ "./packages/example/src/pages/todos/todos.js":
/*!***************************************************!*\
  !*** ./packages/example/src/pages/todos/todos.js ***!
  \***************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp/es/framework */ "./packages/mp/es/framework/index.js");




Object(_hulk_mp_es_framework__WEBPACK_IMPORTED_MODULE_0__["Page"])(
{
  pagePath: 'pages/todos/todos',
  
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
  render: function() { return __webpack_require__(/*! ./todos.axml */ "./packages/example/src/pages/todos/todos.axml"); },
  stylesheet: function() { return __webpack_require__(/*! ./todos.acss */ "./packages/example/src/pages/todos/todos.acss"); },
});


/***/ }),

/***/ "./packages/mp-compiler/lib/sjsEnvInit.js":
/*!************************************************!*\
  !*** ./packages/mp-compiler/lib/sjsEnvInit.js ***!
  \************************************************/
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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "./packages/mp-compiler/node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./packages/mp-compiler/node_modules/webpack/buildin/global.js":
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

/***/ "./packages/mp-core/es/form/mixin.js":
/*!*******************************************!*\
  !*** ./packages/mp-core/es/form/mixin.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! prop-types */ "./packages/mp-core/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_0__);

var index = 0;

function getImmutableValue(value2) {
  var value = value2;

  if (Array.isArray(value)) {
    value = value.concat();
  }

  return value;
}

function getValueFromProps(props) {
  return props[props.valueProp || 'value'];
}

/* harmony default export */ __webpack_exports__["default"] = ({
  contextTypes: {
    form: prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.any
  },
  statics: {
    isFormControl: true
  },
  getInitialState: function getInitialState() {
    var props = this.props;
    var value = getValueFromProps(props);

    if (value === true && props.$mp.tagName === 'input') {
      value = '';
    }

    this.name = this.props.name || "__unknown_for_control_".concat(++index);
    return {
      value: value
    };
  },
  getCurrentValue: function getCurrentValue() {
    if (this.props.controlled) {
      return getValueFromProps(this.props);
    }

    return this.state.value;
  },
  componentDidMount: function componentDidMount() {
    if (this.context.form) {
      var value = this.getCurrentValue();
      this.initialValue = getImmutableValue(value);
      this.context.form.registerField(this.name, this);
      this.context.form.setFieldValue(this.name, value);
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if (this.props.controlled) {
      return;
    }

    if (getValueFromProps(nextProps) !== getValueFromProps(this.props)) {
      this.setState({
        value: getValueFromProps(nextProps)
      });
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    this.updateFormValue();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.context.form) {
      this.context.form.removeField(this.name);
    }
  },
  updateFormValue: function updateFormValue() {
    if (this.context.form) {
      this.context.form.setFieldValue(this.name, this.getCurrentValue());
    }
  },
  reset: function reset() {
    var _this = this;

    if (this.props.controlled) {
      return;
    }

    this.isResetting = true;
    this.setState({
      value: getImmutableValue(this.initialValue)
    }, function () {
      _this.isResetting = false;
    });
  }
});

/***/ }),

/***/ "./packages/mp-core/es/framework/App/index.js":
/*!****************************************************!*\
  !*** ./packages/mp-core/es/framework/App/index.js ***!
  \****************************************************/
/*! exports provided: App, setCurrentPageImpl, getCurrentPageImpl, getCurrentPagesImpl, getApp, getAppImpl, getCurrentPages */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "App", function() { return App; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCurrentPageImpl", function() { return setCurrentPageImpl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCurrentPageImpl", function() { return getCurrentPageImpl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCurrentPagesImpl", function() { return getCurrentPagesImpl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return getApp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAppImpl", function() { return getAppImpl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return getCurrentPages; });
var app = {
  getCurrentPageImpl: getCurrentPageImpl
};
var currentPage;

function App() {
  return app;
}

function setCurrentPageImpl(page) {
  currentPage = page;
}

function getCurrentPageImpl() {
  return currentPage;
}

function getCurrentPagesImpl() {
  return [currentPage];
}

function getApp() {
  return app;
}

function getAppImpl() {
  return app;
}

function getCurrentPages() {
  return null;
}



/***/ }),

/***/ "./packages/mp-core/es/framework/AppRegistry/index.js":
/*!************************************************************!*\
  !*** ./packages/mp-core/es/framework/AppRegistry/index.js ***!
  \************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// app注册
var appRegistry = {};
var AppRegistry = {
  registerComponent: function registerComponent(name, factory) {
    // name即pagePath
    // factory即() => RC
    appRegistry[name] = factory;
  },
  getComponent: function getComponent(name) {
    return appRegistry[name] && appRegistry[name]();
  },
  getRunnable: function getRunnable(name) {
    return AppRegistry.getComponent(name);
  }
};
/* harmony default export */ __webpack_exports__["default"] = (AppRegistry);

/***/ }),

/***/ "./packages/mp-core/es/framework/ComponentRegistry/getComponentClass.js":
/*!******************************************************************************!*\
  !*** ./packages/mp-core/es/framework/ComponentRegistry/getComponentClass.js ***!
  \******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index */ "./packages/mp-core/es/framework/ComponentRegistry/index.js");


function getComponentClass(is) {
  return _index__WEBPACK_IMPORTED_MODULE_0__["default"].getComponent(is);
}

/* harmony default export */ __webpack_exports__["default"] = (getComponentClass);

/***/ }),

/***/ "./packages/mp-core/es/framework/ComponentRegistry/index.js":
/*!******************************************************************!*\
  !*** ./packages/mp-core/es/framework/ComponentRegistry/index.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var componentRegistry = {};
var ComponentRegistry = {
  registerComponent: function registerComponent(name, factory) {
    if (componentRegistry[name]) {
      return;
    }

    componentRegistry[name] = factory;
  },
  getComponent: function getComponent(name) {
    return componentRegistry[name] && componentRegistry[name]();
  }
};
/* harmony default export */ __webpack_exports__["default"] = (ComponentRegistry);

/***/ }),

/***/ "./packages/mp-core/es/framework/EventHub.js":
/*!***************************************************!*\
  !*** ./packages/mp-core/es/framework/EventHub.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/EventEmitter */ "./packages/mp-core/es/utils/EventEmitter.js");

/* harmony default export */ __webpack_exports__["default"] = (new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_0__["default"]());

/***/ }),

/***/ "./packages/mp-core/es/framework/Page/index.js":
/*!*****************************************************!*\
  !*** ./packages/mp-core/es/framework/Page/index.js ***!
  \*****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Page; });
/* harmony import */ var _AppRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../AppRegistry */ "./packages/mp-core/es/framework/AppRegistry/index.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/global */ "./packages/mp-core/es/framework/common/global.js");
/* harmony import */ var _legacy_PageComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../legacy/PageComponent */ "./packages/mp-core/es/framework/legacy/PageComponent.js");



function Page(setupConfig) {
  var pagePath = setupConfig.pagePath,
      tabIndex = setupConfig.tabIndex;

  if (typeof tabIndex === 'number') {
    _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].tabsConfig[pagePath] = tabIndex;
  }

  _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].pagesConfig[pagePath] = {
    system: setupConfig
  };
  _AppRegistry__WEBPACK_IMPORTED_MODULE_0__["default"].registerComponent(pagePath, function () {
    return _legacy_PageComponent__WEBPACK_IMPORTED_MODULE_2__["default"];
  });
}

/***/ }),

/***/ "./packages/mp-core/es/framework/Platform/index.js":
/*!*********************************************************!*\
  !*** ./packages/mp-core/es/framework/Platform/index.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var ua = navigator.swuserAgent || navigator.userAgent;
var ios = /iPhone|iPad/i; // android can change ua?!

var Platform = {
  OS: 'web',
  ide: ua.indexOf('IDE') > -1,
  browser: ua.indexOf('Android') > -1 ? 'android' : ua.match(ios) ? 'ios' : 'unknown'
};
/* harmony default export */ __webpack_exports__["default"] = (Platform);

/***/ }),

/***/ "./packages/mp-core/es/framework/StyleSheet/index.web.js":
/*!***************************************************************!*\
  !*** ./packages/mp-core/es/framework/StyleSheet/index.web.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_mergeArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/mergeArray */ "./packages/mp-core/es/utils/mergeArray.js");


function StyleSheet() {
  this.deps = [];
  this.style = '';
}

StyleSheet.prototype = {
  imports: function imports() {
    for (var _len = arguments.length, deps = new Array(_len), _key = 0; _key < _len; _key++) {
      deps[_key] = arguments[_key];
    }

    Object(_utils_mergeArray__WEBPACK_IMPORTED_MODULE_0__["default"])(this.deps, deps);
    return this;
  },
  exports: function exports(style) {
    this.style = style;
    return this;
  },
  toObjects: function toObjects() {
    if (this.objectArray) {
      return this.objectArray;
    } // incase recrursive


    this.objectArray = [];
    var all = [];
    this.deps.forEach(function (d) {
      var ds = d.toObjects();
      Object(_utils_mergeArray__WEBPACK_IMPORTED_MODULE_0__["default"])(all, ds);
    });
    all.push(this);
    this.objectArray = all;
    return all;
  },
  toString: function toString() {
    if (this.valueString) {
      return this.valueString;
    }

    this.valueString = this.toObjects().map(function (o) {
      return o.style;
    }).join('\n');
    return this.valueString;
  }
};
/* harmony default export */ __webpack_exports__["default"] = (StyleSheet);

/***/ }),

/***/ "./packages/mp-core/es/framework/SubPackage/index.js":
/*!***********************************************************!*\
  !*** ./packages/mp-core/es/framework/SubPackage/index.js ***!
  \***********************************************************/
/*! exports provided: loadPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadPage", function() { return loadPage; });
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/global */ "./packages/mp-core/es/framework/common/global.js");
/* harmony import */ var _utils_startsWith__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/startsWith */ "./packages/mp-core/es/utils/startsWith.js");
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/startupParams */ "./packages/mp-core/es/utils/startupParams/index.js");




function getSubPackageByPage(page) {
  var _self = self;
  var mpAppJson = _self.mpAppJson;

  if (!mpAppJson || !mpAppJson.app.subPackages) {
    return false;
  }

  var subPackages = mpAppJson.app.subPackages;

  for (var i = 0; i < subPackages.length; i++) {
    var p = subPackages[i];

    if (Object(_utils_startsWith__WEBPACK_IMPORTED_MODULE_1__["default"])(page, "".concat(p.root, "/"))) {
      return p.root;
    }
  }

  return false;
}

var packageMap = {};
var packageListeners = {};

self.bootstrapSubPackage = function (subPackage, _ref) {
  var success = _ref.success;
  packageMap[subPackage] = 1;
  success();

  if (packageListeners[subPackage]) {
    packageListeners[subPackage]();
    delete packageListeners[subPackage];
  }
};

var isWorker = typeof importScripts !== 'undefined';

function loadPackageScript(subPackage, callback) {
  var url = "/".concat(subPackage);

  if (isWorker) {
    importScripts("".concat(url, "/index.worker.js"));
    callback();
  } else {
    var script = document.createElement('script');
    script.src = "".concat(url, "/index.js");
    document.head.appendChild(script); // do not use script.onload

    packageListeners[subPackage] = callback;
  }
}

function loadPage(pagePath, doLoad) {
  var isCli = Object(_utils_startupParams__WEBPACK_IMPORTED_MODULE_2__["getStartupParams"])().mpCli;
  var subPackage = getSubPackageByPage(pagePath);

  if (subPackage) {
    var callBridge = _common_global__WEBPACK_IMPORTED_MODULE_0__["default"].bridge.call;

    if (packageMap[subPackage]) {
      doLoad();
    } else {
      var doLoadScript = function doLoadScript() {
        loadPackageScript(subPackage, function () {
          if (isWorker) {
            _common_global__WEBPACK_IMPORTED_MODULE_0__["default"].bridge.call('hideLoading');
          }

          doLoad();
        });
      };

      if (isWorker) {
        callBridge('showLoading');
      }

      if (isCli) {
        doLoadScript();
      } else {
        callBridge('loadSubPackage', {
          packages: [subPackage]
        }, doLoadScript);
      }
    }
  } else {
    doLoad();
  }
}

/***/ }),

/***/ "./packages/mp-core/es/framework/common/commonLogic.js":
/*!*************************************************************!*\
  !*** ./packages/mp-core/es/framework/common/commonLogic.js ***!
  \*************************************************************/
/*! exports provided: $global, Page, App, getApp, getCurrentPages */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./packages/mp-core/es/framework/common/global.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _global__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _Page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Page */ "./packages/mp-core/es/framework/Page/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _Page__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../App */ "./packages/mp-core/es/framework/App/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["getCurrentPages"]; });






/***/ }),

/***/ "./packages/mp-core/es/framework/common/commonUI.js":
/*!**********************************************************!*\
  !*** ./packages/mp-core/es/framework/common/commonUI.js ***!
  \**********************************************************/
/*! exports provided: StyleSheet, createComponent, getComponentClass */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _StyleSheet_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../StyleSheet/index */ "./packages/mp-core/es/framework/StyleSheet/index.web.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StyleSheet", function() { return _StyleSheet_index__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _createComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../createComponent */ "./packages/mp-core/es/framework/createComponent/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComponent", function() { return _createComponent__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ComponentRegistry/getComponentClass */ "./packages/mp-core/es/framework/ComponentRegistry/getComponentClass.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getComponentClass", function() { return _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__["default"]; });






/***/ }),

/***/ "./packages/mp-core/es/framework/common/global.js":
/*!********************************************************!*\
  !*** ./packages/mp-core/es/framework/common/global.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var $global = {
  tabsConfig: {},
  pagesConfig: {},
  currentPageConfig: null,
  currentComponentConfig: null
};
/* harmony default export */ __webpack_exports__["default"] = ($global);

/***/ }),

/***/ "./packages/mp-core/es/framework/createComponent/index.js":
/*!****************************************************************!*\
  !*** ./packages/mp-core/es/framework/createComponent/index.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createComponent; });
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! hoist-non-react-statics */ "./packages/mp-core/node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js");
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "./packages/mp-core/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../App */ "./packages/mp-core/es/framework/App/index.js");
/* harmony import */ var _utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/resolvePageUrl */ "./packages/mp-core/es/framework/utils/resolvePageUrl.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../common/global */ "./packages/mp-core/es/framework/common/global.js");
/* harmony import */ var _utils_camelCase__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/camelCase */ "./packages/mp-core/es/framework/utils/camelCase.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../Platform */ "./packages/mp-core/es/framework/Platform/index.js");
/* harmony import */ var _normalizeStyle__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./normalizeStyle */ "./packages/mp-core/es/framework/createComponent/normalizeStyle.js");
/* harmony import */ var _normalizeClassNameProps__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./normalizeClassNameProps */ "./packages/mp-core/es/framework/createComponent/normalizeClassNameProps.js");
/* harmony import */ var _mixins_PureRenderMixin__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../mixins/PureRenderMixin */ "./packages/mp-core/es/framework/mixins/PureRenderMixin.js");
/* harmony import */ var _mixins_TrackPageUpdateMixin__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../mixins/TrackPageUpdateMixin */ "./packages/mp-core/es/framework/mixins/TrackPageUpdateMixin.js");
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
















function getNormalizedSrc(source, page) {
  var src;

  if (typeof source === 'string' && source.trim()) {
    if (source.indexOf('http://') === 0 || source.indexOf('https://') === 0 || source.indexOf('file://') === 0 || source.indexOf('data:image') === 0 // base64
    || source.indexOf('myfile://') === 0 // support custom protocol of IDE
    || source.indexOf('local://') === 0 // support custom protocol of IDE
    || source.indexOf('temp://') === 0 // support custom protocol of IDE
    ) {
        src = source;
      } else {
      src = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_5__["default"])(source, page || Object(_App__WEBPACK_IMPORTED_MODULE_4__["getCurrentPageImpl"])());
      var _self = self,
          mpRuntimeConfig = _self.mpRuntimeConfig;

      if (mpRuntimeConfig && mpRuntimeConfig.contextPath) {
        src = "".concat(mpRuntimeConfig.contextPath, "/").concat(src);
      } else {
        src = "/".concat(src);
      }
    }
  }

  return src;
}

function createComponent() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _config$pure = config.pure,
      pure = _config$pure === void 0 ? true : _config$pure,
      _config$name = config.name,
      tagName = _config$name === void 0 ? '' : _config$name,
      trackPageUpdateForIOS = config.trackPageUpdateForIOS;
  return function create(WrappedComponent) {
    var mixins = pure ? [_mixins_PureRenderMixin__WEBPACK_IMPORTED_MODULE_12__["default"]] : [];

    if (_Platform__WEBPACK_IMPORTED_MODULE_9__["default"].browser === 'ios') {
      mixins.push(_mixins_TrackPageUpdateMixin__WEBPACK_IMPORTED_MODULE_13__["default"]);
    }

    var Container = create_react_class__WEBPACK_IMPORTED_MODULE_0___default()({
      displayName: "MP(".concat(tagName, ")"),
      contextTypes: {
        $page: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.any
      },
      mixins: mixins,
      getInitialState: function getInitialState() {
        this.$mp = _objectSpread({}, this.$mp, {
          bridge: _common_global__WEBPACK_IMPORTED_MODULE_6__["default"].bridge,
          getTargetForEvent: this.getTargetForEvent,
          getNormalizedStyle: this.getNormalizedStyle,
          getAriaProps: this.getAriaProps,
          getDataProps: this.getDataProps,
          getDataset: this.getDataset,
          getNormalizedEvent: this.getNormalizedEvent,
          getNormalizedSrc: getNormalizedSrc,
          tagName: tagName,
          page: this.context.$page
        });
        return {
          $style: Object(_normalizeStyle__WEBPACK_IMPORTED_MODULE_10__["default"])(this)
        };
      },
      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (this.props.style !== nextProps.style // native need recomputed
        || !_Platform__WEBPACK_IMPORTED_MODULE_9__["default"].browser && this.props.className !== nextProps.className) {
          this.setState({
            $style: Object(_normalizeStyle__WEBPACK_IMPORTED_MODULE_10__["default"])(this, nextProps)
          });
        }
      },
      isTrackPageUpdateForIOS: function isTrackPageUpdateForIOS() {
        var wrappedComponent = this.wrappedComponent;
        return trackPageUpdateForIOS || wrappedComponent && wrappedComponent.isTrackPageUpdateForIOS && wrappedComponent.isTrackPageUpdateForIOS();
      },
      getNormalizedStyle: function getNormalizedStyle(props) {
        if (props) {
          var goProps = props;

          if (typeof props === 'string') {
            goProps = {
              style: props
            };
          }

          return Object(_normalizeStyle__WEBPACK_IMPORTED_MODULE_10__["default"])(this, goProps);
        }
      },
      getAriaProps: function getAriaProps() {
        var props = this.props;
        return Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__["default"])(props).reduce(function (prev, key) {
          if (key === 'role' || key.match(/^aria[A-Z\-]/)) {
            prev[key] = props[key];
          }

          return prev;
        }, {});
      },
      getDataProps: function getDataProps() {
        var props = this.props;
        return Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__["default"])(props).reduce(function (prev, key) {
          if (key.slice(0, 5) === 'data-') {
            prev[key] = props[key];
          }

          return prev;
        }, {});
      },
      getDataset: function getDataset() {
        var props = this.props;
        var dataset = {};
        Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__["default"])(props).forEach(function (n) {
          if (n.slice(0, 5) === 'data-') {
            var key = Object(_utils_camelCase__WEBPACK_IMPORTED_MODULE_7__["default"])(n.slice(5));
            dataset[key] = props[n];
          }
        });
        return dataset;
      },
      getTargetForEvent: function getTargetForEvent() {
        var props = this.props;
        return {
          id: props.id,
          tagName: tagName,
          dataset: this.getDataset()
        };
      },
      getNormalizedEvent: function getNormalizedEvent(eventParam, other) {
        var eventType = eventParam;
        var srcEvent;

        if (eventType.eventType) {
          srcEvent = eventType.srcEvent;
          eventType = eventType.eventType;
        }

        var nativeEvent = srcEvent && srcEvent.nativeEvent || srcEvent;
        var currentTarget = this.getTargetForEvent();
        var target = nativeEvent && nativeEvent.$target || currentTarget;

        if (nativeEvent && !nativeEvent.$target) {
          nativeEvent.$target = target;
        } // bug compatibility


        target = _objectSpread({
          targetDataset: target.dataset
        }, target, {
          dataset: currentTarget.dataset
        });
        return _objectSpread({
          type: eventType,
          timeStamp: Date.now(),
          target: target,
          currentTarget: currentTarget
        }, other);
      },
      saveRef: function saveRef(c) {
        this.wrappedComponent = c;
      },
      getWrappedComponent: function getWrappedComponent() {
        return this.wrappedComponent;
      },
      $getNormalizedProps: function $getNormalizedProps() {
        var _this$props = this.props,
            slot = _this$props.slot,
            props = _objectWithoutProperties(_this$props, ["slot"]);

        props.$mp = this.$mp;
        Object(_normalizeClassNameProps__WEBPACK_IMPORTED_MODULE_11__["default"])(props);
        delete props.style;

        if (this.state.$style) {
          props.style = this.state.$style;
        } else {
          props.style = undefined;
        }

        var $numProps = this.constructor.$numProps;

        if ($numProps) {
          $numProps.forEach(function (prop) {
            if (typeof props[prop] === 'string') {
              props[prop] = parseFloat(props[prop]);
            }
          });
        }

        return props;
      },
      render: function render() {
        var props = this.$getNormalizedProps();

        if (WrappedComponent.prototype.render) {
          props.ref = this.saveRef;
        }

        return react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(WrappedComponent, props);
      }
    });
    var RetComponent = hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_1___default()(Container, WrappedComponent);
    var $numProps = [];
    var defaultProps = WrappedComponent.defaultProps;

    if (defaultProps) {
      Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__["default"])(defaultProps).forEach(function (prop) {
        if (typeof defaultProps[prop] === 'number') {
          $numProps.push(prop);
        }
      });

      if ($numProps.length) {
        RetComponent.$numProps = $numProps;
      }
    }

    return RetComponent;
  };
}

/***/ }),

/***/ "./packages/mp-core/es/framework/createComponent/normalizeClassNameProps.js":
/*!**********************************************************************************!*\
  !*** ./packages/mp-core/es/framework/createComponent/normalizeClassNameProps.js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeClassNameProps; });
function normalizeClassNameProps(props) {
  var _props$className = props.className,
      className = _props$className === void 0 ? '' : _props$className;
  var tagName = props.$mp.tagName;

  if (tagName && className.indexOf(" a-".concat(tagName)) === -1) {
    props.className = " a-".concat(tagName, " ").concat(className);
  }
}

/***/ }),

/***/ "./packages/mp-core/es/framework/createComponent/normalizeClassNameStyle.js":
/*!**********************************************************************************!*\
  !*** ./packages/mp-core/es/framework/createComponent/normalizeClassNameStyle.js ***!
  \**********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeClassNameStyle; });
function normalizeClassNameStyle(totalStyle) {
  return totalStyle;
}

/***/ }),

/***/ "./packages/mp-core/es/framework/createComponent/normalizeStyle.js":
/*!*************************************************************************!*\
  !*** ./packages/mp-core/es/framework/createComponent/normalizeStyle.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeStyle; });
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Platform */ "./packages/mp-core/es/framework/Platform/index.js");
/* harmony import */ var _utils_transformStyle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/transformStyle */ "./packages/mp-core/es/framework/utils/transformStyle.js");
/* harmony import */ var _normalizeClassNameStyle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./normalizeClassNameStyle */ "./packages/mp-core/es/framework/createComponent/normalizeClassNameStyle.js");




function parseStyle(style) {
  var styles = {};

  if (style) {
    style.split(';').filter(function (s) {
      return !!s.trim();
    }).forEach(function (rule) {
      var nameIndex = rule.indexOf(':');
      var name;
      var value;

      if (nameIndex !== -1) {
        name = rule.slice(0, nameIndex).trim();
        value = rule.slice(nameIndex + 1).trim();
        styles[name] = value;
      }
    });
  }

  return styles;
}

function normalizeStyle(component, cProps) {
  var totalStyle = [];
  var tagName = component.$mp.tagName;

  var _ref = cProps || component.props,
      style = _ref.style,
      className = _ref.className,
      id = _ref.id;

  totalStyle = Object(_normalizeClassNameStyle__WEBPACK_IMPORTED_MODULE_2__["default"])(totalStyle, component, tagName, className, id); // inline

  if (style) {
    var styleObj = style;

    if (typeof styleObj === 'string') {
      styleObj = parseStyle(styleObj.trim());
    }

    totalStyle.push(Object(_utils_transformStyle__WEBPACK_IMPORTED_MODULE_1__["default"])(styleObj));
  }

  if (_Platform__WEBPACK_IMPORTED_MODULE_0__["default"].OS === 'web') {
    if (totalStyle.length) {
      totalStyle = Object.assign.apply(undefined, [{}].concat(totalStyle));
    } else {
      totalStyle = undefined;
    }
  } else if (!totalStyle.length) {
    totalStyle = undefined;
  }

  return totalStyle;
}

/***/ }),

/***/ "./packages/mp-core/es/framework/index.js":
/*!************************************************!*\
  !*** ./packages/mp-core/es/framework/index.js ***!
  \************************************************/
/*! exports provided: WorkerComponent, getComponentClass, StyleSheet, createComponent, Page, App, getApp, getCurrentPages, $global */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index/index */ "./packages/mp-core/es/framework/index/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WorkerComponent", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["WorkerComponent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getComponentClass", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["getComponentClass"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StyleSheet", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["StyleSheet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComponent", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["createComponent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["Page"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["getCurrentPages"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _index_index__WEBPACK_IMPORTED_MODULE_0__["$global"]; });




/***/ }),

/***/ "./packages/mp-core/es/framework/index/index.js":
/*!******************************************************!*\
  !*** ./packages/mp-core/es/framework/index/index.js ***!
  \******************************************************/
/*! exports provided: WorkerComponent, StyleSheet, createComponent, getComponentClass, Page, App, getApp, getCurrentPages, $global */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/env */ "./packages/mp-core/es/framework/utils/env.js");
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_utils_env__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _web_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../web/bootstrap */ "./packages/mp-core/es/framework/web/bootstrap.js");
/* harmony import */ var _web_WorkerComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../web/WorkerComponent */ "./packages/mp-core/es/framework/web/WorkerComponent.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WorkerComponent", function() { return _web_WorkerComponent__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _common_commonUI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../common/commonUI */ "./packages/mp-core/es/framework/common/commonUI.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StyleSheet", function() { return _common_commonUI__WEBPACK_IMPORTED_MODULE_3__["StyleSheet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComponent", function() { return _common_commonUI__WEBPACK_IMPORTED_MODULE_3__["createComponent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getComponentClass", function() { return _common_commonUI__WEBPACK_IMPORTED_MODULE_3__["getComponentClass"]; });

/* harmony import */ var _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../common/commonLogic */ "./packages/mp-core/es/framework/common/commonLogic.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["Page"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["getCurrentPages"]; });

/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../common/global */ "./packages/mp-core/es/framework/common/global.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _common_global__WEBPACK_IMPORTED_MODULE_5__["default"]; });









/***/ }),

/***/ "./packages/mp-core/es/framework/legacy/CustomComponent.js":
/*!*****************************************************************!*\
  !*** ./packages/mp-core/es/framework/legacy/CustomComponent.js ***!
  \*****************************************************************/
/*! exports provided: setComponentsConfig, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setComponentsConfig", function() { return setComponentsConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return WorkerComponent; });
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ComponentRegistry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ComponentRegistry */ "./packages/mp-core/es/framework/ComponentRegistry/index.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../EventHub */ "./packages/mp-core/es/framework/EventHub.js");
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../utils/setData */ "./packages/mp-core/es/utils/setData.js");
/* harmony import */ var _mixins_PureRenderMixin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../mixins/PureRenderMixin */ "./packages/mp-core/es/framework/mixins/PureRenderMixin.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../App */ "./packages/mp-core/es/framework/App/index.js");
/* harmony import */ var _utils_transformChildrenToSlots__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/transformChildrenToSlots */ "./packages/mp-core/es/framework/utils/transformChildrenToSlots.js");
/* harmony import */ var _utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/normalizeComponentProps */ "./packages/mp-core/es/framework/utils/normalizeComponentProps.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/consts */ "./packages/mp-core/es/utils/consts.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }











var componentId = 1;
var mountedComponents;
var unmountedComponents;
reset();

function reset() {
  mountedComponents = [];
  unmountedComponents = [];
}

_EventHub__WEBPACK_IMPORTED_MODULE_2__["default"].addListener(['pageReady', 'pageUpdate'], function (e) {
  var _objectSpread2;

  e.payload = _objectSpread({}, e.payload, {}, (_objectSpread2 = {}, _defineProperty(_objectSpread2, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PayloadKeyMountedComponents"], mountedComponents), _defineProperty(_objectSpread2, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PayloadKeyUnmountedComponents"], unmountedComponents), _objectSpread2));
  reset();
});
var componentsConfig = {};
var eventReg = /^on[A-Z]/;
function setComponentsConfig(_componentsConfig) {
  componentsConfig = _componentsConfig;
}
function WorkerComponent(setupConfig) {
  var ComponentClass;
  var is = setupConfig.is;
  _ComponentRegistry__WEBPACK_IMPORTED_MODULE_1__["default"].registerComponent(is, function () {
    if (ComponentClass) {
      return ComponentClass;
    }

    var _render = setupConfig.render;
    var render;

    function getRender() {
      if (render) {
        return render;
      } // lazy require xml and css


      render = _render();
      render = render.default || render;
      return render;
    }

    var componentConfig;

    function getComponentConfig() {
      if (componentConfig) {
        return componentConfig;
      }

      componentConfig = componentsConfig[is] || {};
      return componentConfig;
    }

    ComponentClass = create_react_class__WEBPACK_IMPORTED_MODULE_0___default()({
      displayName: is,
      statics: {
        isCustomComponent: 1,
        is: is
      },
      mixins: [_mixins_PureRenderMixin__WEBPACK_IMPORTED_MODULE_4__["default"]],
      getDefaultProps: function getDefaultProps() {
        return getComponentConfig().props || {};
      },
      getInitialState: function getInitialState() {
        this.is = is; // async render twice

        this.id = this.id || ++componentId;
        Object(_App__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"])().componentInstances[this.id] = this;
        this.eventHandlers = {};
        this.componentEventHandlers = {};
        return {
          data: _objectSpread({}, getComponentConfig().data)
        };
      },
      componentDidMount: function componentDidMount() {
        this.recordMounted(this.diffProps(getComponentConfig().props || {}), true);
      },
      componentDidUpdate: function componentDidUpdate(prevProps) {
        var diffProps = this.diffProps(prevProps);

        if (diffProps) {
          this.recordMounted(diffProps);
        } else {
          mountedComponents.push(_defineProperty({}, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyId"], this.id));
        }
      },
      componentWillUnmount: function componentWillUnmount() {
        delete Object(_App__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"])().componentInstances[this.id];
        unmountedComponents.push(this.id);
      },
      recordMounted: function recordMounted(diffProps, init) {
        var info = _defineProperty({}, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyId"], this.id);

        if (init) {
          info[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyIs"]] = is;
        }

        mountedComponents.push(info);

        if (diffProps) {
          var _this$normalizeProps = this.normalizeProps(diffProps),
              newProps = _this$normalizeProps.newProps,
              ownerId = _this$normalizeProps.ownerId;

          info[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyDiffProps"]] = newProps;

          if (ownerId) {
            info[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyOwnerId"]] = ownerId;
          }
        }
      },
      diffProps: function diffProps(prevProps) {
        var props = this.props;
        var deleted = [];
        var updated = {};
        var isUpdated;
        var isDeleted;
        Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__["default"])(Object(_utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_7__["default"])(prevProps)).forEach(function (prevKey) {
          if (!(prevKey in props)) {
            deleted.push(prevKey);
            isDeleted = true;
          } else if (prevProps[prevKey] !== props[prevKey]) {
            updated[prevKey] = props[prevKey];
            isUpdated = true;
          }
        });
        Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__["default"])(Object(_utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_7__["default"])(props)).forEach(function (key) {
          if (!(key in prevProps)) {
            updated[key] = props[key];
            isUpdated = true;
          }
        });
        var ret;

        if (isUpdated) {
          ret = ret || {};
          ret[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyUpdated"]] = updated;
        }

        if (isDeleted) {
          ret = ret || {};
          ret[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyDeleted"]] = deleted;
        }

        return ret;
      },
      normalizeProps: function normalizeProps(props) {
        var newProps = {};

        if (props[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyDeleted"]]) {
          newProps[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyDeleted"]] = props[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyDeleted"]];
        }

        var ownerId;

        if (props[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyUpdated"]]) {
          var updated = newProps[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyUpdated"]] = _objectSpread({}, props[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["DiffKeyUpdated"]]);

          Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_8__["default"])(updated).forEach(function (p) {
            if (p.match(eventReg) && updated[p]) {
              ownerId = updated[p][_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyOwnerId"]];
              updated[p] = updated[p][_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyName"]];
            }
          });
        }

        return {
          ownerId: ownerId,
          newProps: newProps
        };
      },
      $getEventHandler: function $getEventHandler(name) {
        var _this = this;

        if (!name || typeof name !== 'string') {
          return name;
        }

        var eventHandlers = this.eventHandlers;

        if (!eventHandlers[name]) {
          var handle = eventHandlers[name] = function () {
            var _getCurrentPageImpl;

            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            (_getCurrentPageImpl = Object(_App__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"])()).callRemote.apply(_getCurrentPageImpl, ['self', 'triggerComponentEvent', _this.id, name].concat(args));
          };

          handle.handleName = name;
          handle.type = 'component';
          handle.id = this.id;
        }

        return eventHandlers[name];
      },
      $getRefHandler: function $getRefHandler() {
        var _getCurrentPageImpl2;

        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        return (_getCurrentPageImpl2 = Object(_App__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"])()).$getRefHandler.apply(_getCurrentPageImpl2, args);
      },
      $getComponentEventHandler: function $getComponentEventHandler(name) {
        if (!name || typeof name !== 'string') {
          // need json transfer to worker
          return name;
        }

        var componentEventHandlers = this.componentEventHandlers;

        if (!componentEventHandlers[name]) {
          var _componentEventHandle;

          componentEventHandlers[name] = (_componentEventHandle = {}, _defineProperty(_componentEventHandle, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyName"], name), _defineProperty(_componentEventHandle, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyOwnerId"], this.id), _componentEventHandle);
        }

        return componentEventHandlers[name];
      },
      setData: function setData(toBeData, callback) {
        var data = this.state.data;
        var ret = data;

        if (Array.isArray(toBeData)) {
          toBeData.forEach(function (d) {
            // immutable for shouldComponentUpdate
            ret = Object(_utils_setData__WEBPACK_IMPORTED_MODULE_3__["getOpFn"])(d.op)(ret, d.data);
          });
        } else {
          ret = Object(_utils_setData__WEBPACK_IMPORTED_MODULE_3__["getOpFn"])(toBeData.op)(ret, toBeData.data);
        }

        this.setState({
          data: ret
        }, callback);
      },
      render: function render() {
        var props = Object(_utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_7__["default"])(this.props);
        props.$slots = Object(_utils_transformChildrenToSlots__WEBPACK_IMPORTED_MODULE_6__["default"])(this.props.children);
        props.$scopedSlots = this.props.$scopedSlots;
        return getRender().call(this, _objectSpread({
          $id: this.id
        }, props, {}, this.state.data));
      }
    });
    return ComponentClass;
  });
}

/***/ }),

/***/ "./packages/mp-core/es/framework/legacy/PageComponent.js":
/*!***************************************************************!*\
  !*** ./packages/mp-core/es/framework/legacy/PageComponent.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../mixins/MessageHandleMixin */ "./packages/mp-core/es/framework/mixins/MessageHandleMixin.js");
/* harmony import */ var _mixins_RefMixin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../mixins/RefMixin */ "./packages/mp-core/es/framework/mixins/RefMixin.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../App */ "./packages/mp-core/es/framework/App/index.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../EventHub */ "./packages/mp-core/es/framework/EventHub.js");
/* harmony import */ var _CustomComponent__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./CustomComponent */ "./packages/mp-core/es/framework/legacy/CustomComponent.js");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../utils/addEvents */ "./packages/mp-core/es/utils/addEvents.js");
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/consts */ "./packages/mp-core/es/utils/consts.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../utils/setData */ "./packages/mp-core/es/utils/setData.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../utils/log */ "./packages/mp-core/es/utils/log.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../common/global */ "./packages/mp-core/es/framework/common/global.js");
/* harmony import */ var _utils_unit__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../utils/unit */ "./packages/mp-core/es/framework/utils/unit.js");
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../Platform */ "./packages/mp-core/es/framework/Platform/index.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

















var renderCache = {};
var styleSheetCaches = {};

function getStyleSheet(pagePath) {
  if (pagePath in styleSheetCaches) {
    return styleSheetCaches[pagePath];
  }

  var setupConfig = _common_global__WEBPACK_IMPORTED_MODULE_13__["default"].pagesConfig[pagePath].system;
  var _stylesheet = setupConfig.stylesheet;

  if (_stylesheet) {
    _stylesheet = _stylesheet();
  }

  var stylesheet = _stylesheet && (_stylesheet.default || _stylesheet);
  styleSheetCaches[pagePath] = stylesheet;
  return stylesheet;
}

function getRender(pagePath) {
  if (pagePath in renderCache) {
    return renderCache[pagePath];
  }

  var setupConfig = _common_global__WEBPACK_IMPORTED_MODULE_13__["default"].pagesConfig[pagePath].system;
  var _render = setupConfig.render; // lazy require xml and css

  var render = _render();

  render = render.default || render;
  renderCache[pagePath] = render;
  return render;
}

var onReachBottomDistance = 50;
var headNode = document.getElementsByTagName('head')[0]; // special for 1rpx or 2rpx

var remReg = Object(_utils_unit__WEBPACK_IMPORTED_MODULE_14__["rpx2px"])(2) < 1 ? /\b0\.0[12]rem/g : Object(_utils_unit__WEBPACK_IMPORTED_MODULE_14__["rpx2px"])(1) < 1 ? /\b0\.01rem/g : null;
var replacer = _Platform__WEBPACK_IMPORTED_MODULE_15__["default"].browser === 'ios' ? '0.5px' : '1px';
var logNum = 0;
/* harmony default export */ __webpack_exports__["default"] = (create_react_class__WEBPACK_IMPORTED_MODULE_2___default()({
  displayName: 'PageComponent',
  mixins: [_mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_3__["default"], _mixins_RefMixin__WEBPACK_IMPORTED_MODULE_4__["default"]],
  getInitialState: function getInitialState() {
    this.pagePath = this.props.pagePath;
    this.pageType = 'RENDER';
    return {};
  },
  componentDidMount: function componentDidMount() {
    var stylesheet = getStyleSheet(this.pagePath);

    if (stylesheet) {
      var styleNode = document.createElement('style');
      styleNode.type = 'text/css';
      var styleString = stylesheet.toString();

      if (remReg) {
        styleString = styleString.replace(remReg, replacer);
      }

      styleNode.innerHTML = styleString;
      headNode.appendChild(styleNode);
    }

    Object.assign(this, {
      bridge: _common_global__WEBPACK_IMPORTED_MODULE_13__["default"].bridge,
      renderSeq: 1,
      eventHandlers: {},
      componentEventHandlers: {},
      componentInstances: {},
      self: this,
      publicInstance: {}
    });
    Object(_App__WEBPACK_IMPORTED_MODULE_5__["setCurrentPageImpl"])(this); // for IDE and debug

    self.$page = this;
    this.initMessageChannel();
    _EventHub__WEBPACK_IMPORTED_MODULE_6__["default"].emit('pageLoad', {
      page: this
    });
  },
  // componentWillUnmount() {
  //   never unmount
  // },
  componentWillUpdate: function componentWillUpdate() {
    this.renderSeq += 1;
  },
  logRenderTime: function logRenderTime(now) {
    this.callRemote('self', 'console', 'log', "framework: render ".concat(this.pagePath, " costs ").concat(Date.now() - now, "ms."));
  },
  startRender: function startRender(remoteConfig) {
    var _this = this;

    var data = remoteConfig.data,
        _remoteConfig$publicI = remoteConfig.publicInstance,
        publicInstance = _remoteConfig$publicI === void 0 ? {} : _remoteConfig$publicI,
        id = remoteConfig.id,
        isRefresh = remoteConfig.isRefresh,
        componentsConfig = remoteConfig.componentsConfig;
    this.publicInstance = publicInstance;
    Object(_CustomComponent__WEBPACK_IMPORTED_MODULE_7__["setComponentsConfig"])(componentsConfig);
    this.setId(id);
    var now = Date.now();
    this.setState({
      data: data
    }, function () {
      _this.logRenderTime(now);

      var e = {
        page: _this
      };
      _EventHub__WEBPACK_IMPORTED_MODULE_6__["default"].emit('pageReady', e);

      if (isRefresh) {
        if (e.payload) {
          _this.callRemote('self', 'update', e.payload);
        }
      } else {
        _this.callRemote('self', 'ready', e.payload);
      }

      if (publicInstance.onReachBottom || publicInstance.onPageScroll) {
        Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_8__["default"])(window, {
          scroll: _this.checkScroll
        });
      }
    });
  },
  checkScroll: function checkScroll() {
    var _window = window,
        innerHeight = _window.innerHeight,
        pageYOffset = _window.pageYOffset;
    var scrollHeight = document.body.scrollHeight;

    if (this.publicInstance.onPageScroll) {
      this.callRemote('self', 'onPageScroll', {
        scrollTop: pageYOffset,
        scrollHeight: scrollHeight
      });
    }

    if (this.publicInstance.onReachBottom && pageYOffset > 0) {
      var closeBottom = scrollHeight - (innerHeight + pageYOffset) <= onReachBottomDistance;

      if (closeBottom) {
        if (!this.shouldNotFireOnReachBottom) {
          this.shouldNotFireOnReachBottom = true;
          this.callRemote('self', 'onReachBottom');
        }
      } else {
        this.shouldNotFireOnReachBottom = false;
      }
    }
  },
  $getEventHandler: function $getEventHandler(name) {
    var _this = this;

    if (!name || typeof name !== 'string') {
      return name;
    }

    if (!this.eventHandlers[name]) {
      var handle = this.eventHandlers[name] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this.callRemote.apply(_this, ['self', 'onRenderEvent', name].concat(args));
      };

      handle.handleName = name;
      handle.type = 'page';
      handle.id = this.id;
    }

    return this.eventHandlers[name];
  },
  $getComponentEventHandler: function $getComponentEventHandler(name) {
    var _componentEventHandle;

    if (!name || typeof name !== 'string') {
      // need json transfer to worker
      return name;
    }

    var componentEventHandlers = this.componentEventHandlers;

    if (componentEventHandlers[name]) {
      return componentEventHandlers[name];
    }

    componentEventHandlers[name] = (_componentEventHandle = {}, _defineProperty(_componentEventHandle, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyName"], name), _defineProperty(_componentEventHandle, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyOwnerId"], 1), _componentEventHandle);
    return componentEventHandlers[name];
  },
  receiveData: function receiveData(toBeData, callback) {
    var _this = this;

    if (!toBeData.length) {
      return callback();
    }

    var pageData = [];
    var componentInstances = this.componentInstances;
    var componentsData = {};
    toBeData.forEach(function (toData) {
      var type = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyType"]];
      var data = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyData"]];
      var id = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyId"]];
      var op = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyOp"]] || _utils_consts__WEBPACK_IMPORTED_MODULE_9__["OpSet"];

      if (type === _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingValuePage"]) {
        pageData.push({
          data: data,
          op: op
        });
      } else if (type === _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingValueComponent"] && componentInstances[id]) {
        componentsData[id] = componentsData[id] || [];
        componentsData[id].push({
          data: data,
          op: op
        });
      }
    });

    var doIt = function doIt() {
      var count = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_10__["default"])(componentsData).length + (pageData.length ? 1 : 0);
      var c = 0;
      var now = Date.now();
      var unmountedChecked = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_10__["default"])(componentsData);
      var allKeys = unmountedChecked.concat();
      var pageComponent = _this;

      function done() {
        if (c < 0) {
          return;
        }

        var doneComponent = this;

        if (doneComponent === pageComponent) {
          ++c;
        }

        for (var l = unmountedChecked.length - 1; l >= 0; l--) {
          var id = unmountedChecked[l];
          var currentComponent = componentInstances[id];

          if (!currentComponent || currentComponent === doneComponent) {
            ++c;
            unmountedChecked.splice(l, 1);
          }
        }

        if (c === count) {
          c = -1;
          pageComponent.onPageUpdate(now, callback);
        }
      }

      allKeys.forEach(function (id) {
        // if unmounted, will not trigger setState callback
        componentInstances[id].setData(componentsData[id], done);
      });

      if (pageData.length) {
        _this.setData(pageData, done);
      }
    };

    if (react_dom__WEBPACK_IMPORTED_MODULE_0___default.a.unstable_batchedUpdates) {
      react_dom__WEBPACK_IMPORTED_MODULE_0___default.a.unstable_batchedUpdates(doIt);
    } else {
      doIt();
    }
  },
  onPageUpdate: function onPageUpdate(now, callback) {
    this.logRenderTime(now);
    var e = {
      page: this
    };
    _EventHub__WEBPACK_IMPORTED_MODULE_6__["default"].emit('pageUpdate', e);

    if (e.payload) {
      this.callRemote('self', 'update', e.payload);
    }

    if (callback) {
      callback();
    }
  },
  setData: function setData(toBeData, callback) {
    var data = this.state.data;
    var ret = data;
    toBeData.forEach(function (d) {
      // immutable for shouldComponentUpdate
      ret = Object(_utils_setData__WEBPACK_IMPORTED_MODULE_11__["getOpFn"])(d.op)(ret, d.data);
    });
    this.setState({
      data: ret
    }, callback);
  },
  initMessageChannel: function initMessageChannel() {
    var messageChannel = this.props.messageChannel;
    messageChannel.onMessage(this.onMessage);
  },
  postMessage: function postMessage(data) {
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_12__["debug"])('framework', "[RENDER] Page ".concat(this.pagePath, " postMessage"), data);
    var messageChannel = this.props.messageChannel;
    messageChannel.postMessage(_objectSpread({}, data, {
      pageType: this.pageType,
      msgType: 'endpoint'
    }));
  },
  getRootNode: function getRootNode() {
    return this.root;
  },
  saveRoot: function saveRoot(root) {
    this.root = root;
  },
  render: function render() {
    var state = this.state;

    if (!state || !state.data) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", {
        dangerouslySetInnerHTML: {
          __html: this.props.container.innerHTML
        }
      });
    } // does not need scroll-view like react-native
    // container is scroll-view
    // when prerender, window.innerHeight is accurate when render actually.
    // can not set overflow: hidden, mate7 can not scroll.


    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_1___default.a.StrictMode, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement("div", {
      className: "a-page tiny-page",
      ref: this.saveRoot
    }, getRender(this.pagePath).call(this, state.data)));
  }
}));

/***/ }),

/***/ "./packages/mp-core/es/framework/mixins/BasicEventMixin.js":
/*!*****************************************************************!*\
  !*** ./packages/mp-core/es/framework/mixins/BasicEventMixin.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BasicEventMixin; });
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../utils/addEvents */ "./packages/mp-core/es/utils/addEvents.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




function defaultCreateTouchList() {
  var touchList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var list = [].slice.call(touchList, 0);
  return list.map(function (item) {
    return {
      clientX: item.clientX,
      clientY: item.clientY,
      identifier: item.identifier,
      pageX: item.pageX,
      pageY: item.pageY
    };
  });
}

function callBubbleEvent(instance, eventType, srcEvent, more) {
  var EventType = eventType.charAt(0).toUpperCase() + eventType.slice(1);
  var catchHandler = instance.props["catch".concat(EventType)];
  var e = instance.props.$mp.getNormalizedEvent({
    eventType: eventType,
    srcEvent: srcEvent
  }, more);
  e.currentTarget = _objectSpread({}, e.currentTarget, {}, instance.getTargetForEvent());

  if (catchHandler && srcEvent.stopPropagation) {
    srcEvent.stopPropagation();
    catchHandler(e);
    return;
  }

  var onHandler = instance.props["on".concat(EventType)];

  if (onHandler) {
    onHandler(e);
  }
}

function defaultCreateTap(nativeEvent) {
  var detail = {};

  if (nativeEvent) {
    nativeEvent = nativeEvent.nativeEvent || nativeEvent;

    if ('pageX' in nativeEvent) {
      detail.pageX = nativeEvent.pageX;
      detail.pageY = nativeEvent.pageY;
    }

    if ('clientX' in nativeEvent) {
      detail.clientX = nativeEvent.clientX;
      detail.clientY = nativeEvent.clientY;
    } else if ('pageX' in detail) {
      detail.clientX = detail.pageX - window.pageXOffset;
      detail.clientY = detail.pageY - window.pageYOffset;
    }
  }

  return {
    detail: detail
  };
}

function detachScroll(instance) {
  if (instance.detachScrollEvent) {
    instance.detachScrollEvent.remove();
    instance.detachScrollEvent = null;
  }
}

function attachScroll(instance) {
  var disableScroll = instance.props.disableScroll;
  var detachScrollEvent = instance.detachScrollEvent;
  var __basicEventRoot = instance.__basicEventRoot;

  if (!__basicEventRoot) {
    return;
  }

  if (!disableScroll && detachScrollEvent) {
    return detachScroll(instance);
  }

  if (disableScroll && !detachScrollEvent) {
    instance.detachScrollEvent = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_1__["default"])(instance.__basicEventRoot, {
      touchmove: function touchmove(e) {
        e.preventDefault();
      }
    });
  }
}

function BasicEventMixin() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$createTouchList = _ref.createTouchList,
      createTouchList = _ref$createTouchList === void 0 ? defaultCreateTouchList : _ref$createTouchList,
      _ref$createTap = _ref.createTap,
      createTap = _ref$createTap === void 0 ? defaultCreateTap : _ref$createTap;

  return {
    componentDidMount: function componentDidMount() {
      this.__basicEventRoot = react_dom__WEBPACK_IMPORTED_MODULE_0___default.a.findDOMNode(this);
      attachScroll(this);
    },
    componentDidUpdate: function componentDidUpdate() {
      attachScroll(this);
    },
    componentWillUnmount: function componentWillUnmount() {
      detachScroll(this);
    },
    recordTarget: function recordTarget(srcEvent) {
      var nativeEvent = srcEvent && srcEvent.nativeEvent;

      if (nativeEvent && !nativeEvent.$target) {
        nativeEvent.$target = this.getTargetForEvent();
      }
    },
    getTargetForEvent: function getTargetForEvent() {
      var props = this.props;
      var __basicEventRoot = this.__basicEventRoot;
      return _objectSpread({}, props.$mp.getTargetForEvent(), {
        offsetLeft: __basicEventRoot.offsetLeft,
        offsetTop: __basicEventRoot.offsetTop
      });
    },
    hasBubbleEvent: function hasBubbleEvent(event) {
      return this.props["on".concat(event)] || this.props["catch".concat(event)];
    },
    onTap: function onTap(srcEvent) {
      this.recordTarget(srcEvent); // ios also trigger onTap after onLongTap

      if (this.__longTapTriggered) {
        return;
      }

      if (this.hasBubbleEvent('Tap')) {
        callBubbleEvent(this, 'tap', srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
      }
    },
    onTouchStart: function onTouchStart(srcEvent) {
      this.recordTarget(srcEvent);
      this.__longTapTriggered = 0;

      if (this.hasBubbleEvent('TouchStart')) {
        callBubbleEvent(this, 'touchStart', srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches)
        });
      }
    },
    onTouchMove: function onTouchMove(srcEvent) {
      this.recordTarget(srcEvent);

      if (this.hasBubbleEvent('TouchMove')) {
        callBubbleEvent(this, 'touchMove', srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches)
        });
      }
    },
    onTransitionEnd: function onTransitionEnd(srcEvent) {
      this.recordTarget(srcEvent);

      if (this.hasBubbleEvent('TransitionEnd')) {
        callBubbleEvent(this, 'transitionEnd', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            propertyName: srcEvent.propertyName
          }
        });
      }
    },
    onAnimationStart: function onAnimationStart(srcEvent) {
      this.recordTarget(srcEvent);

      if (this.hasBubbleEvent('AnimationStart')) {
        callBubbleEvent(this, 'animationStart', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName
          }
        });
      }
    },
    onAnimationIteration: function onAnimationIteration(srcEvent) {
      this.recordTarget(srcEvent);

      if (this.hasBubbleEvent('AnimationIteration')) {
        callBubbleEvent(this, 'animationIteration', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName
          }
        });
      }
    },
    onAnimationEnd: function onAnimationEnd(srcEvent) {
      this.recordTarget(srcEvent);

      if (this.hasBubbleEvent('AnimationEnd')) {
        callBubbleEvent(this, 'animationEnd', srcEvent, {
          detail: {
            elapsedTime: srcEvent.elapsedTime,
            animationName: srcEvent.animationName
          }
        });
      }
    },
    onTouchEnd: function onTouchEnd(srcEvent) {
      this.recordTarget(srcEvent);

      if (this.hasBubbleEvent('TouchEnd')) {
        callBubbleEvent(this, 'touchEnd', srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches)
        });
      }
    },
    onTouchCancel: function onTouchCancel(srcEvent) {
      this.recordTarget(srcEvent);

      if (this.hasBubbleEvent('TouchCancel')) {
        callBubbleEvent(this, 'touchCancel', srcEvent, {
          touches: createTouchList.call(this, srcEvent.touches),
          changedTouches: createTouchList.call(this, srcEvent.changedTouches)
        });
      }
    },
    onLongTap: function onLongTap(srcEvent) {
      this.__longTapTriggered = 1;

      if (this.hasBubbleEvent('LongTap')) {
        callBubbleEvent(this, 'longTap', srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
      }
    }
  };
}

/***/ }),

/***/ "./packages/mp-core/es/framework/mixins/MessageHandleMixin.js":
/*!********************************************************************!*\
  !*** ./packages/mp-core/es/framework/mixins/MessageHandleMixin.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/log */ "./packages/mp-core/es/utils/log.js");


function noop() {}

var MessageHandle = {
  getCallbackId: function getCallbackId() {
    this.callbackSeq = this.callbackSeq || 0;
    this.callbackSeq += 2;
    return this.callbackSeq;
  },
  setId: function setId(id) {
    this.id = id;
  },
  getId: function getId() {
    return this.id;
  },
  getPagePath: function getPagePath() {
    return this.pagePath;
  },
  onMessage: function onMessage(event) {
    var _this = this;

    if (this.unloaded) {
      return;
    }

    var data = event.data;

    if (typeof data === 'string') {
      data = JSON.parse(data).data;
    }

    var _data = data,
        method = _data.method,
        args = _data.args,
        caller = _data.caller,
        successCallback = _data.successCallback,
        errorCallback = _data.errorCallback;

    if (caller !== 'bridge' || method !== 'console') {
      Object(_utils_log__WEBPACK_IMPORTED_MODULE_0__["debug"])('framework', "[".concat(this.pageType, "] Page ").concat(this.pagePath, " onMessage"), data);
    }

    var callPath = caller && caller.split('.') || [];
    var callObj = this;
    callPath.forEach(function (p) {
      callObj = callObj && callObj[p];
    });

    if (callObj) {
      if (!args) {
        Object(_utils_log__WEBPACK_IMPORTED_MODULE_0__["debug"])('framework', "[".concat(this.pageType, "] Page ").concat(this.pagePath, " unhandled message"), event.data);
        return;
      }

      var myArgs = args.concat();

      if (successCallback) {
        myArgs.push(function () {
          for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
            a[_key] = arguments[_key];
          }

          _this.callRemote.apply(_this, ['self', 'invokeCallback', successCallback].concat(a));
        });
      } else {
        myArgs.push(noop);
      }

      if (errorCallback) {
        myArgs.push(function () {
          for (var _len2 = arguments.length, a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            a[_key2] = arguments[_key2];
          }

          _this.callRemote.apply(_this, ['self', 'invokeCallback', errorCallback].concat(a));
        });
      } else {
        myArgs.push(noop);
      }

      if (callObj[method]) {
        var _callObj;

        (_callObj = callObj)[method].apply(_callObj, myArgs);

        return;
      }
    }

    Object(_utils_log__WEBPACK_IMPORTED_MODULE_0__["debug"])('framework', "[".concat(this.pageType, "] Page ").concat(this.pagePath, " unhandled message"), event.data);
  },
  invokeCallback: function invokeCallback(callbackId) {
    if (this.unloaded) {
      return;
    }

    var callbacks = this.callbacks;

    if (callbacks) {
      if (callbackId && callbacks[callbackId]) {
        for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
          args[_key3 - 1] = arguments[_key3];
        }

        callbacks[callbackId].apply(callbacks, args);
      }

      if (callbackId % 2 === 0) {
        callbackId -= 1;
      } // success and error


      delete callbacks[callbackId];
      delete callbacks[callbackId + 1];
    }
  },
  callRemote: function callRemote(caller, method) {
    if (this.unloaded) {
      return;
    }

    var successCallback;
    var errorCallback;

    for (var _len4 = arguments.length, args = new Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
      args[_key4 - 2] = arguments[_key4];
    }

    if (typeof args[args.length - 2] === 'function') {
      this.callbacks = this.callbacks || {};
      successCallback = this.getCallbackId() - 1;
      this.callbacks[successCallback] = args[args.length - 2];
      errorCallback = successCallback + 1;
      this.callbacks[errorCallback] = args[args.length - 1];
      args.pop();
      args.pop();
    } else if (typeof args[args.length - 1] === 'function') {
      this.callbacks = this.callbacks || {};
      successCallback = this.getCallbackId() - 1;
      this.callbacks[successCallback] = args[args.length - 1];
      errorCallback = successCallback + 1;
      args.pop();
    }

    this.postMessage({
      caller: caller,
      method: method,
      id: this.getId(),
      successCallback: successCallback,
      errorCallback: errorCallback,
      args: args
    });
  }
};
/* harmony default export */ __webpack_exports__["default"] = (MessageHandle);

/***/ }),

/***/ "./packages/mp-core/es/framework/mixins/PureRenderMixin.js":
/*!*****************************************************************!*\
  !*** ./packages/mp-core/es/framework/mixins/PureRenderMixin.js ***!
  \*****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_shallowEqual__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/shallowEqual */ "./packages/mp-core/es/utils/shallowEqual.js");

var PureRender = {
  shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
    return !Object(_utils_shallowEqual__WEBPACK_IMPORTED_MODULE_0__["default"])(nextProps, this.props) || !Object(_utils_shallowEqual__WEBPACK_IMPORTED_MODULE_0__["default"])(nextState, this.state);
  }
};
/* harmony default export */ __webpack_exports__["default"] = (PureRender);

/***/ }),

/***/ "./packages/mp-core/es/framework/mixins/RefMixin.js":
/*!**********************************************************!*\
  !*** ./packages/mp-core/es/framework/mixins/RefMixin.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var Ref = {
  getInitialState: function getInitialState() {
    this.refHandlers = {};
    this.refComponents = {};
    return {};
  },
  $getRefHandler: function $getRefHandler(name) {
    var _this = this;

    if (this.refHandlers[name]) {
      return this.refHandlers[name];
    }

    this.refHandlers[name] = function (ref) {
      var c = ref;

      if (c && c.getWrappedComponent) {
        c = c.getWrappedComponent();
      }

      _this.refComponents[name] = c;
    };

    return this.refHandlers[name];
  }
};
/* harmony default export */ __webpack_exports__["default"] = (Ref);

/***/ }),

/***/ "./packages/mp-core/es/framework/mixins/TrackPageUpdateMixin.js":
/*!**********************************************************************!*\
  !*** ./packages/mp-core/es/framework/mixins/TrackPageUpdateMixin.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../EventHub */ "./packages/mp-core/es/framework/EventHub.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../App */ "./packages/mp-core/es/framework/App/index.js");



function needReLayout(instance) {
  var tagName = instance.$mp.tagName;
  var _self = self;
  var NATIVE_COMPONENTS_AUTO_ADJUST = _self.NATIVE_COMPONENTS_AUTO_ADJUST;
  return !(NATIVE_COMPONENTS_AUTO_ADJUST && tagName in NATIVE_COMPONENTS_AUTO_ADJUST);
}

var TrackPageUpdate = {
  componentDidMount: function componentDidMount() {
    var _this = this;

    if (this.isTrackPageUpdateForIOS()) {
      this.renderSeq = Object(_App__WEBPACK_IMPORTED_MODULE_1__["getCurrentPageImpl"])().renderSeq;
      this.detachPageUpdate = _EventHub__WEBPACK_IMPORTED_MODULE_0__["default"].addListener('pageUpdate', function () {
        if (needReLayout(_this) && _this.renderSeq !== Object(_App__WEBPACK_IMPORTED_MODULE_1__["getCurrentPageImpl"])().renderSeq) {
          _this.forceUpdate();
        }
      });
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    if (this.isTrackPageUpdateForIOS()) {
      this.renderSeq = Object(_App__WEBPACK_IMPORTED_MODULE_1__["getCurrentPageImpl"])().renderSeq;
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.isTrackPageUpdateForIOS()) {
      this.detachPageUpdate.remove();
    }
  }
};
/* harmony default export */ __webpack_exports__["default"] = (TrackPageUpdate);

/***/ }),

/***/ "./packages/mp-core/es/framework/startupParams/index.js":
/*!**************************************************************!*\
  !*** ./packages/mp-core/es/framework/startupParams/index.js ***!
  \**************************************************************/
/*! exports provided: getStartupParams, setStartupParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/startupParams */ "./packages/mp-core/es/utils/startupParams/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__["setStartupParams"]; });




/***/ }),

/***/ "./packages/mp-core/es/framework/utils/camelCase.js":
/*!**********************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/camelCase.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return camelCase; });
function camelCase(name) {
  return name.replace(/-(\w)/g, function (_w, g) {
    return g.toUpperCase();
  });
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/env.js":
/*!****************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/env.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {if (!global.Symbol) {
  var id = 0;

  var _Symbol = function _Symbol2(key) {
    return "$$_mp_symbol_".concat(key, "_").concat(++id, "_$$");
  };

  _Symbol.iterator = _Symbol('Symbol.iterator');
  global.Symbol = _Symbol;
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../mp-compiler/node_modules/webpack/buildin/global.js */ "./packages/mp-compiler/node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/filterCssValue.js":
/*!***************************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/filterCssValue.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return filterCssValue; });
/* harmony import */ var _unit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./unit */ "./packages/mp-core/es/framework/utils/unit.js");
/* harmony import */ var _isNumber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isNumber */ "./packages/mp-core/es/framework/utils/isNumber.js");



function normalizeCssValueWeb(_value) {
  var value = _value;

  if (typeof value === 'string') {
    value = value.replace(/\b([.\d]+)rpx\b/gi, function (_m, v) {
      return "".concat(Object(_unit__WEBPACK_IMPORTED_MODULE_0__["rpx"])(parseFloat(v)));
    });

    if (Object(_isNumber__WEBPACK_IMPORTED_MODULE_1__["default"])(value)) {
      return parseFloat(value);
    }
  }

  return value;
}

function filterCssValue(name, style) {
  var ret = {};
  ret[name] = normalizeCssValueWeb(style[name]);
  return ret;
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/isNumber.js":
/*!*********************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/isNumber.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return isNumber; });
var numberReSnippet = '(?:NaN|-?(?:(?:\\d+|\\d*\\.\\d+)(?:[E|e][+|-]?\\d+)?|Infinity))';
var matchOnlyNumberRe = new RegExp("^(".concat(numberReSnippet, ")$"));
function isNumber(str) {
  return !!str.trim().match(matchOnlyNumberRe);
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/normalizeComponentProps.js":
/*!************************************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/normalizeComponentProps.js ***!
  \************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeComponentProps; });
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function normalizeComponentProps(props) {
  var children = props.children,
      $scopedSlots = props.$scopedSlots,
      slot = props.slot,
      ret = _objectWithoutProperties(props, ["children", "$scopedSlots", "slot"]);

  return ret;
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/pageInfoAndUrl.js":
/*!***************************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/pageInfoAndUrl.js ***!
  \***************************************************************/
/*! exports provided: getUrlFromPageInfo, getPageInfoFromUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getUrlFromPageInfo", function() { return getUrlFromPageInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPageInfoFromUrl", function() { return getPageInfoFromUrl; });
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/global */ "./packages/mp-core/es/framework/common/global.js");

var pageMatchReg = /#([^?]+)(\?.+)?/;
var MP_PAGE_ID = '__mpPageId';
var pageIdMatch = new RegExp("[&?]".concat(MP_PAGE_ID, "=(\\d+)(?:&|$)"));
function getUrlFromPageInfo(_ref) {
  var pagePath = _ref.pagePath,
      pageId = _ref.pageId,
      queryString = _ref.queryString;
  return "#".concat(pagePath, "?").concat(MP_PAGE_ID, "=").concat(pageId).concat(queryString ? "&".concat(queryString) : '');
}
function getPageInfoFromUrl(url) {
  var id;
  var pageMatch = url && url.match(pageMatchReg);
  var pagePath = pageMatch && pageMatch[1];

  if (pagePath && pagePath.charAt(0) === '/') {
    pagePath = pagePath.slice(1);
  }

  var queryString = pageMatch && pageMatch[2] || '';
  var idMatch = queryString.match(pageIdMatch);

  if (idMatch) {
    id = parseInt(idMatch[1], 10);
    queryString = queryString.replace(pageIdMatch, '');
  }

  if (queryString.charAt(0) === '?') {
    queryString = queryString.slice(1);
  }

  id = id || _common_global__WEBPACK_IMPORTED_MODULE_0__["default"].tabsConfig[pagePath] || 0;
  return {
    id: id,
    pagePath: pagePath,
    queryString: queryString
  };
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/resolvePageUrl.js":
/*!***************************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/resolvePageUrl.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return resolvePageUrl; });
/* harmony import */ var _resolveUrl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resolveUrl */ "./packages/mp-core/es/framework/utils/resolveUrl.js");

function resolvePageUrl(pagePath, currentPage) {
  var url = pagePath;
  var queryString = '';
  var queryIndex = url.indexOf('?');

  if (queryIndex !== -1) {
    queryString = url.slice(queryIndex + 1);
    url = url.slice(0, queryIndex);
  }

  if (url.charAt(0) === '/') {
    url = url.slice(1);
  } else if (currentPage) {
    var refer = currentPage.getPagePath();
    url = Object(_resolveUrl__WEBPACK_IMPORTED_MODULE_0__["default"])(url, refer);
  }

  queryString = queryString ? "?".concat(queryString) : queryString;
  return "".concat(url).concat(queryString);
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/resolveUrl.js":
/*!***********************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/resolveUrl.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return resolveUrl; });
/* harmony import */ var _utils_startsWith__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../utils/startsWith */ "./packages/mp-core/es/utils/startsWith.js");

function resolveUrl(path, refered) {
  if (Object(_utils_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(path, '/')) {
    return path;
  }

  if (!Object(_utils_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(path, './') && !Object(_utils_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(path, '../')) {
    path = "./".concat(path);
  }

  var referedParts = refered.split('/');

  if (referedParts[referedParts.length - 1]) {
    referedParts.pop();
  }

  var parts = referedParts.concat(path.split('/'));
  var res = [];
  parts.forEach(function (p) {
    // ignore empty parts
    if (!p || p === '.') {
      return;
    }

    if (p === '..') {
      res.pop();
    } else {
      res.push(p);
    }
  });
  return res.join('/');
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/ruleTransform.js":
/*!**************************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/ruleTransform.js ***!
  \**************************************************************/
/*! exports provided: ruleName, ruleValue, needNormalizeCssValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ruleName", function() { return ruleName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ruleValue", function() { return ruleValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "needNormalizeCssValue", function() { return needNormalizeCssValue; });
/* harmony import */ var css_vendor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! css-vendor */ "./packages/mp-core/node_modules/css-vendor/dist/css-vendor.esm.js");

function ruleName(v) {
  return Object(css_vendor__WEBPACK_IMPORTED_MODULE_0__["supportedProperty"])(v);
}
function ruleValue(n, v) {
  return Object(css_vendor__WEBPACK_IMPORTED_MODULE_0__["supportedValue"])(n, v);
}
function needNormalizeCssValue(property) {
  return property.indexOf('flex') !== -1 || property.indexOf('display') !== -1;
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/transformChildrenToSlots.js":
/*!*************************************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/transformChildrenToSlots.js ***!
  \*************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return transformChildrenToSlots; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function transformChildrenToSlots(children) {
  var slots = {};
  react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.forEach(children, function (c) {
    var slot = c && c.props && c.props.slot || '$default';
    var holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/transformStyle.js":
/*!***************************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/transformStyle.js ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return transformStyle; });
/* harmony import */ var _camelCase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./camelCase */ "./packages/mp-core/es/framework/utils/camelCase.js");
/* harmony import */ var _filterCssValue__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./filterCssValue */ "./packages/mp-core/es/framework/utils/filterCssValue.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");
/* harmony import */ var _ruleTransform__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ruleTransform */ "./packages/mp-core/es/framework/utils/ruleTransform.js");




function transformStyle(style) {
  var d = {};
  Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_2__["default"])(style).forEach(function (name) {
    var expanded = Object(_filterCssValue__WEBPACK_IMPORTED_MODULE_1__["default"])(name, style);

    if (expanded === false) {
      return;
    }

    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_2__["default"])(expanded).forEach(function (key) {
      var v = expanded[key];
      var property = Object(_ruleTransform__WEBPACK_IMPORTED_MODULE_3__["ruleName"])(Object(_camelCase__WEBPACK_IMPORTED_MODULE_0__["default"])(key)); // color #xxx -> rgb()

      if (property) {
        d[property] = Object(_ruleTransform__WEBPACK_IMPORTED_MODULE_3__["needNormalizeCssValue"])(property) ? Object(_ruleTransform__WEBPACK_IMPORTED_MODULE_3__["ruleValue"])(property, v) : v;
      }
    });
  });
  return d;
}

/***/ }),

/***/ "./packages/mp-core/es/framework/utils/unit.js":
/*!*****************************************************!*\
  !*** ./packages/mp-core/es/framework/utils/unit.js ***!
  \*****************************************************/
/*! exports provided: rpx, rpx2px, px */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rpx", function() { return rpx; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rpx2px", function() { return rpx2px; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "px", function() { return px; });
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Platform */ "./packages/mp-core/es/framework/Platform/index.js");

var isIOS = _Platform__WEBPACK_IMPORTED_MODULE_0__["default"].browser === 'ios';
var clientWidth = document.documentElement.clientWidth;
function rpx(v) {
  var value = rpx2px(v);

  if (value > 0 && value < 1) {
    value = isIOS ? 0.5 : 1;
  } else {
    value = Math.floor(value);
  }

  return "".concat(value, "px");
}
function rpx2px(v) {
  return v / 750 * clientWidth;
}
function px(v) {
  return "".concat(v, "px");
}

/***/ }),

/***/ "./packages/mp-core/es/framework/web/WorkerComponent.js":
/*!**************************************************************!*\
  !*** ./packages/mp-core/es/framework/web/WorkerComponent.js ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return WorkerComponent; });
/* harmony import */ var _legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../legacy/CustomComponent */ "./packages/mp-core/es/framework/legacy/CustomComponent.js");

function WorkerComponent(setupConfig) {
  return Object(_legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_0__["default"])(setupConfig);
}

/***/ }),

/***/ "./packages/mp-core/es/framework/web/bootstrap.js":
/*!********************************************************!*\
  !*** ./packages/mp-core/es/framework/web/bootstrap.js ***!
  \********************************************************/
/*! exports provided: render */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../utils/log */ "./packages/mp-core/es/utils/log.js");
/* harmony import */ var _AppRegistry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../AppRegistry */ "./packages/mp-core/es/framework/AppRegistry/index.js");
/* harmony import */ var _utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/pageInfoAndUrl */ "./packages/mp-core/es/framework/utils/pageInfoAndUrl.js");
/* harmony import */ var _getMessageChannel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./getMessageChannel */ "./packages/mp-core/es/framework/web/getMessageChannel.js");
/* harmony import */ var _SubPackage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../SubPackage */ "./packages/mp-core/es/framework/SubPackage/index.js");







var g = self;

function noop() {}

function render(config, bridge) {
  var _config$container = config.container,
      container = _config$container === void 0 ? document.getElementById('root') : _config$container,
      _config$onRender = config.onRender,
      onRender = _config$onRender === void 0 ? noop : _config$onRender,
      _config$onFail = config.onFail,
      onFail = _config$onFail === void 0 ? noop : _config$onFail,
      type = config.type;
  var pageInfo = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__["getPageInfoFromUrl"])(location.href);
  Object(_utils_log__WEBPACK_IMPORTED_MODULE_2__["debug"])('framework', 'pageInfo', pageInfo);
  var pagePath = pageInfo.pagePath;

  if (pagePath) {
    document.documentElement.style.fontSize = "".concat(100 * document.documentElement.clientWidth / 750, "px");
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_6__["loadPage"])(pagePath, function () {
      var PageComponent = _AppRegistry__WEBPACK_IMPORTED_MODULE_3__["default"].getComponent(pagePath);

      if (PageComponent) {
        console.log('framework: Render page', pagePath);

        if (onRender) {
          onRender(type);
        }

        var messageChannel = Object(_getMessageChannel__WEBPACK_IMPORTED_MODULE_5__["default"])(pageInfo, bridge);
        react_dom__WEBPACK_IMPORTED_MODULE_0___default.a.render(react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement(PageComponent, {
          pagePath: pagePath,
          container: container,
          messageChannel: messageChannel
        }), container);
      } else {
        var error = new Error("page '".concat(pagePath, "' not found!"));
        error.type = 'PAGE_NOT_FOUND';

        if (onFail) {
          onFail(error);
        }
      }
    });
  } else {
    react_dom__WEBPACK_IMPORTED_MODULE_0___default.a.unmountComponentAtNode(container);
  }
}

/***/ }),

/***/ "./packages/mp-core/es/framework/web/getMessageChannel.js":
/*!****************************************************************!*\
  !*** ./packages/mp-core/es/framework/web/getMessageChannel.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getMessageChannel; });
var g = self;
function getMessageChannel(pageInfo, bridge) {
  var unhandledMessages = [];
  var callback;
  g.addEventListener('message', function (event) {
    if (callback) {
      callback(event);
    } else {
      unhandledMessages.push(event);
    }
  });
  var queryString = pageInfo.queryString,
      id = pageInfo.id,
      pagePath = pageInfo.pagePath;
  var payload = {
    msgType: 'DOMContentLoaded',
    pageType: 'RENDER',
    pagePath: pagePath,
    viewId: g.APVIEWID,
    id: id,
  };

  if (queryString) {
    payload.queryString = queryString;
  }

  bridge.call('postMessage', payload);
  return {
    id: id,
    postMessage: function postMessage(data) {
      bridge.call('postMessage', data);
    },
    onMessage: function onMessage(fn) {
      callback = fn;

      if (unhandledMessages.length) {
        unhandledMessages.forEach(function (message) {
          fn(message);
        });
        unhandledMessages = [];
      }
    }
  };
}

/***/ }),

/***/ "./packages/mp-core/es/mixins/BasicEventMixin.js":
/*!*******************************************************!*\
  !*** ./packages/mp-core/es/mixins/BasicEventMixin.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/mixins/BasicEventMixin */ "./packages/mp-core/es/framework/mixins/BasicEventMixin.js");

/* harmony default export */ __webpack_exports__["default"] = (_framework_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./packages/mp-core/es/text/Text.js":
/*!******************************************!*\
  !*** ./packages/mp-core/es/text/Text.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../mixins/BasicEventMixin */ "./packages/mp-core/es/mixins/BasicEventMixin.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




var test;
var cache = {};

function getLiteralText(text) {
  if (cache[text]) {
    return cache[text];
  }

  if (!test) {
    test = document.createElement('div');
  }

  test.innerHTML = text;
  cache[text] = test.textContent;
  return cache[text];
}

var validSpace = {
  ensp: 1,
  emsp: 1
};

function transformSpace(str, o) {
  if (validSpace[o]) {
    return str.replace(/ /g, getLiteralText("&".concat(o, ";")));
  }

  return str;
}

var keys = ['&nbsp;', '&lt;', '&gt;', '&amp;', '&apos;', '&ensp;', '&emsp;'];
var replaceEncodeReg = new RegExp(keys.join('|'), 'g');

function decodeStr(str) {
  return str.replace(replaceEncodeReg, function (m) {
    return getLiteralText(m);
  });
}

/* harmony default export */ __webpack_exports__["default"] = (create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'Text',
  mixins: [Object(_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_2__["default"])()],
  render: function render() {
    var _props = this.props;
    var children = _props.children;
    var style = _props.style;
    var selectable = _props.selectable;
    var id = _props.id;
    var space = _props.space;
    var decode = _props.decode;
    var _props2 = this.props;
    var _props2$className = _props2.className;
    var className = _props2$className === undefined ? '' : _props2$className;
    var numberOfLines = _props2.numberOfLines;

    var retStyle = _objectSpread({
      WebkitUserSelect: selectable ? 'text' : 'none'
    }, style);

    className += " a-text-".concat(space ? '' : 'no', "-space");

    if (typeof numberOfLines === 'string') {
      numberOfLines = parseInt(numberOfLines, 10);
    }

    if (numberOfLines > 0) {
      retStyle = _objectSpread({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical'
      }, retStyle);
    }

    var nodes;
    nodes = [];
    react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.forEach(children, function (c) {
      if (typeof c === 'string') {
        if (decode) {
          c = decodeStr(c);
        }

        if (space && space !== 'nbsp') {
          c = transformSpace(c, space);
        } // compatible


        c = c.replace(/\\n/g, '\n');
      }

      nodes.push(c);
    });
    var clickable = {};

    if (this.props.onTap || this.props.catchTap) {
      clickable = {
        'data-clickable': true
      };
    }

    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('span', _objectSpread({
      className: className,
      onClick: this.onTap,
      style: retStyle,
      id: id
    }, clickable, {}, this.props.$mp.getAriaProps()), nodes);
  }
}));

/***/ }),

/***/ "./packages/mp-core/es/text/index.js":
/*!*******************************************!*\
  !*** ./packages/mp-core/es/text/index.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework_index_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/index/index */ "./packages/mp-core/es/framework/index/index.js");
/* harmony import */ var _Text__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Text */ "./packages/mp-core/es/text/Text.js");


/* harmony default export */ __webpack_exports__["default"] = (Object(_framework_index_index__WEBPACK_IMPORTED_MODULE_0__["createComponent"])({
  name: 'text'
})(_Text__WEBPACK_IMPORTED_MODULE_1__["default"]));

/***/ }),

/***/ "./packages/mp-core/es/utils/EventEmitter.js":
/*!***************************************************!*\
  !*** ./packages/mp-core/es/utils/EventEmitter.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return EventEmitter; });
/* harmony import */ var _gerror__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gerror */ "./packages/mp-core/es/utils/gerror.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }



var EventEmitter = /*#__PURE__*/function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);

    this.allListeners = {};
  }

  _createClass(EventEmitter, [{
    key: "_addListener",
    value: function _addListener(_types, listener) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _this = this;

      var types = _types;

      if (!Array.isArray(types)) {
        types = [types];
      }

      var allListeners = this.allListeners;
      types.forEach(function (type) {
        var fns = allListeners[type] = allListeners[type] || [];

        if (fns.indexOf(listener) !== -1) {
          return;
        }

        if (options.prepend) {
          fns.unshift(listener);
        } else {
          fns.push(listener);
        }
      });
      return {
        remove: function remove() {
          _this.removeListener(types, listener);
        }
      };
    }
  }, {
    key: "addListener",
    value: function addListener(types, listener) {
      return this._addListener(types, listener);
    }
  }, {
    key: "prependListener",
    value: function prependListener(types, listener) {
      return this._addListener(types, listener, {
        prepend: true
      });
    }
  }, {
    key: "listeners",
    value: function listeners(type) {
      return type ? this.allListeners[type] || [] : this.allListeners;
    }
  }, {
    key: "listenerCount",
    value: function listenerCount(type) {
      if (type) {
        return this.listeners(type).length;
      } else {
        var allListeners = this.allListeners;
        var keys = Object.keys(allListeners);
        var count = 0;

        for (var i = 0, l = keys.length; i < l; i++) {
          var key = keys[i];
          count += allListeners[key] && allListeners[key].length || 0;
        }

        return count;
      }
    }
  }, {
    key: "emit",
    value: function emit(_types) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var types = _types;

      if (!Array.isArray(types)) {
        types = [types];
      }

      var loopListeners = _objectSpread({}, this.allListeners);

      types.forEach(function (type) {
        var fns = loopListeners[type];

        if (fns) {
          fns.concat().forEach(function (f) {
            try {
              f.apply(undefined, args);
            } catch (e) {
              Object(_gerror__WEBPACK_IMPORTED_MODULE_0__["default"])(e);
            }
          });
        }
      });
    }
  }, {
    key: "removeListener",
    value: function removeListener(_types, listener) {
      var types = _types;

      if (!Array.isArray(types)) {
        types = [types];
      }

      var allListeners = this.allListeners;
      types.forEach(function (type) {
        var fns = allListeners[type];

        if (fns) {
          if (listener) {
            var index = fns.indexOf(listener);

            if (index !== -1) {
              fns.splice(index, 1);
            }
          } else {
            delete allListeners[type];
          }
        }
      });
    }
  }, {
    key: "on",
    value: function on() {
      this.addListener.apply(this, arguments);
    }
  }, {
    key: "off",
    value: function off() {
      this.removeListener.apply(this, arguments);
    }
  }]);

  return EventEmitter;
}();



/***/ }),

/***/ "./packages/mp-core/es/utils/addEvents.js":
/*!************************************************!*\
  !*** ./packages/mp-core/es/utils/addEvents.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return addEvents; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");

function addEvents(target, fns) {
  var names = Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(fns);
  names.forEach(function (name) {
    target.addEventListener(name, fns[name]);
  });
  return {
    remove: function remove() {
      names.forEach(function (name) {
        target.removeEventListener(name, fns[name]);
      });
    }
  };
}

/***/ }),

/***/ "./packages/mp-core/es/utils/consts.js":
/*!*********************************************!*\
  !*** ./packages/mp-core/es/utils/consts.js ***!
  \*********************************************/
/*! exports provided: PendingKeyType, PendingKeyId, PendingKeyData, PendingKeyOp, PendingValuePage, PendingValueComponent, OpSet, OpSplice, PayloadKeyMountedComponents, PayloadKeyUnmountedComponents, ComponentKeyId, ComponentKeyIs, ComponentKeyDiffProps, ComponentKeyOwnerId, DiffKeyUpdated, DiffKeyDeleted, ComponentKeyName */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PendingKeyType", function() { return PendingKeyType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PendingKeyId", function() { return PendingKeyId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PendingKeyData", function() { return PendingKeyData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PendingKeyOp", function() { return PendingKeyOp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PendingValuePage", function() { return PendingValuePage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PendingValueComponent", function() { return PendingValueComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OpSet", function() { return OpSet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "OpSplice", function() { return OpSplice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PayloadKeyMountedComponents", function() { return PayloadKeyMountedComponents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PayloadKeyUnmountedComponents", function() { return PayloadKeyUnmountedComponents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentKeyId", function() { return ComponentKeyId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentKeyIs", function() { return ComponentKeyIs; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentKeyDiffProps", function() { return ComponentKeyDiffProps; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentKeyOwnerId", function() { return ComponentKeyOwnerId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiffKeyUpdated", function() { return DiffKeyUpdated; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiffKeyDeleted", function() { return DiffKeyDeleted; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentKeyName", function() { return ComponentKeyName; });
var PendingKeyType = 't';
var PendingKeyId = 'i';
var PendingKeyData = 'd';
var PendingKeyOp = 'o';
var PendingValuePage = 1;
var PendingValueComponent = 2;
var OpSet = 1;
var OpSplice = 2;
var PayloadKeyMountedComponents = 'm';
var PayloadKeyUnmountedComponents = 'u';
var ComponentKeyId = 'i';
var ComponentKeyIs = 's';
var ComponentKeyDiffProps = 'd';
var ComponentKeyOwnerId = 'o';
var DiffKeyUpdated = 'u';
var DiffKeyDeleted = 'e';
var ComponentKeyName = 'n'; // const consts = {
//   PendingKeyType,
//   PendingKeyId,
//   PendingKeyData,
//   PendingKeyOp,
//   PendingValuePage,
//   PendingValueComponent,
//   OpSet,
//   OpSplice,
//   PayloadKeyMountedComponents,
//   PayloadKeyUnmountedComponents,
//   ComponentKeyId,
//   ComponentKeyIs,
//   ComponentKeyDiffProps,
//   ComponentKeyOwnerId,
//   DiffKeyUpdated,
//   DiffKeyDeleted,
//   ComponentKeyName,
// };
// export default consts;

/***/ }),

/***/ "./packages/mp-core/es/utils/debounce.js":
/*!***********************************************!*\
  !*** ./packages/mp-core/es/utils/debounce.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return debounce; });
function debounce(func, wait, options) {
  var lastArgs;
  var lastThis;
  var maxWait;
  var result;
  var timerId;
  var lastCallTime;
  var lastInvokeTime = 0;
  var leading = false;
  var maxing = false;
  var trailing = true; // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.

  var useRAF = !wait && wait !== 0 && typeof requestAnimationFrame === 'function';
  wait = +wait || 0;

  if (options) {
    leading = options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
    trailing = 'trailing' in options ? options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs;
    var thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function startTimer(pendingFunc, localWait) {
    if (useRAF) {
      return requestAnimationFrame(pendingFunc);
    }

    return setTimeout(pendingFunc, localWait);
  }

  function cancelTimer(id) {
    if (useRAF) {
      return cancelAnimationFrame(id);
    }

    clearTimeout(id);
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time; // Start the timer for the trailing edge.

    timerId = startTimer(timerExpired, wait); // Invoke the leading edge.

    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime;
    var timeSinceLastInvoke = time - lastInvokeTime;
    var timeWaiting = wait - timeSinceLastCall;
    return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime;
    var timeSinceLastInvoke = time - lastInvokeTime; // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.

    return lastCallTime === undefined || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
  }

  function timerExpired() {
    var time = Date.now();

    if (shouldInvoke(time)) {
      return trailingEdge(time);
    } // Restart the timer.


    timerId = startTimer(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined; // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }

    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId);
    }

    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function pending() {
    return timerId !== undefined;
  }

  var debounced = function debounced() {
    var time = Date.now();
    var isInvoking = shouldInvoke(time);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }

      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }

    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait);
    }

    return result;
  };

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/gerror.js":
/*!*********************************************!*\
  !*** ./packages/mp-core/es/utils/gerror.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return gerror; });
var g = self;
function gerror(e) {
  if (!e.message) {
    e = new Error(e);
  }

  if (g.onerror) {
    g.onerror(e.message, e.sourceURL, e.line, e.column, e);
  } else {
    console.error(e);
  }
}

/***/ }),

/***/ "./packages/mp-core/es/utils/getData.js":
/*!**********************************************!*\
  !*** ./packages/mp-core/es/utils/getData.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return get; });
/* harmony import */ var _stringToPath__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./stringToPath */ "./packages/mp-core/es/utils/stringToPath.js");

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * get(object, 'a[0].b.c');
 * // => 3
 *
 */

function get(object, path) {
  if (object) {
    path = Object(_stringToPath__WEBPACK_IMPORTED_MODULE_0__["default"])(path);
    var index = 0;
    var _path = path,
        length = _path.length;

    while (object && index < length) {
      object = object[path[index++]];
    }

    return index && index === length ? object : undefined;
  }

  return object;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/isDebug.js":
/*!**********************************************!*\
  !*** ./packages/mp-core/es/utils/isDebug.js ***!
  \**********************************************/
/*! exports provided: isDebug, isDebugFramework, isDebugSupported */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDebug", function() { return isDebug; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDebugFramework", function() { return isDebugFramework; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDebugSupported", function() { return isDebugSupported; });
/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startupParams */ "./packages/mp-core/es/utils/startupParams/index.js");

var debugMatchCache = {};
function isDebug() {
  return !!Object(_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])().debug;
}
function isDebugFramework() {
  return isDebugSupported('framework');
}
function isDebugSupported(type) {
  var isMatch = debugMatchCache[type];

  if (isMatch === undefined) {
    var _getStartupParams = Object(_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])();

    var debug = _getStartupParams.debug;

    if (debug) {
      debugMatchCache[type] = isMatch = !!debug.match(new RegExp("\\b".concat(type, "\\b")));
    }
  }

  return isMatch;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/isNodeVisible.js":
/*!****************************************************!*\
  !*** ./packages/mp-core/es/utils/isNodeVisible.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return isNodeVisible; });
// 判断两个矩阵是否相交
var isRectIntersect = function isRectIntersect(rect1, rect2, appearOffset) {
  var newLeft = Math.max(rect1.left - appearOffset, rect2.left);
  var newTop = Math.max(rect1.top - appearOffset, rect2.top);
  var newRight = Math.min(rect1.right, rect2.right);
  var newBottom = Math.min(rect1.bottom, rect2.bottom);
  return !(newLeft > newRight || newTop > newBottom);
};

function isNodeVisible(element, scrollParent) {
  var appearOffset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (!element) {
    return false;
  }

  var elementRect = element.getBoundingClientRect(); // 面积为0

  if (elementRect.width * elementRect.height === 0) {
    return false;
  }

  var docEl = document.documentElement;
  var viewport = {
    top: 0,
    left: 0,
    bottom: docEl.clientHeight,
    right: docEl.clientWidth
  }; // 没有局部滚动的父元素

  if (scrollParent === undefined) {
    return isRectIntersect(elementRect, viewport, appearOffset);
  } else {
    var parentRect = scrollParent.getBoundingClientRect(); // 父元素是否可见

    var parentNodeIsVisible = isRectIntersect(parentRect, viewport, appearOffset);

    if (parentNodeIsVisible) {
      // 父元素 且子元素在父元素和window下都可见
      return isRectIntersect(elementRect, viewport, appearOffset) && isRectIntersect(elementRect, parentRect, appearOffset);
    } else {
      return false;
    }
  }
}

/***/ }),

/***/ "./packages/mp-core/es/utils/log.js":
/*!******************************************!*\
  !*** ./packages/mp-core/es/utils/log.js ***!
  \******************************************/
/*! exports provided: default, debug */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return log; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debug", function() { return debug; });
/* harmony import */ var _isDebug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isDebug */ "./packages/mp-core/es/utils/isDebug.js");


function internalLog(args) {
  console.log.apply(console, args);
}

function log() {
  if (Object(_isDebug__WEBPACK_IMPORTED_MODULE_0__["isDebug"])()) {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    internalLog(args);
  }
}
function debug(type) {
  if (Object(_isDebug__WEBPACK_IMPORTED_MODULE_0__["isDebugSupported"])(type)) {
    for (var _len2 = arguments.length, rest = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    internalLog(["[".concat(type, "]")].concat(rest));
  }
}

/***/ }),

/***/ "./packages/mp-core/es/utils/mergeArray.js":
/*!*************************************************!*\
  !*** ./packages/mp-core/es/utils/mergeArray.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return mergeArray; });
function mergeArray(target, from) {
  from.forEach(function (f) {
    if (target.indexOf(f) === -1) {
      target.push(f);
    }
  });
  return target;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/objectKeys.js":
/*!*************************************************!*\
  !*** ./packages/mp-core/es/utils/objectKeys.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return objectKeys; });
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function objectKeys(obj) {
  if (obj && _typeof(obj) === 'object') {
    return Object.keys(obj);
  }

  return [];
}

/***/ }),

/***/ "./packages/mp-core/es/utils/setData.js":
/*!**********************************************!*\
  !*** ./packages/mp-core/es/utils/setData.js ***!
  \**********************************************/
/*! exports provided: default, spliceData, getOpStr, getOpFn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return setData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "spliceData", function() { return spliceData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOpStr", function() { return getOpStr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOpFn", function() { return getOpFn; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");
/* harmony import */ var _stringToPath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringToPath */ "./packages/mp-core/es/utils/stringToPath.js");
/* harmony import */ var _shallowEqual__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shallowEqual */ "./packages/mp-core/es/utils/shallowEqual.js");
/* harmony import */ var _consts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./consts */ "./packages/mp-core/es/utils/consts.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






function isNumber(value) {
  return typeof value === 'number';
}

function isArray(obj) {
  return Array.isArray(obj);
}

function clone(obj, assumeArray) {
  if (!obj) {
    return assumeArray ? [] : {};
  } else if (isArray(obj)) {
    return obj.slice();
  }

  return _objectSpread({}, obj);
}

function set(dest, src, path, changeCallback, deepLevel) {
  var currentPath = path[0];

  if (deepLevel && dest === src || !dest) {
    dest = clone(src, isNumber(currentPath));
  }

  if (path.length === 1) {
    return changeCallback(dest, currentPath);
  }

  if (src) {
    src = src[currentPath];
  }

  dest[currentPath] = set(dest[currentPath], src, path.slice(1), changeCallback, true);
  return dest;
}

function setData(data, changedData) {
  var ret = _objectSpread({}, data);

  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(changedData).forEach(function (pathString) {
    var path = Object(_stringToPath__WEBPACK_IMPORTED_MODULE_1__["default"])(pathString);
    set(ret, ret, path, function (clonedObj, finalPath) {
      clonedObj[finalPath] = changedData[pathString];
      return clonedObj;
    });
  });

  if (Object(_shallowEqual__WEBPACK_IMPORTED_MODULE_2__["default"])(ret, data)) {
    return data;
  }

  return ret;
}
function spliceData(data, changedData) {
  var ret = _objectSpread({}, data);

  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(changedData).forEach(function (pathString) {
    var path = Object(_stringToPath__WEBPACK_IMPORTED_MODULE_1__["default"])(pathString);
    set(ret, ret, path, function (clonedObj, finalPath) {
      var arr = clonedObj[finalPath];

      if (Array.isArray(arr)) {
        arr = arr.concat();
        arr.splice.apply(arr, changedData[pathString]);
        clonedObj[finalPath] = arr;
      }

      return clonedObj;
    });
  });

  if (Object(_shallowEqual__WEBPACK_IMPORTED_MODULE_2__["default"])(ret, data)) {
    return data;
  }

  return ret;
}
function getOpStr(op) {
  return op === setData ? _consts__WEBPACK_IMPORTED_MODULE_3__["OpSet"] : _consts__WEBPACK_IMPORTED_MODULE_3__["OpSplice"];
}
function getOpFn(op) {
  return op === _consts__WEBPACK_IMPORTED_MODULE_3__["OpSet"] ? setData : spliceData;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/shallowEqual.js":
/*!***************************************************!*\
  !*** ./packages/mp-core/es/utils/shallowEqual.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return shallowEqual; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }


function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (_typeof(objA) !== 'object' || objA === null || _typeof(objB) !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(objA);
  var keysB = Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(objB);
  var len = keysA.length;

  if (len !== keysB.length) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    var key = keysA[i];

    if (!objB.hasOwnProperty(key)) {
      return false;
    }

    var valueA = objA[key];
    var valueB = objB[key];

    if (valueA !== valueB) {
      return false;
    }
  }

  return true;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/startsWith.js":
/*!*************************************************!*\
  !*** ./packages/mp-core/es/utils/startsWith.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return startsWith; });
function startsWith(str, prefix) {
  if (!str || !prefix) {
    return false;
  }

  return str.slice(0, prefix.length) === prefix;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/startupParams/index.js":
/*!**********************************************************!*\
  !*** ./packages/mp-core/es/utils/startupParams/index.js ***!
  \**********************************************************/
/*! exports provided: getStartupParams, setStartupParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return getStartupParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return setStartupParams; });
/* harmony import */ var _startupParamsHolder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startupParamsHolder */ "./packages/mp-core/es/utils/startupParams/startupParamsHolder.js");

var g = self;
function getStartupParams() {
  if (g.__mpStartupParams) {
    return g.__mpStartupParams;
  }

  return Object(_startupParamsHolder__WEBPACK_IMPORTED_MODULE_0__["getValue"])() || {};
}
var setStartupParams = _startupParamsHolder__WEBPACK_IMPORTED_MODULE_0__["setValue"];

/***/ }),

/***/ "./packages/mp-core/es/utils/startupParams/startupParamsHolder.js":
/*!************************************************************************!*\
  !*** ./packages/mp-core/es/utils/startupParams/startupParamsHolder.js ***!
  \************************************************************************/
/*! exports provided: setValue, getValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setValue", function() { return setValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getValue", function() { return getValue; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");

var v;
function setValue(o) {
  if (Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(o).length) {
    v = o;
  }
}
function getValue() {
  return v;
}
self.__getStartupParams = getValue;

/***/ }),

/***/ "./packages/mp-core/es/utils/stringToPath.js":
/*!***************************************************!*\
  !*** ./packages/mp-core/es/utils/stringToPath.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return stringToPath; });
var reLeadingDot = /^\./; // a..b
// a[][]b

var rePropName = /[^.[\]]+|\[(?:(-?\d+)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
/** Used to match backslashes in property paths. */

var reEscapeChar = /\\(\\)?/g;
var stringToPathCache = {};
function stringToPath(stringPath) {
  if (stringToPathCache[stringPath]) {
    return stringToPathCache[stringPath];
  }

  var result = [];

  if (reLeadingDot.test(stringPath)) {
    result.push('');
  }

  stringPath.replace(rePropName, function (match, num, quote, str) {
    var part = match;

    if (quote) {
      part = str.replace(reEscapeChar, '$1');
    } else if (num) {
      part = parseInt(num, 10);
    }

    result.push(part);
  });
  stringToPathCache[stringPath] = result;
  return result;
}

/***/ }),

/***/ "./packages/mp-core/es/utils/throttle.js":
/*!***********************************************!*\
  !*** ./packages/mp-core/es/utils/throttle.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return throttle; });
/* harmony import */ var _debounce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debounce */ "./packages/mp-core/es/utils/debounce.js");

function throttle(func, wait, options) {
  var leading = true;
  var trailing = true;

  if (options) {
    leading = 'leading' in options ? options.leading : leading;
    trailing = 'trailing' in options ? options.trailing : trailing;
  }

  return Object(_debounce__WEBPACK_IMPORTED_MODULE_0__["default"])(func, wait, {
    leading: leading,
    maxWait: wait,
    trailing: trailing
  });
}

/***/ }),

/***/ "./packages/mp-core/es/view/AnimationViewMixin.js":
/*!********************************************************!*\
  !*** ./packages/mp-core/es/view/AnimationViewMixin.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  isValidAnimation: function isValidAnimation(anim) {
    var animation = anim || this.props.animation;
    return animation && animation.length;
  },
  componentDidMount: function componentDidMount() {
    this._animTimer = [];

    if (this.isValidAnimation()) {
      this.doAnimation();
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    if (this.props.animation !== prevProps.animation) {
      if (this.isValidAnimation(prevProps.animation)) {
        this.stopAnimation();
      }

      if (this.isValidAnimation()) {
        this.doAnimation();
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    this.deleteAllAnimTimers();
  },
  createAnimTimeout: function createAnimTimeout(fn, ms) {
    var _this = this;

    var timer = setTimeout(function () {
      _this.deleteAnimTimer(timer);

      fn();
    }, ms);

    this._animTimer.push(timer);
  },
  deleteAllAnimTimers: function deleteAllAnimTimers() {
    this._animTimer.forEach(function (t) {
      clearTimeout(t);
    });

    this._animTimer = [];
  },
  deleteAnimTimer: function deleteAnimTimer(t) {
    var index = this._animTimer.indexOf(t);

    if (index !== -1) {
      clearTimeout(this._animTimer[index]);

      this._animTimer.splice(index, 1);
    }
  }
});

/***/ }),

/***/ "./packages/mp-core/es/view/View.js":
/*!******************************************!*\
  !*** ./packages/mp-core/es/view/View.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_touchable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-touchable */ "./packages/mp-core/node_modules/rc-touchable/es/index.js");
/* harmony import */ var _mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../mixins/BasicEventMixin */ "./packages/mp-core/es/mixins/BasicEventMixin.js");
/* harmony import */ var _AnimationViewMixin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./AnimationViewMixin */ "./packages/mp-core/es/view/AnimationViewMixin.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils */ "./packages/mp-core/es/view/utils.js");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/addEvents */ "./packages/mp-core/es/utils/addEvents.js");
/* harmony import */ var _utils_isNodeVisible__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/isNodeVisible */ "./packages/mp-core/es/utils/isNodeVisible.js");
/* harmony import */ var _utils_throttle__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/throttle */ "./packages/mp-core/es/utils/throttle.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }












function transformUnit(v) {
  if (typeof v === 'number') {
    return "".concat(v, "px");
  }

  return v;
}

function getDegreeTransform(property, value) {
  return "".concat(property, "(").concat(value.map(function (s) {
    return "".concat(s, "deg");
  }).join(','), ")");
}

function getNormalTransform(property, value) {
  return "".concat(property, "(").concat(value.join(','), ")");
}

function getTranslateTransform(property, value) {
  return "".concat(property, "(").concat(value.map(function (s) {
    return transformUnit(s);
  }).join(','), ")");
}

function removeTransform(transform, property) {
  if (transform) {
    var reg = new RegExp("".concat(property, "\\([^)]+\\)"), 'gi');
    return transform.replace(reg, '');
  }

  return transform;
}

function getStyleFromAnimation(component, _animation, node) {
  var style = {};
  var animation = Object(_utils__WEBPACK_IMPORTED_MODULE_5__["expandAnimation"])(_animation || []);
  var transform = node.style.transform || '';
  animation.forEach(function (a) {
    var p = a[0];
    var value = a[1];

    if (_utils__WEBPACK_IMPORTED_MODULE_5__["lengthCssPropNames"][p]) {
      style[p] = transformUnit(value[0]);
    } else if (_utils__WEBPACK_IMPORTED_MODULE_5__["colorCssPropNames"][p]) {
      style[p] = value[0];
    } else {
      transform = removeTransform(transform, p);

      if (p === 'rotate3d') {
        var newValue = value.concat();

        if (newValue.length === 4) {
          newValue[3] += 'deg';
        }

        transform += " ".concat(p, "(").concat(newValue.join(','), ")");
      } else if (_utils__WEBPACK_IMPORTED_MODULE_5__["rotateProperties"][p] || _utils__WEBPACK_IMPORTED_MODULE_5__["skewProperties"][p]) {
        transform += " ".concat(getDegreeTransform(p, value));
      } else if (_utils__WEBPACK_IMPORTED_MODULE_5__["translateProperties"][p]) {
        transform += " ".concat(getTranslateTransform(p, value));
      } else {
        transform += " ".concat(getNormalTransform(p, value));
      }
    }
  });

  if (transform) {
    style.transform = transform.trim();
  }

  return component.props.$mp.getNormalizedStyle({
    style: style
  });
}

/* harmony default export */ __webpack_exports__["default"] = (create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'View',
  mixins: [Object(_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_3__["default"])(), _AnimationViewMixin__WEBPACK_IMPORTED_MODULE_4__["default"]],
  componentDidMount: function componentDidMount() {
    this.firstAppeared = false;
    this.checkVisible = Object(_utils_throttle__WEBPACK_IMPORTED_MODULE_8__["default"])(this.checkVisible, 300, {
      leading: false
    });
    this.handleAppear();
  },
  componentDidUpdate: function componentDidUpdate() {
    this.handleAppear();
  },
  componentWillUnMount: function componentWillUnMount() {
    this.removeAllScrollEventLister();
  },
  fireFirstAppear: function fireFirstAppear() {
    var _this$props = this.props,
        onFirstAppear = _this$props.onFirstAppear,
        $mp = _this$props.$mp;

    if (onFirstAppear && !this.firstAppeared) {
      onFirstAppear($mp.getNormalizedEvent('firstAppear'));
      this.firstAppeared = true;

      if (!this.hasAppearEvent()) {
        this.removeAllScrollEventLister();
      }
    }
  },
  hasAppearEvent: function hasAppearEvent() {
    var _this$props2 = this.props,
        onAppear = _this$props2.onAppear,
        onDisappear = _this$props2.onDisappear,
        onFirstAppear = _this$props2.onFirstAppear;

    if (onFirstAppear && !this.firstAppeared) {
      return true;
    }

    return !!(onAppear || onDisappear);
  },
  removeAllScrollEventLister: function removeAllScrollEventLister() {
    this.viewAppear = undefined;

    if (this.scrollEvent) {
      this.scrollEvent.remove();
      this.scrollEvent = null;
    }

    if (this.scrollParentEvent) {
      this.scrollParentEvent.remove();
      this.scrollParentEvent = null;
    }
  },
  getScrollParent: function getScrollParent() {
    if (this.scrollParent) {
      return this.scrollParent;
    }

    this.scrollParent = this.findScrollParent(this.root);
    return this.scrollParent;
  },
  handleAppear: function handleAppear() {
    // 当外部传入的onAppear、onDisappear都不存在时，移除相关的事件监听
    if (!this.hasAppearEvent()) {
      this.removeAllScrollEventLister();
    } else {
      // 当viewAppear、alreadyAppear 未赋值时，做初始化
      if (this.viewAppear === undefined) {
        this.viewAppear = false;
      }

      this.checkVisible();

      if (!this.scrollEvent) {
        this.scrollEvent = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_6__["default"])(window, {
          scroll: this.checkVisible
        });
      }

      if (!this.scrollParentEvent) {
        var scrollParent = this.getScrollParent();

        if (scrollParent) {
          this.scrollParentEvent = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_6__["default"])(scrollParent, {
            scroll: this.checkVisible
          });
        }
      }
    }
  },
  findScrollParent: function findScrollParent(element) {
    var parentNode = element.parentNode;

    if (parentNode && parentNode !== document.body) {
      var parentNodeStyle = window.getComputedStyle(parentNode);
      var parentNodeOverflowX = parentNodeStyle['overflow-x'];
      var parentNodeOverflowY = parentNodeStyle['overflow-y'];

      if (parentNodeOverflowX === 'auto' || parentNodeOverflowY === 'auto' || parentNodeOverflowX === 'scroll' || parentNodeOverflowY === 'scroll') {
        return parentNode;
      } else {
        return this.findScrollParent(parentNode);
      }
    } else {
      return undefined;
    }
  },
  checkVisible: function checkVisible() {
    // 由于throttle的原因，在执行checkVisible时，this.root可能已经被销毁。
    if (!this.root) {
      return;
    }

    var _this$props3 = this.props,
        onAppear = _this$props3.onAppear,
        onDisappear = _this$props3.onDisappear,
        _this$props3$appearOf = _this$props3.appearOffset,
        appearOffset = _this$props3$appearOf === void 0 ? 0 : _this$props3$appearOf,
        $mp = _this$props3.$mp;
    var viewVisible = Object(_utils_isNodeVisible__WEBPACK_IMPORTED_MODULE_7__["default"])(this.root, this.scrollParent, appearOffset); // 是否可见

    if (viewVisible) {
      // 之前不可见
      if (!this.viewAppear) {
        if (onAppear) {
          onAppear($mp.getNormalizedEvent('appear'));
        }

        this.fireFirstAppear();
      }

      this.viewAppear = true;
    } else {
      // 之前可见
      if (this.viewAppear && onDisappear) {
        onDisappear($mp.getNormalizedEvent('disappear'));
      }

      this.viewAppear = false;
    }
  },
  doAnimation: function doAnimation() {
    var _this = this;

    var props = this.props;
    var time = 0;
    var animation = props.animation;
    var rootStyle = this.root.style;
    var animationLength = animation.length;
    animation.forEach(function (anim, index) {
      var _anim$config = anim.config,
          timeFunction = _anim$config.timeFunction,
          _anim$config$delay = _anim$config.delay,
          delay = _anim$config$delay === void 0 ? 0 : _anim$config$delay,
          duration = _anim$config.duration,
          transformOrigin = _anim$config.transformOrigin;
      time += delay;

      _this.createAnimTimeout(function () {
        Object.assign(rootStyle, props.$mp.getNormalizedStyle({
          style: {
            transitionTimingFunction: timeFunction,
            transitionProperty: 'all',
            transitionDelay: "".concat(delay, "ms"),
            transitionDuration: "".concat(duration, "ms"),
            transformOrigin: transformOrigin
          }
        }));
        var animStyle = getStyleFromAnimation(_this, anim.animation, _this.root);

        _this.createAnimTimeout(function () {
          Object.assign(rootStyle, animStyle);
        }, 0);

        if (index === animationLength - 1) {
          var resetTime = duration + delay + 10;

          _this.createAnimTimeout(function () {
            _this.stopAnimation();
          }, resetTime);
        }
      }, time);

      time += duration + 10;
    });
  },
  stopAnimation: function stopAnimation() {
    this.deleteAllAnimTimers();
    var rootStyle = this.root.style;
    Object.assign(rootStyle, this.props.$mp.getNormalizedStyle({
      style: {
        transitionTimingFunction: '',
        transitionProperty: '',
        transitionDelay: '',
        transitionDuration: '',
        transformOrigin: ''
      }
    }));
  },
  saveRoot: function saveRoot(root) {
    this.root = root;
  },
  render: function render() {
    var props = this.props;
    var children = props.children,
        hidden = props.hidden,
        userProps = props.userProps,
        _props$testProps = props.testProps,
        testProps = _props$testProps === void 0 ? {} : _props$testProps,
        _props$tagName = props.tagName,
        TagName = _props$tagName === void 0 ? 'div' : _props$tagName;
    var style = props.style;
    var touchableProps = {};
    var nodeEvents = {
      // always bind for event bubble target info
      onClick: this.onTap,
      onTransitionEnd: this.onTransitionEnd,
      onTouchStart: this.onTouchStart,
      onTouchMove: this.onTouchMove,
      onTouchEnd: this.onTouchEnd,
      onTouchCancel: this.onTouchCancel,
      onAnimationStart: this.onAnimationStart,
      onAnimationIteration: this.onAnimationIteration,
      onAnimationEnd: this.onAnimationEnd
    };

    if (props.hoverClass) {
      touchableProps.activeClassName = props.hoverClass;
    }

    if (props.hoverStartTime) {
      touchableProps.delayPressIn = props.hoverStartTime;
    }

    if (props.hoverStayTime) {
      touchableProps.delayPressOut = props.hoverStayTime;
    }

    if (this.hasBubbleEvent('LongTap')) {
      touchableProps.onLongPress = this.onLongTap;
    }

    if (hidden) {
      style = _objectSpread({}, style, {
        display: 'none'
      });
    }

    var clickable = {};

    if (userProps && (userProps.onTap || userProps.catchTap)) {
      clickable = {
        'data-clickable': true
      };
    }

    var content = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(TagName, _objectSpread({
      className: props.className,
      style: style,
      id: props.id
    }, nodeEvents, {}, clickable, {}, testProps, {}, this.props.$mp.getAriaProps(), {
      ref: this.saveRoot
    }), children);

    if (Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_9__["default"])(touchableProps).length) {
      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(rc_touchable__WEBPACK_IMPORTED_MODULE_2__["default"], _objectSpread({}, touchableProps, {
        activeStopPropagation: props.hoverStopPropagation
      }), content);
    }

    return content;
  }
}));

/***/ }),

/***/ "./packages/mp-core/es/view/utils.js":
/*!*******************************************!*\
  !*** ./packages/mp-core/es/view/utils.js ***!
  \*******************************************/
/*! exports provided: lengthCssPropNames, colorCssPropNames, translateProperties, rotateProperties, skewProperties, expandAnimation */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "lengthCssPropNames", function() { return lengthCssPropNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "colorCssPropNames", function() { return colorCssPropNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "translateProperties", function() { return translateProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rotateProperties", function() { return rotateProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "skewProperties", function() { return skewProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "expandAnimation", function() { return expandAnimation; });
var lengthCssPropNames = {
  width: 1,
  height: 1,
  top: 1,
  left: 1,
  bottom: 1,
  right: 1
};
var colorCssPropNames = {
  opacity: 1,
  backgroundColor: 1
};
var translateProperties = {
  translateX: 1,
  translateY: 1,
  translateZ: 1
};
var rotateProperties = {
  rotateX: 1,
  rotateY: 1,
  rotateZ: 1
};
var skewProperties = {
  skewX: 1,
  skewY: 1
};

function expandAnimation(animation) {
  var ret = [];
  animation.forEach(function (a) {
    var p = a[0];
    var value = a[1];

    if (p === 'rotate') {
      ret.push(['rotateZ', value]);
    } else if (p === 'scale') {
      ret.push(['scaleX', [value[0]]]);
      ret.push(['scaleY', value[1] !== undefined ? [value[1]] : [value[0]]]);
    } else if (p === 'scale3d') {
      ret.push(['scaleX', [value[0]]]);
      ret.push(['scaleY', [value[1]]]);
      ret.push(['scaleZ', [value[2]]]);
    } else if (p === 'translate') {
      ret.push(['translateX', [value[0]]]);
      ret.push(['translateY', [value[1]]]);
    } else if (p === 'translate3d') {
      ret.push(['translateX', [value[0]]]);
      ret.push(['translateY', [value[1]]]);
      ret.push(['translateZ', [value[2]]]);
    } else if (p === 'skew') {
      ret.push(['skewX', [value[0]]]);
      ret.push(['skewY', [value[1]]]);
    } else {
      ret.push(a);
    }
  });
  return ret;
}



/***/ }),

/***/ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!**************************************************************************************!*\
  !*** ./packages/mp-core/node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \**************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayLikeToArray; });
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

/***/ }),

/***/ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!***************************************************************************************!*\
  !*** ./packages/mp-core/node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayWithoutHoles; });
/* harmony import */ var _babel_runtime_helpers_esm_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/arrayLikeToArray */ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return Object(_babel_runtime_helpers_esm_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

/***/ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!*************************************************************************************!*\
  !*** ./packages/mp-core/node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \*************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _iterableToArray; });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

/***/ }),

/***/ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!***************************************************************************************!*\
  !*** ./packages/mp-core/node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _nonIterableSpread; });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!***************************************************************************************!*\
  !*** ./packages/mp-core/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \***************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _toConsumableArray; });
/* harmony import */ var _babel_runtime_helpers_esm_arrayWithoutHoles__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/arrayWithoutHoles */ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _babel_runtime_helpers_esm_iterableToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/iterableToArray */ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_unsupportedIterableToArray__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/unsupportedIterableToArray */ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _babel_runtime_helpers_esm_nonIterableSpread__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/nonIterableSpread */ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return Object(_babel_runtime_helpers_esm_arrayWithoutHoles__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || Object(_babel_runtime_helpers_esm_iterableToArray__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || Object(_babel_runtime_helpers_esm_unsupportedIterableToArray__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || Object(_babel_runtime_helpers_esm_nonIterableSpread__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!************************************************************************************************!*\
  !*** ./packages/mp-core/node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \************************************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _unsupportedIterableToArray; });
/* harmony import */ var _babel_runtime_helpers_esm_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/arrayLikeToArray */ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return Object(_babel_runtime_helpers_esm_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Object(_babel_runtime_helpers_esm_arrayLikeToArray__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

/***/ }),

/***/ "./packages/mp-core/node_modules/css-vendor/dist/css-vendor.esm.js":
/*!*************************************************************************!*\
  !*** ./packages/mp-core/node_modules/css-vendor/dist/css-vendor.esm.js ***!
  \*************************************************************************/
/*! exports provided: prefix, supportedKeyframes, supportedProperty, supportedValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prefix", function() { return prefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedKeyframes", function() { return supportedKeyframes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedProperty", function() { return supportedProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedValue", function() { return supportedValue; });
/* harmony import */ var is_in_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! is-in-browser */ "./packages/mp-core/node_modules/is-in-browser/dist/module.js");
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./packages/mp-core/node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");



// Export javascript style and css style vendor prefixes.
var js = '';
var css = '';
var vendor = '';
var browser = '';
var isTouch = is_in_browser__WEBPACK_IMPORTED_MODULE_0__["default"] && 'ontouchstart' in document.documentElement; // We should not do anything if required serverside.

if (is_in_browser__WEBPACK_IMPORTED_MODULE_0__["default"]) {
  // Order matters. We need to check Webkit the last one because
  // other vendors use to add Webkit prefixes to some properties
  var jsCssMap = {
    Moz: '-moz-',
    ms: '-ms-',
    O: '-o-',
    Webkit: '-webkit-'
  };

  var _document$createEleme = document.createElement('p'),
      style = _document$createEleme.style;

  var testProp = 'Transform';

  for (var key in jsCssMap) {
    if (key + testProp in style) {
      js = key;
      css = jsCssMap[key];
      break;
    }
  } // Correctly detect the Edge browser.


  if (js === 'Webkit' && 'msHyphens' in style) {
    js = 'ms';
    css = jsCssMap.ms;
    browser = 'edge';
  } // Correctly detect the Safari browser.


  if (js === 'Webkit' && '-apple-trailing-word' in style) {
    vendor = 'apple';
  }
}
/**
 * Vendor prefix string for the current browser.
 *
 * @type {{js: String, css: String, vendor: String, browser: String}}
 * @api public
 */


var prefix = {
  js: js,
  css: css,
  vendor: vendor,
  browser: browser,
  isTouch: isTouch
};

/**
 * Test if a keyframe at-rule should be prefixed or not
 *
 * @param {String} vendor prefix string for the current browser.
 * @return {String}
 * @api public
 */

function supportedKeyframes(key) {
  // Keyframes is already prefixed. e.g. key = '@-webkit-keyframes a'
  if (key[1] === '-') return key; // No need to prefix IE/Edge. Older browsers will ignore unsupported rules.
  // https://caniuse.com/#search=keyframes

  if (prefix.js === 'ms') return key;
  return "@" + prefix.css + "keyframes" + key.substr(10);
}

// https://caniuse.com/#search=appearance

var appearence = {
  noPrefill: ['appearance'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'appearance') return false;
    if (prefix.js === 'ms') return "-webkit-" + prop;
    return prefix.css + prop;
  }
};

// https://caniuse.com/#search=color-adjust

var colorAdjust = {
  noPrefill: ['color-adjust'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'color-adjust') return false;
    if (prefix.js === 'Webkit') return prefix.css + "print-" + prop;
    return prop;
  }
};

var regExp = /[-\s]+(.)?/g;
/**
 * Replaces the letter with the capital letter
 *
 * @param {String} match
 * @param {String} c
 * @return {String}
 * @api private
 */

function toUpper(match, c) {
  return c ? c.toUpperCase() : '';
}
/**
 * Convert dash separated strings to camel-cased.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */


function camelize(str) {
  return str.replace(regExp, toUpper);
}

/**
 * Convert dash separated strings to pascal cased.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function pascalize(str) {
  return camelize("-" + str);
}

// but we can use a longhand property instead.
// https://caniuse.com/#search=mask

var mask = {
  noPrefill: ['mask'],
  supportedProperty: function supportedProperty(prop, style) {
    if (!/^mask/.test(prop)) return false;

    if (prefix.js === 'Webkit') {
      var longhand = 'mask-image';

      if (camelize(longhand) in style) {
        return prop;
      }

      if (prefix.js + pascalize(longhand) in style) {
        return prefix.css + prop;
      }
    }

    return prop;
  }
};

// https://caniuse.com/#search=text-orientation

var textOrientation = {
  noPrefill: ['text-orientation'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'text-orientation') return false;

    if (prefix.vendor === 'apple' && !prefix.isTouch) {
      return prefix.css + prop;
    }

    return prop;
  }
};

// https://caniuse.com/#search=transform

var transform = {
  noPrefill: ['transform'],
  supportedProperty: function supportedProperty(prop, style, options) {
    if (prop !== 'transform') return false;

    if (options.transform) {
      return prop;
    }

    return prefix.css + prop;
  }
};

// https://caniuse.com/#search=transition

var transition = {
  noPrefill: ['transition'],
  supportedProperty: function supportedProperty(prop, style, options) {
    if (prop !== 'transition') return false;

    if (options.transition) {
      return prop;
    }

    return prefix.css + prop;
  }
};

// https://caniuse.com/#search=writing-mode

var writingMode = {
  noPrefill: ['writing-mode'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'writing-mode') return false;

    if (prefix.js === 'Webkit' || prefix.js === 'ms' && prefix.browser !== 'edge') {
      return prefix.css + prop;
    }

    return prop;
  }
};

// https://caniuse.com/#search=user-select

var userSelect = {
  noPrefill: ['user-select'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'user-select') return false;

    if (prefix.js === 'Moz' || prefix.js === 'ms' || prefix.vendor === 'apple') {
      return prefix.css + prop;
    }

    return prop;
  }
};

// https://caniuse.com/#search=multicolumn
// https://github.com/postcss/autoprefixer/issues/491
// https://github.com/postcss/autoprefixer/issues/177

var breakPropsOld = {
  supportedProperty: function supportedProperty(prop, style) {
    if (!/^break-/.test(prop)) return false;

    if (prefix.js === 'Webkit') {
      var jsProp = "WebkitColumn" + pascalize(prop);
      return jsProp in style ? prefix.css + "column-" + prop : false;
    }

    if (prefix.js === 'Moz') {
      var _jsProp = "page" + pascalize(prop);

      return _jsProp in style ? "page-" + prop : false;
    }

    return false;
  }
};

// See https://github.com/postcss/autoprefixer/issues/324.

var inlineLogicalOld = {
  supportedProperty: function supportedProperty(prop, style) {
    if (!/^(border|margin|padding)-inline/.test(prop)) return false;
    if (prefix.js === 'Moz') return prop;
    var newProp = prop.replace('-inline', '');
    return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
  }
};

// Camelization is required because we can't test using.
// CSS syntax for e.g. in FF.

var unprefixed = {
  supportedProperty: function supportedProperty(prop, style) {
    return camelize(prop) in style ? prop : false;
  }
};

var prefixed = {
  supportedProperty: function supportedProperty(prop, style) {
    var pascalized = pascalize(prop); // Return custom CSS variable without prefixing.

    if (prop[0] === '-') return prop; // Return already prefixed value without prefixing.

    if (prop[0] === '-' && prop[1] === '-') return prop;
    if (prefix.js + pascalized in style) return prefix.css + prop; // Try webkit fallback.

    if (prefix.js !== 'Webkit' && "Webkit" + pascalized in style) return "-webkit-" + prop;
    return false;
  }
};

// https://caniuse.com/#search=scroll-snap

var scrollSnap = {
  supportedProperty: function supportedProperty(prop) {
    if (prop.substring(0, 11) !== 'scroll-snap') return false;

    if (prefix.js === 'ms') {
      return "" + prefix.css + prop;
    }

    return prop;
  }
};

// https://caniuse.com/#search=overscroll-behavior

var overscrollBehavior = {
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'overscroll-behavior') return false;

    if (prefix.js === 'ms') {
      return prefix.css + "scroll-chaining";
    }

    return prop;
  }
};

var propMap = {
  'flex-grow': 'flex-positive',
  'flex-shrink': 'flex-negative',
  'flex-basis': 'flex-preferred-size',
  'justify-content': 'flex-pack',
  order: 'flex-order',
  'align-items': 'flex-align',
  'align-content': 'flex-line-pack' // 'align-self' is handled by 'align-self' plugin.

}; // Support old flex spec from 2012.

var flex2012 = {
  supportedProperty: function supportedProperty(prop, style) {
    var newProp = propMap[prop];
    if (!newProp) return false;
    return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
  }
};

var propMap$1 = {
  flex: 'box-flex',
  'flex-grow': 'box-flex',
  'flex-direction': ['box-orient', 'box-direction'],
  order: 'box-ordinal-group',
  'align-items': 'box-align',
  'flex-flow': ['box-orient', 'box-direction'],
  'justify-content': 'box-pack'
};
var propKeys = Object.keys(propMap$1);

var prefixCss = function prefixCss(p) {
  return prefix.css + p;
}; // Support old flex spec from 2009.


var flex2009 = {
  supportedProperty: function supportedProperty(prop, style, _ref) {
    var multiple = _ref.multiple;

    if (propKeys.indexOf(prop) > -1) {
      var newProp = propMap$1[prop];

      if (!Array.isArray(newProp)) {
        return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
      }

      if (!multiple) return false;

      for (var i = 0; i < newProp.length; i++) {
        if (!(prefix.js + pascalize(newProp[0]) in style)) {
          return false;
        }
      }

      return newProp.map(prefixCss);
    }

    return false;
  }
};

// plugins = [
//   ...plugins,
//    breakPropsOld,
//    inlineLogicalOld,
//    unprefixed,
//    prefixed,
//    scrollSnap,
//    flex2012,
//    flex2009
// ]
// Plugins without 'noPrefill' value, going last.
// 'flex-*' plugins should be at the bottom.
// 'flex2009' going after 'flex2012'.
// 'prefixed' going after 'unprefixed'

var plugins = [appearence, colorAdjust, mask, textOrientation, transform, transition, writingMode, userSelect, breakPropsOld, inlineLogicalOld, unprefixed, prefixed, scrollSnap, overscrollBehavior, flex2012, flex2009];
var propertyDetectors = plugins.filter(function (p) {
  return p.supportedProperty;
}).map(function (p) {
  return p.supportedProperty;
});
var noPrefill = plugins.filter(function (p) {
  return p.noPrefill;
}).reduce(function (a, p) {
  a.push.apply(a, Object(_babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__["default"])(p.noPrefill));
  return a;
}, []);

var el;
var cache = {};

if (is_in_browser__WEBPACK_IMPORTED_MODULE_0__["default"]) {
  el = document.createElement('p'); // We test every property on vendor prefix requirement.
  // Once tested, result is cached. It gives us up to 70% perf boost.
  // http://jsperf.com/element-style-object-access-vs-plain-object
  //
  // Prefill cache with known css properties to reduce amount of
  // properties we need to feature test at runtime.
  // http://davidwalsh.name/vendor-prefix

  var computed = window.getComputedStyle(document.documentElement, '');

  for (var key$1 in computed) {
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(key$1)) cache[computed[key$1]] = computed[key$1];
  } // Properties that cannot be correctly detected using the
  // cache prefill method.


  noPrefill.forEach(function (x) {
    return delete cache[x];
  });
}
/**
 * Test if a property is supported, returns supported property with vendor
 * prefix if required. Returns `false` if not supported.
 *
 * @param {String} prop dash separated
 * @param {Object} [options]
 * @return {String|Boolean}
 * @api public
 */


function supportedProperty(prop, options) {
  if (options === void 0) {
    options = {};
  }

  // For server-side rendering.
  if (!el) return prop; // Remove cache for benchmark tests or return property from the cache.

  if ( true && cache[prop] != null) {
    return cache[prop];
  } // Check if 'transition' or 'transform' natively supported in browser.


  if (prop === 'transition' || prop === 'transform') {
    options[prop] = prop in el.style;
  } // Find a plugin for current prefix property.


  for (var i = 0; i < propertyDetectors.length; i++) {
    cache[prop] = propertyDetectors[i](prop, el.style, options); // Break loop, if value found.

    if (cache[prop]) break;
  } // Reset styles for current property.
  // Firefox can even throw an error for invalid properties, e.g., "0".


  try {
    el.style[prop] = '';
  } catch (err) {
    return false;
  }

  return cache[prop];
}

var cache$1 = {};
var transitionProperties = {
  transition: 1,
  'transition-property': 1,
  '-webkit-transition': 1,
  '-webkit-transition-property': 1
};
var transPropsRegExp = /(^\s*[\w-]+)|, (\s*[\w-]+)(?![^()]*\))/g;
var el$1;
/**
 * Returns prefixed value transition/transform if needed.
 *
 * @param {String} match
 * @param {String} p1
 * @param {String} p2
 * @return {String}
 * @api private
 */

function prefixTransitionCallback(match, p1, p2) {
  if (p1 === 'var') return 'var';
  if (p1 === 'all') return 'all';
  if (p2 === 'all') return ', all';
  var prefixedValue = p1 ? supportedProperty(p1) : ", " + supportedProperty(p2);
  if (!prefixedValue) return p1 || p2;
  return prefixedValue;
}

if (is_in_browser__WEBPACK_IMPORTED_MODULE_0__["default"]) el$1 = document.createElement('p');
/**
 * Returns prefixed value if needed. Returns `false` if value is not supported.
 *
 * @param {String} property
 * @param {String} value
 * @return {String|Boolean}
 * @api public
 */

function supportedValue(property, value) {
  // For server-side rendering.
  var prefixedValue = value;
  if (!el$1 || property === 'content') return value; // It is a string or a number as a string like '1'.
  // We want only prefixable values here.
  // eslint-disable-next-line no-restricted-globals

  if (typeof prefixedValue !== 'string' || !isNaN(parseInt(prefixedValue, 10))) {
    return prefixedValue;
  } // Create cache key for current value.


  var cacheKey = property + prefixedValue; // Remove cache for benchmark tests or return value from cache.

  if ( true && cache$1[cacheKey] != null) {
    return cache$1[cacheKey];
  } // IE can even throw an error in some cases, for e.g. style.content = 'bar'.


  try {
    // Test value as it is.
    el$1.style[property] = prefixedValue;
  } catch (err) {
    // Return false if value not supported.
    cache$1[cacheKey] = false;
    return false;
  } // If 'transition' or 'transition-property' property.


  if (transitionProperties[property]) {
    prefixedValue = prefixedValue.replace(transPropsRegExp, prefixTransitionCallback);
  } else if (el$1.style[property] === '') {
    // Value with a vendor prefix.
    prefixedValue = prefix.css + prefixedValue; // Hardcode test to convert "flex" to "-ms-flexbox" for IE10.

    if (prefixedValue === '-ms-flex') el$1.style[property] = '-ms-flexbox'; // Test prefixed value.

    el$1.style[property] = prefixedValue; // Return false if value not supported.

    if (el$1.style[property] === '') {
      cache$1[cacheKey] = false;
      return false;
    }
  } // Reset styles for current property.


  el$1.style[property] = ''; // Write current value to cache.

  cache$1[cacheKey] = prefixedValue;
  return cache$1[cacheKey];
}




/***/ }),

/***/ "./packages/mp-core/node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js":
/*!***************************************************************************************************!*\
  !*** ./packages/mp-core/node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js ***!
  \***************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var reactIs = __webpack_require__(/*! react-is */ "./packages/mp-core/node_modules/react-is/index.js");

/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */
var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  '$$typeof': true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  '$$typeof': true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};
var TYPE_STATICS = {};
TYPE_STATICS[reactIs.ForwardRef] = FORWARD_REF_STATICS;
TYPE_STATICS[reactIs.Memo] = MEMO_STATICS;

function getStatics(component) {
  // React v16.11 and below
  if (reactIs.isMemo(component)) {
    return MEMO_STATICS;
  } // React v16.12 and above


  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
}

var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  if (typeof sourceComponent !== 'string') {
    // don't hoist over string (html) components
    if (objectPrototype) {
      var inheritedComponent = getPrototypeOf(sourceComponent);

      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }

    var keys = getOwnPropertyNames(sourceComponent);

    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }

    var targetStatics = getStatics(targetComponent);
    var sourceStatics = getStatics(sourceComponent);

    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];

      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

        try {
          // Avoid failures from read-only properties
          defineProperty(targetComponent, key, descriptor);
        } catch (e) {}
      }
    }
  }

  return targetComponent;
}

module.exports = hoistNonReactStatics;


/***/ }),

/***/ "./packages/mp-core/node_modules/is-in-browser/dist/module.js":
/*!********************************************************************!*\
  !*** ./packages/mp-core/node_modules/is-in-browser/dist/module.js ***!
  \********************************************************************/
/*! exports provided: isBrowser, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBrowser", function() { return isBrowser; });
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var isBrowser = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && (typeof document === "undefined" ? "undefined" : _typeof(document)) === 'object' && document.nodeType === 9;

/* harmony default export */ __webpack_exports__["default"] = (isBrowser);


/***/ }),

/***/ "./packages/mp-core/node_modules/object-assign/index.js":
/*!**************************************************************!*\
  !*** ./packages/mp-core/node_modules/object-assign/index.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),

/***/ "./packages/mp-core/node_modules/prop-types/checkPropTypes.js":
/*!********************************************************************!*\
  !*** ./packages/mp-core/node_modules/prop-types/checkPropTypes.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var printWarning = function() {};

if (true) {
  var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "./packages/mp-core/node_modules/prop-types/lib/ReactPropTypesSecret.js");
  var loggedTypeFailures = {};
  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (true) {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error(
              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
            );
            err.name = 'Invariant Violation';
            throw err;
          }
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning(
            (componentName || 'React class') + ': type specification of ' +
            location + ' `' + typeSpecName + '` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).'
          );
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          printWarning(
            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
          );
        }
      }
    }
  }
}

/**
 * Resets warning cache when testing.
 *
 * @private
 */
checkPropTypes.resetWarningCache = function() {
  if (true) {
    loggedTypeFailures = {};
  }
}

module.exports = checkPropTypes;


/***/ }),

/***/ "./packages/mp-core/node_modules/prop-types/factoryWithTypeCheckers.js":
/*!*****************************************************************************!*\
  !*** ./packages/mp-core/node_modules/prop-types/factoryWithTypeCheckers.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactIs = __webpack_require__(/*! react-is */ "./packages/mp-core/node_modules/react-is/index.js");
var assign = __webpack_require__(/*! object-assign */ "./packages/mp-core/node_modules/object-assign/index.js");

var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "./packages/mp-core/node_modules/prop-types/lib/ReactPropTypesSecret.js");
var checkPropTypes = __webpack_require__(/*! ./checkPropTypes */ "./packages/mp-core/node_modules/prop-types/checkPropTypes.js");

var has = Function.call.bind(Object.prototype.hasOwnProperty);
var printWarning = function() {};

if (true) {
  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

function emptyFunctionThatReturnsNull() {
  return null;
}

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    elementType: createElementTypeTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (true) {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          var err = new Error(
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
          err.name = 'Invariant Violation';
          throw err;
        } else if ( true && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            printWarning(
              'You are manually calling a React.PropTypes validation ' +
              'function for the `' + propFullName + '` prop on `' + componentName  + '`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!ReactIs.isValidElementType(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      if (true) {
        if (arguments.length > 1) {
          printWarning(
            'Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' +
            'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'
          );
        } else {
          printWarning('Invalid argument supplied to oneOf, expected an array.');
        }
      }
      return emptyFunctionThatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
        var type = getPreciseType(value);
        if (type === 'symbol') {
          return String(value);
        }
        return value;
      });
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (has(propValue, key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
       true ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : undefined;
      return emptyFunctionThatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        printWarning(
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'
        );
        return emptyFunctionThatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // falsy value can't be a Symbol
    if (!propValue) {
      return false;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),

/***/ "./packages/mp-core/node_modules/prop-types/index.js":
/*!***********************************************************!*\
  !*** ./packages/mp-core/node_modules/prop-types/index.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (true) {
  var ReactIs = __webpack_require__(/*! react-is */ "./packages/mp-core/node_modules/react-is/index.js");

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(/*! ./factoryWithTypeCheckers */ "./packages/mp-core/node_modules/prop-types/factoryWithTypeCheckers.js")(ReactIs.isElement, throwOnDirectAccess);
} else {}


/***/ }),

/***/ "./packages/mp-core/node_modules/prop-types/lib/ReactPropTypesSecret.js":
/*!******************************************************************************!*\
  !*** ./packages/mp-core/node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),

/***/ "./packages/mp-core/node_modules/rc-touchable/es/PressEvent.js":
/*!*********************************************************************!*\
  !*** ./packages/mp-core/node_modules/rc-touchable/es/PressEvent.js ***!
  \*********************************************************************/
/*! exports provided: shouldFirePress, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shouldFirePress", function() { return shouldFirePress; });
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function PressEvent(nativeEvent) {
    var _this = this;

    this.nativeEvent = nativeEvent;
    ['type', 'currentTarget', 'target', 'touches', 'changedTouches'].forEach(function (m) {
        _this[m] = nativeEvent[m];
    });
    if (!nativeEvent.$pressSeq) {
        nativeEvent.$pressSeq = 1;
    } else {
        nativeEvent.$pressSeq += 1;
    }
    this.$pressSeq = nativeEvent.$pressSeq;
}
PressEvent.prototype = _extends({}, PressEvent.prototype, {
    preventDefault: function preventDefault() {
        this.nativeEvent.preventDefault();
    },
    stopPropagation: function stopPropagation() {
        var nativeEvent = this.nativeEvent,
            $pressSeq = this.$pressSeq;

        if (nativeEvent.$stopPressSeq) {
            return;
        }
        nativeEvent.$stopPressSeq = $pressSeq;
    }
});
// because of setTimeout, can not depend on fire order
function shouldFirePress(e) {
    var nativeEvent = e.nativeEvent,
        $pressSeq = e.$pressSeq;

    if (!nativeEvent.$stopPressSeq) {
        return true;
    }
    return nativeEvent.$stopPressSeq >= $pressSeq;
}
/* harmony default export */ __webpack_exports__["default"] = (PressEvent);

/***/ }),

/***/ "./packages/mp-core/node_modules/rc-touchable/es/index.js":
/*!****************************************************************!*\
  !*** ./packages/mp-core/node_modules/rc-touchable/es/index.js ***!
  \****************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PressEvent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PressEvent */ "./packages/mp-core/node_modules/rc-touchable/es/PressEvent.js");
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// inspired by react-native



function keyMirror(obj) {
    Object.keys(obj).forEach(function (k) {
        return obj[k] = k;
    });
    return obj;
}
function copy(from, list) {
    var to = {};
    list.forEach(function (k) {
        to[k] = from[k];
    });
    return to;
}
function extractSingleTouch(_nativeEvent) {
    var nativeEvent = _nativeEvent;
    if (nativeEvent.nativeEvent) {
        nativeEvent = nativeEvent.nativeEvent;
    }
    var touches = nativeEvent.touches;
    var changedTouches = nativeEvent.changedTouches;
    var hasTouches = touches && touches.length > 0;
    var hasChangedTouches = changedTouches && changedTouches.length > 0;
    return !hasTouches && hasChangedTouches ? changedTouches[0] : hasTouches ? touches[0] : nativeEvent;
}
/**
 * Touchable states.
 */
var States = keyMirror({
    NOT_RESPONDER: null,
    RESPONDER_INACTIVE_PRESS_IN: null,
    RESPONDER_INACTIVE_PRESS_OUT: null,
    RESPONDER_ACTIVE_PRESS_IN: null,
    RESPONDER_ACTIVE_PRESS_OUT: null,
    RESPONDER_ACTIVE_LONG_PRESS_IN: null,
    RESPONDER_ACTIVE_LONG_PRESS_OUT: null,
    ERROR: null
});
/**
 * Quick lookup map for states that are considered to be "active"
 */
var IsActive = {
    RESPONDER_ACTIVE_PRESS_OUT: true,
    RESPONDER_ACTIVE_PRESS_IN: true
};
/**
 * Quick lookup for states that are considered to be "pressing" and are
 * therefore eligible to result in a "selection" if the press stops.
 */
var IsPressingIn = {
    RESPONDER_INACTIVE_PRESS_IN: true,
    RESPONDER_ACTIVE_PRESS_IN: true,
    RESPONDER_ACTIVE_LONG_PRESS_IN: true
};
var IsLongPressingIn = {
    RESPONDER_ACTIVE_LONG_PRESS_IN: true
};
/**
 * Inputs to the state machine.
 */
var Signals = keyMirror({
    DELAY: null,
    RESPONDER_GRANT: null,
    RESPONDER_RELEASE: null,
    RESPONDER_TERMINATED: null,
    ENTER_PRESS_RECT: null,
    LEAVE_PRESS_RECT: null,
    LONG_PRESS_DETECTED: null
});
/**
 * Mapping from States x Signals => States
 */
var Transitions = {
    NOT_RESPONDER: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.RESPONDER_INACTIVE_PRESS_IN,
        RESPONDER_RELEASE: States.ERROR,
        RESPONDER_TERMINATED: States.ERROR,
        ENTER_PRESS_RECT: States.ERROR,
        LEAVE_PRESS_RECT: States.ERROR,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_INACTIVE_PRESS_IN: {
        DELAY: States.RESPONDER_ACTIVE_PRESS_IN,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_INACTIVE_PRESS_OUT: {
        DELAY: States.RESPONDER_ACTIVE_PRESS_OUT,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_ACTIVE_PRESS_IN: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.RESPONDER_ACTIVE_LONG_PRESS_IN
    },
    RESPONDER_ACTIVE_PRESS_OUT: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_ACTIVE_LONG_PRESS_IN: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_OUT,
        LONG_PRESS_DETECTED: States.RESPONDER_ACTIVE_LONG_PRESS_IN
    },
    RESPONDER_ACTIVE_LONG_PRESS_OUT: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    error: {
        DELAY: States.NOT_RESPONDER,
        RESPONDER_GRANT: States.RESPONDER_INACTIVE_PRESS_IN,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.NOT_RESPONDER,
        LEAVE_PRESS_RECT: States.NOT_RESPONDER,
        LONG_PRESS_DETECTED: States.NOT_RESPONDER
    }
};
// ==== Typical Constants for integrating into UI components ====
// const HIT_EXPAND_PX = 20;
// const HIT_VERT_OFFSET_PX = 10;
var HIGHLIGHT_DELAY_MS = 130;
var PRESS_EXPAND_PX = 20;
var LONG_PRESS_THRESHOLD = 500;
var LONG_PRESS_DELAY_MS = LONG_PRESS_THRESHOLD - HIGHLIGHT_DELAY_MS;
var LONG_PRESS_ALLOWED_MOVEMENT = 10;
var lastClickTime = 0;
var pressDelay = 200;
function isAllowPress() {
    // avoid click penetration
    return Date.now() - lastClickTime >= pressDelay;
}

var Touchable = function (_React$Component) {
    _inherits(Touchable, _React$Component);

    function Touchable() {
        _classCallCheck(this, Touchable);

        var _this = _possibleConstructorReturn(this, (Touchable.__proto__ || Object.getPrototypeOf(Touchable)).apply(this, arguments));

        _this.state = {
            active: false
        };
        _this.touchable = { touchState: undefined };
        _this.onTouchStart = function (e) {
            _this.callChildEvent('onTouchStart', e);
            _this.lockMouse = true;
            if (_this.releaseLockTimer) {
                clearTimeout(_this.releaseLockTimer);
            }
            _this.touchableHandleResponderGrant(e.nativeEvent);
        };
        _this.onTouchMove = function (e) {
            _this.callChildEvent('onTouchMove', e);
            _this.touchableHandleResponderMove(e.nativeEvent);
        };
        _this.onTouchEnd = function (e) {
            _this.callChildEvent('onTouchEnd', e);
            _this.releaseLockTimer = setTimeout(function () {
                _this.lockMouse = false;
            }, 300);
            _this.touchableHandleResponderRelease(new _PressEvent__WEBPACK_IMPORTED_MODULE_2__["default"](e.nativeEvent));
        };
        _this.onTouchCancel = function (e) {
            _this.callChildEvent('onTouchCancel', e);
            _this.releaseLockTimer = setTimeout(function () {
                _this.lockMouse = false;
            }, 300);
            _this.touchableHandleResponderTerminate(e.nativeEvent);
        };
        _this.onMouseDown = function (e) {
            _this.callChildEvent('onMouseDown', e);
            if (_this.lockMouse) {
                return;
            }
            _this.touchableHandleResponderGrant(e.nativeEvent);
            document.addEventListener('mousemove', _this.touchableHandleResponderMove, false);
            document.addEventListener('mouseup', _this.onMouseUp, false);
        };
        _this.onMouseUp = function (e) {
            document.removeEventListener('mousemove', _this.touchableHandleResponderMove, false);
            document.removeEventListener('mouseup', _this.onMouseUp, false);
            _this.touchableHandleResponderRelease(new _PressEvent__WEBPACK_IMPORTED_MODULE_2__["default"](e));
        };
        _this.touchableHandleResponderMove = function (e) {
            if (!_this.touchable.startMouse) {
                return;
            }
            // Measurement may not have returned yet.
            if (!_this.touchable.dimensionsOnActivate || _this.touchable.touchState === States.NOT_RESPONDER) {
                return;
            }
            // Not enough time elapsed yet, wait for highlight -
            // this is just a perf optimization.
            if (_this.touchable.touchState === States.RESPONDER_INACTIVE_PRESS_IN) {
                return;
            }
            var touch = extractSingleTouch(e);
            var pageX = touch && touch.pageX;
            var pageY = touch && touch.pageY;
            if (_this.pressInLocation) {
                var movedDistance = _this._getDistanceBetweenPoints(pageX, pageY, _this.pressInLocation.pageX, _this.pressInLocation.pageY);
                if (movedDistance > LONG_PRESS_ALLOWED_MOVEMENT) {
                    _this._cancelLongPressDelayTimeout();
                }
            }
            if (_this.checkTouchWithinActive(e)) {
                _this._receiveSignal(Signals.ENTER_PRESS_RECT, e);
                var curState = _this.touchable.touchState;
                if (curState === States.RESPONDER_INACTIVE_PRESS_IN) {
                    _this._cancelLongPressDelayTimeout();
                }
            } else {
                _this._cancelLongPressDelayTimeout();
                _this._receiveSignal(Signals.LEAVE_PRESS_RECT, e);
            }
        };
        return _this;
    }

    _createClass(Touchable, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.root = react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.findDOMNode(this);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.root = react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.findDOMNode(this);
            // disabled auto clear active state
            if (this.props.disabled && this.state.active) {
                this.setState({
                    active: false
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.releaseLockTimer) {
                clearTimeout(this.releaseLockTimer);
            }
            if (this.touchableDelayTimeout) {
                clearTimeout(this.touchableDelayTimeout);
            }
            if (this.longPressDelayTimeout) {
                clearTimeout(this.longPressDelayTimeout);
            }
            if (this.pressOutDelayTimeout) {
                clearTimeout(this.pressOutDelayTimeout);
            }
        }
    }, {
        key: 'callChildEvent',
        value: function callChildEvent(event, e) {
            var childHandle = react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.only(this.props.children).props[event];
            if (childHandle) {
                childHandle(e);
            }
        }
    }, {
        key: '_remeasureMetricsOnInit',
        value: function _remeasureMetricsOnInit(e) {
            var root = this.root;

            var touch = extractSingleTouch(e);
            var boundingRect = root.getBoundingClientRect();
            this.touchable = {
                touchState: this.touchable.touchState,
                startMouse: {
                    pageX: touch.pageX,
                    pageY: touch.pageY
                },
                positionOnGrant: {
                    left: boundingRect.left + window.pageXOffset,
                    top: boundingRect.top + window.pageYOffset,
                    width: boundingRect.width,
                    height: boundingRect.height,
                    clientLeft: boundingRect.left,
                    clientTop: boundingRect.top
                }
            };
        }
    }, {
        key: 'processActiveStopPropagation',
        value: function processActiveStopPropagation(e) {
            var nativeEvent = e.nativeEvent || e;
            this.shouldActive = !nativeEvent.__activeStopPropagation;
            if (this.props.activeStopPropagation) {
                nativeEvent.__activeStopPropagation = 1;
            }
        }
    }, {
        key: 'touchableHandleResponderGrant',
        value: function touchableHandleResponderGrant(e) {
            var _this2 = this;

            this.touchable.touchState = States.NOT_RESPONDER;
            if (this.pressOutDelayTimeout) {
                clearTimeout(this.pressOutDelayTimeout);
                this.pressOutDelayTimeout = null;
            }
            if (this.props.fixClickPenetration && !isAllowPress()) {
                return;
            }
            this._remeasureMetricsOnInit(e);
            this._receiveSignal(Signals.RESPONDER_GRANT, e);
            var _props = this.props,
                delayMS = _props.delayPressIn,
                longDelayMS = _props.delayLongPress;

            this.processActiveStopPropagation(e);
            if (delayMS) {
                this.touchableDelayTimeout = setTimeout(function () {
                    _this2._handleDelay(e);
                }, delayMS);
            } else {
                this._handleDelay(e);
            }
            var longPressEvent = new _PressEvent__WEBPACK_IMPORTED_MODULE_2__["default"](e);
            this.longPressDelayTimeout = setTimeout(function () {
                _this2._handleLongDelay(longPressEvent);
            }, longDelayMS + delayMS);
        }
    }, {
        key: 'checkScroll',
        value: function checkScroll(e) {
            var positionOnGrant = this.touchable.positionOnGrant;
            // container or window scroll
            var boundingRect = this.root.getBoundingClientRect();
            if (boundingRect.left !== positionOnGrant.clientLeft || boundingRect.top !== positionOnGrant.clientTop) {
                this._receiveSignal(Signals.RESPONDER_TERMINATED, e);
                return true;
            }
            return false;
        }
    }, {
        key: 'touchableHandleResponderRelease',
        value: function touchableHandleResponderRelease(e) {
            if (!this.touchable.startMouse) {
                return;
            }
            var touch = extractSingleTouch(e);
            if (Math.abs(touch.pageX - this.touchable.startMouse.pageX) > 30 || Math.abs(touch.pageY - this.touchable.startMouse.pageY) > 30) {
                this._receiveSignal(Signals.RESPONDER_TERMINATED, e);
                return;
            }
            if (this.checkScroll(e)) {
                return;
            }
            this._receiveSignal(Signals.RESPONDER_RELEASE, e);
        }
    }, {
        key: 'touchableHandleResponderTerminate',
        value: function touchableHandleResponderTerminate(e) {
            if (!this.touchable.startMouse) {
                return;
            }
            this._receiveSignal(Signals.RESPONDER_TERMINATED, e);
        }
    }, {
        key: 'checkTouchWithinActive',
        value: function checkTouchWithinActive(e) {
            var positionOnGrant = this.touchable.positionOnGrant;
            var _props2 = this.props,
                _props2$pressRetentio = _props2.pressRetentionOffset,
                pressRetentionOffset = _props2$pressRetentio === undefined ? {} : _props2$pressRetentio,
                hitSlop = _props2.hitSlop;

            var pressExpandLeft = pressRetentionOffset.left;
            var pressExpandTop = pressRetentionOffset.top;
            var pressExpandRight = pressRetentionOffset.right;
            var pressExpandBottom = pressRetentionOffset.bottom;
            if (hitSlop) {
                pressExpandLeft += hitSlop.left;
                pressExpandTop += hitSlop.top;
                pressExpandRight += hitSlop.right;
                pressExpandBottom += hitSlop.bottom;
            }
            var touch = extractSingleTouch(e);
            var pageX = touch && touch.pageX;
            var pageY = touch && touch.pageY;
            return pageX > positionOnGrant.left - pressExpandLeft && pageY > positionOnGrant.top - pressExpandTop && pageX < positionOnGrant.left + positionOnGrant.width + pressExpandRight && pageY < positionOnGrant.top + positionOnGrant.height + pressExpandBottom;
        }
    }, {
        key: 'callProp',
        value: function callProp(name, e) {
            if (this.props[name] && !this.props.disabled) {
                this.props[name](e);
            }
        }
    }, {
        key: 'touchableHandleActivePressIn',
        value: function touchableHandleActivePressIn(e) {
            if (this.shouldActive) {
                this.setActive(true);
            }
            this.callProp('onPressIn', e);
        }
    }, {
        key: 'touchableHandleActivePressOut',
        value: function touchableHandleActivePressOut(e) {
            this.setActive(false);
            this.callProp('onPressOut', e);
        }
    }, {
        key: 'touchableHandlePress',
        value: function touchableHandlePress(e) {
            if (Object(_PressEvent__WEBPACK_IMPORTED_MODULE_2__["shouldFirePress"])(e)) {
                this.callProp('onPress', e);
            }
            lastClickTime = Date.now();
        }
    }, {
        key: 'touchableHandleLongPress',
        value: function touchableHandleLongPress(e) {
            if (Object(_PressEvent__WEBPACK_IMPORTED_MODULE_2__["shouldFirePress"])(e)) {
                this.callProp('onLongPress', e);
            }
        }
    }, {
        key: 'setActive',
        value: function setActive(active) {
            if (this.state.active !== active && (this.props.activeClassName || this.props.activeStyle)) {
                this.setState({
                    active: active
                });
            }
        }
    }, {
        key: '_remeasureMetricsOnActivation',
        value: function _remeasureMetricsOnActivation() {
            this.touchable.dimensionsOnActivate = this.touchable.positionOnGrant;
        }
    }, {
        key: '_handleDelay',
        value: function _handleDelay(e) {
            this.touchableDelayTimeout = null;
            this._receiveSignal(Signals.DELAY, e);
        }
    }, {
        key: '_handleLongDelay',
        value: function _handleLongDelay(e) {
            this.longPressDelayTimeout = null;
            var curState = this.touchable.touchState;
            if (curState !== States.RESPONDER_ACTIVE_PRESS_IN && curState !== States.RESPONDER_ACTIVE_LONG_PRESS_IN) {
                console.error('Attempted to transition from state `' + curState + '` to `' + States.RESPONDER_ACTIVE_LONG_PRESS_IN + '`, which is not supported. This is ' + 'most likely due to `Touchable.longPressDelayTimeout` not being cancelled.');
            } else {
                this._receiveSignal(Signals.LONG_PRESS_DETECTED, e);
            }
        }
    }, {
        key: '_receiveSignal',
        value: function _receiveSignal(signal, e) {
            var curState = this.touchable.touchState;
            var nextState = Transitions[curState] && Transitions[curState][signal];
            if (!nextState) {
                return;
            }
            if (nextState === States.ERROR) {
                return;
            }
            if (curState !== nextState) {
                this._performSideEffectsForTransition(curState, nextState, signal, e);
                this.touchable.touchState = nextState;
            }
        }
    }, {
        key: '_cancelLongPressDelayTimeout',
        value: function _cancelLongPressDelayTimeout() {
            if (this.longPressDelayTimeout) {
                clearTimeout(this.longPressDelayTimeout);
                this.longPressDelayTimeout = null;
            }
        }
    }, {
        key: '_isHighlight',
        value: function _isHighlight(state) {
            return state === States.RESPONDER_ACTIVE_PRESS_IN || state === States.RESPONDER_ACTIVE_LONG_PRESS_IN;
        }
    }, {
        key: '_savePressInLocation',
        value: function _savePressInLocation(e) {
            var touch = extractSingleTouch(e);
            var pageX = touch && touch.pageX;
            var pageY = touch && touch.pageY;
            this.pressInLocation = { pageX: pageX, pageY: pageY };
        }
    }, {
        key: '_getDistanceBetweenPoints',
        value: function _getDistanceBetweenPoints(aX, aY, bX, bY) {
            var deltaX = aX - bX;
            var deltaY = aY - bY;
            return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }
    }, {
        key: '_performSideEffectsForTransition',
        value: function _performSideEffectsForTransition(curState, nextState, signal, e) {
            var curIsHighlight = this._isHighlight(curState);
            var newIsHighlight = this._isHighlight(nextState);
            var isFinalSignal = signal === Signals.RESPONDER_TERMINATED || signal === Signals.RESPONDER_RELEASE;
            if (isFinalSignal) {
                this._cancelLongPressDelayTimeout();
            }
            if (!IsActive[curState] && IsActive[nextState]) {
                this._remeasureMetricsOnActivation();
            }
            if (IsPressingIn[curState] && signal === Signals.LONG_PRESS_DETECTED) {
                this.touchableHandleLongPress(e);
            }
            if (newIsHighlight && !curIsHighlight) {
                this._startHighlight(e);
            } else if (!newIsHighlight && curIsHighlight) {
                this._endHighlight(e);
            }
            if (IsPressingIn[curState] && signal === Signals.RESPONDER_RELEASE) {
                var hasLongPressHandler = !!this.props.onLongPress;
                var pressIsLongButStillCallOnPress = IsLongPressingIn[curState] && ( // We *are* long pressing..
                !hasLongPressHandler || // But either has no long handler
                !this.props.longPressCancelsPress // or we're told to ignore it.
                );
                var shouldInvokePress = !IsLongPressingIn[curState] || pressIsLongButStillCallOnPress;
                if (shouldInvokePress) {
                    if (!newIsHighlight && !curIsHighlight) {
                        // we never highlighted because of delay, but we should highlight now
                        this._startHighlight(e);
                        this._endHighlight(e);
                    }
                    this.touchableHandlePress(e);
                }
            }
            if (this.touchableDelayTimeout) {
                clearTimeout(this.touchableDelayTimeout);
                this.touchableDelayTimeout = null;
            }
        }
    }, {
        key: '_startHighlight',
        value: function _startHighlight(e) {
            this._savePressInLocation(e);
            this.touchableHandleActivePressIn(e);
        }
    }, {
        key: '_endHighlight',
        value: function _endHighlight(e) {
            var _this3 = this;

            if (this.props.delayPressOut) {
                this.pressOutDelayTimeout = setTimeout(function () {
                    _this3.touchableHandleActivePressOut(e);
                }, this.props.delayPressOut);
            } else {
                this.touchableHandleActivePressOut(e);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                children = _props3.children,
                disabled = _props3.disabled,
                activeStyle = _props3.activeStyle,
                activeClassName = _props3.activeClassName;

            var events = disabled ? undefined : copy(this, ['onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel', 'onMouseDown']);
            var child = react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.only(children);
            if (!disabled && this.state.active) {
                var _child$props = child.props,
                    style = _child$props.style,
                    className = _child$props.className;

                if (activeStyle) {
                    style = _extends({}, style, activeStyle);
                }
                if (activeClassName) {
                    if (className) {
                        className += ' ' + activeClassName;
                    } else {
                        className = activeClassName;
                    }
                }
                return react__WEBPACK_IMPORTED_MODULE_0___default.a.cloneElement(child, _extends({ className: className,
                    style: style }, events));
            }
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.cloneElement(child, events);
        }
    }]);

    return Touchable;
}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);

/* harmony default export */ __webpack_exports__["default"] = (Touchable);

Touchable.defaultProps = {
    fixClickPenetration: false,
    disabled: false,
    delayPressIn: HIGHLIGHT_DELAY_MS,
    delayLongPress: LONG_PRESS_DELAY_MS,
    delayPressOut: 100,
    pressRetentionOffset: {
        left: PRESS_EXPAND_PX,
        right: PRESS_EXPAND_PX,
        top: PRESS_EXPAND_PX,
        bottom: PRESS_EXPAND_PX
    },
    hitSlop: undefined,
    longPressCancelsPress: true
};

/***/ }),

/***/ "./packages/mp-core/node_modules/react-is/cjs/react-is.development.js":
/*!****************************************************************************!*\
  !*** ./packages/mp-core/node_modules/react-is/cjs/react-is.development.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
// (unstable) APIs that have been removed. Can we remove the symbols?

var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
}

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_ASYNC_MODE_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;

          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
} // AsyncMode is deprecated along with isAsyncMode

var AsyncMode = REACT_ASYNC_MODE_TYPE;
var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;
var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
    }
  }

  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
}
function isConcurrentMode(object) {
  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

exports.AsyncMode = AsyncMode;
exports.ConcurrentMode = ConcurrentMode;
exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
exports.isValidElementType = isValidElementType;
exports.typeOf = typeOf;
  })();
}


/***/ }),

/***/ "./packages/mp-core/node_modules/react-is/index.js":
/*!*********************************************************!*\
  !*** ./packages/mp-core/node_modules/react-is/index.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "./packages/mp-core/node_modules/react-is/cjs/react-is.development.js");
}


/***/ }),

/***/ "./packages/mp/es/button/index.js":
/*!****************************************!*\
  !*** ./packages/mp/es/button/index.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "./packages/mp/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _hulk_mp_core_es_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @hulk/mp-core/es/mixins/BasicEventMixin */ "./packages/mp-core/es/mixins/BasicEventMixin.js");
/* harmony import */ var _shared_Button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/Button */ "./packages/mp/es/shared/Button.js");
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");
/* harmony import */ var _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/callInternalAPI */ "./packages/mp/es/utils/callInternalAPI.js");
/* harmony import */ var _utils_callBridge__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/callBridge */ "./packages/mp/es/utils/callBridge.js");
/* harmony import */ var _utils_TestMixin__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/TestMixin */ "./packages/mp/es/utils/TestMixin.js");
/* harmony import */ var _utils_trackTap__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/trackTap */ "./packages/mp/es/utils/trackTap.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }











var FollowStatus = {
  followed: 1,
  userCancel: 2,
  unknownError: 3
};
var AButton = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_5__["createComponent"])({
  name: 'button'
})(create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'Button',
  mixins: [Object(_hulk_mp_core_es_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_3__["default"])(), _utils_TestMixin__WEBPACK_IMPORTED_MODULE_8__["default"]],
  getDefaultProps: function getDefaultProps() {
    return {
      hoverStartTime: 20,
      hoverStayTime: 70,
      hoverClass: 'a-button-active'
    };
  },
  contextTypes: {
    form: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.any
  },
  addFollow: function addFollow() {
    var _props = this.props;
    var publicId = _props.publicId;
    var onFollowLifestyle = _props.onFollowLifestyle;
    var $mp = _props.$mp;
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__["default"])('addFollow', {
      publicId: publicId,
      sourceId: 'tinyApp'
    }, function (res) {
      var followed = res.success === 'true';

      if (onFollowLifestyle) {
        onFollowLifestyle($mp.getNormalizedEvent('follow', {
          detail: {
            followStatus: followed ? FollowStatus.followed : FollowStatus.unknownError
          }
        }));
      }

      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_7__["default"])('toast', {
        content: followed ? '关注成功' : '关注失败'
      });
    });
  },
  onButtonTap: function onButtonTap(e) {
    var _this = this;

    this.onTap(e);
    var _props2 = this.props;
    var formType = _props2.formType;
    var openType = _props2.openType;
    var appParameter = _props2.appParameter;
    var $mp = _props2.$mp;
    var form = this.context.form;

    if (form) {
      if (formType === 'submit') {
        form.submit(this.props.$mp.getDataset());
      } else if (formType === 'reset') {
        form.reset();
      }
    }

    if (openType === 'share') {
      var page = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"])();

      if (page && page.publicInstance.onShareAppMessage) {
        page.callRemote('self', 'startShare', $mp.getNormalizedEvent('share'));
      }
    }

    if (openType === 'getAuthorize') {
      var _props3 = this.props;
      var onGetAuthorize = _props3.onGetAuthorize;
      var onError = _props3.onError;
      var scope = _props3.scope;

      if (!scope || typeof scope !== 'string') {
        if (onError) {
          onError($mp.getNormalizedEvent('error', {
            detail: {
              errorMessage: '请输入合法的scope',
              type: 'getAuthorize'
            }
          }));
        }
      } else {
        var scopes = scope.replace(/ /g, '').split(',');
        Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__["default"])('getComponentAuth', {
          scopeNicks: scopes
        }, function (res) {
          if (res.error) {
            if (onError) {
              onError($mp.getNormalizedEvent('error', {
                detail: {
                  errorMessage: res.errorMessage || res.errorDesc,
                  type: 'getAuthorize'
                }
              }));
            }
          } else if (onGetAuthorize) {
            onGetAuthorize($mp.getNormalizedEvent('getAuthorize'));
          }
        });
      }
    }

    if (openType === 'launchApp') {
      Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_6__["default"])('launchApp', {
        resultData: appParameter
      }, function (res) {
        var onError = _this.props.onError;

        if (res.error) {
          if (onError) {
            onError($mp.getNormalizedEvent('error', {
              detail: {
                errorMessage: res.errorMessage,
                type: 'launchApp'
              }
            }));
          }
        }
      });
    }

    if (openType === 'contactShare') {
      var _page = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"])();

      if (_page && _page.publicInstance.onShareAppMessage) {
        _page.callRemote('self', 'shareToAlipayContact', $mp.getNormalizedEvent('share'));
      }
    }

    if (openType === 'lifestyle') {
      var onFollowLifestyle = this.props.onFollowLifestyle;
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_9__.default)('confirm', {
        title: '提示',
        message: '确认关注此生活号?',
        okButton: '关注生活号',
        cancelButton: '暂不关注'
      }, function (res) {
        if (res.ok === true) {
          _this.addFollow();
        } else {
          onFollowLifestyle($mp.getNormalizedEvent('follow', {
            detail: {
              followStatus: FollowStatus.userCancel
            }
          }));
        }
      });
    }

    Object(_utils_trackTap__WEBPACK_IMPORTED_MODULE_9__["default"])(this);
    this.logTestId();
  },
  render: function render() {
    var props = this.props;
    var type = props.type;

    if (props.plain) {
      type = 'ghost';
    }

    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_shared_Button__WEBPACK_IMPORTED_MODULE_4__["default"], _objectSpread({
      id: props.id,
      size: props.size,
      activeStopPropagation: props.hoverStopPropagation,
      activeClassName: props.hoverClass,
      className: props.className,
      style: props.style,
      delayPressIn: props.hoverStartTime,
      delayPressOut: props.hoverStayTime,
      onClick: this.onButtonTap,
      type: type,
      disabled: props.disabled,
      loading: props.loading
    }, this.getTestProps(), {}, props.$mp.getAriaProps()), props.children);
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (AButton);

/***/ }),

/***/ "./packages/mp/es/checkbox-group/index.js":
/*!************************************************!*\
  !*** ./packages/mp/es/checkbox-group/index.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "./packages/mp/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _view_View__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../view/View */ "./packages/mp/es/view/View.js");
/* harmony import */ var _form_mixin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../form/mixin */ "./packages/mp/es/form/mixin.js");
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }







var CheckboxGroup = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_5__["createComponent"])({
  pure: false,
  name: 'checkbox-group'
})(create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'CheckboxGroup',
  childContextTypes: {
    checkboxGroup: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.any
  },
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_4__["default"]],
  getChildContext: function getChildContext() {
    return {
      checkboxGroup: this
    };
  },
  onChange: function onChange(e) {
    var _e$detail = e.detail,
        value2 = _e$detail.value2,
        value = _e$detail.value;
    this.updateValue(value2, value);

    if (this.props.onChange) {
      this.props.onChange(this.props.$mp.getNormalizedEvent('change', {
        detail: {
          value: this.state.value
        }
      }));
    }
  },
  updateValue: function updateValue(value, checked) {
    var allValue = this.state.value && this.state.value || [];

    if (checked && allValue.indexOf(value) === -1) {
      allValue.push(value);
    } else if (!checked) {
      var index = allValue.indexOf(value);

      if (index !== -1) {
        allValue.splice(index, 1);
      }
    }

    this.state.value = allValue;
  },
  render: function render() {
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_view_View__WEBPACK_IMPORTED_MODULE_3__["default"], _objectSpread({}, this.props, {
      role: 'group'
    }));
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (CheckboxGroup);

/***/ }),

/***/ "./packages/mp/es/checkbox/index.js":
/*!******************************************!*\
  !*** ./packages/mp/es/checkbox/index.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "./packages/mp/node_modules/prop-types/index.js");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _shared_Checkbox__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/Checkbox */ "./packages/mp/es/shared/Checkbox.js");
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");





/* harmony default export */ __webpack_exports__["default"] = (Object(_framework_dev__WEBPACK_IMPORTED_MODULE_4__["createComponent"])({
  pure: false,
  name: 'checkbox'
})(create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'Checkbox',
  // no formMixin, manage value by radio-group
  statics: {
    isFormControl: 1
  },
  getDefaultProps: function getDefaultProps() {
    return {
      checked: false,
      disabled: false,
      value: '',
      controlled: false
    };
  },
  contextTypes: {
    checkboxGroup: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.any
  },
  getInitialState: function getInitialState() {
    var state = {
      checked: !!this.props.checked
    };
    var context = this.context;
    var checkboxGroup = context.checkboxGroup;

    if (checkboxGroup) {
      checkboxGroup.updateValue(this.props.value, state.checked);
    }

    return state;
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    var context = this.context;
    var checkboxGroup = context.checkboxGroup;

    if (checkboxGroup) {
      if (checkboxGroup.isResetting) {
        var value = checkboxGroup.state.value || [];
        this.setState({
          checked: value.indexOf(this.props.value) !== -1
        });
        return;
      }
    }

    if (this.props.checked !== prevProps.checked) {
      this.setState({
        checked: this.props.checked
      });

      if (checkboxGroup) {
        checkboxGroup.updateValue(this.props.value, this.props.checked);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    var checkboxGroup = this.context.checkboxGroup;

    if (checkboxGroup) {
      var index1 = -1;

      if (checkboxGroup.initialValue) {
        index1 = checkboxGroup.initialValue.indexOf(this.props.value);
      }

      if (index1 !== -1) {
        checkboxGroup.initialValue.splice(index1, 1);
      }

      var index2 = checkboxGroup.state.value && checkboxGroup.state.value.indexOf(this.props.value);

      if (index2 !== -1 && checkboxGroup.state.value) {
        checkboxGroup.state.value.splice(index2, 1);
      }
    }
  },
  onClick: function onClick() {
    if (!this.props.disabled) {
      this.onChange({
        target: {
          checked: !this.state.checked
        }
      });
    }
  },
  onChange: function onChange(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    var controlled = this.props.controlled;
    var checked = e.target.checked;

    if (!controlled) {
      this.setState({
        checked: checked
      });
    }

    var context = this.context;

    if (context.checkboxGroup) {
      context.checkboxGroup.onChange({
        detail: {
          value: checked,
          value2: this.props.value
        }
      });
    }

    if (this.props.onChange) {
      this.props.onChange(this.props.$mp.getNormalizedEvent('change', {
        detail: {
          value: checked
        }
      }));
    }
  },
  render: function render() {
    var _this$props = this.props,
        disabled = _this$props.disabled,
        className = _this$props.className,
        style = _this$props.style,
        id = _this$props.id,
        controlled = _this$props.controlled,
        color = _this$props.color;
    var checked = controlled ? this.props.checked : this.state.checked;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_shared_Checkbox__WEBPACK_IMPORTED_MODULE_3__["default"], {
      prefixCls: 'a-checkbox',
      className: className,
      id: id,
      style: style,
      checked: checked,
      disabled: disabled,
      onChange: this.onChange,
      color: color
    });
  }
})));

/***/ }),

/***/ "./packages/mp/es/form/mixin.js":
/*!**************************************!*\
  !*** ./packages/mp/es/form/mixin.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_core_es_form_mixin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp-core/es/form/mixin */ "./packages/mp-core/es/form/mixin.js");

/* harmony default export */ __webpack_exports__["default"] = (_hulk_mp_core_es_form_mixin__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./packages/mp/es/framework/dev.js":
/*!*****************************************!*\
  !*** ./packages/mp/es/framework/dev.js ***!
  \*****************************************/
/*! exports provided: EventHub, getStartupParams, setStartupParams, App, setCurrentPageImpl, getCurrentPageImpl, getCurrentPagesImpl, getApp, getAppImpl, getCurrentPages, WorkerComponent, getComponentClass, StyleSheet, createComponent, Page, $global */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_core_es_framework_EventHub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp-core/es/framework/EventHub */ "./packages/mp-core/es/framework/EventHub.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EventHub", function() { return _hulk_mp_core_es_framework_EventHub__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _hulk_mp_core_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @hulk/mp-core/es/framework/startupParams */ "./packages/mp-core/es/framework/startupParams/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return _hulk_mp_core_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_1__["getStartupParams"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return _hulk_mp_core_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_1__["setStartupParams"]; });

/* harmony import */ var _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @hulk/mp-core/es/framework/App */ "./packages/mp-core/es/framework/App/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setCurrentPageImpl", function() { return _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__["setCurrentPageImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPageImpl", function() { return _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPagesImpl", function() { return _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__["getCurrentPagesImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getAppImpl", function() { return _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _hulk_mp_core_es_framework_App__WEBPACK_IMPORTED_MODULE_2__["getCurrentPages"]; });

/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./index */ "./packages/mp/es/framework/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WorkerComponent", function() { return _index__WEBPACK_IMPORTED_MODULE_3__["WorkerComponent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getComponentClass", function() { return _index__WEBPACK_IMPORTED_MODULE_3__["getComponentClass"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StyleSheet", function() { return _index__WEBPACK_IMPORTED_MODULE_3__["StyleSheet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComponent", function() { return _index__WEBPACK_IMPORTED_MODULE_3__["createComponent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _index__WEBPACK_IMPORTED_MODULE_3__["Page"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _index__WEBPACK_IMPORTED_MODULE_3__["$global"]; });







/***/ }),

/***/ "./packages/mp/es/framework/index.js":
/*!*******************************************!*\
  !*** ./packages/mp/es/framework/index.js ***!
  \*******************************************/
/*! exports provided: WorkerComponent, getComponentClass, StyleSheet, createComponent, Page, App, getApp, getCurrentPages, $global */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp-core/es/framework */ "./packages/mp-core/es/framework/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "WorkerComponent", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["WorkerComponent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getComponentClass", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["getComponentClass"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StyleSheet", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["StyleSheet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComponent", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["createComponent"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["Page"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["getCurrentPages"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _hulk_mp_core_es_framework__WEBPACK_IMPORTED_MODULE_0__["$global"]; });

/* harmony import */ var _hulk_mp_core_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @hulk/mp-core/es/framework/startupParams */ "./packages/mp-core/es/framework/startupParams/index.js");
/* harmony import */ var _hulk_mp_core_es_framework_web_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @hulk/mp-core/es/framework/web/bootstrap */ "./packages/mp-core/es/framework/web/bootstrap.js");
/* harmony import */ var _hulk_mp_core_es_utils_log__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @hulk/mp-core/es/utils/log */ "./packages/mp-core/es/utils/log.js");
/* harmony import */ var _utils_reportError__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/reportError */ "./packages/mp/es/utils/reportError.js");
/* harmony import */ var _utils_errorCodes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/errorCodes */ "./packages/mp/es/utils/errorCodes.js");
/* harmony import */ var _utils_escapeLogParams__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/escapeLogParams */ "./packages/mp/es/utils/escapeLogParams.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/system */ "./packages/mp/es/utils/system.js");








var g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_7__["compareSystemVersion"])('10.1.35') >= 0;
var g = self;

function ready(callback) {
  callback();
}

g.onerror = function () {
  var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var url = arguments.length > 1 ? arguments[1] : undefined;
  var line = arguments.length > 2 ? arguments[2] : undefined;
  var col = arguments.length > 3 ? arguments[3] : undefined;
  var error = arguments.length > 4 ? arguments[4] : undefined;
  var stack = [];

  try {
    stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
  } catch (e) {}

  var e = {
    msg: msg,
    url: url,
    line: line,
    col: col,
    error: {
      column: error.column,
      line: error.line,
      message: error.message,
      sourceURL: error.sourceURL,
      stack: stack
    }
  };
  var args = [msg, url, line, col, error];

  if (msg.indexOf('nebula work error') === 0) {
    Object(_utils_reportError__WEBPACK_IMPORTED_MODULE_4__["default"])(_utils_errorCodes__WEBPACK_IMPORTED_MODULE_5__["REGISTER_WORKER_ERROR"], e);
    console.error('[RENDER] registerWorker error', args);
  } else {
    Object(_utils_reportError__WEBPACK_IMPORTED_MODULE_4__["default"])(_utils_errorCodes__WEBPACK_IMPORTED_MODULE_5__["RENDER_GLOBAL_ERROR"], e);
    console.error('[RENDER] onerror', args);
  }
};

g.bootstrapApp = function () {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var container = config.container,
      _config$onReady = config.onReady,
      onReady = _config$onReady === void 0 ? ready : _config$onReady,
      onRender = config.onRender,
      onFail = config.onFail;
  onReady(function (runInfo) {
    var _ref = runInfo || {},
        bridge = _ref.bridge;

    var startupParams = bridge.startupParams;

    function logBootstrap(step) {
      var appId = startupParams.appId;
      bridge.call('remoteLog', {
        param4: Object(_utils_escapeLogParams__WEBPACK_IMPORTED_MODULE_6__["default"])({
          step: step
        }),
        type: 'behavior',
        seedId: "TinyApp-".concat(appId, "-render-bootstrap"),
        actionId: 'event',
        logLevel: 1
      });
    }

    logBootstrap('web ready');
    Object(_hulk_mp_core_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_1__["setStartupParams"])(startupParams);
    var needPass = ['apiMessageChannel', 'appId', 'debug', 'query', 'app_startup_type', 'chInfo', 'isInternalApp', 'isNotTinyProcess', 'referrerInfo', 'hasNativeCanvas']; // android change ua across page??

    if (_utils_system__WEBPACK_IMPORTED_MODULE_7__["isIOS"]) {
      needPass.push('ap_framework_sceneId');
    }

    var query = '';
    needPass.forEach(function (k) {
      if (startupParams[k]) {
        query += "&".concat(k, "=").concat(encodeURIComponent(startupParams[k]));
      }
    });

    if (location.hash.length > 1) {
      Object(_hulk_mp_core_es_utils_log__WEBPACK_IMPORTED_MODULE_3__["debug"])('framework', '[RENDER] render page');
      Object(_hulk_mp_core_es_framework_web_bootstrap__WEBPACK_IMPORTED_MODULE_2__["render"])({
        container: container,
        onRender: onRender,
        onFail: onFail,
        type: 'initial hash'
      }, bridge);
    } else {
      window.addEventListener('hashchange', function () {
        Object(_hulk_mp_core_es_utils_log__WEBPACK_IMPORTED_MODULE_3__["debug"])('framework', '[RENDER] render page when hashchange');
        Object(_hulk_mp_core_es_framework_web_bootstrap__WEBPACK_IMPORTED_MODULE_2__["render"])({
          container: container,
          onRender: onRender,
          onFail: onFail,
          type: 'hashchange'
        }, bridge);
      }, false);
    }
  });
};



/***/ }),

/***/ "./packages/mp/es/image/index.js":
/*!***************************************!*\
  !*** ./packages/mp/es/image/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");
/* harmony import */ var _view_View__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../view/View */ "./packages/mp/es/view/View.js");
/* harmony import */ var _modeStyle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modeStyle */ "./packages/mp/es/image/modeStyle.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






var ImageTag = 'img';
var widthFixStyle = {
  visibility: 'hidden',
  width: '100%'
};
/* harmony default export */ __webpack_exports__["default"] = (Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__["createComponent"])({
  name: 'image'
})(create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'Image',
  getInitialState: function getInitialState() {
    return {
      lazyLoaded: !this.props.lazyLoad,
      loaded: false
    };
  },
  getDefaultProps: function getDefaultProps() {
    return {
      mode: 'scaleToFill',
      lazyLoad: false
    };
  },
  componentDidMount: function componentDidMount() {
    if (this.state.lazyLoaded) {
      this.initImg();
      this.updateSrc();
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    if (this.state.lazyLoaded) {
      this.initImg();

      if (this.props.src !== prevProps.src || this.props.lazyLoad && !this.lazyLoaded) {
        this.lazyLoaded = true;
        this.updateSrc();
      }
    }
  },
  shouldOnLoad: function shouldOnLoad() {
    return this.props.defaultSource || this.props.onLoad;
  },
  shouldOnError: function shouldOnError() {
    return this.props.defaultSource || this.props.onError;
  },
  initImg: function initImg() {
    var _this$props = this.props,
        onLoad = _this$props.onLoad,
        onError = _this$props.onError,
        defaultSource = _this$props.defaultSource,
        mode = _this$props.mode;

    if (mode === 'widthFix' || !onLoad && !onError && !defaultSource) {
      if (this.img) {
        this.img.onload = null;
        this.img.onerror = null;
        this.img = null;
      }

      return;
    }

    var img = this.img = this.img || new Image();

    if (this.shouldOnLoad() && !img.onload) {
      img.onload = this.onLoad;
    }

    if (this.shouldOnError() && !img.onerror) {
      img.onerror = this.onError;
    }
  },
  updateSrc: function updateSrc() {
    if (this.props.src && this.img) {
      this.img.src = this.props.$mp.getNormalizedSrc(this.props.src);
    }
  },
  onLoad: function onLoad(e) {
    // replace defaultSource with src
    if (this.props.defaultSource) {
      this.setState({
        loaded: true
      });
    }

    if (this.props.onLoad) {
      var img = e.target;
      this.props.onLoad(this.props.$mp.getNormalizedEvent('load', {
        detail: {
          width: img.naturalWidth,
          height: img.naturalHeight
        }
      }));
    }

    document.dispatchEvent(new CustomEvent('pageReRender', {}));
  },
  onError: function onError() {
    if (this.props.defaultSource) {
      this.setState({
        loaded: false
      });
    }

    if (this.props.onError) {
      this.props.onError(this.props.$mp.getNormalizedEvent('error', {
        detail: {
          errMsg: 'unknown error'
        }
      }));
    }
  },
  onImageLazyLoad: function onImageLazyLoad() {
    var lazyLoaded = this.state.lazyLoaded;

    if (!lazyLoaded) {
      this.setState({
        lazyLoaded: true
      });
    }
  },
  render: function render() {
    var _props2 = this.props;
    var className = _props2.className;
    var id = _props2.id;
    var mode = _props2.mode;
    var alt = _props2.alt;
    var $mp = _props2.$mp;
    var onTap = _props2.onTap;
    var onLongTap = _props2.onLongTap;
    var onTouchStart = _props2.onTouchStart;
    var onTouchMove = _props2.onTouchMove;
    var onTouchCancel = _props2.onTouchCancel;
    var onTouchEnd = _props2.onTouchEnd;
    var lazyLoad = _props2.lazyLoad;
    var _props3 = this.props;
    var src = _props3.src;
    var defaultSource = _props3.defaultSource;
    var style = _props3.style;
    var lazyLoaded = this.state.lazyLoaded;
    src = $mp.getNormalizedSrc(src);
    defaultSource = defaultSource && $mp.getNormalizedSrc(defaultSource);
    var onAppearProp = {};

    if (lazyLoad && !lazyLoaded) {
      onAppearProp = {
        onAppear: this.onImageLazyLoad,
        appearOffset: 50
      };
    }

    style = _objectSpread({
      backgroundImage: src && lazyLoaded ? defaultSource ? "url(".concat(this.state.loaded ? src : defaultSource, ")") : "url(".concat(src, ")") : undefined
    }, style, {}, _modeStyle__WEBPACK_IMPORTED_MODULE_4__["default"][mode]); // must has data props, or image onTap lose data

    var img = null;

    if (mode === 'widthFix' && lazyLoaded) {
      img = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(ImageTag, {
        src: src,
        style: widthFixStyle,
        onLoad: this.shouldOnLoad() ? this.onLoad : undefined,
        onError: this.shouldOnError() ? this.onError : undefined
      });
    }

    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_view_View__WEBPACK_IMPORTED_MODULE_3__["default"], _objectSpread({
      className: className,
      id: id,
      'aria-label': alt,
      $mp: $mp,
      style: style,
      onTap: onTap,
      onLongTap: onLongTap,
      onTouchStart: onTouchStart,
      onTouchMove: onTouchMove,
      onTouchCancel: onTouchCancel,
      onTouchEnd: onTouchEnd
    }, $mp.getAriaProps(), {}, $mp.getDataProps(), {}, onAppearProp), img);
  }
})));

/***/ }),

/***/ "./packages/mp/es/image/modeStyle.js":
/*!*******************************************!*\
  !*** ./packages/mp/es/image/modeStyle.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  scaleToFill: {
    backgroundSize: '100% 100%'
  },
  aspectFit: {
    backgroundSize: 'contain',
    backgroundPosition: 'center'
  },
  widthFix: {
    backgroundSize: 'contain',
    height: 'auto'
  },
  aspectFill: {
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  },
  top: {
    backgroundPosition: 'top'
  },
  bottom: {
    backgroundPosition: 'bottom'
  },
  center: {
    backgroundPosition: 'center'
  },
  left: {
    backgroundPosition: 'center left'
  },
  right: {
    backgroundPosition: 'center right'
  },
  'top left': {
    backgroundPosition: 'top left'
  },
  'top right': {
    backgroundPosition: 'top right'
  },
  'bottom left': {
    backgroundPosition: 'bottom left'
  },
  'bottom right': {
    backgroundPosition: 'bottom right'
  }
});

/***/ }),

/***/ "./packages/mp/es/input/index.js":
/*!***************************************!*\
  !*** ./packages/mp/es/input/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "./packages/mp/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_focusInput__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/focusInput */ "./packages/mp/es/utils/focusInput.js");
/* harmony import */ var _utils_callBridge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/callBridge */ "./packages/mp/es/utils/callBridge.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/system */ "./packages/mp/es/utils/system.js");
/* harmony import */ var _utils_rgba2Color__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/rgba2Color */ "./packages/mp/es/utils/rgba2Color.js");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/addEvents */ "./packages/mp/es/utils/addEvents.js");
/* harmony import */ var _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/callInternalAPI */ "./packages/mp/es/utils/callInternalAPI.js");
/* harmony import */ var _form_mixin__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../form/mixin */ "./packages/mp/es/form/mixin.js");
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }












var g = self;
var id = 0;
var cacheInputId = {};
var prefixCls = 'a-input';
var g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_5__["compareSystemVersion"])('10.1.38') >= 0;
var Input = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_10__["createComponent"])({
  name: 'input',
  pure: false
})(create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'Input',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_9__["default"]],
  getDefaultProps: function getDefaultProps() {
    return {
      value: '',
      type: 'text',
      password: false,
      placeholder: '',
      disabled: false,
      maxlength: 140,
      focus: false,
      confirmType: 'done',
      confirmHold: false,
      selectionStart: -1,
      selectionEnd: -1,
      controlled: false,
      randomNumber: false,
      enableNative: true,
      enableNewNativeInput: false
    };
  },
  getInitialState: function getInitialState() {
    this.compositionend = true;
    this.useNewInput = false;
    var _this$props = this.props,
        focus = _this$props.focus,
        enableNative = _this$props.enableNative,
        enableNewNativeInput = _this$props.enableNewNativeInput; // 10.1.20 ios支持input native化
    // 10.1.22 android支持input native化
    // 财富客户端 nebulaMng基线 10.1.15
    // 高德客户端 nebulaMng基线 10.1.20
    // 非支付宝客户端都不启用native 键盘

    if (true) {
      this.supportNative = enableNative === true && !_utils_system__WEBPACK_IMPORTED_MODULE_5__["isIDE"] && _utils_system__WEBPACK_IMPORTED_MODULE_5__["isNativeComponent"];

      if (g10138 && this.supportNative && enableNewNativeInput) {
        this.useNewInput = !_utils_system__WEBPACK_IMPORTED_MODULE_5__["isAndroid"];
      }
    } else {}

    return {
      focused: focus,
      compositionValue: ''
    };
  },
  componentDidMount: function componentDidMount() {
    if (this.useNewInput) {
      // android bug
      if (_utils_system__WEBPACK_IMPORTED_MODULE_5__["isAndroid"] && !cacheInputId[this.getId()]) {
        this.readyForRender = false;
        this.detachInputReady = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_7__["default"])(document, {
          'nbcomponent.canrender': this.onNativeReady
        });
      } else {
        this.readyForRender = true;
        this.renderNewInput(this.state.focused);
      }

      this.detachEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_7__["default"])(document, {
        'nbcomponent.input.input': this.onNewInputEvent,
        'nbcomponent.input.focus': this.onNewInputEvent,
        'nbcomponent.input.blur': this.onNewInputEvent,
        'nbcomponent.input.keydown': this.onNewInputEvent
      });
    } else {
      if (this.state.focused) {
        this.focus(true);
      }

      if (this.input) {
        // ios can not use react event
        this.inputEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_7__["default"])(this.input, {
          keydown: this.onKeyDown
        });
      }
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    var _this$props2 = this.props,
        focus = _this$props2.focus,
        syncInput = _this$props2.syncInput;
    var needFocus = !!focus && !prevProps.focus && !this.state.focused;

    if (this.useNewInput) {
      this.renderNewInput(needFocus);
    } else {
      // 新增隐藏属性 sync-input 当为true时可以在onInput等回调中执行native input同步web input的操作
      if (_utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"] && this.compositionend === true && syncInput && g._currentInput === this.input && g.AlipayH5Keyboad._getInputJsonWithElement) {
        Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_8__["default"])('resetNativeKeyBoardInput', g.AlipayH5Keyboad._getInputJsonWithElement(g._currentInput));
      }

      if (g._currentInput === this.input && this.compositionend === true) {
        var color = Object(_utils_rgba2Color__WEBPACK_IMPORTED_MODULE_6__["default"])(window.getComputedStyle(this.container, null).color);
        Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_8__["default"])('updateNativeKeyBoardInput', {
          text: "".concat(this.getCurrentValue()),
          color: color
        });
      }

      if (needFocus) {
        this.focus(false);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.input && this.inputEvents) {
      this.inputEvents.remove();
    }

    if (this.useNewInput) {
      if (this.detachInputReady) {
        this.detachInputReady.remove();
      }

      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_4__["default"])('NBComponent.remove', {
        element: this.getId()
      });
      this.detachEvents.remove();
    }
  },
  onNewInputEvent: function onNewInputEvent(e) {
    var type = e.type;
    var _e$data = e.data;
    var data = _e$data === undefined ? {} : _e$data;
    var element = data.element;
    var value = data.value;
    var marked = data.marked;
    var keyCode = data.keyCode;

    if (element === this.getId() && type !== undefined) {
      var realType = type.substring(18);
      var _this$props3 = this.props,
          $mp = _this$props3.$mp,
          onFocus = _this$props3.onFocus,
          onBlur = _this$props3.onBlur,
          onInput = _this$props3.onInput,
          onConfirm = _this$props3.onConfirm,
          controlled = _this$props3.controlled;

      switch (realType) {
        case 'focus':
          g._MpActiveNativeElement = this.getId();
          this.setState({
            focused: true
          });

          if (onFocus) {
            onFocus($mp.getNormalizedEvent('focus', {
              detail: {
                value: value
              }
            }));
          }

          break;

        case 'blur':
          g._MpActiveNativeElement = undefined;
          this.setState({
            focused: false
          });

          if (onBlur) {
            onBlur($mp.getNormalizedEvent('blur', {
              detail: {
                value: value
              }
            }));
          }

          break;

        case 'input':
          if (onInput && marked !== 'Y') {
            onInput($mp.getNormalizedEvent('input', {
              detail: {
                value: value
              }
            }));

            if (!controlled) {
              this.setState({
                value: value
              });
            }

            this.setState({
              compositionValue: ''
            });
          } else {
            this.setState({
              compositionValue: value
            });
          }

          break;

        case 'keydown':
          if (onConfirm && keyCode === 13) {
            onConfirm($mp.getNormalizedEvent('confirm', {
              detail: {
                value: value
              }
            }));
          }

          break;

        default:
          break;
      }
    }
  },
  renderNewInput: function renderNewInput(needFocus) {
    var _this = this;

    if (!this.readyForRender) {
      return;
    }

    this.clearRenderDelay();
    var _props4 = this.props;
    var type = _props4.type;
    var password = _props4.password;
    var disabled = _props4.disabled;
    var maxlength = _props4.maxlength;
    var confirmType = _props4.confirmType;
    var confirmHold = _props4.confirmHold;
    var selectionStart = _props4.selectionStart;
    var selectionEnd = _props4.selectionEnd;
    var randomNumber = _props4.randomNumber;
    var cursor = _props4.cursor;
    var value = this.getCurrentValue();
    var computedStyle = window.getComputedStyle(this.input, null);
    Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_4__["default"])('NBComponent.render', {
      element: this.getId(),
      data: {
        tagName: 'input',
        position: 'static',
        placeholder: '',
        type: password ? 'password' : 'text',
        keyboard: type,
        value: value,
        color: computedStyle.color,
        disabled: disabled,
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        fontWeight: computedStyle.fontWeight,
        lineHeight: computedStyle.lineHeight,
        maxlength: maxlength,
        canPaste: true,
        textAlign: computedStyle.textAlign,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd,
        returnType: confirmType,
        canReturn: confirmHold === true ? 'N' : 'Y',
        randomNumber: randomNumber === true ? 'Y' : 'N',
        cursor: cursor
      }
    }, function (e) {
      if (e.success && needFocus) {
        Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_4__["default"])('NBComponent.sendMessage', {
          actionType: 'focus',
          element: _this.getId()
        });
      }
    });
  },
  onInput: function onInput(e) {
    var _props5 = this.props;
    var onInput = _props5.onInput;
    var controlled = _props5.controlled;
    var $mp = _props5.$mp;
    var value = e.target.value; // 如果native的键盘  event会带marked属性，用于告知是否是中间态

    if (this.supportNative && _utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"]) {
      this.compositionend = e.nativeEvent.marked !== true;
    }

    if (onInput && this.compositionend === true) {
      onInput($mp.getNormalizedEvent('input', {
        detail: {
          value: value
        }
      }));
    }

    if (!controlled) {
      this.setState({
        value: value
      });
    }
  },
  onFocus: function onFocus() {
    var _props6 = this.props;
    var onFocus = _props6.onFocus;
    var $mp = _props6.$mp;
    var value = this.getCurrentValue();
    this.setState({
      focused: true
    });

    if (onFocus) {
      onFocus($mp.getNormalizedEvent('focus', {
        detail: {
          value: value
        }
      }));
    }
  },
  onBlur: function onBlur(e) {
    var _props7 = this.props;
    var password = _props7.password;
    var type = _props7.type; // ios 非password 都支持native化 android只有text支持

    if (!password && this.supportNative && (_utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"] || !_utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"] && type === 'text')) {
      if (e.nativeEvent.simulated) {
        this.blur();
      }
    } else {
      this.blur();
    }
  },
  blur: function blur() {
    var _props8 = this.props;
    var onBlur = _props8.onBlur;
    var $mp = _props8.$mp;
    var value = this.getCurrentValue();
    this.setState({
      focused: false
    });

    if (onBlur) {
      onBlur($mp.getNormalizedEvent('blur', {
        detail: {
          value: value
        }
      }));
    }
  },
  onKeyDown: function onKeyDown(e) {
    var _props9 = this.props;
    var onConfirm = _props9.onConfirm;
    var $mp = _props9.$mp;

    if (onConfirm && (e.keyCode === 13 || e.data && e.data.keyCode === 13)) {
      onConfirm($mp.getNormalizedEvent('confirm', {
        detail: {
          value: e.target.value
        }
      }));
    }
  },
  focus: function focus() {
    var inputFocus4Android = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var disabled = this.props.disabled;

    if (!disabled && this.input) {
      Object(_utils_focusInput__WEBPACK_IMPORTED_MODULE_3__["default"])(this.input, inputFocus4Android, this.supportNative);
    }
  },
  saveContainer: function saveContainer(container) {
    this.container = container;
  },
  saveInput: function saveInput(input) {
    this.input = input;
  },
  handleComposition: function handleComposition(e) {
    if (e.type === 'compositionend') {
      this.compositionend = true;
      var _props10 = this.props;
      var onInput = _props10.onInput;
      var $mp = _props10.$mp;

      if (onInput) {
        onInput($mp.getNormalizedEvent('input', {
          detail: {
            value: e.target.value
          }
        }));
      }
    } else {
      this.compositionend = false;
    }
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }

    this.id = this.props.id || "mp_input_".concat(++id);
    return this.id;
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheInputId[this.getId()] = true;
      this.renderNewInput();
    }
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachInputReady) {
      this.detachInputReady.remove();
      this.detachInputReady = null;
    }
  },
  render: function render() {
    var _classNames;

    var _props11 = this.props;
    var placeholder = _props11.placeholder;
    var type = _props11.type;
    var password = _props11.password;
    var disabled = _props11.disabled;
    var maxlength = _props11.maxlength;
    var className = _props11.className;
    var style = _props11.style;
    var id = _props11.id;
    var placeholderStyle = _props11.placeholderStyle;
    var placeholderClass = _props11.placeholderClass;
    var confirmType = _props11.confirmType;
    var confirmHold = _props11.confirmHold;
    var selectionStart = _props11.selectionStart;
    var selectionEnd = _props11.selectionEnd;
    var randomNumber = _props11.randomNumber;
    var cursor = _props11.cursor;
    var $mp = _props11.$mp;
    var value = this.getCurrentValue();
    var compositionValue = this.state.compositionValue;
    var kbParams = {
      type: 'text',
      // can not use onChange, react will fire onChange when enter on android
      // ios can not trigger onchange when type=digit
      onInput: this.onInput
    };
    /* text, number, idcard, digit */

    if (password) {
      kbParams.type = 'password';
    } else if (type === 'number' || type === 'digit' || type === 'idcard') {
      kbParams['data-keyboard'] = type;
      kbParams['data-randomnumber'] = randomNumber === true ? 'Y' : 'N';
    }

    if (!this.supportNative && kbParams.type === 'text' && _utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"]) {
      kbParams.onCompositionStart = this.handleComposition;
      kbParams.onCompositionEnd = this.handleComposition;
    } // input native化
    // ios 非password 都支持native化 android只有text支持


    if (!password && this.supportNative && (_utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"] || !_utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"] && kbParams.type === 'text')) {
      kbParams['data-keyboard'] = type;
      kbParams['data-selection-start'] = selectionStart;
      kbParams['data-selection-end'] = selectionEnd;
      kbParams['data-return-type'] = confirmType;
      kbParams['data-return'] = confirmHold === true ? 'N' : 'Y';

      if (cursor !== undefined) {
        kbParams['data-cursor'] = cursor;
      }
    }

    var placeholderCls = classnames__WEBPACK_IMPORTED_MODULE_2___default()((_classNames = {}, _classNames["".concat(prefixCls, "-placeholder")] = true, _classNames[placeholderClass] = !!placeholderClass, _classNames));
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('div', {
      className: className,
      id: id,
      style: style,
      ref: this.saveContainer
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('div', {
      className: "".concat(prefixCls, "-wrap")
    }, (typeof value === 'string' && value.length === 0 || !value && value !== 0) && compositionValue === '' && placeholder && react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('div', {
      className: placeholderCls,
      style: placeholderStyle ? $mp.getNormalizedStyle(placeholderStyle) : {}
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('span', null, placeholder)), this.useNewInput ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('input', {
      ref: this.saveInput,
      style: {
        position: 'absolute',
        visibility: 'hidden',
        zIndex: 0
      },
      className: "".concat(prefixCls, "-content")
    }) : null, this.useNewInput ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('object', {
      className: "".concat(prefixCls, "-content"),
      id: this.getId(),
      type: 'application/view'
    }, react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', {
      name: 'type',
      value: 'input'
    }), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('param', {
      name: 'id',
      value: this.getId()
    })) : react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('input', _objectSpread({
      ref: this.saveInput,
      className: "".concat(prefixCls, "-content"),
      value: value,
      disabled: disabled,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      maxLength: maxlength
    }, kbParams))));
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (Input);

/***/ }),

/***/ "./packages/mp/es/label/index.js":
/*!***************************************!*\
  !*** ./packages/mp/es/label/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }




/* harmony default export */ __webpack_exports__["default"] = (Object(_framework_dev__WEBPACK_IMPORTED_MODULE_2__["createComponent"])({
  pure: false,
  name: 'label'
})(create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  onClick: function onClick() {
    var forProp = this.props.for;

    if (forProp) {
      var input = document.querySelector("#".concat(forProp, " input,#").concat(forProp, " textarea"));

      if (input) {
        input.click();
        input.focus();
      }
    }
  },
  render: function render() {
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('label', _objectSpread({}, this.props, {
      onClick: this.onClick
    }));
  }
})));

/***/ }),

/***/ "./packages/mp/es/shared/Button.js":
/*!*****************************************!*\
  !*** ./packages/mp/es/shared/Button.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "./packages/mp/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var rc_touchable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rc-touchable */ "./packages/mp/node_modules/rc-touchable/es/index.js");
/* harmony import */ var _Loading__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Loading */ "./packages/mp/es/shared/Loading.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }





var prefixCls = 'a-button';

var Button = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(Button, _React$PureComponent);

  var _super = _createSuper(Button);

  function Button() {
    _classCallCheck(this, Button);

    return _super.apply(this, arguments);
  }

  _createClass(Button, [{
    key: "render",
    value: function render() {
      var _classnames;

      var _this$props = this.props,
          children = _this$props.children,
          className = _this$props.className,
          type = _this$props.type,
          size = _this$props.size,
          disabled = _this$props.disabled,
          loading = _this$props.loading,
          activeClassName = _this$props.activeClassName,
          activeStopPropagation = _this$props.activeStopPropagation,
          onClick = _this$props.onClick,
          delayPressIn = _this$props.delayPressIn,
          delayPressOut = _this$props.delayPressOut,
          restProps = _objectWithoutProperties(_this$props, ["children", "className", "type", "size", "disabled", "loading", "activeClassName", "activeStopPropagation", "onClick", "delayPressIn", "delayPressOut"]);

      var wrapCls = classnames__WEBPACK_IMPORTED_MODULE_1___default()((_classnames = {}, _defineProperty(_classnames, className, true), _defineProperty(_classnames, "".concat(prefixCls, "-primary"), type === 'primary'), _defineProperty(_classnames, "".concat(prefixCls, "-ghost"), type === 'ghost'), _defineProperty(_classnames, "".concat(prefixCls, "-warn"), type === 'warn'), _defineProperty(_classnames, "".concat(prefixCls, "-small"), size === 'mini'), _defineProperty(_classnames, "".concat(prefixCls, "-disabled"), disabled), _classnames));
      var clickable = {
        'data-clickable': true
      };
      var delayProps = {};

      if (delayPressIn) {
        delayProps.delayPressIn = delayPressIn;
      }

      if (delayPressOut) {
        delayProps.delayPressOut = delayPressOut;
      } // use div, button native is buggy @yiminghe


      return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(rc_touchable__WEBPACK_IMPORTED_MODULE_2__["default"], _objectSpread({
        activeClassName: activeClassName,
        activeStopPropagation: activeStopPropagation,
        disabled: disabled
      }, delayProps), react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('a', _objectSpread({
        role: 'button',
        className: wrapCls
      }, restProps, {}, clickable, {
        onClick: disabled ? undefined : onClick,
        'aria-disabled': disabled
      }), loading ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Loading__WEBPACK_IMPORTED_MODULE_3__["default"], {
        mode: type === 'primary' ? 'white' : ''
      }) : null, children));
    }
  }]);

  return Button;
}(react__WEBPACK_IMPORTED_MODULE_0___default.a.PureComponent);

/* harmony default export */ __webpack_exports__["default"] = (Button);

/***/ }),

/***/ "./packages/mp/es/shared/Checkbox.js":
/*!*******************************************!*\
  !*** ./packages/mp/es/shared/Checkbox.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Checkbox; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "./packages/mp/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Icon__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Icon */ "./packages/mp/es/shared/Icon.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }





var Checkbox = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(Checkbox, _React$PureComponent);

  var _super = _createSuper(Checkbox);

  function Checkbox() {
    _classCallCheck(this, Checkbox);

    return _super.apply(this, arguments);
  }

  _createClass(Checkbox, [{
    key: "render",
    value: function render() {
      var _classnames;

      var _this$props = this.props,
          id = _this$props.id,
          prefixCls = _this$props.prefixCls,
          _this$props$className = _this$props.className,
          className = _this$props$className === void 0 ? '' : _this$props$className,
          style = _this$props.style,
          _this$props$type = _this$props.type,
          type = _this$props$type === void 0 ? 'checkbox' : _this$props$type,
          disabled = _this$props.disabled,
          checked = _this$props.checked,
          onChange = _this$props.onChange,
          color = _this$props.color;
      var wrapCls = classnames__WEBPACK_IMPORTED_MODULE_1___default()((_classnames = {
        'a-shared-checkbox': true,
        'a-shared-checkbox-disabled': disabled
      }, _defineProperty(_classnames, className, true), _defineProperty(_classnames, "".concat(prefixCls, "-checked"), checked), _defineProperty(_classnames, "".concat(prefixCls, "-disabled"), disabled), _classnames));
      var colorProp = disabled ? {
        color: '#adadad'
      } : color ? {
        color: color
      } : {};
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("span", {
        className: wrapCls,
        style: style,
        id: id
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("input", {
        type: type,
        disabled: disabled,
        className: "".concat(prefixCls, "-input"),
        checked: !!checked,
        onChange: onChange
      }), checked ? /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_Icon__WEBPACK_IMPORTED_MODULE_2__["default"], _extends({
        type: type === 'radio' ? 'success' : 'success_no_circle',
        size: type === 'radio' ? 22 : 16
      }, colorProp)) : null);
    }
  }]);

  return Checkbox;
}(react__WEBPACK_IMPORTED_MODULE_0___default.a.PureComponent);



/***/ }),

/***/ "./packages/mp/es/shared/Icon.js":
/*!***************************************!*\
  !*** ./packages/mp/es/shared/Icon.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _createSprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createSprite */ "./packages/mp/es/shared/createSprite.js");



function Icon(props) {
  var _props$size = props.size,
      size = _props$size === void 0 ? 23 : _props$size,
      type = props.type,
      color = props.color;
  Object(_createSprite__WEBPACK_IMPORTED_MODULE_1__["default"])(type);
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", {
    className: "a-icon-svg a-icon-".concat(type),
    style: {
      width: size,
      height: size,
      fill: color
    }
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("use", {
    xlinkHref: "#".concat(type)
  }));
}

/* harmony default export */ __webpack_exports__["default"] = (Icon);

/***/ }),

/***/ "./packages/mp/es/shared/Loading.js":
/*!******************************************!*\
  !*** ./packages/mp/es/shared/Loading.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! classnames */ "./packages/mp/node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_1__);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }



var prefix = 'a-loading';

var Loading = /*#__PURE__*/function (_React$PureComponent) {
  _inherits(Loading, _React$PureComponent);

  var _super = _createSuper(Loading);

  function Loading() {
    _classCallCheck(this, Loading);

    return _super.apply(this, arguments);
  }

  _createClass(Loading, [{
    key: "render",
    value: function render() {
      var _classnames;

      var wrapCls = classnames__WEBPACK_IMPORTED_MODULE_1___default()((_classnames = {}, _defineProperty(_classnames, "".concat(prefix, "-indicator"), true), _defineProperty(_classnames, "white", this.props.mode === 'white'), _classnames));
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: wrapCls,
        "aria-hidden": true
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "".concat(prefix, "-item")
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "".concat(prefix, "-item")
      }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", {
        className: "".concat(prefix, "-item")
      }));
    }
  }]);

  return Loading;
}(react__WEBPACK_IMPORTED_MODULE_0___default.a.PureComponent);

/* harmony default export */ __webpack_exports__["default"] = (Loading);

/***/ }),

/***/ "./packages/mp/es/shared/assets/svgData.js":
/*!*************************************************!*\
  !*** ./packages/mp/es/shared/assets/svgData.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var svgData = {
  success: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><path d="M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zm28.749-84.5a1 1 0 0 0-.71.295L58.363 80.654l-13.75-13.651a1 1 0 0 0-.705-.29H32.752L58.362 93.7l44.886-48.2h-9.5z" fill-rule="evenodd"/></svg>'
  },
  info: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><path d="M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zM52.812 48.75v4.063h8.126V97.5h-8.126v4.063H81.25V97.5h-8.125V48.75H52.812zM65 40.625a8.125 8.125 0 1 0 0-16.25 8.125 8.125 0 0 0 0 16.25z" fill-rule="evenodd"/></svg>'
  },
  warn: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><path d="M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zM60.521 29.25l.988 51.02a1 1 0 0 0 1 .98h6.066a1 1 0 0 0 1-.98l.967-50a1 1 0 0 0-1-1.02h-9.02zm5.02 70.417a5.958 5.958 0 1 0 0-11.917 5.958 5.958 0 0 0 0 11.917z" fill-rule="evenodd"/></svg>'
  },
  waiting: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><path d="M67.684 68.171L67.766 26h-6.36l-1.888 46.562-.092.19.083.04-.011.275h.586l30.94 14.76 2.544-4.406-25.884-15.25zM65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65z" fill-rule="evenodd"/></svg>'
  },
  clear: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><path d="M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zm9.692-65L90.83 48.863a6.846 6.846 0 0 0 .017-9.71c-2.696-2.695-7.024-2.668-9.71.017L65 55.308 48.863 39.17a6.846 6.846 0 0 0-9.71-.017c-2.695 2.696-2.668 7.024.017 9.71L55.308 65 39.17 81.137a6.846 6.846 0 0 0-.017 9.71c2.696 2.695 7.024 2.668 9.71-.017L65 74.692 81.137 90.83a6.846 6.846 0 0 0 9.71.017c2.695-2.696 2.668-7.024-.017-9.71L74.692 65z" fill-rule="evenodd"/></svg>'
  },
  success_no_circle: {
    size: '0 0 130 89',
    content: '<svg width="130" height="89" xmlns="http://www.w3.org/2000/svg"><path d="M112.132 0H130L47.227 88.884 0 39.118h20.92a1 1 0 0 1 .704.29l25.603 25.418L111.423.295a1 1 0 0 1 .709-.295z" fill-rule="evenodd"/></svg>'
  },
  download: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd"><path d="M65 11.818c-29.325 0-53.182 23.857-53.182 53.182 0 29.325 23.857 53.182 53.182 53.182 29.325 0 53.182-23.857 53.182-53.182 0-29.325-23.857-53.182-53.182-53.182M65 130c-35.84 0-65-29.16-65-65S29.16 0 65 0s65 29.16 65 65-29.16 65-65 65"/><path d="M59.728 75.224V35.909h11.819v39.315h13.212L65.335 94.649 45.909 75.224z"/></g></svg>'
  },
  cancel: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><path d="M65 130c-35.899 0-65-29.101-65-65S29.101 0 65 0s65 29.101 65 65-29.101 65-65 65zm19.446-89.77L64.76 59.919l-19.432-19.43-4.896 4.896 19.431 19.43-19.631 19.632 4.896 4.896L64.76 69.711l19.887 19.888 4.897-4.896-19.888-19.888 19.687-19.688-4.896-4.896z" fill-rule="evenodd"/></svg>'
  },
  search: {
    size: '0 0 130 130',
    content: '<svg width="130" height="130" xmlns="http://www.w3.org/2000/svg"><path d="M130 118.53l-11.364 11.468-31.138-31.32c-9.168 7.066-20.583 11.308-33.005 11.308C24.398 109.986 0 85.364 0 54.993 0 24.623 24.398 0 54.493 0c30.094 0 54.491 24.62 54.491 54.992 0 11.977-3.835 23.028-10.277 32.056L130 118.53zM54.493 13.334c-22.801 0-41.285 18.65-41.285 41.658 0 23.009 18.483 41.661 41.285 41.661 22.796 0 41.279-18.652 41.279-41.66 0-23.01-18.483-41.66-41.279-41.66z" fill-rule="evenodd" opacity=".896"/></svg>'
  },
  'contact-button': {
    size: '0 0 101 101',
    content: '<svg width="101" height="101" viewBox="0 0 101 101" xmlns="http://www.w3.org/2000/svg"><g fill-rule="evenodd"><path d="M0 50.5C0 78.39 22.61 101 50.5 101S101 78.39 101 50.5 78.39 0 50.5 0 0 22.61 0 50.5z" /><path d="M71.52 26H29.486c-4.132-.002-7.483 3.352-7.485 7.49v29.813c0 4.137 3.348 7.49 7.479 7.49h4.35v10.705a1.501 1.501 0 0 0 2.691.913 70.674 70.674 0 0 1 5.193-5.964c1.254-1.28 2.46-2.394 3.597-3.296 1.93-1.535 3.545-2.354 4.589-2.358l.181.006h.66l2.442.006c4.445.005 8.89.005 13.335 0l3.585-.006h1.413c4.134 0 7.485-3.356 7.485-7.496V33.49c0-4.137-3.349-7.49-7.48-7.49zM51.377 69.586c.012-.069.02-.137.023-.207a.475.475 0 0 1-.023.207zM76 63.303a4.491 4.491 0 0 1-4.488 4.491h-1.41l-3.585.003c-5.255.003-10.51.003-15.765 0l-.645-.003.015.015c-.071-.009-.14-.02-.216-.02-1.905 0-4.035 1.081-6.46 3.007-1.244.988-2.54 2.184-3.875 3.545a73.709 73.709 0 0 0-2.742 2.975v-8.022c0-.83-.672-1.503-1.5-1.503h-5.844A4.482 4.482 0 0 1 25 63.311V33.49a4.484 4.484 0 0 1 4.485-4.486h42.03A4.484 4.484 0 0 1 76 33.49v29.813z" fill="#FFF"/></g></svg>'
  }
};
/* harmony default export */ __webpack_exports__["default"] = (svgData);

/***/ }),

/***/ "./packages/mp/es/shared/createSprite.js":
/*!***********************************************!*\
  !*** ./packages/mp/es/shared/createSprite.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createSprite; });
/* harmony import */ var _assets_svgData__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assets/svgData */ "./packages/mp/es/shared/assets/svgData.js");

var sprite;
var SymbolObj = {};
function createSprite(id) {
  if (id && !SymbolObj[id]) {
    if (!sprite) {
      var aIconSpriteNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      aIconSpriteNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      aIconSpriteNode.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      aIconSpriteNode.setAttribute('style', 'position: absolute; width: 0; height: 0');
      aIconSpriteNode.setAttribute('id', 'a-icon-sprite-node');
      sprite = document.body.insertBefore(aIconSpriteNode, document.body.firstChild || null);
    }

    var symbolNode = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
    symbolNode.setAttribute('id', id);
    symbolNode.setAttribute('viewBox', _assets_svgData__WEBPACK_IMPORTED_MODULE_0__["default"][id].size);
    var svgNode = new DOMParser().parseFromString(_assets_svgData__WEBPACK_IMPORTED_MODULE_0__["default"][id].content, 'image/svg+xml').documentElement;
    symbolNode.appendChild(svgNode);
    sprite.appendChild(symbolNode); // SymbolObj[params.id] not be undefined is OK.

    SymbolObj[id] = 1;
  }
}

/***/ }),

/***/ "./packages/mp/es/text/index.js":
/*!**************************************!*\
  !*** ./packages/mp/es/text/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_core_es_text__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp-core/es/text */ "./packages/mp-core/es/text/index.js");

/* harmony default export */ __webpack_exports__["default"] = (_hulk_mp_core_es_text__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./packages/mp/es/utils/TestMixin.js":
/*!*******************************************!*\
  !*** ./packages/mp/es/utils/TestMixin.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");

var id = 0;
var isTest;
var empty = {};

function isTesting() {
  if (isTest !== undefined) {
    return isTest;
  }

  isTest = Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])().runStage === 'test';
  return isTest;
}

/* harmony default export */ __webpack_exports__["default"] = ({
  getTestProps: function getTestProps() {
    if (isTesting()) {
      var testProps = {};
      var props = this.props || {};
      this.dataTestId = this.dataTestId || ++id;
      testProps = {
        'data-testid': this.dataTestId
      };

      if (props.onTap || props.catchTap) {
        testProps['data-is-bind-on-tap'] = true;
      }

      return testProps;
    } else {
      return empty;
    }
  },
  logTestId: function logTestId() {
    if (isTesting()) {
      var testProps = this.getTestProps();
      console.log("[data-testid]=".concat(testProps['data-testid'], " response"));
    }
  }
});

/***/ }),

/***/ "./packages/mp/es/utils/addEvents.js":
/*!*******************************************!*\
  !*** ./packages/mp/es/utils/addEvents.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_core_es_utils_addEvents__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp-core/es/utils/addEvents */ "./packages/mp-core/es/utils/addEvents.js");

/* harmony default export */ __webpack_exports__["default"] = (_hulk_mp_core_es_utils_addEvents__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./packages/mp/es/utils/callBridge.js":
/*!********************************************!*\
  !*** ./packages/mp/es/utils/callBridge.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return callBridge; });
function callBridge(method, param, callback) {
  var g = self;
  var JSBridge = g.JSBridge;

  function done(res) {
    if (res && res.error) {
      if (method === 'internalAPI') {
        if (param && param.method !== 'onAppPerfEvent') {
          console.error("callInternalAPI error: ".concat(param.method), param, res);
        }
      } else {
        console.error("callBridge error: ".concat(method), param, res);
      }
    }

    if (callback) {
      callback(res);
    }
  }

  if (JSBridge) {
    JSBridge.call(method, param, done);
  } else {
    document.addEventListener('JSBridgeReady', function () {
      g.JSBridge.call(method, param, done);
    });
  }
}

/***/ }),

/***/ "./packages/mp/es/utils/callInternalAPI.js":
/*!*************************************************!*\
  !*** ./packages/mp/es/utils/callInternalAPI.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return callInternalAPI; });
/* harmony import */ var _callBridge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./callBridge */ "./packages/mp/es/utils/callBridge.js");
/* harmony import */ var _hulk_mp_core_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @hulk/mp-core/es/framework/startupParams */ "./packages/mp-core/es/framework/startupParams/index.js");


var ddOrAp =  true || false;
function callInternalAPI(method) {
  var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var callback = arguments.length > 2 ? arguments[2] : undefined;

  if (ddOrAp && !Object(_hulk_mp_core_es_framework_startupParams__WEBPACK_IMPORTED_MODULE_1__["getStartupParams"])().isInternalApp) {
    var internalParams = {
      method: method,
      param: param
    };

    if ('viewId' in param) {
      internalParams.viewId = param.viewId;
    }

    Object(_callBridge__WEBPACK_IMPORTED_MODULE_0__["default"])('internalAPI', internalParams, callback);
  } else {
    Object(_callBridge__WEBPACK_IMPORTED_MODULE_0__["default"])(method, param, callback);
  }
}

/***/ }),

/***/ "./packages/mp/es/utils/errorCodes.js":
/*!********************************************!*\
  !*** ./packages/mp/es/utils/errorCodes.js ***!
  \********************************************/
/*! exports provided: WORKER_GLOBAL_ERROR, RENDER_GLOBAL_ERROR, REGISTER_WORKER_ERROR, CUSTOM_WORKER_ERROR */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WORKER_GLOBAL_ERROR", function() { return WORKER_GLOBAL_ERROR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RENDER_GLOBAL_ERROR", function() { return RENDER_GLOBAL_ERROR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "REGISTER_WORKER_ERROR", function() { return REGISTER_WORKER_ERROR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CUSTOM_WORKER_ERROR", function() { return CUSTOM_WORKER_ERROR; });
var WORKER_GLOBAL_ERROR = 11;
var RENDER_GLOBAL_ERROR = 12;
var REGISTER_WORKER_ERROR = 13;
var CUSTOM_WORKER_ERROR = 14; // WORKER_GLOBAL_ERROR,
// RENDER_GLOBAL_ERROR,
// REGISTER_WORKER_ERROR,
// CUSTOM_WORKER_ERROR,

/***/ }),

/***/ "./packages/mp/es/utils/escapeLogParams.js":
/*!*************************************************!*\
  !*** ./packages/mp/es/utils/escapeLogParams.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return escapeLogParams; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./packages/mp/es/utils/objectKeys.js");

function escapeLogParams(params) {
  if (!params) {
    return '';
  }

  if (typeof params === 'string') {
    return params;
  }

  return Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(params).map(function (key) {
    var escaped = "".concat(key, "=");
    escaped += String(params[key]).replace(/,/g, ';').replace(/\^/g, '@').replace(/\=/g, '~');
    return escaped;
  }).join('^');
}

/***/ }),

/***/ "./packages/mp/es/utils/focusInput.js":
/*!********************************************!*\
  !*** ./packages/mp/es/utils/focusInput.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return focusInput; });
/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./system */ "./packages/mp/es/utils/system.js");
/* harmony import */ var _callInternalAPI__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./callInternalAPI */ "./packages/mp/es/utils/callInternalAPI.js");


var _window = window,
    devicePixelRatio = _window.devicePixelRatio;
function focusInput(node, inputFocus4Android, supportNative) {
  if (node) {
    node.focus();

    if (_system__WEBPACK_IMPORTED_MODULE_0__["isAndroid"]) {
      // android系统 input native化后 非页面初次进入时调用inputFocus4Android反而出错
      if (Object(_system__WEBPACK_IMPORTED_MODULE_0__["compareUCVersion"])('2.13') >= 0 || supportNative === true && node.type !== 'password' && inputFocus4Android === false) {
        return null;
      }

      var _node$getBoundingClie = node.getBoundingClientRect(),
          right = _node$getBoundingClie.right,
          bottom = _node$getBoundingClie.bottom;

      Object(_callInternalAPI__WEBPACK_IMPORTED_MODULE_1__["default"])('inputFocus4Android', {
        coordinateX: String(right * devicePixelRatio),
        coordinateY: String(bottom * devicePixelRatio)
      });
    }
  }
}

/***/ }),

/***/ "./packages/mp/es/utils/getData.js":
/*!*****************************************!*\
  !*** ./packages/mp/es/utils/getData.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_core_es_utils_getData__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp-core/es/utils/getData */ "./packages/mp-core/es/utils/getData.js");
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objectKeys */ "./packages/mp/es/utils/objectKeys.js");


/* harmony default export */ __webpack_exports__["default"] = (function (data, dataConfig) {
  if (!data) {
    return undefined;
  }

  var ret = {};
  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(dataConfig).forEach(function (k) {
    ret[k] = Object(_hulk_mp_core_es_utils_getData__WEBPACK_IMPORTED_MODULE_0__["default"])(data, dataConfig[k]);
  });
  return ret;
});

/***/ }),

/***/ "./packages/mp/es/utils/objectKeys.js":
/*!********************************************!*\
  !*** ./packages/mp/es/utils/objectKeys.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _hulk_mp_core_es_utils_objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @hulk/mp-core/es/utils/objectKeys */ "./packages/mp-core/es/utils/objectKeys.js");

/* harmony default export */ __webpack_exports__["default"] = (_hulk_mp_core_es_utils_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./packages/mp/es/utils/reportError.js":
/*!*********************************************!*\
  !*** ./packages/mp/es/utils/reportError.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return reportError; });
/* harmony import */ var _callInternalAPI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./callInternalAPI */ "./packages/mp/es/utils/callInternalAPI.js");
/* harmony import */ var _callBridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./callBridge */ "./packages/mp/es/utils/callBridge.js");
/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./system */ "./packages/mp/es/utils/system.js");
/* harmony import */ var _escapeLogParams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./escapeLogParams */ "./packages/mp/es/utils/escapeLogParams.js");




var did = '';
var version = '';
var appId = '';
var fromIDE;
var cluePID;

function stringify(obj) {
  var arr = [];

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      arr.push("".concat(encodeURIComponent(key), "=").concat(encodeURIComponent(obj[key])));
    }
  }

  return arr.join('&');
}

function _reportError(code, e) {
  if (appId === '') {
    var startupParams = window.JSBridge && window.JSBridge.startupParams;

    if (startupParams && startupParams.version) {
      version = startupParams.version;
      fromIDE = startupParams.fromIDE;
      appId = startupParams.appId;
    }

    if (cluePID === undefined && startupParams && startupParams.cluePID) {
      cluePID = startupParams.cluePID;
    }
  }

  if (!fromIDE && did !== 'unknown') {
    var ua = navigator.userAgent;
    var error = e.error || {};
    var col = error.column || "_".concat(e.col || '-1');
    var line = error.line || "_".concat(e.line || '-1');
    var msg = "".concat(error.message || e.msg, "^").concat(line, "^").concat(col);
    var errorUrl = error.sourceURL || "_".concat(e.url || '__errorUrl');
    var option = {
      pid: 'miniprogram',
      code: code,
      msg: msg,
      uid: did,
      page: location.href,
      ua: ua,
      rel: version,
      c1: _system__WEBPACK_IMPORTED_MODULE_2__["SDKVersion"],
      c2: appId,
      c3: _system__WEBPACK_IMPORTED_MODULE_2__["systemVersion"],
      c4: errorUrl,
      c5: error.stack
    };
    var fsp = new Image();
    fsp.src = "https://gm.mmstat.com/fsp.1.1?".concat(stringify(option));

    if (appId !== '') {
      var fspForSingleApp = new Image();
      option.pid = "miniprogram-".concat(cluePID || appId);
      fspForSingleApp.src = "https://gm.mmstat.com/fsp.1.1?".concat(stringify(option));
    }

    Object(_callBridge__WEBPACK_IMPORTED_MODULE_1__["default"])('remoteLog', {
      type: 'error',
      seedId: 'H5_CUSTOM_ERROR',
      param1: "H5_CUSTOM_ERROR_TINY_".concat(code),
      param3: Object(_escapeLogParams__WEBPACK_IMPORTED_MODULE_3__["default"])({
        errorMsg: msg,
        errorUrl: errorUrl,
        SDKVersion: _system__WEBPACK_IMPORTED_MODULE_2__["SDKVersion"]
      })
    });
  }
}

function reportError(code, e) {
  if ( true && !did) {
    Object(_callInternalAPI__WEBPACK_IMPORTED_MODULE_0__["default"])('getUserInfo', function (result) {
      if (result && result.userId) {
        did = result.userId;

        _reportError(code, e);
      } else {
        Object(_callInternalAPI__WEBPACK_IMPORTED_MODULE_0__["default"])('getConfig', {
          configKeys: ['did']
        }, function (result) {
          if (result && result.data && result.data.did) {
            did = result.data.did;
          } else {
            did = 'unknown';
          }

          _reportError(code, e);
        });
      }
    });
  } else {
    _reportError(code, e);
  }
}

/***/ }),

/***/ "./packages/mp/es/utils/rgba2Color.js":
/*!********************************************!*\
  !*** ./packages/mp/es/utils/rgba2Color.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return rgba2Color; });
function rgba2Color(rgba) {
  // 如果是rgba颜色表示
  if (/^(rgb|RGB)/.test(rgba)) {
    var aColor = rgba.replace(/(?:\(|\)|rgba|RGBA)*/g, '').replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',');
    var strHex = '#';

    for (var i = 0; i < aColor.length; i++) {
      var color = Number(aColor[i]);

      if (i === 3) {
        color = parseInt("".concat(color * 255));
      }

      var hex = color.toString(16);

      if (hex.length < 2) {
        hex = "0".concat(hex);
      }

      strHex += hex;
    }

    if (strHex.length === 7) {
      strHex += 'ff';
    }

    if (strHex.length !== 9) {
      strHex = rgba;
    }

    return strHex;
  }

  return rgba;
}

/***/ }),

/***/ "./packages/mp/es/utils/startsWith.js":
/*!********************************************!*\
  !*** ./packages/mp/es/utils/startsWith.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return startsWith; });
function startsWith(str, prefix) {
  return str && str.slice(0, prefix.length) === prefix;
}

/***/ }),

/***/ "./packages/mp/es/utils/system.js":
/*!****************************************!*\
  !*** ./packages/mp/es/utils/system.js ***!
  \****************************************/
/*! exports provided: systemVersion, UCVersion, isAndroid, isIOS, isIDE, SDKVersion, buildTime, isUC, isNativeComponent, compareVersion, logSystemInfo, compareSystemVersion, compareUCVersion */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "systemVersion", function() { return systemVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UCVersion", function() { return UCVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isAndroid", function() { return isAndroid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIOS", function() { return isIOS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIDE", function() { return isIDE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SDKVersion", function() { return SDKVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "buildTime", function() { return buildTime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUC", function() { return isUC; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNativeComponent", function() { return isNativeComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compareVersion", function() { return compareVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "logSystemInfo", function() { return logSystemInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compareSystemVersion", function() { return compareSystemVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compareUCVersion", function() { return compareUCVersion; });
var ua = navigator.userAgent || navigator.swuserAgent;

var _systemVersion = ua.match(/AlipayClient\/(\d+\.\d+\.\d+)/);

var _UCVersion = ua.match(/UCBS\/(\d+\.\d+)/); // expose all functions for ant fortune app


var systemVersion = _systemVersion && _systemVersion[1] || '100.0.0';
var UCVersion = _UCVersion && _UCVersion[1] || '2.12';
var isAndroid = ua.indexOf('Android') > -1;
var isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
var isIDE = ua.indexOf('AlipayIDE') > -1;
var SDKVersion = '0.0.1';
var buildTime = '11-26 22:47:44';
var caches = {};
var cacheIntArray = {};
var isUC = !!(_UCVersion && _UCVersion[1]);
var isNativeComponent = isUC || isIOS;

function toIntArray(v) {
  if (cacheIntArray[v]) {
    return cacheIntArray[v];
  }

  var ret = [];
  var version = v.split('.');

  for (var i = 0; i < version.length; i += 1) {
    ret.push(parseInt(version[i], 10));
  }

  cacheIntArray[v] = ret;
  return ret;
}

function compareVersion(version, targetVersion) {
  if (version && targetVersion) {
    var key = "".concat(version, "__").concat(targetVersion);

    if (key in caches) {
      return caches[key];
    }

    version = toIntArray(version);
    targetVersion = toIntArray(targetVersion);

    for (var i = 0, n1, n2; i < version.length; i += 1) {
      n1 = targetVersion[i] || 0;
      n2 = version[i] || 0;

      if (n1 > n2) {
        caches[key] = -1;
        break;
      }

      if (n1 < n2) {
        caches[key] = 1;
        break;
      }
    }

    caches[key] = caches[key] || 0;
    return caches[key];
  }

  return 0;
}

function logSystemInfo() {
  console.log('ap/SDKVersion: '.concat(SDKVersion));
}

function compareSystemVersion(targetVersion) {
  return compareVersion(systemVersion, targetVersion);
}

function compareUCVersion(targetVersion) {
  return compareVersion(UCVersion, targetVersion);
}



/***/ }),

/***/ "./packages/mp/es/utils/trackTap.js":
/*!******************************************!*\
  !*** ./packages/mp/es/utils/trackTap.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return trackTap; });
/* harmony import */ var _trackerStore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./trackerStore */ "./packages/mp/es/utils/trackerStore.js");
/* harmony import */ var _startsWith__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./startsWith */ "./packages/mp/es/utils/startsWith.js");
/* harmony import */ var _getData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getData */ "./packages/mp/es/utils/getData.js");
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./objectKeys */ "./packages/mp/es/utils/objectKeys.js");




var DATASET_KEY = '$DATASET.';

function matchElement(view, element) {
  if (element.charAt(0) === '.') {
    var className = element.slice(1);
    var cs = view.props.className && view.props.className.trim().split(/\s+/);
    return cs && cs.indexOf(className) !== -1;
  } else if (element.charAt(0) === '#') {
    var viewId = view.props.id;
    var id = element.slice(1);
    return viewId === id;
  }

  return false;
}

function trackTap(instance) {
  var trackerConfig = _trackerStore__WEBPACK_IMPORTED_MODULE_0__["default"].trackerConfig;

  if (trackerConfig) {
    // click
    var dataset = instance.props.$mp.getDataset();
    var $bridge = instance.props.$mp.bridge;
    trackerConfig.forEach(function (event) {
      var eventCode = event.eventCode;
      event.eventTarget.forEach(function (_ref) {
        var data = _ref.data;
        var action = _ref.action;
        var element = _ref.element;

        if (matchElement(instance, element)) {
          var dataConfig = {};
          var datasetConfig = {};
          Object(_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(data).forEach(function (k) {
            var c = data[k];

            if (Object(_startsWith__WEBPACK_IMPORTED_MODULE_1__["default"])(c, DATASET_KEY)) {
              datasetConfig[k] = c.slice(DATASET_KEY.length);
            } else {
              dataConfig[k] = c;
            }
          });
          var params = Object(_getData__WEBPACK_IMPORTED_MODULE_2__["default"])(dataset, datasetConfig);
          var method = action === 'collect' ? 'collectRemoteTrackerData' : 'reportRemoteTrackerData';
          $bridge[method](eventCode, {
            dataConfig: dataConfig,
            params: params
          });
        }
      });
    });
  }
}

/***/ }),

/***/ "./packages/mp/es/utils/trackerStore.js":
/*!**********************************************!*\
  !*** ./packages/mp/es/utils/trackerStore.js ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./packages/mp/es/view/View.js":
/*!*************************************!*\
  !*** ./packages/mp/es/view/View.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ "create-react-class");
/* harmony import */ var create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _hulk_mp_core_es_view_View__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @hulk/mp-core/es/view/View */ "./packages/mp-core/es/view/View.js");
/* harmony import */ var _utils_trackTap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/trackTap */ "./packages/mp/es/utils/trackTap.js");
/* harmony import */ var _utils_TestMixin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/TestMixin */ "./packages/mp/es/utils/TestMixin.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






/* harmony default export */ __webpack_exports__["default"] = (create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  displayName: 'View',
  mixins: [_utils_TestMixin__WEBPACK_IMPORTED_MODULE_4__["default"]],
  onTap: function onTap(e) {
    if (this.props.onTap) {
      this.props.onTap(e);
    }

    Object(_utils_trackTap__WEBPACK_IMPORTED_MODULE_3__["default"])(this);
    this.logTestId();
  },
  render: function render() {
    var props = this.props;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_hulk_mp_core_es_view_View__WEBPACK_IMPORTED_MODULE_2__["default"], _objectSpread({
      testProps: this.getTestProps()
    }, props, {
      onTap: this.onTap,
      userProps: props
    }));
  }
}));

/***/ }),

/***/ "./packages/mp/es/view/index.js":
/*!**************************************!*\
  !*** ./packages/mp/es/view/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework_dev__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework/dev */ "./packages/mp/es/framework/dev.js");
/* harmony import */ var _View__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./View */ "./packages/mp/es/view/View.js");


/* harmony default export */ __webpack_exports__["default"] = (Object(_framework_dev__WEBPACK_IMPORTED_MODULE_0__["createComponent"])({
  pure: false,
  name: 'view'
})(_View__WEBPACK_IMPORTED_MODULE_1__["default"]));

/***/ }),

/***/ "./packages/mp/node_modules/classnames/index.js":
/*!******************************************************!*\
  !*** ./packages/mp/node_modules/classnames/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if ( true && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (true) {
		// register as 'classnames', consistent with npm package name
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
			return classNames;
		}).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}());


/***/ }),

/***/ "./packages/mp/node_modules/object-assign/index.js":
/*!*********************************************************!*\
  !*** ./packages/mp/node_modules/object-assign/index.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),

/***/ "./packages/mp/node_modules/prop-types/checkPropTypes.js":
/*!***************************************************************!*\
  !*** ./packages/mp/node_modules/prop-types/checkPropTypes.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var printWarning = function() {};

if (true) {
  var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "./packages/mp/node_modules/prop-types/lib/ReactPropTypesSecret.js");
  var loggedTypeFailures = {};
  var has = Function.call.bind(Object.prototype.hasOwnProperty);

  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (true) {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error(
              (componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' +
              'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.'
            );
            err.name = 'Invariant Violation';
            throw err;
          }
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        if (error && !(error instanceof Error)) {
          printWarning(
            (componentName || 'React class') + ': type specification of ' +
            location + ' `' + typeSpecName + '` is invalid; the type checker ' +
            'function must return `null` or an `Error` but returned a ' + typeof error + '. ' +
            'You may have forgotten to pass an argument to the type checker ' +
            'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' +
            'shape all require an argument).'
          );
        }
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          printWarning(
            'Failed ' + location + ' type: ' + error.message + (stack != null ? stack : '')
          );
        }
      }
    }
  }
}

/**
 * Resets warning cache when testing.
 *
 * @private
 */
checkPropTypes.resetWarningCache = function() {
  if (true) {
    loggedTypeFailures = {};
  }
}

module.exports = checkPropTypes;


/***/ }),

/***/ "./packages/mp/node_modules/prop-types/factoryWithTypeCheckers.js":
/*!************************************************************************!*\
  !*** ./packages/mp/node_modules/prop-types/factoryWithTypeCheckers.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactIs = __webpack_require__(/*! react-is */ "./packages/mp/node_modules/react-is/index.js");
var assign = __webpack_require__(/*! object-assign */ "./packages/mp/node_modules/object-assign/index.js");

var ReactPropTypesSecret = __webpack_require__(/*! ./lib/ReactPropTypesSecret */ "./packages/mp/node_modules/prop-types/lib/ReactPropTypesSecret.js");
var checkPropTypes = __webpack_require__(/*! ./checkPropTypes */ "./packages/mp/node_modules/prop-types/checkPropTypes.js");

var has = Function.call.bind(Object.prototype.hasOwnProperty);
var printWarning = function() {};

if (true) {
  printWarning = function(text) {
    var message = 'Warning: ' + text;
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

function emptyFunctionThatReturnsNull() {
  return null;
}

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    elementType: createElementTypeTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker,
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (true) {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          var err = new Error(
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
          err.name = 'Invariant Violation';
          throw err;
        } else if ( true && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            printWarning(
              'You are manually calling a React.PropTypes validation ' +
              'function for the `' + propFullName + '` prop on `' + componentName  + '`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.'
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!ReactIs.isValidElementType(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      if (true) {
        if (arguments.length > 1) {
          printWarning(
            'Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' +
            'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).'
          );
        } else {
          printWarning('Invalid argument supplied to oneOf, expected an array.');
        }
      }
      return emptyFunctionThatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
        var type = getPreciseType(value);
        if (type === 'symbol') {
          return String(value);
        }
        return value;
      });
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (has(propValue, key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
       true ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : undefined;
      return emptyFunctionThatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        printWarning(
          'Invalid argument supplied to oneOfType. Expected an array of check functions, but ' +
          'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.'
        );
        return emptyFunctionThatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      // We need to check all keys in case some are required but missing from
      // props.
      var allKeys = assign({}, props[propName], shapeTypes);
      for (var key in allKeys) {
        var checker = shapeTypes[key];
        if (!checker) {
          return new PropTypeError(
            'Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' +
            '\nBad object: ' + JSON.stringify(props[propName], null, '  ') +
            '\nValid keys: ' +  JSON.stringify(Object.keys(shapeTypes), null, '  ')
          );
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // falsy value can't be a Symbol
    if (!propValue) {
      return false;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};


/***/ }),

/***/ "./packages/mp/node_modules/prop-types/index.js":
/*!******************************************************!*\
  !*** ./packages/mp/node_modules/prop-types/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (true) {
  var ReactIs = __webpack_require__(/*! react-is */ "./packages/mp/node_modules/react-is/index.js");

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = __webpack_require__(/*! ./factoryWithTypeCheckers */ "./packages/mp/node_modules/prop-types/factoryWithTypeCheckers.js")(ReactIs.isElement, throwOnDirectAccess);
} else {}


/***/ }),

/***/ "./packages/mp/node_modules/prop-types/lib/ReactPropTypesSecret.js":
/*!*************************************************************************!*\
  !*** ./packages/mp/node_modules/prop-types/lib/ReactPropTypesSecret.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;


/***/ }),

/***/ "./packages/mp/node_modules/rc-touchable/es/PressEvent.js":
/*!****************************************************************!*\
  !*** ./packages/mp/node_modules/rc-touchable/es/PressEvent.js ***!
  \****************************************************************/
/*! exports provided: shouldFirePress, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "shouldFirePress", function() { return shouldFirePress; });
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function PressEvent(nativeEvent) {
    var _this = this;

    this.nativeEvent = nativeEvent;
    ['type', 'currentTarget', 'target', 'touches', 'changedTouches'].forEach(function (m) {
        _this[m] = nativeEvent[m];
    });
    if (!nativeEvent.$pressSeq) {
        nativeEvent.$pressSeq = 1;
    } else {
        nativeEvent.$pressSeq += 1;
    }
    this.$pressSeq = nativeEvent.$pressSeq;
}
PressEvent.prototype = _extends({}, PressEvent.prototype, {
    preventDefault: function preventDefault() {
        this.nativeEvent.preventDefault();
    },
    stopPropagation: function stopPropagation() {
        var nativeEvent = this.nativeEvent,
            $pressSeq = this.$pressSeq;

        if (nativeEvent.$stopPressSeq) {
            return;
        }
        nativeEvent.$stopPressSeq = $pressSeq;
    }
});
// because of setTimeout, can not depend on fire order
function shouldFirePress(e) {
    var nativeEvent = e.nativeEvent,
        $pressSeq = e.$pressSeq;

    if (!nativeEvent.$stopPressSeq) {
        return true;
    }
    return nativeEvent.$stopPressSeq >= $pressSeq;
}
/* harmony default export */ __webpack_exports__["default"] = (PressEvent);

/***/ }),

/***/ "./packages/mp/node_modules/rc-touchable/es/index.js":
/*!***********************************************************!*\
  !*** ./packages/mp/node_modules/rc-touchable/es/index.js ***!
  \***********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PressEvent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PressEvent */ "./packages/mp/node_modules/rc-touchable/es/PressEvent.js");
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// inspired by react-native



function keyMirror(obj) {
    Object.keys(obj).forEach(function (k) {
        return obj[k] = k;
    });
    return obj;
}
function copy(from, list) {
    var to = {};
    list.forEach(function (k) {
        to[k] = from[k];
    });
    return to;
}
function extractSingleTouch(_nativeEvent) {
    var nativeEvent = _nativeEvent;
    if (nativeEvent.nativeEvent) {
        nativeEvent = nativeEvent.nativeEvent;
    }
    var touches = nativeEvent.touches;
    var changedTouches = nativeEvent.changedTouches;
    var hasTouches = touches && touches.length > 0;
    var hasChangedTouches = changedTouches && changedTouches.length > 0;
    return !hasTouches && hasChangedTouches ? changedTouches[0] : hasTouches ? touches[0] : nativeEvent;
}
/**
 * Touchable states.
 */
var States = keyMirror({
    NOT_RESPONDER: null,
    RESPONDER_INACTIVE_PRESS_IN: null,
    RESPONDER_INACTIVE_PRESS_OUT: null,
    RESPONDER_ACTIVE_PRESS_IN: null,
    RESPONDER_ACTIVE_PRESS_OUT: null,
    RESPONDER_ACTIVE_LONG_PRESS_IN: null,
    RESPONDER_ACTIVE_LONG_PRESS_OUT: null,
    ERROR: null
});
/**
 * Quick lookup map for states that are considered to be "active"
 */
var IsActive = {
    RESPONDER_ACTIVE_PRESS_OUT: true,
    RESPONDER_ACTIVE_PRESS_IN: true
};
/**
 * Quick lookup for states that are considered to be "pressing" and are
 * therefore eligible to result in a "selection" if the press stops.
 */
var IsPressingIn = {
    RESPONDER_INACTIVE_PRESS_IN: true,
    RESPONDER_ACTIVE_PRESS_IN: true,
    RESPONDER_ACTIVE_LONG_PRESS_IN: true
};
var IsLongPressingIn = {
    RESPONDER_ACTIVE_LONG_PRESS_IN: true
};
/**
 * Inputs to the state machine.
 */
var Signals = keyMirror({
    DELAY: null,
    RESPONDER_GRANT: null,
    RESPONDER_RELEASE: null,
    RESPONDER_TERMINATED: null,
    ENTER_PRESS_RECT: null,
    LEAVE_PRESS_RECT: null,
    LONG_PRESS_DETECTED: null
});
/**
 * Mapping from States x Signals => States
 */
var Transitions = {
    NOT_RESPONDER: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.RESPONDER_INACTIVE_PRESS_IN,
        RESPONDER_RELEASE: States.ERROR,
        RESPONDER_TERMINATED: States.ERROR,
        ENTER_PRESS_RECT: States.ERROR,
        LEAVE_PRESS_RECT: States.ERROR,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_INACTIVE_PRESS_IN: {
        DELAY: States.RESPONDER_ACTIVE_PRESS_IN,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_INACTIVE_PRESS_OUT: {
        DELAY: States.RESPONDER_ACTIVE_PRESS_OUT,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_INACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_ACTIVE_PRESS_IN: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.RESPONDER_ACTIVE_LONG_PRESS_IN
    },
    RESPONDER_ACTIVE_PRESS_OUT: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    RESPONDER_ACTIVE_LONG_PRESS_IN: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_OUT,
        LONG_PRESS_DETECTED: States.RESPONDER_ACTIVE_LONG_PRESS_IN
    },
    RESPONDER_ACTIVE_LONG_PRESS_OUT: {
        DELAY: States.ERROR,
        RESPONDER_GRANT: States.ERROR,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_IN,
        LEAVE_PRESS_RECT: States.RESPONDER_ACTIVE_LONG_PRESS_OUT,
        LONG_PRESS_DETECTED: States.ERROR
    },
    error: {
        DELAY: States.NOT_RESPONDER,
        RESPONDER_GRANT: States.RESPONDER_INACTIVE_PRESS_IN,
        RESPONDER_RELEASE: States.NOT_RESPONDER,
        RESPONDER_TERMINATED: States.NOT_RESPONDER,
        ENTER_PRESS_RECT: States.NOT_RESPONDER,
        LEAVE_PRESS_RECT: States.NOT_RESPONDER,
        LONG_PRESS_DETECTED: States.NOT_RESPONDER
    }
};
// ==== Typical Constants for integrating into UI components ====
// const HIT_EXPAND_PX = 20;
// const HIT_VERT_OFFSET_PX = 10;
var HIGHLIGHT_DELAY_MS = 130;
var PRESS_EXPAND_PX = 20;
var LONG_PRESS_THRESHOLD = 500;
var LONG_PRESS_DELAY_MS = LONG_PRESS_THRESHOLD - HIGHLIGHT_DELAY_MS;
var LONG_PRESS_ALLOWED_MOVEMENT = 10;
var lastClickTime = 0;
var pressDelay = 200;
function isAllowPress() {
    // avoid click penetration
    return Date.now() - lastClickTime >= pressDelay;
}

var Touchable = function (_React$Component) {
    _inherits(Touchable, _React$Component);

    function Touchable() {
        _classCallCheck(this, Touchable);

        var _this = _possibleConstructorReturn(this, (Touchable.__proto__ || Object.getPrototypeOf(Touchable)).apply(this, arguments));

        _this.state = {
            active: false
        };
        _this.touchable = { touchState: undefined };
        _this.onTouchStart = function (e) {
            _this.callChildEvent('onTouchStart', e);
            _this.lockMouse = true;
            if (_this.releaseLockTimer) {
                clearTimeout(_this.releaseLockTimer);
            }
            _this.touchableHandleResponderGrant(e.nativeEvent);
        };
        _this.onTouchMove = function (e) {
            _this.callChildEvent('onTouchMove', e);
            _this.touchableHandleResponderMove(e.nativeEvent);
        };
        _this.onTouchEnd = function (e) {
            _this.callChildEvent('onTouchEnd', e);
            _this.releaseLockTimer = setTimeout(function () {
                _this.lockMouse = false;
            }, 300);
            _this.touchableHandleResponderRelease(new _PressEvent__WEBPACK_IMPORTED_MODULE_2__["default"](e.nativeEvent));
        };
        _this.onTouchCancel = function (e) {
            _this.callChildEvent('onTouchCancel', e);
            _this.releaseLockTimer = setTimeout(function () {
                _this.lockMouse = false;
            }, 300);
            _this.touchableHandleResponderTerminate(e.nativeEvent);
        };
        _this.onMouseDown = function (e) {
            _this.callChildEvent('onMouseDown', e);
            if (_this.lockMouse) {
                return;
            }
            _this.touchableHandleResponderGrant(e.nativeEvent);
            document.addEventListener('mousemove', _this.touchableHandleResponderMove, false);
            document.addEventListener('mouseup', _this.onMouseUp, false);
        };
        _this.onMouseUp = function (e) {
            document.removeEventListener('mousemove', _this.touchableHandleResponderMove, false);
            document.removeEventListener('mouseup', _this.onMouseUp, false);
            _this.touchableHandleResponderRelease(new _PressEvent__WEBPACK_IMPORTED_MODULE_2__["default"](e));
        };
        _this.touchableHandleResponderMove = function (e) {
            if (!_this.touchable.startMouse) {
                return;
            }
            // Measurement may not have returned yet.
            if (!_this.touchable.dimensionsOnActivate || _this.touchable.touchState === States.NOT_RESPONDER) {
                return;
            }
            // Not enough time elapsed yet, wait for highlight -
            // this is just a perf optimization.
            if (_this.touchable.touchState === States.RESPONDER_INACTIVE_PRESS_IN) {
                return;
            }
            var touch = extractSingleTouch(e);
            var pageX = touch && touch.pageX;
            var pageY = touch && touch.pageY;
            if (_this.pressInLocation) {
                var movedDistance = _this._getDistanceBetweenPoints(pageX, pageY, _this.pressInLocation.pageX, _this.pressInLocation.pageY);
                if (movedDistance > LONG_PRESS_ALLOWED_MOVEMENT) {
                    _this._cancelLongPressDelayTimeout();
                }
            }
            if (_this.checkTouchWithinActive(e)) {
                _this._receiveSignal(Signals.ENTER_PRESS_RECT, e);
                var curState = _this.touchable.touchState;
                if (curState === States.RESPONDER_INACTIVE_PRESS_IN) {
                    _this._cancelLongPressDelayTimeout();
                }
            } else {
                _this._cancelLongPressDelayTimeout();
                _this._receiveSignal(Signals.LEAVE_PRESS_RECT, e);
            }
        };
        return _this;
    }

    _createClass(Touchable, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.root = react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.findDOMNode(this);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.root = react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.findDOMNode(this);
            // disabled auto clear active state
            if (this.props.disabled && this.state.active) {
                this.setState({
                    active: false
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.releaseLockTimer) {
                clearTimeout(this.releaseLockTimer);
            }
            if (this.touchableDelayTimeout) {
                clearTimeout(this.touchableDelayTimeout);
            }
            if (this.longPressDelayTimeout) {
                clearTimeout(this.longPressDelayTimeout);
            }
            if (this.pressOutDelayTimeout) {
                clearTimeout(this.pressOutDelayTimeout);
            }
        }
    }, {
        key: 'callChildEvent',
        value: function callChildEvent(event, e) {
            var childHandle = react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.only(this.props.children).props[event];
            if (childHandle) {
                childHandle(e);
            }
        }
    }, {
        key: '_remeasureMetricsOnInit',
        value: function _remeasureMetricsOnInit(e) {
            var root = this.root;

            var touch = extractSingleTouch(e);
            var boundingRect = root.getBoundingClientRect();
            this.touchable = {
                touchState: this.touchable.touchState,
                startMouse: {
                    pageX: touch.pageX,
                    pageY: touch.pageY
                },
                positionOnGrant: {
                    left: boundingRect.left + window.pageXOffset,
                    top: boundingRect.top + window.pageYOffset,
                    width: boundingRect.width,
                    height: boundingRect.height,
                    clientLeft: boundingRect.left,
                    clientTop: boundingRect.top
                }
            };
        }
    }, {
        key: 'processActiveStopPropagation',
        value: function processActiveStopPropagation(e) {
            var nativeEvent = e.nativeEvent || e;
            this.shouldActive = !nativeEvent.__activeStopPropagation;
            if (this.props.activeStopPropagation) {
                nativeEvent.__activeStopPropagation = 1;
            }
        }
    }, {
        key: 'touchableHandleResponderGrant',
        value: function touchableHandleResponderGrant(e) {
            var _this2 = this;

            this.touchable.touchState = States.NOT_RESPONDER;
            if (this.pressOutDelayTimeout) {
                clearTimeout(this.pressOutDelayTimeout);
                this.pressOutDelayTimeout = null;
            }
            if (this.props.fixClickPenetration && !isAllowPress()) {
                return;
            }
            this._remeasureMetricsOnInit(e);
            this._receiveSignal(Signals.RESPONDER_GRANT, e);
            var _props = this.props,
                delayMS = _props.delayPressIn,
                longDelayMS = _props.delayLongPress;

            this.processActiveStopPropagation(e);
            if (delayMS) {
                this.touchableDelayTimeout = setTimeout(function () {
                    _this2._handleDelay(e);
                }, delayMS);
            } else {
                this._handleDelay(e);
            }
            var longPressEvent = new _PressEvent__WEBPACK_IMPORTED_MODULE_2__["default"](e);
            this.longPressDelayTimeout = setTimeout(function () {
                _this2._handleLongDelay(longPressEvent);
            }, longDelayMS + delayMS);
        }
    }, {
        key: 'checkScroll',
        value: function checkScroll(e) {
            var positionOnGrant = this.touchable.positionOnGrant;
            // container or window scroll
            var boundingRect = this.root.getBoundingClientRect();
            if (boundingRect.left !== positionOnGrant.clientLeft || boundingRect.top !== positionOnGrant.clientTop) {
                this._receiveSignal(Signals.RESPONDER_TERMINATED, e);
                return true;
            }
            return false;
        }
    }, {
        key: 'touchableHandleResponderRelease',
        value: function touchableHandleResponderRelease(e) {
            if (!this.touchable.startMouse) {
                return;
            }
            var touch = extractSingleTouch(e);
            if (Math.abs(touch.pageX - this.touchable.startMouse.pageX) > 30 || Math.abs(touch.pageY - this.touchable.startMouse.pageY) > 30) {
                this._receiveSignal(Signals.RESPONDER_TERMINATED, e);
                return;
            }
            if (this.checkScroll(e)) {
                return;
            }
            this._receiveSignal(Signals.RESPONDER_RELEASE, e);
        }
    }, {
        key: 'touchableHandleResponderTerminate',
        value: function touchableHandleResponderTerminate(e) {
            if (!this.touchable.startMouse) {
                return;
            }
            this._receiveSignal(Signals.RESPONDER_TERMINATED, e);
        }
    }, {
        key: 'checkTouchWithinActive',
        value: function checkTouchWithinActive(e) {
            var positionOnGrant = this.touchable.positionOnGrant;
            var _props2 = this.props,
                _props2$pressRetentio = _props2.pressRetentionOffset,
                pressRetentionOffset = _props2$pressRetentio === undefined ? {} : _props2$pressRetentio,
                hitSlop = _props2.hitSlop;

            var pressExpandLeft = pressRetentionOffset.left;
            var pressExpandTop = pressRetentionOffset.top;
            var pressExpandRight = pressRetentionOffset.right;
            var pressExpandBottom = pressRetentionOffset.bottom;
            if (hitSlop) {
                pressExpandLeft += hitSlop.left;
                pressExpandTop += hitSlop.top;
                pressExpandRight += hitSlop.right;
                pressExpandBottom += hitSlop.bottom;
            }
            var touch = extractSingleTouch(e);
            var pageX = touch && touch.pageX;
            var pageY = touch && touch.pageY;
            return pageX > positionOnGrant.left - pressExpandLeft && pageY > positionOnGrant.top - pressExpandTop && pageX < positionOnGrant.left + positionOnGrant.width + pressExpandRight && pageY < positionOnGrant.top + positionOnGrant.height + pressExpandBottom;
        }
    }, {
        key: 'callProp',
        value: function callProp(name, e) {
            if (this.props[name] && !this.props.disabled) {
                this.props[name](e);
            }
        }
    }, {
        key: 'touchableHandleActivePressIn',
        value: function touchableHandleActivePressIn(e) {
            if (this.shouldActive) {
                this.setActive(true);
            }
            this.callProp('onPressIn', e);
        }
    }, {
        key: 'touchableHandleActivePressOut',
        value: function touchableHandleActivePressOut(e) {
            this.setActive(false);
            this.callProp('onPressOut', e);
        }
    }, {
        key: 'touchableHandlePress',
        value: function touchableHandlePress(e) {
            if (Object(_PressEvent__WEBPACK_IMPORTED_MODULE_2__["shouldFirePress"])(e)) {
                this.callProp('onPress', e);
            }
            lastClickTime = Date.now();
        }
    }, {
        key: 'touchableHandleLongPress',
        value: function touchableHandleLongPress(e) {
            if (Object(_PressEvent__WEBPACK_IMPORTED_MODULE_2__["shouldFirePress"])(e)) {
                this.callProp('onLongPress', e);
            }
        }
    }, {
        key: 'setActive',
        value: function setActive(active) {
            if (this.state.active !== active && (this.props.activeClassName || this.props.activeStyle)) {
                this.setState({
                    active: active
                });
            }
        }
    }, {
        key: '_remeasureMetricsOnActivation',
        value: function _remeasureMetricsOnActivation() {
            this.touchable.dimensionsOnActivate = this.touchable.positionOnGrant;
        }
    }, {
        key: '_handleDelay',
        value: function _handleDelay(e) {
            this.touchableDelayTimeout = null;
            this._receiveSignal(Signals.DELAY, e);
        }
    }, {
        key: '_handleLongDelay',
        value: function _handleLongDelay(e) {
            this.longPressDelayTimeout = null;
            var curState = this.touchable.touchState;
            if (curState !== States.RESPONDER_ACTIVE_PRESS_IN && curState !== States.RESPONDER_ACTIVE_LONG_PRESS_IN) {
                console.error('Attempted to transition from state `' + curState + '` to `' + States.RESPONDER_ACTIVE_LONG_PRESS_IN + '`, which is not supported. This is ' + 'most likely due to `Touchable.longPressDelayTimeout` not being cancelled.');
            } else {
                this._receiveSignal(Signals.LONG_PRESS_DETECTED, e);
            }
        }
    }, {
        key: '_receiveSignal',
        value: function _receiveSignal(signal, e) {
            var curState = this.touchable.touchState;
            var nextState = Transitions[curState] && Transitions[curState][signal];
            if (!nextState) {
                return;
            }
            if (nextState === States.ERROR) {
                return;
            }
            if (curState !== nextState) {
                this._performSideEffectsForTransition(curState, nextState, signal, e);
                this.touchable.touchState = nextState;
            }
        }
    }, {
        key: '_cancelLongPressDelayTimeout',
        value: function _cancelLongPressDelayTimeout() {
            if (this.longPressDelayTimeout) {
                clearTimeout(this.longPressDelayTimeout);
                this.longPressDelayTimeout = null;
            }
        }
    }, {
        key: '_isHighlight',
        value: function _isHighlight(state) {
            return state === States.RESPONDER_ACTIVE_PRESS_IN || state === States.RESPONDER_ACTIVE_LONG_PRESS_IN;
        }
    }, {
        key: '_savePressInLocation',
        value: function _savePressInLocation(e) {
            var touch = extractSingleTouch(e);
            var pageX = touch && touch.pageX;
            var pageY = touch && touch.pageY;
            this.pressInLocation = { pageX: pageX, pageY: pageY };
        }
    }, {
        key: '_getDistanceBetweenPoints',
        value: function _getDistanceBetweenPoints(aX, aY, bX, bY) {
            var deltaX = aX - bX;
            var deltaY = aY - bY;
            return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }
    }, {
        key: '_performSideEffectsForTransition',
        value: function _performSideEffectsForTransition(curState, nextState, signal, e) {
            var curIsHighlight = this._isHighlight(curState);
            var newIsHighlight = this._isHighlight(nextState);
            var isFinalSignal = signal === Signals.RESPONDER_TERMINATED || signal === Signals.RESPONDER_RELEASE;
            if (isFinalSignal) {
                this._cancelLongPressDelayTimeout();
            }
            if (!IsActive[curState] && IsActive[nextState]) {
                this._remeasureMetricsOnActivation();
            }
            if (IsPressingIn[curState] && signal === Signals.LONG_PRESS_DETECTED) {
                this.touchableHandleLongPress(e);
            }
            if (newIsHighlight && !curIsHighlight) {
                this._startHighlight(e);
            } else if (!newIsHighlight && curIsHighlight) {
                this._endHighlight(e);
            }
            if (IsPressingIn[curState] && signal === Signals.RESPONDER_RELEASE) {
                var hasLongPressHandler = !!this.props.onLongPress;
                var pressIsLongButStillCallOnPress = IsLongPressingIn[curState] && ( // We *are* long pressing..
                !hasLongPressHandler || // But either has no long handler
                !this.props.longPressCancelsPress // or we're told to ignore it.
                );
                var shouldInvokePress = !IsLongPressingIn[curState] || pressIsLongButStillCallOnPress;
                if (shouldInvokePress) {
                    if (!newIsHighlight && !curIsHighlight) {
                        // we never highlighted because of delay, but we should highlight now
                        this._startHighlight(e);
                        this._endHighlight(e);
                    }
                    this.touchableHandlePress(e);
                }
            }
            if (this.touchableDelayTimeout) {
                clearTimeout(this.touchableDelayTimeout);
                this.touchableDelayTimeout = null;
            }
        }
    }, {
        key: '_startHighlight',
        value: function _startHighlight(e) {
            this._savePressInLocation(e);
            this.touchableHandleActivePressIn(e);
        }
    }, {
        key: '_endHighlight',
        value: function _endHighlight(e) {
            var _this3 = this;

            if (this.props.delayPressOut) {
                this.pressOutDelayTimeout = setTimeout(function () {
                    _this3.touchableHandleActivePressOut(e);
                }, this.props.delayPressOut);
            } else {
                this.touchableHandleActivePressOut(e);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                children = _props3.children,
                disabled = _props3.disabled,
                activeStyle = _props3.activeStyle,
                activeClassName = _props3.activeClassName;

            var events = disabled ? undefined : copy(this, ['onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel', 'onMouseDown']);
            var child = react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.only(children);
            if (!disabled && this.state.active) {
                var _child$props = child.props,
                    style = _child$props.style,
                    className = _child$props.className;

                if (activeStyle) {
                    style = _extends({}, style, activeStyle);
                }
                if (activeClassName) {
                    if (className) {
                        className += ' ' + activeClassName;
                    } else {
                        className = activeClassName;
                    }
                }
                return react__WEBPACK_IMPORTED_MODULE_0___default.a.cloneElement(child, _extends({ className: className,
                    style: style }, events));
            }
            return react__WEBPACK_IMPORTED_MODULE_0___default.a.cloneElement(child, events);
        }
    }]);

    return Touchable;
}(react__WEBPACK_IMPORTED_MODULE_0___default.a.Component);

/* harmony default export */ __webpack_exports__["default"] = (Touchable);

Touchable.defaultProps = {
    fixClickPenetration: false,
    disabled: false,
    delayPressIn: HIGHLIGHT_DELAY_MS,
    delayLongPress: LONG_PRESS_DELAY_MS,
    delayPressOut: 100,
    pressRetentionOffset: {
        left: PRESS_EXPAND_PX,
        right: PRESS_EXPAND_PX,
        top: PRESS_EXPAND_PX,
        bottom: PRESS_EXPAND_PX
    },
    hitSlop: undefined,
    longPressCancelsPress: true
};

/***/ }),

/***/ "./packages/mp/node_modules/react-is/cjs/react-is.development.js":
/*!***********************************************************************!*\
  !*** ./packages/mp/node_modules/react-is/cjs/react-is.development.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
// (unstable) APIs that have been removed. Can we remove the symbols?

var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
}

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_ASYNC_MODE_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;

          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
} // AsyncMode is deprecated along with isAsyncMode

var AsyncMode = REACT_ASYNC_MODE_TYPE;
var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;
var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
    }
  }

  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
}
function isConcurrentMode(object) {
  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

exports.AsyncMode = AsyncMode;
exports.ConcurrentMode = ConcurrentMode;
exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
exports.isValidElementType = isValidElementType;
exports.typeOf = typeOf;
  })();
}


/***/ }),

/***/ "./packages/mp/node_modules/react-is/index.js":
/*!****************************************************!*\
  !*** ./packages/mp/node_modules/react-is/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "./packages/mp/node_modules/react-is/cjs/react-is.development.js");
}


/***/ }),

/***/ "./packages/rml-runtime/es/EmptyComponentFactory.js":
/*!**********************************************************!*\
  !*** ./packages/rml-runtime/es/EmptyComponentFactory.js ***!
  \**********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return EmptyComponentFactory; });
var caches = {};
function EmptyComponentFactory(type) {
  if (caches[type]) {
    return caches[type];
  }

  function EmptyComponent(props) {
    var _props$children = props.children,
        children = _props$children === void 0 ? null : _props$children;
    return children;
  }

  EmptyComponent.displayName = type;
  caches[type] = EmptyComponent;
  return EmptyComponent;
}

/***/ }),

/***/ "./packages/rml-runtime/es/createBlock.js":
/*!************************************************!*\
  !*** ./packages/rml-runtime/es/createBlock.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createBlock; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function createBlock(element, props) {
  var arrayElements = element;

  if (!Array.isArray(arrayElements)) {
    arrayElements = [arrayElements];
  }

  if (react__WEBPACK_IMPORTED_MODULE_0__["Fragment"]) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], props, arrayElements);
  } else {
    return arrayElements;
  }
}

/***/ }),

/***/ "./packages/rml-runtime/es/createRoot.js":
/*!***********************************************!*\
  !*** ./packages/rml-runtime/es/createRoot.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createRoot; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

function createRoot(element) {
  if (Array.isArray(element) && react__WEBPACK_IMPORTED_MODULE_0__["Fragment"]) {
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null, element);
  }

  return element;
}

/***/ }),

/***/ "./packages/rml-runtime/es/createTemplate.js":
/*!***************************************************!*\
  !*** ./packages/rml-runtime/es/createTemplate.js ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { return function () { var Super = _getPrototypeOf(Derived), result; if (_isNativeReflectConstruct()) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }


var version = parseInt(react__WEBPACK_IMPORTED_MODULE_0___default.a.version, 10);

function transformChildrenToSlots(children) {
  var slots = {};
  react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.forEach(children, function (c) {
    var slot = c && c.props && c.props.slot || '$default';
    var holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}

/* harmony default export */ __webpack_exports__["default"] = (function (name, elementFactory) {
  var RMLTemplate = /*#__PURE__*/function (_PureComponent) {
    _inherits(RMLTemplate, _PureComponent);

    var _super = _createSuper(RMLTemplate);

    function RMLTemplate() {
      _classCallCheck(this, RMLTemplate);

      return _super.apply(this, arguments);
    }

    _createClass(RMLTemplate, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            $context = _this$props.$context,
            slot = _this$props.slot,
            children = _this$props.children,
            props = _objectWithoutProperties(_this$props, ["$context", "slot", "children"]);

        props.$slots = transformChildrenToSlots(children);
        var renderChildren = elementFactory.call($context, props);

        if (version < 16 && react__WEBPACK_IMPORTED_MODULE_0___default.a.Children.count(renderChildren) > 1) {
          setTimeout(function () {
            throw new Error("template ".concat(name, " can only has one render child!"));
          }, 0);
          return null;
        }

        return renderChildren;
      }
    }]);

    return RMLTemplate;
  }(react__WEBPACK_IMPORTED_MODULE_0__["PureComponent"]);

  RMLTemplate.displayName = name; // function RMLTemplate() {
  //   PureComponent.apply(this, arguments);
  // }
  // RMLTemplate.displayName = name;
  // const proto = RMLTemplate.prototype = Object.create(PureComponent.prototype);
  // proto.render = function render() {
  //   const _props = this.props;
  //   const { $context } = _props;
  //   const { slot } = _props;
  //   const { children } = _props;
  //   const props = _objectWithoutProperties(_props, ['$context', 'slot', 'children']);
  //   props.$slots = transformChildrenToSlots(children);
  //   const renderChildren = elementFactory.call($context, props);
  //   if (version < 16 && React.Children.count(renderChildren) > 1) {
  //     setTimeout(() => {
  //       throw new Error(`template ${name} can only has one render child!`);
  //     }, 0);
  //     return null;
  //   }
  //   return renderChildren;
  // };

  return RMLTemplate;
});

/***/ }),

/***/ "./packages/rml-runtime/es/getLooseDataMember.js":
/*!*******************************************************!*\
  !*** ./packages/rml-runtime/es/getLooseDataMember.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function noop() {}

var F = Function;
var E = eval;

function danger(ret) {
  if (ret === F || ret === E) {
    return true;
  }

  return false;
}

/* harmony default export */ __webpack_exports__["default"] = (function (fullArgs, isFunction) {
  var args = fullArgs.slice(1);
  var ret = fullArgs[0];
  var lastArg;

  for (var i = 0; i < args.length; i += 1) {
    if (danger(ret)) {
      return noop;
    }
    /* eslint eqeqeq:0 */


    if (ret == null) {
      break;
    }

    lastArg = ret;
    ret = ret[args[i]];
  }

  if (isFunction) {
    if (typeof ret !== 'function' || danger(ret)) {
      return noop;
    }

    return ret.bind(lastArg);
  }

  if (danger(ret)) {
    return noop;
  }

  return ret;
});

/***/ }),

/***/ "./packages/rml-runtime/es/getSJSMember.js":
/*!*************************************************!*\
  !*** ./packages/rml-runtime/es/getSJSMember.js ***!
  \*************************************************/
/*! exports provided: prefix, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prefix", function() { return prefix; });
function noop() {}

var PREFIX = '$sjs_';
var messageReg = new RegExp(PREFIX, 'g');
var stackReg = new RegExp("\\s".concat(PREFIX), 'g');
var SJS_FUNC = 1;

function startsWithPrefix(str) {
  return str.lastIndexOf(PREFIX, 0) === 0;
}

function is(target, type) {
  return Object.prototype.toString.call(target) === "[object ".concat(type, "]");
}

function prefix(target) {
  var p = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var r = arguments.length > 2 ? arguments[2] : undefined;

  if (!target) {
    return target;
  }

  var constructor = target.constructor;

  if (is(target, 'String') || is(target, 'Boolean') || is(target, 'Number')) {
    return target;
  }

  if (is(target, 'Object')) {
    var ret = {};

    for (var k in target) {
      if (target.hasOwnProperty(k)) {
        var v = prefix(target[k], p, r);

        if (p) {
          if (!startsWithPrefix(k)) {
            k = PREFIX + k;
          }

          ret[k] = v;
        } else {
          if (startsWithPrefix(k)) {
            k = k.slice(PREFIX.length);
          }

          ret[k] = v;
        }
      }
    }

    return ret;
  } else if (Array.isArray(target)) {
    var _ret = [];

    for (var i = 0; i < target.length; i += 1) {
      _ret.push(prefix(target[i], p, r));
    }

    return _ret;
  } else if (is(target, 'Date')) {
    var _ret2 = new Date();

    _ret2.setTime(target.getTime());

    return _ret2;
  } else if (is(target, 'RegExp')) {
    var f = '';

    if (target.global) {
      f += 'g';
    }

    if (target.ignoreCase) {
      f += 'i';
    }

    if (target.multiline) {
      f += 'm';
    }

    return new RegExp(target.source, f);
  } else if (is(target, 'Function')) {
    if (r === SJS_FUNC) return target;
  }

  return null;
}
/* harmony default export */ __webpack_exports__["default"] = (function (fullArgs, isFunction) {
  var args = fullArgs.slice(1);
  var ret = fullArgs[0];
  var lastArg = void 0;

  for (var i = 0; i < args.length; i++) {
    /* eslint eqeqeq:0 */
    if (ret == null) {
      break;
    }

    lastArg = ret;
    var key = args[i];

    if (typeof key === 'string') {
      key = PREFIX + key;
    }

    ret = ret[key];
  }

  if (isFunction) {
    if (typeof ret !== 'function') {
      return noop;
    }

    return function () {
      for (var _len = arguments.length, runArgs = new Array(_len), _key = 0; _key < _len; _key++) {
        runArgs[_key] = arguments[_key];
      }

      runArgs = runArgs.map(function (arg) {
        return prefix(arg);
      });

      try {
        return prefix(ret.apply(lastArg, runArgs), false);
      } catch (e) {
        e.message = e.message.replace(messageReg, '');
        e.stack = e.stack.substring(0, e.stack.indexOf('\n', e.stack.lastIndexOf("at ".concat(PREFIX))));
        e.stack = e.stack.replace(stackReg, ' ');
        throw e;
      }
    };
  }
  /** TIPS: SJS handler 不支持axml中调用函数返回函数的场景
   * 若用户调用了在 sjs 内的一个函数，然后这个函数返回了一个函数。
   * 这个时候这个返回值（函数）不能作为 SJS 事件handler。
   * 虽然类型也是函数，但是会在上面直接判掉
   */


  if (typeof ret === 'function') {
    ret.sjs = true;
    ret.prefix = prefix;
    return ret;
  }

  return prefix(ret, false);
});

/***/ }),

/***/ "./packages/rml-runtime/es/iterate.js":
/*!********************************************!*\
  !*** ./packages/rml-runtime/es/iterate.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return iterate; });
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isArray = Array.isArray;
function iterate(items, fn) {
  var ret = null;

  if (items) {
    ret = [];

    if (isArray(items)) {
      ret = items.map(fn);
    } else if (typeof items === 'number') {
      for (var i = 0; i < items; i += 1) {
        ret.push(fn(i + 1, i));
      }
    } else if (_typeof(items) === 'object') {
      Object.keys(items).forEach(function (key) {
        ret.push(fn(items[key], key));
      });
    }
  }

  return ret;
}

/***/ }),

/***/ "./packages/rml-runtime/es/renderSlot.js":
/*!***********************************************!*\
  !*** ./packages/rml-runtime/es/renderSlot.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return renderSlot; });
var empty = {};
function renderSlot(data, slot, fallback, props) {
  var _data$$scopedSlots = data.$scopedSlots,
      $scopedSlots = _data$$scopedSlots === void 0 ? empty : _data$$scopedSlots,
      _data$$slots = data.$slots,
      $slots = _data$$slots === void 0 ? empty : _data$$slots;
  var scopedSlotFn = $scopedSlots[slot];
  var nodes;

  if (scopedSlotFn) {
    nodes = [];
    var isEmptyChildren = true;
    scopedSlotFn.forEach(function (f) {
      var ret = f(props);

      if (ret) {
        isEmptyChildren = false;
      }

      nodes.push(ret);
    });

    if (isEmptyChildren) {
      nodes = fallback;
    }
  } else {
    var slotNodes = $slots[slot];
    nodes = slotNodes || fallback;
  }

  return nodes;
}

/***/ }),

/***/ "./packages/rml-runtime/es/resolveScopedSlots.js":
/*!*******************************************************!*\
  !*** ./packages/rml-runtime/es/resolveScopedSlots.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return resolveScopedSlots; });
function resolveScopedSlots(arrScopedSlots) {
  var objScopedSlots = {};
  arrScopedSlots.forEach(function (arr) {
    var fn = arr.fn,
        _arr$slot = arr.slot,
        slot = _arr$slot === void 0 ? '$default' : _arr$slot;
    objScopedSlots[slot] = objScopedSlots[slot] || [];
    objScopedSlots[slot].push(fn);
  });
  return objScopedSlots;
}

/***/ }),

/***/ "./packages/rml-runtime/es/toString.js":
/*!*********************************************!*\
  !*** ./packages/rml-runtime/es/toString.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return toString; });
function toString(str) {
  if (str == null) {
    return str;
  }

  return "".concat(str);
}

/***/ }),

/***/ "./packages/rml-runtime/es/useTemplate.js":
/*!************************************************!*\
  !*** ./packages/rml-runtime/es/useTemplate.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return useTemplate; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


function useTemplate(template, data, key, context) {
  var Component = template && template.Component;
  return Component ? react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(Component, _objectSpread({}, data, {
    $context: context,
    key: key
  })) : null;
}

/***/ }),

/***/ "create-react-class":
/*!****************************************!*\
  !*** external "self.createReactClass" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = self.createReactClass;

/***/ }),

/***/ "react":
/*!*****************************!*\
  !*** external "self.React" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = self.React;

/***/ }),

/***/ "react-dom":
/*!********************************!*\
  !*** external "self.ReactDOM" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = self.ReactDOM;

/***/ })

/******/ });
