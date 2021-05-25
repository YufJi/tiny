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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@babel/runtime/helpers/assertThisInitialized.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/assertThisInitialized.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/asyncToGenerator.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/asyncToGenerator.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

module.exports = _asyncToGenerator;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/classCallCheck.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/classCallCheck.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/createClass.js":
/*!************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/createClass.js ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/defineProperty.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/defineProperty.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js ***!
  \*********************************************************************/
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

/***/ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _arrayWithoutHoles; });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return Object(_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js":
/*!********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _iterableToArray; });
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _nonIterableSpread; });
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _toConsumableArray; });
/* harmony import */ var _arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js");
/* harmony import */ var _iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/iterableToArray.js");
/* harmony import */ var _unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js");
/* harmony import */ var _nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js");




function _toConsumableArray(arr) {
  return Object(_arrayWithoutHoles_js__WEBPACK_IMPORTED_MODULE_0__["default"])(arr) || Object(_iterableToArray_js__WEBPACK_IMPORTED_MODULE_1__["default"])(arr) || Object(_unsupportedIterableToArray_js__WEBPACK_IMPORTED_MODULE_2__["default"])(arr) || Object(_nonIterableSpread_js__WEBPACK_IMPORTED_MODULE_3__["default"])();
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js ***!
  \*******************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _unsupportedIterableToArray; });
/* harmony import */ var _arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return Object(_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Object(_arrayLikeToArray_js__WEBPACK_IMPORTED_MODULE_0__["default"])(o, minLen);
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/extends.js":
/*!********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/extends.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _extends() {
  module.exports = _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _extends.apply(this, arguments);
}

module.exports = _extends;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/get.js":
/*!****************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/get.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var superPropBase = __webpack_require__(/*! ./superPropBase.js */ "./node_modules/@babel/runtime/helpers/superPropBase.js");

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    module.exports = _get = Reflect.get;
    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _get = function _get(target, property, receiver) {
      var base = superPropBase(target, property);
      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _get(target, property, receiver || target);
}

module.exports = _get;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/getPrototypeOf.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/inherits.js":
/*!*********************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/inherits.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var setPrototypeOf = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/setPrototypeOf.js");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js":
/*!************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/objectWithoutProperties.js ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var objectWithoutPropertiesLoose = __webpack_require__(/*! ./objectWithoutPropertiesLoose.js */ "./node_modules/@babel/runtime/helpers/objectWithoutPropertiesLoose.js");

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = objectWithoutPropertiesLoose(source, excluded);
  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

module.exports = _objectWithoutProperties;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/objectWithoutPropertiesLoose.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/objectWithoutPropertiesLoose.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

module.exports = _objectWithoutPropertiesLoose;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js":
/*!**************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _typeof = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js")["default"];

var assertThisInitialized = __webpack_require__(/*! ./assertThisInitialized.js */ "./node_modules/@babel/runtime/helpers/assertThisInitialized.js");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/setPrototypeOf.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/setPrototypeOf.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  module.exports["default"] = module.exports, module.exports.__esModule = true;
  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/superPropBase.js":
/*!**************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/superPropBase.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var getPrototypeOf = __webpack_require__(/*! ./getPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

module.exports = _superPropBase;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/taggedTemplateLiteral.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/taggedTemplateLiteral.js ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _taggedTemplateLiteral(strings, raw) {
  if (!raw) {
    raw = strings.slice(0);
  }

  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

module.exports = _taggedTemplateLiteral;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };

    module.exports["default"] = module.exports, module.exports.__esModule = true;
  }

  return _typeof(obj);
}

module.exports = _typeof;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! regenerator-runtime */ "./node_modules/regenerator-runtime/runtime.js");

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/elements/dom-module.js":
/*!******************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/elements/dom-module.js ***!
  \******************************************************************/
/*! exports provided: DomModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DomModule", function() { return DomModule; });
/* harmony import */ var _utils_boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/resolve-url.js */ "./node_modules/@polymer/polymer/lib/utils/resolve-url.js");
/* harmony import */ var _utils_settings_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/settings.js */ "./node_modules/@polymer/polymer/lib/utils/settings.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/



let modules = {};
let lcModules = {};
/**
 * Sets a dom-module into the global registry by id.
 *
 * @param {string} id dom-module id
 * @param {DomModule} module dom-module instance
 * @return {void}
 */

function setModule(id, module) {
  // store id separate from lowercased id so that
  // in all cases mixedCase id will stored distinctly
  // and lowercase version is a fallback
  modules[id] = lcModules[id.toLowerCase()] = module;
}
/**
 * Retrieves a dom-module from the global registry by id.
 *
 * @param {string} id dom-module id
 * @return {DomModule!} dom-module instance
 */


function findModule(id) {
  return modules[id] || lcModules[id.toLowerCase()];
}

function styleOutsideTemplateCheck(inst) {
  if (inst.querySelector('style')) {
    console.warn('dom-module %s has style outside template', inst.id);
  }
}
/**
 * The `dom-module` element registers the dom it contains to the name given
 * by the module's id attribute. It provides a unified database of dom
 * accessible via its static `import` API.
 *
 * A key use case of `dom-module` is for providing custom element `<template>`s
 * via HTML imports that are parsed by the native HTML parser, that can be
 * relocated during a bundling pass and still looked up by `id`.
 *
 * Example:
 *
 *     <dom-module id="foo">
 *       <img src="stuff.png">
 *     </dom-module>
 *
 * Then in code in some other location that cannot access the dom-module above
 *
 *     let img = customElements.get('dom-module').import('foo', 'img');
 *
 * @customElement
 * @extends HTMLElement
 * @summary Custom element that provides a registry of relocatable DOM content
 *   by `id` that is agnostic to bundling.
 * @unrestricted
 */


class DomModule extends HTMLElement {
  /** @override */
  static get observedAttributes() {
    return ['id'];
  }
  /**
   * Retrieves the element specified by the css `selector` in the module
   * registered by `id`. For example, this.import('foo', 'img');
   * @param {string} id The id of the dom-module in which to search.
   * @param {string=} selector The css selector by which to find the element.
   * @return {Element} Returns the element which matches `selector` in the
   * module registered at the specified `id`.
   *
   * @export
   * @nocollapse Referred to indirectly in style-gather.js
   */


  static import(id, selector) {
    if (id) {
      let m = findModule(id);

      if (m && selector) {
        return m.querySelector(selector);
      }

      return m;
    }

    return null;
  }
  /* eslint-disable no-unused-vars */

  /**
   * @param {string} name Name of attribute.
   * @param {?string} old Old value of attribute.
   * @param {?string} value Current value of attribute.
   * @param {?string} namespace Attribute namespace.
   * @return {void}
   * @override
   */


  attributeChangedCallback(name, old, value, namespace) {
    if (old !== value) {
      this.register();
    }
  }
  /* eslint-enable no-unused-args */

  /**
   * The absolute URL of the original location of this `dom-module`.
   *
   * This value will differ from this element's `ownerDocument` in the
   * following ways:
   * - Takes into account any `assetpath` attribute added during bundling
   *   to indicate the original location relative to the bundled location
   * - Uses the HTMLImports polyfill's `importForElement` API to ensure
   *   the path is relative to the import document's location since
   *   `ownerDocument` is not currently polyfilled
   */


  get assetpath() {
    // Don't override existing assetpath.
    if (!this.__assetpath) {
      // note: assetpath set via an attribute must be relative to this
      // element's location; accomodate polyfilled HTMLImports
      const owner = window.HTMLImports && HTMLImports.importForElement ? HTMLImports.importForElement(this) || document : this.ownerDocument;
      const url = Object(_utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_1__["resolveUrl"])(this.getAttribute('assetpath') || '', owner.baseURI);
      this.__assetpath = Object(_utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_1__["pathFromUrl"])(url);
    }

    return this.__assetpath;
  }
  /**
   * Registers the dom-module at a given id. This method should only be called
   * when a dom-module is imperatively created. For
   * example, `document.createElement('dom-module').register('foo')`.
   * @param {string=} id The id at which to register the dom-module.
   * @return {void}
   */


  register(id) {
    id = id || this.id;

    if (id) {
      // Under strictTemplatePolicy, reject and null out any re-registered
      // dom-module since it is ambiguous whether first-in or last-in is trusted
      if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_2__["strictTemplatePolicy"] && findModule(id) !== undefined) {
        setModule(id, null);
        throw new Error(`strictTemplatePolicy: dom-module ${id} re-registered`);
      }

      this.id = id;
      setModule(id, this);
      styleOutsideTemplateCheck(this);
    }
  }

}
DomModule.prototype['modules'] = modules;
customElements.define('dom-module', DomModule);

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/mixins/element-mixin.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/mixins/element-mixin.js ***!
  \*******************************************************************/
/*! exports provided: version, builtCSS, ElementMixin, updateStyles */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "version", function() { return version; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "builtCSS", function() { return builtCSS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ElementMixin", function() { return ElementMixin; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateStyles", function() { return updateStyles; });
/* harmony import */ var _utils_boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _utils_settings_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/settings.js */ "./node_modules/@polymer/polymer/lib/utils/settings.js");
/* harmony import */ var _utils_mixin_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/mixin.js */ "./node_modules/@polymer/polymer/lib/utils/mixin.js");
/* harmony import */ var _utils_style_gather_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/style-gather.js */ "./node_modules/@polymer/polymer/lib/utils/style-gather.js");
/* harmony import */ var _utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/resolve-url.js */ "./node_modules/@polymer/polymer/lib/utils/resolve-url.js");
/* harmony import */ var _elements_dom_module_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../elements/dom-module.js */ "./node_modules/@polymer/polymer/lib/elements/dom-module.js");
/* harmony import */ var _property_effects_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./property-effects.js */ "./node_modules/@polymer/polymer/lib/mixins/property-effects.js");
/* harmony import */ var _properties_mixin_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./properties-mixin.js */ "./node_modules/@polymer/polymer/lib/mixins/properties-mixin.js");
/* harmony import */ var _utils_wrap_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/wrap.js */ "./node_modules/@polymer/polymer/lib/utils/wrap.js");
/**
 * @fileoverview
 * @suppress {checkPrototypalTypes}
 * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */









/**
 * Current Polymer version in Semver notation.
 * @type {string} Semver notation of the current version of Polymer.
 */

const version = '3.4.1';
const builtCSS = window.ShadyCSS && window.ShadyCSS['cssBuild'];
/**
 * Element class mixin that provides the core API for Polymer's meta-programming
 * features including template stamping, data-binding, attribute deserialization,
 * and property change observation.
 *
 * Subclassers may provide the following static getters to return metadata
 * used to configure Polymer's features for the class:
 *
 * - `static get is()`: When the template is provided via a `dom-module`,
 *   users should return the `dom-module` id from a static `is` getter.  If
 *   no template is needed or the template is provided directly via the
 *   `template` getter, there is no need to define `is` for the element.
 *
 * - `static get template()`: Users may provide the template directly (as
 *   opposed to via `dom-module`) by implementing a static `template` getter.
 *   The getter must return an `HTMLTemplateElement`.
 *
 * - `static get properties()`: Should return an object describing
 *   property-related metadata used by Polymer features (key: property name
 *   value: object containing property metadata). Valid keys in per-property
 *   metadata include:
 *   - `type` (String|Number|Object|Array|...): Used by
 *     `attributeChangedCallback` to determine how string-based attributes
 *     are deserialized to JavaScript property values.
 *   - `notify` (boolean): Causes a change in the property to fire a
 *     non-bubbling event called `<property>-changed`. Elements that have
 *     enabled two-way binding to the property use this event to observe changes.
 *   - `readOnly` (boolean): Creates a getter for the property, but no setter.
 *     To set a read-only property, use the private setter method
 *     `_setProperty(property, value)`.
 *   - `observer` (string): Observer method name that will be called when
 *     the property changes. The arguments of the method are
 *     `(value, previousValue)`.
 *   - `computed` (string): String describing method and dependent properties
 *     for computing the value of this property (e.g. `'computeFoo(bar, zot)'`).
 *     Computed properties are read-only by default and can only be changed
 *     via the return value of the computing method.
 *
 * - `static get observers()`: Array of strings describing multi-property
 *   observer methods and their dependent properties (e.g.
 *   `'observeABC(a, b, c)'`).
 *
 * The base class provides default implementations for the following standard
 * custom element lifecycle callbacks; users may override these, but should
 * call the super method to ensure
 * - `constructor`: Run when the element is created or upgraded
 * - `connectedCallback`: Run each time the element is connected to the
 *   document
 * - `disconnectedCallback`: Run each time the element is disconnected from
 *   the document
 * - `attributeChangedCallback`: Run each time an attribute in
 *   `observedAttributes` is set or removed (note: this element's default
 *   `observedAttributes` implementation will automatically return an array
 *   of dash-cased attributes based on `properties`)
 *
 * @mixinFunction
 * @polymer
 * @appliesMixin PropertyEffects
 * @appliesMixin PropertiesMixin
 * @property rootPath {string} Set to the value of `rootPath`,
 *   which defaults to the main document path
 * @property importPath {string} Set to the value of the class's static
 *   `importPath` property, which defaults to the path of this element's
 *   `dom-module` (when `is` is used), but can be overridden for other
 *   import strategies.
 * @summary Element class mixin that provides the core API for Polymer's
 * meta-programming features.
 * @template T
 * @param {function(new:T)} superClass Class to apply mixin to.
 * @return {function(new:T)} superClass with mixin applied.
 */

const ElementMixin = Object(_utils_mixin_js__WEBPACK_IMPORTED_MODULE_2__["dedupingMixin"])(base => {
  /**
   * @constructor
   * @implements {Polymer_PropertyEffects}
   * @implements {Polymer_PropertiesMixin}
   * @extends {HTMLElement}
   * @private
   */
  const polymerElementBase = Object(_properties_mixin_js__WEBPACK_IMPORTED_MODULE_7__["PropertiesMixin"])(Object(_property_effects_js__WEBPACK_IMPORTED_MODULE_6__["PropertyEffects"])(base));
  /**
   * Returns a list of properties with default values.
   * This list is created as an optimization since it is a subset of
   * the list returned from `_properties`.
   * This list is used in `_initializeProperties` to set property defaults.
   *
   * @param {PolymerElementConstructor} constructor Element class
   * @return {PolymerElementProperties} Flattened properties for this class
   *   that have default values
   * @private
   */

  function propertyDefaults(constructor) {
    if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__propertyDefaults', constructor))) {
      constructor.__propertyDefaults = null;
      let props = constructor._properties;

      for (let p in props) {
        let info = props[p];

        if ('value' in info) {
          constructor.__propertyDefaults = constructor.__propertyDefaults || {};
          constructor.__propertyDefaults[p] = info;
        }
      }
    }

    return constructor.__propertyDefaults;
  }
  /**
   * Returns a memoized version of the `observers` array.
   * @param {PolymerElementConstructor} constructor Element class
   * @return {Array} Array containing own observers for the given class
   * @protected
   */


  function ownObservers(constructor) {
    if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownObservers', constructor))) {
      constructor.__ownObservers = constructor.hasOwnProperty(JSCompiler_renameProperty('observers', constructor)) ?
      /** @type {PolymerElementConstructor} */
      constructor.observers : null;
    }

    return constructor.__ownObservers;
  }
  /**
   * Creates effects for a property.
   *
   * Note, once a property has been set to
   * `readOnly`, `computed`, `reflectToAttribute`, or `notify`
   * these values may not be changed. For example, a subclass cannot
   * alter these settings. However, additional `observers` may be added
   * by subclasses.
   *
   * The info object should contain property metadata as follows:
   *
   * * `type`: {function} type to which an attribute matching the property
   * is deserialized. Note the property is camel-cased from a dash-cased
   * attribute. For example, 'foo-bar' attribute is deserialized to a
   * property named 'fooBar'.
   *
   * * `readOnly`: {boolean} creates a readOnly property and
   * makes a private setter for the private of the form '_setFoo' for a
   * property 'foo',
   *
   * * `computed`: {string} creates a computed property. A computed property
   * is also automatically set to `readOnly: true`. The value is calculated
   * by running a method and arguments parsed from the given string. For
   * example 'compute(foo)' will compute a given property when the
   * 'foo' property changes by executing the 'compute' method. This method
   * must return the computed value.
   *
   * * `reflectToAttribute`: {boolean} If true, the property value is reflected
   * to an attribute of the same name. Note, the attribute is dash-cased
   * so a property named 'fooBar' is reflected as 'foo-bar'.
   *
   * * `notify`: {boolean} sends a non-bubbling notification event when
   * the property changes. For example, a property named 'foo' sends an
   * event named 'foo-changed' with `event.detail` set to the value of
   * the property.
   *
   * * observer: {string} name of a method that runs when the property
   * changes. The arguments of the method are (value, previousValue).
   *
   * Note: Users may want control over modifying property
   * effects via subclassing. For example, a user might want to make a
   * reflectToAttribute property not do so in a subclass. We've chosen to
   * disable this because it leads to additional complication.
   * For example, a readOnly effect generates a special setter. If a subclass
   * disables the effect, the setter would fail unexpectedly.
   * Based on feedback, we may want to try to make effects more malleable
   * and/or provide an advanced api for manipulating them.
   *
   * @param {!PolymerElement} proto Element class prototype to add accessors
   *   and effects to
   * @param {string} name Name of the property.
   * @param {Object} info Info object from which to create property effects.
   * Supported keys:
   * @param {Object} allProps Flattened map of all properties defined in this
   *   element (including inherited properties)
   * @return {void}
   * @private
   */


  function createPropertyFromConfig(proto, name, info, allProps) {
    // computed forces readOnly...
    if (info.computed) {
      info.readOnly = true;
    } // Note, since all computed properties are readOnly, this prevents
    // adding additional computed property effects (which leads to a confusing
    // setup where multiple triggers for setting a property)
    // While we do have `hasComputedEffect` this is set on the property's
    // dependencies rather than itself.


    if (info.computed) {
      if (proto._hasReadOnlyEffect(name)) {
        console.warn(`Cannot redefine computed property '${name}'.`);
      } else {
        proto._createComputedProperty(name, info.computed, allProps);
      }
    }

    if (info.readOnly && !proto._hasReadOnlyEffect(name)) {
      proto._createReadOnlyProperty(name, !info.computed);
    } else if (info.readOnly === false && proto._hasReadOnlyEffect(name)) {
      console.warn(`Cannot make readOnly property '${name}' non-readOnly.`);
    }

    if (info.reflectToAttribute && !proto._hasReflectEffect(name)) {
      proto._createReflectedProperty(name);
    } else if (info.reflectToAttribute === false && proto._hasReflectEffect(name)) {
      console.warn(`Cannot make reflected property '${name}' non-reflected.`);
    }

    if (info.notify && !proto._hasNotifyEffect(name)) {
      proto._createNotifyingProperty(name);
    } else if (info.notify === false && proto._hasNotifyEffect(name)) {
      console.warn(`Cannot make notify property '${name}' non-notify.`);
    } // always add observer


    if (info.observer) {
      proto._createPropertyObserver(name, info.observer, allProps[info.observer]);
    } // always create the mapping from attribute back to property for deserialization.


    proto._addPropertyToAttributeMap(name);
  }
  /**
   * Process all style elements in the element template. Styles with the
   * `include` attribute are processed such that any styles in
   * the associated "style modules" are included in the element template.
   * @param {PolymerElementConstructor} klass Element class
   * @param {!HTMLTemplateElement} template Template to process
   * @param {string} is Name of element
   * @param {string} baseURI Base URI for element
   * @private
   */


  function processElementStyles(klass, template, is, baseURI) {
    if (!builtCSS) {
      const templateStyles = template.content.querySelectorAll('style');
      const stylesWithImports = Object(_utils_style_gather_js__WEBPACK_IMPORTED_MODULE_3__["stylesFromTemplate"])(template); // insert styles from <link rel="import" type="css"> at the top of the template

      const linkedStyles = Object(_utils_style_gather_js__WEBPACK_IMPORTED_MODULE_3__["stylesFromModuleImports"])(is);
      const firstTemplateChild = template.content.firstElementChild;

      for (let idx = 0; idx < linkedStyles.length; idx++) {
        let s = linkedStyles[idx];
        s.textContent = klass._processStyleText(s.textContent, baseURI);
        template.content.insertBefore(s, firstTemplateChild);
      } // keep track of the last "concrete" style in the template we have encountered


      let templateStyleIndex = 0; // ensure all gathered styles are actually in this template.

      for (let i = 0; i < stylesWithImports.length; i++) {
        let s = stylesWithImports[i];
        let templateStyle = templateStyles[templateStyleIndex]; // if the style is not in this template, it's been "included" and
        // we put a clone of it in the template before the style that included it

        if (templateStyle !== s) {
          s = s.cloneNode(true);
          templateStyle.parentNode.insertBefore(s, templateStyle);
        } else {
          templateStyleIndex++;
        }

        s.textContent = klass._processStyleText(s.textContent, baseURI);
      }
    }

    if (window.ShadyCSS) {
      window.ShadyCSS.prepareTemplate(template, is);
    } // Support for `adoptedStylesheets` relies on using native Shadow DOM
    // and built CSS. Built CSS is required because runtime transformation of
    // `@apply` is not supported. This is because ShadyCSS relies on being able
    // to update a `style` element in the element template and this is
    // removed when using `adoptedStyleSheets`.
    // Note, it would be more efficient to allow style includes to become
    // separate stylesheets; however, because of `@apply` these are
    // potentially not shareable and sharing the ones that could be shared
    // would require some coordination. To keep it simple, all the includes
    // and styles are collapsed into a single shareable stylesheet.


    if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["useAdoptedStyleSheetsWithBuiltCSS"] && builtCSS && _utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["supportsAdoptingStyleSheets"]) {
      // Remove styles in template and make a shareable stylesheet
      const styles = template.content.querySelectorAll('style');

      if (styles) {
        let css = '';
        Array.from(styles).forEach(s => {
          css += s.textContent;
          s.parentNode.removeChild(s);
        });
        klass._styleSheet = new CSSStyleSheet();

        klass._styleSheet.replaceSync(css);
      }
    }
  }
  /**
   * Look up template from dom-module for element
   *
   * @param {string} is Element name to look up
   * @return {?HTMLTemplateElement|undefined} Template found in dom module, or
   *   undefined if not found
   * @protected
   */


  function getTemplateFromDomModule(is) {
    let template = null; // Under strictTemplatePolicy in 3.x+, dom-module lookup is only allowed
    // when opted-in via allowTemplateFromDomModule

    if (is && (!_utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["strictTemplatePolicy"] || _utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["allowTemplateFromDomModule"])) {
      template =
      /** @type {?HTMLTemplateElement} */
      _elements_dom_module_js__WEBPACK_IMPORTED_MODULE_5__["DomModule"].import(is, 'template'); // Under strictTemplatePolicy, require any element with an `is`
      // specified to have a dom-module

      if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["strictTemplatePolicy"] && !template) {
        throw new Error(`strictTemplatePolicy: expecting dom-module or null template for ${is}`);
      }
    }

    return template;
  }
  /**
   * @polymer
   * @mixinClass
   * @unrestricted
   * @implements {Polymer_ElementMixin}
   * @extends {polymerElementBase}
   */


  class PolymerElement extends polymerElementBase {
    /**
     * Current Polymer version in Semver notation.
     * @type {string} Semver notation of the current version of Polymer.
     * @nocollapse
     */
    static get polymerElementVersion() {
      return version;
    }
    /**
     * Override of PropertiesMixin _finalizeClass to create observers and
     * find the template.
     * @return {void}
     * @protected
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     * @nocollapse
     */


    static _finalizeClass() {
      // TODO(https://github.com/google/closure-compiler/issues/3240):
      //     Change back to just super.methodCall()
      polymerElementBase._finalizeClass.call(this);

      const observers = ownObservers(this);

      if (observers) {
        this.createObservers(observers, this._properties);
      }

      this._prepareTemplate();
    }
    /** @nocollapse */


    static _prepareTemplate() {
      // note: create "working" template that is finalized at instance time
      let template =
      /** @type {PolymerElementConstructor} */
      this.template;

      if (template) {
        if (typeof template === 'string') {
          console.error('template getter must return HTMLTemplateElement');
          template = null;
        } else if (!_utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["legacyOptimizations"]) {
          template = template.cloneNode(true);
        }
      }
      /** @override */


      this.prototype._template = template;
    }
    /**
     * Override of PropertiesChanged createProperties to create accessors
     * and property effects for all of the properties.
     * @param {!Object} props .
     * @return {void}
     * @protected
     * @nocollapse
     */


    static createProperties(props) {
      for (let p in props) {
        createPropertyFromConfig(
        /** @type {?} */
        this.prototype, p, props[p], props);
      }
    }
    /**
     * Creates observers for the given `observers` array.
     * Leverages `PropertyEffects` to create observers.
     * @param {Object} observers Array of observer descriptors for
     *   this class
     * @param {Object} dynamicFns Object containing keys for any properties
     *   that are functions and should trigger the effect when the function
     *   reference is changed
     * @return {void}
     * @protected
     * @nocollapse
     */


    static createObservers(observers, dynamicFns) {
      const proto = this.prototype;

      for (let i = 0; i < observers.length; i++) {
        proto._createMethodObserver(observers[i], dynamicFns);
      }
    }
    /**
     * Returns the template that will be stamped into this element's shadow root.
     *
     * If a `static get is()` getter is defined, the default implementation will
     * return the first `<template>` in a `dom-module` whose `id` matches this
     * element's `is` (note that a `_template` property on the class prototype
     * takes precedence over the `dom-module` template, to maintain legacy
     * element semantics; a subclass will subsequently fall back to its super
     * class template if neither a `prototype._template` or a `dom-module` for
     * the class's `is` was found).
     *
     * Users may override this getter to return an arbitrary template
     * (in which case the `is` getter is unnecessary). The template returned
     * must be an `HTMLTemplateElement`.
     *
     * Note that when subclassing, if the super class overrode the default
     * implementation and the subclass would like to provide an alternate
     * template via a `dom-module`, it should override this getter and
     * return `DomModule.import(this.is, 'template')`.
     *
     * If a subclass would like to modify the super class template, it should
     * clone it rather than modify it in place.  If the getter does expensive
     * work such as cloning/modifying a template, it should memoize the
     * template for maximum performance:
     *
     *   let memoizedTemplate;
     *   class MySubClass extends MySuperClass {
     *     static get template() {
     *       if (!memoizedTemplate) {
     *         memoizedTemplate = super.template.cloneNode(true);
     *         let subContent = document.createElement('div');
     *         subContent.textContent = 'This came from MySubClass';
     *         memoizedTemplate.content.appendChild(subContent);
     *       }
     *       return memoizedTemplate;
     *     }
     *   }
     *
     * @return {!HTMLTemplateElement|string} Template to be stamped
     * @nocollapse
     */


    static get template() {
      // Explanation of template-related properties:
      // - constructor.template (this getter): the template for the class.
      //     This can come from the prototype (for legacy elements), from a
      //     dom-module, or from the super class's template (or can be overridden
      //     altogether by the user)
      // - constructor._template: memoized version of constructor.template
      // - prototype._template: working template for the element, which will be
      //     parsed and modified in place. It is a cloned version of
      //     constructor.template, saved in _finalizeClass(). Note that before
      //     this getter is called, for legacy elements this could be from a
      //     _template field on the info object passed to Polymer(), a behavior,
      //     or set in registered(); once the static getter runs, a clone of it
      //     will overwrite it on the prototype as the working template.
      if (!this.hasOwnProperty(JSCompiler_renameProperty('_template', this))) {
        const protoTemplate = this.prototype.hasOwnProperty(JSCompiler_renameProperty('_template', this.prototype)) ? this.prototype._template : undefined;
        this._template = // If user has put template on prototype (e.g. in legacy via registered
        // callback or info object), prefer that first. Note that `null` is
        // used as a sentinel to indicate "no template" and can be used to
        // override a super template, whereas `undefined` is used as a
        // sentinel to mean "fall-back to default template lookup" via
        // dom-module and/or super.template.
        protoTemplate !== undefined ? protoTemplate : // Look in dom-module associated with this element's is
        this.hasOwnProperty(JSCompiler_renameProperty('is', this)) && getTemplateFromDomModule(
        /** @type {PolymerElementConstructor}*/
        this.is) || // Next look for superclass template (call the super impl this
        // way so that `this` points to the superclass)
        Object.getPrototypeOf(
        /** @type {PolymerElementConstructor}*/
        this.prototype).constructor.template;
      }

      return this._template;
    }
    /**
     * Set the template.
     *
     * @param {!HTMLTemplateElement|string} value Template to set.
     * @nocollapse
     */


    static set template(value) {
      this._template = value;
    }
    /**
     * Path matching the url from which the element was imported.
     *
     * This path is used to resolve url's in template style cssText.
     * The `importPath` property is also set on element instances and can be
     * used to create bindings relative to the import path.
     *
     * For elements defined in ES modules, users should implement
     * `static get importMeta() { return import.meta; }`, and the default
     * implementation of `importPath` will  return `import.meta.url`'s path.
     * For elements defined in HTML imports, this getter will return the path
     * to the document containing a `dom-module` element matching this
     * element's static `is` property.
     *
     * Note, this path should contain a trailing `/`.
     *
     * @return {string} The import path for this element class
     * @suppress {missingProperties}
     * @nocollapse
     */


    static get importPath() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('_importPath', this))) {
        const meta = this.importMeta;

        if (meta) {
          this._importPath = Object(_utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_4__["pathFromUrl"])(meta.url);
        } else {
          const module = _elements_dom_module_js__WEBPACK_IMPORTED_MODULE_5__["DomModule"].import(
          /** @type {PolymerElementConstructor} */
          this.is);
          this._importPath = module && module.assetpath || Object.getPrototypeOf(
          /** @type {PolymerElementConstructor}*/
          this.prototype).constructor.importPath;
        }
      }

      return this._importPath;
    }

    constructor() {
      super();
      /** @type {HTMLTemplateElement} */

      this._template;
      /** @type {string} */

      this._importPath;
      /** @type {string} */

      this.rootPath;
      /** @type {string} */

      this.importPath;
      /** @type {StampedTemplate | HTMLElement | ShadowRoot} */

      this.root;
      /** @type {!Object<string, !Element>} */

      this.$;
    }
    /**
     * Overrides the default `PropertyAccessors` to ensure class
     * metaprogramming related to property accessors and effects has
     * completed (calls `finalize`).
     *
     * It also initializes any property defaults provided via `value` in
     * `properties` metadata.
     *
     * @return {void}
     * @override
     * @suppress {invalidCasts,missingProperties} go/missingfnprops
     */


    _initializeProperties() {
      this.constructor.finalize(); // note: finalize template when we have access to `localName` to
      // avoid dependence on `is` for polyfilling styling.

      this.constructor._finalizeTemplate(
      /** @type {!HTMLElement} */
      this.localName);

      super._initializeProperties(); // set path defaults


      this.rootPath = _utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["rootPath"];
      this.importPath = this.constructor.importPath; // apply property defaults...

      let p$ = propertyDefaults(this.constructor);

      if (!p$) {
        return;
      }

      for (let p in p$) {
        let info = p$[p];

        if (this._canApplyPropertyDefault(p)) {
          let value = typeof info.value == 'function' ? info.value.call(this) : info.value; // Set via `_setProperty` if there is an accessor, to enable
          // initializing readOnly property defaults

          if (this._hasAccessor(p)) {
            this._setPendingProperty(p, value, true);
          } else {
            this[p] = value;
          }
        }
      }
    }
    /**
     * Determines if a property dfeault can be applied. For example, this
     * prevents a default from being applied when a property that has no
     * accessor is overridden by its host before upgrade (e.g. via a binding).
     * @override
     * @param {string} property Name of the property
     * @return {boolean} Returns true if the property default can be applied.
     */


    _canApplyPropertyDefault(property) {
      return !this.hasOwnProperty(property);
    }
    /**
     * Gather style text for a style element in the template.
     *
     * @param {string} cssText Text containing styling to process
     * @param {string} baseURI Base URI to rebase CSS paths against
     * @return {string} The processed CSS text
     * @protected
     * @nocollapse
     */


    static _processStyleText(cssText, baseURI) {
      return Object(_utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_4__["resolveCss"])(cssText, baseURI);
    }
    /**
    * Configures an element `proto` to function with a given `template`.
    * The element name `is` and extends `ext` must be specified for ShadyCSS
    * style scoping.
    *
    * @param {string} is Tag name (or type extension name) for this element
    * @return {void}
    * @protected
    * @nocollapse
    */


    static _finalizeTemplate(is) {
      /** @const {HTMLTemplateElement} */
      const template = this.prototype._template;

      if (template && !template.__polymerFinalized) {
        template.__polymerFinalized = true;
        const importPath = this.importPath;
        const baseURI = importPath ? Object(_utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_4__["resolveUrl"])(importPath) : ''; // e.g. support `include="module-name"`, and ShadyCSS

        processElementStyles(this, template, is, baseURI);

        this.prototype._bindTemplate(template);
      }
    }
    /**
     * Provides a default implementation of the standard Custom Elements
     * `connectedCallback`.
     *
     * The default implementation enables the property effects system and
     * flushes any pending properties, and updates shimmed CSS properties
     * when using the ShadyCSS scoping/custom properties polyfill.
     *
     * @override
     * @suppress {missingProperties, invalidCasts} Super may or may not
     *     implement the callback
     * @return {void}
     */


    connectedCallback() {
      if (window.ShadyCSS && this._template) {
        window.ShadyCSS.styleElement(
        /** @type {!HTMLElement} */
        this);
      }

      super.connectedCallback();
    }
    /**
     * Stamps the element template.
     *
     * @return {void}
     * @override
     */


    ready() {
      if (this._template) {
        this.root = this._stampTemplate(this._template);
        this.$ = this.root.$;
      }

      super.ready();
    }
    /**
     * Implements `PropertyEffects`'s `_readyClients` call. Attaches
     * element dom by calling `_attachDom` with the dom stamped from the
     * element's template via `_stampTemplate`. Note that this allows
     * client dom to be attached to the element prior to any observers
     * running.
     *
     * @return {void}
     * @override
     */


    _readyClients() {
      if (this._template) {
        this.root = this._attachDom(
        /** @type {StampedTemplate} */
        this.root);
      } // The super._readyClients here sets the clients initialized flag.
      // We must wait to do this until after client dom is created/attached
      // so that this flag can be checked to prevent notifications fired
      // during this process from being handled before clients are ready.


      super._readyClients();
    }
    /**
     * Attaches an element's stamped dom to itself. By default,
     * this method creates a `shadowRoot` and adds the dom to it.
     * However, this method may be overridden to allow an element
     * to put its dom in another location.
     *
     * @override
     * @throws {Error}
     * @suppress {missingReturn}
     * @param {StampedTemplate} dom to attach to the element.
     * @return {ShadowRoot} node to which the dom has been attached.
     */


    _attachDom(dom) {
      const n = Object(_utils_wrap_js__WEBPACK_IMPORTED_MODULE_8__["wrap"])(this);

      if (n.attachShadow) {
        if (dom) {
          if (!n.shadowRoot) {
            n.attachShadow({
              mode: 'open',
              shadyUpgradeFragment: dom
            });
            n.shadowRoot.appendChild(dom); // When `adoptedStyleSheets` is supported a stylesheet is made
            // available on the element constructor.

            if (this.constructor._styleSheet) {
              n.shadowRoot.adoptedStyleSheets = [this.constructor._styleSheet];
            }
          }

          if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["syncInitialRender"] && window.ShadyDOM) {
            window.ShadyDOM.flushInitial(n.shadowRoot);
          }

          return n.shadowRoot;
        }

        return null;
      } else {
        throw new Error('ShadowDOM not available. ' + // TODO(sorvell): move to compile-time conditional when supported
        'PolymerElement can create dom as children instead of in ' + 'ShadowDOM by setting `this.root = this;\` before \`ready\`.');
      }
    }
    /**
     * When using the ShadyCSS scoping and custom property shim, causes all
     * shimmed styles in this element (and its subtree) to be updated
     * based on current custom property values.
     *
     * The optional parameter overrides inline custom property styles with an
     * object of properties where the keys are CSS properties, and the values
     * are strings.
     *
     * Example: `this.updateStyles({'--color': 'blue'})`
     *
     * These properties are retained unless a value of `null` is set.
     *
     * Note: This function does not support updating CSS mixins.
     * You can not dynamically change the value of an `@apply`.
     *
     * @override
     * @param {Object=} properties Bag of custom property key/values to
     *   apply to this element.
     * @return {void}
     * @suppress {invalidCasts}
     */


    updateStyles(properties) {
      if (window.ShadyCSS) {
        window.ShadyCSS.styleSubtree(
        /** @type {!HTMLElement} */
        this, properties);
      }
    }
    /**
     * Rewrites a given URL relative to a base URL. The base URL defaults to
     * the original location of the document containing the `dom-module` for
     * this element. This method will return the same URL before and after
     * bundling.
     *
     * Note that this function performs no resolution for URLs that start
     * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
     * URL resolution, use `window.URL`.
     *
     * @override
     * @param {string} url URL to resolve.
     * @param {string=} base Optional base URL to resolve against, defaults
     * to the element's `importPath`
     * @return {string} Rewritten URL relative to base
     */


    resolveUrl(url, base) {
      if (!base && this.importPath) {
        base = Object(_utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_4__["resolveUrl"])(this.importPath);
      }

      return Object(_utils_resolve_url_js__WEBPACK_IMPORTED_MODULE_4__["resolveUrl"])(url, base);
    }
    /**
     * Overrides `PropertyEffects` to add map of dynamic functions on
     * template info, for consumption by `PropertyEffects` template binding
     * code. This map determines which method templates should have accessors
     * created for them.
     *
     * @param {!HTMLTemplateElement} template Template
     * @param {!TemplateInfo} templateInfo Template metadata for current template
     * @param {!NodeInfo} nodeInfo Node metadata for current template.
     * @return {boolean} .
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     * @nocollapse
     */


    static _parseTemplateContent(template, templateInfo, nodeInfo) {
      templateInfo.dynamicFns = templateInfo.dynamicFns || this._properties; // TODO(https://github.com/google/closure-compiler/issues/3240):
      //     Change back to just super.methodCall()

      return polymerElementBase._parseTemplateContent.call(this, template, templateInfo, nodeInfo);
    }
    /**
     * Overrides `PropertyEffects` to warn on use of undeclared properties in
     * template.
     *
     * @param {Object} templateInfo Template metadata to add effect to
     * @param {string} prop Property that should trigger the effect
     * @param {Object=} effect Effect metadata object
     * @return {void}
     * @protected
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     * @nocollapse
     */


    static _addTemplatePropertyEffect(templateInfo, prop, effect) {
      // Warn if properties are used in template without being declared.
      // Properties must be listed in `properties` to be included in
      // `observedAttributes` since CE V1 reads that at registration time, and
      // since we want to keep template parsing lazy, we can't automatically
      // add undeclared properties used in templates to `observedAttributes`.
      // The warning is only enabled in `legacyOptimizations` mode, since
      // we don't want to spam existing users who might have adopted the
      // shorthand when attribute deserialization is not important.
      if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_1__["legacyWarnings"] && !(prop in this._properties) && // Methods used in templates with no dependencies (or only literal
      // dependencies) become accessors with template effects; ignore these
      !(effect.info.part.signature && effect.info.part.signature.static) && // Warnings for bindings added to nested templates are handled by
      // templatizer so ignore both the host-to-template bindings
      // (`hostProp`) and TemplateInstance-to-child bindings
      // (`nestedTemplate`)
      !effect.info.part.hostProp && !templateInfo.nestedTemplate) {
        console.warn(`Property '${prop}' used in template but not declared in 'properties'; ` + `attribute will not be observed.`);
      } // TODO(https://github.com/google/closure-compiler/issues/3240):
      //     Change back to just super.methodCall()


      return polymerElementBase._addTemplatePropertyEffect.call(this, templateInfo, prop, effect);
    }

  }

  return PolymerElement;
});
/**
 * When using the ShadyCSS scoping and custom property shim, causes all
 * shimmed `styles` (via `custom-style`) in the document (and its subtree)
 * to be updated based on current custom property values.
 *
 * The optional parameter overrides inline custom property styles with an
 * object of properties where the keys are CSS properties, and the values
 * are strings.
 *
 * Example: `updateStyles({'--color': 'blue'})`
 *
 * These properties are retained unless a value of `null` is set.
 *
 * @param {Object=} props Bag of custom property key/values to
 *   apply to the document.
 * @return {void}
 */

const updateStyles = function (props) {
  if (window.ShadyCSS) {
    window.ShadyCSS.styleDocument(props);
  }
};

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/mixins/properties-changed.js":
/*!************************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/mixins/properties-changed.js ***!
  \************************************************************************/
/*! exports provided: PropertiesChanged */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PropertiesChanged", function() { return PropertiesChanged; });
/* harmony import */ var _utils_boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/mixin.js */ "./node_modules/@polymer/polymer/lib/utils/mixin.js");
/* harmony import */ var _utils_async_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/async.js */ "./node_modules/@polymer/polymer/lib/utils/async.js");
/* harmony import */ var _utils_wrap_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/wrap.js */ "./node_modules/@polymer/polymer/lib/utils/wrap.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/




/** @const {!AsyncInterface} */

const microtask = _utils_async_js__WEBPACK_IMPORTED_MODULE_2__["microTask"];
/**
 * Element class mixin that provides basic meta-programming for creating one
 * or more property accessors (getter/setter pair) that enqueue an async
 * (batched) `_propertiesChanged` callback.
 *
 * For basic usage of this mixin, call `MyClass.createProperties(props)`
 * once at class definition time to create property accessors for properties
 * named in props, implement `_propertiesChanged` to react as desired to
 * property changes, and implement `static get observedAttributes()` and
 * include lowercase versions of any property names that should be set from
 * attributes. Last, call `this._enableProperties()` in the element's
 * `connectedCallback` to enable the accessors.
 *
 * @mixinFunction
 * @polymer
 * @summary Element class mixin for reacting to property changes from
 *   generated property accessors.
 * @template T
 * @param {function(new:T)} superClass Class to apply mixin to.
 * @return {function(new:T)} superClass with mixin applied.
 */

const PropertiesChanged = Object(_utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__["dedupingMixin"])(
/**
 * @template T
 * @param {function(new:T)} superClass Class to apply mixin to.
 * @return {function(new:T)} superClass with mixin applied.
 */
superClass => {
  /**
   * @polymer
   * @mixinClass
   * @implements {Polymer_PropertiesChanged}
   * @unrestricted
   */
  class PropertiesChanged extends superClass {
    /**
     * Creates property accessors for the given property names.
     * @param {!Object} props Object whose keys are names of accessors.
     * @return {void}
     * @protected
     * @nocollapse
     */
    static createProperties(props) {
      const proto = this.prototype;

      for (let prop in props) {
        // don't stomp an existing accessor
        if (!(prop in proto)) {
          proto._createPropertyAccessor(prop);
        }
      }
    }
    /**
     * Returns an attribute name that corresponds to the given property.
     * The attribute name is the lowercased property name. Override to
     * customize this mapping.
     * @param {string} property Property to convert
     * @return {string} Attribute name corresponding to the given property.
     *
     * @protected
     * @nocollapse
     */


    static attributeNameForProperty(property) {
      return property.toLowerCase();
    }
    /**
     * Override point to provide a type to which to deserialize a value to
     * a given property.
     * @param {string} name Name of property
     *
     * @protected
     * @nocollapse
     */


    static typeForProperty(name) {} //eslint-disable-line no-unused-vars

    /**
     * Creates a setter/getter pair for the named property with its own
     * local storage.  The getter returns the value in the local storage,
     * and the setter calls `_setProperty`, which updates the local storage
     * for the property and enqueues a `_propertiesChanged` callback.
     *
     * This method may be called on a prototype or an instance.  Calling
     * this method may overwrite a property value that already exists on
     * the prototype/instance by creating the accessor.
     *
     * @param {string} property Name of the property
     * @param {boolean=} readOnly When true, no setter is created; the
     *   protected `_setProperty` function must be used to set the property
     * @return {void}
     * @protected
     * @override
     */


    _createPropertyAccessor(property, readOnly) {
      this._addPropertyToAttributeMap(property);

      if (!this.hasOwnProperty(JSCompiler_renameProperty('__dataHasAccessor', this))) {
        this.__dataHasAccessor = Object.assign({}, this.__dataHasAccessor);
      }

      if (!this.__dataHasAccessor[property]) {
        this.__dataHasAccessor[property] = true;

        this._definePropertyAccessor(property, readOnly);
      }
    }
    /**
     * Adds the given `property` to a map matching attribute names
     * to property names, using `attributeNameForProperty`. This map is
     * used when deserializing attribute values to properties.
     *
     * @param {string} property Name of the property
     * @override
     */


    _addPropertyToAttributeMap(property) {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('__dataAttributes', this))) {
        this.__dataAttributes = Object.assign({}, this.__dataAttributes);
      } // This check is technically not correct; it's an optimization that
      // assumes that if a _property_ name is already in the map (note this is
      // an attr->property map), the property mapped directly to the attribute
      // and it has already been mapped.  This would fail if
      // `attributeNameForProperty` were overridden such that this was not the
      // case.


      let attr = this.__dataAttributes[property];

      if (!attr) {
        attr = this.constructor.attributeNameForProperty(property);
        this.__dataAttributes[attr] = property;
      }

      return attr;
    }
    /**
     * Defines a property accessor for the given property.
     * @param {string} property Name of the property
     * @param {boolean=} readOnly When true, no setter is created
     * @return {void}
     * @override
     */


    _definePropertyAccessor(property, readOnly) {
      Object.defineProperty(this, property, {
        /* eslint-disable valid-jsdoc */

        /** @this {PropertiesChanged} */
        get() {
          // Inline for perf instead of using `_getProperty`
          return this.__data[property];
        },

        /** @this {PropertiesChanged} */
        set: readOnly ? function () {} : function (value) {
          // Inline for perf instead of using `_setProperty`
          if (this._setPendingProperty(property, value, true)) {
            this._invalidateProperties();
          }
        }
        /* eslint-enable */

      });
    }

    constructor() {
      super();
      /** @type {boolean} */

      this.__dataEnabled = false;
      this.__dataReady = false;
      this.__dataInvalid = false;
      this.__data = {};
      this.__dataPending = null;
      this.__dataOld = null;
      this.__dataInstanceProps = null;
      /** @type {number} */
      // NOTE: used to track re-entrant calls to `_flushProperties`

      this.__dataCounter = 0;
      this.__serializing = false;

      this._initializeProperties();
    }
    /**
     * Lifecycle callback called when properties are enabled via
     * `_enableProperties`.
     *
     * Users may override this function to implement behavior that is
     * dependent on the element having its property data initialized, e.g.
     * from defaults (initialized from `constructor`, `_initializeProperties`),
     * `attributeChangedCallback`, or values propagated from host e.g. via
     * bindings.  `super.ready()` must be called to ensure the data system
     * becomes enabled.
     *
     * @return {void}
     * @public
     * @override
     */


    ready() {
      this.__dataReady = true;

      this._flushProperties();
    }
    /**
     * Initializes the local storage for property accessors.
     *
     * Provided as an override point for performing any setup work prior
     * to initializing the property accessor system.
     *
     * @return {void}
     * @protected
     * @override
     */


    _initializeProperties() {
      // Capture instance properties; these will be set into accessors
      // during first flush. Don't set them here, since we want
      // these to overwrite defaults/constructor assignments
      for (let p in this.__dataHasAccessor) {
        if (this.hasOwnProperty(p)) {
          this.__dataInstanceProps = this.__dataInstanceProps || {};
          this.__dataInstanceProps[p] = this[p];
          delete this[p];
        }
      }
    }
    /**
     * Called at ready time with bag of instance properties that overwrote
     * accessors when the element upgraded.
     *
     * The default implementation sets these properties back into the
     * setter at ready time.  This method is provided as an override
     * point for customizing or providing more efficient initialization.
     *
     * @param {Object} props Bag of property values that were overwritten
     *   when creating property accessors.
     * @return {void}
     * @protected
     * @override
     */


    _initializeInstanceProperties(props) {
      Object.assign(this, props);
    }
    /**
     * Updates the local storage for a property (via `_setPendingProperty`)
     * and enqueues a `_proeprtiesChanged` callback.
     *
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @return {void}
     * @protected
     * @override
     */


    _setProperty(property, value) {
      if (this._setPendingProperty(property, value)) {
        this._invalidateProperties();
      }
    }
    /**
     * Returns the value for the given property.
     * @param {string} property Name of property
     * @return {*} Value for the given property
     * @protected
     * @override
     */


    _getProperty(property) {
      return this.__data[property];
    }
    /* eslint-disable no-unused-vars */

    /**
     * Updates the local storage for a property, records the previous value,
     * and adds it to the set of "pending changes" that will be passed to the
     * `_propertiesChanged` callback.  This method does not enqueue the
     * `_propertiesChanged` callback.
     *
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @param {boolean=} ext Not used here; affordance for closure
     * @return {boolean} Returns true if the property changed
     * @protected
     * @override
     */


    _setPendingProperty(property, value, ext) {
      let old = this.__data[property];

      let changed = this._shouldPropertyChange(property, value, old);

      if (changed) {
        if (!this.__dataPending) {
          this.__dataPending = {};
          this.__dataOld = {};
        } // Ensure old is captured from the last turn


        if (this.__dataOld && !(property in this.__dataOld)) {
          this.__dataOld[property] = old;
        }

        this.__data[property] = value;
        this.__dataPending[property] = value;
      }

      return changed;
    }
    /* eslint-enable */

    /**
     * @param {string} property Name of the property
     * @return {boolean} Returns true if the property is pending.
     */


    _isPropertyPending(property) {
      return !!(this.__dataPending && this.__dataPending.hasOwnProperty(property));
    }
    /**
     * Marks the properties as invalid, and enqueues an async
     * `_propertiesChanged` callback.
     *
     * @return {void}
     * @protected
     * @override
     */


    _invalidateProperties() {
      if (!this.__dataInvalid && this.__dataReady) {
        this.__dataInvalid = true;
        microtask.run(() => {
          if (this.__dataInvalid) {
            this.__dataInvalid = false;

            this._flushProperties();
          }
        });
      }
    }
    /**
     * Call to enable property accessor processing. Before this method is
     * called accessor values will be set but side effects are
     * queued. When called, any pending side effects occur immediately.
     * For elements, generally `connectedCallback` is a normal spot to do so.
     * It is safe to call this method multiple times as it only turns on
     * property accessors once.
     *
     * @return {void}
     * @protected
     * @override
     */


    _enableProperties() {
      if (!this.__dataEnabled) {
        this.__dataEnabled = true;

        if (this.__dataInstanceProps) {
          this._initializeInstanceProperties(this.__dataInstanceProps);

          this.__dataInstanceProps = null;
        }

        this.ready();
      }
    }
    /**
     * Calls the `_propertiesChanged` callback with the current set of
     * pending changes (and old values recorded when pending changes were
     * set), and resets the pending set of changes. Generally, this method
     * should not be called in user code.
     *
     * @return {void}
     * @protected
     * @override
     */


    _flushProperties() {
      this.__dataCounter++;
      const props = this.__data;
      const changedProps = this.__dataPending;
      const old = this.__dataOld;

      if (this._shouldPropertiesChange(props, changedProps, old)) {
        this.__dataPending = null;
        this.__dataOld = null;

        this._propertiesChanged(props, changedProps, old);
      }

      this.__dataCounter--;
    }
    /**
     * Called in `_flushProperties` to determine if `_propertiesChanged`
     * should be called. The default implementation returns true if
     * properties are pending. Override to customize when
     * `_propertiesChanged` is called.
     * @param {!Object} currentProps Bag of all current accessor values
     * @param {?Object} changedProps Bag of properties changed since the last
     *   call to `_propertiesChanged`
     * @param {?Object} oldProps Bag of previous values for each property
     *   in `changedProps`
     * @return {boolean} true if changedProps is truthy
     * @override
     */


    _shouldPropertiesChange(currentProps, changedProps, oldProps) {
      // eslint-disable-line no-unused-vars
      return Boolean(changedProps);
    }
    /**
     * Callback called when any properties with accessors created via
     * `_createPropertyAccessor` have been set.
     *
     * @param {!Object} currentProps Bag of all current accessor values
     * @param {?Object} changedProps Bag of properties changed since the last
     *   call to `_propertiesChanged`
     * @param {?Object} oldProps Bag of previous values for each property
     *   in `changedProps`
     * @return {void}
     * @protected
     * @override
     */


    _propertiesChanged(currentProps, changedProps, oldProps) {// eslint-disable-line no-unused-vars
    }
    /**
     * Method called to determine whether a property value should be
     * considered as a change and cause the `_propertiesChanged` callback
     * to be enqueued.
     *
     * The default implementation returns `true` if a strict equality
     * check fails. The method always returns false for `NaN`.
     *
     * Override this method to e.g. provide stricter checking for
     * Objects/Arrays when using immutable patterns.
     *
     * @param {string} property Property name
     * @param {*} value New property value
     * @param {*} old Previous property value
     * @return {boolean} Whether the property should be considered a change
     *   and enqueue a `_proeprtiesChanged` callback
     * @protected
     * @override
     */


    _shouldPropertyChange(property, value, old) {
      return (// Strict equality check
        old !== value && ( // This ensures (old==NaN, value==NaN) always returns false
        old === old || value === value)
      );
    }
    /**
     * Implements native Custom Elements `attributeChangedCallback` to
     * set an attribute value to a property via `_attributeToProperty`.
     *
     * @param {string} name Name of attribute that changed
     * @param {?string} old Old attribute value
     * @param {?string} value New attribute value
     * @param {?string} namespace Attribute namespace.
     * @return {void}
     * @suppress {missingProperties} Super may or may not implement the callback
     * @override
     */


    attributeChangedCallback(name, old, value, namespace) {
      if (old !== value) {
        this._attributeToProperty(name, value);
      }

      if (super.attributeChangedCallback) {
        super.attributeChangedCallback(name, old, value, namespace);
      }
    }
    /**
     * Deserializes an attribute to its associated property.
     *
     * This method calls the `_deserializeValue` method to convert the string to
     * a typed value.
     *
     * @param {string} attribute Name of attribute to deserialize.
     * @param {?string} value of the attribute.
     * @param {*=} type type to deserialize to, defaults to the value
     * returned from `typeForProperty`
     * @return {void}
     * @override
     */


    _attributeToProperty(attribute, value, type) {
      if (!this.__serializing) {
        const map = this.__dataAttributes;
        const property = map && map[attribute] || attribute;
        this[property] = this._deserializeValue(value, type || this.constructor.typeForProperty(property));
      }
    }
    /**
     * Serializes a property to its associated attribute.
     *
     * @suppress {invalidCasts} Closure can't figure out `this` is an element.
     *
     * @param {string} property Property name to reflect.
     * @param {string=} attribute Attribute name to reflect to.
     * @param {*=} value Property value to refect.
     * @return {void}
     * @override
     */


    _propertyToAttribute(property, attribute, value) {
      this.__serializing = true;
      value = arguments.length < 3 ? this[property] : value;

      this._valueToNodeAttribute(
      /** @type {!HTMLElement} */
      this, value, attribute || this.constructor.attributeNameForProperty(property));

      this.__serializing = false;
    }
    /**
     * Sets a typed value to an HTML attribute on a node.
     *
     * This method calls the `_serializeValue` method to convert the typed
     * value to a string.  If the `_serializeValue` method returns `undefined`,
     * the attribute will be removed (this is the default for boolean
     * type `false`).
     *
     * @param {Element} node Element to set attribute to.
     * @param {*} value Value to serialize.
     * @param {string} attribute Attribute name to serialize to.
     * @return {void}
     * @override
     */


    _valueToNodeAttribute(node, value, attribute) {
      const str = this._serializeValue(value);

      if (attribute === 'class' || attribute === 'name' || attribute === 'slot') {
        node =
        /** @type {?Element} */
        Object(_utils_wrap_js__WEBPACK_IMPORTED_MODULE_3__["wrap"])(node);
      }

      if (str === undefined) {
        node.removeAttribute(attribute);
      } else {
        node.setAttribute(attribute, str);
      }
    }
    /**
     * Converts a typed JavaScript value to a string.
     *
     * This method is called when setting JS property values to
     * HTML attributes.  Users may override this method to provide
     * serialization for custom types.
     *
     * @param {*} value Property value to serialize.
     * @return {string | undefined} String serialized from the provided
     * property  value.
     * @override
     */


    _serializeValue(value) {
      switch (typeof value) {
        case 'boolean':
          return value ? '' : undefined;

        default:
          return value != null ? value.toString() : undefined;
      }
    }
    /**
     * Converts a string to a typed JavaScript value.
     *
     * This method is called when reading HTML attribute values to
     * JS properties.  Users may override this method to provide
     * deserialization for custom `type`s. Types for `Boolean`, `String`,
     * and `Number` convert attributes to the expected types.
     *
     * @param {?string} value Value to deserialize.
     * @param {*=} type Type to deserialize the string to.
     * @return {*} Typed value deserialized from the provided string.
     * @override
     */


    _deserializeValue(value, type) {
      switch (type) {
        case Boolean:
          return value !== null;

        case Number:
          return Number(value);

        default:
          return value;
      }
    }

  }

  return PropertiesChanged;
});

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/mixins/properties-mixin.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/mixins/properties-mixin.js ***!
  \**********************************************************************/
/*! exports provided: PropertiesMixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PropertiesMixin", function() { return PropertiesMixin; });
/* harmony import */ var _utils_boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/mixin.js */ "./node_modules/@polymer/polymer/lib/utils/mixin.js");
/* harmony import */ var _utils_telemetry_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/telemetry.js */ "./node_modules/@polymer/polymer/lib/utils/telemetry.js");
/* harmony import */ var _properties_changed_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./properties-changed.js */ "./node_modules/@polymer/polymer/lib/mixins/properties-changed.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/




/**
 * Creates a copy of `props` with each property normalized such that
 * upgraded it is an object with at least a type property { type: Type}.
 *
 * @param {!Object} props Properties to normalize
 * @return {!Object} Copy of input `props` with normalized properties that
 * are in the form {type: Type}
 * @private
 */

function normalizeProperties(props) {
  const output = {};

  for (let p in props) {
    const o = props[p];
    output[p] = typeof o === 'function' ? {
      type: o
    } : o;
  }

  return output;
}
/**
 * Mixin that provides a minimal starting point to using the PropertiesChanged
 * mixin by providing a mechanism to declare properties in a static
 * getter (e.g. static get properties() { return { foo: String } }). Changes
 * are reported via the `_propertiesChanged` method.
 *
 * This mixin provides no specific support for rendering. Users are expected
 * to create a ShadowRoot and put content into it and update it in whatever
 * way makes sense. This can be done in reaction to properties changing by
 * implementing `_propertiesChanged`.
 *
 * @mixinFunction
 * @polymer
 * @appliesMixin PropertiesChanged
 * @summary Mixin that provides a minimal starting point for using
 * the PropertiesChanged mixin by providing a declarative `properties` object.
 * @template T
 * @param {function(new:T)} superClass Class to apply mixin to.
 * @return {function(new:T)} superClass with mixin applied.
 */


const PropertiesMixin = Object(_utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__["dedupingMixin"])(superClass => {
  /**
   * @constructor
   * @implements {Polymer_PropertiesChanged}
   * @private
   */
  const base = Object(_properties_changed_js__WEBPACK_IMPORTED_MODULE_3__["PropertiesChanged"])(superClass);
  /**
   * Returns the super class constructor for the given class, if it is an
   * instance of the PropertiesMixin.
   *
   * @param {!PropertiesMixinConstructor} constructor PropertiesMixin constructor
   * @return {?PropertiesMixinConstructor} Super class constructor
   */

  function superPropertiesClass(constructor) {
    const superCtor = Object.getPrototypeOf(constructor); // Note, the `PropertiesMixin` class below only refers to the class
    // generated by this call to the mixin; the instanceof test only works
    // because the mixin is deduped and guaranteed only to apply once, hence
    // all constructors in a proto chain will see the same `PropertiesMixin`

    return superCtor.prototype instanceof PropertiesMixin ?
    /** @type {!PropertiesMixinConstructor} */
    superCtor : null;
  }
  /**
   * Returns a memoized version of the `properties` object for the
   * given class. Properties not in object format are converted to at
   * least {type}.
   *
   * @param {PropertiesMixinConstructor} constructor PropertiesMixin constructor
   * @return {Object} Memoized properties object
   */


  function ownProperties(constructor) {
    if (!constructor.hasOwnProperty(JSCompiler_renameProperty('__ownProperties', constructor))) {
      let props = null;

      if (constructor.hasOwnProperty(JSCompiler_renameProperty('properties', constructor))) {
        const properties = constructor.properties;

        if (properties) {
          props = normalizeProperties(properties);
        }
      }

      constructor.__ownProperties = props;
    }

    return constructor.__ownProperties;
  }
  /**
   * @polymer
   * @mixinClass
   * @extends {base}
   * @implements {Polymer_PropertiesMixin}
   * @unrestricted
   */


  class PropertiesMixin extends base {
    /**
     * Implements standard custom elements getter to observes the attributes
     * listed in `properties`.
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     * @nocollapse
     */
    static get observedAttributes() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('__observedAttributes', this))) {
        Object(_utils_telemetry_js__WEBPACK_IMPORTED_MODULE_2__["register"])(this.prototype);
        const props = this._properties;
        this.__observedAttributes = props ? Object.keys(props).map(p => this.prototype._addPropertyToAttributeMap(p)) : [];
      }

      return this.__observedAttributes;
    }
    /**
     * Finalizes an element definition, including ensuring any super classes
     * are also finalized. This includes ensuring property
     * accessors exist on the element prototype. This method calls
     * `_finalizeClass` to finalize each constructor in the prototype chain.
     * @return {void}
     * @nocollapse
     */


    static finalize() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('__finalized', this))) {
        const superCtor = superPropertiesClass(
        /** @type {!PropertiesMixinConstructor} */
        this);

        if (superCtor) {
          superCtor.finalize();
        }

        this.__finalized = true;

        this._finalizeClass();
      }
    }
    /**
     * Finalize an element class. This includes ensuring property
     * accessors exist on the element prototype. This method is called by
     * `finalize` and finalizes the class constructor.
     *
     * @protected
     * @nocollapse
     */


    static _finalizeClass() {
      const props = ownProperties(
      /** @type {!PropertiesMixinConstructor} */
      this);

      if (props) {
        /** @type {?} */
        this.createProperties(props);
      }
    }
    /**
     * Returns a memoized version of all properties, including those inherited
     * from super classes. Properties not in object format are converted to
     * at least {type}.
     *
     * @return {Object} Object containing properties for this class
     * @protected
     * @nocollapse
     */


    static get _properties() {
      if (!this.hasOwnProperty(JSCompiler_renameProperty('__properties', this))) {
        const superCtor = superPropertiesClass(
        /** @type {!PropertiesMixinConstructor} */
        this);
        this.__properties = Object.assign({}, superCtor && superCtor._properties, ownProperties(
        /** @type {PropertiesMixinConstructor} */
        this));
      }

      return this.__properties;
    }
    /**
     * Overrides `PropertiesChanged` method to return type specified in the
     * static `properties` object for the given property.
     * @param {string} name Name of property
     * @return {*} Type to which to deserialize attribute
     *
     * @protected
     * @nocollapse
     */


    static typeForProperty(name) {
      const info = this._properties[name];
      return info && info.type;
    }
    /**
     * Overrides `PropertiesChanged` method and adds a call to
     * `finalize` which lazily configures the element's property accessors.
     * @override
     * @return {void}
     */


    _initializeProperties() {
      Object(_utils_telemetry_js__WEBPACK_IMPORTED_MODULE_2__["incrementInstanceCount"])();
      this.constructor.finalize();

      super._initializeProperties();
    }
    /**
     * Called when the element is added to a document.
     * Calls `_enableProperties` to turn on property system from
     * `PropertiesChanged`.
     * @suppress {missingProperties} Super may or may not implement the callback
     * @return {void}
     * @override
     */


    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }

      this._enableProperties();
    }
    /**
     * Called when the element is removed from a document
     * @suppress {missingProperties} Super may or may not implement the callback
     * @return {void}
     * @override
     */


    disconnectedCallback() {
      if (super.disconnectedCallback) {
        super.disconnectedCallback();
      }
    }

  }

  return PropertiesMixin;
});

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/mixins/property-accessors.js":
/*!************************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/mixins/property-accessors.js ***!
  \************************************************************************/
/*! exports provided: PropertyAccessors */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PropertyAccessors", function() { return PropertyAccessors; });
/* harmony import */ var _utils_boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/mixin.js */ "./node_modules/@polymer/polymer/lib/utils/mixin.js");
/* harmony import */ var _utils_case_map_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/case-map.js */ "./node_modules/@polymer/polymer/lib/utils/case-map.js");
/* harmony import */ var _properties_changed_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./properties-changed.js */ "./node_modules/@polymer/polymer/lib/mixins/properties-changed.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/



 // Save map of native properties; this forms a blacklist or properties
// that won't have their values "saved" by `saveAccessorValue`, since
// reading from an HTMLElement accessor from the context of a prototype throws

const nativeProperties = {};
let proto = HTMLElement.prototype;

while (proto) {
  let props = Object.getOwnPropertyNames(proto);

  for (let i = 0; i < props.length; i++) {
    nativeProperties[props[i]] = true;
  }

  proto = Object.getPrototypeOf(proto);
}
/**
 * Used to save the value of a property that will be overridden with
 * an accessor. If the `model` is a prototype, the values will be saved
 * in `__dataProto`, and it's up to the user (or downstream mixin) to
 * decide how/when to set these values back into the accessors.
 * If `model` is already an instance (it has a `__data` property), then
 * the value will be set as a pending property, meaning the user should
 * call `_invalidateProperties` or `_flushProperties` to take effect
 *
 * @param {Object} model Prototype or instance
 * @param {string} property Name of property
 * @return {void}
 * @private
 */


function saveAccessorValue(model, property) {
  // Don't read/store value for any native properties since they could throw
  if (!nativeProperties[property]) {
    let value = model[property];

    if (value !== undefined) {
      if (model.__data) {
        // Adding accessor to instance; update the property
        // It is the user's responsibility to call _flushProperties
        model._setPendingProperty(property, value);
      } else {
        // Adding accessor to proto; save proto's value for instance-time use
        if (!model.__dataProto) {
          model.__dataProto = {};
        } else if (!model.hasOwnProperty(JSCompiler_renameProperty('__dataProto', model))) {
          model.__dataProto = Object.create(model.__dataProto);
        }

        model.__dataProto[property] = value;
      }
    }
  }
}
/**
 * Element class mixin that provides basic meta-programming for creating one
 * or more property accessors (getter/setter pair) that enqueue an async
 * (batched) `_propertiesChanged` callback.
 *
 * For basic usage of this mixin:
 *
 * -   Declare attributes to observe via the standard `static get
 *     observedAttributes()`. Use `dash-case` attribute names to represent
 *     `camelCase` property names.
 * -   Implement the `_propertiesChanged` callback on the class.
 * -   Call `MyClass.createPropertiesForAttributes()` **once** on the class to
 *     generate property accessors for each observed attribute. This must be
 *     called before the first instance is created, for example, by calling it
 *     before calling `customElements.define`. It can also be called lazily from
 *     the element's `constructor`, as long as it's guarded so that the call is
 *     only made once, when the first instance is created.
 * -   Call `this._enableProperties()` in the element's `connectedCallback` to
 *     enable the accessors.
 *
 * Any `observedAttributes` will automatically be
 * deserialized via `attributeChangedCallback` and set to the associated
 * property using `dash-case`-to-`camelCase` convention.
 *
 * @mixinFunction
 * @polymer
 * @appliesMixin PropertiesChanged
 * @summary Element class mixin for reacting to property changes from
 *   generated property accessors.
 * @template T
 * @param {function(new:T)} superClass Class to apply mixin to.
 * @return {function(new:T)} superClass with mixin applied.
 */


const PropertyAccessors = Object(_utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__["dedupingMixin"])(superClass => {
  /**
   * @constructor
   * @implements {Polymer_PropertiesChanged}
   * @unrestricted
   * @private
   */
  const base = Object(_properties_changed_js__WEBPACK_IMPORTED_MODULE_3__["PropertiesChanged"])(superClass);
  /**
   * @polymer
   * @mixinClass
   * @implements {Polymer_PropertyAccessors}
   * @extends {base}
   * @unrestricted
   */

  class PropertyAccessors extends base {
    /**
     * Generates property accessors for all attributes in the standard
     * static `observedAttributes` array.
     *
     * Attribute names are mapped to property names using the `dash-case` to
     * `camelCase` convention
     *
     * @return {void}
     * @nocollapse
     */
    static createPropertiesForAttributes() {
      let a$ =
      /** @type {?} */
      this.observedAttributes;

      for (let i = 0; i < a$.length; i++) {
        this.prototype._createPropertyAccessor(Object(_utils_case_map_js__WEBPACK_IMPORTED_MODULE_2__["dashToCamelCase"])(a$[i]));
      }
    }
    /**
     * Returns an attribute name that corresponds to the given property.
     * By default, converts camel to dash case, e.g. `fooBar` to `foo-bar`.
     * @param {string} property Property to convert
     * @return {string} Attribute name corresponding to the given property.
     *
     * @protected
     * @nocollapse
     */


    static attributeNameForProperty(property) {
      return Object(_utils_case_map_js__WEBPACK_IMPORTED_MODULE_2__["camelToDashCase"])(property);
    }
    /**
     * Overrides PropertiesChanged implementation to initialize values for
     * accessors created for values that already existed on the element
     * prototype.
     *
     * @return {void}
     * @protected
     * @override
     */


    _initializeProperties() {
      if (this.__dataProto) {
        this._initializeProtoProperties(this.__dataProto);

        this.__dataProto = null;
      }

      super._initializeProperties();
    }
    /**
     * Called at instance time with bag of properties that were overwritten
     * by accessors on the prototype when accessors were created.
     *
     * The default implementation sets these properties back into the
     * setter at instance time.  This method is provided as an override
     * point for customizing or providing more efficient initialization.
     *
     * @param {Object} props Bag of property values that were overwritten
     *   when creating property accessors.
     * @return {void}
     * @protected
     * @override
     */


    _initializeProtoProperties(props) {
      for (let p in props) {
        this._setProperty(p, props[p]);
      }
    }
    /**
     * Ensures the element has the given attribute. If it does not,
     * assigns the given value to the attribute.
     *
     * @suppress {invalidCasts} Closure can't figure out `this` is infact an
     *     element
     *
     * @param {string} attribute Name of attribute to ensure is set.
     * @param {string} value of the attribute.
     * @return {void}
     * @override
     */


    _ensureAttribute(attribute, value) {
      const el =
      /** @type {!HTMLElement} */
      this;

      if (!el.hasAttribute(attribute)) {
        this._valueToNodeAttribute(el, value, attribute);
      }
    }
    /**
     * Overrides PropertiesChanged implemention to serialize objects as JSON.
     *
     * @param {*} value Property value to serialize.
     * @return {string | undefined} String serialized from the provided property
     *     value.
     * @override
     */


    _serializeValue(value) {
      /* eslint-disable no-fallthrough */
      switch (typeof value) {
        case 'object':
          if (value instanceof Date) {
            return value.toString();
          } else if (value) {
            try {
              return JSON.stringify(value);
            } catch (x) {
              return '';
            }
          }

        default:
          return super._serializeValue(value);
      }
    }
    /**
     * Converts a string to a typed JavaScript value.
     *
     * This method is called by Polymer when reading HTML attribute values to
     * JS properties.  Users may override this method on Polymer element
     * prototypes to provide deserialization for custom `type`s.  Note,
     * the `type` argument is the value of the `type` field provided in the
     * `properties` configuration object for a given property, and is
     * by convention the constructor for the type to deserialize.
     *
     *
     * @param {?string} value Attribute value to deserialize.
     * @param {*=} type Type to deserialize the string to.
     * @return {*} Typed value deserialized from the provided string.
     * @override
     */


    _deserializeValue(value, type) {
      /**
       * @type {*}
       */
      let outValue;

      switch (type) {
        case Object:
          try {
            outValue = JSON.parse(
            /** @type {string} */
            value);
          } catch (x) {
            // allow non-JSON literals like Strings and Numbers
            outValue = value;
          }

          break;

        case Array:
          try {
            outValue = JSON.parse(
            /** @type {string} */
            value);
          } catch (x) {
            outValue = null;
            console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${value}`);
          }

          break;

        case Date:
          outValue = isNaN(value) ? String(value) : Number(value);
          outValue = new Date(outValue);
          break;

        default:
          outValue = super._deserializeValue(value, type);
          break;
      }

      return outValue;
    }
    /* eslint-enable no-fallthrough */

    /**
     * Overrides PropertiesChanged implementation to save existing prototype
     * property value so that it can be reset.
     * @param {string} property Name of the property
     * @param {boolean=} readOnly When true, no setter is created
     *
     * When calling on a prototype, any overwritten values are saved in
     * `__dataProto`, and it is up to the subclasser to decide how/when
     * to set those properties back into the accessor.  When calling on an
     * instance, the overwritten value is set via `_setPendingProperty`,
     * and the user should call `_invalidateProperties` or `_flushProperties`
     * for the values to take effect.
     * @protected
     * @return {void}
     * @override
     */


    _definePropertyAccessor(property, readOnly) {
      saveAccessorValue(this, property);

      super._definePropertyAccessor(property, readOnly);
    }
    /**
     * Returns true if this library created an accessor for the given property.
     *
     * @param {string} property Property name
     * @return {boolean} True if an accessor was created
     * @override
     */


    _hasAccessor(property) {
      return this.__dataHasAccessor && this.__dataHasAccessor[property];
    }
    /**
     * Returns true if the specified property has a pending change.
     *
     * @param {string} prop Property name
     * @return {boolean} True if property has a pending change
     * @protected
     * @override
     */


    _isPropertyPending(prop) {
      return Boolean(this.__dataPending && prop in this.__dataPending);
    }

  }

  return PropertyAccessors;
});

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/mixins/property-effects.js":
/*!**********************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/mixins/property-effects.js ***!
  \**********************************************************************/
/*! exports provided: PropertyEffects */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PropertyEffects", function() { return PropertyEffects; });
/* harmony import */ var _utils_boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _utils_wrap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/wrap.js */ "./node_modules/@polymer/polymer/lib/utils/wrap.js");
/* harmony import */ var _utils_mixin_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/mixin.js */ "./node_modules/@polymer/polymer/lib/utils/mixin.js");
/* harmony import */ var _utils_path_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/path.js */ "./node_modules/@polymer/polymer/lib/utils/path.js");
/* harmony import */ var _utils_case_map_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/case-map.js */ "./node_modules/@polymer/polymer/lib/utils/case-map.js");
/* harmony import */ var _property_accessors_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./property-accessors.js */ "./node_modules/@polymer/polymer/lib/mixins/property-accessors.js");
/* harmony import */ var _template_stamp_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./template-stamp.js */ "./node_modules/@polymer/polymer/lib/mixins/template-stamp.js");
/* harmony import */ var _utils_settings_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/settings.js */ "./node_modules/@polymer/polymer/lib/utils/settings.js");
/**
 * @fileoverview
 * @suppress {checkPrototypalTypes}
 * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */




/* for notify, reflect */



/* for annotated effects */


 // Monotonically increasing unique ID used for de-duping effects triggered
// from multiple properties in the same turn

let dedupeId = 0;
const NOOP = [];
/**
 * Property effect types; effects are stored on the prototype using these keys
 * @enum {string}
 */

const TYPES = {
  COMPUTE: '__computeEffects',
  REFLECT: '__reflectEffects',
  NOTIFY: '__notifyEffects',
  PROPAGATE: '__propagateEffects',
  OBSERVE: '__observeEffects',
  READ_ONLY: '__readOnly'
};
const COMPUTE_INFO = '__computeInfo';
/** @const {!RegExp} */

const capitalAttributeRegex = /[A-Z]/;
/**
 * @typedef {{
 * name: (string | undefined),
 * structured: (boolean | undefined),
 * wildcard: (boolean | undefined)
 * }}
 */

let DataTrigger; //eslint-disable-line no-unused-vars

/**
 * @typedef {{
 * info: ?,
 * trigger: (!DataTrigger | undefined),
 * fn: (!Function | undefined)
 * }}
 */

let DataEffect; //eslint-disable-line no-unused-vars

/**
 * Ensures that the model has an own-property map of effects for the given type.
 * The model may be a prototype or an instance.
 *
 * Property effects are stored as arrays of effects by property in a map,
 * by named type on the model. e.g.
 *
 *   __computeEffects: {
 *     foo: [ ... ],
 *     bar: [ ... ]
 *   }
 *
 * If the model does not yet have an effect map for the type, one is created
 * and returned.  If it does, but it is not an own property (i.e. the
 * prototype had effects), the the map is deeply cloned and the copy is
 * set on the model and returned, ready for new effects to be added.
 *
 * @param {Object} model Prototype or instance
 * @param {string} type Property effect type
 * @param {boolean=} cloneArrays Clone any arrays assigned to the map when
 *   extending a superclass map onto this subclass
 * @return {Object} The own-property map of effects for the given type
 * @private
 */

function ensureOwnEffectMap(model, type, cloneArrays) {
  let effects = model[type];

  if (!effects) {
    effects = model[type] = {};
  } else if (!model.hasOwnProperty(type)) {
    effects = model[type] = Object.create(model[type]);

    if (cloneArrays) {
      for (let p in effects) {
        let protoFx = effects[p]; // Perf optimization over Array.slice

        let instFx = effects[p] = Array(protoFx.length);

        for (let i = 0; i < protoFx.length; i++) {
          instFx[i] = protoFx[i];
        }
      }
    }
  }

  return effects;
} // -- effects ----------------------------------------------

/**
 * Runs all effects of a given type for the given set of property changes
 * on an instance.
 *
 * @param {!Polymer_PropertyEffects} inst The instance with effects to run
 * @param {?Object} effects Object map of property-to-Array of effects
 * @param {?Object} props Bag of current property changes
 * @param {?Object=} oldProps Bag of previous values for changed properties
 * @param {boolean=} hasPaths True with `props` contains one or more paths
 * @param {*=} extraArgs Additional metadata to pass to effect function
 * @return {boolean} True if an effect ran for this property
 * @private
 */


function runEffects(inst, effects, props, oldProps, hasPaths, extraArgs) {
  if (effects) {
    let ran = false;
    const id = dedupeId++;

    for (let prop in props) {
      // Inline `runEffectsForProperty` for perf.
      let rootProperty = hasPaths ? Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["root"])(prop) : prop;
      let fxs = effects[rootProperty];

      if (fxs) {
        for (let i = 0, l = fxs.length, fx; i < l && (fx = fxs[i]); i++) {
          if ((!fx.info || fx.info.lastRun !== id) && (!hasPaths || pathMatchesTrigger(prop, fx.trigger))) {
            if (fx.info) {
              fx.info.lastRun = id;
            }

            fx.fn(inst, prop, props, oldProps, fx.info, hasPaths, extraArgs);
            ran = true;
          }
        }
      }
    }

    return ran;
  }

  return false;
}
/**
 * Runs a list of effects for a given property.
 *
 * @param {!Polymer_PropertyEffects} inst The instance with effects to run
 * @param {!Object} effects Object map of property-to-Array of effects
 * @param {number} dedupeId Counter used for de-duping effects
 * @param {string} prop Name of changed property
 * @param {*} props Changed properties
 * @param {*} oldProps Old properties
 * @param {boolean=} hasPaths True with `props` contains one or more paths
 * @param {*=} extraArgs Additional metadata to pass to effect function
 * @return {boolean} True if an effect ran for this property
 * @private
 */


function runEffectsForProperty(inst, effects, dedupeId, prop, props, oldProps, hasPaths, extraArgs) {
  let ran = false;
  let rootProperty = hasPaths ? Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["root"])(prop) : prop;
  let fxs = effects[rootProperty];

  if (fxs) {
    for (let i = 0, l = fxs.length, fx; i < l && (fx = fxs[i]); i++) {
      if ((!fx.info || fx.info.lastRun !== dedupeId) && (!hasPaths || pathMatchesTrigger(prop, fx.trigger))) {
        if (fx.info) {
          fx.info.lastRun = dedupeId;
        }

        fx.fn(inst, prop, props, oldProps, fx.info, hasPaths, extraArgs);
        ran = true;
      }
    }
  }

  return ran;
}
/**
 * Determines whether a property/path that has changed matches the trigger
 * criteria for an effect.  A trigger is a descriptor with the following
 * structure, which matches the descriptors returned from `parseArg`.
 * e.g. for `foo.bar.*`:
 * ```
 * trigger: {
 *   name: 'a.b',
 *   structured: true,
 *   wildcard: true
 * }
 * ```
 * If no trigger is given, the path is deemed to match.
 *
 * @param {string} path Path or property that changed
 * @param {?DataTrigger} trigger Descriptor
 * @return {boolean} Whether the path matched the trigger
 */


function pathMatchesTrigger(path, trigger) {
  if (trigger) {
    let triggerPath =
    /** @type {string} */
    trigger.name;
    return triggerPath == path || !!(trigger.structured && Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isAncestor"])(triggerPath, path)) || !!(trigger.wildcard && Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isDescendant"])(triggerPath, path));
  } else {
    return true;
  }
}
/**
 * Implements the "observer" effect.
 *
 * Calls the method with `info.methodName` on the instance, passing the
 * new and old values.
 *
 * @param {!Polymer_PropertyEffects} inst The instance the effect will be run on
 * @param {string} property Name of property
 * @param {Object} props Bag of current property changes
 * @param {Object} oldProps Bag of previous values for changed properties
 * @param {?} info Effect metadata
 * @return {void}
 * @private
 */


function runObserverEffect(inst, property, props, oldProps, info) {
  let fn = typeof info.method === "string" ? inst[info.method] : info.method;
  let changedProp = info.property;

  if (fn) {
    fn.call(inst, inst.__data[changedProp], oldProps[changedProp]);
  } else if (!info.dynamicFn) {
    console.warn('observer method `' + info.method + '` not defined');
  }
}
/**
 * Runs "notify" effects for a set of changed properties.
 *
 * This method differs from the generic `runEffects` method in that it
 * will dispatch path notification events in the case that the property
 * changed was a path and the root property for that path didn't have a
 * "notify" effect.  This is to maintain 1.0 behavior that did not require
 * `notify: true` to ensure object sub-property notifications were
 * sent.
 *
 * @param {!Polymer_PropertyEffects} inst The instance with effects to run
 * @param {Object} notifyProps Bag of properties to notify
 * @param {Object} props Bag of current property changes
 * @param {Object} oldProps Bag of previous values for changed properties
 * @param {boolean} hasPaths True with `props` contains one or more paths
 * @return {void}
 * @private
 */


function runNotifyEffects(inst, notifyProps, props, oldProps, hasPaths) {
  // Notify
  let fxs = inst[TYPES.NOTIFY];
  let notified;
  let id = dedupeId++; // Try normal notify effects; if none, fall back to try path notification

  for (let prop in notifyProps) {
    if (notifyProps[prop]) {
      if (fxs && runEffectsForProperty(inst, fxs, id, prop, props, oldProps, hasPaths)) {
        notified = true;
      } else if (hasPaths && notifyPath(inst, prop, props)) {
        notified = true;
      }
    }
  } // Flush host if we actually notified and host was batching
  // And the host has already initialized clients; this prevents
  // an issue with a host observing data changes before clients are ready.


  let host;

  if (notified && (host = inst.__dataHost) && host._invalidateProperties) {
    host._invalidateProperties();
  }
}
/**
 * Dispatches {property}-changed events with path information in the detail
 * object to indicate a sub-path of the property was changed.
 *
 * @param {!Polymer_PropertyEffects} inst The element from which to fire the
 *     event
 * @param {string} path The path that was changed
 * @param {Object} props Bag of current property changes
 * @return {boolean} Returns true if the path was notified
 * @private
 */


function notifyPath(inst, path, props) {
  let rootProperty = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["root"])(path);

  if (rootProperty !== path) {
    let eventName = Object(_utils_case_map_js__WEBPACK_IMPORTED_MODULE_4__["camelToDashCase"])(rootProperty) + '-changed';
    dispatchNotifyEvent(inst, eventName, props[path], path);
    return true;
  }

  return false;
}
/**
 * Dispatches {property}-changed events to indicate a property (or path)
 * changed.
 *
 * @param {!Polymer_PropertyEffects} inst The element from which to fire the
 *     event
 * @param {string} eventName The name of the event to send
 *     ('{property}-changed')
 * @param {*} value The value of the changed property
 * @param {string | null | undefined} path If a sub-path of this property
 *     changed, the path that changed (optional).
 * @return {void}
 * @private
 * @suppress {invalidCasts}
 */


function dispatchNotifyEvent(inst, eventName, value, path) {
  let detail = {
    value: value,
    queueProperty: true
  };

  if (path) {
    detail.path = path;
  } // As a performance optimization, we could elide the wrap here since notifying
  // events are non-bubbling and shouldn't need retargeting. However, a very
  // small number of internal tests failed in obscure ways, which may indicate
  // user code relied on timing differences resulting from ShadyDOM flushing
  // as a result of the wrapped `dispatchEvent`.


  Object(_utils_wrap_js__WEBPACK_IMPORTED_MODULE_1__["wrap"])(
  /** @type {!HTMLElement} */
  inst).dispatchEvent(new CustomEvent(eventName, {
    detail
  }));
}
/**
 * Implements the "notify" effect.
 *
 * Dispatches a non-bubbling event named `info.eventName` on the instance
 * with a detail object containing the new `value`.
 *
 * @param {!Polymer_PropertyEffects} inst The instance the effect will be run on
 * @param {string} property Name of property
 * @param {Object} props Bag of current property changes
 * @param {Object} oldProps Bag of previous values for changed properties
 * @param {?} info Effect metadata
 * @param {boolean} hasPaths True with `props` contains one or more paths
 * @return {void}
 * @private
 */


function runNotifyEffect(inst, property, props, oldProps, info, hasPaths) {
  let rootProperty = hasPaths ? Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["root"])(property) : property;
  let path = rootProperty != property ? property : null;
  let value = path ? Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(inst, path) : inst.__data[property];

  if (path && value === undefined) {
    value = props[property]; // specifically for .splices
  }

  dispatchNotifyEvent(inst, info.eventName, value, path);
}
/**
 * Handler function for 2-way notification events. Receives context
 * information captured in the `addNotifyListener` closure from the
 * `__notifyListeners` metadata.
 *
 * Sets the value of the notified property to the host property or path.  If
 * the event contained path information, translate that path to the host
 * scope's name for that path first.
 *
 * @param {CustomEvent} event Notification event (e.g. '<property>-changed')
 * @param {!Polymer_PropertyEffects} inst Host element instance handling the
 *     notification event
 * @param {string} fromProp Child element property that was bound
 * @param {string} toPath Host property/path that was bound
 * @param {boolean} negate Whether the binding was negated
 * @return {void}
 * @private
 */


function handleNotification(event, inst, fromProp, toPath, negate) {
  let value;
  let detail =
  /** @type {Object} */
  event.detail;
  let fromPath = detail && detail.path;

  if (fromPath) {
    toPath = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["translate"])(fromProp, toPath, fromPath);
    value = detail && detail.value;
  } else {
    value = event.currentTarget[fromProp];
  }

  value = negate ? !value : value;

  if (!inst[TYPES.READ_ONLY] || !inst[TYPES.READ_ONLY][toPath]) {
    if (inst._setPendingPropertyOrPath(toPath, value, true, Boolean(fromPath)) && (!detail || !detail.queueProperty)) {
      inst._invalidateProperties();
    }
  }
}
/**
 * Implements the "reflect" effect.
 *
 * Sets the attribute named `info.attrName` to the given property value.
 *
 * @param {!Polymer_PropertyEffects} inst The instance the effect will be run on
 * @param {string} property Name of property
 * @param {Object} props Bag of current property changes
 * @param {Object} oldProps Bag of previous values for changed properties
 * @param {?} info Effect metadata
 * @return {void}
 * @private
 */


function runReflectEffect(inst, property, props, oldProps, info) {
  let value = inst.__data[property];

  if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["sanitizeDOMValue"]) {
    value = Object(_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["sanitizeDOMValue"])(value, info.attrName, 'attribute',
    /** @type {Node} */
    inst);
  }

  inst._propertyToAttribute(property, info.attrName, value);
}
/**
 * Runs "computed" effects for a set of changed properties.
 *
 * This method differs from the generic `runEffects` method in that it
 * continues to run computed effects based on the output of each pass until
 * there are no more newly computed properties.  This ensures that all
 * properties that will be computed by the initial set of changes are
 * computed before other effects (binding propagation, observers, and notify)
 * run.
 *
 * @param {!Polymer_PropertyEffects} inst The instance the effect will be run on
 * @param {?Object} changedProps Bag of changed properties
 * @param {?Object} oldProps Bag of previous values for changed properties
 * @param {boolean} hasPaths True with `props` contains one or more paths
 * @return {void}
 * @private
 */


function runComputedEffects(inst, changedProps, oldProps, hasPaths) {
  let computeEffects = inst[TYPES.COMPUTE];

  if (computeEffects) {
    if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["orderedComputed"]) {
      // Runs computed effects in efficient order by keeping a topologically-
      // sorted queue of compute effects to run, and inserting subsequently
      // invalidated effects as they are run
      dedupeId++;
      const order = getComputedOrder(inst);
      const queue = [];

      for (let p in changedProps) {
        enqueueEffectsFor(p, computeEffects, queue, order, hasPaths);
      }

      let info;

      while (info = queue.shift()) {
        if (runComputedEffect(inst, '', changedProps, oldProps, info)) {
          enqueueEffectsFor(info.methodInfo, computeEffects, queue, order, hasPaths);
        }
      }

      Object.assign(
      /** @type {!Object} */
      oldProps, inst.__dataOld);
      Object.assign(
      /** @type {!Object} */
      changedProps, inst.__dataPending);
      inst.__dataPending = null;
    } else {
      // Original Polymer 2.x computed effects order, which continues running
      // effects until no further computed properties have been invalidated
      let inputProps = changedProps;

      while (runEffects(inst, computeEffects, inputProps, oldProps, hasPaths)) {
        Object.assign(
        /** @type {!Object} */
        oldProps, inst.__dataOld);
        Object.assign(
        /** @type {!Object} */
        changedProps, inst.__dataPending);
        inputProps = inst.__dataPending;
        inst.__dataPending = null;
      }
    }
  }
}
/**
 * Inserts a computed effect into a queue, given the specified order. Performs
 * the insert using a binary search.
 *
 * Used by `orderedComputed: true` computed property algorithm.
 *
 * @param {Object} info Property effects metadata
 * @param {Array<Object>} queue Ordered queue of effects
 * @param {Map<string,number>} order Map of computed property name->topological
 *   sort order
 */


const insertEffect = (info, queue, order) => {
  let start = 0;
  let end = queue.length - 1;
  let idx = -1;

  while (start <= end) {
    const mid = start + end >> 1; // Note `methodInfo` is where the computed property name is stored in
    // the effect metadata

    const cmp = order.get(queue[mid].methodInfo) - order.get(info.methodInfo);

    if (cmp < 0) {
      start = mid + 1;
    } else if (cmp > 0) {
      end = mid - 1;
    } else {
      idx = mid;
      break;
    }
  }

  if (idx < 0) {
    idx = end + 1;
  }

  queue.splice(idx, 0, info);
};
/**
 * Inserts all downstream computed effects invalidated by the specified property
 * into the topologically-sorted queue of effects to be run.
 *
 * Used by `orderedComputed: true` computed property algorithm.
 *
 * @param {string} prop Property name
 * @param {Object} computeEffects Computed effects for this element
 * @param {Array<Object>} queue Topologically-sorted queue of computed effects
 *   to be run
 * @param {Map<string,number>} order Map of computed property name->topological
 *   sort order
 * @param {boolean} hasPaths True with `changedProps` contains one or more paths
 */


const enqueueEffectsFor = (prop, computeEffects, queue, order, hasPaths) => {
  const rootProperty = hasPaths ? Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["root"])(prop) : prop;
  const fxs = computeEffects[rootProperty];

  if (fxs) {
    for (let i = 0; i < fxs.length; i++) {
      const fx = fxs[i];

      if (fx.info.lastRun !== dedupeId && (!hasPaths || pathMatchesTrigger(prop, fx.trigger))) {
        fx.info.lastRun = dedupeId;
        insertEffect(fx.info, queue, order);
      }
    }
  }
};
/**
 * Generates and retrieves a memoized map of computed property name to its
 * topologically-sorted order.
 *
 * The map is generated by first assigning a "dependency count" to each property
 * (defined as number properties it depends on, including its method for
 * "dynamic functions"). Any properties that have no dependencies are added to
 * the `ready` queue, which are properties whose order can be added to the final
 * order map. Properties are popped off the `ready` queue one by one and a.) added as
 * the next property in the order map, and b.) each property that it is a
 * dependency for has its dep count decremented (and if that property's dep
 * count goes to zero, it is added to the `ready` queue), until all properties
 * have been visited and ordered.
 *
 * Used by `orderedComputed: true` computed property algorithm.
 *
 * @param {!Polymer_PropertyEffects} inst The instance to retrieve the computed
 *   effect order for.
 * @return {Map<string,number>} Map of computed property name->topological sort
 *   order
 */


function getComputedOrder(inst) {
  let ordered = inst.constructor.__orderedComputedDeps;

  if (!ordered) {
    ordered = new Map();
    const effects = inst[TYPES.COMPUTE];
    let {
      counts,
      ready,
      total
    } = dependencyCounts(inst);
    let curr;

    while (curr = ready.shift()) {
      ordered.set(curr, ordered.size);
      const computedByCurr = effects[curr];

      if (computedByCurr) {
        computedByCurr.forEach(fx => {
          // Note `methodInfo` is where the computed property name is stored
          const computedProp = fx.info.methodInfo;
          --total;

          if (--counts[computedProp] === 0) {
            ready.push(computedProp);
          }
        });
      }
    }

    if (total !== 0) {
      const el =
      /** @type {HTMLElement} */
      inst;
      console.warn(`Computed graph for ${el.localName} incomplete; circular?`);
    }

    inst.constructor.__orderedComputedDeps = ordered;
  }

  return ordered;
}
/**
 * Generates a map of property-to-dependency count (`counts`, where "dependency
 * count" is the number of dependencies a given property has assuming it is a
 * computed property, otherwise 0).  It also returns a pre-populated list of
 * `ready` properties that have no dependencies and a `total` count, which is
 * used for error-checking the graph.
 *
 * Used by `orderedComputed: true` computed property algorithm.
 *
 * @param {!Polymer_PropertyEffects} inst The instance to generate dependency
 *   counts for.
 * @return {!Object} Object containing `counts` map (property-to-dependency
 *   count) and pre-populated `ready` array of properties that had zero
 *   dependencies.
 */


function dependencyCounts(inst) {
  const infoForComputed = inst[COMPUTE_INFO];
  const counts = {};
  const computedDeps = inst[TYPES.COMPUTE];
  const ready = [];
  let total = 0; // Count dependencies for each computed property

  for (let p in infoForComputed) {
    const info = infoForComputed[p]; // Be sure to add the method name itself in case of "dynamic functions"

    total += counts[p] = info.args.filter(a => !a.literal).length + (info.dynamicFn ? 1 : 0);
  } // Build list of ready properties (that aren't themselves computed)


  for (let p in computedDeps) {
    if (!infoForComputed[p]) {
      ready.push(p);
    }
  }

  return {
    counts,
    ready,
    total
  };
}
/**
 * Implements the "computed property" effect by running the method with the
 * values of the arguments specified in the `info` object and setting the
 * return value to the computed property specified.
 *
 * @param {!Polymer_PropertyEffects} inst The instance the effect will be run on
 * @param {string} property Name of property
 * @param {?Object} changedProps Bag of current property changes
 * @param {?Object} oldProps Bag of previous values for changed properties
 * @param {?} info Effect metadata
 * @return {boolean} True when the property being computed changed
 * @private
 */


function runComputedEffect(inst, property, changedProps, oldProps, info) {
  // Dirty check dependencies and run if any invalid
  let result = runMethodEffect(inst, property, changedProps, oldProps, info); // Abort if method returns a no-op result

  if (result === NOOP) {
    return false;
  }

  let computedProp = info.methodInfo;

  if (inst.__dataHasAccessor && inst.__dataHasAccessor[computedProp]) {
    return inst._setPendingProperty(computedProp, result, true);
  } else {
    inst[computedProp] = result;
    return false;
  }
}
/**
 * Computes path changes based on path links set up using the `linkPaths`
 * API.
 *
 * @param {!Polymer_PropertyEffects} inst The instance whose props are changing
 * @param {string} path Path that has changed
 * @param {*} value Value of changed path
 * @return {void}
 * @private
 */


function computeLinkedPaths(inst, path, value) {
  let links = inst.__dataLinkedPaths;

  if (links) {
    let link;

    for (let a in links) {
      let b = links[a];

      if (Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isDescendant"])(a, path)) {
        link = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["translate"])(a, b, path);

        inst._setPendingPropertyOrPath(link, value, true, true);
      } else if (Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isDescendant"])(b, path)) {
        link = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["translate"])(b, a, path);

        inst._setPendingPropertyOrPath(link, value, true, true);
      }
    }
  }
} // -- bindings ----------------------------------------------

/**
 * Adds binding metadata to the current `nodeInfo`, and binding effects
 * for all part dependencies to `templateInfo`.
 *
 * @param {Function} constructor Class that `_parseTemplate` is currently
 *   running on
 * @param {TemplateInfo} templateInfo Template metadata for current template
 * @param {NodeInfo} nodeInfo Node metadata for current template node
 * @param {string} kind Binding kind, either 'property', 'attribute', or 'text'
 * @param {string} target Target property name
 * @param {!Array<!BindingPart>} parts Array of binding part metadata
 * @param {string=} literal Literal text surrounding binding parts (specified
 *   only for 'property' bindings, since these must be initialized as part
 *   of boot-up)
 * @return {void}
 * @private
 */


function addBinding(constructor, templateInfo, nodeInfo, kind, target, parts, literal) {
  // Create binding metadata and add to nodeInfo
  nodeInfo.bindings = nodeInfo.bindings || [];
  let
  /** Binding */
  binding = {
    kind,
    target,
    parts,
    literal,
    isCompound: parts.length !== 1
  };
  nodeInfo.bindings.push(binding); // Add listener info to binding metadata

  if (shouldAddListener(binding)) {
    let {
      event,
      negate
    } = binding.parts[0];
    binding.listenerEvent = event || Object(_utils_case_map_js__WEBPACK_IMPORTED_MODULE_4__["camelToDashCase"])(target) + '-changed';
    binding.listenerNegate = negate;
  } // Add "propagate" property effects to templateInfo


  let index = templateInfo.nodeInfoList.length;

  for (let i = 0; i < binding.parts.length; i++) {
    let part = binding.parts[i];
    part.compoundIndex = i;
    addEffectForBindingPart(constructor, templateInfo, binding, part, index);
  }
}
/**
 * Adds property effects to the given `templateInfo` for the given binding
 * part.
 *
 * @param {Function} constructor Class that `_parseTemplate` is currently
 *   running on
 * @param {TemplateInfo} templateInfo Template metadata for current template
 * @param {!Binding} binding Binding metadata
 * @param {!BindingPart} part Binding part metadata
 * @param {number} index Index into `nodeInfoList` for this node
 * @return {void}
 */


function addEffectForBindingPart(constructor, templateInfo, binding, part, index) {
  if (!part.literal) {
    if (binding.kind === 'attribute' && binding.target[0] === '-') {
      console.warn('Cannot set attribute ' + binding.target + ' because "-" is not a valid attribute starting character');
    } else {
      let dependencies = part.dependencies;
      let info = {
        index,
        binding,
        part,
        evaluator: constructor
      };

      for (let j = 0; j < dependencies.length; j++) {
        let trigger = dependencies[j];

        if (typeof trigger == 'string') {
          trigger = parseArg(trigger);
          trigger.wildcard = true;
        }

        constructor._addTemplatePropertyEffect(templateInfo, trigger.rootProperty, {
          fn: runBindingEffect,
          info,
          trigger
        });
      }
    }
  }
}
/**
 * Implements the "binding" (property/path binding) effect.
 *
 * Note that binding syntax is overridable via `_parseBindings` and
 * `_evaluateBinding`.  This method will call `_evaluateBinding` for any
 * non-literal parts returned from `_parseBindings`.  However,
 * there is no support for _path_ bindings via custom binding parts,
 * as this is specific to Polymer's path binding syntax.
 *
 * @param {!Polymer_PropertyEffects} inst The instance the effect will be run on
 * @param {string} path Name of property
 * @param {Object} props Bag of current property changes
 * @param {Object} oldProps Bag of previous values for changed properties
 * @param {?} info Effect metadata
 * @param {boolean} hasPaths True with `props` contains one or more paths
 * @param {Array} nodeList List of nodes associated with `nodeInfoList` template
 *   metadata
 * @return {void}
 * @private
 */


function runBindingEffect(inst, path, props, oldProps, info, hasPaths, nodeList) {
  let node = nodeList[info.index];
  let binding = info.binding;
  let part = info.part; // Subpath notification: transform path and set to client
  // e.g.: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo.prop'=obj.sub.prop

  if (hasPaths && part.source && path.length > part.source.length && binding.kind == 'property' && !binding.isCompound && node.__isPropertyEffectsClient && node.__dataHasAccessor && node.__dataHasAccessor[binding.target]) {
    let value = props[path];
    path = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["translate"])(part.source, binding.target, path);

    if (node._setPendingPropertyOrPath(path, value, false, true)) {
      inst._enqueueClient(node);
    }
  } else {
    let value = info.evaluator._evaluateBinding(inst, part, path, props, oldProps, hasPaths); // Propagate value to child
    // Abort if value is a no-op result


    if (value !== NOOP) {
      applyBindingValue(inst, node, binding, part, value);
    }
  }
}
/**
 * Sets the value for an "binding" (binding) effect to a node,
 * either as a property or attribute.
 *
 * @param {!Polymer_PropertyEffects} inst The instance owning the binding effect
 * @param {Node} node Target node for binding
 * @param {!Binding} binding Binding metadata
 * @param {!BindingPart} part Binding part metadata
 * @param {*} value Value to set
 * @return {void}
 * @private
 */


function applyBindingValue(inst, node, binding, part, value) {
  value = computeBindingValue(node, value, binding, part);

  if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["sanitizeDOMValue"]) {
    value = Object(_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["sanitizeDOMValue"])(value, binding.target, binding.kind, node);
  }

  if (binding.kind == 'attribute') {
    // Attribute binding
    inst._valueToNodeAttribute(
    /** @type {Element} */
    node, value, binding.target);
  } else {
    // Property binding
    let prop = binding.target;

    if (node.__isPropertyEffectsClient && node.__dataHasAccessor && node.__dataHasAccessor[prop]) {
      if (!node[TYPES.READ_ONLY] || !node[TYPES.READ_ONLY][prop]) {
        if (node._setPendingProperty(prop, value)) {
          inst._enqueueClient(node);
        }
      }
    } else {
      // In legacy no-batching mode, bindings applied before dataReady are
      // equivalent to the "apply config" phase, which only set managed props
      inst._setUnmanagedPropertyToNode(node, prop, value);
    }
  }
}
/**
 * Transforms an "binding" effect value based on compound & negation
 * effect metadata, as well as handling for special-case properties
 *
 * @param {Node} node Node the value will be set to
 * @param {*} value Value to set
 * @param {!Binding} binding Binding metadata
 * @param {!BindingPart} part Binding part metadata
 * @return {*} Transformed value to set
 * @private
 */


function computeBindingValue(node, value, binding, part) {
  if (binding.isCompound) {
    let storage = node.__dataCompoundStorage[binding.target];
    storage[part.compoundIndex] = value;
    value = storage.join('');
  }

  if (binding.kind !== 'attribute') {
    // Some browsers serialize `undefined` to `"undefined"`
    if (binding.target === 'textContent' || binding.target === 'value' && (node.localName === 'input' || node.localName === 'textarea')) {
      value = value == undefined ? '' : value;
    }
  }

  return value;
}
/**
 * Returns true if a binding's metadata meets all the requirements to allow
 * 2-way binding, and therefore a `<property>-changed` event listener should be
 * added:
 * - used curly braces
 * - is a property (not attribute) binding
 * - is not a textContent binding
 * - is not compound
 *
 * @param {!Binding} binding Binding metadata
 * @return {boolean} True if 2-way listener should be added
 * @private
 */


function shouldAddListener(binding) {
  return Boolean(binding.target) && binding.kind != 'attribute' && binding.kind != 'text' && !binding.isCompound && binding.parts[0].mode === '{';
}
/**
 * Setup compound binding storage structures, notify listeners, and dataHost
 * references onto the bound nodeList.
 *
 * @param {!Polymer_PropertyEffects} inst Instance that bas been previously
 *     bound
 * @param {TemplateInfo} templateInfo Template metadata
 * @return {void}
 * @private
 */


function setupBindings(inst, templateInfo) {
  // Setup compound storage, dataHost, and notify listeners
  let {
    nodeList,
    nodeInfoList
  } = templateInfo;

  if (nodeInfoList.length) {
    for (let i = 0; i < nodeInfoList.length; i++) {
      let info = nodeInfoList[i];
      let node = nodeList[i];
      let bindings = info.bindings;

      if (bindings) {
        for (let i = 0; i < bindings.length; i++) {
          let binding = bindings[i];
          setupCompoundStorage(node, binding);
          addNotifyListener(node, inst, binding);
        }
      } // This ensures all bound elements have a host set, regardless
      // of whether they upgrade synchronous to creation


      node.__dataHost = inst;
    }
  }
}
/**
 * Initializes `__dataCompoundStorage` local storage on a bound node with
 * initial literal data for compound bindings, and sets the joined
 * literal parts to the bound property.
 *
 * When changes to compound parts occur, they are first set into the compound
 * storage array for that property, and then the array is joined to result in
 * the final value set to the property/attribute.
 *
 * @param {Node} node Bound node to initialize
 * @param {Binding} binding Binding metadata
 * @return {void}
 * @private
 */


function setupCompoundStorage(node, binding) {
  if (binding.isCompound) {
    // Create compound storage map
    let storage = node.__dataCompoundStorage || (node.__dataCompoundStorage = {});
    let parts = binding.parts; // Copy literals from parts into storage for this binding

    let literals = new Array(parts.length);

    for (let j = 0; j < parts.length; j++) {
      literals[j] = parts[j].literal;
    }

    let target = binding.target;
    storage[target] = literals; // Configure properties with their literal parts

    if (binding.literal && binding.kind == 'property') {
      // Note, className needs style scoping so this needs wrapping.
      // We may also want to consider doing this for `textContent` and
      // `innerHTML`.
      if (target === 'className') {
        node = Object(_utils_wrap_js__WEBPACK_IMPORTED_MODULE_1__["wrap"])(node);
      }

      node[target] = binding.literal;
    }
  }
}
/**
 * Adds a 2-way binding notification event listener to the node specified
 *
 * @param {Object} node Child element to add listener to
 * @param {!Polymer_PropertyEffects} inst Host element instance to handle
 *     notification event
 * @param {Binding} binding Binding metadata
 * @return {void}
 * @private
 */


function addNotifyListener(node, inst, binding) {
  if (binding.listenerEvent) {
    let part = binding.parts[0];
    node.addEventListener(binding.listenerEvent, function (e) {
      handleNotification(e, inst, binding.target, part.source, part.negate);
    });
  }
} // -- for method-based effects (complexObserver & computed) --------------

/**
 * Adds property effects for each argument in the method signature (and
 * optionally, for the method name if `dynamic` is true) that calls the
 * provided effect function.
 *
 * @param {Element | Object} model Prototype or instance
 * @param {!MethodSignature} sig Method signature metadata
 * @param {string} type Type of property effect to add
 * @param {Function} effectFn Function to run when arguments change
 * @param {*=} methodInfo Effect-specific information to be included in
 *   method effect metadata
 * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
 *   method names should be included as a dependency to the effect. Note,
 *   defaults to true if the signature is static (sig.static is true).
 * @return {!Object} Effect metadata for this method effect
 * @private
 */


function createMethodEffect(model, sig, type, effectFn, methodInfo, dynamicFn) {
  dynamicFn = sig.static || dynamicFn && (typeof dynamicFn !== 'object' || dynamicFn[sig.methodName]);
  let info = {
    methodName: sig.methodName,
    args: sig.args,
    methodInfo,
    dynamicFn
  };

  for (let i = 0, arg; i < sig.args.length && (arg = sig.args[i]); i++) {
    if (!arg.literal) {
      model._addPropertyEffect(arg.rootProperty, type, {
        fn: effectFn,
        info: info,
        trigger: arg
      });
    }
  }

  if (dynamicFn) {
    model._addPropertyEffect(sig.methodName, type, {
      fn: effectFn,
      info: info
    });
  }

  return info;
}
/**
 * Calls a method with arguments marshaled from properties on the instance
 * based on the method signature contained in the effect metadata.
 *
 * Multi-property observers, computed properties, and inline computing
 * functions call this function to invoke the method, then use the return
 * value accordingly.
 *
 * @param {!Polymer_PropertyEffects} inst The instance the effect will be run on
 * @param {string} property Name of property
 * @param {Object} props Bag of current property changes
 * @param {Object} oldProps Bag of previous values for changed properties
 * @param {?} info Effect metadata
 * @return {*} Returns the return value from the method invocation
 * @private
 */


function runMethodEffect(inst, property, props, oldProps, info) {
  // Instances can optionally have a _methodHost which allows redirecting where
  // to find methods. Currently used by `templatize`.
  let context = inst._methodHost || inst;
  let fn = context[info.methodName];

  if (fn) {
    let args = inst._marshalArgs(info.args, property, props);

    return args === NOOP ? NOOP : fn.apply(context, args);
  } else if (!info.dynamicFn) {
    console.warn('method `' + info.methodName + '` not defined');
  }
}

const emptyArray = []; // Regular expressions used for binding

const IDENT = '(?:' + '[a-zA-Z_$][\\w.:$\\-*]*' + ')';
const NUMBER = '(?:' + '[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?' + ')';
const SQUOTE_STRING = '(?:' + '\'(?:[^\'\\\\]|\\\\.)*\'' + ')';
const DQUOTE_STRING = '(?:' + '"(?:[^"\\\\]|\\\\.)*"' + ')';
const STRING = '(?:' + SQUOTE_STRING + '|' + DQUOTE_STRING + ')';
const ARGUMENT = '(?:(' + IDENT + '|' + NUMBER + '|' + STRING + ')\\s*' + ')';
const ARGUMENTS = '(?:' + ARGUMENT + '(?:,\\s*' + ARGUMENT + ')*' + ')';
const ARGUMENT_LIST = '(?:' + '\\(\\s*' + '(?:' + ARGUMENTS + '?' + ')' + '\\)\\s*' + ')';
const BINDING = '(' + IDENT + '\\s*' + ARGUMENT_LIST + '?' + ')'; // Group 3

const OPEN_BRACKET = '(\\[\\[|{{)' + '\\s*';
const CLOSE_BRACKET = '(?:]]|}})';
const NEGATE = '(?:(!)\\s*)?'; // Group 2

const EXPRESSION = OPEN_BRACKET + NEGATE + BINDING + CLOSE_BRACKET;
const bindingRegex = new RegExp(EXPRESSION, "g");
/**
 * Create a string from binding parts of all the literal parts
 *
 * @param {!Array<BindingPart>} parts All parts to stringify
 * @return {string} String made from the literal parts
 */

function literalFromParts(parts) {
  let s = '';

  for (let i = 0; i < parts.length; i++) {
    let literal = parts[i].literal;
    s += literal || '';
  }

  return s;
}
/**
 * Parses an expression string for a method signature, and returns a metadata
 * describing the method in terms of `methodName`, `static` (whether all the
 * arguments are literals), and an array of `args`
 *
 * @param {string} expression The expression to parse
 * @return {?MethodSignature} The method metadata object if a method expression was
 *   found, otherwise `undefined`
 * @private
 */


function parseMethod(expression) {
  // tries to match valid javascript property names
  let m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);

  if (m) {
    let methodName = m[1];
    let sig = {
      methodName,
      static: true,
      args: emptyArray
    };

    if (m[2].trim()) {
      // replace escaped commas with comma entity, split on un-escaped commas
      let args = m[2].replace(/\\,/g, '&comma;').split(',');
      return parseArgs(args, sig);
    } else {
      return sig;
    }
  }

  return null;
}
/**
 * Parses an array of arguments and sets the `args` property of the supplied
 * signature metadata object. Sets the `static` property to false if any
 * argument is a non-literal.
 *
 * @param {!Array<string>} argList Array of argument names
 * @param {!MethodSignature} sig Method signature metadata object
 * @return {!MethodSignature} The updated signature metadata object
 * @private
 */


function parseArgs(argList, sig) {
  sig.args = argList.map(function (rawArg) {
    let arg = parseArg(rawArg);

    if (!arg.literal) {
      sig.static = false;
    }

    return arg;
  }, this);
  return sig;
}
/**
 * Parses an individual argument, and returns an argument metadata object
 * with the following fields:
 *
 *   {
 *     value: 'prop',        // property/path or literal value
 *     literal: false,       // whether argument is a literal
 *     structured: false,    // whether the property is a path
 *     rootProperty: 'prop', // the root property of the path
 *     wildcard: false       // whether the argument was a wildcard '.*' path
 *   }
 *
 * @param {string} rawArg The string value of the argument
 * @return {!MethodArg} Argument metadata object
 * @private
 */


function parseArg(rawArg) {
  // clean up whitespace
  let arg = rawArg.trim() // replace comma entity with comma
  .replace(/&comma;/g, ',') // repair extra escape sequences; note only commas strictly need
  // escaping, but we allow any other char to be escaped since its
  // likely users will do this
  .replace(/\\(.)/g, '\$1'); // basic argument descriptor

  let a = {
    name: arg,
    value: '',
    literal: false
  }; // detect literal value (must be String or Number)

  let fc = arg[0];

  if (fc === '-') {
    fc = arg[1];
  }

  if (fc >= '0' && fc <= '9') {
    fc = '#';
  }

  switch (fc) {
    case "'":
    case '"':
      a.value = arg.slice(1, -1);
      a.literal = true;
      break;

    case '#':
      a.value = Number(arg);
      a.literal = true;
      break;
  } // if not literal, look for structured path


  if (!a.literal) {
    a.rootProperty = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["root"])(arg); // detect structured path (has dots)

    a.structured = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isPath"])(arg);

    if (a.structured) {
      a.wildcard = arg.slice(-2) == '.*';

      if (a.wildcard) {
        a.name = arg.slice(0, -2);
      }
    }
  }

  return a;
}

function getArgValue(data, props, path) {
  let value = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(data, path); // when data is not stored e.g. `splices`, get the value from changedProps
  // TODO(kschaaf): Note, this can cause a rare issue where the wildcard
  // info.value could pull a stale value out of changedProps during a reentrant
  // change that sets the value back to undefined.
  // https://github.com/Polymer/polymer/issues/5479

  if (value === undefined) {
    value = props[path];
  }

  return value;
} // data api

/**
 * Sends array splice notifications (`.splices` and `.length`)
 *
 * Note: this implementation only accepts normalized paths
 *
 * @param {!Polymer_PropertyEffects} inst Instance to send notifications to
 * @param {Array} array The array the mutations occurred on
 * @param {string} path The path to the array that was mutated
 * @param {Array} splices Array of splice records
 * @return {void}
 * @private
 */


function notifySplices(inst, array, path, splices) {
  const splicesData = {
    indexSplices: splices
  }; // Legacy behavior stored splices in `__data__` so it was *not* ephemeral.
  // To match this behavior, we store splices directly on the array.

  if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["legacyUndefined"] && !inst._overrideLegacyUndefined) {
    array.splices = splicesData;
  }

  inst.notifyPath(path + '.splices', splicesData);
  inst.notifyPath(path + '.length', array.length); // Clear splice data only when it's stored on the array.

  if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["legacyUndefined"] && !inst._overrideLegacyUndefined) {
    splicesData.indexSplices = [];
  }
}
/**
 * Creates a splice record and sends an array splice notification for
 * the described mutation
 *
 * Note: this implementation only accepts normalized paths
 *
 * @param {!Polymer_PropertyEffects} inst Instance to send notifications to
 * @param {Array} array The array the mutations occurred on
 * @param {string} path The path to the array that was mutated
 * @param {number} index Index at which the array mutation occurred
 * @param {number} addedCount Number of added items
 * @param {Array} removed Array of removed items
 * @return {void}
 * @private
 */


function notifySplice(inst, array, path, index, addedCount, removed) {
  notifySplices(inst, array, path, [{
    index: index,
    addedCount: addedCount,
    removed: removed,
    object: array,
    type: 'splice'
  }]);
}
/**
 * Returns an upper-cased version of the string.
 *
 * @param {string} name String to uppercase
 * @return {string} Uppercased string
 * @private
 */


function upper(name) {
  return name[0].toUpperCase() + name.substring(1);
}
/**
 * Element class mixin that provides meta-programming for Polymer's template
 * binding and data observation (collectively, "property effects") system.
 *
 * This mixin uses provides the following key static methods for adding
 * property effects to an element class:
 * - `addPropertyEffect`
 * - `createPropertyObserver`
 * - `createMethodObserver`
 * - `createNotifyingProperty`
 * - `createReadOnlyProperty`
 * - `createReflectedProperty`
 * - `createComputedProperty`
 * - `bindTemplate`
 *
 * Each method creates one or more property accessors, along with metadata
 * used by this mixin's implementation of `_propertiesChanged` to perform
 * the property effects.
 *
 * Underscored versions of the above methods also exist on the element
 * prototype for adding property effects on instances at runtime.
 *
 * Note that this mixin overrides several `PropertyAccessors` methods, in
 * many cases to maintain guarantees provided by the Polymer 1.x features;
 * notably it changes property accessors to be synchronous by default
 * whereas the default when using `PropertyAccessors` standalone is to be
 * async by default.
 *
 * @mixinFunction
 * @polymer
 * @appliesMixin TemplateStamp
 * @appliesMixin PropertyAccessors
 * @summary Element class mixin that provides meta-programming for Polymer's
 * template binding and data observation system.
 */


const PropertyEffects = Object(_utils_mixin_js__WEBPACK_IMPORTED_MODULE_2__["dedupingMixin"])(superClass => {
  /**
   * @constructor
   * @implements {Polymer_PropertyAccessors}
   * @implements {Polymer_TemplateStamp}
   * @unrestricted
   * @private
   */
  const propertyEffectsBase = Object(_template_stamp_js__WEBPACK_IMPORTED_MODULE_6__["TemplateStamp"])(Object(_property_accessors_js__WEBPACK_IMPORTED_MODULE_5__["PropertyAccessors"])(superClass));
  /**
   * @polymer
   * @mixinClass
   * @implements {Polymer_PropertyEffects}
   * @extends {propertyEffectsBase}
   * @unrestricted
   */

  class PropertyEffects extends propertyEffectsBase {
    constructor() {
      super();
      /** @type {boolean} */
      // Used to identify users of this mixin, ala instanceof

      this.__isPropertyEffectsClient = true;
      /** @type {boolean} */

      this.__dataClientsReady;
      /** @type {Array} */

      this.__dataPendingClients;
      /** @type {Object} */

      this.__dataToNotify;
      /** @type {Object} */

      this.__dataLinkedPaths;
      /** @type {boolean} */

      this.__dataHasPaths;
      /** @type {Object} */

      this.__dataCompoundStorage;
      /** @type {Polymer_PropertyEffects} */

      this.__dataHost;
      /** @type {!Object} */

      this.__dataTemp;
      /** @type {boolean} */

      this.__dataClientsInitialized;
      /** @type {!Object} */

      this.__data;
      /** @type {!Object|null} */

      this.__dataPending;
      /** @type {!Object} */

      this.__dataOld;
      /** @type {Object} */

      this.__computeEffects;
      /** @type {Object} */

      this.__computeInfo;
      /** @type {Object} */

      this.__reflectEffects;
      /** @type {Object} */

      this.__notifyEffects;
      /** @type {Object} */

      this.__propagateEffects;
      /** @type {Object} */

      this.__observeEffects;
      /** @type {Object} */

      this.__readOnly;
      /** @type {!TemplateInfo} */

      this.__templateInfo;
      /** @type {boolean} */

      this._overrideLegacyUndefined;
    }

    get PROPERTY_EFFECT_TYPES() {
      return TYPES;
    }
    /**
     * @override
     * @return {void}
     */


    _initializeProperties() {
      super._initializeProperties();

      this._registerHost();

      this.__dataClientsReady = false;
      this.__dataPendingClients = null;
      this.__dataToNotify = null;
      this.__dataLinkedPaths = null;
      this.__dataHasPaths = false; // May be set on instance prior to upgrade

      this.__dataCompoundStorage = this.__dataCompoundStorage || null;
      this.__dataHost = this.__dataHost || null;
      this.__dataTemp = {};
      this.__dataClientsInitialized = false;
    }

    _registerHost() {
      if (hostStack.length) {
        let host = hostStack[hostStack.length - 1];

        host._enqueueClient(this); // This ensures even non-bound elements have a host set, as
        // long as they upgrade synchronously


        this.__dataHost = host;
      }
    }
    /**
     * Overrides `PropertyAccessors` implementation to provide a
     * more efficient implementation of initializing properties from
     * the prototype on the instance.
     *
     * @override
     * @param {Object} props Properties to initialize on the prototype
     * @return {void}
     */


    _initializeProtoProperties(props) {
      this.__data = Object.create(props);
      this.__dataPending = Object.create(props);
      this.__dataOld = {};
    }
    /**
     * Overrides `PropertyAccessors` implementation to avoid setting
     * `_setProperty`'s `shouldNotify: true`.
     *
     * @override
     * @param {Object} props Properties to initialize on the instance
     * @return {void}
     */


    _initializeInstanceProperties(props) {
      let readOnly = this[TYPES.READ_ONLY];

      for (let prop in props) {
        if (!readOnly || !readOnly[prop]) {
          this.__dataPending = this.__dataPending || {};
          this.__dataOld = this.__dataOld || {};
          this.__data[prop] = this.__dataPending[prop] = props[prop];
        }
      }
    } // Prototype setup ----------------------------------------

    /**
     * Equivalent to static `addPropertyEffect` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @override
     * @param {string} property Property that should trigger the effect
     * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
     * @param {Object=} effect Effect metadata object
     * @return {void}
     * @protected
     */


    _addPropertyEffect(property, type, effect) {
      this._createPropertyAccessor(property, type == TYPES.READ_ONLY); // effects are accumulated into arrays per property based on type


      let effects = ensureOwnEffectMap(this, type, true)[property];

      if (!effects) {
        effects = this[type][property] = [];
      }

      effects.push(effect);
    }
    /**
     * Removes the given property effect.
     *
     * @override
     * @param {string} property Property the effect was associated with
     * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
     * @param {Object=} effect Effect metadata object to remove
     * @return {void}
     */


    _removePropertyEffect(property, type, effect) {
      let effects = ensureOwnEffectMap(this, type, true)[property];
      let idx = effects.indexOf(effect);

      if (idx >= 0) {
        effects.splice(idx, 1);
      }
    }
    /**
     * Returns whether the current prototype/instance has a property effect
     * of a certain type.
     *
     * @override
     * @param {string} property Property name
     * @param {string=} type Effect type, from this.PROPERTY_EFFECT_TYPES
     * @return {boolean} True if the prototype/instance has an effect of this
     *     type
     * @protected
     */


    _hasPropertyEffect(property, type) {
      let effects = this[type];
      return Boolean(effects && effects[property]);
    }
    /**
     * Returns whether the current prototype/instance has a "read only"
     * accessor for the given property.
     *
     * @override
     * @param {string} property Property name
     * @return {boolean} True if the prototype/instance has an effect of this
     *     type
     * @protected
     */


    _hasReadOnlyEffect(property) {
      return this._hasPropertyEffect(property, TYPES.READ_ONLY);
    }
    /**
     * Returns whether the current prototype/instance has a "notify"
     * property effect for the given property.
     *
     * @override
     * @param {string} property Property name
     * @return {boolean} True if the prototype/instance has an effect of this
     *     type
     * @protected
     */


    _hasNotifyEffect(property) {
      return this._hasPropertyEffect(property, TYPES.NOTIFY);
    }
    /**
     * Returns whether the current prototype/instance has a "reflect to
     * attribute" property effect for the given property.
     *
     * @override
     * @param {string} property Property name
     * @return {boolean} True if the prototype/instance has an effect of this
     *     type
     * @protected
     */


    _hasReflectEffect(property) {
      return this._hasPropertyEffect(property, TYPES.REFLECT);
    }
    /**
     * Returns whether the current prototype/instance has a "computed"
     * property effect for the given property.
     *
     * @override
     * @param {string} property Property name
     * @return {boolean} True if the prototype/instance has an effect of this
     *     type
     * @protected
     */


    _hasComputedEffect(property) {
      return this._hasPropertyEffect(property, TYPES.COMPUTE);
    } // Runtime ----------------------------------------

    /**
     * Sets a pending property or path.  If the root property of the path in
     * question had no accessor, the path is set, otherwise it is enqueued
     * via `_setPendingProperty`.
     *
     * This function isolates relatively expensive functionality necessary
     * for the public API (`set`, `setProperties`, `notifyPath`, and property
     * change listeners via {{...}} bindings), such that it is only done
     * when paths enter the system, and not at every propagation step.  It
     * also sets a `__dataHasPaths` flag on the instance which is used to
     * fast-path slower path-matching code in the property effects host paths.
     *
     * `path` can be a path string or array of path parts as accepted by the
     * public API.
     *
     * @override
     * @param {string | !Array<number|string>} path Path to set
     * @param {*} value Value to set
     * @param {boolean=} shouldNotify Set to true if this change should
     *  cause a property notification event dispatch
     * @param {boolean=} isPathNotification If the path being set is a path
     *   notification of an already changed value, as opposed to a request
     *   to set and notify the change.  In the latter `false` case, a dirty
     *   check is performed and then the value is set to the path before
     *   enqueuing the pending property change.
     * @return {boolean} Returns true if the property/path was enqueued in
     *   the pending changes bag.
     * @protected
     */


    _setPendingPropertyOrPath(path, value, shouldNotify, isPathNotification) {
      if (isPathNotification || Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["root"])(Array.isArray(path) ? path[0] : path) !== path) {
        // Dirty check changes being set to a path against the actual object,
        // since this is the entry point for paths into the system; from here
        // the only dirty checks are against the `__dataTemp` cache to prevent
        // duplicate work in the same turn only. Note, if this was a notification
        // of a change already set to a path (isPathNotification: true),
        // we always let the change through and skip the `set` since it was
        // already dirty checked at the point of entry and the underlying
        // object has already been updated
        if (!isPathNotification) {
          let old = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path);
          path =
          /** @type {string} */
          Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["set"])(this, path, value); // Use property-accessor's simpler dirty check

          if (!path || !super._shouldPropertyChange(path, value, old)) {
            return false;
          }
        }

        this.__dataHasPaths = true;

        if (this._setPendingProperty(
        /**@type{string}*/
        path, value, shouldNotify)) {
          computeLinkedPaths(this,
          /**@type{string}*/
          path, value);
          return true;
        }
      } else {
        if (this.__dataHasAccessor && this.__dataHasAccessor[path]) {
          return this._setPendingProperty(
          /**@type{string}*/
          path, value, shouldNotify);
        } else {
          this[path] = value;
        }
      }

      return false;
    }
    /**
     * Applies a value to a non-Polymer element/node's property.
     *
     * The implementation makes a best-effort at binding interop:
     * Some native element properties have side-effects when
     * re-setting the same value (e.g. setting `<input>.value` resets the
     * cursor position), so we do a dirty-check before setting the value.
     * However, for better interop with non-Polymer custom elements that
     * accept objects, we explicitly re-set object changes coming from the
     * Polymer world (which may include deep object changes without the
     * top reference changing), erring on the side of providing more
     * information.
     *
     * Users may override this method to provide alternate approaches.
     *
     * @override
     * @param {!Node} node The node to set a property on
     * @param {string} prop The property to set
     * @param {*} value The value to set
     * @return {void}
     * @protected
     */


    _setUnmanagedPropertyToNode(node, prop, value) {
      // It is a judgment call that resetting primitives is
      // "bad" and resettings objects is also "good"; alternatively we could
      // implement a whitelist of tag & property values that should never
      // be reset (e.g. <input>.value && <select>.value)
      if (value !== node[prop] || typeof value == 'object') {
        // Note, className needs style scoping so this needs wrapping.
        if (prop === 'className') {
          node =
          /** @type {!Node} */
          Object(_utils_wrap_js__WEBPACK_IMPORTED_MODULE_1__["wrap"])(node);
        }

        node[prop] = value;
      }
    }
    /**
     * Overrides the `PropertiesChanged` implementation to introduce special
     * dirty check logic depending on the property & value being set:
     *
     * 1. Any value set to a path (e.g. 'obj.prop': 42 or 'obj.prop': {...})
     *    Stored in `__dataTemp`, dirty checked against `__dataTemp`
     * 2. Object set to simple property (e.g. 'prop': {...})
     *    Stored in `__dataTemp` and `__data`, dirty checked against
     *    `__dataTemp` by default implementation of `_shouldPropertyChange`
     * 3. Primitive value set to simple property (e.g. 'prop': 42)
     *    Stored in `__data`, dirty checked against `__data`
     *
     * The dirty-check is important to prevent cycles due to two-way
     * notification, but paths and objects are only dirty checked against any
     * previous value set during this turn via a "temporary cache" that is
     * cleared when the last `_propertiesChanged` exits. This is so:
     * a. any cached array paths (e.g. 'array.3.prop') may be invalidated
     *    due to array mutations like shift/unshift/splice; this is fine
     *    since path changes are dirty-checked at user entry points like `set`
     * b. dirty-checking for objects only lasts one turn to allow the user
     *    to mutate the object in-place and re-set it with the same identity
     *    and have all sub-properties re-propagated in a subsequent turn.
     *
     * The temp cache is not necessarily sufficient to prevent invalid array
     * paths, since a splice can happen during the same turn (with pathological
     * user code); we could introduce a "fixup" for temporarily cached array
     * paths if needed: https://github.com/Polymer/polymer/issues/4227
     *
     * @override
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @param {boolean=} shouldNotify True if property should fire notification
     *   event (applies only for `notify: true` properties)
     * @return {boolean} Returns true if the property changed
     */


    _setPendingProperty(property, value, shouldNotify) {
      let propIsPath = this.__dataHasPaths && Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isPath"])(property);
      let prevProps = propIsPath ? this.__dataTemp : this.__data;

      if (this._shouldPropertyChange(property, value, prevProps[property])) {
        if (!this.__dataPending) {
          this.__dataPending = {};
          this.__dataOld = {};
        } // Ensure old is captured from the last turn


        if (!(property in this.__dataOld)) {
          this.__dataOld[property] = this.__data[property];
        } // Paths are stored in temporary cache (cleared at end of turn),
        // which is used for dirty-checking, all others stored in __data


        if (propIsPath) {
          this.__dataTemp[property] = value;
        } else {
          this.__data[property] = value;
        } // All changes go into pending property bag, passed to _propertiesChanged


        this.__dataPending[property] = value; // Track properties that should notify separately

        if (propIsPath || this[TYPES.NOTIFY] && this[TYPES.NOTIFY][property]) {
          this.__dataToNotify = this.__dataToNotify || {};
          this.__dataToNotify[property] = shouldNotify;
        }

        return true;
      }

      return false;
    }
    /**
     * Overrides base implementation to ensure all accessors set `shouldNotify`
     * to true, for per-property notification tracking.
     *
     * @override
     * @param {string} property Name of the property
     * @param {*} value Value to set
     * @return {void}
     */


    _setProperty(property, value) {
      if (this._setPendingProperty(property, value, true)) {
        this._invalidateProperties();
      }
    }
    /**
     * Overrides `PropertyAccessor`'s default async queuing of
     * `_propertiesChanged`: if `__dataReady` is false (has not yet been
     * manually flushed), the function no-ops; otherwise flushes
     * `_propertiesChanged` synchronously.
     *
     * @override
     * @return {void}
     */


    _invalidateProperties() {
      if (this.__dataReady) {
        this._flushProperties();
      }
    }
    /**
     * Enqueues the given client on a list of pending clients, whose
     * pending property changes can later be flushed via a call to
     * `_flushClients`.
     *
     * @override
     * @param {Object} client PropertyEffects client to enqueue
     * @return {void}
     * @protected
     */


    _enqueueClient(client) {
      this.__dataPendingClients = this.__dataPendingClients || [];

      if (client !== this) {
        this.__dataPendingClients.push(client);
      }
    }
    /**
     * Flushes any clients previously enqueued via `_enqueueClient`, causing
     * their `_flushProperties` method to run.
     *
     * @override
     * @return {void}
     * @protected
     */


    _flushClients() {
      if (!this.__dataClientsReady) {
        this.__dataClientsReady = true;

        this._readyClients(); // Override point where accessors are turned on; importantly,
        // this is after clients have fully readied, providing a guarantee
        // that any property effects occur only after all clients are ready.


        this.__dataReady = true;
      } else {
        this.__enableOrFlushClients();
      }
    } // NOTE: We ensure clients either enable or flush as appropriate. This
    // handles two corner cases:
    // (1) clients flush properly when connected/enabled before the host
    // enables; e.g.
    //   (a) Templatize stamps with no properties and does not flush and
    //   (b) the instance is inserted into dom and
    //   (c) then the instance flushes.
    // (2) clients enable properly when not connected/enabled when the host
    // flushes; e.g.
    //   (a) a template is runtime stamped and not yet connected/enabled
    //   (b) a host sets a property, causing stamped dom to flush
    //   (c) the stamped dom enables.


    __enableOrFlushClients() {
      let clients = this.__dataPendingClients;

      if (clients) {
        this.__dataPendingClients = null;

        for (let i = 0; i < clients.length; i++) {
          let client = clients[i];

          if (!client.__dataEnabled) {
            client._enableProperties();
          } else if (client.__dataPending) {
            client._flushProperties();
          }
        }
      }
    }
    /**
     * Perform any initial setup on client dom. Called before the first
     * `_flushProperties` call on client dom and before any element
     * observers are called.
     *
     * @override
     * @return {void}
     * @protected
     */


    _readyClients() {
      this.__enableOrFlushClients();
    }
    /**
     * Sets a bag of property changes to this instance, and
     * synchronously processes all effects of the properties as a batch.
     *
     * Property names must be simple properties, not paths.  Batched
     * path propagation is not supported.
     *
     * @override
     * @param {Object} props Bag of one or more key-value pairs whose key is
     *   a property and value is the new value to set for that property.
     * @param {boolean=} setReadOnly When true, any private values set in
     *   `props` will be set. By default, `setProperties` will not set
     *   `readOnly: true` root properties.
     * @return {void}
     * @public
     */


    setProperties(props, setReadOnly) {
      for (let path in props) {
        if (setReadOnly || !this[TYPES.READ_ONLY] || !this[TYPES.READ_ONLY][path]) {
          //TODO(kschaaf): explicitly disallow paths in setProperty?
          // wildcard observers currently only pass the first changed path
          // in the `info` object, and you could do some odd things batching
          // paths, e.g. {'foo.bar': {...}, 'foo': null}
          this._setPendingPropertyOrPath(path, props[path], true);
        }
      }

      this._invalidateProperties();
    }
    /**
     * Overrides `PropertyAccessors` so that property accessor
     * side effects are not enabled until after client dom is fully ready.
     * Also calls `_flushClients` callback to ensure client dom is enabled
     * that was not enabled as a result of flushing properties.
     *
     * @override
     * @return {void}
     */


    ready() {
      // It is important that `super.ready()` is not called here as it
      // immediately turns on accessors. Instead, we wait until `readyClients`
      // to enable accessors to provide a guarantee that clients are ready
      // before processing any accessors side effects.
      this._flushProperties(); // If no data was pending, `_flushProperties` will not `flushClients`
      // so ensure this is done.


      if (!this.__dataClientsReady) {
        this._flushClients();
      } // Before ready, client notifications do not trigger _flushProperties.
      // Therefore a flush is necessary here if data has been set.


      if (this.__dataPending) {
        this._flushProperties();
      }
    }
    /**
     * Implements `PropertyAccessors`'s properties changed callback.
     *
     * Runs each class of effects for the batch of changed properties in
     * a specific order (compute, propagate, reflect, observe, notify).
     *
     * @override
     * @param {!Object} currentProps Bag of all current accessor values
     * @param {?Object} changedProps Bag of properties changed since the last
     *   call to `_propertiesChanged`
     * @param {?Object} oldProps Bag of previous values for each property
     *   in `changedProps`
     * @return {void}
     */


    _propertiesChanged(currentProps, changedProps, oldProps) {
      // ----------------------------
      // let c = Object.getOwnPropertyNames(changedProps || {});
      // window.debug && console.group(this.localName + '#' + this.id + ': ' + c);
      // if (window.debug) { debugger; }
      // ----------------------------
      let hasPaths = this.__dataHasPaths;
      this.__dataHasPaths = false;
      let notifyProps; // Compute properties

      runComputedEffects(this, changedProps, oldProps, hasPaths); // Clear notify properties prior to possible reentry (propagate, observe),
      // but after computing effects have a chance to add to them

      notifyProps = this.__dataToNotify;
      this.__dataToNotify = null; // Propagate properties to clients

      this._propagatePropertyChanges(changedProps, oldProps, hasPaths); // Flush clients


      this._flushClients(); // Reflect properties


      runEffects(this, this[TYPES.REFLECT], changedProps, oldProps, hasPaths); // Observe properties

      runEffects(this, this[TYPES.OBSERVE], changedProps, oldProps, hasPaths); // Notify properties to host

      if (notifyProps) {
        runNotifyEffects(this, notifyProps, changedProps, oldProps, hasPaths);
      } // Clear temporary cache at end of turn


      if (this.__dataCounter == 1) {
        this.__dataTemp = {};
      } // ----------------------------
      // window.debug && console.groupEnd(this.localName + '#' + this.id + ': ' + c);
      // ----------------------------

    }
    /**
     * Called to propagate any property changes to stamped template nodes
     * managed by this element.
     *
     * @override
     * @param {Object} changedProps Bag of changed properties
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {boolean} hasPaths True with `props` contains one or more paths
     * @return {void}
     * @protected
     */


    _propagatePropertyChanges(changedProps, oldProps, hasPaths) {
      if (this[TYPES.PROPAGATE]) {
        runEffects(this, this[TYPES.PROPAGATE], changedProps, oldProps, hasPaths);
      }

      if (this.__templateInfo) {
        this._runEffectsForTemplate(this.__templateInfo, changedProps, oldProps, hasPaths);
      }
    }

    _runEffectsForTemplate(templateInfo, changedProps, oldProps, hasPaths) {
      const baseRunEffects = (changedProps, hasPaths) => {
        runEffects(this, templateInfo.propertyEffects, changedProps, oldProps, hasPaths, templateInfo.nodeList);

        for (let info = templateInfo.firstChild; info; info = info.nextSibling) {
          this._runEffectsForTemplate(info, changedProps, oldProps, hasPaths);
        }
      };

      if (templateInfo.runEffects) {
        templateInfo.runEffects(baseRunEffects, changedProps, hasPaths);
      } else {
        baseRunEffects(changedProps, hasPaths);
      }
    }
    /**
     * Aliases one data path as another, such that path notifications from one
     * are routed to the other.
     *
     * @override
     * @param {string | !Array<string|number>} to Target path to link.
     * @param {string | !Array<string|number>} from Source path to link.
     * @return {void}
     * @public
     */


    linkPaths(to, from) {
      to = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["normalize"])(to);
      from = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["normalize"])(from);
      this.__dataLinkedPaths = this.__dataLinkedPaths || {};
      this.__dataLinkedPaths[to] = from;
    }
    /**
     * Removes a data path alias previously established with `_linkPaths`.
     *
     * Note, the path to unlink should be the target (`to`) used when
     * linking the paths.
     *
     * @override
     * @param {string | !Array<string|number>} path Target path to unlink.
     * @return {void}
     * @public
     */


    unlinkPaths(path) {
      path = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["normalize"])(path);

      if (this.__dataLinkedPaths) {
        delete this.__dataLinkedPaths[path];
      }
    }
    /**
     * Notify that an array has changed.
     *
     * Example:
     *
     *     this.items = [ {name: 'Jim'}, {name: 'Todd'}, {name: 'Bill'} ];
     *     ...
     *     this.items.splice(1, 1, {name: 'Sam'});
     *     this.items.push({name: 'Bob'});
     *     this.notifySplices('items', [
     *       { index: 1, removed: [{name: 'Todd'}], addedCount: 1,
     *         object: this.items, type: 'splice' },
     *       { index: 3, removed: [], addedCount: 1,
     *         object: this.items, type: 'splice'}
     *     ]);
     *
     * @param {string} path Path that should be notified.
     * @param {Array} splices Array of splice records indicating ordered
     *   changes that occurred to the array. Each record should have the
     *   following fields:
     *    * index: index at which the change occurred
     *    * removed: array of items that were removed from this index
     *    * addedCount: number of new items added at this index
     *    * object: a reference to the array in question
     *    * type: the string literal 'splice'
     *
     *   Note that splice records _must_ be normalized such that they are
     *   reported in index order (raw results from `Object.observe` are not
     *   ordered and must be normalized/merged before notifying).
     *
     * @override
     * @return {void}
     * @public
     */


    notifySplices(path, splices) {
      let info = {
        path: ''
      };
      let array =
      /** @type {Array} */
      Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path, info);
      notifySplices(this, array, info.path, splices);
    }
    /**
     * Convenience method for reading a value from a path.
     *
     * Note, if any part in the path is undefined, this method returns
     * `undefined` (this method does not throw when dereferencing undefined
     * paths).
     *
     * @override
     * @param {(string|!Array<(string|number)>)} path Path to the value
     *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
     *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
     *   bracketed expressions are not supported; string-based path parts
     *   *must* be separated by dots.  Note that when dereferencing array
     *   indices, the index may be used as a dotted part directly
     *   (e.g. `users.12.name` or `['users', 12, 'name']`).
     * @param {Object=} root Root object from which the path is evaluated.
     * @return {*} Value at the path, or `undefined` if any part of the path
     *   is undefined.
     * @public
     */


    get(path, root) {
      return Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(root || this, path);
    }
    /**
     * Convenience method for setting a value to a path and notifying any
     * elements bound to the same path.
     *
     * Note, if any part in the path except for the last is undefined,
     * this method does nothing (this method does not throw when
     * dereferencing undefined paths).
     *
     * @override
     * @param {(string|!Array<(string|number)>)} path Path to the value
     *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
     *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
     *   bracketed expressions are not supported; string-based path parts
     *   *must* be separated by dots.  Note that when dereferencing array
     *   indices, the index may be used as a dotted part directly
     *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
     * @param {*} value Value to set at the specified path.
     * @param {Object=} root Root object from which the path is evaluated.
     *   When specified, no notification will occur.
     * @return {void}
     * @public
     */


    set(path, value, root) {
      if (root) {
        Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["set"])(root, path, value);
      } else {
        if (!this[TYPES.READ_ONLY] || !this[TYPES.READ_ONLY][
        /** @type {string} */
        path]) {
          if (this._setPendingPropertyOrPath(path, value, true)) {
            this._invalidateProperties();
          }
        }
      }
    }
    /**
     * Adds items onto the end of the array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.push`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @override
     * @param {string | !Array<string|number>} path Path to array.
     * @param {...*} items Items to push onto array
     * @return {number} New length of the array.
     * @public
     */


    push(path, ...items) {
      let info = {
        path: ''
      };
      let array =
      /** @type {Array}*/
      Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path, info);
      let len = array.length;
      let ret = array.push(...items);

      if (items.length) {
        notifySplice(this, array, info.path, len, items.length, []);
      }

      return ret;
    }
    /**
     * Removes an item from the end of array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.pop`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @override
     * @param {string | !Array<string|number>} path Path to array.
     * @return {*} Item that was removed.
     * @public
     */


    pop(path) {
      let info = {
        path: ''
      };
      let array =
      /** @type {Array} */
      Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path, info);
      let hadLength = Boolean(array.length);
      let ret = array.pop();

      if (hadLength) {
        notifySplice(this, array, info.path, array.length, 0, [ret]);
      }

      return ret;
    }
    /**
     * Starting from the start index specified, removes 0 or more items
     * from the array and inserts 0 or more new items in their place.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.splice`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @override
     * @param {string | !Array<string|number>} path Path to array.
     * @param {number} start Index from which to start removing/inserting.
     * @param {number=} deleteCount Number of items to remove.
     * @param {...*} items Items to insert into array.
     * @return {!Array} Array of removed items.
     * @public
     */


    splice(path, start, deleteCount, ...items) {
      let info = {
        path: ''
      };
      let array =
      /** @type {Array} */
      Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path, info); // Normalize fancy native splice handling of crazy start values

      if (start < 0) {
        start = array.length - Math.floor(-start);
      } else if (start) {
        start = Math.floor(start);
      } // array.splice does different things based on the number of arguments
      // you pass in. Therefore, array.splice(0) and array.splice(0, undefined)
      // do different things. In the former, the whole array is cleared. In the
      // latter, no items are removed.
      // This means that we need to detect whether 1. one of the arguments
      // is actually passed in and then 2. determine how many arguments
      // we should pass on to the native array.splice
      //


      let ret; // Omit any additional arguments if they were not passed in

      if (arguments.length === 2) {
        ret = array.splice(start); // Either start was undefined and the others were defined, but in this
        // case we can safely pass on all arguments
        //
        // Note: this includes the case where none of the arguments were passed in,
        // e.g. this.splice('array'). However, if both start and deleteCount
        // are undefined, array.splice will not modify the array (as expected)
      } else {
        ret = array.splice(start, deleteCount, ...items);
      } // At the end, check whether any items were passed in (e.g. insertions)
      // or if the return array contains items (e.g. deletions).
      // Only notify if items were added or deleted.


      if (items.length || ret.length) {
        notifySplice(this, array, info.path, start, items.length, ret);
      }

      return ret;
    }
    /**
     * Removes an item from the beginning of array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.pop`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @override
     * @param {string | !Array<string|number>} path Path to array.
     * @return {*} Item that was removed.
     * @public
     */


    shift(path) {
      let info = {
        path: ''
      };
      let array =
      /** @type {Array} */
      Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path, info);
      let hadLength = Boolean(array.length);
      let ret = array.shift();

      if (hadLength) {
        notifySplice(this, array, info.path, 0, 0, [ret]);
      }

      return ret;
    }
    /**
     * Adds items onto the beginning of the array at the path specified.
     *
     * The arguments after `path` and return value match that of
     * `Array.prototype.push`.
     *
     * This method notifies other paths to the same array that a
     * splice occurred to the array.
     *
     * @override
     * @param {string | !Array<string|number>} path Path to array.
     * @param {...*} items Items to insert info array
     * @return {number} New length of the array.
     * @public
     */


    unshift(path, ...items) {
      let info = {
        path: ''
      };
      let array =
      /** @type {Array} */
      Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path, info);
      let ret = array.unshift(...items);

      if (items.length) {
        notifySplice(this, array, info.path, 0, items.length, []);
      }

      return ret;
    }
    /**
     * Notify that a path has changed.
     *
     * Example:
     *
     *     this.item.user.name = 'Bob';
     *     this.notifyPath('item.user.name');
     *
     * @override
     * @param {string} path Path that should be notified.
     * @param {*=} value Value at the path (optional).
     * @return {void}
     * @public
     */


    notifyPath(path, value) {
      /** @type {string} */
      let propPath;

      if (arguments.length == 1) {
        // Get value if not supplied
        let info = {
          path: ''
        };
        value = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(this, path, info);
        propPath = info.path;
      } else if (Array.isArray(path)) {
        // Normalize path if needed
        propPath = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["normalize"])(path);
      } else {
        propPath =
        /** @type{string} */
        path;
      }

      if (this._setPendingPropertyOrPath(propPath, value, true, true)) {
        this._invalidateProperties();
      }
    }
    /**
     * Equivalent to static `createReadOnlyProperty` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @override
     * @param {string} property Property name
     * @param {boolean=} protectedSetter Creates a custom protected setter
     *   when `true`.
     * @return {void}
     * @protected
     */


    _createReadOnlyProperty(property, protectedSetter) {
      this._addPropertyEffect(property, TYPES.READ_ONLY);

      if (protectedSetter) {
        this['_set' + upper(property)] =
        /** @this {PropertyEffects} */
        function (value) {
          this._setProperty(property, value);
        };
      }
    }
    /**
     * Equivalent to static `createPropertyObserver` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @override
     * @param {string} property Property name
     * @param {string|function(*,*)} method Function or name of observer method
     *     to call
     * @param {boolean=} dynamicFn Whether the method name should be included as
     *   a dependency to the effect.
     * @return {void}
     * @protected
     */


    _createPropertyObserver(property, method, dynamicFn) {
      let info = {
        property,
        method,
        dynamicFn: Boolean(dynamicFn)
      };

      this._addPropertyEffect(property, TYPES.OBSERVE, {
        fn: runObserverEffect,
        info,
        trigger: {
          name: property
        }
      });

      if (dynamicFn) {
        this._addPropertyEffect(
        /** @type {string} */
        method, TYPES.OBSERVE, {
          fn: runObserverEffect,
          info,
          trigger: {
            name: method
          }
        });
      }
    }
    /**
     * Equivalent to static `createMethodObserver` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @override
     * @param {string} expression Method expression
     * @param {boolean|Object=} dynamicFn Boolean or object map indicating
     *   whether method names should be included as a dependency to the effect.
     * @return {void}
     * @protected
     */


    _createMethodObserver(expression, dynamicFn) {
      let sig = parseMethod(expression);

      if (!sig) {
        throw new Error("Malformed observer expression '" + expression + "'");
      }

      createMethodEffect(this, sig, TYPES.OBSERVE, runMethodEffect, null, dynamicFn);
    }
    /**
     * Equivalent to static `createNotifyingProperty` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @override
     * @param {string} property Property name
     * @return {void}
     * @protected
     */


    _createNotifyingProperty(property) {
      this._addPropertyEffect(property, TYPES.NOTIFY, {
        fn: runNotifyEffect,
        info: {
          eventName: Object(_utils_case_map_js__WEBPACK_IMPORTED_MODULE_4__["camelToDashCase"])(property) + '-changed',
          property: property
        }
      });
    }
    /**
     * Equivalent to static `createReflectedProperty` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @override
     * @param {string} property Property name
     * @return {void}
     * @protected
     * @suppress {missingProperties} go/missingfnprops
     */


    _createReflectedProperty(property) {
      let attr = this.constructor.attributeNameForProperty(property);

      if (attr[0] === '-') {
        console.warn('Property ' + property + ' cannot be reflected to attribute ' + attr + ' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.');
      } else {
        this._addPropertyEffect(property, TYPES.REFLECT, {
          fn: runReflectEffect,
          info: {
            attrName: attr
          }
        });
      }
    }
    /**
     * Equivalent to static `createComputedProperty` API but can be called on
     * an instance to add effects at runtime.  See that method for
     * full API docs.
     *
     * @override
     * @param {string} property Name of computed property to set
     * @param {string} expression Method expression
     * @param {boolean|Object=} dynamicFn Boolean or object map indicating
     *   whether method names should be included as a dependency to the effect.
     * @return {void}
     * @protected
     */


    _createComputedProperty(property, expression, dynamicFn) {
      let sig = parseMethod(expression);

      if (!sig) {
        throw new Error("Malformed computed expression '" + expression + "'");
      }

      const info = createMethodEffect(this, sig, TYPES.COMPUTE, runComputedEffect, property, dynamicFn); // Effects are normally stored as map of dependency->effect, but for
      // ordered computation, we also need tree of computedProp->dependencies

      ensureOwnEffectMap(this, COMPUTE_INFO)[property] = info;
    }
    /**
     * Gather the argument values for a method specified in the provided array
     * of argument metadata.
     *
     * The `path` and `value` arguments are used to fill in wildcard descriptor
     * when the method is being called as a result of a path notification.
     *
     * @param {!Array<!MethodArg>} args Array of argument metadata
     * @param {string} path Property/path name that triggered the method effect
     * @param {Object} props Bag of current property changes
     * @return {!Array<*>} Array of argument values
     * @private
     */


    _marshalArgs(args, path, props) {
      const data = this.__data;
      const values = [];

      for (let i = 0, l = args.length; i < l; i++) {
        let {
          name,
          structured,
          wildcard,
          value,
          literal
        } = args[i];

        if (!literal) {
          if (wildcard) {
            const matches = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isDescendant"])(name, path);
            const pathValue = getArgValue(data, props, matches ? path : name);
            value = {
              path: matches ? path : name,
              value: pathValue,
              base: matches ? Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(data, name) : pathValue
            };
          } else {
            value = structured ? getArgValue(data, props, name) : data[name];
          }
        } // When the `legacyUndefined` flag is enabled, pass a no-op value
        // so that the observer, computed property, or compound binding is aborted.


        if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["legacyUndefined"] && !this._overrideLegacyUndefined && value === undefined && args.length > 1) {
          return NOOP;
        }

        values[i] = value;
      }

      return values;
    } // -- static class methods ------------

    /**
     * Ensures an accessor exists for the specified property, and adds
     * to a list of "property effects" that will run when the accessor for
     * the specified property is set.  Effects are grouped by "type", which
     * roughly corresponds to a phase in effect processing.  The effect
     * metadata should be in the following form:
     *
     *     {
     *       fn: effectFunction, // Reference to function to call to perform effect
     *       info: { ... }       // Effect metadata passed to function
     *       trigger: {          // Optional triggering metadata; if not provided
     *         name: string      // the property is treated as a wildcard
     *         structured: boolean
     *         wildcard: boolean
     *       }
     *     }
     *
     * Effects are called from `_propertiesChanged` in the following order by
     * type:
     *
     * 1. COMPUTE
     * 2. PROPAGATE
     * 3. REFLECT
     * 4. OBSERVE
     * 5. NOTIFY
     *
     * Effect functions are called with the following signature:
     *
     *     effectFunction(inst, path, props, oldProps, info, hasPaths)
     *
     * @param {string} property Property that should trigger the effect
     * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
     * @param {Object=} effect Effect metadata object
     * @return {void}
     * @protected
     * @nocollapse
     */


    static addPropertyEffect(property, type, effect) {
      this.prototype._addPropertyEffect(property, type, effect);
    }
    /**
     * Creates a single-property observer for the given property.
     *
     * @param {string} property Property name
     * @param {string|function(*,*)} method Function or name of observer method to call
     * @param {boolean=} dynamicFn Whether the method name should be included as
     *   a dependency to the effect.
     * @return {void}
     * @protected
     * @nocollapse
     */


    static createPropertyObserver(property, method, dynamicFn) {
      this.prototype._createPropertyObserver(property, method, dynamicFn);
    }
    /**
     * Creates a multi-property "method observer" based on the provided
     * expression, which should be a string in the form of a normal JavaScript
     * function signature: `'methodName(arg1, [..., argn])'`.  Each argument
     * should correspond to a property or path in the context of this
     * prototype (or instance), or may be a literal string or number.
     *
     * @param {string} expression Method expression
     * @param {boolean|Object=} dynamicFn Boolean or object map indicating
     * @return {void}
     *   whether method names should be included as a dependency to the effect.
     * @protected
     * @nocollapse
     */


    static createMethodObserver(expression, dynamicFn) {
      this.prototype._createMethodObserver(expression, dynamicFn);
    }
    /**
     * Causes the setter for the given property to dispatch `<property>-changed`
     * events to notify of changes to the property.
     *
     * @param {string} property Property name
     * @return {void}
     * @protected
     * @nocollapse
     */


    static createNotifyingProperty(property) {
      this.prototype._createNotifyingProperty(property);
    }
    /**
     * Creates a read-only accessor for the given property.
     *
     * To set the property, use the protected `_setProperty` API.
     * To create a custom protected setter (e.g. `_setMyProp()` for
     * property `myProp`), pass `true` for `protectedSetter`.
     *
     * Note, if the property will have other property effects, this method
     * should be called first, before adding other effects.
     *
     * @param {string} property Property name
     * @param {boolean=} protectedSetter Creates a custom protected setter
     *   when `true`.
     * @return {void}
     * @protected
     * @nocollapse
     */


    static createReadOnlyProperty(property, protectedSetter) {
      this.prototype._createReadOnlyProperty(property, protectedSetter);
    }
    /**
     * Causes the setter for the given property to reflect the property value
     * to a (dash-cased) attribute of the same name.
     *
     * @param {string} property Property name
     * @return {void}
     * @protected
     * @nocollapse
     */


    static createReflectedProperty(property) {
      this.prototype._createReflectedProperty(property);
    }
    /**
     * Creates a computed property whose value is set to the result of the
     * method described by the given `expression` each time one or more
     * arguments to the method changes.  The expression should be a string
     * in the form of a normal JavaScript function signature:
     * `'methodName(arg1, [..., argn])'`
     *
     * @param {string} property Name of computed property to set
     * @param {string} expression Method expression
     * @param {boolean|Object=} dynamicFn Boolean or object map indicating whether
     *   method names should be included as a dependency to the effect.
     * @return {void}
     * @protected
     * @nocollapse
     */


    static createComputedProperty(property, expression, dynamicFn) {
      this.prototype._createComputedProperty(property, expression, dynamicFn);
    }
    /**
     * Parses the provided template to ensure binding effects are created
     * for them, and then ensures property accessors are created for any
     * dependent properties in the template.  Binding effects for bound
     * templates are stored in a linked list on the instance so that
     * templates can be efficiently stamped and unstamped.
     *
     * @param {!HTMLTemplateElement} template Template containing binding
     *   bindings
     * @return {!TemplateInfo} Template metadata object
     * @protected
     * @nocollapse
     */


    static bindTemplate(template) {
      return this.prototype._bindTemplate(template);
    } // -- binding ----------------------------------------------

    /*
     * Overview of binding flow:
     *
     * During finalization (`instanceBinding==false`, `wasPreBound==false`):
     *  `_bindTemplate(t, false)` called directly during finalization - parses
     *  the template (for the first time), and then assigns that _prototypical_
     *  template info to `__preboundTemplateInfo` _on the prototype_; note in
     *  this case `wasPreBound` is false; this is the first time we're binding
     *  it, thus we create accessors.
     *
     * During first stamping (`instanceBinding==true`, `wasPreBound==true`):
     *   `_stampTemplate` calls `_bindTemplate(t, true)`: the `templateInfo`
     *   returned matches the prebound one, and so this is `wasPreBound == true`
     *   state; thus we _skip_ creating accessors, but _do_ create an instance
     *   of the template info to serve as the start of our linked list (needs to
     *   be an instance, not the prototypical one, so that we can add `nodeList`
     *   to it to contain the `nodeInfo`-ordered list of instance nodes for
     *   bindings, and so we can chain runtime-stamped template infos off of
     *   it). At this point, the call to `_stampTemplate` calls
     *   `applyTemplateInfo` for each nested `<template>` found during parsing
     *   to hand prototypical `_templateInfo` to them; we also pass the _parent_
     *   `templateInfo` to the `<template>` so that we have the instance-time
     *   parent to link the `templateInfo` under in the case it was
     *   runtime-stamped.
     *
     * During subsequent runtime stamping (`instanceBinding==true`,
     *   `wasPreBound==false`): `_stampTemplate` calls `_bindTemplate(t, true)`
     *   - here `templateInfo` is guaranteed to _not_ match the prebound one,
     *   because it was either a different template altogether, or even if it
     *   was the same template, the step above created a instance of the info;
     *   in this case `wasPreBound == false`, so we _do_ create accessors, _and_
     *   link a instance into the linked list.
     */

    /**
     * Equivalent to static `bindTemplate` API but can be called on an instance
     * to add effects at runtime.  See that method for full API docs.
     *
     * This method may be called on the prototype (for prototypical template
     * binding, to avoid creating accessors every instance) once per prototype,
     * and will be called with `runtimeBinding: true` by `_stampTemplate` to
     * create and link an instance of the template metadata associated with a
     * particular stamping.
     *
     * @override
     * @param {!HTMLTemplateElement} template Template containing binding
     * bindings
     * @param {boolean=} instanceBinding When false (default), performs
     * "prototypical" binding of the template and overwrites any previously
     * bound template for the class. When true (as passed from
     * `_stampTemplate`), the template info is instanced and linked into the
     * list of bound templates.
     * @return {!TemplateInfo} Template metadata object; for `runtimeBinding`,
     * this is an instance of the prototypical template info
     * @protected
     * @suppress {missingProperties} go/missingfnprops
     */


    _bindTemplate(template, instanceBinding) {
      let templateInfo = this.constructor._parseTemplate(template);

      let wasPreBound = this.__preBoundTemplateInfo == templateInfo; // Optimization: since this is called twice for proto-bound templates,
      // don't attempt to recreate accessors if this template was pre-bound

      if (!wasPreBound) {
        for (let prop in templateInfo.propertyEffects) {
          this._createPropertyAccessor(prop);
        }
      }

      if (instanceBinding) {
        // For instance-time binding, create instance of template metadata
        // and link into tree of templates if necessary
        templateInfo =
        /** @type {!TemplateInfo} */
        Object.create(templateInfo);
        templateInfo.wasPreBound = wasPreBound;

        if (!this.__templateInfo) {
          // Set the info to the root of the tree
          this.__templateInfo = templateInfo;
        } else {
          // Append this template info onto the end of its parent template's
          // list, which will determine the tree structure via which property
          // effects are run; if this template was not nested in another
          // template, use the root template (the first stamped one) as the
          // parent. Note, `parent` is the `templateInfo` instance for this
          // template's parent (containing) template, which was set up in
          // `applyTemplateInfo`.  While a given template's `parent` is set
          // apriori, it is only added to the parent's child list at the point
          // that it is being bound, since a template may or may not ever be
          // stamped, and may be stamped more than once (in which case instances
          // of the template info will be in the tree under its parent more than
          // once).
          const parent = template._parentTemplateInfo || this.__templateInfo;
          const previous = parent.lastChild;
          templateInfo.parent = parent;
          parent.lastChild = templateInfo;
          templateInfo.previousSibling = previous;

          if (previous) {
            previous.nextSibling = templateInfo;
          } else {
            parent.firstChild = templateInfo;
          }
        }
      } else {
        this.__preBoundTemplateInfo = templateInfo;
      }

      return templateInfo;
    }
    /**
     * Adds a property effect to the given template metadata, which is run
     * at the "propagate" stage of `_propertiesChanged` when the template
     * has been bound to the element via `_bindTemplate`.
     *
     * The `effect` object should match the format in `_addPropertyEffect`.
     *
     * @param {Object} templateInfo Template metadata to add effect to
     * @param {string} prop Property that should trigger the effect
     * @param {Object=} effect Effect metadata object
     * @return {void}
     * @protected
     * @nocollapse
     */


    static _addTemplatePropertyEffect(templateInfo, prop, effect) {
      let hostProps = templateInfo.hostProps = templateInfo.hostProps || {};
      hostProps[prop] = true;
      let effects = templateInfo.propertyEffects = templateInfo.propertyEffects || {};
      let propEffects = effects[prop] = effects[prop] || [];
      propEffects.push(effect);
    }
    /**
     * Stamps the provided template and performs instance-time setup for
     * Polymer template features, including data bindings, declarative event
     * listeners, and the `this.$` map of `id`'s to nodes.  A document fragment
     * is returned containing the stamped DOM, ready for insertion into the
     * DOM.
     *
     * This method may be called more than once; however note that due to
     * `shadycss` polyfill limitations, only styles from templates prepared
     * using `ShadyCSS.prepareTemplate` will be correctly polyfilled (scoped
     * to the shadow root and support CSS custom properties), and note that
     * `ShadyCSS.prepareTemplate` may only be called once per element. As such,
     * any styles required by in runtime-stamped templates must be included
     * in the main element template.
     *
     * @param {!HTMLTemplateElement} template Template to stamp
     * @param {TemplateInfo=} templateInfo Optional bound template info associated
     *   with the template to be stamped; if omitted the template will be
     *   automatically bound.
     * @return {!StampedTemplate} Cloned template content
     * @override
     * @protected
     */


    _stampTemplate(template, templateInfo) {
      templateInfo = templateInfo ||
      /** @type {!TemplateInfo} */
      this._bindTemplate(template, true); // Ensures that created dom is `_enqueueClient`'d to this element so
      // that it can be flushed on next call to `_flushProperties`

      hostStack.push(this);

      let dom = super._stampTemplate(template, templateInfo);

      hostStack.pop(); // Add template-instance-specific data to instanced templateInfo

      templateInfo.nodeList = dom.nodeList; // Capture child nodes to allow unstamping of non-prototypical templates

      if (!templateInfo.wasPreBound) {
        let nodes = templateInfo.childNodes = [];

        for (let n = dom.firstChild; n; n = n.nextSibling) {
          nodes.push(n);
        }
      }

      dom.templateInfo = templateInfo; // Setup compound storage, 2-way listeners, and dataHost for bindings

      setupBindings(this, templateInfo); // Flush properties into template nodes; the check on `__dataClientsReady`
      // ensures we don't needlessly run effects for an element's initial
      // prototypical template stamping since they will happen as a part of the
      // first call to `_propertiesChanged`. This flag is set to true
      // after running the initial propagate effects, and immediately before
      // flushing clients. Since downstream clients could cause stamping on
      // this host (e.g. a fastDomIf `dom-if` being forced to render
      // synchronously), this flag ensures effects for runtime-stamped templates
      // are run at this point during the initial element boot-up.

      if (this.__dataClientsReady) {
        this._runEffectsForTemplate(templateInfo, this.__data, null, false);

        this._flushClients();
      }

      return dom;
    }
    /**
     * Removes and unbinds the nodes previously contained in the provided
     * DocumentFragment returned from `_stampTemplate`.
     *
     * @override
     * @param {!StampedTemplate} dom DocumentFragment previously returned
     *   from `_stampTemplate` associated with the nodes to be removed
     * @return {void}
     * @protected
     */


    _removeBoundDom(dom) {
      // Unlink template info; Note that while the child is unlinked from its
      // parent list, a template's `parent` reference is never removed, since
      // this is is determined by the tree structure and applied at
      // `applyTemplateInfo` time.
      const templateInfo = dom.templateInfo;
      const {
        previousSibling,
        nextSibling,
        parent
      } = templateInfo;

      if (previousSibling) {
        previousSibling.nextSibling = nextSibling;
      } else if (parent) {
        parent.firstChild = nextSibling;
      }

      if (nextSibling) {
        nextSibling.previousSibling = previousSibling;
      } else if (parent) {
        parent.lastChild = previousSibling;
      }

      templateInfo.nextSibling = templateInfo.previousSibling = null; // Remove stamped nodes

      let nodes = templateInfo.childNodes;

      for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        Object(_utils_wrap_js__WEBPACK_IMPORTED_MODULE_1__["wrap"])(Object(_utils_wrap_js__WEBPACK_IMPORTED_MODULE_1__["wrap"])(node).parentNode).removeChild(node);
      }
    }
    /**
     * Overrides default `TemplateStamp` implementation to add support for
     * parsing bindings from `TextNode`'s' `textContent`.  A `bindings`
     * array is added to `nodeInfo` and populated with binding metadata
     * with information capturing the binding target, and a `parts` array
     * with one or more metadata objects capturing the source(s) of the
     * binding.
     *
     * @param {Node} node Node to parse
     * @param {TemplateInfo} templateInfo Template metadata for current template
     * @param {NodeInfo} nodeInfo Node metadata for current template node
     * @return {boolean} `true` if the visited node added node-specific
     *   metadata to `nodeInfo`
     * @protected
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     * @nocollapse
     */


    static _parseTemplateNode(node, templateInfo, nodeInfo) {
      // TODO(https://github.com/google/closure-compiler/issues/3240):
      //     Change back to just super.methodCall()
      let noted = propertyEffectsBase._parseTemplateNode.call(this, node, templateInfo, nodeInfo);

      if (node.nodeType === Node.TEXT_NODE) {
        let parts = this._parseBindings(node.textContent, templateInfo);

        if (parts) {
          // Initialize the textContent with any literal parts
          // NOTE: default to a space here so the textNode remains; some browsers
          // (IE) omit an empty textNode following cloneNode/importNode.
          node.textContent = literalFromParts(parts) || ' ';
          addBinding(this, templateInfo, nodeInfo, 'text', 'textContent', parts);
          noted = true;
        }
      }

      return noted;
    }
    /**
     * Overrides default `TemplateStamp` implementation to add support for
     * parsing bindings from attributes.  A `bindings`
     * array is added to `nodeInfo` and populated with binding metadata
     * with information capturing the binding target, and a `parts` array
     * with one or more metadata objects capturing the source(s) of the
     * binding.
     *
     * @param {Element} node Node to parse
     * @param {TemplateInfo} templateInfo Template metadata for current template
     * @param {NodeInfo} nodeInfo Node metadata for current template node
     * @param {string} name Attribute name
     * @param {string} value Attribute value
     * @return {boolean} `true` if the visited node added node-specific
     *   metadata to `nodeInfo`
     * @protected
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     * @nocollapse
     */


    static _parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value) {
      let parts = this._parseBindings(value, templateInfo);

      if (parts) {
        // Attribute or property
        let origName = name;
        let kind = 'property'; // The only way we see a capital letter here is if the attr has
        // a capital letter in it per spec. In this case, to make sure
        // this binding works, we go ahead and make the binding to the attribute.

        if (capitalAttributeRegex.test(name)) {
          kind = 'attribute';
        } else if (name[name.length - 1] == '$') {
          name = name.slice(0, -1);
          kind = 'attribute';
        } // Initialize attribute bindings with any literal parts


        let literal = literalFromParts(parts);

        if (literal && kind == 'attribute') {
          // Ensure a ShadyCSS template scoped style is not removed
          // when a class$ binding's initial literal value is set.
          if (name == 'class' && node.hasAttribute('class')) {
            literal += ' ' + node.getAttribute(name);
          }

          node.setAttribute(name, literal);
        } // support disable-upgrade


        if (kind == 'attribute' && origName == 'disable-upgrade$') {
          node.setAttribute(name, '');
        } // Clear attribute before removing, since IE won't allow removing
        // `value` attribute if it previously had a value (can't
        // unconditionally set '' before removing since attributes with `$`
        // can't be set using setAttribute)


        if (node.localName === 'input' && origName === 'value') {
          node.setAttribute(origName, '');
        } // Remove annotation


        node.removeAttribute(origName); // Case hackery: attributes are lower-case, but bind targets
        // (properties) are case sensitive. Gambit is to map dash-case to
        // camel-case: `foo-bar` becomes `fooBar`.
        // Attribute bindings are excepted.

        if (kind === 'property') {
          name = Object(_utils_case_map_js__WEBPACK_IMPORTED_MODULE_4__["dashToCamelCase"])(name);
        }

        addBinding(this, templateInfo, nodeInfo, kind, name, parts, literal);
        return true;
      } else {
        // TODO(https://github.com/google/closure-compiler/issues/3240):
        //     Change back to just super.methodCall()
        return propertyEffectsBase._parseTemplateNodeAttribute.call(this, node, templateInfo, nodeInfo, name, value);
      }
    }
    /**
     * Overrides default `TemplateStamp` implementation to add support for
     * binding the properties that a nested template depends on to the template
     * as `_host_<property>`.
     *
     * @param {Node} node Node to parse
     * @param {TemplateInfo} templateInfo Template metadata for current template
     * @param {NodeInfo} nodeInfo Node metadata for current template node
     * @return {boolean} `true` if the visited node added node-specific
     *   metadata to `nodeInfo`
     * @protected
     * @suppress {missingProperties} Interfaces in closure do not inherit statics, but classes do
     * @nocollapse
     */


    static _parseTemplateNestedTemplate(node, templateInfo, nodeInfo) {
      // TODO(https://github.com/google/closure-compiler/issues/3240):
      //     Change back to just super.methodCall()
      let noted = propertyEffectsBase._parseTemplateNestedTemplate.call(this, node, templateInfo, nodeInfo);

      const parent = node.parentNode;
      const nestedTemplateInfo = nodeInfo.templateInfo;
      const isDomIf = parent.localName === 'dom-if';
      const isDomRepeat = parent.localName === 'dom-repeat'; // Remove nested template and redirect its host bindings & templateInfo
      // onto the parent (dom-if/repeat element)'s nodeInfo

      if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["removeNestedTemplates"] && (isDomIf || isDomRepeat)) {
        parent.removeChild(node); // Use the parent's nodeInfo (for the dom-if/repeat) to record the
        // templateInfo, and use that for any host property bindings below

        nodeInfo = nodeInfo.parentInfo;
        nodeInfo.templateInfo = nestedTemplateInfo; // Ensure the parent dom-if/repeat is noted since it now may have host
        // bindings; it may not have been if it did not have its own bindings

        nodeInfo.noted = true;
        noted = false;
      } // Merge host props into outer template and add bindings


      let hostProps = nestedTemplateInfo.hostProps;

      if (_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["fastDomIf"] && isDomIf) {
        // `fastDomIf` mode uses runtime-template stamping to add accessors/
        // effects to properties used in its template; as such we don't need to
        // tax the host element with `_host_` bindings for the `dom-if`.
        // However, in the event it is nested in a `dom-repeat`, it is still
        // important that its host properties are added to the
        // TemplateInstance's `hostProps` so that they are forwarded to the
        // TemplateInstance.
        if (hostProps) {
          templateInfo.hostProps = Object.assign(templateInfo.hostProps || {}, hostProps); // Ensure the dom-if is noted so that it has a __dataHost, since
          // `fastDomIf` uses the host for runtime template stamping; note this
          // was already ensured above in the `removeNestedTemplates` case

          if (!_utils_settings_js__WEBPACK_IMPORTED_MODULE_7__["removeNestedTemplates"]) {
            nodeInfo.parentInfo.noted = true;
          }
        }
      } else {
        let mode = '{';

        for (let source in hostProps) {
          let parts = [{
            mode,
            source,
            dependencies: [source],
            hostProp: true
          }];
          addBinding(this, templateInfo, nodeInfo, 'property', '_host_' + source, parts);
        }
      }

      return noted;
    }
    /**
     * Called to parse text in a template (either attribute values or
     * textContent) into binding metadata.
     *
     * Any overrides of this method should return an array of binding part
     * metadata  representing one or more bindings found in the provided text
     * and any "literal" text in between.  Any non-literal parts will be passed
     * to `_evaluateBinding` when any dependencies change.  The only required
     * fields of each "part" in the returned array are as follows:
     *
     * - `dependencies` - Array containing trigger metadata for each property
     *   that should trigger the binding to update
     * - `literal` - String containing text if the part represents a literal;
     *   in this case no `dependencies` are needed
     *
     * Additional metadata for use by `_evaluateBinding` may be provided in
     * each part object as needed.
     *
     * The default implementation handles the following types of bindings
     * (one or more may be intermixed with literal strings):
     * - Property binding: `[[prop]]`
     * - Path binding: `[[object.prop]]`
     * - Negated property or path bindings: `[[!prop]]` or `[[!object.prop]]`
     * - Two-way property or path bindings (supports negation):
     *   `{{prop}}`, `{{object.prop}}`, `{{!prop}}` or `{{!object.prop}}`
     * - Inline computed method (supports negation):
     *   `[[compute(a, 'literal', b)]]`, `[[!compute(a, 'literal', b)]]`
     *
     * The default implementation uses a regular expression for best
     * performance. However, the regular expression uses a white-list of
     * allowed characters in a data-binding, which causes problems for
     * data-bindings that do use characters not in this white-list.
     *
     * Instead of updating the white-list with all allowed characters,
     * there is a StrictBindingParser (see lib/mixins/strict-binding-parser)
     * that uses a state machine instead. This state machine is able to handle
     * all characters. However, it is slightly less performant, therefore we
     * extracted it into a separate optional mixin.
     *
     * @param {string} text Text to parse from attribute or textContent
     * @param {Object} templateInfo Current template metadata
     * @return {Array<!BindingPart>} Array of binding part metadata
     * @protected
     * @nocollapse
     */


    static _parseBindings(text, templateInfo) {
      let parts = [];
      let lastIndex = 0;
      let m; // Example: "literal1{{prop}}literal2[[!compute(foo,bar)]]final"
      // Regex matches:
      //        Iteration 1:  Iteration 2:
      // m[1]: '{{'          '[['
      // m[2]: ''            '!'
      // m[3]: 'prop'        'compute(foo,bar)'

      while ((m = bindingRegex.exec(text)) !== null) {
        // Add literal part
        if (m.index > lastIndex) {
          parts.push({
            literal: text.slice(lastIndex, m.index)
          });
        } // Add binding part


        let mode = m[1][0];
        let negate = Boolean(m[2]);
        let source = m[3].trim();
        let customEvent = false,
            notifyEvent = '',
            colon = -1;

        if (mode == '{' && (colon = source.indexOf('::')) > 0) {
          notifyEvent = source.substring(colon + 2);
          source = source.substring(0, colon);
          customEvent = true;
        }

        let signature = parseMethod(source);
        let dependencies = [];

        if (signature) {
          // Inline computed function
          let {
            args,
            methodName
          } = signature;

          for (let i = 0; i < args.length; i++) {
            let arg = args[i];

            if (!arg.literal) {
              dependencies.push(arg);
            }
          }

          let dynamicFns = templateInfo.dynamicFns;

          if (dynamicFns && dynamicFns[methodName] || signature.static) {
            dependencies.push(methodName);
            signature.dynamicFn = true;
          }
        } else {
          // Property or path
          dependencies.push(source);
        }

        parts.push({
          source,
          mode,
          negate,
          customEvent,
          signature,
          dependencies,
          event: notifyEvent
        });
        lastIndex = bindingRegex.lastIndex;
      } // Add a final literal part


      if (lastIndex && lastIndex < text.length) {
        let literal = text.substring(lastIndex);

        if (literal) {
          parts.push({
            literal: literal
          });
        }
      }

      if (parts.length) {
        return parts;
      } else {
        return null;
      }
    }
    /**
     * Called to evaluate a previously parsed binding part based on a set of
     * one or more changed dependencies.
     *
     * @param {!Polymer_PropertyEffects} inst Element that should be used as
     *     scope for binding dependencies
     * @param {BindingPart} part Binding part metadata
     * @param {string} path Property/path that triggered this effect
     * @param {Object} props Bag of current property changes
     * @param {Object} oldProps Bag of previous values for changed properties
     * @param {boolean} hasPaths True with `props` contains one or more paths
     * @return {*} Value the binding part evaluated to
     * @protected
     * @nocollapse
     */


    static _evaluateBinding(inst, part, path, props, oldProps, hasPaths) {
      let value;

      if (part.signature) {
        value = runMethodEffect(inst, path, props, oldProps, part.signature);
      } else if (path != part.source) {
        value = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(inst, part.source);
      } else {
        if (hasPaths && Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["isPath"])(path)) {
          value = Object(_utils_path_js__WEBPACK_IMPORTED_MODULE_3__["get"])(inst, path);
        } else {
          value = inst.__data[path];
        }
      }

      if (part.negate) {
        value = !value;
      }

      return value;
    }

  }

  return PropertyEffects;
});
/**
 * Stack for enqueuing client dom created by a host element.
 *
 * By default elements are flushed via `_flushProperties` when
 * `connectedCallback` is called. Elements attach their client dom to
 * themselves at `ready` time which results from this first flush.
 * This provides an ordering guarantee that the client dom an element
 * creates is flushed before the element itself (i.e. client `ready`
 * fires before host `ready`).
 *
 * However, if `_flushProperties` is called *before* an element is connected,
 * as for example `Templatize` does, this ordering guarantee cannot be
 * satisfied because no elements are connected. (Note: Bound elements that
 * receive data do become enqueued clients and are properly ordered but
 * unbound elements are not.)
 *
 * To maintain the desired "client before host" ordering guarantee for this
 * case we rely on the "host stack. Client nodes registers themselves with
 * the creating host element when created. This ensures that all client dom
 * is readied in the proper order, maintaining the desired guarantee.
 *
 * @private
 */

const hostStack = [];

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/mixins/template-stamp.js":
/*!********************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/mixins/template-stamp.js ***!
  \********************************************************************/
/*! exports provided: TemplateStamp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TemplateStamp", function() { return TemplateStamp; });
/* harmony import */ var _utils_boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/mixin.js */ "./node_modules/@polymer/polymer/lib/utils/mixin.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

 // 1.x backwards-compatible auto-wrapper for template type extensions
// This is a clear layering violation and gives favored-nation status to
// dom-if and dom-repeat templates.  This is a conceit we're choosing to keep
// a.) to ease 1.x backwards-compatibility due to loss of `is`, and
// b.) to maintain if/repeat capability in parser-constrained elements
//     (e.g. table, select) in lieu of native CE type extensions without
//     massive new invention in this space (e.g. directive system)

const templateExtensions = {
  'dom-if': true,
  'dom-repeat': true
};
let placeholderBugDetect = false;
let placeholderBug = false;

function hasPlaceholderBug() {
  if (!placeholderBugDetect) {
    placeholderBugDetect = true;
    const t = document.createElement('textarea');
    t.placeholder = 'a';
    placeholderBug = t.placeholder === t.textContent;
  }

  return placeholderBug;
}
/**
 * Some browsers have a bug with textarea, where placeholder text is copied as
 * a textnode child of the textarea.
 *
 * If the placeholder is a binding, this can break template stamping in two
 * ways.
 *
 * One issue is that when the `placeholder` attribute is removed when the
 * binding is processed, the textnode child of the textarea is deleted, and the
 * template info tries to bind into that node.
 *
 * With `legacyOptimizations` in use, when the template is stamped and the
 * `textarea.textContent` binding is processed, no corresponding node is found
 * because it was removed during parsing. An exception is generated when this
 * binding is updated.
 *
 * With `legacyOptimizations` not in use, the template is cloned before
 * processing and this changes the above behavior. The cloned template also has
 * a value property set to the placeholder and textContent. This prevents the
 * removal of the textContent when the placeholder attribute is removed.
 * Therefore the exception does not occur. However, there is an extra
 * unnecessary binding.
 *
 * @param {!Node} node Check node for placeholder bug
 * @return {void}
 */


function fixPlaceholder(node) {
  if (hasPlaceholderBug() && node.localName === 'textarea' && node.placeholder && node.placeholder === node.textContent) {
    node.textContent = null;
  }
}

function wrapTemplateExtension(node) {
  let is = node.getAttribute('is');

  if (is && templateExtensions[is]) {
    let t = node;
    t.removeAttribute('is');
    node = t.ownerDocument.createElement(is);
    t.parentNode.replaceChild(node, t);
    node.appendChild(t);

    while (t.attributes.length) {
      node.setAttribute(t.attributes[0].name, t.attributes[0].value);
      t.removeAttribute(t.attributes[0].name);
    }
  }

  return node;
}

function findTemplateNode(root, nodeInfo) {
  // recursively ascend tree until we hit root
  let parent = nodeInfo.parentInfo && findTemplateNode(root, nodeInfo.parentInfo); // unwind the stack, returning the indexed node at each level

  if (parent) {
    // note: marginally faster than indexing via childNodes
    // (http://jsperf.com/childnodes-lookup)
    for (let n = parent.firstChild, i = 0; n; n = n.nextSibling) {
      if (nodeInfo.parentIndex === i++) {
        return n;
      }
    }
  } else {
    return root;
  }
} // construct `$` map (from id annotations)


function applyIdToMap(inst, map, node, nodeInfo) {
  if (nodeInfo.id) {
    map[nodeInfo.id] = node;
  }
} // install event listeners (from event annotations)


function applyEventListener(inst, node, nodeInfo) {
  if (nodeInfo.events && nodeInfo.events.length) {
    for (let j = 0, e$ = nodeInfo.events, e; j < e$.length && (e = e$[j]); j++) {
      inst._addMethodEventListenerToNode(node, e.name, e.value, inst);
    }
  }
} // push configuration references at configure time


function applyTemplateInfo(inst, node, nodeInfo, parentTemplateInfo) {
  if (nodeInfo.templateInfo) {
    // Give the node an instance of this templateInfo and set its parent
    node._templateInfo = nodeInfo.templateInfo;
    node._parentTemplateInfo = parentTemplateInfo;
  }
}

function createNodeEventHandler(context, eventName, methodName) {
  // Instances can optionally have a _methodHost which allows redirecting where
  // to find methods. Currently used by `templatize`.
  context = context._methodHost || context;

  let handler = function (e) {
    if (context[methodName]) {
      context[methodName](e, e.detail);
    } else {
      console.warn('listener method `' + methodName + '` not defined');
    }
  };

  return handler;
}
/**
 * Element mixin that provides basic template parsing and stamping, including
 * the following template-related features for stamped templates:
 *
 * - Declarative event listeners (`on-eventname="listener"`)
 * - Map of node id's to stamped node instances (`this.$.id`)
 * - Nested template content caching/removal and re-installation (performance
 *   optimization)
 *
 * @mixinFunction
 * @polymer
 * @summary Element class mixin that provides basic template parsing and stamping
 */


const TemplateStamp = Object(_utils_mixin_js__WEBPACK_IMPORTED_MODULE_1__["dedupingMixin"])(
/**
 * @template T
 * @param {function(new:T)} superClass Class to apply mixin to.
 * @return {function(new:T)} superClass with mixin applied.
 */
superClass => {
  /**
   * @polymer
   * @mixinClass
   * @implements {Polymer_TemplateStamp}
   */
  class TemplateStamp extends superClass {
    /**
     * Scans a template to produce template metadata.
     *
     * Template-specific metadata are stored in the object returned, and node-
     * specific metadata are stored in objects in its flattened `nodeInfoList`
     * array.  Only nodes in the template that were parsed as nodes of
     * interest contain an object in `nodeInfoList`.  Each `nodeInfo` object
     * contains an `index` (`childNodes` index in parent) and optionally
     * `parent`, which points to node info of its parent (including its index).
     *
     * The template metadata object returned from this method has the following
     * structure (many fields optional):
     *
     * ```js
     *   {
     *     // Flattened list of node metadata (for nodes that generated metadata)
     *     nodeInfoList: [
     *       {
     *         // `id` attribute for any nodes with id's for generating `$` map
     *         id: {string},
     *         // `on-event="handler"` metadata
     *         events: [
     *           {
     *             name: {string},   // event name
     *             value: {string},  // handler method name
     *           }, ...
     *         ],
     *         // Notes when the template contained a `<slot>` for shady DOM
     *         // optimization purposes
     *         hasInsertionPoint: {boolean},
     *         // For nested `<template>`` nodes, nested template metadata
     *         templateInfo: {object}, // nested template metadata
     *         // Metadata to allow efficient retrieval of instanced node
     *         // corresponding to this metadata
     *         parentInfo: {number},   // reference to parent nodeInfo>
     *         parentIndex: {number},  // index in parent's `childNodes` collection
     *         infoIndex: {number},    // index of this `nodeInfo` in `templateInfo.nodeInfoList`
     *       },
     *       ...
     *     ],
     *     // When true, the template had the `strip-whitespace` attribute
     *     // or was nested in a template with that setting
     *     stripWhitespace: {boolean},
     *     // For nested templates, nested template content is moved into
     *     // a document fragment stored here; this is an optimization to
     *     // avoid the cost of nested template cloning
     *     content: {DocumentFragment}
     *   }
     * ```
     *
     * This method kicks off a recursive treewalk as follows:
     *
     * ```
     *    _parseTemplate <---------------------+
     *      _parseTemplateContent              |
     *        _parseTemplateNode  <------------|--+
     *          _parseTemplateNestedTemplate --+  |
     *          _parseTemplateChildNodes ---------+
     *          _parseTemplateNodeAttributes
     *            _parseTemplateNodeAttribute
     *
     * ```
     *
     * These methods may be overridden to add custom metadata about templates
     * to either `templateInfo` or `nodeInfo`.
     *
     * Note that this method may be destructive to the template, in that
     * e.g. event annotations may be removed after being noted in the
     * template metadata.
     *
     * @param {!HTMLTemplateElement} template Template to parse
     * @param {TemplateInfo=} outerTemplateInfo Template metadata from the outer
     *   template, for parsing nested templates
     * @return {!TemplateInfo} Parsed template metadata
     * @nocollapse
     */
    static _parseTemplate(template, outerTemplateInfo) {
      // since a template may be re-used, memo-ize metadata
      if (!template._templateInfo) {
        // TODO(rictic): fix typing
        let
        /** ? */
        templateInfo = template._templateInfo = {};
        templateInfo.nodeInfoList = [];
        templateInfo.nestedTemplate = Boolean(outerTemplateInfo);
        templateInfo.stripWhiteSpace = outerTemplateInfo && outerTemplateInfo.stripWhiteSpace || template.hasAttribute('strip-whitespace'); // TODO(rictic): fix typing

        this._parseTemplateContent(template, templateInfo,
        /** @type {?} */
        {
          parent: null
        });
      }

      return template._templateInfo;
    }
    /**
     * See docs for _parseTemplateNode.
     *
     * @param {!HTMLTemplateElement} template .
     * @param {!TemplateInfo} templateInfo .
     * @param {!NodeInfo} nodeInfo .
     * @return {boolean} .
     * @nocollapse
     */


    static _parseTemplateContent(template, templateInfo, nodeInfo) {
      return this._parseTemplateNode(template.content, templateInfo, nodeInfo);
    }
    /**
     * Parses template node and adds template and node metadata based on
     * the current node, and its `childNodes` and `attributes`.
     *
     * This method may be overridden to add custom node or template specific
     * metadata based on this node.
     *
     * @param {Node} node Node to parse
     * @param {!TemplateInfo} templateInfo Template metadata for current template
     * @param {!NodeInfo} nodeInfo Node metadata for current template.
     * @return {boolean} `true` if the visited node added node-specific
     *   metadata to `nodeInfo`
     * @nocollapse
     */


    static _parseTemplateNode(node, templateInfo, nodeInfo) {
      let noted = false;
      let element =
      /** @type {!HTMLTemplateElement} */
      node;

      if (element.localName == 'template' && !element.hasAttribute('preserve-content')) {
        noted = this._parseTemplateNestedTemplate(element, templateInfo, nodeInfo) || noted;
      } else if (element.localName === 'slot') {
        // For ShadyDom optimization, indicating there is an insertion point
        templateInfo.hasInsertionPoint = true;
      }

      fixPlaceholder(element);

      if (element.firstChild) {
        this._parseTemplateChildNodes(element, templateInfo, nodeInfo);
      }

      if (element.hasAttributes && element.hasAttributes()) {
        noted = this._parseTemplateNodeAttributes(element, templateInfo, nodeInfo) || noted;
      } // Checking `nodeInfo.noted` allows a child node of this node (who gets
      // access to `parentInfo`) to cause the parent to be noted, which
      // otherwise has no return path via `_parseTemplateChildNodes` (used by
      // some optimizations)


      return noted || nodeInfo.noted;
    }
    /**
     * Parses template child nodes for the given root node.
     *
     * This method also wraps whitelisted legacy template extensions
     * (`is="dom-if"` and `is="dom-repeat"`) with their equivalent element
     * wrappers, collapses text nodes, and strips whitespace from the template
     * if the `templateInfo.stripWhitespace` setting was provided.
     *
     * @param {Node} root Root node whose `childNodes` will be parsed
     * @param {!TemplateInfo} templateInfo Template metadata for current template
     * @param {!NodeInfo} nodeInfo Node metadata for current template.
     * @return {void}
     */


    static _parseTemplateChildNodes(root, templateInfo, nodeInfo) {
      if (root.localName === 'script' || root.localName === 'style') {
        return;
      }

      for (let node = root.firstChild, parentIndex = 0, next; node; node = next) {
        // Wrap templates
        if (node.localName == 'template') {
          node = wrapTemplateExtension(node);
        } // collapse adjacent textNodes: fixes an IE issue that can cause
        // text nodes to be inexplicably split =(
        // note that root.normalize() should work but does not so we do this
        // manually.


        next = node.nextSibling;

        if (node.nodeType === Node.TEXT_NODE) {
          let
          /** Node */
          n = next;

          while (n && n.nodeType === Node.TEXT_NODE) {
            node.textContent += n.textContent;
            next = n.nextSibling;
            root.removeChild(n);
            n = next;
          } // optionally strip whitespace


          if (templateInfo.stripWhiteSpace && !node.textContent.trim()) {
            root.removeChild(node);
            continue;
          }
        }

        let childInfo =
        /** @type {!NodeInfo} */
        {
          parentIndex,
          parentInfo: nodeInfo
        };

        if (this._parseTemplateNode(node, templateInfo, childInfo)) {
          childInfo.infoIndex = templateInfo.nodeInfoList.push(childInfo) - 1;
        } // Increment if not removed


        if (node.parentNode) {
          parentIndex++;
        }
      }
    }
    /**
     * Parses template content for the given nested `<template>`.
     *
     * Nested template info is stored as `templateInfo` in the current node's
     * `nodeInfo`. `template.content` is removed and stored in `templateInfo`.
     * It will then be the responsibility of the host to set it back to the
     * template and for users stamping nested templates to use the
     * `_contentForTemplate` method to retrieve the content for this template
     * (an optimization to avoid the cost of cloning nested template content).
     *
     * @param {HTMLTemplateElement} node Node to parse (a <template>)
     * @param {TemplateInfo} outerTemplateInfo Template metadata for current template
     *   that includes the template `node`
     * @param {!NodeInfo} nodeInfo Node metadata for current template.
     * @return {boolean} `true` if the visited node added node-specific
     *   metadata to `nodeInfo`
     * @nocollapse
     */


    static _parseTemplateNestedTemplate(node, outerTemplateInfo, nodeInfo) {
      // TODO(rictic): the type of node should be non-null
      let element =
      /** @type {!HTMLTemplateElement} */
      node;

      let templateInfo = this._parseTemplate(element, outerTemplateInfo);

      let content = templateInfo.content = element.content.ownerDocument.createDocumentFragment();
      content.appendChild(element.content);
      nodeInfo.templateInfo = templateInfo;
      return true;
    }
    /**
     * Parses template node attributes and adds node metadata to `nodeInfo`
     * for nodes of interest.
     *
     * @param {Element} node Node to parse
     * @param {!TemplateInfo} templateInfo Template metadata for current
     *     template
     * @param {!NodeInfo} nodeInfo Node metadata for current template.
     * @return {boolean} `true` if the visited node added node-specific
     *   metadata to `nodeInfo`
     * @nocollapse
     */


    static _parseTemplateNodeAttributes(node, templateInfo, nodeInfo) {
      // Make copy of original attribute list, since the order may change
      // as attributes are added and removed
      let noted = false;
      let attrs = Array.from(node.attributes);

      for (let i = attrs.length - 1, a; a = attrs[i]; i--) {
        noted = this._parseTemplateNodeAttribute(node, templateInfo, nodeInfo, a.name, a.value) || noted;
      }

      return noted;
    }
    /**
     * Parses a single template node attribute and adds node metadata to
     * `nodeInfo` for attributes of interest.
     *
     * This implementation adds metadata for `on-event="handler"` attributes
     * and `id` attributes.
     *
     * @param {Element} node Node to parse
     * @param {!TemplateInfo} templateInfo Template metadata for current template
     * @param {!NodeInfo} nodeInfo Node metadata for current template.
     * @param {string} name Attribute name
     * @param {string} value Attribute value
     * @return {boolean} `true` if the visited node added node-specific
     *   metadata to `nodeInfo`
     * @nocollapse
     */


    static _parseTemplateNodeAttribute(node, templateInfo, nodeInfo, name, value) {
      // events (on-*)
      if (name.slice(0, 3) === 'on-') {
        node.removeAttribute(name);
        nodeInfo.events = nodeInfo.events || [];
        nodeInfo.events.push({
          name: name.slice(3),
          value
        });
        return true;
      } // static id
      else if (name === 'id') {
          nodeInfo.id = value;
          return true;
        }

      return false;
    }
    /**
     * Returns the `content` document fragment for a given template.
     *
     * For nested templates, Polymer performs an optimization to cache nested
     * template content to avoid the cost of cloning deeply nested templates.
     * This method retrieves the cached content for a given template.
     *
     * @param {HTMLTemplateElement} template Template to retrieve `content` for
     * @return {DocumentFragment} Content fragment
     * @nocollapse
     */


    static _contentForTemplate(template) {
      let templateInfo =
      /** @type {HTMLTemplateElementWithInfo} */
      template._templateInfo;
      return templateInfo && templateInfo.content || template.content;
    }
    /**
     * Clones the provided template content and returns a document fragment
     * containing the cloned dom.
     *
     * The template is parsed (once and memoized) using this library's
     * template parsing features, and provides the following value-added
     * features:
     * * Adds declarative event listeners for `on-event="handler"` attributes
     * * Generates an "id map" for all nodes with id's under `$` on returned
     *   document fragment
     * * Passes template info including `content` back to templates as
     *   `_templateInfo` (a performance optimization to avoid deep template
     *   cloning)
     *
     * Note that the memoized template parsing process is destructive to the
     * template: attributes for bindings and declarative event listeners are
     * removed after being noted in notes, and any nested `<template>.content`
     * is removed and stored in notes as well.
     *
     * @param {!HTMLTemplateElement} template Template to stamp
     * @param {TemplateInfo=} templateInfo Optional template info associated
     *   with the template to be stamped; if omitted the template will be
     *   automatically parsed.
     * @return {!StampedTemplate} Cloned template content
     * @override
     */


    _stampTemplate(template, templateInfo) {
      // Polyfill support: bootstrap the template if it has not already been
      if (template && !template.content && window.HTMLTemplateElement && HTMLTemplateElement.decorate) {
        HTMLTemplateElement.decorate(template);
      } // Accepting the `templateInfo` via an argument allows for creating
      // instances of the `templateInfo` by the caller, useful for adding
      // instance-time information to the prototypical data


      templateInfo = templateInfo || this.constructor._parseTemplate(template);
      let nodeInfo = templateInfo.nodeInfoList;
      let content = templateInfo.content || template.content;
      let dom =
      /** @type {DocumentFragment} */
      document.importNode(content, true); // NOTE: ShadyDom optimization indicating there is an insertion point

      dom.__noInsertionPoint = !templateInfo.hasInsertionPoint;
      let nodes = dom.nodeList = new Array(nodeInfo.length);
      dom.$ = {};

      for (let i = 0, l = nodeInfo.length, info; i < l && (info = nodeInfo[i]); i++) {
        let node = nodes[i] = findTemplateNode(dom, info);
        applyIdToMap(this, dom.$, node, info);
        applyTemplateInfo(this, node, info, templateInfo);
        applyEventListener(this, node, info);
      }

      dom =
      /** @type {!StampedTemplate} */
      dom; // eslint-disable-line no-self-assign

      return dom;
    }
    /**
     * Adds an event listener by method name for the event provided.
     *
     * This method generates a handler function that looks up the method
     * name at handling time.
     *
     * @param {!EventTarget} node Node to add listener on
     * @param {string} eventName Name of event
     * @param {string} methodName Name of method
     * @param {*=} context Context the method will be called on (defaults
     *   to `node`)
     * @return {Function} Generated handler function
     * @override
     */


    _addMethodEventListenerToNode(node, eventName, methodName, context) {
      context = context || node;
      let handler = createNodeEventHandler(context, eventName, methodName);

      this._addEventListenerToNode(node, eventName, handler);

      return handler;
    }
    /**
     * Override point for adding custom or simulated event handling.
     *
     * @param {!EventTarget} node Node to add event listener to
     * @param {string} eventName Name of event
     * @param {function(!Event):void} handler Listener function to add
     * @return {void}
     * @override
     */


    _addEventListenerToNode(node, eventName, handler) {
      node.addEventListener(eventName, handler);
    }
    /**
     * Override point for adding custom or simulated event handling.
     *
     * @param {!EventTarget} node Node to remove event listener from
     * @param {string} eventName Name of event
     * @param {function(!Event):void} handler Listener function to remove
     * @return {void}
     * @override
     */


    _removeEventListenerFromNode(node, eventName, handler) {
      node.removeEventListener(eventName, handler);
    }

  }

  return TemplateStamp;
});

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/async.js":
/*!**********************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/async.js ***!
  \**********************************************************/
/*! exports provided: timeOut, animationFrame, idlePeriod, microTask */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timeOut", function() { return timeOut; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "animationFrame", function() { return animationFrame; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "idlePeriod", function() { return idlePeriod; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "microTask", function() { return microTask; });
/* harmony import */ var _boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * @fileoverview
 *
 * This module provides a number of strategies for enqueuing asynchronous
 * tasks. Each sub-module provides a standard `run(fn)` interface that returns a
 * handle, and a `cancel(handle)` interface for canceling async tasks before
 * they run.
 *
 * @summary Module that provides a number of strategies for enqueuing
 * asynchronous tasks.
 */
 // Microtask implemented using Mutation Observer

let microtaskCurrHandle = 0;
let microtaskLastHandle = 0;
let microtaskCallbacks = [];
let microtaskNodeContent = 0;
let microtaskScheduled = false;
let microtaskNode = document.createTextNode('');
new window.MutationObserver(microtaskFlush).observe(microtaskNode, {
  characterData: true
});

function microtaskFlush() {
  microtaskScheduled = false;
  const len = microtaskCallbacks.length;

  for (let i = 0; i < len; i++) {
    let cb = microtaskCallbacks[i];

    if (cb) {
      try {
        cb();
      } catch (e) {
        setTimeout(() => {
          throw e;
        });
      }
    }
  }

  microtaskCallbacks.splice(0, len);
  microtaskLastHandle += len;
}
/**
 * Async interface wrapper around `setTimeout`.
 *
 * @namespace
 * @summary Async interface wrapper around `setTimeout`.
 */


const timeOut = {
  /**
   * Returns a sub-module with the async interface providing the provided
   * delay.
   *
   * @memberof timeOut
   * @param {number=} delay Time to wait before calling callbacks in ms
   * @return {!AsyncInterface} An async timeout interface
   */
  after(delay) {
    return {
      run(fn) {
        return window.setTimeout(fn, delay);
      },

      cancel(handle) {
        window.clearTimeout(handle);
      }

    };
  },

  /**
   * Enqueues a function called in the next task.
   *
   * @memberof timeOut
   * @param {!Function} fn Callback to run
   * @param {number=} delay Delay in milliseconds
   * @return {number} Handle used for canceling task
   */
  run(fn, delay) {
    return window.setTimeout(fn, delay);
  },

  /**
   * Cancels a previously enqueued `timeOut` callback.
   *
   * @memberof timeOut
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */
  cancel(handle) {
    window.clearTimeout(handle);
  }

};

/**
 * Async interface wrapper around `requestAnimationFrame`.
 *
 * @namespace
 * @summary Async interface wrapper around `requestAnimationFrame`.
 */

const animationFrame = {
  /**
   * Enqueues a function called at `requestAnimationFrame` timing.
   *
   * @memberof animationFrame
   * @param {function(number):void} fn Callback to run
   * @return {number} Handle used for canceling task
   */
  run(fn) {
    return window.requestAnimationFrame(fn);
  },

  /**
   * Cancels a previously enqueued `animationFrame` callback.
   *
   * @memberof animationFrame
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */
  cancel(handle) {
    window.cancelAnimationFrame(handle);
  }

};

/**
 * Async interface wrapper around `requestIdleCallback`.  Falls back to
 * `setTimeout` on browsers that do not support `requestIdleCallback`.
 *
 * @namespace
 * @summary Async interface wrapper around `requestIdleCallback`.
 */

const idlePeriod = {
  /**
   * Enqueues a function called at `requestIdleCallback` timing.
   *
   * @memberof idlePeriod
   * @param {function(!IdleDeadline):void} fn Callback to run
   * @return {number} Handle used for canceling task
   */
  run(fn) {
    return window.requestIdleCallback ? window.requestIdleCallback(fn) : window.setTimeout(fn, 16);
  },

  /**
   * Cancels a previously enqueued `idlePeriod` callback.
   *
   * @memberof idlePeriod
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */
  cancel(handle) {
    window.cancelIdleCallback ? window.cancelIdleCallback(handle) : window.clearTimeout(handle);
  }

};

/**
 * Async interface for enqueuing callbacks that run at microtask timing.
 *
 * Note that microtask timing is achieved via a single `MutationObserver`,
 * and thus callbacks enqueued with this API will all run in a single
 * batch, and not interleaved with other microtasks such as promises.
 * Promises are avoided as an implementation choice for the time being
 * due to Safari bugs that cause Promises to lack microtask guarantees.
 *
 * @namespace
 * @summary Async interface for enqueuing callbacks that run at microtask
 *   timing.
 */

const microTask = {
  /**
   * Enqueues a function called at microtask timing.
   *
   * @memberof microTask
   * @param {!Function=} callback Callback to run
   * @return {number} Handle used for canceling task
   */
  run(callback) {
    if (!microtaskScheduled) {
      microtaskScheduled = true;
      microtaskNode.textContent = microtaskNodeContent++;
    }

    microtaskCallbacks.push(callback);
    return microtaskCurrHandle++;
  },

  /**
   * Cancels a previously enqueued `microTask` callback.
   *
   * @memberof microTask
   * @param {number} handle Handle returned from `run` of callback to cancel
   * @return {void}
   */
  cancel(handle) {
    const idx = handle - microtaskLastHandle;

    if (idx >= 0) {
      if (!microtaskCallbacks[idx]) {
        throw new Error('invalid async handle: ' + handle);
      }

      microtaskCallbacks[idx] = null;
    }
  }

};


/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/boot.js":
/*!*********************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/boot.js ***!
  \*********************************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/* eslint-disable no-unused-vars */

/**
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is replaced by the munged name for object[property]
 * We cannot alias this function, so we have to use a small shim that has the same behavior when not compiling.
 *
 * @param {?} prop Property name
 * @param {*} obj Reference object
 * @return {string} Potentially renamed property name
 */
window.JSCompiler_renameProperty = function (prop, obj) {
  return prop;
};
/* eslint-enable */




/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/case-map.js":
/*!*************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/case-map.js ***!
  \*************************************************************/
/*! exports provided: dashToCamelCase, camelToDashCase */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dashToCamelCase", function() { return dashToCamelCase; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "camelToDashCase", function() { return camelToDashCase; });
/* harmony import */ var _boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

const caseMap = {};
const DASH_TO_CAMEL = /-[a-z]/g;
const CAMEL_TO_DASH = /([A-Z])/g;
/**
 * @fileoverview Module with utilities for converting between "dash-case" and
 * "camelCase" identifiers.
 */

/**
 * Converts "dash-case" identifier (e.g. `foo-bar-baz`) to "camelCase"
 * (e.g. `fooBarBaz`).
 *
 * @param {string} dash Dash-case identifier
 * @return {string} Camel-case representation of the identifier
 */

function dashToCamelCase(dash) {
  return caseMap[dash] || (caseMap[dash] = dash.indexOf('-') < 0 ? dash : dash.replace(DASH_TO_CAMEL, m => m[1].toUpperCase()));
}
/**
 * Converts "camelCase" identifier (e.g. `fooBarBaz`) to "dash-case"
 * (e.g. `foo-bar-baz`).
 *
 * @param {string} camel Camel-case identifier
 * @return {string} Dash-case representation of the identifier
 */

function camelToDashCase(camel) {
  return caseMap[camel] || (caseMap[camel] = camel.replace(CAMEL_TO_DASH, '-$1').toLowerCase());
}

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/html-tag.js":
/*!*************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/html-tag.js ***!
  \*************************************************************/
/*! exports provided: html, htmlLiteral */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "html", function() { return html; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "htmlLiteral", function() { return htmlLiteral; });
/* harmony import */ var _boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Class representing a static string value which can be used to filter
 * strings by asseting that they have been created via this class. The
 * `value` property returns the string passed to the constructor.
 */

class LiteralString {
  constructor(string) {
    /** @type {string} */
    this.value = string.toString();
  }
  /**
   * @return {string} LiteralString string value
   * @override
   */


  toString() {
    return this.value;
  }

}
/**
 * @param {*} value Object to stringify into HTML
 * @return {string} HTML stringified form of `obj`
 */


function literalValue(value) {
  if (value instanceof LiteralString) {
    return (
      /** @type {!LiteralString} */
      value.value
    );
  } else {
    throw new Error(`non-literal value passed to Polymer's htmlLiteral function: ${value}`);
  }
}
/**
 * @param {*} value Object to stringify into HTML
 * @return {string} HTML stringified form of `obj`
 */


function htmlValue(value) {
  if (value instanceof HTMLTemplateElement) {
    return (
      /** @type {!HTMLTemplateElement } */
      value.innerHTML
    );
  } else if (value instanceof LiteralString) {
    return literalValue(value);
  } else {
    throw new Error(`non-template value passed to Polymer's html function: ${value}`);
  }
}
/**
 * A template literal tag that creates an HTML <template> element from the
 * contents of the string.
 *
 * This allows you to write a Polymer Template in JavaScript.
 *
 * Templates can be composed by interpolating `HTMLTemplateElement`s in
 * expressions in the JavaScript template literal. The nested template's
 * `innerHTML` is included in the containing template.  The only other
 * values allowed in expressions are those returned from `htmlLiteral`
 * which ensures only literal values from JS source ever reach the HTML, to
 * guard against XSS risks.
 *
 * All other values are disallowed in expressions to help prevent XSS
 * attacks; however, `htmlLiteral` can be used to compose static
 * string values into templates. This is useful to compose strings into
 * places that do not accept html, like the css text of a `style`
 * element.
 *
 * Example:
 *
 *     static get template() {
 *       return html`
 *         <style>:host{ content:"..." }</style>
 *         <div class="shadowed">${this.partialTemplate}</div>
 *         ${super.template}
 *       `;
 *     }
 *     static get partialTemplate() { return html`<span>Partial!</span>`; }
 *
 * @param {!ITemplateArray} strings Constant parts of tagged template literal
 * @param {...*} values Variable parts of tagged template literal
 * @return {!HTMLTemplateElement} Constructed HTMLTemplateElement
 */


const html = function html(strings, ...values) {
  const template =
  /** @type {!HTMLTemplateElement} */
  document.createElement('template');
  template.innerHTML = values.reduce((acc, v, idx) => acc + htmlValue(v) + strings[idx + 1], strings[0]);
  return template;
};
/**
 * An html literal tag that can be used with `html` to compose.
 * a literal string.
 *
 * Example:
 *
 *     static get template() {
 *       return html`
 *         <style>
 *           :host { display: block; }
 *           ${this.styleTemplate()}
 *         </style>
 *         <div class="shadowed">${staticValue}</div>
 *         ${super.template}
 *       `;
 *     }
 *     static get styleTemplate() {
 *        return htmlLiteral`.shadowed { background: gray; }`;
 *     }
 *
 * @param {!ITemplateArray} strings Constant parts of tagged template literal
 * @param {...*} values Variable parts of tagged template literal
 * @return {!LiteralString} Constructed literal string
 */

const htmlLiteral = function (strings, ...values) {
  return new LiteralString(values.reduce((acc, v, idx) => acc + literalValue(v) + strings[idx + 1], strings[0]));
};

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/mixin.js":
/*!**********************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/mixin.js ***!
  \**********************************************************/
/*! exports provided: dedupingMixin */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dedupingMixin", function() { return dedupingMixin; });
/* harmony import */ var _boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
 // unique global id for deduping mixins.

let dedupeId = 0;
/**
 * @constructor
 * @extends {Function}
 * @private
 */

function MixinFunction() {}
/** @type {(WeakMap | undefined)} */


MixinFunction.prototype.__mixinApplications;
/** @type {(Object | undefined)} */

MixinFunction.prototype.__mixinSet;
/* eslint-disable valid-jsdoc */

/**
 * Wraps an ES6 class expression mixin such that the mixin is only applied
 * if it has not already been applied its base argument. Also memoizes mixin
 * applications.
 *
 * @template T
 * @param {T} mixin ES6 class expression mixin to wrap
 * @return {T}
 * @suppress {invalidCasts}
 */

const dedupingMixin = function (mixin) {
  let mixinApplications =
  /** @type {!MixinFunction} */
  mixin.__mixinApplications;

  if (!mixinApplications) {
    mixinApplications = new WeakMap();
    /** @type {!MixinFunction} */

    mixin.__mixinApplications = mixinApplications;
  } // maintain a unique id for each mixin


  let mixinDedupeId = dedupeId++;

  function dedupingMixin(base) {
    let baseSet =
    /** @type {!MixinFunction} */
    base.__mixinSet;

    if (baseSet && baseSet[mixinDedupeId]) {
      return base;
    }

    let map = mixinApplications;
    let extended = map.get(base);

    if (!extended) {
      extended =
      /** @type {!Function} */
      mixin(base);
      map.set(base, extended); // copy inherited mixin set from the extended class, or the base class
      // NOTE: we avoid use of Set here because some browser (IE11)
      // cannot extend a base Set via the constructor.

      let mixinSet = Object.create(
      /** @type {!MixinFunction} */
      extended.__mixinSet || baseSet || null);
      mixinSet[mixinDedupeId] = true;
      /** @type {!MixinFunction} */

      extended.__mixinSet = mixinSet;
    }

    return extended;
  }

  return dedupingMixin;
};
/* eslint-enable valid-jsdoc */

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/path.js":
/*!*********************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/path.js ***!
  \*********************************************************/
/*! exports provided: isPath, root, isAncestor, isDescendant, translate, matches, normalize, split, get, set, isDeep */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isPath", function() { return isPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "root", function() { return root; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isAncestor", function() { return isAncestor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDescendant", function() { return isDescendant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "translate", function() { return translate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "matches", function() { return matches; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "normalize", function() { return normalize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "split", function() { return split; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "get", function() { return get; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "set", function() { return set; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDeep", function() { return isDeep; });
/* harmony import */ var _boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Module with utilities for manipulating structured data path strings.
 *
 * @summary Module with utilities for manipulating structured data path strings.
 */

/**
 * Returns true if the given string is a structured data path (has dots).
 *
 * Example:
 *
 * ```
 * isPath('foo.bar.baz') // true
 * isPath('foo')         // false
 * ```
 *
 * @param {string} path Path string
 * @return {boolean} True if the string contained one or more dots
 */

function isPath(path) {
  return path.indexOf('.') >= 0;
}
/**
 * Returns the root property name for the given path.
 *
 * Example:
 *
 * ```
 * root('foo.bar.baz') // 'foo'
 * root('foo')         // 'foo'
 * ```
 *
 * @param {string} path Path string
 * @return {string} Root property name
 */

function root(path) {
  let dotIndex = path.indexOf('.');

  if (dotIndex === -1) {
    return path;
  }

  return path.slice(0, dotIndex);
}
/**
 * Given `base` is `foo.bar`, `foo` is an ancestor, `foo.bar` is not
 * Returns true if the given path is an ancestor of the base path.
 *
 * Example:
 *
 * ```
 * isAncestor('foo.bar', 'foo')         // true
 * isAncestor('foo.bar', 'foo.bar')     // false
 * isAncestor('foo.bar', 'foo.bar.baz') // false
 * ```
 *
 * @param {string} base Path string to test against.
 * @param {string} path Path string to test.
 * @return {boolean} True if `path` is an ancestor of `base`.
 */

function isAncestor(base, path) {
  //     base.startsWith(path + '.');
  return base.indexOf(path + '.') === 0;
}
/**
 * Given `base` is `foo.bar`, `foo.bar.baz` is an descendant
 *
 * Example:
 *
 * ```
 * isDescendant('foo.bar', 'foo.bar.baz') // true
 * isDescendant('foo.bar', 'foo.bar')     // false
 * isDescendant('foo.bar', 'foo')         // false
 * ```
 *
 * @param {string} base Path string to test against.
 * @param {string} path Path string to test.
 * @return {boolean} True if `path` is a descendant of `base`.
 */

function isDescendant(base, path) {
  //     path.startsWith(base + '.');
  return path.indexOf(base + '.') === 0;
}
/**
 * Replaces a previous base path with a new base path, preserving the
 * remainder of the path.
 *
 * User must ensure `path` has a prefix of `base`.
 *
 * Example:
 *
 * ```
 * translate('foo.bar', 'zot', 'foo.bar.baz') // 'zot.baz'
 * ```
 *
 * @param {string} base Current base string to remove
 * @param {string} newBase New base string to replace with
 * @param {string} path Path to translate
 * @return {string} Translated string
 */

function translate(base, newBase, path) {
  return newBase + path.slice(base.length);
}
/**
 * @param {string} base Path string to test against
 * @param {string} path Path string to test
 * @return {boolean} True if `path` is equal to `base`
 */

function matches(base, path) {
  return base === path || isAncestor(base, path) || isDescendant(base, path);
}
/**
 * Converts array-based paths to flattened path.  String-based paths
 * are returned as-is.
 *
 * Example:
 *
 * ```
 * normalize(['foo.bar', 0, 'baz'])  // 'foo.bar.0.baz'
 * normalize('foo.bar.0.baz')        // 'foo.bar.0.baz'
 * ```
 *
 * @param {string | !Array<string|number>} path Input path
 * @return {string} Flattened path
 */

function normalize(path) {
  if (Array.isArray(path)) {
    let parts = [];

    for (let i = 0; i < path.length; i++) {
      let args = path[i].toString().split('.');

      for (let j = 0; j < args.length; j++) {
        parts.push(args[j]);
      }
    }

    return parts.join('.');
  } else {
    return path;
  }
}
/**
 * Splits a path into an array of property names. Accepts either arrays
 * of path parts or strings.
 *
 * Example:
 *
 * ```
 * split(['foo.bar', 0, 'baz'])  // ['foo', 'bar', '0', 'baz']
 * split('foo.bar.0.baz')        // ['foo', 'bar', '0', 'baz']
 * ```
 *
 * @param {string | !Array<string|number>} path Input path
 * @return {!Array<string>} Array of path parts
 * @suppress {checkTypes}
 */

function split(path) {
  if (Array.isArray(path)) {
    return normalize(path).split('.');
  }

  return path.toString().split('.');
}
/**
 * Reads a value from a path.  If any sub-property in the path is `undefined`,
 * this method returns `undefined` (will never throw.
 *
 * @param {Object} root Object from which to dereference path from
 * @param {string | !Array<string|number>} path Path to read
 * @param {Object=} info If an object is provided to `info`, the normalized
 *  (flattened) path will be set to `info.path`.
 * @return {*} Value at path, or `undefined` if the path could not be
 *  fully dereferenced.
 */

function get(root, path, info) {
  let prop = root;
  let parts = split(path); // Loop over path parts[0..n-1] and dereference

  for (let i = 0; i < parts.length; i++) {
    if (!prop) {
      return;
    }

    let part = parts[i];
    prop = prop[part];
  }

  if (info) {
    info.path = parts.join('.');
  }

  return prop;
}
/**
 * Sets a value to a path.  If any sub-property in the path is `undefined`,
 * this method will no-op.
 *
 * @param {Object} root Object from which to dereference path from
 * @param {string | !Array<string|number>} path Path to set
 * @param {*} value Value to set to path
 * @return {string | undefined} The normalized version of the input path
 */

function set(root, path, value) {
  let prop = root;
  let parts = split(path);
  let last = parts[parts.length - 1];

  if (parts.length > 1) {
    // Loop over path parts[0..n-2] and dereference
    for (let i = 0; i < parts.length - 1; i++) {
      let part = parts[i];
      prop = prop[part];

      if (!prop) {
        return;
      }
    } // Set value to object at end of path


    prop[last] = value;
  } else {
    // Simple property set
    prop[path] = value;
  }

  return parts.join('.');
}
/**
 * Returns true if the given string is a structured data path (has dots).
 *
 * This function is deprecated.  Use `isPath` instead.
 *
 * Example:
 *
 * ```
 * isDeep('foo.bar.baz') // true
 * isDeep('foo')         // false
 * ```
 *
 * @deprecated
 * @param {string} path Path string
 * @return {boolean} True if the string contained one or more dots
 */

const isDeep = isPath;

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/resolve-url.js":
/*!****************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/resolve-url.js ***!
  \****************************************************************/
/*! exports provided: resolveUrl, resolveCss, pathFromUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resolveUrl", function() { return resolveUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resolveCss", function() { return resolveCss; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pathFromUrl", function() { return pathFromUrl; });
/* harmony import */ var _boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

let CSS_URL_RX = /(url\()([^)]*)(\))/g;
let ABS_URL = /(^\/[^\/])|(^#)|(^[\w-\d]*:)/;
let workingURL;
let resolveDoc;
/**
 * Resolves the given URL against the provided `baseUri'.
 *
 * Note that this function performs no resolution for URLs that start
 * with `/` (absolute URLs) or `#` (hash identifiers).  For general purpose
 * URL resolution, use `window.URL`.
 *
 * @param {string} url Input URL to resolve
 * @param {?string=} baseURI Base URI to resolve the URL against
 * @return {string} resolved URL
 */

function resolveUrl(url, baseURI) {
  if (url && ABS_URL.test(url)) {
    return url;
  }

  if (url === '//') {
    return url;
  } // Lazy feature detection.


  if (workingURL === undefined) {
    workingURL = false;

    try {
      const u = new URL('b', 'http://a');
      u.pathname = 'c%20d';
      workingURL = u.href === 'http://a/c%20d';
    } catch (e) {// silently fail
    }
  }

  if (!baseURI) {
    baseURI = document.baseURI || window.location.href;
  }

  if (workingURL) {
    try {
      return new URL(url, baseURI).href;
    } catch (e) {
      // Bad url or baseURI structure. Do not attempt to resolve.
      return url;
    }
  } // Fallback to creating an anchor into a disconnected document.


  if (!resolveDoc) {
    resolveDoc = document.implementation.createHTMLDocument('temp');
    resolveDoc.base = resolveDoc.createElement('base');
    resolveDoc.head.appendChild(resolveDoc.base);
    resolveDoc.anchor = resolveDoc.createElement('a');
    resolveDoc.body.appendChild(resolveDoc.anchor);
  }

  resolveDoc.base.href = baseURI;
  resolveDoc.anchor.href = url;
  return resolveDoc.anchor.href || url;
}
/**
 * Resolves any relative URL's in the given CSS text against the provided
 * `ownerDocument`'s `baseURI`.
 *
 * @param {string} cssText CSS text to process
 * @param {string} baseURI Base URI to resolve the URL against
 * @return {string} Processed CSS text with resolved URL's
 */

function resolveCss(cssText, baseURI) {
  return cssText.replace(CSS_URL_RX, function (m, pre, url, post) {
    return pre + '\'' + resolveUrl(url.replace(/["']/g, ''), baseURI) + '\'' + post;
  });
}
/**
 * Returns a path from a given `url`. The path includes the trailing
 * `/` from the url.
 *
 * @param {string} url Input URL to transform
 * @return {string} resolved path
 */

function pathFromUrl(url) {
  return url.substring(0, url.lastIndexOf('/') + 1);
}

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/settings.js":
/*!*************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/settings.js ***!
  \*************************************************************/
/*! exports provided: useShadow, useNativeCSSProperties, useNativeCustomElements, supportsAdoptingStyleSheets, rootPath, setRootPath, sanitizeDOMValue, setSanitizeDOMValue, getSanitizeDOMValue, passiveTouchGestures, setPassiveTouchGestures, strictTemplatePolicy, setStrictTemplatePolicy, allowTemplateFromDomModule, setAllowTemplateFromDomModule, legacyOptimizations, setLegacyOptimizations, legacyWarnings, setLegacyWarnings, syncInitialRender, setSyncInitialRender, legacyUndefined, setLegacyUndefined, orderedComputed, setOrderedComputed, cancelSyntheticClickEvents, setCancelSyntheticClickEvents, removeNestedTemplates, setRemoveNestedTemplates, fastDomIf, setFastDomIf, suppressTemplateNotifications, setSuppressTemplateNotifications, legacyNoObservedAttributes, setLegacyNoObservedAttributes, useAdoptedStyleSheetsWithBuiltCSS, setUseAdoptedStyleSheetsWithBuiltCSS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useShadow", function() { return useShadow; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useNativeCSSProperties", function() { return useNativeCSSProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useNativeCustomElements", function() { return useNativeCustomElements; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportsAdoptingStyleSheets", function() { return supportsAdoptingStyleSheets; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rootPath", function() { return rootPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setRootPath", function() { return setRootPath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sanitizeDOMValue", function() { return sanitizeDOMValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setSanitizeDOMValue", function() { return setSanitizeDOMValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSanitizeDOMValue", function() { return getSanitizeDOMValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "passiveTouchGestures", function() { return passiveTouchGestures; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setPassiveTouchGestures", function() { return setPassiveTouchGestures; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "strictTemplatePolicy", function() { return strictTemplatePolicy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setStrictTemplatePolicy", function() { return setStrictTemplatePolicy; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "allowTemplateFromDomModule", function() { return allowTemplateFromDomModule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAllowTemplateFromDomModule", function() { return setAllowTemplateFromDomModule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "legacyOptimizations", function() { return legacyOptimizations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLegacyOptimizations", function() { return setLegacyOptimizations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "legacyWarnings", function() { return legacyWarnings; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLegacyWarnings", function() { return setLegacyWarnings; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "syncInitialRender", function() { return syncInitialRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setSyncInitialRender", function() { return setSyncInitialRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "legacyUndefined", function() { return legacyUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLegacyUndefined", function() { return setLegacyUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "orderedComputed", function() { return orderedComputed; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setOrderedComputed", function() { return setOrderedComputed; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cancelSyntheticClickEvents", function() { return cancelSyntheticClickEvents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCancelSyntheticClickEvents", function() { return setCancelSyntheticClickEvents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeNestedTemplates", function() { return removeNestedTemplates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setRemoveNestedTemplates", function() { return setRemoveNestedTemplates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fastDomIf", function() { return fastDomIf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setFastDomIf", function() { return setFastDomIf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "suppressTemplateNotifications", function() { return suppressTemplateNotifications; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setSuppressTemplateNotifications", function() { return setSuppressTemplateNotifications; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "legacyNoObservedAttributes", function() { return legacyNoObservedAttributes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setLegacyNoObservedAttributes", function() { return setLegacyNoObservedAttributes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useAdoptedStyleSheetsWithBuiltCSS", function() { return useAdoptedStyleSheetsWithBuiltCSS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setUseAdoptedStyleSheetsWithBuiltCSS", function() { return setUseAdoptedStyleSheetsWithBuiltCSS; });
/* harmony import */ var _boot_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./boot.js */ "./node_modules/@polymer/polymer/lib/utils/boot.js");
/* harmony import */ var _resolve_url_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resolve-url.js */ "./node_modules/@polymer/polymer/lib/utils/resolve-url.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/


const useShadow = !window.ShadyDOM || !window.ShadyDOM.inUse;
const useNativeCSSProperties = Boolean(!window.ShadyCSS || window.ShadyCSS.nativeCss);
const useNativeCustomElements = !window.customElements.polyfillWrapFlushCallback;
const supportsAdoptingStyleSheets = useShadow && 'adoptedStyleSheets' in Document.prototype && 'replaceSync' in CSSStyleSheet.prototype && // Since spec may change, feature detect exact API we need
(() => {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync('');
    const host = document.createElement('div');
    host.attachShadow({
      mode: 'open'
    });
    host.shadowRoot.adoptedStyleSheets = [sheet];
    return host.shadowRoot.adoptedStyleSheets[0] === sheet;
  } catch (e) {
    return false;
  }
})();
/**
 * Globally settable property that is automatically assigned to
 * `ElementMixin` instances, useful for binding in templates to
 * make URL's relative to an application's root.  Defaults to the main
 * document URL, but can be overridden by users.  It may be useful to set
 * `rootPath` to provide a stable application mount path when
 * using client side routing.
 */

let rootPath = window.Polymer && window.Polymer.rootPath || Object(_resolve_url_js__WEBPACK_IMPORTED_MODULE_1__["pathFromUrl"])(document.baseURI || window.location.href);
/**
 * Sets the global rootPath property used by `ElementMixin` and
 * available via `rootPath`.
 *
 * @param {string} path The new root path
 * @return {void}
 */

const setRootPath = function (path) {
  rootPath = path;
};
/**
 * A global callback used to sanitize any value before inserting it into the DOM.
 * The callback signature is:
 *
 *  function sanitizeDOMValue(value, name, type, node) { ... }
 *
 * Where:
 *
 * `value` is the value to sanitize.
 * `name` is the name of an attribute or property (for example, href).
 * `type` indicates where the value is being inserted: one of property, attribute, or text.
 * `node` is the node where the value is being inserted.
 *
 * @type {(function(*,string,string,?Node):*)|undefined}
 */

let sanitizeDOMValue = window.Polymer && window.Polymer.sanitizeDOMValue || undefined;
/**
 * Sets the global sanitizeDOMValue available via this module's exported
 * `sanitizeDOMValue` variable.
 *
 * @param {(function(*,string,string,?Node):*)|undefined} newSanitizeDOMValue the global sanitizeDOMValue callback
 * @return {void}
 */

const setSanitizeDOMValue = function (newSanitizeDOMValue) {
  sanitizeDOMValue = newSanitizeDOMValue;
};
/**
 * Gets sanitizeDOMValue, for environments that don't well support `export let`.
 *
 * @return {(function(*,string,string,?Node):*)|undefined} sanitizeDOMValue
 */

const getSanitizeDOMValue = function () {
  return sanitizeDOMValue;
};
/**
 * Globally settable property to make Polymer Gestures use passive TouchEvent listeners when recognizing gestures.
 * When set to `true`, gestures made from touch will not be able to prevent scrolling, allowing for smoother
 * scrolling performance.
 * Defaults to `false` for backwards compatibility.
 */

let passiveTouchGestures = window.Polymer && window.Polymer.setPassiveTouchGestures || false;
/**
 * Sets `passiveTouchGestures` globally for all elements using Polymer Gestures.
 *
 * @param {boolean} usePassive enable or disable passive touch gestures globally
 * @return {void}
 */

const setPassiveTouchGestures = function (usePassive) {
  passiveTouchGestures = usePassive;
};
/**
 * Setting to ensure Polymer template evaluation only occurs based on tempates
 * defined in trusted script.  When true, `<dom-module>` re-registration is
 * disallowed, `<dom-bind>` is disabled, and `<dom-if>`/`<dom-repeat>`
 * templates will only evaluate in the context of a trusted element template.
 */

let strictTemplatePolicy = window.Polymer && window.Polymer.strictTemplatePolicy || false;
/**
 * Sets `strictTemplatePolicy` globally for all elements
 *
 * @param {boolean} useStrictPolicy enable or disable strict template policy
 *   globally
 * @return {void}
 */

const setStrictTemplatePolicy = function (useStrictPolicy) {
  strictTemplatePolicy = useStrictPolicy;
};
/**
 * Setting to enable dom-module lookup from Polymer.Element.  By default,
 * templates must be defined in script using the `static get template()`
 * getter and the `html` tag function.  To enable legacy loading of templates
 * via dom-module, set this flag to true.
 */

let allowTemplateFromDomModule = window.Polymer && window.Polymer.allowTemplateFromDomModule || false;
/**
 * Sets `lookupTemplateFromDomModule` globally for all elements
 *
 * @param {boolean} allowDomModule enable or disable template lookup
 *   globally
 * @return {void}
 */

const setAllowTemplateFromDomModule = function (allowDomModule) {
  allowTemplateFromDomModule = allowDomModule;
};
/**
 * Setting to skip processing style includes and re-writing urls in css styles.
 * Normally "included" styles are pulled into the element and all urls in styles
 * are re-written to be relative to the containing script url.
 * If no includes or relative urls are used in styles, these steps can be
 * skipped as an optimization.
 */

let legacyOptimizations = window.Polymer && window.Polymer.legacyOptimizations || false;
/**
 * Sets `legacyOptimizations` globally for all elements to enable optimizations
 * when only legacy based elements are used.
 *
 * @param {boolean} useLegacyOptimizations enable or disable legacy optimizations
 * includes and url rewriting
 * @return {void}
 */

const setLegacyOptimizations = function (useLegacyOptimizations) {
  legacyOptimizations = useLegacyOptimizations;
};
/**
 * Setting to add warnings useful when migrating from Polymer 1.x to 2.x.
 */

let legacyWarnings = window.Polymer && window.Polymer.legacyWarnings || false;
/**
 * Sets `legacyWarnings` globally for all elements to migration warnings.
 *
 * @param {boolean} useLegacyWarnings enable or disable warnings
 * @return {void}
 */

const setLegacyWarnings = function (useLegacyWarnings) {
  legacyWarnings = useLegacyWarnings;
};
/**
 * Setting to perform initial rendering synchronously when running under ShadyDOM.
 * This matches the behavior of Polymer 1.
 */

let syncInitialRender = window.Polymer && window.Polymer.syncInitialRender || false;
/**
 * Sets `syncInitialRender` globally for all elements to enable synchronous
 * initial rendering.
 *
 * @param {boolean} useSyncInitialRender enable or disable synchronous initial
 * rendering globally.
 * @return {void}
 */

const setSyncInitialRender = function (useSyncInitialRender) {
  syncInitialRender = useSyncInitialRender;
};
/**
 * Setting to retain the legacy Polymer 1 behavior for multi-property
 * observers around undefined values. Observers and computed property methods
 * are not called until no argument is undefined.
 */

let legacyUndefined = window.Polymer && window.Polymer.legacyUndefined || false;
/**
 * Sets `legacyUndefined` globally for all elements to enable legacy
 * multi-property behavior for undefined values.
 *
 * @param {boolean} useLegacyUndefined enable or disable legacy
 * multi-property behavior for undefined.
 * @return {void}
 */

const setLegacyUndefined = function (useLegacyUndefined) {
  legacyUndefined = useLegacyUndefined;
};
/**
 * Setting to ensure computed properties are computed in order to ensure
 * re-computation never occurs in a given turn.
 */

let orderedComputed = window.Polymer && window.Polymer.orderedComputed || false;
/**
 * Sets `orderedComputed` globally for all elements to enable ordered computed
 * property computation.
 *
 * @param {boolean} useOrderedComputed enable or disable ordered computed effects
 * @return {void}
 */

const setOrderedComputed = function (useOrderedComputed) {
  orderedComputed = useOrderedComputed;
};
/**
 * Setting to cancel synthetic click events fired by older mobile browsers. Modern browsers
 * no longer fire synthetic click events, and the cancellation behavior can interfere
 * when programmatically clicking on elements.
 */

let cancelSyntheticClickEvents = true;
/**
 * Sets `setCancelSyntheticEvents` globally for all elements to cancel synthetic click events.
 *
 * @param {boolean} useCancelSyntheticClickEvents enable or disable cancelling synthetic
 * events
 * @return {void}
 */

const setCancelSyntheticClickEvents = function (useCancelSyntheticClickEvents) {
  cancelSyntheticClickEvents = useCancelSyntheticClickEvents;
};
/**
 * Setting to remove nested templates inside `dom-if` and `dom-repeat` as
 * part of element template parsing.  This is a performance optimization that
 * eliminates most of the tax of needing two elements due to the loss of
 * type-extended templates as a result of the V1 specification changes.
 */

let removeNestedTemplates = window.Polymer && window.Polymer.removeNestedTemplates || false;
/**
 * Sets `removeNestedTemplates` globally, to eliminate nested templates
 * inside `dom-if` and `dom-repeat` as part of template parsing.
 *
 * @param {boolean} useRemoveNestedTemplates enable or disable removing nested
 *   templates during parsing
 * @return {void}
 */

const setRemoveNestedTemplates = function (useRemoveNestedTemplates) {
  removeNestedTemplates = useRemoveNestedTemplates;
};
/**
 * Setting to place `dom-if` elements in a performance-optimized mode that takes
 * advantage of lighter-weight host runtime template stamping to eliminate the
 * need for an intermediate Templatizer `TemplateInstance` to mange the nodes
 * stamped by `dom-if`.  Under this setting, any Templatizer-provided API's
 * such as `modelForElement` will not be available for nodes stamped by
 * `dom-if`.
 */

let fastDomIf = window.Polymer && window.Polymer.fastDomIf || false;
/**
 * Sets `fastDomIf` globally, to put `dom-if` in a performance-optimized mode.
 *
 * @param {boolean} useFastDomIf enable or disable `dom-if` fast-mode
 * @return {void}
 */

const setFastDomIf = function (useFastDomIf) {
  fastDomIf = useFastDomIf;
};
/**
 * Setting to disable `dom-change` and `rendered-item-count` events from
 * `dom-if` and `dom-repeat`. Users can opt back into `dom-change` events by
 * setting the `notify-dom-change` attribute (`notifyDomChange: true` property)
 * to `dom-if`/`don-repeat` instances.
 */

let suppressTemplateNotifications = window.Polymer && window.Polymer.suppressTemplateNotifications || false;
/**
 * Sets `suppressTemplateNotifications` globally, to disable `dom-change` and
 * `rendered-item-count` events from `dom-if` and `dom-repeat`.
 *
 * @param {boolean} suppress enable or disable `suppressTemplateNotifications`
 * @return {void}
 */

const setSuppressTemplateNotifications = function (suppress) {
  suppressTemplateNotifications = suppress;
};
/**
 * Setting to disable use of dynamic attributes. This is an optimization
 * to avoid setting `observedAttributes`. Instead attributes are read
 * once at create time and set/removeAttribute are patched.
 */

let legacyNoObservedAttributes = window.Polymer && window.Polymer.legacyNoObservedAttributes || false;
/**
 * Sets `legacyNoObservedAttributes` globally, to disable `observedAttributes`.
 *
 * @param {boolean} noObservedAttributes enable or disable `legacyNoObservedAttributes`
 * @return {void}
 */

const setLegacyNoObservedAttributes = function (noObservedAttributes) {
  legacyNoObservedAttributes = noObservedAttributes;
};
/**
 * Setting to enable use of `adoptedStyleSheets` for sharing style sheets
 * between component instances' shadow roots, if the app uses built Shady CSS
 * styles.
 */

let useAdoptedStyleSheetsWithBuiltCSS = window.Polymer && window.Polymer.useAdoptedStyleSheetsWithBuiltCSS || false;
/**
 * Sets `useAdoptedStyleSheetsWithBuiltCSS` globally.
 *
 * @param {boolean} value enable or disable `useAdoptedStyleSheetsWithBuiltCSS`
 * @return {void}
 */

const setUseAdoptedStyleSheetsWithBuiltCSS = function (value) {
  useAdoptedStyleSheetsWithBuiltCSS = value;
};

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/style-gather.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/style-gather.js ***!
  \*****************************************************************/
/*! exports provided: stylesFromModules, stylesFromModule, stylesFromTemplate, stylesFromModuleImports, cssFromModules, cssFromModule, cssFromTemplate, cssFromModuleImports */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stylesFromModules", function() { return stylesFromModules; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stylesFromModule", function() { return stylesFromModule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stylesFromTemplate", function() { return stylesFromTemplate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stylesFromModuleImports", function() { return stylesFromModuleImports; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cssFromModules", function() { return cssFromModules; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cssFromModule", function() { return cssFromModule; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cssFromTemplate", function() { return cssFromTemplate; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "cssFromModuleImports", function() { return cssFromModuleImports; });
/* harmony import */ var _elements_dom_module_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../elements/dom-module.js */ "./node_modules/@polymer/polymer/lib/elements/dom-module.js");
/* harmony import */ var _resolve_url_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./resolve-url.js */ "./node_modules/@polymer/polymer/lib/utils/resolve-url.js");
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Module with utilities for collection CSS text from `<templates>`, external
 * stylesheets, and `dom-module`s.
 *
 * @summary Module with utilities for collection CSS text from various sources.
 */


const MODULE_STYLE_LINK_SELECTOR = 'link[rel=import][type~=css]';
const INCLUDE_ATTR = 'include';
const SHADY_UNSCOPED_ATTR = 'shady-unscoped';
/**
 * @param {string} moduleId .
 * @return {?DomModule} .
 */

function importModule(moduleId) {
  return (
    /** @type {?DomModule} */
    _elements_dom_module_js__WEBPACK_IMPORTED_MODULE_0__["DomModule"].import(moduleId)
  );
}

function styleForImport(importDoc) {
  // NOTE: polyfill affordance.
  // under the HTMLImports polyfill, there will be no 'body',
  // but the import pseudo-doc can be used directly.
  let container = importDoc.body ? importDoc.body : importDoc;
  const importCss = Object(_resolve_url_js__WEBPACK_IMPORTED_MODULE_1__["resolveCss"])(container.textContent, importDoc.baseURI);
  const style = document.createElement('style');
  style.textContent = importCss;
  return style;
}
/** @typedef {{assetpath: string}} */


let templateWithAssetPath; // eslint-disable-line no-unused-vars

/**
 * Returns a list of <style> elements in a space-separated list of `dom-module`s.
 *
 * @function
 * @param {string} moduleIds List of dom-module id's within which to
 * search for css.
 * @return {!Array<!HTMLStyleElement>} Array of contained <style> elements
 */

function stylesFromModules(moduleIds) {
  const modules = moduleIds.trim().split(/\s+/);
  const styles = [];

  for (let i = 0; i < modules.length; i++) {
    styles.push(...stylesFromModule(modules[i]));
  }

  return styles;
}
/**
 * Returns a list of <style> elements in a given `dom-module`.
 * Styles in a `dom-module` can come either from `<style>`s within the
 * first `<template>`, or else from one or more
 * `<link rel="import" type="css">` links outside the template.
 *
 * @param {string} moduleId dom-module id to gather styles from
 * @return {!Array<!HTMLStyleElement>} Array of contained styles.
 */

function stylesFromModule(moduleId) {
  const m = importModule(moduleId);

  if (!m) {
    console.warn('Could not find style data in module named', moduleId);
    return [];
  }

  if (m._styles === undefined) {
    const styles = []; // module imports: <link rel="import" type="css">

    styles.push(..._stylesFromModuleImports(m)); // include css from the first template in the module

    const template =
    /** @type {?HTMLTemplateElement} */
    m.querySelector('template');

    if (template) {
      styles.push(...stylesFromTemplate(template,
      /** @type {templateWithAssetPath} */
      m.assetpath));
    }

    m._styles = styles;
  }

  return m._styles;
}
/**
 * Returns the `<style>` elements within a given template.
 *
 * @param {!HTMLTemplateElement} template Template to gather styles from
 * @param {string=} baseURI baseURI for style content
 * @return {!Array<!HTMLStyleElement>} Array of styles
 */

function stylesFromTemplate(template, baseURI) {
  if (!template._styles) {
    const styles = []; // if element is a template, get content from its .content

    const e$ = template.content.querySelectorAll('style');

    for (let i = 0; i < e$.length; i++) {
      let e = e$[i]; // support style sharing by allowing styles to "include"
      // other dom-modules that contain styling

      let include = e.getAttribute(INCLUDE_ATTR);

      if (include) {
        styles.push(...stylesFromModules(include).filter(function (item, index, self) {
          return self.indexOf(item) === index;
        }));
      }

      if (baseURI) {
        e.textContent = Object(_resolve_url_js__WEBPACK_IMPORTED_MODULE_1__["resolveCss"])(e.textContent,
        /** @type {string} */
        baseURI);
      }

      styles.push(e);
    }

    template._styles = styles;
  }

  return template._styles;
}
/**
 * Returns a list of <style> elements  from stylesheets loaded via `<link rel="import" type="css">` links within the specified `dom-module`.
 *
 * @param {string} moduleId Id of `dom-module` to gather CSS from
 * @return {!Array<!HTMLStyleElement>} Array of contained styles.
 */

function stylesFromModuleImports(moduleId) {
  let m = importModule(moduleId);
  return m ? _stylesFromModuleImports(m) : [];
}
/**
 * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
 * @return {!Array<!HTMLStyleElement>} Array of contained styles
 */

function _stylesFromModuleImports(module) {
  const styles = [];
  const p$ = module.querySelectorAll(MODULE_STYLE_LINK_SELECTOR);

  for (let i = 0; i < p$.length; i++) {
    let p = p$[i];

    if (p.import) {
      const importDoc = p.import;
      const unscoped = p.hasAttribute(SHADY_UNSCOPED_ATTR);

      if (unscoped && !importDoc._unscopedStyle) {
        const style = styleForImport(importDoc);
        style.setAttribute(SHADY_UNSCOPED_ATTR, '');
        importDoc._unscopedStyle = style;
      } else if (!importDoc._style) {
        importDoc._style = styleForImport(importDoc);
      }

      styles.push(unscoped ? importDoc._unscopedStyle : importDoc._style);
    }
  }

  return styles;
}
/**
 *
 * Returns CSS text of styles in a space-separated list of `dom-module`s.
 * Note: This method is deprecated, use `stylesFromModules` instead.
 *
 * @deprecated
 * @param {string} moduleIds List of dom-module id's within which to
 * search for css.
 * @return {string} Concatenated CSS content from specified `dom-module`s
 */


function cssFromModules(moduleIds) {
  let modules = moduleIds.trim().split(/\s+/);
  let cssText = '';

  for (let i = 0; i < modules.length; i++) {
    cssText += cssFromModule(modules[i]);
  }

  return cssText;
}
/**
 * Returns CSS text of styles in a given `dom-module`.  CSS in a `dom-module`
 * can come either from `<style>`s within the first `<template>`, or else
 * from one or more `<link rel="import" type="css">` links outside the
 * template.
 *
 * Any `<styles>` processed are removed from their original location.
 * Note: This method is deprecated, use `styleFromModule` instead.
 *
 * @deprecated
 * @param {string} moduleId dom-module id to gather styles from
 * @return {string} Concatenated CSS content from specified `dom-module`
 */

function cssFromModule(moduleId) {
  let m = importModule(moduleId);

  if (m && m._cssText === undefined) {
    // module imports: <link rel="import" type="css">
    let cssText = _cssFromModuleImports(m); // include css from the first template in the module


    let t =
    /** @type {?HTMLTemplateElement} */
    m.querySelector('template');

    if (t) {
      cssText += cssFromTemplate(t,
      /** @type {templateWithAssetPath} */
      m.assetpath);
    }

    m._cssText = cssText || null;
  }

  if (!m) {
    console.warn('Could not find style data in module named', moduleId);
  }

  return m && m._cssText || '';
}
/**
 * Returns CSS text of `<styles>` within a given template.
 *
 * Any `<styles>` processed are removed from their original location.
 * Note: This method is deprecated, use `styleFromTemplate` instead.
 *
 * @deprecated
 * @param {!HTMLTemplateElement} template Template to gather styles from
 * @param {string} baseURI Base URI to resolve the URL against
 * @return {string} Concatenated CSS content from specified template
 */

function cssFromTemplate(template, baseURI) {
  let cssText = '';
  const e$ = stylesFromTemplate(template, baseURI); // if element is a template, get content from its .content

  for (let i = 0; i < e$.length; i++) {
    let e = e$[i];

    if (e.parentNode) {
      e.parentNode.removeChild(e);
    }

    cssText += e.textContent;
  }

  return cssText;
}
/**
 * Returns CSS text from stylesheets loaded via `<link rel="import" type="css">`
 * links within the specified `dom-module`.
 *
 * Note: This method is deprecated, use `stylesFromModuleImports` instead.
 *
 * @deprecated
 *
 * @param {string} moduleId Id of `dom-module` to gather CSS from
 * @return {string} Concatenated CSS content from links in specified `dom-module`
 */

function cssFromModuleImports(moduleId) {
  let m = importModule(moduleId);
  return m ? _cssFromModuleImports(m) : '';
}
/**
 * @deprecated
 * @param {!HTMLElement} module dom-module element that could contain `<link rel="import" type="css">` styles
 * @return {string} Concatenated CSS content from links in the dom-module
 */

function _cssFromModuleImports(module) {
  let cssText = '';

  let styles = _stylesFromModuleImports(module);

  for (let i = 0; i < styles.length; i++) {
    cssText += styles[i].textContent;
  }

  return cssText;
}

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/telemetry.js":
/*!**************************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/telemetry.js ***!
  \**************************************************************/
/*! exports provided: instanceCount, incrementInstanceCount, registrations, register, dumpRegistrations */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "instanceCount", function() { return instanceCount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "incrementInstanceCount", function() { return incrementInstanceCount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "registrations", function() { return registrations; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "register", function() { return register; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dumpRegistrations", function() { return dumpRegistrations; });
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/**
 * Total number of Polymer element instances created.
 * @type {number}
 */
let instanceCount = 0;
function incrementInstanceCount() {
  instanceCount++;
}
/**
 * Array of Polymer element classes that have been finalized.
 * @type {!Array<!PolymerElementConstructor>}
 */

const registrations = [];
/**
 * @param {!PolymerElementConstructor} prototype Element prototype to log
 * @private
 */

function _regLog(prototype) {
  console.log('[' +
  /** @type {?} */
  prototype.is + ']: registered');
}
/**
 * Registers a class prototype for telemetry purposes.
 * @param {!PolymerElementConstructor} prototype Element prototype to register
 * @protected
 */


function register(prototype) {
  registrations.push(prototype);
}
/**
 * Logs all elements registered with an `is` to the console.
 * @public
 */

function dumpRegistrations() {
  registrations.forEach(_regLog);
}

/***/ }),

/***/ "./node_modules/@polymer/polymer/lib/utils/wrap.js":
/*!*********************************************************!*\
  !*** ./node_modules/@polymer/polymer/lib/utils/wrap.js ***!
  \*********************************************************/
/*! exports provided: wrap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "wrap", function() { return wrap; });
/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/* eslint-disable valid-jsdoc */

/**
 * Node wrapper to ensure ShadowDOM safe operation regardless of polyfill
 * presence or mode. Note that with the introduction of `ShadyDOM.noPatch`,
 * a node wrapper must be used to access ShadowDOM API.
 * This is similar to using `Polymer.dom` but relies exclusively
 * on the presence of the ShadyDOM polyfill rather than requiring the loading
 * of legacy (Polymer.dom) API.
 * @type {function(Node):Node}
 */
const wrap = window['ShadyDOM'] && window['ShadyDOM']['noPatch'] && window['ShadyDOM']['wrap'] ? window['ShadyDOM']['wrap'] : window['ShadyDOM'] ? n => ShadyDOM['patch'](n) : n => n;

/***/ }),

/***/ "./node_modules/@polymer/polymer/polymer-element.js":
/*!**********************************************************!*\
  !*** ./node_modules/@polymer/polymer/polymer-element.js ***!
  \**********************************************************/
/*! exports provided: html, version, PolymerElement */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PolymerElement", function() { return PolymerElement; });
/* harmony import */ var _lib_mixins_element_mixin_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./lib/mixins/element-mixin.js */ "./node_modules/@polymer/polymer/lib/mixins/element-mixin.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "version", function() { return _lib_mixins_element_mixin_js__WEBPACK_IMPORTED_MODULE_0__["version"]; });

/* harmony import */ var _lib_utils_html_tag_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lib/utils/html-tag.js */ "./node_modules/@polymer/polymer/lib/utils/html-tag.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "html", function() { return _lib_utils_html_tag_js__WEBPACK_IMPORTED_MODULE_1__["html"]; });

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/



/**
 * Base class that provides the core API for Polymer's meta-programming
 * features including template stamping, data-binding, attribute deserialization,
 * and property change observation.
 *
 * @customElement
 * @polymer
 * @constructor
 * @implements {Polymer_ElementMixin}
 * @extends HTMLElement
 * @appliesMixin ElementMixin
 * @summary Custom element base class that provides the core API for Polymer's
 *   key meta-programming features including template stamping, data-binding,
 *   attribute deserialization, and property change observation
 */

const PolymerElement = Object(_lib_mixins_element_mixin_js__WEBPACK_IMPORTED_MODULE_0__["ElementMixin"])(HTMLElement);

/***/ }),

/***/ "./node_modules/classnames/index.js":
/*!******************************************!*\
  !*** ./node_modules/classnames/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
  Copyright (c) 2018 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

/* global define */
(function () {
  'use strict';

  var hasOwn = {}.hasOwnProperty;

  function classNames() {
    var classes = [];

    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (!arg) continue;
      var argType = typeof arg;

      if (argType === 'string' || argType === 'number') {
        classes.push(arg);
      } else if (Array.isArray(arg)) {
        if (arg.length) {
          var inner = classNames.apply(null, arg);

          if (inner) {
            classes.push(inner);
          }
        }
      } else if (argType === 'object') {
        if (arg.toString === Object.prototype.toString) {
          for (var key in arg) {
            if (hasOwn.call(arg, key) && arg[key]) {
              classes.push(key);
            }
          }
        } else {
          classes.push(arg.toString());
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
})();

/***/ }),

/***/ "./node_modules/css-vendor/dist/css-vendor.esm.js":
/*!********************************************************!*\
  !*** ./node_modules/css-vendor/dist/css-vendor.esm.js ***!
  \********************************************************/
/*! exports provided: prefix, supportedKeyframes, supportedProperty, supportedValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prefix", function() { return prefix; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedKeyframes", function() { return supportedKeyframes; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedProperty", function() { return supportedProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedValue", function() { return supportedValue; });
/* harmony import */ var is_in_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! is-in-browser */ "./node_modules/is-in-browser/dist/module.js");
/* harmony import */ var _babel_runtime_helpers_esm_toConsumableArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/toConsumableArray */ "./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js");

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
} // https://caniuse.com/#search=appearance


var appearence = {
  noPrefill: ['appearance'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'appearance') return false;
    if (prefix.js === 'ms') return "-webkit-" + prop;
    return prefix.css + prop;
  }
}; // https://caniuse.com/#search=color-adjust

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
} // but we can use a longhand property instead.
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
}; // https://caniuse.com/#search=text-orientation

var textOrientation = {
  noPrefill: ['text-orientation'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'text-orientation') return false;

    if (prefix.vendor === 'apple' && !prefix.isTouch) {
      return prefix.css + prop;
    }

    return prop;
  }
}; // https://caniuse.com/#search=transform

var transform = {
  noPrefill: ['transform'],
  supportedProperty: function supportedProperty(prop, style, options) {
    if (prop !== 'transform') return false;

    if (options.transform) {
      return prop;
    }

    return prefix.css + prop;
  }
}; // https://caniuse.com/#search=transition

var transition = {
  noPrefill: ['transition'],
  supportedProperty: function supportedProperty(prop, style, options) {
    if (prop !== 'transition') return false;

    if (options.transition) {
      return prop;
    }

    return prefix.css + prop;
  }
}; // https://caniuse.com/#search=writing-mode

var writingMode = {
  noPrefill: ['writing-mode'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'writing-mode') return false;

    if (prefix.js === 'Webkit' || prefix.js === 'ms' && prefix.browser !== 'edge') {
      return prefix.css + prop;
    }

    return prop;
  }
}; // https://caniuse.com/#search=user-select

var userSelect = {
  noPrefill: ['user-select'],
  supportedProperty: function supportedProperty(prop) {
    if (prop !== 'user-select') return false;

    if (prefix.js === 'Moz' || prefix.js === 'ms' || prefix.vendor === 'apple') {
      return prefix.css + prop;
    }

    return prop;
  }
}; // https://caniuse.com/#search=multicolumn
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
}; // See https://github.com/postcss/autoprefixer/issues/324.

var inlineLogicalOld = {
  supportedProperty: function supportedProperty(prop, style) {
    if (!/^(border|margin|padding)-inline/.test(prop)) return false;
    if (prefix.js === 'Moz') return prop;
    var newProp = prop.replace('-inline', '');
    return prefix.js + pascalize(newProp) in style ? prefix.css + newProp : false;
  }
}; // Camelization is required because we can't test using.
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
}; // https://caniuse.com/#search=scroll-snap

var scrollSnap = {
  supportedProperty: function supportedProperty(prop) {
    if (prop.substring(0, 11) !== 'scroll-snap') return false;

    if (prefix.js === 'ms') {
      return "" + prefix.css + prop;
    }

    return prop;
  }
}; // https://caniuse.com/#search=overscroll-behavior

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
}; // plugins = [
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
  } // For server-side rendering.


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

/***/ "./node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js ***!
  \**********************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var reactIs = __webpack_require__(/*! react-is */ "./node_modules/react-is/index.js");
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

/***/ "./node_modules/is-in-browser/dist/module.js":
/*!***************************************************!*\
  !*** ./node_modules/is-in-browser/dist/module.js ***!
  \***************************************************/
/*! exports provided: isBrowser, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBrowser", function() { return isBrowser; });
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var isBrowser = (typeof window === "undefined" ? "undefined" : _typeof(window)) === "object" && (typeof document === "undefined" ? "undefined" : _typeof(document)) === 'object' && document.nodeType === 9;
/* harmony default export */ __webpack_exports__["default"] = (isBrowser);

/***/ }),

/***/ "./node_modules/react-is/cjs/react-is.development.js":
/*!***********************************************************!*\
  !*** ./node_modules/react-is/cjs/react-is.development.js ***!
  \***********************************************************/
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
  (function () {
    'use strict'; // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
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

/***/ "./node_modules/react-is/index.js":
/*!****************************************!*\
  !*** ./node_modules/react-is/index.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "./node_modules/react-is/cjs/react-is.development.js");
}

/***/ }),

/***/ "./node_modules/regenerator-runtime/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/regenerator-runtime/runtime.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var runtime = function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }

  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};

  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };

  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  Gp[iteratorSymbol] = function () {
    return this;
  };

  Gp.toString = function () {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    stop: function () {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function (record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
 true ? module.exports : undefined);

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

/***/ }),

/***/ "./node_modules/webpack/buildin/global.js":
/*!***********************************!*\
  !*** (webpack)/buildin/global.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g; // This works in non-strict mode

g = function () {
  return this;
}();

try {
  // This works if eval is allowed (see CSP)
  g = g || new Function("return this")();
} catch (e) {
  // This works if the window reference is available
  if (typeof window === "object") g = window;
} // g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}


module.exports = g;

/***/ }),

/***/ "./src/apis/index.js":
/*!***************************!*\
  !*** ./src/apis/index.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_callBridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/callBridge */ "./src/utils/callBridge.js");
/* harmony import */ var _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/callInternalAPI */ "./src/utils/callInternalAPI.js");
/* harmony import */ var _utils_reportError__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/reportError */ "./src/utils/reportError.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.js");
/* harmony import */ var _web_TrackerAPI__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./web/TrackerAPI */ "./src/apis/web/TrackerAPI.js");
/* harmony import */ var _web_loadFontFace__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./web/loadFontFace */ "./src/apis/web/loadFontFace.js");
/* harmony import */ var _web_createSelectorQuery__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./web/createSelectorQuery */ "./src/apis/web/createSelectorQuery.js");
/* harmony import */ var _web_IntersectionObserver__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./web/IntersectionObserver */ "./src/apis/web/IntersectionObserver.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }











var g = self;
var messageQueue = [];

var bridge = _objectSpread(_objectSpread(_objectSpread({
  // for internal call render
  fireMessage: function fireMessage(data) {
    messageQueue.forEach(function (f) {
      return f(data);
    });
  },
  onMessage: function onMessage(fn) {
    messageQueue.push(fn);
    return function () {
      var index = messageQueue.indexOf(fn);

      if (index !== -1) {
        messageQueue.splice(index, 1);
      }
    };
  },
  reLaunch: function reLaunch(options) {
    var url = options.url;

    if (url.charAt(0) === '/') {
      url = url.slice(1);
    }

    var launchParamsTag = url;
    var queryIndex = url.indexOf('?');

    if (queryIndex !== -1) {
      launchParamsTag = url.slice(0, queryIndex);
    }

    var isTab = !!_framework___WEBPACK_IMPORTED_MODULE_1__["$global"].tabsConfig[url]; // init tabs config

    if (isTab) {
      bridge.call('switchTab', {
        tag: url,
        recreate: true
      });
    } else {
      bridge.call('pushWindow', {
        url: "#".concat(url),
        launchParamsTag: launchParamsTag,
        param: {
          closeAllWindow: true,
          animationType: 'none'
        }
      });
    }
  },
  pageScrollTo: function pageScrollTo() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        scrollTop = _ref.scrollTop;

    window.scrollTo(window.pageXOffset, scrollTop);
  },
  SDKVersion: _utils_system__WEBPACK_IMPORTED_MODULE_5__["SDKVersion"]
}, _web_TrackerAPI__WEBPACK_IMPORTED_MODULE_7__["default"]), _web_loadFontFace__WEBPACK_IMPORTED_MODULE_8__["default"]), {}, {
  createSelectorQuery: _web_createSelectorQuery__WEBPACK_IMPORTED_MODULE_9__["default"],
  addIntersectionObserver: _web_IntersectionObserver__WEBPACK_IMPORTED_MODULE_10__["addIntersectionObserver"],
  removeIntersectionObserver: _web_IntersectionObserver__WEBPACK_IMPORTED_MODULE_10__["removeIntersectionObserver"],
  reportError: _utils_reportError__WEBPACK_IMPORTED_MODULE_4__["default"],
  call: _utils_callBridge__WEBPACK_IMPORTED_MODULE_2__["default"],
  callInternalAPI: _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_3__["default"],
  console: function (_console) {
    function console() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _console.apply(this, args);
    }

    console.toString = function () {
      return _console.toString();
    };

    return console;
  }(function (type) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    console[type].apply(console, args.slice(0, -2));
  }),
  hideKeyboard: function hideKeyboard() {
    var _document = document,
        activeElement = _document.activeElement;

    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }

    if (window._MpActiveNativeElement !== undefined) {
      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_2__["default"])('NBComponent.sendMessage', {
        actionType: 'blur',
        element: window._MpActiveNativeElement
      });
    }
  }
});

var dispatchPageReRenderEvent = function dispatchPageReRenderEvent() {
  document.dispatchEvent(new CustomEvent('pageReRender', {}));
};

Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_6__["default"])(document, {
  onShare: function onShare(e) {
    var page = Object(_framework___WEBPACK_IMPORTED_MODULE_1__["getCurrentPageImpl"])();

    if (page && page.publicInstance.onShareAppMessage) {
      e.preventDefault();
    }
  },
  firePullToRefresh: function firePullToRefresh(e) {
    e.preventDefault();
  },
  pullIntercept: function pullIntercept(e) {
    e.preventDefault();
  },
  pageReRender: function pageReRender() {
    Object(_web_IntersectionObserver__WEBPACK_IMPORTED_MODULE_10__["scheduleIntersectionUpdate"])();
  }
});
Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_6__["default"])(window, {
  resize: dispatchPageReRenderEvent,
  animationstart: dispatchPageReRenderEvent,
  animationiteration: dispatchPageReRenderEvent,
  animationend: dispatchPageReRenderEvent,
  transitionend: dispatchPageReRenderEvent
});
window.addEventListener('scroll', function () {
  Object(_web_IntersectionObserver__WEBPACK_IMPORTED_MODULE_10__["scheduleIntersectionUpdate"])();
}, {
  capture: true,
  passive: true
});
_framework___WEBPACK_IMPORTED_MODULE_1__["EventHub"].addListener(['pageReady', 'pageUpdate'], function () {
  dispatchPageReRenderEvent();
});
Object(_utils_system__WEBPACK_IMPORTED_MODULE_5__["logSystemInfo"])();
_framework___WEBPACK_IMPORTED_MODULE_1__["$global"].bridge = bridge;
/* harmony default export */ __webpack_exports__["default"] = (bridge);

/***/ }),

/***/ "./src/apis/web/IntersectionObserver.js":
/*!**********************************************!*\
  !*** ./src/apis/web/IntersectionObserver.js ***!
  \**********************************************/
/*! exports provided: addIntersectionObserver, removeIntersectionObserver, scheduleIntersectionUpdate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addIntersectionObserver", function() { return addIntersectionObserver; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "removeIntersectionObserver", function() { return removeIntersectionObserver; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "scheduleIntersectionUpdate", function() { return scheduleIntersectionUpdate; });
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_requestAnimationFrame__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/requestAnimationFrame */ "./src/utils/requestAnimationFrame.js");


var requestAnimationFrameing = false;
var intersectionObservers = {};
var subIntersectionObservers = {};

var formatMargins = function formatMargins() {
  var margins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    left: margins.left || 0,
    top: margins.top || 0,
    right: margins.right || 0,
    bottom: margins.bottom || 0
  };
};

var formatRect = function formatRect() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return {
    left: params.left,
    top: params.top,
    right: params.right,
    bottom: params.bottom,
    width: params.width,
    height: params.height
  };
}; // 矩阵相交计算


var getIntersectRect = function getIntersectRect(rect1, rect2) {
  var intersectRect = {
    left: rect1.left < rect2.left ? rect2.left : rect1.left,
    top: rect1.top < rect2.top ? rect2.top : rect1.top,
    right: rect1.right > rect2.right ? rect2.right : rect1.right,
    bottom: rect1.bottom > rect2.bottom ? rect2.bottom : rect1.bottom,
    width: 0,
    height: 0
  };

  if (intersectRect.right > intersectRect.left) {
    intersectRect.width = intersectRect.right - intersectRect.left;
  } else {
    intersectRect.right = intersectRect.left = intersectRect.bottom = intersectRect.top = 0;
  }

  if (intersectRect.bottom > intersectRect.top) {
    intersectRect.height = intersectRect.bottom - intersectRect.top;
  } else {
    intersectRect.right = intersectRect.left = intersectRect.bottom = intersectRect.top = 0;
  }

  return intersectRect;
}; // 返回所有参照节点的相交矩阵


var getRelativeIntersectRect = function getRelativeIntersectRect(relatives) {
  var _document$documentEle = document.documentElement;
  var clientWidth = _document$documentEle.clientWidth,
      clientHeight = _document$documentEle.clientHeight;
  var relativeIntersectRect = null;

  for (var i = 0; i < relatives.length; i++) {
    var _relatives$i = relatives[i];
    var node = _relatives$i.node;
    var margins = _relatives$i.margins;
    var relativeRect = node ? node.getBoundingClientRect() : {
      left: 0,
      top: 0,
      right: clientWidth,
      bottom: clientHeight,
      width: clientWidth,
      height: clientHeight
    };
    var relativeRectWithMargins = {
      left: relativeRect.left - margins.left,
      top: relativeRect.top - margins.top,
      right: relativeRect.right + margins.right,
      bottom: relativeRect.bottom + margins.bottom
    };
    relativeIntersectRect = relativeIntersectRect ? getIntersectRect(relativeIntersectRect, relativeRectWithMargins) : relativeRectWithMargins;
  }

  return relativeIntersectRect;
}; // 判断节点是否相交


var checkIntersection = function checkIntersection(params) {
  var targetNode = params.targetNode,
      relatives = params.relatives,
      thresholds = params.thresholds,
      currentRatio = params.currentRatio,
      intersectionObserverId = params.intersectionObserverId; // 执行检测的时候节点已经消失

  if (!targetNode) {
    return;
  }

  var relativeIntersectRect = getRelativeIntersectRect(relatives);
  var rect = formatRect(targetNode.getBoundingClientRect());
  var intersectRect = getIntersectRect(relativeIntersectRect, rect);
  var area = rect.width * rect.height;
  var latestCurrentRatio = area ? intersectRect.width * intersectRect.height / area : 0; // 有点绕，请注意

  params.currentRatio = latestCurrentRatio;
  var shouldFireIntersectionEvent = undefined === currentRatio;

  if (currentRatio !== latestCurrentRatio) {
    thresholds.forEach(function (threshold) {
      if (shouldFireIntersectionEvent) return false;

      if (latestCurrentRatio <= threshold && currentRatio >= threshold) {
        shouldFireIntersectionEvent = true;
      } else if (latestCurrentRatio >= threshold && currentRatio <= threshold) {
        shouldFireIntersectionEvent = true;
      }
    });
  }

  if (shouldFireIntersectionEvent) {
    Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])().callRemote('bridge', '_fireIntersectionObserver', {
      intersectionObserverId: intersectionObserverId,
      info: {
        id: targetNode.id,
        dataset: targetNode.dataset,
        time: Date.now(),
        boundingClientRect: rect,
        intersectionRatio: latestCurrentRatio,
        intersectionRect: formatRect(intersectRect),
        relativeRect: relativeIntersectRect
      }
    });
  }
};

var handleIntersectionObserver = function handleIntersectionObserver(targetNodeArr, relatives, thresholds, currentRatio, intersectionObserverId) {
  if (!targetNodeArr.length || !relatives.length) {
    return;
  }

  intersectionObservers[intersectionObserverId] = targetNodeArr.length;
  targetNodeArr.forEach(function (targetNode, index) {
    var subIntersectionObserverId = "".concat(intersectionObserverId, "@").concat(index);
    var IntersectionParams = {
      targetNode: targetNode,
      relatives: relatives,
      thresholds: thresholds,
      currentRatio: currentRatio,
      intersectionObserverId: intersectionObserverId
    }; // 当执行时目标已经已经移除

    if (!targetNode) {
      delete subIntersectionObservers[subIntersectionObserverId];
      --intersectionObservers[intersectionObserverId];
    } else {
      subIntersectionObservers[subIntersectionObserverId] = IntersectionParams;
      Object(_utils_requestAnimationFrame__WEBPACK_IMPORTED_MODULE_1__["default"])(function (_timestamp) {
        checkIntersection(IntersectionParams);
      });
    }
  });
};

function checkAllIntersection() {
  for (var subIntersectionObserverId in subIntersectionObservers) {
    checkIntersection(subIntersectionObservers[subIntersectionObserverId]);
  }

  requestAnimationFrameing = false;
} // 添加节点相交查询


function addIntersectionObserver(_ref) {
  var intersectionObserverId = _ref.intersectionObserverId,
      options = _ref.options,
      relativeInfo = _ref.relativeInfo,
      targetSelector = _ref.targetSelector;
  var targetNodeArr = [];

  if (options.selectAll) {
    targetNodeArr = document.querySelectorAll(targetSelector);
  } else {
    var targetNode = document.querySelector(targetSelector);
    targetNodeArr = targetNode ? [targetNode] : [];
  }

  if (!targetNodeArr.length) {
    console.warn("\u76EE\u6807\u8282\u70B9".concat(targetSelector, "\u672A\u627E\u5230\uFF0C\u5F53\u524D\u76D1\u542C\u672A\u751F\u6548"));
  }

  var relatives = [];
  relativeInfo.forEach(function (info) {
    var selector = info.selector;
    var margins = info.margins;
    var node;

    if (selector == null) {
      node = null;
    } else {
      node = document.querySelector(selector);
    }

    if (node || selector == null) {
      relatives.push({
        node: node,
        margins: formatMargins(margins)
      });
    } else {
      console.warn("\u53C2\u7167\u8282\u70B9".concat(selector, "\u672A\u627E\u5230\uFF0C\u6B64\u53C2\u7167\u8282\u70B9\u5C06\u4F1A\u88AB\u5FFD\u7565"));
    }
  });

  if (!relatives.length) {
    console.warn('未找到任何参照节点，当前监听未生效');
  }

  return handleIntersectionObserver(targetNodeArr, relatives, options.thresholds, options.initialRatio, intersectionObserverId);
}
function removeIntersectionObserver(intersectionObserverId) {
  var len = intersectionObservers[intersectionObserverId];

  for (var i = 0; i < len; i++) {
    var subIntersectionObserverId = "".concat(intersectionObserverId, "@").concat(i);
    delete subIntersectionObservers[subIntersectionObserverId];
  }

  delete intersectionObservers[intersectionObserverId];
}
function scheduleIntersectionUpdate() {
  if (!requestAnimationFrameing) {
    Object(_utils_requestAnimationFrame__WEBPACK_IMPORTED_MODULE_1__["default"])(function () {
      requestAnimationFrameing = true;
      checkAllIntersection();
    });
  }
}

/***/ }),

/***/ "./src/apis/web/TrackerAPI.js":
/*!************************************!*\
  !*** ./src/apis/web/TrackerAPI.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_trackerStore__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/trackerStore */ "./src/utils/trackerStore.js");


/* harmony default export */ __webpack_exports__["default"] = ({
  setTrackerConfig: function setTrackerConfig(trackerConfig) {
    _utils_trackerStore__WEBPACK_IMPORTED_MODULE_1__["default"].trackerConfig = trackerConfig;
  },
  collectRemoteTrackerData: function collectRemoteTrackerData(eventCode, payload) {
    Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])().callRemote('bridge.$trackerAPI', 'collectTrackerData', Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])().getId(), eventCode, payload);
  },
  reportRemoteTrackerData: function reportRemoteTrackerData(eventCode, payload) {
    Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])().callRemote('bridge.$trackerAPI', 'reportTrackerData', Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])().getId(), eventCode, payload);
  }
});

/***/ }),

/***/ "./src/apis/web/createSelectorQuery.js":
/*!*********************************************!*\
  !*** ./src/apis/web/createSelectorQuery.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createSelectorQuery; });
var doc = document;
var win = window;

function getNodeQuery(node, type) {
  if (type === 'rect') {
    var clientRect = node.getBoundingClientRect();
    var rect = {}; // rect.left    // 节点的左边界坐标
    // rect.right   // 节点的右边界坐标
    // rect.top     // 节点的上边界坐标
    // rect.bottom  // 节点的下边界坐标
    // rect.width   // 节点的宽度
    // rect.height  // 节点的高度

    var rectProps = ['left', 'right', 'top', 'bottom', 'width', 'height'];

    for (var i = 0; i < rectProps.length; i++) {
      if (clientRect[rectProps[i]] !== undefined) {
        rect[rectProps[i]] = clientRect[rectProps[i]];
      }
    }

    return rect;
  } else if (type === 'scroll') {
    return {
      scrollTop: node.scrollTop,
      scrollLeft: node.scrollLeft
    };
  }
}

function createSelectorQuery(actions, callback) {
  var ret = [];
  actions.forEach(function (action) {
    var selector = action.selector,
        type = action.type;
    var value = selector.value;
    var selectorType = selector.type;

    if (value === 'viewport') {
      if (type === 'rect') {
        ret.push({
          width: win.innerWidth,
          height: win.innerHeight
        });
      } else if (type === 'scroll') {
        ret.push({
          scrollTop: win.pageYOffset,
          scrollLeft: win.pageXOffset
        });
      }
    } else if (selectorType === 'all') {
      var nodes = [].slice.call(doc.querySelectorAll(value), 0);

      if (nodes.length) {
        ret.push(nodes.map(function (node) {
          return getNodeQuery(node, type);
        }));
      } else {
        ret.push(null);
      }
    } else {
      var node = doc.querySelector(value);

      if (node) {
        ret.push(getNodeQuery(node, type));
      } else {
        ret.push(null);
      }
    }
  });
  callback(ret);
}

/***/ }),

/***/ "./src/apis/web/loadFontFace.js":
/*!**************************************!*\
  !*** ./src/apis/web/loadFontFace.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  loadFontFace: function loadFontFace() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var success = arguments.length > 1 ? arguments[1] : undefined;
    var fail = arguments.length > 2 ? arguments[2] : undefined;
    var _data$family = data.family,
        family = _data$family === void 0 ? '' : _data$family,
        _data$source = data.source,
        source = _data$source === void 0 ? '' : _data$source,
        _data$desc = data.desc,
        desc = _data$desc === void 0 ? {} : _data$desc;
    var _document = document,
        fonts = _document.fonts;

    if (fonts) {
      var fontFace = new FontFace(family, source, desc);
      fontFace.load().then(function (res) {
        success({
          status: res.status
        });
        fonts.add(fontFace);
      }, function () {
        fail({
          status: fontFace.status
        });
      });
    } else {
      if (!family || !source) {
        fail({
          status: 'error'
        });
        return;
      }

      var style = document.createElement('style');
      var node = "@font-face {font-family: \"".concat(family, "\"; src: ").concat(source, "; font-weight: ").concat(desc.weight, "; font-stretch: ").concat(desc.stretch, "; font-variant: ").concat(desc.variant, "; font-feature-setting:").concat(desc.featureSetting, "; unicode-range: ").concat(desc.unicodeRange, "; font-style: ").concat(desc.style, "; }");
      style.appendChild(document.createTextNode(node));
      document.head.appendChild(style);
      success({
        status: 'loaded'
      });
    }
  }
});

/***/ }),

/***/ "./src/components/button/index.js":
/*!****************************************!*\
  !*** ./src/components/button/index.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/callInternalAPI */ "./src/utils/callInternalAPI.js");
/* harmony import */ var _utils_callBridge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/callBridge */ "./src/utils/callBridge.js");
/* harmony import */ var _utils_TestMixin__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/TestMixin */ "./src/utils/TestMixin.js");
/* harmony import */ var _utils_trackTap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/trackTap */ "./src/utils/trackTap.js");
/* harmony import */ var _utils_eventReg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/eventReg */ "./src/utils/eventReg.js");
/* harmony import */ var _shared_Button__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../shared/Button */ "./src/components/shared/Button.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }









var FollowStatus = {
  followed: 1,
  userCancel: 2,
  unknownError: 3
};
var AButton = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["createComponent"])({
  name: 'button'
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_1__["createNervClass"])({
  displayName: 'Button',
  mixins: [_utils_TestMixin__WEBPACK_IMPORTED_MODULE_5__["default"]],
  getDefaultProps: function getDefaultProps() {
    return {
      hoverStartTime: 20,
      hoverStayTime: 70,
      hoverClass: 'a-button-active'
    };
  },
  addFollow: function addFollow() {
    var _props = this.props;
    var publicId = _props.publicId;
    var onFollowLifestyle = _props.onFollowLifestyle;
    var $mp = _props.$mp;
    Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_3__["default"])('addFollow', {
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

      Object(_utils_callBridge__WEBPACK_IMPORTED_MODULE_4__["default"])('toast', {
        content: followed ? '关注成功' : '关注失败'
      });
    });
  },
  onButtonTap: function onButtonTap(e) {
    var _this = this;

    _utils_eventReg__WEBPACK_IMPORTED_MODULE_7__["getPropsEvent"].call(this, 'tap')(e);
    var _this$props = this.props,
        formType = _this$props.formType,
        openType = _this$props.openType,
        appParameter = _this$props.appParameter,
        $mp = _this$props.$mp;
    var form = this.context.form;

    if (form) {
      if (formType === 'submit') {
        form.submit(this.props.$mp.getDataset());
      } else if (formType === 'reset') {
        form.reset();
      }
    }

    if (openType === 'share') {
      var page = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])();

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
        Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_3__["default"])('getComponentAuth', {
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
      Object(_utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_3__["default"])('launchApp', {
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
      var _page = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])();

      if (_page && _page.publicInstance.onShareAppMessage) {
        _page.callRemote('self', 'shareToAlipayContact', $mp.getNormalizedEvent('share'));
      }
    } // trackTap(this);
    // this.logTestId();

  },
  render: function render() {
    var props = this.props;
    var type = props.type;

    if (props.plain) {
      type = 'ghost';
    }

    return _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement(_shared_Button__WEBPACK_IMPORTED_MODULE_8__["default"], _objectSpread({
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
    }, props.$mp.getAriaProps()), props.children);
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (AButton);

/***/ }),

/***/ "./src/components/checkbox-group/index.js":
/*!************************************************!*\
  !*** ./src/components/checkbox-group/index.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/extends.js");
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_eventReg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/eventReg */ "./src/utils/eventReg.js");
/* harmony import */ var _view_View__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../view/View */ "./src/components/view/View.js");
/* harmony import */ var _form_mixin__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../form/mixin */ "./src/components/form/mixin.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }






var CheckboxGroup = Object(_framework___WEBPACK_IMPORTED_MODULE_3__["createComponent"])({
  pure: false,
  name: 'checkbox-group'
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_2__["createNervClass"])({
  displayName: 'CheckboxGroup',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_6__["default"]],
  getChildContext: function getChildContext() {
    return {
      checkboxGroup: this
    };
  },
  onChange: function onChange(e) {
    var _e$detail = e.detail,
        value2 = _e$detail.value2,
        value = _e$detail.value;
    this.updateValue(value2, value); // const event = this.props.$mp.getNormalizedEvent(e, {
    //   detail: {
    //     value: this.state.value,
    //   },
    // });

    _utils_eventReg__WEBPACK_IMPORTED_MODULE_4__["getPropsEvent"].call(this, 'change')(e, {
      detail: {
        value: this.state.value
      }
    });
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
    var rest = _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_1___default()({}, this.props);

    return _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement(_view_View__WEBPACK_IMPORTED_MODULE_5__["default"], _objectSpread(_objectSpread({}, rest), {}, {
      role: 'group'
    }));
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (CheckboxGroup);

/***/ }),

/***/ "./src/components/checkbox/index.js":
/*!******************************************!*\
  !*** ./src/components/checkbox/index.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_eventReg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/eventReg */ "./src/utils/eventReg.js");
/* harmony import */ var _shared_Checkbox__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/Checkbox */ "./src/components/shared/Checkbox.js");




/* harmony default export */ __webpack_exports__["default"] = (Object(_framework___WEBPACK_IMPORTED_MODULE_1__["createComponent"])({
  pure: false,
  name: 'checkbox'
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_0__["createNervClass"])({
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
      e.detail = {
        value: checked,
        value2: this.props.value
      };
      context.checkboxGroup.onChange(e);
    } // const event = this.props.$mp.getNormalizedEvent(e, {
    //   detail: {
    //     value: checked,
    //   },
    // });


    _utils_eventReg__WEBPACK_IMPORTED_MODULE_2__["getPropsEvent"].call(this, 'change')(e, {
      detail: {
        value: checked
      }
    });
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
    return _nerv__WEBPACK_IMPORTED_MODULE_0__["default"].createElement(_shared_Checkbox__WEBPACK_IMPORTED_MODULE_3__["default"], {
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

/***/ "./src/components/form/mixin.js":
/*!**************************************!*\
  !*** ./src/components/form/mixin.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _form_mixin__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/form/mixin */ "./src/form/mixin.js");

/* harmony default export */ __webpack_exports__["default"] = (_form_mixin__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./src/components/icon/index.js":
/*!**************************************!*\
  !*** ./src/components/icon/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _shared_Loading__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/Loading */ "./src/components/shared/Loading.js");
/* harmony import */ var _shared_Icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../shared/Icon */ "./src/components/shared/Icon.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }





/* harmony default export */ __webpack_exports__["default"] = (Object(_framework___WEBPACK_IMPORTED_MODULE_3__["createComponent"])({
  name: 'icon'
})(function (props) {
  var $mp = props.$mp,
      className = props.className,
      style = props.style,
      id = props.id,
      type = props.type,
      mode = props.mode,
      otherProps = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(props, ["$mp", "className", "style", "id", "type", "mode"]);

  return _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement('span', _objectSpread(_objectSpread({
    className: className
  }, $mp && $mp.getAriaProps()), {}, {
    style: _objectSpread({}, style),
    id: id
  }), type === 'loading' ? _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement(_shared_Loading__WEBPACK_IMPORTED_MODULE_4__["default"], {
    mode: mode
  }) : _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement(_shared_Icon__WEBPACK_IMPORTED_MODULE_5__["default"], _objectSpread({
    type: type
  }, otherProps)));
}));

/***/ }),

/***/ "./src/components/image/index.js":
/*!***************************************!*\
  !*** ./src/components/image/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _view_View__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../view/View */ "./src/components/view/View.js");
/* harmony import */ var _modeStyle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./modeStyle */ "./src/components/image/modeStyle.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }





var ImageTag = 'img';
var widthFixStyle = {
  visibility: 'hidden',
  width: '100%'
};
/* harmony default export */ __webpack_exports__["default"] = (Object(_framework___WEBPACK_IMPORTED_MODULE_2__["createComponent"])({
  name: 'image'
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_1__["createNervClass"])({
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
    var _this$props2 = this.props,
        className = _this$props2.className,
        id = _this$props2.id,
        mode = _this$props2.mode,
        alt = _this$props2.alt,
        $mp = _this$props2.$mp,
        onTap = _this$props2.onTap,
        onLongTap = _this$props2.onLongTap,
        onTouchStart = _this$props2.onTouchStart,
        onTouchMove = _this$props2.onTouchMove,
        onTouchCancel = _this$props2.onTouchCancel,
        onTouchEnd = _this$props2.onTouchEnd,
        lazyLoad = _this$props2.lazyLoad;
    var _this$props3 = this.props,
        src = _this$props3.src,
        defaultSource = _this$props3.defaultSource,
        style = _this$props3.style;
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

    style = _objectSpread(_objectSpread({
      backgroundImage: src && lazyLoaded ? defaultSource ? "url(".concat(this.state.loaded ? src : defaultSource, ")") : "url(".concat(src, ")") : undefined
    }, style), _modeStyle__WEBPACK_IMPORTED_MODULE_4__["default"][mode]); // must has data props, or image onTap lose data

    var img = null;

    if (mode === 'widthFix' && lazyLoaded) {
      img = _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement(ImageTag, {
        src: src,
        style: widthFixStyle,
        onLoad: this.shouldOnLoad() ? this.onLoad : undefined,
        onError: this.shouldOnError() ? this.onError : undefined
      });
    }

    return _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement(_view_View__WEBPACK_IMPORTED_MODULE_3__["default"], _objectSpread(_objectSpread(_objectSpread({
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
    }, $mp.getAriaProps()), $mp.getDataProps()), onAppearProp), img);
  }
})));

/***/ }),

/***/ "./src/components/image/modeStyle.js":
/*!*******************************************!*\
  !*** ./src/components/image/modeStyle.js ***!
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

/***/ "./src/components/index.js":
/*!*********************************!*\
  !*** ./src/components/index.js ***!
  \*********************************/
/*! exports provided: Button, CheckBox, CheckBoxGroup, Icon, Image, Input, Label, Radio, RadioGroup, ScrollView, Text, View */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.less */ "./src/components/index.less");
/* harmony import */ var _index_less__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_index_less__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _button__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./button */ "./src/components/button/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Button", function() { return _button__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _checkbox__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./checkbox */ "./src/components/checkbox/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CheckBox", function() { return _checkbox__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _checkbox_group__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./checkbox-group */ "./src/components/checkbox-group/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CheckBoxGroup", function() { return _checkbox_group__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _icon__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./icon */ "./src/components/icon/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Icon", function() { return _icon__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _image__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./image */ "./src/components/image/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Image", function() { return _image__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _input__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./input */ "./src/components/input/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Input", function() { return _input__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _label__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./label */ "./src/components/label/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Label", function() { return _label__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _radio__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./radio */ "./src/components/radio/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Radio", function() { return _radio__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _radio_group__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./radio-group */ "./src/components/radio-group/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RadioGroup", function() { return _radio_group__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _scroll_view__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./scroll-view */ "./src/components/scroll-view/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ScrollView", function() { return _scroll_view__WEBPACK_IMPORTED_MODULE_10__["default"]; });

/* harmony import */ var _text__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./text */ "./src/components/text/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Text", function() { return _text__WEBPACK_IMPORTED_MODULE_11__["default"]; });

/* harmony import */ var _view__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./view */ "./src/components/view/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "View", function() { return _view__WEBPACK_IMPORTED_MODULE_12__["default"]; });


 // import Canvas from './canvas';






 // import Picker from './picker';








/***/ }),

/***/ "./src/components/index.less":
/*!***********************************!*\
  !*** ./src/components/index.less ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/components/input/index.js":
/*!***************************************!*\
  !*** ./src/components/input/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utils_focusInput__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/focusInput */ "./src/utils/focusInput.js");
/* harmony import */ var _utils_callBridge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/callBridge */ "./src/utils/callBridge.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_rgba2Color__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/rgba2Color */ "./src/utils/rgba2Color.js");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.js");
/* harmony import */ var _utils_callInternalAPI__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/callInternalAPI */ "./src/utils/callInternalAPI.js");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _form_mixin__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../form/mixin */ "./src/components/form/mixin.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }











var g = self;
var id = 0;
var cacheInputId = {};
var prefixCls = 'a-input';
var g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_5__["compareSystemVersion"])('10.1.38') >= 0;
var Input = Object(_framework___WEBPACK_IMPORTED_MODULE_9__["createComponent"])({
  name: 'input',
  pure: false
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_1__["createNervClass"])({
  displayName: 'Input',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_10__["default"]],
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
    return _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('div', {
      className: className,
      id: id,
      style: style,
      ref: this.saveContainer
    }, _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('div', {
      className: "".concat(prefixCls, "-wrap")
    }, (typeof value === 'string' && value.length === 0 || !value && value !== 0) && compositionValue === '' && placeholder && _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('div', {
      className: placeholderCls,
      style: placeholderStyle ? $mp.getNormalizedStyle(placeholderStyle) : {}
    }, _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('span', null, placeholder)), this.useNewInput ? _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('input', {
      ref: this.saveInput,
      style: {
        position: 'absolute',
        visibility: 'hidden',
        zIndex: 0
      },
      className: "".concat(prefixCls, "-content")
    }) : null, this.useNewInput ? _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('object', {
      className: "".concat(prefixCls, "-content"),
      id: this.getId(),
      type: 'application/view'
    }, _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('param', {
      name: 'type',
      value: 'input'
    }), _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('param', {
      name: 'id',
      value: this.getId()
    })) : _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('input', _objectSpread({
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

/***/ "./src/components/label/index.js":
/*!***************************************!*\
  !*** ./src/components/label/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/extends.js");
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_eventReg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/eventReg */ "./src/utils/eventReg.js");





/* harmony default export */ __webpack_exports__["default"] = (Object(_framework___WEBPACK_IMPORTED_MODULE_3__["createComponent"])({
  pure: false,
  name: 'label'
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_2__["createNervClass"])({
  onClick: function onClick(e) {
    var forProp = this.props["for"];

    if (forProp) {
      var input = document.querySelector("#".concat(forProp, " input,#").concat(forProp, " textarea"));

      if (input) {
        input.click();
        input.focus();
      }
    }

    _utils_eventReg__WEBPACK_IMPORTED_MODULE_4__["getPropsEvent"].call(this, 'tap')(e);
  },
  render: function render() {
    var _this$props = this.props,
        $mp = _this$props.$mp,
        children = _this$props.children,
        rest = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(_this$props, ["$mp", "children"]);

    return _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement("label", _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default()({}, rest, {
      onClick: this.onClick
    }), children);
  }
})));

/***/ }),

/***/ "./src/components/radio-group/index.js":
/*!*********************************************!*\
  !*** ./src/components/radio-group/index.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _form_mixin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../form/mixin */ "./src/components/form/mixin.js");
/* harmony import */ var _view_View__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../view/View */ "./src/components/view/View.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }





var RadioGroup = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["createComponent"])({
  pure: false,
  name: 'radio-group'
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_1__["createNervClass"])({
  displayName: 'RadioGroup',
  mixins: [_form_mixin__WEBPACK_IMPORTED_MODULE_3__["default"]],
  getChildContext: function getChildContext() {
    return {
      radioGroup: this
    };
  },
  getInitialState: function getInitialState() {
    this.radioListeners = [];
  },
  updateValue: function updateValue(value) {
    this.state.value = value;
  },
  onChange: function onChange(e) {
    this.state.value = e.detail.value;
    this.updateFormValue();
    this.radioListeners.forEach(function (fn) {
      return fn();
    });

    if (this.props.onChange) {
      this.props.onChange(this.props.$mp.getNormalizedEvent('change', {
        detail: {
          value: this.state.value
        }
      }));
    }
  },
  render: function render() {
    return _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement(_view_View__WEBPACK_IMPORTED_MODULE_4__["default"], _objectSpread(_objectSpread({}, this.props), {}, {
      role: 'radiogroup'
    }));
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (RadioGroup);

/***/ }),

/***/ "./src/components/radio/index.js":
/*!***************************************!*\
  !*** ./src/components/radio/index.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _shared_Checkbox__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/Checkbox */ "./src/components/shared/Checkbox.js");



var Radio = Object(_framework___WEBPACK_IMPORTED_MODULE_1__["createComponent"])({
  name: 'radio',
  pure: false
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_0__["createNervClass"])({
  displayName: 'Radio',
  // no formMixin, manage value by checkbox-group
  statics: {
    isFormControl: 1
  },
  getDefaultProps: function getDefaultProps() {
    return {
      checked: false,
      disabled: false,
      value: ''
    };
  },
  getInitialState: function getInitialState() {
    var state = {
      checked: !!this.props.checked
    };
    var context = this.context;
    var radioGroup = context.radioGroup;

    if (radioGroup) {
      radioGroup.radioListeners.push(this.onGroupNotify);

      if (state.checked) {
        radioGroup.updateValue(this.props.value);
      }
    }

    return state;
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    var context = this.context;
    var radioGroup = context.radioGroup;

    if (radioGroup) {
      if (radioGroup.isResetting) {
        this.setState({
          checked: this.props.value === radioGroup.state.value
        });
        return;
      }
    }

    if (this.props.checked !== prevProps.checked) {
      this.setState({
        checked: this.props.checked
      });

      if (radioGroup && this.props.checked) {
        radioGroup.updateValue(this.props.value);
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    var context = this.context;
    var radioGroup = context.radioGroup;

    if (radioGroup) {
      var index = radioGroup.radioListeners.indexOf(this.onGroupNotify);

      if (index !== -1) {
        radioGroup.radioListeners.splice(index, 1);
      }
    }
  },
  onGroupNotify: function onGroupNotify() {
    var context = this.context;
    var radioGroup = context.radioGroup;
    var shouldChecked = this.props.value === radioGroup.state.value;

    if (shouldChecked !== this.state.checked) {
      this.setState({
        checked: shouldChecked
      });
    }
  },
  onClick: function onClick() {
    if (!this.state.checked && !this.props.disabled) {
      this.onChange({
        target: {
          checked: true
        }
      });
    }
  },
  onChange: function onChange(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    var checked = e.target.checked;

    if (checked) {
      this.setState({
        checked: e.target.checked
      });
      var context = this.context;

      if (context.radioGroup) {
        context.radioGroup.onChange({
          detail: {
            value: this.props.value,
            checked: checked
          }
        });
      }
    }
  },
  render: function render() {
    var _this$props = this.props,
        disabled = _this$props.disabled,
        _this$props$className = _this$props.className,
        className = _this$props$className === void 0 ? '' : _this$props$className,
        id = _this$props.id,
        style = _this$props.style,
        color = _this$props.color;
    var checked = this.state.checked;
    return _nerv__WEBPACK_IMPORTED_MODULE_0__["default"].createElement(_shared_Checkbox__WEBPACK_IMPORTED_MODULE_2__["default"], {
      id: id,
      type: "radio",
      prefixCls: "a-radio",
      style: style,
      className: className,
      checked: checked,
      disabled: disabled,
      onChange: this.onChange,
      color: color
    });
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (Radio);

/***/ }),

/***/ "./src/components/scroll-view/index.js":
/*!*********************************************!*\
  !*** ./src/components/scroll-view/index.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _utils_throttle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/throttle */ "./src/utils/throttle.js");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_supportsPassive__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/supportsPassive */ "./src/utils/supportsPassive.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }








function easeInOut(currentTime, start, change, duration) {
  currentTime /= duration / 2;

  if (currentTime < 1) {
    return change / 2 * currentTime * currentTime + start;
  }

  currentTime -= 1;
  return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
}

var BASE_SCROLL_DURATION = 1;
var STATE = {
  STOPPED: 0,
  TRIGGERED: 1
};
var defaultStyle = {
  overflowY: 'hidden',
  overflowX: 'hidden',
  WebkitOverflowScrolling: 'touch'
};
var styles = {
  scrollX: {
    overflowY: 'hidden',
    overflowX: 'auto'
  },
  scrollY: {
    overflowX: 'hidden',
    overflowY: 'auto'
  }
};
var ScrollView = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["createComponent"])({
  pure: false,
  name: 'scroll-view'
})(Object(_nerv__WEBPACK_IMPORTED_MODULE_1__["createNervClass"])({
  displayName: 'ScrollView',
  getDefaultProps: function getDefaultProps() {
    return {
      scrollX: false,
      scrollY: false,
      upperThreshold: 50,
      lowerThreshold: 50,
      scrollLeft: 0,
      scrollTop: 0,
      scrollWithAnimation: false,
      enableBackToTop: false,
      trapScroll: false
    };
  },
  componentDidMount: function componentDidMount() {
    var _this$props = this.props,
        enableBackToTop = _this$props.enableBackToTop,
        scrollY = _this$props.scrollY;
    this.onScroll = Object(_utils_throttle__WEBPACK_IMPORTED_MODULE_3__["default"])(this.onScroll, 16);
    this._xUpperState = STATE.TRIGGERED;
    this._xLowerState = STATE.STOPPED;
    this._yUpperState = STATE.TRIGGERED;
    this._yLowerState = STATE.STOPPED;
    this.componentDidUpdate({});

    if (enableBackToTop && scrollY) {
      var event = _utils_system__WEBPACK_IMPORTED_MODULE_5__["isIOS"] ? 'statusBarClick' : 'titleClick';
      this.documentEvents = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_4__["default"])(document, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()({}, event, this.scrollToTop));
    }
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    this.bindEvents();
    var sv = this.scrollView;
    var _this$props2 = this.props,
        scrollLeft = _this$props2.scrollLeft,
        scrollTop = _this$props2.scrollTop,
        scrollWithAnimation = _this$props2.scrollWithAnimation,
        scrollX = _this$props2.scrollX,
        scrollY = _this$props2.scrollY,
        scrollIntoView = _this$props2.scrollIntoView;

    if (!scrollX && !scrollY) {
      return;
    } // scrollIntoView has High priority vs scrollLeft / scrollTop


    if (scrollIntoView && prevProps.scrollIntoView !== scrollIntoView) {
      var page = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])();
      var scrollIntoViewComponent = Object(_nerv__WEBPACK_IMPORTED_MODULE_1__["findDOMNode"])(page.refComponents[scrollIntoView]);

      if (scrollIntoViewComponent) {
        var boundingRect = scrollIntoViewComponent.getBoundingClientRect();
        var containerRect = sv.getBoundingClientRect();

        if (scrollX) {
          // use Animation
          if (scrollWithAnimation) {
            this.ScrollWithAnimationFn(sv, Math.max(sv.scrollLeft + boundingRect.left - containerRect.left, 0), false);
          } else {
            sv.scrollLeft = Math.max(sv.scrollLeft + boundingRect.left - containerRect.left, 0);
          }
        }

        if (scrollY) {
          if (scrollWithAnimation) {
            this.ScrollWithAnimationFn(sv, Math.max(sv.scrollTop + boundingRect.top - containerRect.top, 0), true);
          } else {
            sv.scrollTop = Math.max(sv.scrollTop + boundingRect.top - containerRect.top, 0);
          }
        }
      }
    } else {
      if (scrollX && scrollLeft !== undefined && prevProps.scrollLeft !== scrollLeft) {
        // use Animation
        if (scrollWithAnimation) {
          this.ScrollWithAnimationFn(sv, scrollLeft, false);
        } else {
          sv.scrollLeft = scrollLeft;
        }
      }

      if (scrollY && scrollTop !== undefined && prevProps.scrollTop !== scrollTop) {
        if (scrollWithAnimation) {
          this.ScrollWithAnimationFn(sv, scrollTop, true);
        } else {
          sv.scrollTop = scrollTop;
        }
      }
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.documentEvents) {
      this.documentEvents.remove();
    }

    this.bindEvents({});
  },
  bindEvents: function bindEvents(props) {
    var _ref = props || this.props,
        scrollY = _ref.scrollY,
        scrollX = _ref.scrollX;

    if (scrollX || scrollY) {
      if (!this.__binded) {
        this.__binded = true;
        this.scrollView.addEventListener('scroll', this.onScroll, _utils_supportsPassive__WEBPACK_IMPORTED_MODULE_6__["default"] ? {
          passive: true
        } : false);
      }
    } else if (this.__binded) {
      this.__binded = false;
      this.scrollView.removeEventListener('scroll', this.onScroll);
    }
  },
  scrollToTop: function scrollToTop() {
    var scrollView = this.scrollView;

    if (scrollView) {
      scrollView.scrollTop = 0;
      var offset = {
        x: scrollView.scrollLeft,
        y: scrollView.scrollTop
      };
      var contentSize = {
        width: scrollView.scrollWidth,
        height: scrollView.scrollHeight
      };
      var _this$props3 = this.props,
          onScroll = _this$props3.onScroll,
          $mp = _this$props3.$mp;

      if (onScroll) {
        var scrollEvent = $mp.getNormalizedEvent('scroll', {
          detail: {
            scrollLeft: offset.x,
            scrollTop: offset.y,
            scrollWidth: contentSize.width,
            scrollHeight: contentSize.height
          }
        });
        onScroll(scrollEvent);
      }
    }
  },
  runAnimationScroll: function runAnimationScroll(el, to, duration, prop) {
    var start = el[prop];
    var difference = to - start;
    var increment = 10;

    if (duration === 0) {
      el[prop] = to;
      return;
    }

    var animateScroll = function animateScroll(elapsedTime) {
      elapsedTime += increment;
      el[prop] = easeInOut(elapsedTime, start, difference, duration);

      if (elapsedTime < duration) {
        setTimeout(function () {
          animateScroll(elapsedTime);
        }, increment);
      }
    };

    animateScroll(0);
  },
  ScrollWithAnimationFn: function ScrollWithAnimationFn(el, to, isTop) {
    var scrollAnimationDuration = this.props.scrollAnimationDuration;
    var prop = isTop ? 'scrollTop' : 'scrollLeft';
    var duration = scrollAnimationDuration && scrollAnimationDuration > 0 ? scrollAnimationDuration : Math.abs(to - el[prop]) * BASE_SCROLL_DURATION;
    this.runAnimationScroll(el, to, duration, prop);
  },
  saveScrollView: function saveScrollView(scrollView) {
    this.scrollView = scrollView;
  },
  // handle onScroll Event
  onScroll: function onScroll() {
    var _this$props4 = this.props,
        onScroll = _this$props4.onScroll,
        onScrollToLower = _this$props4.onScrollToLower,
        onScrollToUpper = _this$props4.onScrollToUpper,
        scrollX = _this$props4.scrollX,
        scrollY = _this$props4.scrollY,
        upperThreshold = _this$props4.upperThreshold,
        lowerThreshold = _this$props4.lowerThreshold,
        trapScroll = _this$props4.trapScroll; // 根据clue报错，this.scrollView 可能为undefined

    if (!this.scrollView) {
      return;
    }

    var ev = this.scrollView;
    var offset = {
      x: ev.scrollLeft,
      y: ev.scrollTop
    };
    var contentSize = {
      width: ev.scrollWidth,
      height: ev.scrollHeight
    };
    var layoutMeasurement = {
      width: ev.clientWidth,
      height: ev.clientHeight
    }; // note: 执行 scroll 时 offset.x/y 不一定以 1 来递增/减
    // scrollY 和 scrollX 都为 false 的时候不滚动，和 wx 一致，方便移植
    // scroll-y onScrollToUpper

    if (scrollY && offset.y < upperThreshold) {
      if (onScrollToUpper && this._yUpperState === STATE.STOPPED) {
        this._yLowerState = STATE.STOPPED;
        onScrollToUpper(this.props.$mp.getNormalizedEvent('scrollToUpper'));
        this._yUpperState = STATE.TRIGGERED;
      }
    } else {
      this._yUpperState = STATE.STOPPED;
    } // scroll-y onScrollToLower


    if (contentSize.height - layoutMeasurement.height - offset.y < lowerThreshold) {
      if (scrollY && onScrollToLower && this._yLowerState === STATE.STOPPED) {
        this._yUpperState = STATE.STOPPED;
        onScrollToLower(this.props.$mp.getNormalizedEvent('scrollToLower'));
        this._yLowerState = STATE.TRIGGERED;
      }
    } else {
      this._yLowerState = STATE.STOPPED;
    } // scroll-x onScrollToUpper


    if (scrollX && offset.x < upperThreshold) {
      if (onScrollToUpper && this._xUpperState === STATE.STOPPED) {
        this._xLowerState = STATE.STOPPED;
        onScrollToUpper(this.props.$mp.getNormalizedEvent('scrollToUpper'));
        this._xUpperState = STATE.TRIGGERED;
      }
    } else {
      this._xUpperState = STATE.STOPPED;
    } // scroll-x onScrollToLower


    if (contentSize.width - layoutMeasurement.width - offset.x < lowerThreshold) {
      if (scrollX && onScrollToLower && this._xLowerState === STATE.STOPPED) {
        this._xUpperState = STATE.STOPPED;
        onScrollToLower(this.props.$mp.getNormalizedEvent('scrollToLower'));
        this._xLowerState = STATE.TRIGGERED;
      }
    } else {
      this._xLowerState = STATE.STOPPED;
    }

    if (onScroll) {
      if (trapScroll && scrollY) {
        if (offset.y === 1) {
          return;
        } else if (offset.y + ev.offsetHeight === ev.scrollHeight - 1) {
          return;
        }
      }

      var scrollEvent = this.props.$mp.getNormalizedEvent('scroll', {
        detail: {
          scrollLeft: offset.x,
          scrollTop: offset.y,
          scrollWidth: contentSize.width,
          scrollHeight: contentSize.height
        }
      }); // this.last=this.last || Date.now();
      // console.log('scroll',offset.x,Date.now()-this.last);
      // this.last=Date.now();

      onScroll(scrollEvent);
    }

    if (trapScroll && scrollY) {
      if (offset.y === 0) {
        ev.scrollTop = 1;
      } else if (offset.y + ev.offsetHeight === ev.scrollHeight) {
        ev.scrollTop = offset.y - 1;
      }
    }
  },
  render: function render() {
    var _this$props5 = this.props,
        scrollX = _this$props5.scrollX,
        scrollY = _this$props5.scrollY,
        children = _this$props5.children,
        style = _this$props5.style,
        className = _this$props5.className,
        id = _this$props5.id;

    var scrollViewStyle = _objectSpread(_objectSpread(_objectSpread(_objectSpread({}, defaultStyle), scrollX && styles.scrollX), scrollY && styles.scrollY), style);

    return _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement('div', {
      id: id,
      className: className,
      ref: this.saveScrollView,
      style: scrollViewStyle
    }, children);
  }
}));
/* harmony default export */ __webpack_exports__["default"] = (ScrollView);

/***/ }),

/***/ "./src/components/shared/Button.js":
/*!*****************************************!*\
  !*** ./src/components/shared/Button.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _Loading__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Loading */ "./src/components/shared/Loading.js");








function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }




var prefixCls = 'a-button';

var Button = /*#__PURE__*/function (_Nerv$PureComponent) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(Button, _Nerv$PureComponent);

  var _super = _createSuper(Button);

  function Button() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default()(this, Button);

    return _super.apply(this, arguments);
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default()(Button, [{
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
          $mp = _this$props.$mp,
          restProps = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(_this$props, ["children", "className", "type", "size", "disabled", "loading", "activeClassName", "activeStopPropagation", "onClick", "delayPressIn", "delayPressOut", "$mp"]);

      var wrapCls = classnames__WEBPACK_IMPORTED_MODULE_8___default()((_classnames = {}, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, className, true), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, "".concat(prefixCls, "-primary"), type === 'primary'), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, "".concat(prefixCls, "-ghost"), type === 'ghost'), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, "".concat(prefixCls, "-warn"), type === 'warn'), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, "".concat(prefixCls, "-small"), size === 'mini'), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, "".concat(prefixCls, "-disabled"), disabled), _classnames));
      var delayProps = {};

      if (delayPressIn) {
        delayProps.delayPressIn = delayPressIn;
      }

      if (delayPressOut) {
        delayProps.delayPressOut = delayPressOut;
      } // use div, button native is buggy @yiminghe


      return _nerv__WEBPACK_IMPORTED_MODULE_7__["default"].createElement('a', _objectSpread(_objectSpread({
        role: 'button',
        className: wrapCls
      }, restProps), {}, {
        onClick: disabled ? undefined : onClick,
        'aria-disabled': disabled
      }), loading ? _nerv__WEBPACK_IMPORTED_MODULE_7__["default"].createElement(_Loading__WEBPACK_IMPORTED_MODULE_9__["default"], {
        mode: type === 'primary' ? 'white' : ''
      }) : null, children);
    }
  }]);

  return Button;
}(_nerv__WEBPACK_IMPORTED_MODULE_7__["default"].PureComponent);

/* harmony default export */ __webpack_exports__["default"] = (Button);

/***/ }),

/***/ "./src/components/shared/Checkbox.js":
/*!*******************************************!*\
  !*** ./src/components/shared/Checkbox.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Checkbox; });
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/extends.js");
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _Icon__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Icon */ "./src/components/shared/Icon.js");








function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }





var Checkbox = /*#__PURE__*/function (_Nerv$PureComponent) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(Checkbox, _Nerv$PureComponent);

  var _super = _createSuper(Checkbox);

  function Checkbox() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_2___default()(this, Checkbox);

    return _super.apply(this, arguments);
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_3___default()(Checkbox, [{
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
      var wrapCls = classnames__WEBPACK_IMPORTED_MODULE_8___default()((_classnames = {
        'a-shared-checkbox': true,
        'a-shared-checkbox-disabled': disabled
      }, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(_classnames, className, true), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(_classnames, "".concat(prefixCls, "-checked"), checked), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(_classnames, "".concat(prefixCls, "-disabled"), disabled), _classnames));
      var colorProp = disabled ? {
        color: '#adadad'
      } : color ? {
        color: color
      } : {};
      return _nerv__WEBPACK_IMPORTED_MODULE_7__["default"].createElement("span", {
        className: wrapCls,
        style: style,
        id: id
      }, _nerv__WEBPACK_IMPORTED_MODULE_7__["default"].createElement("input", {
        type: type,
        disabled: disabled,
        className: "".concat(prefixCls, "-input"),
        checked: !!checked,
        onChange: onChange
      }), checked ? _nerv__WEBPACK_IMPORTED_MODULE_7__["default"].createElement(_Icon__WEBPACK_IMPORTED_MODULE_9__["default"], _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default()({
        type: type === 'radio' ? 'success' : 'success_no_circle',
        size: type === 'radio' ? 22 : 16
      }, colorProp)) : null);
    }
  }]);

  return Checkbox;
}(_nerv__WEBPACK_IMPORTED_MODULE_7__["default"].PureComponent);



/***/ }),

/***/ "./src/components/shared/Icon.js":
/*!***************************************!*\
  !*** ./src/components/shared/Icon.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _createSprite__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createSprite */ "./src/components/shared/createSprite.js");



function Icon(props) {
  var _props$size = props.size,
      size = _props$size === void 0 ? 23 : _props$size,
      type = props.type,
      color = props.color;
  Object(_createSprite__WEBPACK_IMPORTED_MODULE_1__["default"])(type);
  return _nerv__WEBPACK_IMPORTED_MODULE_0__["default"].createElement("svg", {
    className: "a-icon-svg a-icon-".concat(type),
    style: {
      width: size,
      height: size,
      fill: color
    }
  }, _nerv__WEBPACK_IMPORTED_MODULE_0__["default"].createElement("use", {
    xlinkHref: "#".concat(type)
  }));
}

/* harmony default export */ __webpack_exports__["default"] = (Icon);

/***/ }),

/***/ "./src/components/shared/Loading.js":
/*!******************************************!*\
  !*** ./src/components/shared/Loading.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_7__);







function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }



var prefix = 'a-loading';

var Loading = /*#__PURE__*/function (_Nerv$PureComponent) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default()(Loading, _Nerv$PureComponent);

  var _super = _createSuper(Loading);

  function Loading() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, Loading);

    return _super.apply(this, arguments);
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(Loading, [{
    key: "render",
    value: function render() {
      var _classnames;

      var wrapCls = classnames__WEBPACK_IMPORTED_MODULE_7___default()((_classnames = {}, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, "".concat(prefix, "-indicator"), true), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_classnames, "white", this.props.mode === 'white'), _classnames));
      return _nerv__WEBPACK_IMPORTED_MODULE_6__["default"].createElement("div", {
        className: wrapCls,
        "aria-hidden": true
      }, _nerv__WEBPACK_IMPORTED_MODULE_6__["default"].createElement("div", {
        className: "".concat(prefix, "-item")
      }), _nerv__WEBPACK_IMPORTED_MODULE_6__["default"].createElement("div", {
        className: "".concat(prefix, "-item")
      }), _nerv__WEBPACK_IMPORTED_MODULE_6__["default"].createElement("div", {
        className: "".concat(prefix, "-item")
      }));
    }
  }]);

  return Loading;
}(_nerv__WEBPACK_IMPORTED_MODULE_6__["default"].PureComponent);

/* harmony default export */ __webpack_exports__["default"] = (Loading);

/***/ }),

/***/ "./src/components/shared/assets/svgData.js":
/*!*************************************************!*\
  !*** ./src/components/shared/assets/svgData.js ***!
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

/***/ "./src/components/shared/createSprite.js":
/*!***********************************************!*\
  !*** ./src/components/shared/createSprite.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createSprite; });
/* harmony import */ var _assets_svgData__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./assets/svgData */ "./src/components/shared/assets/svgData.js");

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

/***/ "./src/components/text/index.js":
/*!**************************************!*\
  !*** ./src/components/text/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _text__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/text */ "./src/text/index.js");

/* harmony default export */ __webpack_exports__["default"] = (_text__WEBPACK_IMPORTED_MODULE_0__["default"]);

/***/ }),

/***/ "./src/components/view/View.js":
/*!*************************************!*\
  !*** ./src/components/view/View.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _view_View__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/view/View */ "./src/view/View.js");
/* harmony import */ var _utils_TestMixin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/TestMixin */ "./src/utils/TestMixin.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }




/* harmony default export */ __webpack_exports__["default"] = (Object(_nerv__WEBPACK_IMPORTED_MODULE_1__["createNervClass"])({
  displayName: 'View',
  mixins: [_utils_TestMixin__WEBPACK_IMPORTED_MODULE_3__["default"]],
  render: function render() {
    var props = this.props;
    return _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement(_view_View__WEBPACK_IMPORTED_MODULE_2__["default"], _objectSpread(_objectSpread({}, props), {}, {
      userProps: props
    }));
  }
}));

/***/ }),

/***/ "./src/components/view/index.js":
/*!**************************************!*\
  !*** ./src/components/view/index.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");
/* harmony import */ var _View__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./View */ "./src/components/view/View.js");


/* harmony default export */ __webpack_exports__["default"] = (Object(_framework___WEBPACK_IMPORTED_MODULE_0__["createComponent"])({
  pure: false,
  name: 'view'
})(_View__WEBPACK_IMPORTED_MODULE_1__["default"]));

/***/ }),

/***/ "./src/form/mixin.js":
/*!***************************!*\
  !*** ./src/form/mixin.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
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

/***/ "./src/framework/App/index.js":
/*!************************************!*\
  !*** ./src/framework/App/index.js ***!
  \************************************/
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

/***/ "./src/framework/Component/index.js":
/*!******************************************!*\
  !*** ./src/framework/Component/index.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Component; });
/* harmony import */ var _ComponentRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ComponentRegistry */ "./src/framework/ComponentRegistry/index.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../legacy/CustomComponent */ "./src/framework/legacy/CustomComponent.js");



function Component(setupConfig) {
  var is = setupConfig.is;
  _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].componentsConfig[is] = {
    system: setupConfig
  };
  _ComponentRegistry__WEBPACK_IMPORTED_MODULE_0__["default"].registerComponent(is, function () {
    return Object(_legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_2__["default"])(is);
  });
}

/***/ }),

/***/ "./src/framework/ComponentRegistry/getComponentClass.js":
/*!**************************************************************!*\
  !*** ./src/framework/ComponentRegistry/getComponentClass.js ***!
  \**************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index */ "./src/framework/ComponentRegistry/index.js");


function getComponentClass(is) {
  return _index__WEBPACK_IMPORTED_MODULE_0__["default"].getComponent(is);
}

/* harmony default export */ __webpack_exports__["default"] = (getComponentClass);

/***/ }),

/***/ "./src/framework/ComponentRegistry/index.js":
/*!**************************************************!*\
  !*** ./src/framework/ComponentRegistry/index.js ***!
  \**************************************************/
/*! exports provided: componentRegistry, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "componentRegistry", function() { return componentRegistry; });
var componentRegistry = {};
var ComponentRegistry = {
  registerComponent: function registerComponent(is, factory) {
    if (componentRegistry[is]) {
      return;
    }

    componentRegistry[is] = factory;
  },
  getComponent: function getComponent(is) {
    return componentRegistry[is] && componentRegistry[is]();
  }
};
/* harmony default export */ __webpack_exports__["default"] = (ComponentRegistry);

/***/ }),

/***/ "./src/framework/EventHub.js":
/*!***********************************!*\
  !*** ./src/framework/EventHub.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/EventEmitter */ "./src/utils/EventEmitter.js");

/* harmony default export */ __webpack_exports__["default"] = (new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_0__["default"]());

/***/ }),

/***/ "./src/framework/Page/index.js":
/*!*************************************!*\
  !*** ./src/framework/Page/index.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Page; });
/* harmony import */ var _PageRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PageRegistry */ "./src/framework/PageRegistry/index.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _legacy_PageComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../legacy/PageComponent */ "./src/framework/legacy/PageComponent.js");



function Page(setupConfig) {
  var pagePath = setupConfig.pagePath,
      tabIndex = setupConfig.tabIndex;

  if (typeof tabIndex === 'number') {
    _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].tabsConfig[pagePath] = tabIndex;
  }

  _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].pagesConfig[pagePath] = {
    system: setupConfig
  };
  _PageRegistry__WEBPACK_IMPORTED_MODULE_0__["default"].registerComponent(pagePath, function () {
    return _legacy_PageComponent__WEBPACK_IMPORTED_MODULE_2__["default"];
  });
}

/***/ }),

/***/ "./src/framework/PageRegistry/index.js":
/*!*********************************************!*\
  !*** ./src/framework/PageRegistry/index.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// app注册page
var pageRegistry = {};
var PageRegistry = {
  registerComponent: function registerComponent(name, factory) {
    // name即pagePath
    // factory即() => RC
    pageRegistry[name] = factory;
  },
  getComponent: function getComponent(name) {
    return pageRegistry[name] && pageRegistry[name]();
  },
  getRunnable: function getRunnable(name) {
    return PageRegistry.getComponent(name);
  }
};
/* harmony default export */ __webpack_exports__["default"] = (PageRegistry);

/***/ }),

/***/ "./src/framework/Platform/index.js":
/*!*****************************************!*\
  !*** ./src/framework/Platform/index.js ***!
  \*****************************************/
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

/***/ "./src/framework/StyleSheet/index.web.js":
/*!***********************************************!*\
  !*** ./src/framework/StyleSheet/index.web.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_mergeArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/mergeArray */ "./src/utils/mergeArray.js");


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

/***/ "./src/framework/SubPackage/index.js":
/*!*******************************************!*\
  !*** ./src/framework/SubPackage/index.js ***!
  \*******************************************/
/*! exports provided: loadPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "loadPage", function() { return loadPage; });
/* harmony import */ var _utils_startsWith__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/startsWith */ "./src/utils/startsWith.js");
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/startupParams */ "./src/utils/startupParams/index.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");



var g = self;

function getSubPackageByPage(page) {
  var mpAppJson = g.mpAppJson;

  if (!mpAppJson || !mpAppJson.app.subPackages) {
    return false;
  }

  var subPackages = mpAppJson.app.subPackages;

  for (var i = 0; i < subPackages.length; i++) {
    var p = subPackages[i];

    if (Object(_utils_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(page, "".concat(p.root, "/"))) {
      return p.root;
    }
  }

  return false;
}

var packageMap = {};
var packageListeners = {};

g.bootstrapSubPackage = function (subPackage, _ref) {
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
  var isCli = Object(_utils_startupParams__WEBPACK_IMPORTED_MODULE_1__["getStartupParams"])().mpCli;
  var subPackage = getSubPackageByPage(pagePath);

  if (subPackage) {
    var callBridge = _common_global__WEBPACK_IMPORTED_MODULE_2__["default"].bridge.call;

    if (packageMap[subPackage]) {
      doLoad();
    } else {
      var doLoadScript = function doLoadScript() {
        loadPackageScript(subPackage, function () {
          if (isWorker) {
            _common_global__WEBPACK_IMPORTED_MODULE_2__["default"].bridge.call('hideLoading');
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

/***/ "./src/framework/common/commonLogic.js":
/*!*********************************************!*\
  !*** ./src/framework/common/commonLogic.js ***!
  \*********************************************/
/*! exports provided: $global, Page, App, getApp, getCurrentPages, Component */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./global */ "./src/framework/common/global.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _global__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _Page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Page */ "./src/framework/Page/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _Page__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["getCurrentPages"]; });

/* harmony import */ var _Component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Component */ "./src/framework/Component/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _Component__WEBPACK_IMPORTED_MODULE_3__["default"]; });







/***/ }),

/***/ "./src/framework/common/commonUI.js":
/*!******************************************!*\
  !*** ./src/framework/common/commonUI.js ***!
  \******************************************/
/*! exports provided: StyleSheet, createComponent, getComponentClass */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _StyleSheet_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../StyleSheet/index */ "./src/framework/StyleSheet/index.web.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StyleSheet", function() { return _StyleSheet_index__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _createComponent__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../createComponent */ "./src/framework/createComponent/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComponent", function() { return _createComponent__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ComponentRegistry/getComponentClass */ "./src/framework/ComponentRegistry/getComponentClass.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getComponentClass", function() { return _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__["default"]; });






/***/ }),

/***/ "./src/framework/common/global.js":
/*!****************************************!*\
  !*** ./src/framework/common/global.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var $global = {
  tabsConfig: {},
  pagesConfig: {},
  componentsConfig: {},
  currentPageConfig: null,
  currentComponentConfig: null
};
/* harmony default export */ __webpack_exports__["default"] = ($global);

/***/ }),

/***/ "./src/framework/createComponent/index.js":
/*!************************************************!*\
  !*** ./src/framework/createComponent/index.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createComponent; });
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! hoist-non-react-statics */ "./node_modules/hoist-non-react-statics/dist/hoist-non-react-statics.cjs.js");
/* harmony import */ var hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.js");
/* harmony import */ var _utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/resolvePageUrl */ "./src/framework/utils/resolvePageUrl.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _utils_camelCase__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/camelCase */ "./src/framework/utils/camelCase.js");
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../Platform */ "./src/framework/Platform/index.js");
/* harmony import */ var _normalizeStyle__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./normalizeStyle */ "./src/framework/createComponent/normalizeStyle.js");
/* harmony import */ var _normalizeClassNameProps__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./normalizeClassNameProps */ "./src/framework/createComponent/normalizeClassNameProps.js");
/* harmony import */ var _mixins_PureRenderMixin__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../mixins/PureRenderMixin */ "./src/framework/mixins/PureRenderMixin.js");
/* harmony import */ var _mixins_TrackPageUpdateMixin__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../mixins/TrackPageUpdateMixin */ "./src/framework/mixins/TrackPageUpdateMixin.js");
/* harmony import */ var _mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../mixins/BasicEventMixin */ "./src/framework/mixins/BasicEventMixin.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }















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
      src = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_6__["default"])(source, page || Object(_App__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"])());
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

    mixins.push(_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_14__["default"]);
    var Container = Object(_nerv__WEBPACK_IMPORTED_MODULE_2__["createNervClass"])({
      displayName: "MP(".concat(tagName, ")"),
      mixins: mixins,
      getInitialState: function getInitialState() {
        this.$mp = _objectSpread(_objectSpread({}, this.$mp), {}, {
          bridge: _common_global__WEBPACK_IMPORTED_MODULE_7__["default"].bridge,
          // getTargetForEvent: this.getTargetForEvent,
          getDataset: this.getDataset,
          getNormalizedEvent: this.getNormalizedEvent,
          getNormalizedStyle: this.getNormalizedStyle,
          getAriaProps: this.getAriaProps,
          getDataProps: this.getDataProps,
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
        return Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(props).reduce(function (prev, key) {
          if (key === 'role' || key.match(/^aria[A-Z\-]/)) {
            prev[key] = props[key];
          }

          return prev;
        }, {});
      },
      getDataProps: function getDataProps() {
        var props = this.props;
        return Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(props).reduce(function (prev, key) {
          if (key.slice(0, 5) === 'data-') {
            prev[key] = props[key];
          }

          return prev;
        }, {});
      },
      getDataset: function getDataset() {
        var props = this.props;
        var dataset = {};
        Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(props).forEach(function (n) {
          if (n.slice(0, 5) === 'data-') {
            var key = Object(_utils_camelCase__WEBPACK_IMPORTED_MODULE_8__["default"])(n.slice(5));
            dataset[key] = props[n];
          }
        });
        return dataset;
      },
      // getTargetForEvent() {
      //   const { props } = this;
      //   return {
      //     id: props.id,
      //     tagName,
      //     dataset: this.getDataset(),
      //   };
      // },
      // /* 格式化event对象 */
      // getNormalizedEvent(eventParam, other) {
      //   let eventType = eventParam;
      //   let srcEvent;
      //   if (eventType.eventType) {
      //     srcEvent = eventType.srcEvent;
      //     eventType = eventType.eventType;
      //   }
      //   const nativeEvent = srcEvent && srcEvent.nativeEvent || srcEvent;
      //   const currentTarget = this.getTargetForEvent();
      //   let target = nativeEvent && nativeEvent.$target || currentTarget;
      //   if (nativeEvent && !nativeEvent.$target) {
      //     nativeEvent.$target = target;
      //   }
      //   // bug compatibility
      //   target = {
      //     targetDataset: target.dataset,
      //     ...target,
      //     dataset: currentTarget.dataset,
      //   };
      //   return {
      //     type: eventType,
      //     timeStamp: Date.now(),
      //     target,
      //     currentTarget,
      //     ...other,
      //   };
      // },
      saveRef: function saveRef(c) {
        this.wrappedComponent = c;
      },
      getWrappedComponent: function getWrappedComponent() {
        return this.wrappedComponent;
      },
      $getNormalizedProps: function $getNormalizedProps() {
        var _this$props = this.props,
            slot = _this$props.slot,
            props = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default()(_this$props, ["slot"]);

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

        return _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement(WrappedComponent, props);
      }
    });
    var RetComponent = hoist_non_react_statics__WEBPACK_IMPORTED_MODULE_3___default()(Container, WrappedComponent);
    var $numProps = [];
    var defaultProps = WrappedComponent.defaultProps;

    if (defaultProps) {
      Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(defaultProps).forEach(function (prop) {
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

/***/ "./src/framework/createComponent/normalizeClassNameProps.js":
/*!******************************************************************!*\
  !*** ./src/framework/createComponent/normalizeClassNameProps.js ***!
  \******************************************************************/
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

/***/ "./src/framework/createComponent/normalizeClassNameStyle.js":
/*!******************************************************************!*\
  !*** ./src/framework/createComponent/normalizeClassNameStyle.js ***!
  \******************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeClassNameStyle; });
function normalizeClassNameStyle(totalStyle) {
  return totalStyle;
}

/***/ }),

/***/ "./src/framework/createComponent/normalizeStyle.js":
/*!*********************************************************!*\
  !*** ./src/framework/createComponent/normalizeStyle.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeStyle; });
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Platform */ "./src/framework/Platform/index.js");
/* harmony import */ var _utils_transformStyle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/transformStyle */ "./src/framework/utils/transformStyle.js");
/* harmony import */ var _normalizeClassNameStyle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./normalizeClassNameStyle */ "./src/framework/createComponent/normalizeClassNameStyle.js");




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

/***/ "./src/framework/index.js":
/*!********************************!*\
  !*** ./src/framework/index.js ***!
  \********************************/
/*! exports provided: EventHub, App, setCurrentPageImpl, getCurrentPageImpl, getCurrentPagesImpl, getApp, getAppImpl, getCurrentPages, getStartupParams, setStartupParams, Component, getComponentClass, StyleSheet, createComponent, Page, $global */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/env */ "./src/framework/utils/env.js");
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_utils_env__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _web_bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./web/bootstrap */ "./src/framework/web/bootstrap.js");
/* harmony import */ var _common_commonUI__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./common/commonUI */ "./src/framework/common/commonUI.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getComponentClass", function() { return _common_commonUI__WEBPACK_IMPORTED_MODULE_3__["getComponentClass"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "StyleSheet", function() { return _common_commonUI__WEBPACK_IMPORTED_MODULE_3__["StyleSheet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createComponent", function() { return _common_commonUI__WEBPACK_IMPORTED_MODULE_3__["createComponent"]; });

/* harmony import */ var _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./common/commonLogic */ "./src/framework/common/commonLogic.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["getCurrentPages"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["Component"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["Page"]; });

/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./common/global */ "./src/framework/common/global.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _common_global__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./startupParams */ "./src/framework/startupParams/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return _startupParams__WEBPACK_IMPORTED_MODULE_6__["getStartupParams"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return _startupParams__WEBPACK_IMPORTED_MODULE_6__["setStartupParams"]; });

/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./EventHub */ "./src/framework/EventHub.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EventHub", function() { return _EventHub__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./App */ "./src/framework/App/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setCurrentPageImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_8__["setCurrentPageImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPageImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_8__["getCurrentPageImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPagesImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_8__["getCurrentPagesImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getAppImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_8__["getAppImpl"]; });










var g = self;

function ready(callback) {
  callback();
}

g.onerror = function onerror() {
  var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var url = arguments.length > 1 ? arguments[1] : undefined;
  var line = arguments.length > 2 ? arguments[2] : undefined;
  var col = arguments.length > 3 ? arguments[3] : undefined;
  var error = arguments.length > 4 ? arguments[4] : undefined;
  var stack = [];

  try {
    stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
  } catch (e) {}

  var args = [msg, url, line, col, error];
  console.error('[RENDER] onerror', args);
};

g.bootstrapApp = function bootstrapApp() {
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
    Object(_startupParams__WEBPACK_IMPORTED_MODULE_6__["setStartupParams"])(startupParams);

    if (location.hash.length > 1) {
      Object(_utils_log__WEBPACK_IMPORTED_MODULE_1__["debug"])('framework', '[RENDER] bootstrap page');
      Object(_web_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"])({
        container: container,
        onRender: onRender,
        onFail: onFail,
        type: 'initial hash'
      }, bridge);
    } else {
      window.addEventListener('hashchange', function () {
        Object(_utils_log__WEBPACK_IMPORTED_MODULE_1__["debug"])('framework', '[RENDER] bootstrap page when hashchange');
        Object(_web_bootstrap__WEBPACK_IMPORTED_MODULE_2__["default"])({
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

/***/ "./src/framework/legacy/CustomComponent.js":
/*!*************************************************!*\
  !*** ./src/framework/legacy/CustomComponent.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/extends */ "./node_modules/@babel/runtime/helpers/extends.js");
/* harmony import */ var _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/setData */ "./src/utils/setData.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/consts */ "./src/utils/consts.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _mixins_PureRenderMixin__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../mixins/PureRenderMixin */ "./src/framework/mixins/PureRenderMixin.js");
/* harmony import */ var _mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../mixins/BasicEventMixin */ "./src/framework/mixins/BasicEventMixin.js");
/* harmony import */ var _utils_transformChildrenToSlots__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../utils/transformChildrenToSlots */ "./src/framework/utils/transformChildrenToSlots.js");
/* harmony import */ var _utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../utils/normalizeComponentProps */ "./src/framework/utils/normalizeComponentProps.js");
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../../utils/types */ "./src/utils/types.js");




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }













var componentId = 1;
var mountedComponents;
var unmountedComponents;

function reset() {
  mountedComponents = [];
  unmountedComponents = [];
}

reset();
_EventHub__WEBPACK_IMPORTED_MODULE_9__["default"].addListener(['pageLoad', 'pageReady', 'pageUpdate'], function (e) {
  var _objectSpread2;

  e.payload = _objectSpread(_objectSpread({}, e.payload || {}), (_objectSpread2 = {}, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(_objectSpread2, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["PayloadKeyMountedComponents"], mountedComponents), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(_objectSpread2, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["PayloadKeyUnmountedComponents"], unmountedComponents), _objectSpread2));
  reset();
});
var renderCache = {};

function getRender(is) {
  if (is in renderCache) {
    return renderCache[is];
  }

  var setupConfig = _common_global__WEBPACK_IMPORTED_MODULE_8__["default"].componentsConfig[is].system;
  var _render = setupConfig.render;

  var render = _render();

  render = render["default"] || render;
  renderCache[is] = render;
  return render;
}

/* harmony default export */ __webpack_exports__["default"] = (function (is) {
  return Object(_nerv__WEBPACK_IMPORTED_MODULE_3__["createNervClass"])({
    $isCustomComponent: true,
    displayName: is,
    mixins: [_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_11__["default"], _mixins_PureRenderMixin__WEBPACK_IMPORTED_MODULE_10__["default"]],
    statics: {
      is: is,
      getDerivedStateFromProps: function getDerivedStateFromProps(nextProps, state) {
        var __page = nextProps.__page;
        var properties = __page.customComponents[is].properties;
        var changedProps = {};

        for (var key in nextProps) {
          if (nextProps.hasOwnProperty(key)) {
            var nextProp = nextProps[key];

            if (properties.hasOwnProperty(key) && Object(_utils_types__WEBPACK_IMPORTED_MODULE_14__["getType"])(nextProp) === properties[key].type) {
              changedProps[key] = nextProp;
            }
          }
        }

        return _objectSpread(_objectSpread({}, state), changedProps);
      }
    },
    getInitialState: function getInitialState() {
      var _this$props = this.props,
          __page = _this$props.__page,
          id = _this$props.id;
      this.is = is;
      this.id = this.id || ++componentId;
      var _page$customComponen = __page.customComponents[is],
          properties = _page$customComponen.properties,
          data = _page$customComponen.data;
      this.properties = properties;
      this.eventHandlers = {};
      this.prevProps = {};
      __page.componentInstances[this.id] = this;

      __page.callRemote('self', 'fireComponentLifecycle', this.recordMounted(false), 'created');

      return _objectSpread({}, data);
    },
    componentDidMount: function componentDidMount() {
      var __page = this.props.__page;
      var info = this.recordMounted(this.diffProps(this.prevProps));

      __page.callRemote('self', 'fireComponentLifecycle', info, 'attached');

      this.prevProps = this.props;
    },
    onAttachedReady: function onAttachedReady() {
      var __page = this.props.__page;
      var info = this.recordMounted(this.diffProps(this.prevProps));

      __page.callRemote('self', 'fireComponentLifecycle', info, 'ready');
    },
    componentDidUpdate: function componentDidUpdate(prevProps) {
      var diffProps = this.diffProps(prevProps);

      if (diffProps) {
        this.recordMounted(diffProps);
      }
    },
    componentWillUnmount: function componentWillUnmount() {
      var __page = this.props.__page;
      delete __page.componentInstances[this.id];
      unmountedComponents.push(this.id);

      __page.callRemote('self', 'fireComponentLifecycle', this.recordMounted(false), 'unload');
    },
    setData: function setData(toBeData, callback) {
      var data = this.state;
      var ret = data;

      if (Array.isArray(toBeData)) {
        toBeData.forEach(function (d) {
          // immutable for shouldComponentUpdate
          ret = Object(_utils_setData__WEBPACK_IMPORTED_MODULE_4__["getOpFn"])(d.op)(ret, d.data);
        });
      } else {
        ret = Object(_utils_setData__WEBPACK_IMPORTED_MODULE_4__["getOpFn"])(toBeData.op)(ret, toBeData.data);
      }

      this.setState(_objectSpread({}, ret), callback);
    },
    recordMounted: function recordMounted(diffProps) {
      var _info;

      var id = this.props.id;
      var info = (_info = {}, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(_info, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["ComponentKeyId"], this.id), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(_info, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["ComponentKeyIs"], this.is), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(_info, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["ComponentPropsId"], id), _info);
      mountedComponents.push(info);

      if (diffProps) {
        var _this$normalizeProps = this.normalizeProps(diffProps),
            newProps = _this$normalizeProps.newProps;

        info[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["ComponentKeyDiffProps"]] = newProps;
      }

      return info;
    },
    diffProps: function diffProps(prevProps) {
      var _this$properties = this.properties,
          properties = _this$properties === void 0 ? {} : _this$properties;
      var props = this.props; // 当前props

      var deleted = [];
      var updated = {};
      var isUpdated;
      var isDeleted;
      Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(Object(_utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_13__["default"])(prevProps)).forEach(function (prevKey) {
        var prevProp = prevProps[prevKey];

        if (properties.hasOwnProperty(prevKey) && Object(_utils_types__WEBPACK_IMPORTED_MODULE_14__["getType"])(prevProp) === properties[prevKey].type) {
          if (!(prevKey in props)) {
            deleted.push(prevKey);
            isDeleted = true;
          } else if (prevProp !== props[prevKey]) {
            updated[prevKey] = props[prevKey];
            isUpdated = true;
          }
        }
      });
      Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(Object(_utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_13__["default"])(props)).forEach(function (key) {
        var prop = props[key];

        if (properties.hasOwnProperty(key) && Object(_utils_types__WEBPACK_IMPORTED_MODULE_14__["getType"])(prop) === properties[key].type) {
          if (!(key in prevProps)) {
            updated[key] = prop;
            isUpdated = true;
          }
        }
      });
      var ret;

      if (isUpdated) {
        ret = ret || {};
        ret[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyUpdated"]] = updated;
      }

      if (isDeleted) {
        ret = ret || {};
        ret[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyDeleted"]] = deleted;
      }

      return ret;
    },
    normalizeProps: function normalizeProps(props) {
      var newProps = {};

      if (props[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyDeleted"]]) {
        newProps[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyDeleted"]] = props[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyDeleted"]];
      }

      if (props[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyUpdated"]]) {
        newProps[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyUpdated"]] = _objectSpread({}, props[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyUpdated"]]);
      }

      return {
        newProps: newProps
      };
    },
    $getEventHandler: function $getEventHandler(name) {
      var _this = this;

      if (!name || typeof name !== 'string') {
        return name;
      }

      var eventHandlers = this.eventHandlers;
      var __page = this.props.__page;

      if (!eventHandlers[name]) {
        var handle = function handle(e, more) {
          var event = _this.getNormalizedEvent(e, more);

          __page.callRemote.apply(__page, ['self', 'triggerComponentEvent', _this.id, name].concat(event));
        };

        handle.handleName = name;
        handle.type = 'component';
        handle.id = this.id;
        eventHandlers[name] = handle;
      }

      return eventHandlers[name];
    },
    $getRefHandler: function $getRefHandler() {
      var _page$$getRefHandler;

      var __page = this.props.__page;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_page$$getRefHandler = __page.$getRefHandler).call.apply(_page$$getRefHandler, [__page].concat(args));
    },
    triggerEvent: function triggerEvent(eventName, detail, options) {
      var event = new CustomEvent(eventName, _objectSpread({
        detail: detail
      }, options));
      this.root.dispatchEvent(event);
    },
    render: function render() {
      var _this2 = this;

      var _this$props2 = this.props,
          children = _this$props2.children,
          $scopedSlots = _this$props2.$scopedSlots;
      var props = Object(_utils_normalizeComponentProps__WEBPACK_IMPORTED_MODULE_13__["default"])(this.props);
      var $slots = Object(_utils_transformChildrenToSlots__WEBPACK_IMPORTED_MODULE_12__["default"])(children);

      var id = props.id,
          className = props.className,
          rest = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(props, ["id", "className"]);

      return _nerv__WEBPACK_IMPORTED_MODULE_3__["default"].createElement("span", _babel_runtime_helpers_extends__WEBPACK_IMPORTED_MODULE_0___default()({
        ref: function ref(_ref) {
          return _this2.root = _ref;
        },
        id: id,
        className: className
      }, rest), getRender(is).call(this, _objectSpread(_objectSpread({
        $id: this.id,
        $scopedSlots: $scopedSlots,
        $slots: $slots
      }, rest), this.state)));
    }
  });
});

/***/ }),

/***/ "./src/framework/legacy/PageComponent.js":
/*!***********************************************!*\
  !*** ./src/framework/legacy/PageComponent.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.js");
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/consts */ "./src/utils/consts.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/setData */ "./src/utils/setData.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../mixins/BasicEventMixin */ "./src/framework/mixins/BasicEventMixin.js");
/* harmony import */ var _mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../mixins/MessageHandleMixin */ "./src/framework/mixins/MessageHandleMixin.js");
/* harmony import */ var _mixins_RefMixin__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../mixins/RefMixin */ "./src/framework/mixins/RefMixin.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _utils_unit__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../utils/unit */ "./src/framework/utils/unit.js");
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../Platform */ "./src/framework/Platform/index.js");
/* harmony import */ var _Scene__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./Scene */ "./src/framework/legacy/Scene.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
















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

  var stylesheet = _stylesheet && (_stylesheet["default"] || _stylesheet);
  styleSheetCaches[pagePath] = stylesheet;
  return stylesheet;
}

var renderCache = {};

function getRender(pagePath) {
  if (pagePath in renderCache) {
    return renderCache[pagePath];
  }

  var setupConfig = _common_global__WEBPACK_IMPORTED_MODULE_13__["default"].pagesConfig[pagePath].system;
  var _render = setupConfig.render; // lazy require xml and css

  var render = _render();

  render = render["default"] || render;
  renderCache[pagePath] = render;
  return render;
}

/* harmony default export */ __webpack_exports__["default"] = (Object(_nerv__WEBPACK_IMPORTED_MODULE_2__["createNervClass"])({
  $isCustomComponent: false,
  displayName: 'PageComponent',
  mixins: [_mixins_BasicEventMixin__WEBPACK_IMPORTED_MODULE_8__["default"], _mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_9__["default"], _mixins_RefMixin__WEBPACK_IMPORTED_MODULE_10__["default"]],
  getInitialState: function getInitialState() {
    var pagePath = this.props.pagePath;
    this.pagePath = pagePath;
    this.pageType = 'RENDER';
    this.eventHandlers = {};
    this.onShowReadyCallbacks = [];
    this.componentInstances = {};
    this.self = this;
    this.publicInstance = {};
    return {
      __InitialDataReady__: false
    };
  },
  componentDidMount: function componentDidMount() {
    this.insertStyle();
    Object.assign(this, {
      bridge: _common_global__WEBPACK_IMPORTED_MODULE_13__["default"].bridge,
      renderSeq: 1
    });
    Object(_App__WEBPACK_IMPORTED_MODULE_11__["setCurrentPageImpl"])(this);
    this.initMessageChannel();
  },
  UNSAFE_componentWillUpdate: function UNSAFE_componentWillUpdate() {
    this.renderSeq += 1;
  },
  insertStyle: function insertStyle() {
    var headNode = document.getElementsByTagName('head')[0]; // special for 1rpx or 2rpx

    var remReg = Object(_utils_unit__WEBPACK_IMPORTED_MODULE_14__["rpx2px"])(2) < 1 ? /\b0\.0[12]rem/g : Object(_utils_unit__WEBPACK_IMPORTED_MODULE_14__["rpx2px"])(1) < 1 ? /\b0\.01rem/g : null;
    var replacer = _Platform__WEBPACK_IMPORTED_MODULE_15__["default"].browser === 'ios' ? '0.5px' : '1px';
    var stylesheet = getStyleSheet(this.pagePath);

    if (stylesheet) {
      var styleNode = document.createElement('style');
      var styleString = stylesheet.toString();

      if (remReg) {
        styleString = styleString.replace(remReg, replacer);
      }

      styleNode.innerHTML = styleString;
      headNode.appendChild(styleNode);
    }
  },
  onInitDataReady: function onInitDataReady(data) {
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', "[RENDER] Page ".concat(this.pagePath, " onInitDataReady: "), data);

    var _this = this;

    var id = data.id,
        publicInstance = data.publicInstance,
        customComponents = data.customComponents,
        isRefresh = data.isRefresh;
    this.publicInstance = publicInstance;
    this.setId(id);
    this.customComponents = customComponents;
    var now = Date.now();
    this.setState(_objectSpread(_objectSpread({}, publicInstance.data || {}), {}, {
      __InitialDataReady__: true
    }), function () {
      _this.logRenderTime(now);

      if (publicInstance.onReachBottom || publicInstance.onPageScroll) {
        Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_3__["default"])(window, {
          scroll: _this.checkScroll
        });
      }
    });
  },

  /* load完成 准备ready */
  onLoaded: function onLoaded() {
    var _this2 = this;

    setTimeout(function () {
      Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', "[RENDER] Page ".concat(_this2.pagePath, " onLoaded"));

      while (_this2.onShowReadyCallbacks.length) {
        var fn = _this2.onShowReadyCallbacks.shift();

        fn();
      }

      var e = {
        page: _this2
      };
      _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pageReady', e);

      _this2.callRemote('self', 'ready', e.payload);

      _this2.loaded = true;
    });
  },
  onComponentAttached: function onComponentAttached(componentId) {
    var _this3 = this;

    var fn = function fn() {
      var component = _this3.componentInstances[componentId];

      if (component) {
        component.onAttachedReady();
      }
    };

    if (this.loaded) {
      fn();
    } else {
      this.onShowReadyCallbacks.push(fn);
    }
  },
  checkScroll: function checkScroll() {
    var onReachBottomDistance = 50;
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
      this.eventHandlers[name] = function (e, more) {
        var event = _this.getNormalizedEvent(e, more);

        _this.callRemote.apply(_this, ['self', 'onRenderEvent', name].concat(event));
      };

      var handle = this.eventHandlers[name];
      handle.handleName = name;
      handle.type = 'page';
      handle.id = this.id;
    }

    return this.eventHandlers[name];
  },

  /* 接受worker消息触发 */
  triggerComponentCustomEvent: function triggerComponentCustomEvent(componentId, eventName, detail, options) {
    var component = this.componentInstances[componentId];

    if (component) {
      component.triggerEvent(eventName, detail, options);
    }
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
      var type = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_4__["PendingKeyType"]];
      var data = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_4__["PendingKeyData"]];
      var id = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_4__["PendingKeyId"]];
      var op = toData[_utils_consts__WEBPACK_IMPORTED_MODULE_4__["PendingKeyOp"]] || _utils_consts__WEBPACK_IMPORTED_MODULE_4__["OpSet"];

      if (type === _utils_consts__WEBPACK_IMPORTED_MODULE_4__["PendingValuePage"]) {
        pageData.push({
          data: data,
          op: op
        });
      } else if (type === _utils_consts__WEBPACK_IMPORTED_MODULE_4__["PendingValueComponent"] && componentInstances[id]) {
        componentsData[id] = componentsData[id] || [];
        componentsData[id].push({
          data: data,
          op: op
        });
      }
    });

    var doIt = function doIt() {
      var count = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(componentsData).length + (pageData.length ? 1 : 0);
      var c = 0;
      var now = Date.now();
      var unmountedChecked = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(componentsData);
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

    doIt();
  },
  onPageUpdate: function onPageUpdate(now, callback) {
    this.logRenderTime(now);
    var e = {
      page: this
    };
    _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pageUpdate', e);

    if (e.payload) {
      this.callRemote('self', 'update', e.payload);
    }

    if (callback) {
      callback();
    }
  },
  setData: function setData(toBeData, callback) {
    var ret = this.state;
    toBeData.forEach(function (d) {
      // immutable for shouldComponentUpdate
      ret = Object(_utils_setData__WEBPACK_IMPORTED_MODULE_6__["getOpFn"])(d.op)(ret, d.data);
    });
    this.setState(_objectSpread({}, ret), callback);
  },
  initMessageChannel: function initMessageChannel() {
    var messageChannel = this.props.messageChannel;
    messageChannel.onMessage(this.onMessage);
  },
  postMessage: function postMessage(data) {
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', "[RENDER] Page ".concat(this.pagePath, " postMessage"), data);
    var messageChannel = this.props.messageChannel;
    messageChannel.postMessage(_objectSpread(_objectSpread({}, data), {}, {
      pageType: this.pageType,
      msgType: 'endpoint'
    }));
  },
  logRenderTime: function logRenderTime(now) {
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', "render ".concat(this.pagePath, " costs ").concat(Date.now() - now, "ms."));
  },
  saveRoot: function saveRoot(ref) {
    this.root = ref;
  },
  render: function render() {
    var _this$state = this.state,
        __InitialDataReady__ = _this$state.__InitialDataReady__,
        data = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default()(_this$state, ["__InitialDataReady__"]);

    if (!__InitialDataReady__) {
      return null;
    }

    return _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement(_Scene__WEBPACK_IMPORTED_MODULE_16__["default"], {
      pagePath: this.pagePath,
      saveRoot: this.saveRoot,
      __page: this,
      __render: getRender(this.pagePath),
      data: data
    });
  }
}));

/***/ }),

/***/ "./src/framework/legacy/Scene.js":
/*!***************************************!*\
  !*** ./src/framework/legacy/Scene.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Scene; });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");






function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }




var Scene = /*#__PURE__*/function (_Nerv$Component) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_2___default()(Scene, _Nerv$Component);

  var _super = _createSuper(Scene);

  function Scene() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, Scene);

    return _super.apply(this, arguments);
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(Scene, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var __page = this.props.__page;
      var e = {
        page: __page
      };
      _EventHub__WEBPACK_IMPORTED_MODULE_6__["default"].emit('pageLoad', e);

      __page.callRemote('self', 'load');
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          data = _this$props.data,
          saveRoot = _this$props.saveRoot,
          __page = _this$props.__page,
          __render = _this$props.__render;
      return _nerv__WEBPACK_IMPORTED_MODULE_5__["default"].createElement("div", {
        className: "a-page tiny-page",
        ref: saveRoot
      }, __render.call(__page, data));
    }
  }]);

  return Scene;
}(_nerv__WEBPACK_IMPORTED_MODULE_5__["default"].Component);



/***/ }),

/***/ "./src/framework/mixins/BasicEventMixin.js":
/*!*************************************************!*\
  !*** ./src/framework/mixins/BasicEventMixin.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_eventReg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/eventReg */ "./src/utils/eventReg.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }






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

function callBubblesEvent(instance, eventType, srcEvent, more, capture) {
  var catchHandler = instance.props[Object(_utils_eventReg__WEBPACK_IMPORTED_MODULE_4__["getPropsEventName"])(eventType, true, capture)];
  var e = instance.getNormalizedEvent({
    eventType: eventType,
    srcEvent: srcEvent
  }, more);
  e.currentTarget = _objectSpread(_objectSpread({}, e.currentTarget), instance.getTargetForEvent());

  if (catchHandler && srcEvent.stopPropagation) {
    srcEvent.stopPropagation();
    typeof catchHandler === 'function' && catchHandler(e);
    return;
  }

  var onHandler = instance.props[Object(_utils_eventReg__WEBPACK_IMPORTED_MODULE_4__["getPropsEventName"])(eventType, false, capture)];

  if (typeof onHandler === 'function') {
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
    instance.detachScrollEvent = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_2__["default"])(instance.__basicEventRoot, {
      touchmove: function touchmove(e) {
        e.preventDefault();
      }
    });
  }
}

/* harmony default export */ __webpack_exports__["default"] = ({
  // componentDidMount() {
  //   this.__basicEventRoot = findDOMNode(this);
  //   attachScroll(this);
  // },
  // componentDidUpdate() {
  //   attachScroll(this);
  // },
  // componentWillUnmount() {
  //   detachScroll(this);
  // },
  // recordTarget(srcEvent) {
  //   const nativeEvent = srcEvent && srcEvent.nativeEvent;
  //   if (nativeEvent && !nativeEvent.$target) {
  //     nativeEvent.$target = this.getTargetForEvent();
  //   }
  // },
  // hasEvent(event, capture) {
  //   return getPropsEventName(event, false, capture) || getPropsEventName(event, true, capture);
  // },
  getDatasetForTarget: function getDatasetForTarget(target) {
    var dataset = {};

    for (var key in target.dataset) {
      if (Object.hasOwnProperty.call(target.dataset, key)) {
        var value = target.dataset[key];
        dataset[key] = value;
      }
    }

    return dataset;
  },
  getTargetForEvent: function getTargetForEvent(nativeEvent) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'target';
    var props = this.props;
    var _nativeEvent$key = nativeEvent[key],
        offsetLeft = _nativeEvent$key.offsetLeft,
        offsetTop = _nativeEvent$key.offsetTop;
    return {
      id: props.id || '',
      dataset: this.getDatasetForTarget(nativeEvent[key]),
      offsetLeft: offsetLeft,
      offsetTop: offsetTop
    };
  },
  getDetailForEvent: function getDetailForEvent(nativeEvent) {
    var eventType = nativeEvent.type;
    var detail = {};

    if (eventType === 'click') {
      detail.x = nativeEvent.pageX;
      detail.y = nativeEvent.pageY;
    } else if (eventType === 'transitionend') {
      detail.elapsedTime = nativeEvent.elapsedTime;
      detail.propertyName = nativeEvent.propertyName;
    } else if (eventType === 'animationstart' || eventType === 'animationiteration' || eventType === 'animationend') {
      detail.elapsedTime = nativeEvent.elapsedTime;
      detail.animationName = nativeEvent.animationName;
    }

    return detail;
  },
  getTouchesForEvent: function getTouchesForEvent(nativeEvent) {
    var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'touches';

    if (nativeEvent[key]) {
      var list = [].slice.call(nativeEvent[key], 0);
      return list.map(function (item) {
        return {
          clientX: item.clientX,
          clientY: item.clientY,
          identifier: item.identifier,
          force: item.force,
          pageX: item.pageX,
          pageY: item.pageY
        };
      });
    }
  },

  /* 格式化event对象 */
  getNormalizedEvent: function getNormalizedEvent(nativeEvent) {
    var more = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var eventType = nativeEvent.type === 'click' ? 'tap' : nativeEvent.type;
    var target = this.getTargetForEvent(nativeEvent);
    var currentTarget = this.getTargetForEvent(nativeEvent, 'currentTarget');
    var detail = this.getDetailForEvent(nativeEvent);
    var touches = this.getTouchesForEvent(nativeEvent);
    var changedTouches = this.getTouchesForEvent(nativeEvent, 'changedTouches');
    return _objectSpread({
      type: eventType,
      timeStamp: Date.now(),
      target: target,
      currentTarget: currentTarget,
      detail: detail,
      touches: touches,
      changedTouches: changedTouches
    }, more);
  } // onTap(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   // ios also trigger onTap after onLongTap
  //   if (this.__longTapTriggered) {
  //     return;
  //   }
  //   const eventName = 'tap';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap), capture);
  //   }
  // },
  // onTouchStart(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   this.__longTapTriggered = 0;
  //   const eventName = 'touchstart';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onTouchMove(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   const eventName = 'touchmove';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onTouchEnd(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   const eventName = 'touchend';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onTouchCancel(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   const eventName = 'touchcancel';
  //   if (this.hasEvent(eventName, capture)) {
  //     callBubblesEvent(this, eventName, srcEvent, {
  //       touches: createTouchList.call(this, srcEvent.touches),
  //       changedTouches: createTouchList.call(this, srcEvent.changedTouches),
  //     }, capture);
  //   }
  // },
  // onLongTap(srcEvent) {
  //   this.__longTapTriggered = 1;
  //   if (this.hasEvent('LongTap')) {
  //     callBubblesEvent(this, 'longTap', srcEvent, createTap && createTap.call(this, srcEvent, defaultCreateTap));
  //   }
  // },
  // onTransitionEnd(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('transitionend', capture)) {
  //     callBubblesEvent(this, 'transitionend', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         propertyName: srcEvent.propertyName,
  //       },
  //     }, capture);
  //   }
  // },
  // onAnimationStart(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('animationstart', capture)) {
  //     callBubblesEvent(this, 'animationstart', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         animationName: srcEvent.animationName,
  //       },
  //     }, capture);
  //   }
  // },
  // onAnimationIteration(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('animationiteration', capture)) {
  //     callBubblesEvent(this, 'animationiteration', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         animationName: srcEvent.animationName,
  //       },
  //     }, capture);
  //   }
  // },
  // onAnimationEnd(srcEvent, capture = false) {
  //   this.recordTarget(srcEvent);
  //   if (this.hasEvent('animationend', capture)) {
  //     callBubblesEvent(this, 'animationend', srcEvent, {
  //       detail: {
  //         elapsedTime: srcEvent.elapsedTime,
  //         animationName: srcEvent.animationName,
  //       },
  //     }, capture);
  //   }
  // },

});

/***/ }),

/***/ "./src/framework/mixins/MessageHandleMixin.js":
/*!****************************************************!*\
  !*** ./src/framework/mixins/MessageHandleMixin.js ***!
  \****************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/types */ "./src/utils/types.js");


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
        myArgs.push(_utils_types__WEBPACK_IMPORTED_MODULE_1__["noop"]);
      }

      if (errorCallback) {
        myArgs.push(function () {
          for (var _len2 = arguments.length, a = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            a[_key2] = arguments[_key2];
          }

          _this.callRemote.apply(_this, ['self', 'invokeCallback', errorCallback].concat(a));
        });
      } else {
        myArgs.push(_utils_types__WEBPACK_IMPORTED_MODULE_1__["noop"]);
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

/***/ "./src/framework/mixins/PureRenderMixin.js":
/*!*************************************************!*\
  !*** ./src/framework/mixins/PureRenderMixin.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_shallowEqual__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/shallowEqual */ "./src/utils/shallowEqual.js");

var PureRender = {
  shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
    return !Object(_utils_shallowEqual__WEBPACK_IMPORTED_MODULE_0__["default"])(nextProps, this.props) || !Object(_utils_shallowEqual__WEBPACK_IMPORTED_MODULE_0__["default"])(nextState, this.state);
  }
};
/* harmony default export */ __webpack_exports__["default"] = (PureRender);

/***/ }),

/***/ "./src/framework/mixins/RefMixin.js":
/*!******************************************!*\
  !*** ./src/framework/mixins/RefMixin.js ***!
  \******************************************/
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

/***/ "./src/framework/mixins/TrackPageUpdateMixin.js":
/*!******************************************************!*\
  !*** ./src/framework/mixins/TrackPageUpdateMixin.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.js");



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

/***/ "./src/framework/startupParams/index.js":
/*!**********************************************!*\
  !*** ./src/framework/startupParams/index.js ***!
  \**********************************************/
/*! exports provided: getStartupParams, setStartupParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/startupParams */ "./src/utils/startupParams/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__["setStartupParams"]; });




/***/ }),

/***/ "./src/framework/utils/camelCase.js":
/*!******************************************!*\
  !*** ./src/framework/utils/camelCase.js ***!
  \******************************************/
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

/***/ "./src/framework/utils/env.js":
/*!************************************!*\
  !*** ./src/framework/utils/env.js ***!
  \************************************/
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
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/framework/utils/filterCssValue.js":
/*!***********************************************!*\
  !*** ./src/framework/utils/filterCssValue.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return filterCssValue; });
/* harmony import */ var _unit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./unit */ "./src/framework/utils/unit.js");
/* harmony import */ var _isNumber__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isNumber */ "./src/framework/utils/isNumber.js");



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

/***/ "./src/framework/utils/isNumber.js":
/*!*****************************************!*\
  !*** ./src/framework/utils/isNumber.js ***!
  \*****************************************/
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

/***/ "./src/framework/utils/normalizeComponentProps.js":
/*!********************************************************!*\
  !*** ./src/framework/utils/normalizeComponentProps.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeComponentProps; });
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__);

function normalizeComponentProps(props) {
  var children = props.children,
      $scopedSlots = props.$scopedSlots,
      slot = props.slot,
      ret = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default()(props, ["children", "$scopedSlots", "slot"]);

  return ret;
}

/***/ }),

/***/ "./src/framework/utils/pageInfoAndUrl.js":
/*!***********************************************!*\
  !*** ./src/framework/utils/pageInfoAndUrl.js ***!
  \***********************************************/
/*! exports provided: getUrlFromPageInfo, getPageInfoFromUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getUrlFromPageInfo", function() { return getUrlFromPageInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPageInfoFromUrl", function() { return getPageInfoFromUrl; });
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");

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

/***/ "./src/framework/utils/resolvePageUrl.js":
/*!***********************************************!*\
  !*** ./src/framework/utils/resolvePageUrl.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return resolvePageUrl; });
/* harmony import */ var _resolveUrl__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./resolveUrl */ "./src/framework/utils/resolveUrl.js");

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

/***/ "./src/framework/utils/resolveUrl.js":
/*!*******************************************!*\
  !*** ./src/framework/utils/resolveUrl.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return resolveUrl; });
/* harmony import */ var _utils_startsWith__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/startsWith */ "./src/utils/startsWith.js");

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

/***/ "./src/framework/utils/ruleTransform.js":
/*!**********************************************!*\
  !*** ./src/framework/utils/ruleTransform.js ***!
  \**********************************************/
/*! exports provided: ruleName, ruleValue, needNormalizeCssValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ruleName", function() { return ruleName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ruleValue", function() { return ruleValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "needNormalizeCssValue", function() { return needNormalizeCssValue; });
/* harmony import */ var css_vendor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! css-vendor */ "./node_modules/css-vendor/dist/css-vendor.esm.js");

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

/***/ "./src/framework/utils/transformChildrenToSlots.js":
/*!*********************************************************!*\
  !*** ./src/framework/utils/transformChildrenToSlots.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return transformChildrenToSlots; });
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");

function transformChildrenToSlots(children) {
  var slots = {};
  _nerv__WEBPACK_IMPORTED_MODULE_0__["default"].Children.forEach(children, function (c) {
    var slot = c && c.props && c.props.slot || '$default';
    var holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}

/***/ }),

/***/ "./src/framework/utils/transformStyle.js":
/*!***********************************************!*\
  !*** ./src/framework/utils/transformStyle.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return transformStyle; });
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _camelCase__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./camelCase */ "./src/framework/utils/camelCase.js");
/* harmony import */ var _filterCssValue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./filterCssValue */ "./src/framework/utils/filterCssValue.js");
/* harmony import */ var _ruleTransform__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ruleTransform */ "./src/framework/utils/ruleTransform.js");




function transformStyle(style) {
  var d = {};
  Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(style).forEach(function (name) {
    var expanded = Object(_filterCssValue__WEBPACK_IMPORTED_MODULE_2__["default"])(name, style);

    if (expanded === false) {
      return;
    }

    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(expanded).forEach(function (key) {
      var v = expanded[key];
      var property = Object(_ruleTransform__WEBPACK_IMPORTED_MODULE_3__["ruleName"])(Object(_camelCase__WEBPACK_IMPORTED_MODULE_1__["default"])(key)); // color #xxx -> rgb()

      if (property) {
        d[property] = Object(_ruleTransform__WEBPACK_IMPORTED_MODULE_3__["needNormalizeCssValue"])(property) ? Object(_ruleTransform__WEBPACK_IMPORTED_MODULE_3__["ruleValue"])(property, v) : v;
      }
    });
  });
  return d;
}

/***/ }),

/***/ "./src/framework/utils/unit.js":
/*!*************************************!*\
  !*** ./src/framework/utils/unit.js ***!
  \*************************************/
/*! exports provided: rpx, rpx2px, px */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rpx", function() { return rpx; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rpx2px", function() { return rpx2px; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "px", function() { return px; });
/* harmony import */ var _Platform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Platform */ "./src/framework/Platform/index.js");

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

/***/ "./src/framework/web/bootstrap.js":
/*!****************************************!*\
  !*** ./src/framework/web/bootstrap.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/types */ "./src/utils/types.js");
/* harmony import */ var _PageRegistry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../PageRegistry */ "./src/framework/PageRegistry/index.js");
/* harmony import */ var _utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/pageInfoAndUrl */ "./src/framework/utils/pageInfoAndUrl.js");
/* harmony import */ var _getMessageChannel__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./getMessageChannel */ "./src/framework/web/getMessageChannel.js");
/* harmony import */ var _SubPackage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../SubPackage */ "./src/framework/SubPackage/index.js");







var g = self;
/* harmony default export */ __webpack_exports__["default"] = (function (config, bridge) {
  var _config$container = config.container,
      container = _config$container === void 0 ? document.getElementById('__frame__') : _config$container,
      _config$onRender = config.onRender,
      onRender = _config$onRender === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_2__["noop"] : _config$onRender,
      _config$onFail = config.onFail,
      onFail = _config$onFail === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_2__["noop"] : _config$onFail,
      type = config.type;
  var pageInfo = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__["getPageInfoFromUrl"])(location.href);
  Object(_utils_log__WEBPACK_IMPORTED_MODULE_1__["debug"])('framework', 'pageInfo', pageInfo);
  var pagePath = pageInfo.pagePath;

  if (pagePath) {
    document.documentElement.style.fontSize = "".concat(100 * document.documentElement.clientWidth / 750, "px");
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_6__["loadPage"])(pagePath, function () {
      var PageComponent = _PageRegistry__WEBPACK_IMPORTED_MODULE_3__["default"].getComponent(pagePath);

      if (PageComponent) {
        Object(_utils_log__WEBPACK_IMPORTED_MODULE_1__["debug"])('framework', "Render page: ".concat(pagePath));

        if (onRender) {
          onRender(type);
        }

        var messageChannel = Object(_getMessageChannel__WEBPACK_IMPORTED_MODULE_5__["default"])(pageInfo, bridge);
        Object(_nerv__WEBPACK_IMPORTED_MODULE_0__["render"])(_nerv__WEBPACK_IMPORTED_MODULE_0__["default"].createElement(PageComponent, {
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
    Object(_nerv__WEBPACK_IMPORTED_MODULE_0__["unmountComponentAtNode"])(container);
  }
});

/***/ }),

/***/ "./src/framework/web/getMessageChannel.js":
/*!************************************************!*\
  !*** ./src/framework/web/getMessageChannel.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getMessageChannel; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var g = self;
function getMessageChannel(pageInfo, bridge) {
  var unhandledMessages = [];
  var callback;

  g.send = function (event) {
    if (callback) {
      callback(event);
    } else {
      unhandledMessages.push(event);
    }
  };

  g.addEventListener('message', g.send);
  var queryString = pageInfo.queryString,
      id = pageInfo.id,
      pagePath = pageInfo.pagePath;
  var payload = {
    pagePath: pagePath,
    id: id,
    pageType: 'RENDER',
    msgType: 'DOMContentLoaded',
    viewId: g.WEBVIEWID
  };

  if (queryString) {
    payload.queryString = queryString;
  }

  bridge.call('postMessage', payload);
  return {
    id: id,
    postMessage: function postMessage(data) {
      bridge.call('postMessage', _objectSpread(_objectSpread({
        viewId: g.WEBVIEWID
      }, data), {}, {
        id: data.id || id
      }));
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

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _web_components__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./web-components */ "./src/web-components/index.js");
/* harmony import */ var _apis___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/apis/ */ "./src/apis/index.js");
/* harmony import */ var _components___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/components/ */ "./src/components/index.js");
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _framework_index__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./framework/index */ "./src/framework/index.js");
/* harmony import */ var _xml_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./xml-runtime */ "./src/xml-runtime/index.js");








var __mpStartTime = Date.now();

self.Nerv = _nerv__WEBPACK_IMPORTED_MODULE_3__["default"];
self.XMLRuntime = _xml_runtime__WEBPACK_IMPORTED_MODULE_6__["default"];
self.MPUI = {
  button: _components___WEBPACK_IMPORTED_MODULE_2__["Button"],
  checkbox: _components___WEBPACK_IMPORTED_MODULE_2__["CheckBox"],
  'checkbox-group': _components___WEBPACK_IMPORTED_MODULE_2__["CheckBoxGroup"],
  icon: _components___WEBPACK_IMPORTED_MODULE_2__["Icon"],
  image: _components___WEBPACK_IMPORTED_MODULE_2__["Image"],
  input: _components___WEBPACK_IMPORTED_MODULE_2__["Input"],
  label: _components___WEBPACK_IMPORTED_MODULE_2__["Label"],
  radio: _components___WEBPACK_IMPORTED_MODULE_2__["Radio"],
  'radio-group': _components___WEBPACK_IMPORTED_MODULE_2__["RadioGroup"],
  'scroll-view': _components___WEBPACK_IMPORTED_MODULE_2__["ScrollView"],
  text: _components___WEBPACK_IMPORTED_MODULE_2__["Text"],
  view: _components___WEBPACK_IMPORTED_MODULE_2__["View"]
};
self.MP = {
  bridge: _apis___WEBPACK_IMPORTED_MODULE_1__["default"],
  EventHub: _framework_index__WEBPACK_IMPORTED_MODULE_5__["EventHub"],
  App: _framework_index__WEBPACK_IMPORTED_MODULE_5__["App"],
  setCurrentPageImpl: _framework_index__WEBPACK_IMPORTED_MODULE_5__["setCurrentPageImpl"],
  getCurrentPageImpl: _framework_index__WEBPACK_IMPORTED_MODULE_5__["getCurrentPageImpl"],
  getCurrentPagesImpl: _framework_index__WEBPACK_IMPORTED_MODULE_5__["getCurrentPagesImpl"],
  getApp: _framework_index__WEBPACK_IMPORTED_MODULE_5__["getApp"],
  getAppImpl: _framework_index__WEBPACK_IMPORTED_MODULE_5__["getAppImpl"],
  getCurrentPages: _framework_index__WEBPACK_IMPORTED_MODULE_5__["getCurrentPages"],
  getStartupParams: _framework_index__WEBPACK_IMPORTED_MODULE_5__["getStartupParams"],
  setStartupParams: _framework_index__WEBPACK_IMPORTED_MODULE_5__["setStartupParams"],
  Component: _framework_index__WEBPACK_IMPORTED_MODULE_5__["Component"],
  getComponentClass: _framework_index__WEBPACK_IMPORTED_MODULE_5__["getComponentClass"],
  StyleSheet: _framework_index__WEBPACK_IMPORTED_MODULE_5__["StyleSheet"],
  createComponent: _framework_index__WEBPACK_IMPORTED_MODULE_5__["createComponent"],
  Page: _framework_index__WEBPACK_IMPORTED_MODULE_5__["Page"],
  $global: _framework_index__WEBPACK_IMPORTED_MODULE_5__["$global"]
};

var __mpCosts = Date.now() - __mpStartTime;

Object(_utils_log__WEBPACK_IMPORTED_MODULE_4__["debug"])('framework', "web bundle costs ".concat(__mpCosts, " ms"));

/***/ }),

/***/ "./src/nerv/children.ts":
/*!******************************!*\
  !*** ./src/nerv/children.ts ***!
  \******************************/
/*! exports provided: Children */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Children", function() { return Children; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");


var Children = {
    map: function (children, fn, ctx) {
        if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(children)) {
            return children;
        }
        children = Children.toArray(children);
        if (ctx && ctx !== children) {
            fn = fn.bind(ctx);
        }
        return children.map(fn);
    },
    forEach: function (children, fn, ctx) {
        if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(children)) {
            return;
        }
        children = Children.toArray(children);
        if (ctx && ctx !== children) {
            fn = fn.bind(ctx);
        }
        for (var i = 0, len = children.length; i < len; i++) {
            var child = Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isInvalid"])(children[i]) ? null : children[i];
            fn(child, i, children);
        }
    },
    count: function (children) {
        children = Children.toArray(children);
        return children.length;
    },
    only: function (children) {
        children = Children.toArray(children);
        if (children.length !== 1) {
            throw new Error('Children.only() expects only one child.');
        }
        return children[0];
    },
    toArray: function (children) {
        if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(children)) {
            return [];
        }
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(children)) {
            var result = [];
            flatten(children, result);
            return result;
        }
        return _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_CHILDREN"].concat(children);
    },
};
function flatten(arr, result) {
    for (var i = 0, len = arr.length; i < len; i++) {
        var value = arr[i];
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(value)) {
            flatten(value, result);
        }
        else {
            result.push(value);
        }
    }
    return result;
}


/***/ }),

/***/ "./src/nerv/clone-element.ts":
/*!***********************************!*\
  !*** ./src/nerv/clone-element.ts ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return cloneElement; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _create_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./create-element */ "./src/nerv/create-element.ts");
/* harmony import */ var _vdom_create_vtext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vdom/create-vtext */ "./src/nerv/vdom/create-vtext.ts");
/* harmony import */ var _vdom_create_void__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vdom/create-void */ "./src/nerv/vdom/create-void.ts");





function cloneElement(vnode, props) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isVText"])(vnode)) {
        return Object(_vdom_create_vtext__WEBPACK_IMPORTED_MODULE_3__["default"])(vnode.text);
    }
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(vnode) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isNumber"])(vnode)) {
        return Object(_vdom_create_vtext__WEBPACK_IMPORTED_MODULE_3__["default"])(vnode);
    }
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isInvalid"])(vnode)
        || (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isInvalid"])(vnode) && Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isPortal"])(vnode.vtype, vnode))
        || (vnode && (vnode.vtype & 16 /* Void */))) {
        return Object(_vdom_create_void__WEBPACK_IMPORTED_MODULE_4__["createVoid"])();
    }
    var properties = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["clone"])(Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["extend"])(Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["clone"])(vnode.props), props));
    if (vnode.namespace) {
        properties.namespace = vnode.namespace;
    }
    if ((vnode.vtype & 4 /* Composite */) && !Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(vnode.ref)) {
        properties.ref = vnode.ref;
    }
    var childrenTmp = (arguments.length > 2
        ? [].slice.call(arguments, 2)
        : vnode.children || properties.children) || [];
    if (childrenTmp.length) {
        if (childrenTmp.length === 1) {
            childrenTmp = children[0];
        }
    }
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(vnode)) {
        return vnode.map(function (item) {
            return cloneElement(item);
        });
    }
    var newVNode = Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(vnode.type, properties);
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(childrenTmp)) {
        var _children = childrenTmp.map(function (child) {
            return cloneElement(child, child.props);
        });
        if (_children.length === 0) {
            _children = _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_CHILDREN"];
        }
        if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isVNode"])(newVNode)) {
            newVNode.children = _children;
        }
        newVNode.props.children = _children;
    }
    else if (childrenTmp) {
        if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isVNode"])(newVNode)) {
            newVNode.children = cloneElement(childrenTmp);
        }
        newVNode.props.children = cloneElement(childrenTmp, childrenTmp.props);
    }
    return newVNode;
}


/***/ }),

/***/ "./src/nerv/component.ts":
/*!*******************************!*\
  !*** ./src/nerv/component.ts ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _render_queue__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./render-queue */ "./src/nerv/render-queue.ts");
/* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./lifecycle */ "./src/nerv/lifecycle.ts");




var Component = /** @class */ (function () {
    function Component(props, context) {
        this._dirty = true;
        this._disable = true;
        this._pendingStates = [];
        this._pendingCallbacks = [];
        this._afterScheduleEffect = false;
        this.hooks = [];
        this.effects = _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_CHILDREN"];
        this.layoutEffects = _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_CHILDREN"];
        if (!this.state) {
            this.state = {};
        }
        this.props = props || {};
        this.context = context || _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_OBJ"];
        this.refs = {};
    }
    Component.prototype.setState = function (state, callback) {
        if (state) {
            this._pendingStates.push(state);
        }
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(callback)) {
            this._pendingCallbacks.push(callback);
        }
        if (!this._disable) {
            Object(_render_queue__WEBPACK_IMPORTED_MODULE_2__["enqueueRender"])(this);
        }
    };
    Component.prototype.getState = function () {
        var _this = this;
        // tslint:disable-next-line:no-this-assignment
        var _a = this, _pendingStates = _a._pendingStates, state = _a.state, props = _a.props;
        if (!_pendingStates.length) {
            return state;
        }
        var stateClone = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["clone"])(state);
        var queue = _pendingStates.concat();
        this._pendingStates.length = 0;
        queue.forEach(function (nextState) {
            if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(nextState)) {
                nextState = nextState.call(_this, state, props);
            }
            Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["extend"])(stateClone, nextState);
        });
        return stateClone;
    };
    Component.prototype.clearCallBacks = function () {
        // cached the length of callbacks, or callbacks may increase by calling them in the same loop
        var len = this._pendingCallbacks.length;
        while (this._dirty ? this._pendingCallbacks.length : len) {
            var cb = this._pendingCallbacks.shift();
            cb.call(this);
            len--;
        }
    };
    Component.prototype.forceUpdate = function (callback) {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(callback)) {
            this._pendingCallbacks.push(callback);
        }
        Object(_lifecycle__WEBPACK_IMPORTED_MODULE_3__["updateComponent"])(this, true);
    };
    // tslint:disable-next-line
    Component.prototype.render = function (nextProps, nextState, nextContext) { };
    return Component;
}());
Component.prototype.isReactComponent = _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_OBJ"];
/* harmony default export */ __webpack_exports__["default"] = (Component);


/***/ }),

/***/ "./src/nerv/create-class.ts":
/*!**********************************!*\
  !*** ./src/nerv/create-class.ts ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createClass; });
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./component */ "./src/nerv/component.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



// don't autobind these methods since they already have guaranteed context.
var AUTOBIND_BLACKLIST = {
    constructor: 1,
    render: 1,
    shouldComponentUpdate: 1,
    // tslint:disable-next-line:object-literal-sort-keys
    componentWillUpdate: 1,
    componentWillReceiveProps: 1,
    componentDidUpdate: 1,
    componentWillMount: 1,
    componentDidMount: 1,
    componentWillUnmount: 1,
    componentDidUnmount: 1,
    getDerivedStateFromProps: 1,
};
function extend(base, props) {
    for (var key in props) {
        if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isNullOrUndef"])(props[key])) {
            base[key] = props[key];
        }
    }
    return base;
}
function bindAll(ctx) {
    for (var i in ctx) {
        var v = ctx[i];
        if (typeof v === 'function' && !v.__bound && AUTOBIND_BLACKLIST[i] !== 1) {
            (ctx[i] = v.bind(ctx)).__bound = true;
        }
    }
}
function collateMixins(mixins, keyed) {
    if (keyed === void 0) { keyed = {}; }
    for (var i = 0, len = mixins.length; i < len; i++) {
        var mixin = mixins[i];
        if (mixin.mixins) {
            // Recursively collate sub-mixins
            collateMixins(mixin.mixins, keyed);
        }
        for (var key in mixin) {
            if (mixin.hasOwnProperty(key) && typeof mixin[key] === 'function') {
                (keyed[key] || (keyed[key] = [])).push(mixin[key]);
            }
        }
    }
    return keyed;
}
function multihook(hooks, mergeFn) {
    return function () {
        var ret;
        for (var i = 0, len = hooks.length; i < len; i++) {
            var hook = hooks[i];
            var r = hook.apply(this, arguments);
            if (mergeFn) {
                ret = mergeFn(ret, r);
            }
            else if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isUndefined"])(r)) {
                ret = r;
            }
        }
        return ret;
    };
}
function mergeNoDupes(previous, current) {
    if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isUndefined"])(current)) {
        if (!previous) {
            previous = {};
        }
        for (var key in current) {
            if (current.hasOwnProperty(key)) {
                if (previous.hasOwnProperty(key)) {
                    throw new Error("Mixins return duplicate key " + key + " in their return values");
                }
                previous[key] = current[key];
            }
        }
    }
    return previous;
}
function applyMixin(key, inst, mixin) {
    var hooks = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isUndefined"])(inst[key]) ? mixin : mixin.concat(inst[key]);
    inst[key] = key === 'getDefaultProps'
        || key === 'getInitialState'
        || key === 'getChildContext'
        ? multihook(hooks, mergeNoDupes)
        : multihook(hooks);
}
function applyMixins(Cl, mixins) {
    for (var key in mixins) {
        if (mixins.hasOwnProperty(key)) {
            var mixin = mixins[key];
            var inst = key === 'getDefaultProps' ? Cl : Cl.prototype;
            if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isFunction"])(mixin[0])) {
                applyMixin(key, inst, mixin);
            }
            else {
                inst[key] = mixin;
            }
        }
    }
}
function createClass(obj) {
    var BoundClass = /** @class */ (function (_super) {
        __extends(BoundClass, _super);
        function BoundClass(props, context) {
            var _this = _super.call(this, props, context) || this;
            bindAll(_this);
            if (_this.getInitialState) {
                _this.state = _this.getInitialState();
            }
            return _this;
        }
        BoundClass.prototype.replaceState = function (nextState, callback) {
            this.setState(nextState, callback);
        };
        BoundClass.prototype.isMounted = function () {
            return !this.dom;
        };
        BoundClass.displayName = obj.displayName || 'Component';
        BoundClass.propTypes = obj.propTypes;
        BoundClass.mixins = obj.mixins && collateMixins(obj.mixins);
        BoundClass.getDefaultProps = obj.getDefaultProps;
        return BoundClass;
    }(_component__WEBPACK_IMPORTED_MODULE_2__["default"]));
    extend(BoundClass.prototype, obj);
    if (obj.statics) {
        extend(BoundClass, obj.statics);
    }
    if (obj.mixins) {
        applyMixins(BoundClass, collateMixins(obj.mixins));
    }
    BoundClass.defaultProps = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isUndefined"])(BoundClass.getDefaultProps)
        ? undefined
        : BoundClass.getDefaultProps();
    return BoundClass;
}


/***/ }),

/***/ "./src/nerv/create-context.ts":
/*!************************************!*\
  !*** ./src/nerv/create-context.ts ***!
  \************************************/
/*! exports provided: uid, createContext */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uid", function() { return uid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createContext", function() { return createContext; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _emiter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./emiter */ "./src/nerv/emiter.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./component */ "./src/nerv/component.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var uid = 0;
function onlyChild(children) {
    return Array.isArray(children) ? children[0] : children;
}
function createContext(defaultValue) {
    var contextProp = "__context_" + uid++ + "__";
    var Provider = /** @class */ (function (_super) {
        __extends(Provider, _super);
        function Provider() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.emiter = new _emiter__WEBPACK_IMPORTED_MODULE_1__["Emiter"](_this.props.value);
            return _this;
        }
        Provider.prototype.getChildContext = function () {
            var _a;
            return _a = {},
                _a[contextProp] = this.emiter,
                _a;
        };
        Provider.prototype.componentWillReceiveProps = function (nextProps) {
            if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["objectIs"])(this.props.value, nextProps.value)) {
                this.emiter.set(nextProps.value);
            }
        };
        Provider.prototype.render = function () {
            return this.props.children;
        };
        Provider.isContextProvider = true;
        return Provider;
    }(_component__WEBPACK_IMPORTED_MODULE_2__["default"]));
    // tslint:disable-next-line: max-classes-per-file
    var Consumer = /** @class */ (function (_super) {
        __extends(Consumer, _super);
        function Consumer() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.state = {
                value: _this.getContextValue(),
            };
            _this.onUpdate = function (value) {
                if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["objectIs"])(value, _this.state.value)) {
                    _this.setState({
                        value: _this.getContextValue(),
                    });
                }
            };
            return _this;
        }
        Consumer.prototype.componentWillMount = function () {
            var emiter = this.context[contextProp];
            if (emiter) {
                emiter.off(this.onUpdate);
            }
        };
        Consumer.prototype.componentDidMount = function () {
            var emiter = this.context[contextProp];
            if (emiter) {
                emiter.on(this.onUpdate);
            }
        };
        Consumer.prototype.getContextValue = function () {
            var emiter = this.context[contextProp];
            return Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(emiter) ? defaultValue : emiter.value;
        };
        Consumer.prototype.render = function () {
            return onlyChild(this.props.children)(this.state.value);
        };
        Consumer.isContextConsumer = true;
        return Consumer;
    }(_component__WEBPACK_IMPORTED_MODULE_2__["default"]));
    return {
        Provider: Provider,
        Consumer: Consumer,
        _id: contextProp,
        _defaultValue: defaultValue,
    };
}


/***/ }),

/***/ "./src/nerv/create-element.ts":
/*!************************************!*\
  !*** ./src/nerv/create-element.ts ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _vdom_h__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vdom/h */ "./src/nerv/vdom/h.ts");
/* harmony import */ var _full_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./full-component */ "./src/nerv/full-component.ts");
/* harmony import */ var _current_owner__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./current-owner */ "./src/nerv/current-owner.ts");
/* harmony import */ var _vdom_svg_property_config__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vdom/svg-property-config */ "./src/nerv/vdom/svg-property-config.ts");




// import StatelessComponent from './stateless-component'


function transformPropsForRealTag(type, props) {
    var newProps = {};
    for (var propName in props) {
        var propValue = props[propName];
        if (propName === 'defaultValue') {
            newProps.value = props.value || props.defaultValue;
            continue;
        }
        var svgPropName = _vdom_svg_property_config__WEBPACK_IMPORTED_MODULE_5__["default"].DOMAttributeNames[propName];
        if (svgPropName && svgPropName !== propName) {
            newProps[svgPropName] = propValue;
            continue;
        }
        newProps[propName] = propValue;
    }
    return newProps;
}
/**
 *
 * @param props
 * @param defaultProps
 * defaultProps should respect null but ignore undefined
 * @see: https://facebook.github.io/react/docs/react-component.html#defaultprops
 */
function transformPropsForComponent(props, defaultProps) {
    var newProps = {};
    for (var propName in props) {
        var propValue = props[propName];
        newProps[propName] = propValue;
    }
    if (defaultProps) {
        for (var propName in defaultProps) {
            if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(newProps[propName])) {
                newProps[propName] = defaultProps[propName];
            }
        }
    }
    return newProps;
}
function createElement(type, properties) {
    var _children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        _children[_i - 2] = arguments[_i];
    }
    var children = _children;
    if (_children) {
        if (_children.length === 1) {
            children = _children[0];
        }
        else if (_children.length === 0) {
            children = undefined;
        }
    }
    var props;
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(type)) {
        props = transformPropsForRealTag(type, properties);
        props.owner = _current_owner__WEBPACK_IMPORTED_MODULE_4__["default"].current;
        return Object(_vdom_h__WEBPACK_IMPORTED_MODULE_2__["default"])(type, props, children);
    }
    else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(type)) {
        props = transformPropsForComponent(properties, type.defaultProps);
        if (!props.children || props.children === _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_CHILDREN"]) {
            props.children = children || children === 0 ? children : _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_CHILDREN"];
        }
        props.owner = _current_owner__WEBPACK_IMPORTED_MODULE_4__["default"].current;
        return new _full_component__WEBPACK_IMPORTED_MODULE_3__["default"](type, props);
    }
    return type;
}
/* harmony default export */ __webpack_exports__["default"] = (createElement);


/***/ }),

/***/ "./src/nerv/create-ref.ts":
/*!********************************!*\
  !*** ./src/nerv/create-ref.ts ***!
  \********************************/
/*! exports provided: createRef, forwardRef */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createRef", function() { return createRef; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "forwardRef", function() { return forwardRef; });
function createRef() {
    return {};
}
function forwardRef(cb) {
    var fn = function (props) {
        var ref = props.ref;
        delete props.ref;
        return cb(props, ref);
    };
    fn._forwarded = true;
    return fn;
}


/***/ }),

/***/ "./src/nerv/current-owner.ts":
/*!***********************************!*\
  !*** ./src/nerv/current-owner.ts ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var Current = {
    current: null,
    index: 0
};
/* harmony default export */ __webpack_exports__["default"] = (Current);


/***/ }),

/***/ "./src/nerv/dom.ts":
/*!*************************!*\
  !*** ./src/nerv/dom.ts ***!
  \*************************/
/*! exports provided: unmountComponentAtNode, findDOMNode, createFactory, unstable_renderSubtreeIntoContainer, isValidElement, unstable_batchedUpdates */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unmountComponentAtNode", function() { return unmountComponentAtNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findDOMNode", function() { return findDOMNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createFactory", function() { return createFactory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unstable_renderSubtreeIntoContainer", function() { return unstable_renderSubtreeIntoContainer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidElement", function() { return isValidElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unstable_batchedUpdates", function() { return unstable_batchedUpdates; });
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./lifecycle */ "./src/nerv/lifecycle.ts");
/* harmony import */ var _render__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./render */ "./src/nerv/render.ts");
/* harmony import */ var _vdom_unmount__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vdom/unmount */ "./src/nerv/vdom/unmount.ts");
/* harmony import */ var _create_element__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./create-element */ "./src/nerv/create-element.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./component */ "./src/nerv/component.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();







function unmountComponentAtNode(dom) {
    var component = dom._component;
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isValidElement"])(component)) {
        Object(_vdom_unmount__WEBPACK_IMPORTED_MODULE_4__["unmount"])(component, dom);
        delete dom._component;
        return true;
    }
    return false;
}
function findDOMNode(component) {
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isInvalid"])(component)) {
        return null;
    }
    return Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isComponent"])(component)
        ? component.vnode.dom
        : Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isValidElement"])(component)
            ? component.dom : component;
}
function createFactory(type) {
    return _create_element__WEBPACK_IMPORTED_MODULE_5__["default"].bind(null, type);
}
var WrapperComponent = /** @class */ (function (_super) {
    __extends(WrapperComponent, _super);
    function WrapperComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    WrapperComponent.prototype.getChildContext = function () {
        // tslint:disable-next-line
        return this.props.context;
    };
    WrapperComponent.prototype.render = function () {
        return this.props.children;
    };
    return WrapperComponent;
}(_component__WEBPACK_IMPORTED_MODULE_6__["default"]));
function unstable_renderSubtreeIntoContainer(parentComponent, vnode, container, callback) {
    // @TODO: should handle props.context?
    var wrapper = Object(_create_element__WEBPACK_IMPORTED_MODULE_5__["default"])(WrapperComponent, { context: Object(_lifecycle__WEBPACK_IMPORTED_MODULE_2__["getChildContext"])(parentComponent, parentComponent.context) }, vnode);
    var rendered = Object(_render__WEBPACK_IMPORTED_MODULE_3__["render"])(wrapper, container);
    if (callback) {
        callback.call(rendered);
    }
    return rendered;
}
function isValidElement(element) {
    return (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isValidElement"])(element) && (element.vtype & (4 /* Composite */ | 2 /* Node */)) > 0);
}
var unstable_batchedUpdates = _nerv_utils__WEBPACK_IMPORTED_MODULE_1__["nextTick"];


/***/ }),

/***/ "./src/nerv/emiter.ts":
/*!****************************!*\
  !*** ./src/nerv/emiter.ts ***!
  \****************************/
/*! exports provided: Emiter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Emiter", function() { return Emiter; });
var Emiter = /** @class */ (function () {
    function Emiter(value) {
        this.handlers = [];
        this.value = value;
    }
    Emiter.prototype.on = function (handler) {
        this.handlers.push(handler);
    };
    Emiter.prototype.off = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    Emiter.prototype.set = function (value) {
        var _this = this;
        this.value = value;
        this.handlers.forEach(function (h) { return h(_this.value); });
    };
    return Emiter;
}());



/***/ }),

/***/ "./src/nerv/event.ts":
/*!***************************!*\
  !*** ./src/nerv/event.ts ***!
  \***************************/
/*! exports provided: attachEvent, detachEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "attachEvent", function() { return attachEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detachEvent", function() { return detachEvent; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _passive_event__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./passive-event */ "./src/nerv/passive-event.ts");



var ONINPUT = 'oninput';
var ONPROPERTYCHANGE = 'onpropertychange';
var delegatedEvents = new _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["MapClass"]();
var bindFocus = false;
if (typeof Event !== 'undefined' && !Event.prototype.persist) {
    // tslint:disable-next-line:no-empty
    Event.prototype.persist = _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["noop"];
}
function attachEvent(domNode, eventName, handler) {
    eventName = fixEvent(domNode, eventName);
    /* istanbul ignore next */
    if (eventName === ONPROPERTYCHANGE) {
        processOnPropertyChangeEvent(domNode, handler);
        return;
    }
    var parsedEvent = parseEventName(eventName);
    var delegatedRoots = delegatedEvents.get(normalizeEventName(eventName));
    if (!delegatedRoots) {
        delegatedRoots = new _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["MapClass"]();
    }
    var event = attachEventToNode(domNode, parsedEvent, delegatedRoots);
    delegatedEvents.set(normalizeEventName(eventName), delegatedRoots);
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(handler)) {
        delegatedRoots.set(domNode, {
            eventHandler: function (e) {
                if (parsedEvent.stop) {
                    e.stopPropagation();
                }
                handler(e);
            },
            event: event,
        });
    }
}
function detachEvent(domNode, eventName, handler) {
    eventName = fixEvent(domNode, eventName);
    if (eventName === ONPROPERTYCHANGE) {
        return;
    }
    var parsedEvent = parseEventName(eventName);
    var delegatedRoots = delegatedEvents.get(normalizeEventName(eventName));
    var event = delegatedRoots.get(domNode);
    if (event) {
        domNode.removeEventListener(parsedEvent.name, event.event, false);
        /* istanbul ignore next */
        var delegatedRootsSize = delegatedRoots.size;
        if (delegatedRoots.delete(domNode) && delegatedRootsSize === 0) {
            delegatedEvents.delete(normalizeEventName(eventName));
        }
    }
}
var propertyChangeActiveElement;
var propertyChangeActiveElementValue;
var propertyChangeActiveElementValueProp;
var propertyChangeActiveHandlers = {};
/* istanbul ignore next */
function propertyChangeHandler(event) {
    if (event.propertyName !== 'value') {
        return;
    }
    var target = event.target || event.srcElement;
    var val = target.value;
    if (val === propertyChangeActiveElementValue) {
        return;
    }
    propertyChangeActiveElementValue = val;
    var handler = propertyChangeActiveHandlers[target.name];
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(handler)) {
        handler.call(target, event);
    }
}
/* istanbul ignore next */
function processOnPropertyChangeEvent(node, handler) {
    propertyChangeActiveHandlers[node.name] = handler;
    if (!bindFocus) {
        // bindFocus = true
        node.addEventListener('focusin', function () {
            unbindOnPropertyChange();
            bindOnPropertyChange(node);
        }, false);
        node.addEventListener('focusout', unbindOnPropertyChange, false);
    }
}
/* istanbul ignore next */
function bindOnPropertyChange(node) {
    propertyChangeActiveElement = node;
    propertyChangeActiveElementValue = node.value;
    propertyChangeActiveElementValueProp = Object.getOwnPropertyDescriptor(node.constructor.prototype, 'value');
    Object.defineProperty(propertyChangeActiveElement, 'value', {
        get: function () {
            return propertyChangeActiveElementValueProp.get.call(this);
        },
        set: function (val) {
            propertyChangeActiveElementValue = val;
            propertyChangeActiveElementValueProp.set.call(this, val);
        },
    });
    propertyChangeActiveElement.addEventListener('propertychange', propertyChangeHandler, false);
}
/* istanbul ignore next */
function unbindOnPropertyChange() {
    if (!propertyChangeActiveElement) {
        return;
    }
    delete propertyChangeActiveElement.value;
    propertyChangeActiveElement.removeEventListener('propertychange', propertyChangeHandler, false);
    propertyChangeActiveElement = null;
    propertyChangeActiveElementValue = null;
    propertyChangeActiveElementValueProp = null;
}
function detectCanUseOnInputNode(node) {
    var nodeName = node.nodeName && node.nodeName.toLowerCase();
    var type = node.type;
    return ((nodeName === 'input' && /text|password/.test(type))
        || nodeName === 'textarea');
}
function normalizeEventName(eventName) {
    var reg = /^(on|bind|catch|capture-bind|capture-catch)/;
    return eventName.replace(reg, '');
}
function fixEvent(node, eventName) {
    var tapEventReg = /([Tt]ap)$/;
    if (eventName === 'onDoubleClick') {
        eventName = 'ondblclick';
    }
    else if (eventName === 'onTouchTap') {
        eventName = 'onclick';
        // tslint:disable-next-line:prefer-conditional-expression
    }
    else if (eventName === 'onChange' && detectCanUseOnInputNode(node)) {
        eventName = ONINPUT in window ? ONINPUT : ONPROPERTYCHANGE;
    }
    else if (tapEventReg.test(eventName)) {
        eventName = eventName.replace(tapEventReg, 'click');
    }
    else {
        eventName = eventName.toLowerCase();
    }
    return eventName;
}
function parseEventName(name) {
    var event = null;
    if (name.startsWith('on')) {
        event = {
            raw: name,
            name: name.slice(2),
            stop: false,
        };
    }
    else if (name.startsWith('bind')) {
        event = {
            raw: name,
            name: name.slice(4),
            stop: false,
        };
    }
    else if (name.startsWith('catch')) {
        event = {
            raw: name,
            name: name.slice(5),
            stop: true,
        };
    }
    else if (name.startsWith('capture-bind')) {
        event = {
            raw: name,
            name: name.slice(12),
            stop: false,
            capture: true,
        };
    }
    else if (name.startsWith('capture-catch')) {
        event = {
            raw: name,
            name: name.slice(13),
            stop: true,
            capture: true,
        };
    }
    return event;
}
function attachEventToNode(node, parsedEvent, delegatedRoots) {
    var eventHandler = function (event) {
        var eventToTrigger = delegatedRoots.get(node);
        if (eventToTrigger && eventToTrigger.eventHandler) {
            var eventData_1 = {
                currentTarget: node,
            };
            /* istanbul ignore next */
            Object.defineProperties(event, {
                currentTarget: {
                    configurable: true,
                    get: function () {
                        return eventData_1.currentTarget;
                    },
                },
            });
            eventToTrigger.eventHandler(event);
        }
    };
    node.addEventListener(parsedEvent.name, eventHandler, parsedEvent.capture || _passive_event__WEBPACK_IMPORTED_MODULE_2__["supportedPassiveEventMap"][parsedEvent.name] || false);
    return eventHandler;
}


/***/ }),

/***/ "./src/nerv/fragment.ts":
/*!******************************!*\
  !*** ./src/nerv/fragment.ts ***!
  \******************************/
/*! exports provided: Fragment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Fragment", function() { return Fragment; });
function Fragment(props) {
    return props.children;
}


/***/ }),

/***/ "./src/nerv/full-component.ts":
/*!************************************!*\
  !*** ./src/nerv/full-component.ts ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lifecycle */ "./src/nerv/lifecycle.ts");
/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./options */ "./src/nerv/options.ts");



var ComponentWrapper = /** @class */ (function () {
    function ComponentWrapper(type, props) {
        this.vtype = 4 /* Composite */;
        this.type = type;
        this.name = type.name;
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(this.name)) {
            var names = type.toString().match(/^function\s*([^\s(]+)/);
            this.name = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(names) ? names[0] : 'Component';
        }
        type.displayName = this.name;
        this._owner = props.owner;
        delete props.owner;
        if ((this.ref = props.ref)) {
            delete props.ref;
        }
        if (type._forwarded) {
            if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(this.ref)) {
                props.ref = this.ref;
            }
            delete this.ref;
        }
        this.props = props;
        this.key = props.key || null;
        this.dom = null;
        _options__WEBPACK_IMPORTED_MODULE_2__["default"].afterCreate(this);
    }
    ComponentWrapper.prototype.init = function (parentContext, parentComponent) {
        _options__WEBPACK_IMPORTED_MODULE_2__["default"].beforeMount(this);
        var dom = Object(_lifecycle__WEBPACK_IMPORTED_MODULE_1__["mountComponent"])(this, parentContext, parentComponent);
        _options__WEBPACK_IMPORTED_MODULE_2__["default"].afterMount(this);
        return dom;
    };
    ComponentWrapper.prototype.update = function (previous, current, parentContext, domNode) {
        this.context = Object(_lifecycle__WEBPACK_IMPORTED_MODULE_1__["getContextByContextType"])(this, parentContext);
        _options__WEBPACK_IMPORTED_MODULE_2__["default"].beforeUpdate(this);
        var dom = Object(_lifecycle__WEBPACK_IMPORTED_MODULE_1__["reRenderComponent"])(previous, this);
        _options__WEBPACK_IMPORTED_MODULE_2__["default"].afterUpdate(this);
        return dom;
    };
    ComponentWrapper.prototype.destroy = function () {
        _options__WEBPACK_IMPORTED_MODULE_2__["default"].beforeUnmount(this);
        Object(_lifecycle__WEBPACK_IMPORTED_MODULE_1__["unmountComponent"])(this);
    };
    return ComponentWrapper;
}());
/* harmony default export */ __webpack_exports__["default"] = (ComponentWrapper);


/***/ }),

/***/ "./src/nerv/hooks.ts":
/*!***************************!*\
  !*** ./src/nerv/hooks.ts ***!
  \***************************/
/*! exports provided: getHooks, useState, useReducer, invokeEffects, useEffect, useLayoutEffect, useRef, useMemo, useCallback, useContext, useImperativeHandle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getHooks", function() { return getHooks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useState", function() { return useState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useReducer", function() { return useReducer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invokeEffects", function() { return invokeEffects; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useEffect", function() { return useEffect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useLayoutEffect", function() { return useLayoutEffect; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useRef", function() { return useRef; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useMemo", function() { return useMemo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useCallback", function() { return useCallback; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useContext", function() { return useContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "useImperativeHandle", function() { return useImperativeHandle; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _current_owner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./current-owner */ "./src/nerv/current-owner.ts");
/* harmony import */ var _render_queue__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./render-queue */ "./src/nerv/render-queue.ts");




function getHooks(index) {
    if (_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current === null) {
        throw new Error('invalid hooks call: hooks can only be called in a stateless component.');
    }
    var hooks = _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current.hooks;
    if (index >= hooks.length) {
        hooks.push({});
    }
    return hooks[index];
}
function useState(initialState) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(initialState)) {
        initialState = initialState();
    }
    var hook = getHooks(_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].index++);
    if (!hook.state) {
        hook.component = _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current;
        hook.state = [
            initialState,
            function (action) {
                hook.state[0] = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(action) ? action(hook.state[0]) : action;
                hook.component._disable = false;
                hook.component.setState({});
            },
        ];
    }
    return hook.state;
}
function useReducer(reducer, initialState, initializer) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(initialState)) {
        initialState = initialState();
    }
    var hook = getHooks(_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].index++);
    if (!hook.state) {
        hook.component = _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current;
        hook.state = [
            Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(initializer) ? initialState : initializer(initialState),
            function (action) {
                hook.state[0] = reducer(hook.state[0], action);
                hook.component._disable = false;
                hook.component.setState({});
            },
        ];
    }
    return hook.state;
}
function areDepsChanged(prevDeps, deps) {
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(prevDeps) || Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(deps)) {
        return true;
    }
    return deps.some(function (d, i) { return !Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["objectIs"])(d, prevDeps[i]); });
}
function invokeEffects(component, delay) {
    if (delay === void 0) { delay = false; }
    var effects = delay ? component.effects : component.layoutEffects;
    (effects || []).forEach(function (hook) {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(hook.cleanup)) {
            hook.cleanup();
        }
        var result = hook.effect();
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(result)) {
            hook.cleanup = result;
        }
    });
    if (delay) {
        component.effects = [];
    }
    else {
        component.layoutEffects = [];
    }
}
var scheduleEffectComponents = [];
function invokeScheduleEffects(component) {
    if (!component._afterScheduleEffect) {
        component._afterScheduleEffect = true;
        scheduleEffectComponents.push(component);
        if (scheduleEffectComponents.length === 1) {
            Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["nextTick"])(function () {
                setTimeout(function () {
                    scheduleEffectComponents.forEach(function (c) {
                        c._afterScheduleEffect = false;
                        invokeEffects(c, true);
                    });
                    scheduleEffectComponents = [];
                }, 0);
            });
        }
    }
}
function useEffectImpl(effect, deps, delay) {
    if (delay === void 0) { delay = false; }
    var hook = getHooks(_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].index++);
    if (areDepsChanged(hook.deps, deps)) {
        hook.effect = effect;
        hook.deps = deps;
        if (delay) {
            _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current.effects = _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current.effects.concat(hook);
            invokeScheduleEffects(_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current);
        }
        else {
            _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current.layoutEffects = _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current.layoutEffects.concat(hook);
        }
    }
}
function useEffect(effect, deps) {
    useEffectImpl(effect, deps, true);
}
function useLayoutEffect(effect, deps) {
    useEffectImpl(effect, deps);
}
function useRef(initialValue) {
    var hook = getHooks(_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].index++);
    if (!hook.ref) {
        hook.ref = {
            current: initialValue,
        };
    }
    return hook.ref;
}
function useMemo(factory, deps) {
    var hook = getHooks(_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].index++);
    if (areDepsChanged(hook.deps, deps)) {
        hook.deps = deps;
        hook.callback = factory;
        hook.value = factory();
    }
    return hook.value;
}
function useCallback(callback, deps) {
    return useMemo(function () { return callback; }, deps);
}
function useContext(context) {
    var provider = _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current.context[context._id];
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(provider)) {
        return context._defaultValue;
    }
    var hook = getHooks(_current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].index++);
    // should update when value changes with shouldComponentUpdate:false Component on top
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(hook.context)) {
        hook.context = true;
        var c_1 = _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current;
        provider.on(function () { return Object(_render_queue__WEBPACK_IMPORTED_MODULE_3__["enqueueRender"])(c_1); });
    }
    return provider.value;
}
function useImperativeHandle(ref, init, deps) {
    useLayoutEffect(function () {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(ref)) {
            ref(init());
            return function () { return ref(null); };
        }
        else if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(ref)) {
            ref.current = init();
            return function () {
                delete ref.current;
            };
        }
    }, Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(deps) ? deps.concat([ref]) : undefined);
}


/***/ }),

/***/ "./src/nerv/hydrate.ts":
/*!*****************************!*\
  !*** ./src/nerv/hydrate.ts ***!
  \*****************************/
/*! exports provided: hydrate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hydrate", function() { return hydrate; });
/* harmony import */ var _render__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./render */ "./src/nerv/render.ts");
// tslint:disable:no-conditional-assignment

function hydrate(vnode, container, callback) {
    if (container !== null) {
        // lastChild causes less reflow than firstChild
        var dom = container.lastChild;
        // there should be only a single entry for the root
        while (dom) {
            var next = dom.previousSibling;
            container.removeChild(dom);
            dom = next;
        }
        return Object(_render__WEBPACK_IMPORTED_MODULE_0__["render"])(vnode, container, callback);
    }
}


/***/ }),

/***/ "./src/nerv/index.ts":
/*!***************************!*\
  !*** ./src/nerv/index.ts ***!
  \***************************/
/*! exports provided: createNervClass, Children, Component, PureComponent, createElement, cloneElement, render, nextTick, options, findDOMNode, isValidElement, unmountComponentAtNode, createPortal, unstable_renderSubtreeIntoContainer, hydrate, createFactory, unstable_batchedUpdates, version, PropTypes, createRef, forwardRef, memo, createContext, renderComponent, getHooks, Current, Fragment, useEffect, useLayoutEffect, useReducer, useState, useRef, useCallback, useMemo, useImperativeHandle, useContext, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "nextTick", function() { return _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["nextTick"]; });

/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component */ "./src/nerv/component.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _component__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _pure_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pure-component */ "./src/nerv/pure-component.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PureComponent", function() { return _pure_component__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _render__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./render */ "./src/nerv/render.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "render", function() { return _render__WEBPACK_IMPORTED_MODULE_3__["render"]; });

/* harmony import */ var _create_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./create-element */ "./src/nerv/create-element.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createElement", function() { return _create_element__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _clone_element__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./clone-element */ "./src/nerv/clone-element.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "cloneElement", function() { return _clone_element__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _children__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./children */ "./src/nerv/children.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Children", function() { return _children__WEBPACK_IMPORTED_MODULE_6__["Children"]; });

/* harmony import */ var _hydrate__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./hydrate */ "./src/nerv/hydrate.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "hydrate", function() { return _hydrate__WEBPACK_IMPORTED_MODULE_7__["hydrate"]; });

/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./options */ "./src/nerv/options.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "options", function() { return _options__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _vdom_create_portal__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./vdom/create-portal */ "./src/nerv/vdom/create-portal.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createPortal", function() { return _vdom_create_portal__WEBPACK_IMPORTED_MODULE_9__["createPortal"]; });

/* harmony import */ var _version__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./version */ "./src/nerv/version.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "version", function() { return _version__WEBPACK_IMPORTED_MODULE_10__["version"]; });

/* harmony import */ var _dom__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./dom */ "./src/nerv/dom.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "findDOMNode", function() { return _dom__WEBPACK_IMPORTED_MODULE_11__["findDOMNode"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isValidElement", function() { return _dom__WEBPACK_IMPORTED_MODULE_11__["isValidElement"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unmountComponentAtNode", function() { return _dom__WEBPACK_IMPORTED_MODULE_11__["unmountComponentAtNode"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unstable_renderSubtreeIntoContainer", function() { return _dom__WEBPACK_IMPORTED_MODULE_11__["unstable_renderSubtreeIntoContainer"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createFactory", function() { return _dom__WEBPACK_IMPORTED_MODULE_11__["createFactory"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unstable_batchedUpdates", function() { return _dom__WEBPACK_IMPORTED_MODULE_11__["unstable_batchedUpdates"]; });

/* harmony import */ var _prop_types__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./prop-types */ "./src/nerv/prop-types.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PropTypes", function() { return _prop_types__WEBPACK_IMPORTED_MODULE_12__["PropTypes"]; });

/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./hooks */ "./src/nerv/hooks.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getHooks", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["getHooks"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useEffect", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useEffect"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useLayoutEffect", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useLayoutEffect"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useReducer", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useReducer"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useState", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useState"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useRef", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useRef"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useCallback", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useCallback"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useMemo", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useMemo"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useImperativeHandle", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useImperativeHandle"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "useContext", function() { return _hooks__WEBPACK_IMPORTED_MODULE_13__["useContext"]; });

/* harmony import */ var _create_ref__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./create-ref */ "./src/nerv/create-ref.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createRef", function() { return _create_ref__WEBPACK_IMPORTED_MODULE_14__["createRef"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "forwardRef", function() { return _create_ref__WEBPACK_IMPORTED_MODULE_14__["forwardRef"]; });

/* harmony import */ var _memo__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./memo */ "./src/nerv/memo.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "memo", function() { return _memo__WEBPACK_IMPORTED_MODULE_15__["memo"]; });

/* harmony import */ var _create_context__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./create-context */ "./src/nerv/create-context.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createContext", function() { return _create_context__WEBPACK_IMPORTED_MODULE_16__["createContext"]; });

/* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./lifecycle */ "./src/nerv/lifecycle.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "renderComponent", function() { return _lifecycle__WEBPACK_IMPORTED_MODULE_17__["renderComponent"]; });

/* harmony import */ var _current_owner__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./current-owner */ "./src/nerv/current-owner.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Current", function() { return _current_owner__WEBPACK_IMPORTED_MODULE_18__["default"]; });

/* harmony import */ var _fragment__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./fragment */ "./src/nerv/fragment.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Fragment", function() { return _fragment__WEBPACK_IMPORTED_MODULE_19__["Fragment"]; });

/* harmony import */ var _create_class__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./create-class */ "./src/nerv/create-class.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "createNervClass", function() { return _create_class__WEBPACK_IMPORTED_MODULE_20__["default"]; });













 // for React 15- compat
// tslint:disable-next-line: max-line-length









/* harmony default export */ __webpack_exports__["default"] = ({
    createNervClass: _create_class__WEBPACK_IMPORTED_MODULE_20__["default"],
    Children: _children__WEBPACK_IMPORTED_MODULE_6__["Children"],
    Component: _component__WEBPACK_IMPORTED_MODULE_1__["default"],
    PureComponent: _pure_component__WEBPACK_IMPORTED_MODULE_2__["default"],
    createElement: _create_element__WEBPACK_IMPORTED_MODULE_4__["default"],
    cloneElement: _clone_element__WEBPACK_IMPORTED_MODULE_5__["default"],
    render: _render__WEBPACK_IMPORTED_MODULE_3__["render"],
    nextTick: _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["nextTick"],
    options: _options__WEBPACK_IMPORTED_MODULE_8__["default"],
    findDOMNode: _dom__WEBPACK_IMPORTED_MODULE_11__["findDOMNode"],
    isValidElement: _dom__WEBPACK_IMPORTED_MODULE_11__["isValidElement"],
    unmountComponentAtNode: _dom__WEBPACK_IMPORTED_MODULE_11__["unmountComponentAtNode"],
    createPortal: _vdom_create_portal__WEBPACK_IMPORTED_MODULE_9__["createPortal"],
    unstable_renderSubtreeIntoContainer: _dom__WEBPACK_IMPORTED_MODULE_11__["unstable_renderSubtreeIntoContainer"],
    hydrate: _hydrate__WEBPACK_IMPORTED_MODULE_7__["hydrate"],
    createFactory: _dom__WEBPACK_IMPORTED_MODULE_11__["createFactory"],
    unstable_batchedUpdates: _dom__WEBPACK_IMPORTED_MODULE_11__["unstable_batchedUpdates"],
    version: _version__WEBPACK_IMPORTED_MODULE_10__["version"],
    PropTypes: _prop_types__WEBPACK_IMPORTED_MODULE_12__["PropTypes"],
    createRef: _create_ref__WEBPACK_IMPORTED_MODULE_14__["createRef"],
    forwardRef: _create_ref__WEBPACK_IMPORTED_MODULE_14__["forwardRef"],
    memo: _memo__WEBPACK_IMPORTED_MODULE_15__["memo"],
    createContext: _create_context__WEBPACK_IMPORTED_MODULE_16__["createContext"],
    renderComponent: _lifecycle__WEBPACK_IMPORTED_MODULE_17__["renderComponent"],
    getHooks: _hooks__WEBPACK_IMPORTED_MODULE_13__["getHooks"],
    Current: _current_owner__WEBPACK_IMPORTED_MODULE_18__["default"],
    useEffect: _hooks__WEBPACK_IMPORTED_MODULE_13__["useEffect"],
    useLayoutEffect: _hooks__WEBPACK_IMPORTED_MODULE_13__["useLayoutEffect"],
    useReducer: _hooks__WEBPACK_IMPORTED_MODULE_13__["useReducer"],
    useState: _hooks__WEBPACK_IMPORTED_MODULE_13__["useState"],
    useRef: _hooks__WEBPACK_IMPORTED_MODULE_13__["useRef"],
    useCallback: _hooks__WEBPACK_IMPORTED_MODULE_13__["useCallback"],
    useMemo: _hooks__WEBPACK_IMPORTED_MODULE_13__["useMemo"],
    useImperativeHandle: _hooks__WEBPACK_IMPORTED_MODULE_13__["useImperativeHandle"],
    useContext: _hooks__WEBPACK_IMPORTED_MODULE_13__["useContext"],
    Fragment: _fragment__WEBPACK_IMPORTED_MODULE_19__["Fragment"],
});


/***/ }),

/***/ "./src/nerv/lifecycle.ts":
/*!*******************************!*\
  !*** ./src/nerv/lifecycle.ts ***!
  \*******************************/
/*! exports provided: errorCatcher, ensureVirtualNode, mountVNode, getContextByContextType, mountComponent, getChildContext, renderComponent, flushMount, reRenderComponent, updateComponent, unmountComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "errorCatcher", function() { return errorCatcher; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ensureVirtualNode", function() { return ensureVirtualNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountVNode", function() { return mountVNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getContextByContextType", function() { return getContextByContextType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountComponent", function() { return mountComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getChildContext", function() { return getChildContext; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "renderComponent", function() { return renderComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "flushMount", function() { return flushMount; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "reRenderComponent", function() { return reRenderComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateComponent", function() { return updateComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unmountComponent", function() { return unmountComponent; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _current_owner__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./current-owner */ "./src/nerv/current-owner.ts");
/* harmony import */ var _vdom_create_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./vdom/create-element */ "./src/nerv/vdom/create-element.ts");
/* harmony import */ var _vdom_create_vtext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vdom/create-vtext */ "./src/nerv/vdom/create-vtext.ts");
/* harmony import */ var _vdom_create_void__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./vdom/create-void */ "./src/nerv/vdom/create-void.ts");
/* harmony import */ var _vdom_patch__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./vdom/patch */ "./src/nerv/vdom/patch.ts");
/* harmony import */ var _vdom_unmount__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./vdom/unmount */ "./src/nerv/vdom/unmount.ts");
/* harmony import */ var _vdom_ref__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./vdom/ref */ "./src/nerv/vdom/ref.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./component */ "./src/nerv/component.ts");
/* harmony import */ var _hooks__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./hooks */ "./src/nerv/hooks.ts");
// import { extend, isFunction, isNumber, isString } from '@/nerv/utils'











var readyComponents = [];
function errorCatcher(fn, component) {
    try {
        return fn();
    }
    catch (error) {
        errorHandler(component, error);
    }
}
function errorHandler(component, error) {
    // if(!component) { throw error ; return }
    var boundary;
    while (true) {
        var getDerivedStateFromError = component.constructor.getDerivedStateFromError;
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(getDerivedStateFromError) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentDidCatch)) {
            boundary = component;
            break;
        }
        else if (component._parentComponent) {
            component = component._parentComponent;
        }
        else {
            break;
        }
    }
    if (boundary) {
        var getDerivedStateFromError = boundary.constructor.getDerivedStateFromError;
        var _disable = boundary._disable;
        boundary._disable = false;
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(getDerivedStateFromError)) {
            component.setState(getDerivedStateFromError(error));
        }
        else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentDidCatch)) {
            boundary.componentDidCatch(error);
        }
        boundary._disable = _disable;
    }
    else {
        throw error;
    }
}
function ensureVirtualNode(rendered) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isNumber"])(rendered) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(rendered)) {
        return Object(_vdom_create_vtext__WEBPACK_IMPORTED_MODULE_4__["default"])(rendered);
    }
    else if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isInvalid"])(rendered)) {
        return Object(_vdom_create_void__WEBPACK_IMPORTED_MODULE_5__["createVoid"])();
    }
    else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(rendered)) {
        rendered = rendered.length === 0 ? Object(_vdom_create_void__WEBPACK_IMPORTED_MODULE_5__["createVoid"])() : rendered.map(ensureVirtualNode);
    }
    return rendered;
}
function mountVNode(vnode, parentContext, parentComponent) {
    return Object(_vdom_create_element__WEBPACK_IMPORTED_MODULE_3__["default"])(vnode, false, parentContext, parentComponent);
}
function getContextByContextType(vnode, parentContext) {
    var contextType = vnode.type.contextType;
    var hasContextType = !Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(contextType);
    var provider = hasContextType ? (parentContext[contextType._id]) : null;
    var context = hasContextType
        ? (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(provider) ? provider.value : contextType._defaultValue)
        : parentContext;
    return context;
}
function mountComponent(vnode, parentContext, parentComponent) {
    var ref = vnode.ref;
    if (vnode.type.prototype && vnode.type.prototype.render) {
        var context = getContextByContextType(vnode, parentContext);
        vnode.component = new vnode.type(vnode.props, context);
    }
    else {
        var c_1 = new _component__WEBPACK_IMPORTED_MODULE_9__["default"](vnode.props, parentContext);
        c_1.render = function () { return vnode.type.call(c_1, c_1.props, c_1.context); };
        vnode.component = c_1;
    }
    var component = vnode.component;
    component.vnode = vnode;
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isComponent"])(parentComponent)) {
        component._parentComponent = parentComponent;
    }
    var newState = callGetDerivedStateFromProps(vnode.props, component.state, component);
    if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(newState)) {
        component.state = newState;
    }
    if (!hasNewLifecycle(component) && Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentWillMount)) {
        errorCatcher(function () {
            component.componentWillMount();
        }, component);
        component.state = component.getState();
        component.clearCallBacks();
    }
    component._dirty = false;
    var rendered = renderComponent(component);
    rendered.parentVNode = vnode;
    component._rendered = rendered;
    if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(ref)) {
        _vdom_ref__WEBPACK_IMPORTED_MODULE_8__["default"].attach(vnode, ref, vnode.dom);
    }
    var dom = (vnode.dom = mountVNode(rendered, getChildContext(component, parentContext), component));
    Object(_hooks__WEBPACK_IMPORTED_MODULE_10__["invokeEffects"])(component);
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentDidMount)) {
        readyComponents.push(component);
    }
    component._disable = false;
    return dom;
}
function getChildContext(component, context) {
    if (context === void 0) { context = _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_OBJ"]; }
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.getChildContext)) {
        return Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["extend"])(Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["clone"])(context), component.getChildContext());
    }
    return Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["clone"])(context);
}
function renderComponent(component) {
    _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current = component;
    _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].index = 0;
    Object(_hooks__WEBPACK_IMPORTED_MODULE_10__["invokeEffects"])(component, true);
    var rendered;
    errorCatcher(function () {
        rendered = component.render();
    }, component);
    rendered = ensureVirtualNode(rendered);
    _current_owner__WEBPACK_IMPORTED_MODULE_2__["default"].current = null;
    return rendered;
}
function flushMount() {
    if (!readyComponents.length) {
        return;
    }
    // @TODO: perf
    var queue = readyComponents.slice(0);
    readyComponents.length = 0;
    queue.forEach(function (item) {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(item)) {
            item();
        }
        else if (item.componentDidMount) {
            errorCatcher(function () {
                item.componentDidMount();
            }, item);
        }
    });
}
function getFragmentHostNode(children) {
    var child = children[0];
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(child)) {
        return getFragmentHostNode(child);
    }
    else if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isComposite"])(child) && child.dom == null) {
        return getFragmentHostNode(child.component._rendered);
    }
    return child != null ? child.dom : null;
}
function reRenderComponent(prev, current) {
    var component = (current.component = prev.component);
    var nextProps = current.props;
    var nextContext = current.context;
    component._disable = true;
    if (!hasNewLifecycle(component) && Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentWillReceiveProps)) {
        errorCatcher(function () {
            component.componentWillReceiveProps(nextProps, nextContext);
        }, component);
    }
    component._disable = false;
    component.prevProps = component.props;
    component.prevState = component.state;
    component.prevContext = component.context;
    component.props = nextProps;
    component.context = nextContext;
    if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(current.ref)) {
        _vdom_ref__WEBPACK_IMPORTED_MODULE_8__["default"].update(prev, current);
    }
    return updateComponent(component);
}
function callShouldComponentUpdate(props, state, context, component) {
    var shouldUpdate = true;
    errorCatcher(function () {
        shouldUpdate = component.shouldComponentUpdate(props, state, context);
    }, component);
    return shouldUpdate;
}
function updateComponent(component, isForce) {
    if (isForce === void 0) { isForce = false; }
    var vnode = component.vnode;
    var dom = vnode.dom;
    var props = component.props;
    var state = component.getState();
    var context = component.context;
    var prevProps = component.prevProps || props;
    var prevState = component.prevState || component.state;
    var prevContext = component.prevContext || context;
    var stateFromProps = callGetDerivedStateFromProps(props, state, component);
    if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(stateFromProps)) {
        state = stateFromProps;
    }
    component.props = prevProps;
    component.context = prevContext;
    var skip = false;
    var onSCU = props.onShouldComponentUpdate;
    if (!isForce
        && ((Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.shouldComponentUpdate)
            && callShouldComponentUpdate(props, state, context, component) === false)
            || (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(onSCU) && onSCU(prevProps, props) === false))) {
        skip = true;
    }
    else if (!hasNewLifecycle(component) && Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentWillUpdate)) {
        errorCatcher(function () {
            component.componentWillUpdate(props, state, context);
        }, component);
    }
    if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(stateFromProps)) {
        component.state = stateFromProps;
    }
    component.props = props;
    component.state = state;
    component.context = context;
    component._dirty = false;
    if (!skip) {
        var lastRendered = component._rendered;
        var rendered = renderComponent(component);
        rendered.parentVNode = vnode;
        var childContext = getChildContext(component, context);
        var snapshot_1 = callGetSnapshotBeforeUpdate(prevProps, prevState, component);
        var parentDom = lastRendered.dom && lastRendered.dom.parentNode;
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(lastRendered)) {
            var hostNode = getFragmentHostNode(lastRendered);
            if (hostNode != null) {
                parentDom = lastRendered.dom = hostNode.parentNode;
            }
        }
        dom = vnode.dom = Object(_vdom_patch__WEBPACK_IMPORTED_MODULE_6__["default"])(lastRendered, rendered, parentDom || null, childContext);
        component._rendered = rendered;
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentDidUpdate)) {
            errorCatcher(function () {
                component.componentDidUpdate(prevProps, prevState, snapshot_1);
            }, component);
        }
        while (vnode = vnode.parentVNode) {
            if ((vnode.vtype & (4 /* Composite */)) > 0) {
                vnode.dom = dom;
            }
        }
    }
    component.prevProps = component.props;
    component.prevState = component.state;
    component.prevContext = component.context;
    component.clearCallBacks();
    flushMount();
    Object(_hooks__WEBPACK_IMPORTED_MODULE_10__["invokeEffects"])(component);
    return dom;
}
function unmountComponent(vnode) {
    var component = vnode.component;
    component.hooks.forEach(function (hook) {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(hook.cleanup)) {
            hook.cleanup();
        }
    });
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.componentWillUnmount)) {
        errorCatcher(function () {
            component.componentWillUnmount();
        }, component);
    }
    component._disable = true;
    Object(_vdom_unmount__WEBPACK_IMPORTED_MODULE_7__["unmount"])(component._rendered);
    if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(vnode.ref)) {
        _vdom_ref__WEBPACK_IMPORTED_MODULE_8__["default"].detach(vnode, vnode.ref, vnode.dom);
    }
}
function callGetDerivedStateFromProps(props, state, inst) {
    var getDerivedStateFromProps = inst.constructor.getDerivedStateFromProps;
    var newState;
    // @TODO show warning
    errorCatcher(function () {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(getDerivedStateFromProps)) {
            var partialState = getDerivedStateFromProps.call(null, props, state);
            if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isUndefined"])(partialState)) {
                newState = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["extend"])(Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["clone"])(state), partialState);
            }
        }
    }, inst);
    return newState;
}
function callGetSnapshotBeforeUpdate(props, state, inst) {
    var getSnapshotBeforeUpdate = inst.getSnapshotBeforeUpdate;
    var snapshot;
    errorCatcher(function () {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(getSnapshotBeforeUpdate)) {
            snapshot = getSnapshotBeforeUpdate.call(inst, props, state);
        }
    }, inst);
    return snapshot;
}
function hasNewLifecycle(component) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(component.constructor.getDerivedStateFromProps)) {
        return true;
    }
    return false;
}


/***/ }),

/***/ "./src/nerv/memo.ts":
/*!**************************!*\
  !*** ./src/nerv/memo.ts ***!
  \**************************/
/*! exports provided: memo */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "memo", function() { return memo; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _vdom_ref__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./vdom/ref */ "./src/nerv/vdom/ref.ts");
/* harmony import */ var _create_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./create-element */ "./src/nerv/create-element.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};



function memo(component, propsAreEqual) {
    function shouldComponentUpdate(nextProps) {
        var prevRef = this.props.ref;
        var nextRef = nextProps.ref;
        if (prevRef !== nextRef) {
            _vdom_ref__WEBPACK_IMPORTED_MODULE_1__["default"].detach(this.vnode, prevRef, this.dom);
            _vdom_ref__WEBPACK_IMPORTED_MODULE_1__["default"].attach(this.vnode, nextRef, this.dom);
            return true;
        }
        return Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(propsAreEqual) ? !propsAreEqual(this.props, nextProps) : !Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["shallowEqual"])(this.props, nextProps);
    }
    function Memoed(props) {
        this.shouldComponentUpdate = shouldComponentUpdate;
        return Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(component, __assign({}, props));
    }
    Memoed._forwarded = true;
    Memoed.isMemo = true;
    return Memoed;
}


/***/ }),

/***/ "./src/nerv/options.ts":
/*!*****************************!*\
  !*** ./src/nerv/options.ts ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");

var options = {
    afterMount: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
    afterUpdate: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
    beforeUpdate: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
    beforeUnmount: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
    beforeRender: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
    beforeMount: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
    afterCreate: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
    roots: [],
    debug: false,
};
/* harmony default export */ __webpack_exports__["default"] = (options);


/***/ }),

/***/ "./src/nerv/passive-event.ts":
/*!***********************************!*\
  !*** ./src/nerv/passive-event.ts ***!
  \***********************************/
/*! exports provided: supportedPassiveEventMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "supportedPassiveEventMap", function() { return supportedPassiveEventMap; });
var defaultOptions = {
    passive: false,
    capture: false
};
var eventListenerOptionsSupported = function () {
    var supported = false;
    try {
        var opts = Object.defineProperty({}, 'passive', {
            get: function () {
                supported = true;
            }
        });
        window.addEventListener('test', null, opts);
        window.removeEventListener('test', null, opts);
    }
    catch (e) {
        supported = false;
    }
    return supported;
};
function getDefaultPassiveOption() {
    var passiveOption = !eventListenerOptionsSupported() ? false : defaultOptions;
    return function () {
        return passiveOption;
    };
}
var getPassiveOption = getDefaultPassiveOption();
var supportedPassiveEventMap = {
    scroll: getPassiveOption(),
    wheel: getPassiveOption(),
    touchstart: getPassiveOption(),
    touchmove: getPassiveOption(),
    touchenter: getPassiveOption(),
    touchend: getPassiveOption(),
    touchleave: getPassiveOption(),
    mouseout: getPassiveOption(),
    mouseleave: getPassiveOption(),
    mouseup: getPassiveOption(),
    mousedown: getPassiveOption(),
    mousemove: getPassiveOption(),
    mouseenter: getPassiveOption(),
    mousewheel: getPassiveOption(),
    mouseover: getPassiveOption()
};


/***/ }),

/***/ "./src/nerv/prop-types.ts":
/*!********************************!*\
  !*** ./src/nerv/prop-types.ts ***!
  \********************************/
/*! exports provided: PropTypes */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PropTypes", function() { return PropTypes; });
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");

var shim = _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"];
shim.isRequired = _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"];
function getShim() {
    return shim;
}
var PropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    PropTypes: {},
    checkPropTypes: _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["noop"],
};
PropTypes.PropTypes = PropTypes;



/***/ }),

/***/ "./src/nerv/pure-component.ts":
/*!************************************!*\
  !*** ./src/nerv/pure-component.ts ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./component */ "./src/nerv/component.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();


var PureComponent = /** @class */ (function (_super) {
    __extends(PureComponent, _super);
    function PureComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isPureComponent = true;
        return _this;
    }
    PureComponent.prototype.shouldComponentUpdate = function (nextProps, nextState) {
        return !Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["shallowEqual"])(this.props, nextProps) || !Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["shallowEqual"])(this.state, nextState);
    };
    return PureComponent;
}(_component__WEBPACK_IMPORTED_MODULE_1__["default"]));
/* harmony default export */ __webpack_exports__["default"] = (PureComponent);


/***/ }),

/***/ "./src/nerv/render-queue.ts":
/*!**********************************!*\
  !*** ./src/nerv/render-queue.ts ***!
  \**********************************/
/*! exports provided: enqueueRender, rerender */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enqueueRender", function() { return enqueueRender; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "rerender", function() { return rerender; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lifecycle */ "./src/nerv/lifecycle.ts");


var items = [];
function enqueueRender(component) {
    // tslint:disable-next-line:no-conditional-assignment
    if (!component._dirty && (component._dirty = true) && items.push(component) === 1) {
        Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["nextTick"])(rerender);
    }
}
function rerender(isForce) {
    if (isForce === void 0) { isForce = false; }
    var p;
    var list = items;
    items = [];
    // tslint:disable-next-line:no-conditional-assignment
    while ((p = list.pop())) {
        if (p._dirty) {
            Object(_lifecycle__WEBPACK_IMPORTED_MODULE_1__["updateComponent"])(p, isForce);
        }
    }
}


/***/ }),

/***/ "./src/nerv/render.ts":
/*!****************************!*\
  !*** ./src/nerv/render.ts ***!
  \****************************/
/*! exports provided: render */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./lifecycle */ "./src/nerv/lifecycle.ts");
/* harmony import */ var _vdom_patch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./vdom/patch */ "./src/nerv/vdom/patch.ts");
/* harmony import */ var _options__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./options */ "./src/nerv/options.ts");
/* harmony import */ var _vdom_create_element__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./vdom/create-element */ "./src/nerv/vdom/create-element.ts");





function render(vnode, container, callback) {
    if (!container) {
        throw new Error(container + " should be a DOM Element");
    }
    var lastVnode = container._component;
    var dom;
    _options__WEBPACK_IMPORTED_MODULE_3__["default"].roots.push(vnode);
    if (typeof lastVnode !== 'undefined') {
        _options__WEBPACK_IMPORTED_MODULE_3__["default"].roots = _options__WEBPACK_IMPORTED_MODULE_3__["default"].roots.filter(function (item) { return item !== lastVnode; });
        dom = Object(_vdom_patch__WEBPACK_IMPORTED_MODULE_2__["patch"])(lastVnode, vnode, container, {});
    }
    else {
        dom = Object(_lifecycle__WEBPACK_IMPORTED_MODULE_1__["mountVNode"])(vnode, {});
        Object(_vdom_create_element__WEBPACK_IMPORTED_MODULE_4__["mountElement"])(dom, container);
    }
    if (container) {
        container._component = vnode;
    }
    Object(_lifecycle__WEBPACK_IMPORTED_MODULE_1__["flushMount"])();
    if (callback) {
        callback();
    }
    return Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isComposite"])(vnode) ? vnode.component : dom;
}


/***/ }),

/***/ "./src/nerv/shared/index.ts":
/*!**********************************!*\
  !*** ./src/nerv/shared/index.ts ***!
  \**********************************/
/*! exports provided: EMPTY_CHILDREN, EMPTY_OBJ, isNullOrUndef, isInvalid, isVNode, isVText, isComponent, isWidget, isPortal, isComposite, isValidElement, isHook, noop, VType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EMPTY_CHILDREN", function() { return EMPTY_CHILDREN; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EMPTY_OBJ", function() { return EMPTY_OBJ; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNullOrUndef", function() { return isNullOrUndef; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isInvalid", function() { return isInvalid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isVNode", function() { return isVNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isVText", function() { return isVText; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isComponent", function() { return isComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isWidget", function() { return isWidget; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isPortal", function() { return isPortal; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isComposite", function() { return isComposite; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isValidElement", function() { return isValidElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isHook", function() { return isHook; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noop", function() { return noop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VType", function() { return VType; });
var EMPTY_CHILDREN = [];
var EMPTY_OBJ = {};
function isNullOrUndef(o) {
    return o === undefined || o === null;
}
function isInvalid(o) {
    return isNullOrUndef(o) || o === true || o === false;
}
function isVNode(node) {
    return !isNullOrUndef(node) && node.vtype === 2 /* Node */;
}
function isVText(node) {
    return !isNullOrUndef(node) && node.vtype === 1 /* Text */;
}
function isComponent(instance) {
    return !isInvalid(instance) && instance.isReactComponent === EMPTY_OBJ;
}
function isWidget(node) {
    return (!isNullOrUndef(node) &&
        (node.vtype & (4 /* Composite */)) > 0);
}
function isPortal(vtype, node) {
    return (vtype & 32 /* Portal */) > 0;
}
function isComposite(node) {
    return !isNullOrUndef(node) && node.vtype === 4 /* Composite */;
}
function isValidElement(node) {
    return !isNullOrUndef(node) && node.vtype;
}
function isHook(arg) {
    return !isNullOrUndef(arg) && typeof arg.vhook === 'number';
}
// tslint:disable-next-line:no-empty
function noop() { }
// typescript will compile the enum's value for us.
// eg.
// Composite = 1 << 2  => Composite = 4
var VType;
(function (VType) {
    VType[VType["Text"] = 1] = "Text";
    VType[VType["Node"] = 2] = "Node";
    VType[VType["Composite"] = 4] = "Composite";
    VType[VType["Void"] = 16] = "Void";
    VType[VType["Portal"] = 32] = "Portal";
})(VType || (VType = {}));


/***/ }),

/***/ "./src/nerv/utils/env.ts":
/*!*******************************!*\
  !*** ./src/nerv/utils/env.ts ***!
  \*******************************/
/*! exports provided: global, isBrowser, doc, UA, isMacSafari, isIE9, isiOS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "global", function() { return global; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBrowser", function() { return isBrowser; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "doc", function() { return doc; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UA", function() { return UA; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isMacSafari", function() { return isMacSafari; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIE9", function() { return isIE9; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isiOS", function() { return isiOS; });
// tslint:disable-next-line
var global = (function () {
    var local;
    if (typeof global !== 'undefined') {
        local = global;
    }
    else if (typeof self !== 'undefined') {
        local = self;
    }
    else {
        try {
            // tslint:disable-next-line:function-constructor
            local = Function('return this')();
        }
        catch (e) {
            throw new Error('global object is unavailable in this environment');
        }
    }
    return local;
})();
var isBrowser = typeof window !== 'undefined';
// tslint:disable-next-line:no-empty
function noop() { }
var fakeDoc = {
    createElement: noop,
    createElementNS: noop,
    createTextNode: noop,
};
var doc = isBrowser ? document : fakeDoc;
var UA = isBrowser && window.navigator.userAgent.toLowerCase();
var isMacSafari = isBrowser && UA && window.navigator.platform
    && /mac/i.test(window.navigator.platform) && /^((?!chrome|android).)*safari/i.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isiOS = (UA && /iphone|ipad|ipod|ios/.test(UA));


/***/ }),

/***/ "./src/nerv/utils/index.ts":
/*!*********************************!*\
  !*** ./src/nerv/utils/index.ts ***!
  \*********************************/
/*! exports provided: nextTick, shallowEqual, SimpleMap, MapClass, isNumber, isSupportSVG, isString, isFunction, isBoolean, isArray, isObject, isNative, isUndefined, objectIs, global, isBrowser, doc, UA, isMacSafari, isIE9, isiOS, getPrototype, isAttrAnEvent, extend, clone */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPrototype", function() { return getPrototype; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isAttrAnEvent", function() { return isAttrAnEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "extend", function() { return extend; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clone", function() { return clone; });
/* harmony import */ var _next_tick__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./next-tick */ "./src/nerv/utils/next-tick.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "nextTick", function() { return _next_tick__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _shallow_equal__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shallow-equal */ "./src/nerv/utils/shallow-equal.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "shallowEqual", function() { return _shallow_equal__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _simple_map__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./simple-map */ "./src/nerv/utils/simple-map.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SimpleMap", function() { return _simple_map__WEBPACK_IMPORTED_MODULE_2__["SimpleMap"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MapClass", function() { return _simple_map__WEBPACK_IMPORTED_MODULE_2__["MapClass"]; });

/* harmony import */ var _is__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./is */ "./src/nerv/utils/is.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isNumber"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isSupportSVG", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isSupportSVG"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isString"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFunction", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isFunction"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isBoolean", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isBoolean"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isArray"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isObject", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isObject"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isNative", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isNative"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isUndefined", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["isUndefined"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "objectIs", function() { return _is__WEBPACK_IMPORTED_MODULE_3__["objectIs"]; });

/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./env */ "./src/nerv/utils/env.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "global", function() { return _env__WEBPACK_IMPORTED_MODULE_4__["global"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isBrowser", function() { return _env__WEBPACK_IMPORTED_MODULE_4__["isBrowser"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "doc", function() { return _env__WEBPACK_IMPORTED_MODULE_4__["doc"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UA", function() { return _env__WEBPACK_IMPORTED_MODULE_4__["UA"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isMacSafari", function() { return _env__WEBPACK_IMPORTED_MODULE_4__["isMacSafari"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isIE9", function() { return _env__WEBPACK_IMPORTED_MODULE_4__["isIE9"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isiOS", function() { return _env__WEBPACK_IMPORTED_MODULE_4__["isiOS"]; });






function getPrototype(obj) {
    /* istanbul ignore next */
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(obj);
    }
    else if (obj.__proto__) {
        return obj.__proto__;
    }
    /* istanbul ignore next */
    return obj.constructor.prototype;
}
function isAttrAnEvent(attr) {
    if (attr[0] === 'o' && attr[1] === 'n') {
        return true;
    }
    if (/^(bind|catch|capture-bind|capture-catch)([A-Za-z_]+)/.test(attr)) {
        return true;
    }
    return false;
}
var extend = (function () {
    return function (source, from) {
        if (!from) {
            return source;
        }
        Object.assign(source, from);
        return source;
    };
})();

function clone(obj) {
    return extend({}, obj);
}


/***/ }),

/***/ "./src/nerv/utils/is.ts":
/*!******************************!*\
  !*** ./src/nerv/utils/is.ts ***!
  \******************************/
/*! exports provided: isNumber, isSupportSVG, isString, isFunction, isBoolean, isArray, isObject, isNative, isUndefined, objectIs */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return isNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isSupportSVG", function() { return isSupportSVG; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return isString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFunction", function() { return isFunction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBoolean", function() { return isBoolean; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return isArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isObject", function() { return isObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNative", function() { return isNative; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUndefined", function() { return isUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "objectIs", function() { return objectIs; });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env */ "./src/nerv/utils/env.ts");

function isNumber(arg) {
    return typeof arg === 'number';
}
var isSupportSVG = isFunction(_env__WEBPACK_IMPORTED_MODULE_0__["doc"].createAttributeNS);
function isString(arg) {
    return typeof arg === 'string';
}
function isFunction(arg) {
    return typeof arg === 'function';
}
function isBoolean(arg) {
    return arg === true || arg === false;
}
var isArray = Array.isArray;
function isObject(arg) {
    return arg === Object(arg) && !isFunction(arg);
}
function isNative(Ctor) {
    return isFunction(Ctor) && /native code/.test(Ctor.toString());
}
function isUndefined(o) {
    return o === undefined;
}
// Object.is polyfill
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function objectIs(x, y) {
    if (x === y) { // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
    }
    // eslint-disable-next-line no-self-compare
    return x !== x && y !== y;
}


/***/ }),

/***/ "./src/nerv/utils/next-tick.ts":
/*!*************************************!*\
  !*** ./src/nerv/utils/next-tick.ts ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env */ "./src/nerv/utils/env.ts");
/* harmony import */ var _is__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is */ "./src/nerv/utils/is.ts");
var __spreadArrays = (undefined && undefined.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};


var canUsePromise = 'Promise' in _env__WEBPACK_IMPORTED_MODULE_0__["global"] && !_env__WEBPACK_IMPORTED_MODULE_0__["isMacSafari"];
var resolved;
if (canUsePromise) {
    resolved = Promise.resolve();
}
var nextTick = function (fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    fn = Object(_is__WEBPACK_IMPORTED_MODULE_1__["isFunction"])(fn) ? fn.bind.apply(fn, __spreadArrays([null], args)) : fn;
    if (canUsePromise) {
        return resolved.then(fn);
    }
    var timerFunc = 'requestAnimationFrame' in _env__WEBPACK_IMPORTED_MODULE_0__["global"] && !_env__WEBPACK_IMPORTED_MODULE_0__["isMacSafari"] ? requestAnimationFrame : setTimeout;
    timerFunc(fn);
};
/* harmony default export */ __webpack_exports__["default"] = (nextTick);


/***/ }),

/***/ "./src/nerv/utils/shallow-equal.ts":
/*!*****************************************!*\
  !*** ./src/nerv/utils/shallow-equal.ts ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return shallowEqual; });
/* istanbul ignore next */
// tslint:disable-next-line
Object.is = Object.is || function (x, y) {
    if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
    }
    return x !== x && y !== y;
};
function shallowEqual(obj1, obj2) {
    if (obj1 === null || obj2 === null) {
        return false;
    }
    if (Object.is(obj1, obj2)) {
        return true;
    }
    var obj1Keys = obj1 ? Object.keys(obj1) : [];
    var obj2Keys = obj2 ? Object.keys(obj2) : [];
    if (obj1Keys.length !== obj2Keys.length) {
        return false;
    }
    for (var i = 0; i < obj1Keys.length; i++) {
        var obj1KeyItem = obj1Keys[i];
        if (!obj2.hasOwnProperty(obj1KeyItem) || !Object.is(obj1[obj1KeyItem], obj2[obj1KeyItem])) {
            return false;
        }
    }
    return true;
}


/***/ }),

/***/ "./src/nerv/utils/simple-map.ts":
/*!**************************************!*\
  !*** ./src/nerv/utils/simple-map.ts ***!
  \**************************************/
/*! exports provided: SimpleMap, MapClass */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SimpleMap", function() { return SimpleMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MapClass", function() { return MapClass; });
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./env */ "./src/nerv/utils/env.ts");

var SimpleMap = /** @class */ (function () {
    function SimpleMap() {
        this.cache = [];
        this.size = 0;
    }
    SimpleMap.prototype.set = function (k, v) {
        var len = this.cache.length;
        if (!len) {
            this.cache.push({ k: k, v: v });
            this.size += 1;
            return;
        }
        for (var i = 0; i < len; i++) {
            var item = this.cache[i];
            if (item.k === k) {
                item.v = v;
                return;
            }
        }
        this.cache.push({ k: k, v: v });
        this.size += 1;
    };
    SimpleMap.prototype.get = function (k) {
        var len = this.cache.length;
        if (!len) {
            return;
        }
        for (var i = 0; i < len; i++) {
            var item = this.cache[i];
            if (item.k === k) {
                return item.v;
            }
        }
    };
    SimpleMap.prototype.has = function (k) {
        var len = this.cache.length;
        if (!len) {
            return false;
        }
        for (var i = 0; i < len; i++) {
            var item = this.cache[i];
            if (item.k === k) {
                return true;
            }
        }
        return false;
    };
    SimpleMap.prototype.delete = function (k) {
        var len = this.cache.length;
        for (var i = 0; i < len; i++) {
            var item = this.cache[i];
            if (item.k === k) {
                this.cache.splice(i, 1);
                this.size -= 1;
                return true;
            }
        }
        return false;
    };
    SimpleMap.prototype.clear = function () {
        var len = this.cache.length;
        this.size = 0;
        if (!len) {
            return;
        }
        while (len) {
            this.cache.pop();
            len--;
        }
    };
    return SimpleMap;
}());

var MapClass = 'Map' in _env__WEBPACK_IMPORTED_MODULE_0__["global"] ? Map : SimpleMap;


/***/ }),

/***/ "./src/nerv/vdom/create-element.ts":
/*!*****************************************!*\
  !*** ./src/nerv/vdom/create-element.ts ***!
  \*****************************************/
/*! exports provided: mountVNode, mountChild, mountElement, insertElement, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountVNode", function() { return mountVNode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountChild", function() { return mountChild; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountElement", function() { return mountElement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "insertElement", function() { return insertElement; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _patch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./patch */ "./src/nerv/vdom/patch.ts");
/* harmony import */ var _ref__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ref */ "./src/nerv/vdom/ref.ts");




var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
function createElement(vnode, isSvg, parentContext, parentComponent) {
    var domNode;
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isValidElement"])(vnode)) {
        var vtype = vnode.vtype;
        if (vtype & (4 /* Composite */)) {
            domNode = vnode.init(parentContext, parentComponent);
        }
        else if (vtype & 1 /* Text */) {
            domNode = _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["doc"].createTextNode(vnode.text);
            vnode.dom = domNode;
        }
        else if (vtype & 2 /* Node */) {
            domNode = mountVNode(vnode, isSvg, parentContext, parentComponent);
        }
        else if (vtype & 16 /* Void */) {
            domNode = vnode.dom = _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["doc"].createTextNode('');
        }
        else if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isPortal"])(vtype, vnode)) {
            vnode.type.appendChild(createElement(vnode.children, isSvg, parentContext, parentComponent));
            domNode = _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["doc"].createTextNode('');
        }
    }
    else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(vnode) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isNumber"])(vnode)) {
        domNode = _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["doc"].createTextNode(vnode);
    }
    else if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(vnode) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isBoolean"])(vnode)) {
        domNode = _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["doc"].createTextNode('');
    }
    else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(vnode)) {
        domNode = vnode.map(function (child) { return createElement(child, isSvg, parentContext, parentComponent); });
    }
    else {
        throw new Error('Unsupported VNode.');
    }
    return domNode;
}
function mountVNode(vnode, isSvg, parentContext, parentComponent) {
    if (vnode.isSvg) {
        isSvg = true;
    }
    else if (vnode.type === 'svg') {
        isSvg = true;
        /* istanbul ignore next */
    }
    else if (!_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isSupportSVG"]) {
        isSvg = false;
    }
    if (isSvg) {
        vnode.namespace = SVG_NAMESPACE;
        vnode.isSvg = isSvg;
    }
    var domNode = !isSvg
        ? _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["doc"].createElement(vnode.type)
        : _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["doc"].createElementNS(vnode.namespace, vnode.type);
    setProps(domNode, vnode, isSvg);
    if (vnode.type === 'foreignObject') {
        isSvg = false;
    }
    var children = vnode.children;
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(children)) {
        for (var i = 0, len = children.length; i < len; i++) {
            mountChild(children[i], domNode, parentContext, isSvg, parentComponent);
        }
    }
    else {
        mountChild(children, domNode, parentContext, isSvg, parentComponent);
    }
    vnode.dom = domNode;
    if (vnode.ref !== null) {
        _ref__WEBPACK_IMPORTED_MODULE_3__["default"].attach(vnode, vnode.ref, domNode);
    }
    return domNode;
}
function mountChild(child, domNode, parentContext, isSvg, parentComponent) {
    child.parentContext = parentContext || _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_OBJ"];
    var childNode = createElement(child, isSvg, parentContext, parentComponent);
    mountElement(childNode, domNode);
}
function mountElement(element, parentNode, refChild) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(element)) {
        for (var i = 0; i < element.length; i++) {
            var el = element[i];
            mountElement(el, parentNode);
        }
    }
    else {
        refChild != null ? parentNode.insertBefore(element, refChild) : parentNode.appendChild(element);
    }
}
function insertElement(element, parentNode, lastDom) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(element)) {
        for (var i = 0; i < element.length; i++) {
            var el = element[i];
            insertElement(el, parentNode, lastDom);
        }
    }
    else {
        parentNode.insertBefore(element, lastDom);
    }
}
function setProps(domNode, vnode, isSvg) {
    var props = vnode.props;
    for (var p in props) {
        Object(_patch__WEBPACK_IMPORTED_MODULE_2__["patchProp"])(domNode, p, null, props[p], null, isSvg);
    }
}
/* harmony default export */ __webpack_exports__["default"] = (createElement);


/***/ }),

/***/ "./src/nerv/vdom/create-portal.ts":
/*!****************************************!*\
  !*** ./src/nerv/vdom/create-portal.ts ***!
  \****************************************/
/*! exports provided: createPortal */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createPortal", function() { return createPortal; });
function createPortal(children, container) {
    return {
        type: container,
        vtype: 32 /* Portal */,
        children: children,
        dom: null,
    };
}


/***/ }),

/***/ "./src/nerv/vdom/create-vnode.ts":
/*!***************************************!*\
  !*** ./src/nerv/vdom/create-vnode.ts ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");

function createVNode(type, props, children, key, namespace, owner, ref) {
    return {
        type: type,
        key: key || null,
        vtype: 2 /* Node */,
        props: props || _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["EMPTY_OBJ"],
        children: children,
        namespace: namespace || null,
        _owner: owner,
        dom: null,
        ref: ref || null,
    };
}
/* harmony default export */ __webpack_exports__["default"] = (createVNode);


/***/ }),

/***/ "./src/nerv/vdom/create-void.ts":
/*!**************************************!*\
  !*** ./src/nerv/vdom/create-void.ts ***!
  \**************************************/
/*! exports provided: createVoid */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createVoid", function() { return createVoid; });
function createVoid() {
    return {
        dom: null,
        vtype: 16 /* Void */,
    };
}


/***/ }),

/***/ "./src/nerv/vdom/create-vtext.ts":
/*!***************************************!*\
  !*** ./src/nerv/vdom/create-vtext.ts ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createVText; });
function createVText(text) {
    return {
        text: text,
        vtype: 1 /* Text */,
        dom: null,
    };
}


/***/ }),

/***/ "./src/nerv/vdom/h.ts":
/*!****************************!*\
  !*** ./src/nerv/vdom/h.ts ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _create_vnode__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./create-vnode */ "./src/nerv/vdom/create-vnode.ts");
/* harmony import */ var _create_vtext__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./create-vtext */ "./src/nerv/vdom/create-vtext.ts");
/* harmony import */ var _create_void__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./create-void */ "./src/nerv/vdom/create-void.ts");





function h(type, props, children) {
    var childNodes;
    if (props.children) {
        if (!children) {
            children = props.children;
        }
    }
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isArray"])(children)) {
        childNodes = [];
        addChildren(childNodes, children, type);
    }
    else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isString"])(children) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(children)) {
        children = Object(_create_vtext__WEBPACK_IMPORTED_MODULE_3__["default"])(String(children));
    }
    else if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isValidElement"])(children)) {
        children = _nerv_shared__WEBPACK_IMPORTED_MODULE_0__["EMPTY_CHILDREN"];
    }
    props.children = childNodes !== undefined ? childNodes : children;
    return Object(_create_vnode__WEBPACK_IMPORTED_MODULE_2__["default"])(type, props, props.children, props.key, props.namespace, props.owner, props.ref);
}
function addChildren(childNodes, children, type) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isString"])(children) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isNumber"])(children)) {
        childNodes.push(Object(_create_vtext__WEBPACK_IMPORTED_MODULE_3__["default"])(String(children)));
    }
    else if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isValidElement"])(children)) {
        childNodes.push(children);
    }
    else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isArray"])(children)) {
        for (var i = 0; i < children.length; i++) {
            addChildren(childNodes, children[i], type);
        }
    }
    else {
        childNodes.push(Object(_create_void__WEBPACK_IMPORTED_MODULE_4__["createVoid"])());
    }
}
/* harmony default export */ __webpack_exports__["default"] = (h);


/***/ }),

/***/ "./src/nerv/vdom/patch.ts":
/*!********************************!*\
  !*** ./src/nerv/vdom/patch.ts ***!
  \********************************/
/*! exports provided: patch, patchChildren, patchProp, setProperty, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "patch", function() { return patch; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "patchChildren", function() { return patchChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "patchProp", function() { return patchProp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setProperty", function() { return setProperty; });
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _create_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./create-element */ "./src/nerv/vdom/create-element.ts");
/* harmony import */ var _unmount__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./unmount */ "./src/nerv/vdom/unmount.ts");
/* harmony import */ var _ref__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ref */ "./src/nerv/vdom/ref.ts");
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../event */ "./src/nerv/event.ts");
/* harmony import */ var _svg_property_config__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./svg-property-config */ "./src/nerv/vdom/svg-property-config.ts");
/* tslint:disable: no-empty */







function patch(lastVnode, nextVnode, parentNode, context, isSvg) {
    var lastDom = lastVnode.dom;
    var newDom;
    var lastVnodeIsArray = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(lastVnode);
    var nextVnodeisArray = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(nextVnode);
    if (isSameVNode(lastVnode, nextVnode)) {
        var vtype = nextVnode.vtype;
        if (vtype & 2 /* Node */) {
            isSvg = Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(isSvg) ? lastVnode.isSvg : isSvg;
            if (isSvg) {
                nextVnode.isSvg = isSvg;
            }
            patchProps(lastDom, nextVnode.props, lastVnode.props, lastVnode, isSvg);
            patchChildren(lastDom, lastVnode.children, nextVnode.children, context, isSvg);
            if (nextVnode.ref !== null) {
                _ref__WEBPACK_IMPORTED_MODULE_4__["default"].update(lastVnode, nextVnode, lastDom);
            }
            newDom = lastDom;
        }
        else if ((vtype & (4 /* Composite */)) > 0) {
            newDom = nextVnode.update(lastVnode, nextVnode, context);
        }
        else if (vtype & 1 /* Text */) {
            return patchVText(lastVnode, nextVnode);
        }
        else if (vtype & 32 /* Portal */) {
            patchChildren(lastVnode.type, lastVnode.children, nextVnode.children, context, isSvg);
        }
        // @TODO: test case
        nextVnode.dom = newDom || lastDom;
    }
    else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(lastVnode) && Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(nextVnode)) {
        patchArrayChildren(lastDom, lastVnode, nextVnode, context, false);
    }
    else if (lastVnodeIsArray && !nextVnodeisArray) {
        patchArrayChildren(parentNode, lastVnode, [nextVnode], context, false);
    }
    else if (!lastVnodeIsArray && nextVnodeisArray) {
        newDom = Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(nextVnode, isSvg, context);
        Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["insertElement"])(newDom, parentNode, lastDom);
        parentNode.removeChild(lastDom);
    }
    else {
        Object(_unmount__WEBPACK_IMPORTED_MODULE_3__["unmount"])(lastVnode);
        newDom = Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(nextVnode, isSvg, context);
        if (nextVnode !== null) {
            nextVnode.dom = newDom;
        }
        var newDomIsArray = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(newDom);
        var lastDomIsArray = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(lastDom);
        if (newDomIsArray) {
            Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["insertElement"])(newDom, parentNode, lastDom);
            parentNode.removeChild(lastDom);
        }
        else if (lastDomIsArray) {
            parentNode = lastDom[0].parentNode;
            parentNode.insertBefore(newDom, lastDom[0]);
            for (var i = 0; i < lastDom.length; i++) {
                parentNode.removeChild(lastDom[i]);
            }
        }
        else if (parentNode !== null) {
            if (lastDom != null) {
                parentNode.replaceChild(newDom, lastDom);
            }
            else {
                parentNode.appendChild(newDom);
            }
        }
    }
    return newDom;
}
function patchArrayChildren(parentDom, lastChildren, nextChildren, context, isSvg) {
    var lastLength = lastChildren.length;
    var nextLength = nextChildren.length;
    if (lastLength === 0) {
        if (nextLength > 0) {
            for (var i = 0; i < nextLength; i++) {
                Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["mountChild"])(nextChildren[i], parentDom, context, isSvg);
            }
        }
    }
    else if (nextLength === 0) {
        Object(_unmount__WEBPACK_IMPORTED_MODULE_3__["unmountChildren"])(lastChildren);
        parentDom.textContent = '';
    }
    else if (isKeyed(lastChildren, nextChildren)) {
        patchKeyedChildren(lastChildren, nextChildren, parentDom, context, isSvg, lastLength, nextLength);
    }
    else {
        patchNonKeyedChildren(parentDom, lastChildren, nextChildren, context, isSvg, lastLength, nextLength);
    }
}
function patchChildren(parentDom, lastChildren, nextChildren, context, isSvg) {
    // @TODO: is a better way to compatible with react-router?
    // if (lastChildren === nextChildren) {
    //   return
    // }
    var lastChildrenIsArray = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(lastChildren);
    var nextChildrenIsArray = Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(nextChildren);
    if (lastChildrenIsArray && nextChildrenIsArray) {
        patchArrayChildren(parentDom, lastChildren, nextChildren, context, isSvg);
    }
    else if (!lastChildrenIsArray && !nextChildrenIsArray) {
        patch(lastChildren, nextChildren, parentDom, context, isSvg);
    }
    else if (lastChildrenIsArray && !nextChildrenIsArray) {
        patchArrayChildren(parentDom, lastChildren, [nextChildren], context, isSvg);
    }
    else if (!lastChildrenIsArray && nextChildrenIsArray) {
        patchArrayChildren(parentDom, [lastChildren], nextChildren, context, isSvg);
    }
}
function patchNonKeyedChildren(parentDom, lastChildren, nextChildren, context, isSvg, lastLength, nextLength) {
    var minLength = Math.min(lastLength, nextLength);
    var i = 0;
    while (i < minLength) {
        patch(lastChildren[i], nextChildren[i], parentDom, context, isSvg);
        i++;
    }
    if (lastLength < nextLength) {
        for (i = minLength; i < nextLength; i++) {
            if (parentDom !== null) {
                var refVnode = lastChildren[i - 1];
                Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["mountElement"])(Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(nextChildren[i], isSvg, context), parentDom, Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isValidElement"])(refVnode) && refVnode.dom != null
                    ? refVnode.dom.nextSibling
                    : null);
            }
        }
    }
    else if (lastLength > nextLength) {
        for (i = minLength; i < lastLength; i++) {
            Object(_unmount__WEBPACK_IMPORTED_MODULE_3__["unmount"])(lastChildren[i], parentDom);
        }
    }
}
/**
 *
 * Virtual DOM patching algorithm based on ivi by
 * Boris Kaul (@localvoid)
 * Licensed under the MIT License
 * https://github.com/ivijs/ivi/blob/master/LICENSE
 *
 */
function patchKeyedChildren(a, b, dom, context, isSvg, aLength, bLength) {
    var aEnd = aLength - 1;
    var bEnd = bLength - 1;
    var aStart = 0;
    var bStart = 0;
    var i;
    var j;
    var aNode;
    var bNode;
    var nextNode;
    var nextPos;
    var node;
    var aStartNode = a[aStart];
    var bStartNode = b[bStart];
    var aEndNode = a[aEnd];
    var bEndNode = b[bEnd];
    // Step 1
    // tslint:disable-next-line
    outer: {
        // Sync nodes with the same key at the beginning.
        while (aStartNode.key === bStartNode.key) {
            patch(aStartNode, bStartNode, dom, context, isSvg);
            aStart++;
            bStart++;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aStartNode = a[aStart];
            bStartNode = b[bStart];
        }
        // Sync nodes with the same key at the end.
        while (aEndNode.key === bEndNode.key) {
            patch(aEndNode, bEndNode, dom, context, isSvg);
            aEnd--;
            bEnd--;
            if (aStart > aEnd || bStart > bEnd) {
                break outer;
            }
            aEndNode = a[aEnd];
            bEndNode = b[bEnd];
        }
    }
    if (aStart > aEnd) {
        if (bStart <= bEnd) {
            nextPos = bEnd + 1;
            nextNode = nextPos < bLength ? b[nextPos].dom : null;
            while (bStart <= bEnd) {
                node = b[bStart];
                bStart++;
                attachNewNode(dom, Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(node, isSvg, context), nextNode);
            }
        }
    }
    else if (bStart > bEnd) {
        while (aStart <= aEnd) {
            Object(_unmount__WEBPACK_IMPORTED_MODULE_3__["unmount"])(a[aStart++], dom);
        }
    }
    else {
        var aLeft = aEnd - aStart + 1;
        var bLeft = bEnd - bStart + 1;
        var sources = new Array(bLeft);
        // Mark all nodes as inserted.
        for (i = 0; i < bLeft; i++) {
            sources[i] = -1;
        }
        var moved = false;
        var pos = 0;
        var patched = 0;
        // When sizes are small, just loop them through
        if (bLeft <= 4 || aLeft * bLeft <= 16) {
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLeft) {
                    for (j = bStart; j <= bEnd; j++) {
                        bNode = b[j];
                        if (aNode.key === bNode.key) {
                            sources[j - bStart] = i;
                            if (pos > j) {
                                moved = true;
                            }
                            else {
                                pos = j;
                            }
                            patch(aNode, bNode, dom, context, isSvg);
                            patched++;
                            a[i] = null;
                            break;
                        }
                    }
                }
            }
        }
        else {
            var keyIndex = new _nerv_utils__WEBPACK_IMPORTED_MODULE_0__["MapClass"]();
            for (i = bStart; i <= bEnd; i++) {
                keyIndex.set(b[i].key, i);
            }
            for (i = aStart; i <= aEnd; i++) {
                aNode = a[i];
                if (patched < bLeft) {
                    j = keyIndex.get(aNode.key);
                    if (j !== undefined) {
                        bNode = b[j];
                        sources[j - bStart] = i;
                        if (pos > j) {
                            moved = true;
                        }
                        else {
                            pos = j;
                        }
                        patch(aNode, bNode, dom, context, isSvg);
                        patched++;
                        a[i] = null;
                    }
                }
            }
        }
        if (aLeft === aLength && patched === 0) {
            Object(_unmount__WEBPACK_IMPORTED_MODULE_3__["unmountChildren"])(a);
            dom.textContent = '';
            while (bStart < bLeft) {
                node = b[bStart];
                bStart++;
                attachNewNode(dom, Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(node, isSvg, context), null);
            }
        }
        else {
            i = aLeft - patched;
            while (i > 0) {
                aNode = a[aStart++];
                if (aNode !== null) {
                    Object(_unmount__WEBPACK_IMPORTED_MODULE_3__["unmount"])(aNode, dom);
                    i--;
                }
            }
            if (moved) {
                var seq = lis(sources);
                j = seq.length - 1;
                for (i = bLeft - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        attachNewNode(dom, Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(node, isSvg, context), nextPos < bLength ? b[nextPos].dom : null);
                    }
                    else if (j < 0 || i !== seq[j]) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        attachNewNode(dom, node.dom, nextPos < bLength ? b[nextPos].dom : null);
                    }
                    else {
                        j--;
                    }
                }
            }
            else if (patched !== bLeft) {
                for (i = bLeft - 1; i >= 0; i--) {
                    if (sources[i] === -1) {
                        pos = i + bStart;
                        node = b[pos];
                        nextPos = pos + 1;
                        attachNewNode(dom, Object(_create_element__WEBPACK_IMPORTED_MODULE_2__["default"])(node, isSvg, context), nextPos < bLength ? b[nextPos].dom : null);
                    }
                }
            }
        }
    }
}
function attachNewNode(parentDom, newNode, nextNode) {
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(nextNode)) {
        parentDom.appendChild(newNode);
    }
    else {
        parentDom.insertBefore(newNode, nextNode);
    }
}
/**
 * Slightly modified Longest Increased Subsequence algorithm, it ignores items that have -1 value, they're representing
 * new items.
 *
 * http://en.wikipedia.org/wiki/Longest_increasing_subsequence
 *
 * @param a Array of numbers.
 * @returns Longest increasing subsequence.
 */
function lis(a) {
    var p = a.slice();
    var result = [];
    result.push(0);
    var u;
    var v;
    for (var i = 0, il = a.length; i < il; ++i) {
        if (a[i] === -1) {
            continue;
        }
        var j = result[result.length - 1];
        if (a[j] < a[i]) {
            p[i] = j;
            result.push(i);
            continue;
        }
        u = 0;
        v = result.length - 1;
        while (u < v) {
            var c = ((u + v) / 2) | 0;
            if (a[result[c]] < a[i]) {
                u = c + 1;
            }
            else {
                v = c;
            }
        }
        if (a[i] < a[result[u]]) {
            if (u > 0) {
                p[i] = result[u - 1];
            }
            result[u] = i;
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}
function isKeyed(lastChildren, nextChildren) {
    return (nextChildren.length > 0
        && !Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(nextChildren[0])
        && !Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(nextChildren[0].key)
        && lastChildren.length > 0
        && !Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(lastChildren[0])
        && !Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(lastChildren[0].key));
}
function isSameVNode(a, b) {
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isInvalid"])(a) || Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isInvalid"])(b) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(a) || Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isArray"])(b)) {
        return false;
    }
    return a.type === b.type && a.vtype === b.vtype && a.key === b.key;
}
function patchVText(lastVNode, nextVNode) {
    var dom = lastVNode.dom;
    if (dom === null) {
        return;
    }
    var nextText = nextVNode.text;
    nextVNode.dom = dom;
    if (lastVNode.text !== nextText) {
        dom.nodeValue = nextText;
    }
    return dom;
}
var skipProps = {
    children: 1,
    key: 1,
    ref: 1,
    owner: 1,
    /* 编译小程序，生成的prop */
    __owner: 1,
    __page: 1,
};
var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
function setStyle(domStyle, style, value) {
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(value) || (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isNumber"])(value) && isNaN(value))) {
        domStyle[style] = '';
        return;
    }
    if (style === 'float') {
        domStyle.cssFloat = value;
        domStyle.styleFloat = value;
        return;
    }
    domStyle[style] = !Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isNumber"])(value) || IS_NON_DIMENSIONAL.test(style) ? value : value + "px";
}
function patchEvent(eventName, lastEvent, nextEvent, domNode) {
    if (lastEvent !== nextEvent) {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(lastEvent)) {
            Object(_event__WEBPACK_IMPORTED_MODULE_5__["detachEvent"])(domNode, eventName, lastEvent);
        }
        Object(_event__WEBPACK_IMPORTED_MODULE_5__["attachEvent"])(domNode, eventName, nextEvent);
    }
}
var BASE_DEVICE_WIDTH = 750;
var isIOS = navigator.userAgent.match('iPhone');
var deviceWidth = window.screen.width || 375;
var deviceDPR = window.devicePixelRatio || 2;
var eps = 1e-4;
function rpx2px(number) {
    if (number === 0) {
        return 0;
    }
    number = number / BASE_DEVICE_WIDTH * deviceWidth;
    number = Math.floor(number + eps);
    if (number === 0) {
        if (deviceDPR === 1 || !isIOS) {
            return 1;
        }
        else {
            return 0.5;
        }
    }
    return number;
}
function transformRpx(str) {
    if (typeof str !== 'string') {
        return str;
    }
    var state = 0;
    var res = '';
    var number = '';
    for (var i = 0, l = str.length; i < l; i++) {
        var char = str[i];
        if (/[\d.]/.test(char) && i < l - 1 && state !== 2) {
            state = 3;
            number += char;
            continue;
        }
        else if (state === 1) {
            if (char === '\n' || char === '\r' || char === ' ' && res.slice(-1) === ' ') {
                continue;
            }
            if (char === '(' && res.endsWith('url')) {
                state = 2;
            }
            if (char === ';') {
                state = 0;
            }
            res += char;
        }
        else if (state === 2) {
            if (char === ')') {
                state = 1;
            }
            res += char;
        }
        else if (state === 3) {
            if (!/[\d.]/.test(char)) {
                var safeNum = Number(number);
                if (str.slice(i, i + 4).match(/rpx([\s;),}]|$)/) && !isNaN(safeNum)) {
                    res += rpx2px(safeNum) + "px";
                    i += 2;
                }
                else {
                    res += number;
                    res += char;
                }
                state = 1;
                number = '';
                continue;
            }
            number += char;
            if (i === l - 1) {
                // 结束了，number还没处理
                res += number;
            }
        }
        else {
            if (char === ':') {
                state = 1;
            }
            res += char;
        }
    }
    return res;
}
function patchStyle(lastAttrValue, nextAttrValue, dom) {
    var domStyle = dom.style;
    var style;
    var value;
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(nextAttrValue)) {
        domStyle.cssText = transformRpx(nextAttrValue);
        return;
    }
    if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(lastAttrValue) && !Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(lastAttrValue)) {
        for (style in nextAttrValue) {
            value = nextAttrValue[style];
            if (value !== lastAttrValue[style]) {
                setStyle(domStyle, style, value);
            }
        }
        for (style in lastAttrValue) {
            if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(nextAttrValue[style])) {
                domStyle[style] = '';
            }
        }
    }
    else {
        for (style in nextAttrValue) {
            value = nextAttrValue[style];
            setStyle(domStyle, style, value);
        }
    }
}
function patchProp(domNode, prop, lastValue, nextValue, lastVnode, isSvg) {
    // fix the value update for textarea/input
    if (lastValue !== nextValue || prop === 'value') {
        if (prop === 'className') {
            prop = 'class';
        }
        if (skipProps[prop] === 1) {
        }
        else if (prop === 'class' && !isSvg) {
            domNode.className = nextValue;
        }
        else if (prop === 'dangerouslySetInnerHTML') {
            var lastHtml = lastValue && lastValue.__html;
            var nextHtml = nextValue && nextValue.__html;
            if (lastHtml !== nextHtml) {
                if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(nextHtml)) {
                    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isValidElement"])(lastVnode)
                        && lastVnode.children !== _nerv_shared__WEBPACK_IMPORTED_MODULE_1__["EMPTY_CHILDREN"]) {
                        Object(_unmount__WEBPACK_IMPORTED_MODULE_3__["unmountChildren"])(lastVnode.children);
                        lastVnode.children = [];
                    }
                    domNode.innerHTML = nextHtml;
                }
            }
        }
        else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isAttrAnEvent"])(prop)) {
            patchEvent(prop, lastValue, nextValue, domNode);
        }
        else if (prop === 'style') {
            patchStyle(lastValue, nextValue, domNode);
        }
        else if (prop !== 'list'
            && prop !== 'type'
            && !isSvg
            && prop in domNode) {
            setProperty(domNode, prop, nextValue == null ? '' : nextValue);
            if (nextValue == null || nextValue === false) {
                domNode.removeAttribute(prop);
            }
        }
        else if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(nextValue) || nextValue === false) {
            domNode.removeAttribute(prop);
        }
        else {
            var namespace = _svg_property_config__WEBPACK_IMPORTED_MODULE_6__["default"].DOMAttributeNamespaces[prop];
            if (isSvg && namespace) {
                if (nextValue) {
                    domNode.setAttributeNS(namespace, prop, nextValue);
                }
                else {
                    var colonPosition = prop.indexOf(':');
                    var localName = colonPosition > -1 ? prop.substr(colonPosition + 1) : prop;
                    domNode.removeAttributeNS(namespace, localName);
                }
            }
            else {
                if (!Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(nextValue)) {
                    domNode.setAttribute(prop, nextValue);
                }
                // WARNING: Non-event attributes with function values:
                // https://reactjs.org/blog/2017/09/08/dom-attributes-in-react-16.html#changes-in-detail
            }
        }
    }
}
function setProperty(node, name, value) {
    try {
        node[name] = value;
    }
    catch (e) { }
}
function patchProps(domNode, nextProps, previousProps, lastVnode, isSvg) {
    for (var propName in previousProps) {
        var value = previousProps[propName];
        if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(nextProps[propName]) && !Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isNullOrUndef"])(value)) {
            if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isAttrAnEvent"])(propName)) {
                Object(_event__WEBPACK_IMPORTED_MODULE_5__["detachEvent"])(domNode, propName, value);
            }
            else if (propName === 'dangerouslySetInnerHTML') {
                domNode.textContent = '';
            }
            else if (propName === 'className') {
                domNode.removeAttribute('class');
            }
            else {
                domNode.removeAttribute(propName);
            }
        }
    }
    for (var propName in nextProps) {
        patchProp(domNode, propName, previousProps[propName], nextProps[propName], lastVnode, isSvg);
    }
}
/* harmony default export */ __webpack_exports__["default"] = (patch);


/***/ }),

/***/ "./src/nerv/vdom/ref.ts":
/*!******************************!*\
  !*** ./src/nerv/vdom/ref.ts ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _lifecycle__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lifecycle */ "./src/nerv/lifecycle.ts");



/* harmony default export */ __webpack_exports__["default"] = ({
    update: function (lastVnode, nextVnode, domNode) {
        var prevRef = lastVnode != null && lastVnode.ref;
        var nextRef = nextVnode != null && nextVnode.ref;
        if (prevRef !== nextRef) {
            this.detach(lastVnode, prevRef, lastVnode.dom);
            this.attach(nextVnode, nextRef, domNode);
        }
    },
    attach: function (vnode, ref, domNode) {
        var node = Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isComposite"])(vnode) ? vnode.component : domNode;
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(ref)) {
            var componentForCatcher = Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isComposite"])(vnode) ? vnode.component : vnode;
            Object(_lifecycle__WEBPACK_IMPORTED_MODULE_2__["errorCatcher"])(function () {
                ref(node);
            }, componentForCatcher);
        }
        else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(ref)) {
            var inst = vnode._owner;
            if (inst && Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(inst.render)) {
                inst.refs[ref] = node;
            }
        }
        else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isObject"])(ref)) {
            ref.current = node;
        }
    },
    detach: function (vnode, ref, domNode) {
        var node = Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isComposite"])(vnode) ? vnode.component : domNode;
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(ref)) {
            var componentForCatcher = Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_1__["isComposite"])(vnode) ? vnode.component : vnode;
            Object(_lifecycle__WEBPACK_IMPORTED_MODULE_2__["errorCatcher"])(function () {
                ref(null);
            }, componentForCatcher);
        }
        else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isString"])(ref)) {
            var inst = vnode._owner;
            if (inst.refs[ref] === node && Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isFunction"])(inst.render)) {
                delete inst.refs[ref];
            }
        }
        else if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_0__["isObject"])(ref)) {
            ref.current = null;
        }
    },
});


/***/ }),

/***/ "./src/nerv/vdom/svg-property-config.ts":
/*!**********************************************!*\
  !*** ./src/nerv/vdom/svg-property-config.ts ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var NS = {
    ev: 'http://www.w3.org/2001/xml-events',
    xlink: 'http://www.w3.org/1999/xlink',
    xml: 'http://www.w3.org/XML/1998/namespace'
};
var ATTRS = {
    accentHeight: 'accent-height',
    accumulate: 0,
    additive: 0,
    alignmentBaseline: 'alignment-baseline',
    allowReorder: 'allowReorder',
    alphabetic: 0,
    amplitude: 0,
    arabicForm: 'arabic-form',
    ascent: 0,
    attributeName: 'attributeName',
    attributeType: 'attributeType',
    autoReverse: 'autoReverse',
    azimuth: 0,
    baseFrequency: 'baseFrequency',
    baseProfile: 'baseProfile',
    baselineShift: 'baseline-shift',
    bbox: 0,
    begin: 0,
    bias: 0,
    by: 0,
    calcMode: 'calcMode',
    capHeight: 'cap-height',
    clip: 0,
    clipPath: 'clip-path',
    clipRule: 'clip-rule',
    clipPathUnits: 'clipPathUnits',
    colorInterpolation: 'color-interpolation',
    colorInterpolationFilters: 'color-interpolation-filters',
    colorProfile: 'color-profile',
    colorRendering: 'color-rendering',
    contentScriptType: 'contentScriptType',
    contentStyleType: 'contentStyleType',
    cursor: 0,
    cx: 0,
    cy: 0,
    d: 0,
    decelerate: 0,
    descent: 0,
    diffuseConstant: 'diffuseConstant',
    direction: 0,
    display: 0,
    divisor: 0,
    dominantBaseline: 'dominant-baseline',
    dur: 0,
    dx: 0,
    dy: 0,
    edgeMode: 'edgeMode',
    elevation: 0,
    enableBackground: 'enable-background',
    end: 0,
    evEvent: 'ev:event',
    exponent: 0,
    externalResourcesRequired: 'externalResourcesRequired',
    fill: 0,
    fillOpacity: 'fill-opacity',
    fillRule: 'fill-rule',
    filter: 0,
    filterRes: 'filterRes',
    filterUnits: 'filterUnits',
    floodColor: 'flood-color',
    floodOpacity: 'flood-opacity',
    focusable: 0,
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontSizeAdjust: 'font-size-adjust',
    fontStretch: 'font-stretch',
    fontStyle: 'font-style',
    fontVariant: 'font-variant',
    fontWeight: 'font-weight',
    format: 0,
    from: 0,
    fx: 0,
    fy: 0,
    g1: 0,
    g2: 0,
    glyphName: 'glyph-name',
    glyphOrientationHorizontal: 'glyph-orientation-horizontal',
    glyphOrientationVertical: 'glyph-orientation-vertical',
    glyphRef: 'glyphRef',
    gradientTransform: 'gradientTransform',
    gradientUnits: 'gradientUnits',
    hanging: 0,
    horizAdvX: 'horiz-adv-x',
    horizOriginX: 'horiz-origin-x',
    ideographic: 0,
    imageRendering: 'image-rendering',
    in: 0,
    in2: 0,
    intercept: 0,
    k: 0,
    k1: 0,
    k2: 0,
    k3: 0,
    k4: 0,
    kernelMatrix: 'kernelMatrix',
    kernelUnitLength: 'kernelUnitLength',
    kerning: 0,
    keyPoints: 'keyPoints',
    keySplines: 'keySplines',
    keyTimes: 'keyTimes',
    lengthAdjust: 'lengthAdjust',
    letterSpacing: 'letter-spacing',
    lightingColor: 'lighting-color',
    limitingConeAngle: 'limitingConeAngle',
    local: 0,
    markerEnd: 'marker-end',
    markerMid: 'marker-mid',
    markerStart: 'marker-start',
    markerHeight: 'markerHeight',
    markerUnits: 'markerUnits',
    markerWidth: 'markerWidth',
    mask: 0,
    maskContentUnits: 'maskContentUnits',
    maskUnits: 'maskUnits',
    mathematical: 0,
    mode: 0,
    numOctaves: 'numOctaves',
    offset: 0,
    opacity: 0,
    operator: 0,
    order: 0,
    orient: 0,
    orientation: 0,
    origin: 0,
    overflow: 0,
    overlinePosition: 'overline-position',
    overlineThickness: 'overline-thickness',
    paintOrder: 'paint-order',
    panose1: 'panose-1',
    pathLength: 'pathLength',
    patternContentUnits: 'patternContentUnits',
    patternTransform: 'patternTransform',
    patternUnits: 'patternUnits',
    pointerEvents: 'pointer-events',
    points: 0,
    pointsAtX: 'pointsAtX',
    pointsAtY: 'pointsAtY',
    pointsAtZ: 'pointsAtZ',
    preserveAlpha: 'preserveAlpha',
    preserveAspectRatio: 'preserveAspectRatio',
    primitiveUnits: 'primitiveUnits',
    r: 0,
    radius: 0,
    refX: 'refX',
    refY: 'refY',
    renderingIntent: 'rendering-intent',
    repeatCount: 'repeatCount',
    repeatDur: 'repeatDur',
    requiredExtensions: 'requiredExtensions',
    requiredFeatures: 'requiredFeatures',
    restart: 0,
    result: 0,
    rotate: 0,
    rx: 0,
    ry: 0,
    scale: 0,
    seed: 0,
    shapeRendering: 'shape-rendering',
    slope: 0,
    spacing: 0,
    specularConstant: 'specularConstant',
    specularExponent: 'specularExponent',
    speed: 0,
    spreadMethod: 'spreadMethod',
    startOffset: 'startOffset',
    stdDeviation: 'stdDeviation',
    stemh: 0,
    stemv: 0,
    stitchTiles: 'stitchTiles',
    stopColor: 'stop-color',
    stopOpacity: 'stop-opacity',
    strikethroughPosition: 'strikethrough-position',
    strikethroughThickness: 'strikethrough-thickness',
    string: 0,
    stroke: 0,
    strokeDasharray: 'stroke-dasharray',
    strokeDashoffset: 'stroke-dashoffset',
    strokeLinecap: 'stroke-linecap',
    strokeLinejoin: 'stroke-linejoin',
    strokeMiterlimit: 'stroke-miterlimit',
    strokeOpacity: 'stroke-opacity',
    strokeWidth: 'stroke-width',
    surfaceScale: 'surfaceScale',
    systemLanguage: 'systemLanguage',
    tableValues: 'tableValues',
    targetX: 'targetX',
    targetY: 'targetY',
    textAnchor: 'text-anchor',
    textDecoration: 'text-decoration',
    textRendering: 'text-rendering',
    textLength: 'textLength',
    to: 0,
    transform: 0,
    u1: 0,
    u2: 0,
    underlinePosition: 'underline-position',
    underlineThickness: 'underline-thickness',
    unicode: 0,
    unicodeBidi: 'unicode-bidi',
    unicodeRange: 'unicode-range',
    unitsPerEm: 'units-per-em',
    vAlphabetic: 'v-alphabetic',
    vHanging: 'v-hanging',
    vIdeographic: 'v-ideographic',
    vMathematical: 'v-mathematical',
    values: 0,
    vectorEffect: 'vector-effect',
    version: 0,
    vertAdvY: 'vert-adv-y',
    vertOriginX: 'vert-origin-x',
    vertOriginY: 'vert-origin-y',
    viewBox: 'viewBox',
    viewTarget: 'viewTarget',
    visibility: 0,
    widths: 0,
    wordSpacing: 'word-spacing',
    writingMode: 'writing-mode',
    x: 0,
    xHeight: 'x-height',
    x1: 0,
    x2: 0,
    xChannelSelector: 'xChannelSelector',
    xlinkActuate: 'xlink:actuate',
    xlinkArcrole: 'xlink:arcrole',
    xlinkHref: 'xlink:href',
    xlinkRole: 'xlink:role',
    xlinkShow: 'xlink:show',
    xlinkTitle: 'xlink:title',
    xlinkType: 'xlink:type',
    xmlBase: 'xml:base',
    xmlId: 'xml:id',
    xmlns: 0,
    xmlnsXlink: 'xmlns:xlink',
    xmlLang: 'xml:lang',
    xmlSpace: 'xml:space',
    y: 0,
    y1: 0,
    y2: 0,
    yChannelSelector: 'yChannelSelector',
    z: 0,
    zoomAndPan: 'zoomAndPan'
};
var SVGPropertyConfig = {
    Properties: {},
    DOMAttributeNamespaces: {
        'ev:event': NS.ev,
        'xlink:actuate': NS.xlink,
        'xlink:arcrole': NS.xlink,
        'xlink:href': NS.xlink,
        'xlink:role': NS.xlink,
        'xlink:show': NS.xlink,
        'xlink:title': NS.xlink,
        'xlink:type': NS.xlink,
        'xml:base': NS.xml,
        'xml:id': NS.xml,
        'xml:lang': NS.xml,
        'xml:space': NS.xml
    },
    DOMAttributeNames: {}
};
Object.keys(ATTRS).forEach(function (key) {
    SVGPropertyConfig.Properties[key] = 0;
    if (ATTRS[key]) {
        SVGPropertyConfig.DOMAttributeNames[key] = ATTRS[key];
    }
});
/* harmony default export */ __webpack_exports__["default"] = (SVGPropertyConfig);


/***/ }),

/***/ "./src/nerv/vdom/unmount.ts":
/*!**********************************!*\
  !*** ./src/nerv/vdom/unmount.ts ***!
  \**********************************/
/*! exports provided: unmountChildren, unmount */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unmountChildren", function() { return unmountChildren; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unmount", function() { return unmount; });
/* harmony import */ var _nerv_shared__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv/shared */ "./src/nerv/shared/index.ts");
/* harmony import */ var _nerv_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv/utils */ "./src/nerv/utils/index.ts");
/* harmony import */ var _ref__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ref */ "./src/nerv/vdom/ref.ts");
/* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../event */ "./src/nerv/event.ts");




function unmountChildren(children, parentDom) {
    if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isArray"])(children)) {
        for (var i = 0, len = children.length; i < len; i++) {
            unmount(children[i], parentDom);
        }
    }
    else {
        unmount(children, parentDom);
    }
}
function unmount(vnode, parentDom) {
    if (Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isInvalid"])(vnode)) {
        return;
    }
    var vtype = vnode.vtype;
    // Bitwise operators for better performance
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators
    var dom = vnode.dom;
    if ((vtype & (4 /* Composite */)) > 0) {
        vnode.destroy();
    }
    else if ((vtype & 2 /* Node */) > 0) {
        var props = vnode.props, children = vnode.children, ref = vnode.ref;
        unmountChildren(children);
        for (var propName in props) {
            if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isAttrAnEvent"])(propName)) {
                Object(_event__WEBPACK_IMPORTED_MODULE_3__["detachEvent"])(dom, propName, props[propName]);
            }
        }
        if (ref !== null) {
            _ref__WEBPACK_IMPORTED_MODULE_2__["default"].detach(vnode, ref, dom);
        }
    }
    else if (vtype & 32 /* Portal */) {
        unmountChildren(vnode.children, vnode.type);
    }
    if (!Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isNullOrUndef"])(parentDom) && !Object(_nerv_shared__WEBPACK_IMPORTED_MODULE_0__["isNullOrUndef"])(dom)) {
        if (Object(_nerv_utils__WEBPACK_IMPORTED_MODULE_1__["isArray"])(dom)) {
            for (var i = 0; i < dom.length; i++) {
                parentDom.removeChild(dom[i]);
            }
        }
        else {
            parentDom.removeChild(dom);
        }
    }
    // vnode.dom = null
}


/***/ }),

/***/ "./src/nerv/version.ts":
/*!*****************************!*\
  !*** ./src/nerv/version.ts ***!
  \*****************************/
/*! exports provided: version */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "version", function() { return version; });
// some library check React version
// see: https://github.com/NervJS/nerv/issues/46
var version = '15.4.2';


/***/ }),

/***/ "./src/text/Text.js":
/*!**************************!*\
  !*** ./src/text/Text.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


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

/* harmony default export */ __webpack_exports__["default"] = (Object(_nerv__WEBPACK_IMPORTED_MODULE_2__["createNervClass"])({
  displayName: 'Text',
  mixins: [],
  render: function render() {
    var _this$props = this.props,
        children = _this$props.children,
        style = _this$props.style,
        selectable = _this$props.selectable,
        id = _this$props.id,
        space = _this$props.space,
        decode = _this$props.decode,
        $mp = _this$props.$mp,
        rest = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(_this$props, ["children", "style", "selectable", "id", "space", "decode", "$mp"]);

    var _this$props2 = this.props,
        _this$props2$classNam = _this$props2.className,
        className = _this$props2$classNam === void 0 ? '' : _this$props2$classNam,
        numberOfLines = _this$props2.numberOfLines;

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

    var nodes = [];
    _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].Children.forEach(children, function (c) {
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
    return _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement('span', _objectSpread(_objectSpread({
      className: className,
      style: retStyle,
      id: id
    }, $mp.getAriaProps()), rest), nodes);
  }
}));

/***/ }),

/***/ "./src/text/index.js":
/*!***************************!*\
  !*** ./src/text/index.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../framework */ "./src/framework/index.js");
/* harmony import */ var _Text__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Text */ "./src/text/Text.js");


/* harmony default export */ __webpack_exports__["default"] = (Object(_framework__WEBPACK_IMPORTED_MODULE_0__["createComponent"])({
  name: 'text'
})(_Text__WEBPACK_IMPORTED_MODULE_1__["default"]));

/***/ }),

/***/ "./src/utils/EventEmitter.js":
/*!***********************************!*\
  !*** ./src/utils/EventEmitter.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return EventEmitter; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _gerror__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gerror */ "./src/utils/gerror.js");




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }



var EventEmitter = /*#__PURE__*/function () {
  function EventEmitter() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, EventEmitter);

    this.allListeners = {};
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(EventEmitter, [{
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
              Object(_gerror__WEBPACK_IMPORTED_MODULE_3__["default"])(e);
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

/***/ "./src/utils/TestMixin.js":
/*!********************************!*\
  !*** ./src/utils/TestMixin.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.js");

var id = 0;
var isTest;
var empty = {};

function isTesting() {
  if (isTest !== undefined) {
    return isTest;
  }

  isTest = Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])().runStage === 'test';
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

/***/ "./src/utils/addEvents.js":
/*!********************************!*\
  !*** ./src/utils/addEvents.js ***!
  \********************************/
/*! exports provided: default, addEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return addEvents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addEvent", function() { return addEvent; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");

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
function addEvent(target, name, fn) {
  target.addEventListener(name, fn);
  return {
    remove: function remove() {
      target.removeEventListener(name, fn);
    }
  };
}

/***/ }),

/***/ "./src/utils/callBridge.js":
/*!*********************************!*\
  !*** ./src/utils/callBridge.js ***!
  \*********************************/
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

/***/ "./src/utils/callInternalAPI.js":
/*!**************************************!*\
  !*** ./src/utils/callInternalAPI.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return callInternalAPI; });
/* harmony import */ var _framework_startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/startupParams */ "./src/framework/startupParams/index.js");
/* harmony import */ var _callBridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./callBridge */ "./src/utils/callBridge.js");


var ddOrAp =  true || false;
function callInternalAPI(method) {
  var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var callback = arguments.length > 2 ? arguments[2] : undefined;

  if (ddOrAp && !Object(_framework_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])().isInternalApp) {
    var internalParams = {
      method: method,
      param: param
    };

    if ('viewId' in param) {
      internalParams.viewId = param.viewId;
    }

    Object(_callBridge__WEBPACK_IMPORTED_MODULE_1__["default"])('internalAPI', internalParams, callback);
  } else {
    Object(_callBridge__WEBPACK_IMPORTED_MODULE_1__["default"])(method, param, callback);
  }
}

/***/ }),

/***/ "./src/utils/consts.js":
/*!*****************************!*\
  !*** ./src/utils/consts.js ***!
  \*****************************/
/*! exports provided: PendingKeyType, PendingKeyId, PendingKeyData, PendingKeyOp, PendingValuePage, PendingValueComponent, OpSet, OpSplice, PayloadKeyMountedComponents, PayloadKeyUnmountedComponents, ComponentKeyId, ComponentKeyIs, ComponentKeyDiffProps, ComponentKeyOwnerId, DiffKeyUpdated, DiffKeyDeleted, ComponentKeyName, ComponentPropsId */
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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ComponentPropsId", function() { return ComponentPropsId; });
var PendingKeyType = 'PendingKeyType';
var PendingKeyId = 'PendingKeyId';
var PendingKeyData = 'PendingKeyData';
var PendingKeyOp = 'PendingKeyOp';
var PendingValuePage = 1;
var PendingValueComponent = 2;
var OpSet = 1;
var OpSplice = 2;
var PayloadKeyMountedComponents = 'PayloadKeyMountedComponents';
var PayloadKeyUnmountedComponents = 'PayloadKeyUnmountedComponents';
var ComponentKeyId = 'ComponentKeyId';
var ComponentKeyIs = 'ComponentKeyIs';
var ComponentKeyDiffProps = 'ComponentKeyDiffProps';
var ComponentKeyOwnerId = 'ComponentKeyOwnerId';
var DiffKeyUpdated = 'DiffKeyUpdated';
var DiffKeyDeleted = 'DiffKeyDeleted';
var ComponentKeyName = 'ComponentKeyName';
var ComponentPropsId = 'ComponentPropsId';

/***/ }),

/***/ "./src/utils/debounce.js":
/*!*******************************!*\
  !*** ./src/utils/debounce.js ***!
  \*******************************/
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

/***/ "./src/utils/escapeLogParams.js":
/*!**************************************!*\
  !*** ./src/utils/escapeLogParams.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return escapeLogParams; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");

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

/***/ "./src/utils/eventReg.js":
/*!*******************************!*\
  !*** ./src/utils/eventReg.js ***!
  \*******************************/
/*! exports provided: getPropsEventName, getPropsEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPropsEventName", function() { return getPropsEventName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPropsEvent", function() { return getPropsEvent; });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./src/utils/types.js");

function getPropsEventName(name) {
  var isCatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var capture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var str = '';
  str += isCatch ? 'catch' : 'bind';

  if (name) {
    str += name;
  }

  if (capture) {
    str = "capture-".concat(str);
  }

  return str;
}
function getPropsEvent(name) {
  var isCatch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var capture = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var str = '';
  str += isCatch ? 'catch' : 'bind';

  if (name) {
    str += name;
  }

  if (capture) {
    str = "capture-".concat(str);
  }

  var handler = this.props[str];

  if (typeof handler === 'function') {
    return handler;
  }

  return _types__WEBPACK_IMPORTED_MODULE_0__["noop"];
}

/***/ }),

/***/ "./src/utils/focusInput.js":
/*!*********************************!*\
  !*** ./src/utils/focusInput.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return focusInput; });
/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./system */ "./src/utils/system.js");
/* harmony import */ var _callInternalAPI__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./callInternalAPI */ "./src/utils/callInternalAPI.js");


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

/***/ "./src/utils/gerror.js":
/*!*****************************!*\
  !*** ./src/utils/gerror.js ***!
  \*****************************/
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

/***/ "./src/utils/getData.js":
/*!******************************!*\
  !*** ./src/utils/getData.js ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _stringToPath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringToPath */ "./src/utils/stringToPath.js");


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

function getData(object, path) {
  if (object) {
    path = Object(_stringToPath__WEBPACK_IMPORTED_MODULE_1__["default"])(path);
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

/* harmony default export */ __webpack_exports__["default"] = (function (data, dataConfig) {
  if (!data) {
    return undefined;
  }

  var ret = {};
  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(dataConfig).forEach(function (k) {
    ret[k] = getData(data, dataConfig[k]);
  });
  return ret;
});

/***/ }),

/***/ "./src/utils/isDebug.js":
/*!******************************!*\
  !*** ./src/utils/isDebug.js ***!
  \******************************/
/*! exports provided: isDebug, isDebugFramework, isDebugSupported */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDebug", function() { return isDebug; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDebugFramework", function() { return isDebugFramework; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDebugSupported", function() { return isDebugSupported; });
/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startupParams */ "./src/utils/startupParams/index.js");

var debugMatchCache = {};
function isDebug() {
  return !!Object(_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])().debug;
}
function isDebugFramework() {
  return isDebugSupported('framework');
}
function isDebugSupported(type) {
  var isMatch = debugMatchCache[type];

  if (typeof isMatch === 'undefined') {
    var _getStartupParams = Object(_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])();

    var debug = _getStartupParams.debug;

    if (debug) {
      isMatch = !!debug.match(new RegExp("\\b".concat(type, "\\b")));
      debugMatchCache[type] = isMatch;
    }
  }

  return isMatch;
}

/***/ }),

/***/ "./src/utils/isNodeVisible.js":
/*!************************************!*\
  !*** ./src/utils/isNodeVisible.js ***!
  \************************************/
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

/***/ "./src/utils/log.js":
/*!**************************!*\
  !*** ./src/utils/log.js ***!
  \**************************/
/*! exports provided: default, debug */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return log; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debug", function() { return debug; });
/* harmony import */ var _isDebug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isDebug */ "./src/utils/isDebug.js");


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

/***/ "./src/utils/mergeArray.js":
/*!*********************************!*\
  !*** ./src/utils/mergeArray.js ***!
  \*********************************/
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

/***/ "./src/utils/objectKeys.js":
/*!*********************************!*\
  !*** ./src/utils/objectKeys.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return objectKeys; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);

function objectKeys(obj) {
  if (obj && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(obj) === 'object') {
    return Object.keys(obj);
  }

  return [];
}

/***/ }),

/***/ "./src/utils/reportError.js":
/*!**********************************!*\
  !*** ./src/utils/reportError.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return reportError; });
/* harmony import */ var _callInternalAPI__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./callInternalAPI */ "./src/utils/callInternalAPI.js");
/* harmony import */ var _callBridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./callBridge */ "./src/utils/callBridge.js");
/* harmony import */ var _system__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./system */ "./src/utils/system.js");
/* harmony import */ var _escapeLogParams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./escapeLogParams */ "./src/utils/escapeLogParams.js");




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

/***/ "./src/utils/requestAnimationFrame.js":
/*!********************************************!*\
  !*** ./src/utils/requestAnimationFrame.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
/* harmony default export */ __webpack_exports__["default"] = (window.requestAnimationFrame || (window.requestAnimationFrame = function (callback) {
  typeof callback === 'function' && setTimeout(function () {
    callback();
  }, 17);
}));

/***/ }),

/***/ "./src/utils/rgba2Color.js":
/*!*********************************!*\
  !*** ./src/utils/rgba2Color.js ***!
  \*********************************/
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

/***/ "./src/utils/setData.js":
/*!******************************!*\
  !*** ./src/utils/setData.js ***!
  \******************************/
/*! exports provided: default, spliceData, getOpStr, getOpFn */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return setData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "spliceData", function() { return spliceData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOpStr", function() { return getOpStr; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getOpFn", function() { return getOpFn; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _stringToPath__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringToPath */ "./src/utils/stringToPath.js");
/* harmony import */ var _shallowEqual__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shallowEqual */ "./src/utils/shallowEqual.js");
/* harmony import */ var _consts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./consts */ "./src/utils/consts.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }






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

  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(changedData).forEach(function (pathString) {
    var path = Object(_stringToPath__WEBPACK_IMPORTED_MODULE_2__["default"])(pathString);
    set(ret, ret, path, function (clonedObj, finalPath) {
      clonedObj[finalPath] = changedData[pathString];
      return clonedObj;
    });
  });

  if (Object(_shallowEqual__WEBPACK_IMPORTED_MODULE_3__["default"])(ret, data)) {
    return data;
  }

  return ret;
}
function spliceData(data, changedData) {
  var ret = _objectSpread({}, data);

  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(changedData).forEach(function (pathString) {
    var path = Object(_stringToPath__WEBPACK_IMPORTED_MODULE_2__["default"])(pathString);
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

  if (Object(_shallowEqual__WEBPACK_IMPORTED_MODULE_3__["default"])(ret, data)) {
    return data;
  }

  return ret;
}
function getOpStr(op) {
  return op === setData ? _consts__WEBPACK_IMPORTED_MODULE_4__["OpSet"] : _consts__WEBPACK_IMPORTED_MODULE_4__["OpSplice"];
}
function getOpFn(op) {
  return op === _consts__WEBPACK_IMPORTED_MODULE_4__["OpSet"] ? setData : spliceData;
}

/***/ }),

/***/ "./src/utils/shallowEqual.js":
/*!***********************************!*\
  !*** ./src/utils/shallowEqual.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return shallowEqual; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");


function shallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(objA) !== 'object' || objA === null || _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(objB) !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object(_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(objA);
  var keysB = Object(_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(objB);
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

/***/ "./src/utils/startsWith.js":
/*!*********************************!*\
  !*** ./src/utils/startsWith.js ***!
  \*********************************/
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

/***/ "./src/utils/startupParams/index.js":
/*!******************************************!*\
  !*** ./src/utils/startupParams/index.js ***!
  \******************************************/
/*! exports provided: getStartupParams, setStartupParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return getStartupParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return setStartupParams; });
/* harmony import */ var _startupParamsHolder__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startupParamsHolder */ "./src/utils/startupParams/startupParamsHolder.js");

var g = self;
function getStartupParams() {
  if (g.__mpStartupParams) {
    return g.__mpStartupParams;
  }

  return Object(_startupParamsHolder__WEBPACK_IMPORTED_MODULE_0__["getValue"])() || {};
}
var setStartupParams = _startupParamsHolder__WEBPACK_IMPORTED_MODULE_0__["setValue"];

/***/ }),

/***/ "./src/utils/startupParams/startupParamsHolder.js":
/*!********************************************************!*\
  !*** ./src/utils/startupParams/startupParamsHolder.js ***!
  \********************************************************/
/*! exports provided: setValue, getValue */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setValue", function() { return setValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getValue", function() { return getValue; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../objectKeys */ "./src/utils/objectKeys.js");

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

/***/ "./src/utils/stringToPath.js":
/*!***********************************!*\
  !*** ./src/utils/stringToPath.js ***!
  \***********************************/
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

/***/ "./src/utils/supportsPassive.js":
/*!**************************************!*\
  !*** ./src/utils/supportsPassive.js ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// Test via a getter in the options object to see if the passive property is accessed
var supportsPassive = false;

try {
  var n = null;
  var opts = Object.defineProperty({}, 'passive', {
    get: function get() {
      supportsPassive = true;
    }
  });
  window.addEventListener('testPassive', n, opts);
  window.removeEventListener('testPassive', n, opts);
} catch (e) {}

/* harmony default export */ __webpack_exports__["default"] = (supportsPassive);

/***/ }),

/***/ "./src/utils/system.js":
/*!*****************************!*\
  !*** ./src/utils/system.js ***!
  \*****************************/
/*! exports provided: systemVersion, UCVersion, isAndroid, isIOS, isIDE, SDKVersion, isUC, isNativeComponent, compareVersion, logSystemInfo, compareSystemVersion, compareUCVersion */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "systemVersion", function() { return systemVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UCVersion", function() { return UCVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isAndroid", function() { return isAndroid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIOS", function() { return isIOS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIDE", function() { return isIDE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SDKVersion", function() { return SDKVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUC", function() { return isUC; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNativeComponent", function() { return isNativeComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compareVersion", function() { return compareVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "logSystemInfo", function() { return logSystemInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compareSystemVersion", function() { return compareSystemVersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "compareUCVersion", function() { return compareUCVersion; });
/* harmony import */ var _log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./log */ "./src/utils/log.js");

var ua = navigator.userAgent || navigator.swuserAgent;

var _systemVersion = ua.match(/AlipayClient\/(\d+\.\d+\.\d+)/);

var _UCVersion = ua.match(/UCBS\/(\d+\.\d+)/); // expose all functions for ant fortune app


var systemVersion = _systemVersion && _systemVersion[1] || '100.0.0';
var UCVersion = _UCVersion && _UCVersion[1] || '2.12';
var isAndroid = ua.indexOf('Android') > -1;
var isIOS = !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
var isIDE = ua.indexOf('AlipayIDE') > -1;
var SDKVersion = '0.0.1';
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
  Object(_log__WEBPACK_IMPORTED_MODULE_0__["default"])('version: '.concat(SDKVersion));
}

function compareSystemVersion(targetVersion) {
  return compareVersion(systemVersion, targetVersion);
}

function compareUCVersion(targetVersion) {
  return compareVersion(UCVersion, targetVersion);
}



/***/ }),

/***/ "./src/utils/throttle.js":
/*!*******************************!*\
  !*** ./src/utils/throttle.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return throttle; });
/* harmony import */ var _debounce__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./debounce */ "./src/utils/debounce.js");

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

/***/ "./src/utils/trackTap.js":
/*!*******************************!*\
  !*** ./src/utils/trackTap.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return trackTap; });
/* harmony import */ var _trackerStore__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./trackerStore */ "./src/utils/trackerStore.js");
/* harmony import */ var _startsWith__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./startsWith */ "./src/utils/startsWith.js");
/* harmony import */ var _getData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getData */ "./src/utils/getData.js");
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");




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
        var data = _ref.data,
            action = _ref.action,
            element = _ref.element;

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

/***/ "./src/utils/trackerStore.js":
/*!***********************************!*\
  !*** ./src/utils/trackerStore.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./src/utils/types.js":
/*!****************************!*\
  !*** ./src/utils/types.js ***!
  \****************************/
/*! exports provided: isArray, isObject, noop, getType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isArray", function() { return isArray; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isObject", function() { return isObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "noop", function() { return noop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getType", function() { return getType; });
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}
function isObject(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}
function noop() {
  /* no opration */
}
/**
 * 获取类型名字
 * @param x
 */

function getType(x) {
  return Object.prototype.toString.call(x).slice(8, -1);
}

/***/ }),

/***/ "./src/view/AnimationViewMixin.js":
/*!****************************************!*\
  !*** ./src/view/AnimationViewMixin.js ***!
  \****************************************/
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

/***/ "./src/view/View.js":
/*!**************************!*\
  !*** ./src/view/View.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.js");
/* harmony import */ var _utils_isNodeVisible__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/isNodeVisible */ "./src/utils/isNodeVisible.js");
/* harmony import */ var _utils_throttle__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/throttle */ "./src/utils/throttle.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utils */ "./src/view/utils.js");
/* harmony import */ var _AnimationViewMixin__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./AnimationViewMixin */ "./src/view/AnimationViewMixin.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }









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
  var animation = Object(_utils__WEBPACK_IMPORTED_MODULE_7__["expandAnimation"])(_animation || []);
  var transform = node.style.transform || '';
  animation.forEach(function (a) {
    var p = a[0];
    var value = a[1];

    if (_utils__WEBPACK_IMPORTED_MODULE_7__["lengthCssPropNames"][p]) {
      style[p] = transformUnit(value[0]);
    } else if (_utils__WEBPACK_IMPORTED_MODULE_7__["colorCssPropNames"][p]) {
      style[p] = value[0];
    } else {
      transform = removeTransform(transform, p);

      if (p === 'rotate3d') {
        var newValue = value.concat();

        if (newValue.length === 4) {
          newValue[3] += 'deg';
        }

        transform += " ".concat(p, "(").concat(newValue.join(','), ")");
      } else if (_utils__WEBPACK_IMPORTED_MODULE_7__["rotateProperties"][p] || _utils__WEBPACK_IMPORTED_MODULE_7__["skewProperties"][p]) {
        transform += " ".concat(getDegreeTransform(p, value));
      } else if (_utils__WEBPACK_IMPORTED_MODULE_7__["translateProperties"][p]) {
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

/* harmony default export */ __webpack_exports__["default"] = (Object(_nerv__WEBPACK_IMPORTED_MODULE_2__["createNervClass"])({
  displayName: 'View',
  mixins: [_AnimationViewMixin__WEBPACK_IMPORTED_MODULE_8__["default"]],
  componentDidMount: function componentDidMount() {
    this.firstAppeared = false;
    this.checkVisible = Object(_utils_throttle__WEBPACK_IMPORTED_MODULE_5__["default"])(this.checkVisible, 300, {
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
        this.scrollEvent = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_3__["default"])(window, {
          scroll: this.checkVisible
        });
      }

      if (!this.scrollParentEvent) {
        var scrollParent = this.getScrollParent();

        if (scrollParent) {
          this.scrollParentEvent = Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_3__["default"])(scrollParent, {
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
    var viewVisible = Object(_utils_isNodeVisible__WEBPACK_IMPORTED_MODULE_4__["default"])(this.root, this.scrollParent, appearOffset); // 是否可见

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
        TagName = _props$tagName === void 0 ? 'div' : _props$tagName,
        $mp = props.$mp,
        rest = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(props, ["children", "hidden", "userProps", "testProps", "tagName", "$mp"]);

    var style = props.style;
    var touchableProps = {};

    if (props.hoverClass) {
      touchableProps.activeClassName = props.hoverClass;
    }

    if (props.hoverStartTime) {
      touchableProps.delayPressIn = props.hoverStartTime;
    }

    if (props.hoverStayTime) {
      touchableProps.delayPressOut = props.hoverStayTime;
    } // if (this.hasEvent('longtap')) {
    //   touchableProps.onLongPress = this.onLongTap;
    // }


    if (hidden) {
      style = _objectSpread(_objectSpread({}, style), {}, {
        display: 'none'
      });
    }

    var content = _nerv__WEBPACK_IMPORTED_MODULE_2__["default"].createElement(TagName, _objectSpread(_objectSpread({
      className: props.className,
      style: style,
      id: props.id
    }, this.props.$mp.getAriaProps()), {}, {
      ref: this.saveRoot
    }, rest), children);
    return content;
  }
}));

/***/ }),

/***/ "./src/view/utils.js":
/*!***************************!*\
  !*** ./src/view/utils.js ***!
  \***************************/
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

/***/ "./src/web-components/common/base.js":
/*!*******************************************!*\
  !*** ./src/web-components/common/base.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Base; });
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/get.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _utils_addEvents__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/addEvents */ "./src/utils/addEvents.js");









function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }


function Base(SuperClass) {
  var BaseMixin = /*#__PURE__*/function (_SuperClass) {
    _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(BaseMixin, _SuperClass);

    var _super = _createSuper(BaseMixin);

    function BaseMixin() {
      var _this2;

      _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, BaseMixin);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this2 = _super.call.apply(_super, [this].concat(args));

      _this2.triggerReRender = function () {
        _this2.emitter.emit('RE_RENDER', 'base');
      };

      return _this2;
    }

    _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(BaseMixin, [{
      key: "bridge",
      get: function get() {
        return this.__fields.bridge;
      }
    }, {
      key: "emitter",
      get: function get() {
        return this.__fields.emitter;
      }
    }, {
      key: "pageStatus",
      get: function get() {
        return this.__fields.status;
      }
    }, {
      key: "trackFn",
      get: function get() {
        return this.__fields.trackFn;
      }
    }, {
      key: "publish",
      get: function get() {
        return this.bridge.publish;
      }
    }, {
      key: "subscribe",
      get: function get() {
        return this.bridge.subscribe;
      }
    }, {
      key: "unsubscribe",
      get: function get() {
        return this.bridge.unsubscribe;
      }
    }, {
      key: "onNative",
      get: function get() {
        return this.bridge.onNative;
      }
    }, {
      key: "offNative",
      get: function get() {
        return this.bridge.offNative;
      }
    }, {
      key: "invokeNative",
      get: function get() {
        return this.bridge.invokeNative;
      }
    }, {
      key: "invokeService",
      get: function get() {
        return this.bridge.invokeService;
      }
    }, {
      key: "connectedCallback",
      value: function connectedCallback() {
        _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3___default()(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(BaseMixin.prototype), "connectedCallback", this).call(this);
      }
    }, {
      key: "ready",
      value: function ready() {
        var _this3 = this;

        _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3___default()(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(BaseMixin.prototype), "ready", this).call(this);

        if (this.listeners) {
          (function () {
            var _this = _this3;

            for (var key in _this3.listeners) {
              if (Object.hasOwnProperty.call(_this3.listeners, key)) {
                (function () {
                  var eventHandler = _this3.listeners[key];
                  var m = key.split('.');
                  var eventTarget = m.length > 1 ? m[0] : null;
                  var eventKey = eventTarget ? m[1] : m[0];

                  var fn = function fn(e) {
                    return _this[eventHandler].call(_this, e);
                  };

                  Object(_utils_addEvents__WEBPACK_IMPORTED_MODULE_8__["addEvent"])(eventTarget ? _this3.$[eventTarget] : _this3, eventKey, fn);
                })();
              }
            }
          })();
        }
      }
    }, {
      key: "hasBehavior",
      value: function hasBehavior(type) {
        // simple mock of hasBehavior method
        if (type === 'base') {
          return true;
        }

        return false;
      }
    }, {
      key: "invoke",
      value: function invoke(methodName, params, option) {
        this.invokeMethod(methodName, params, option);
      }
    }, {
      key: "invokeMethod",
      value: function () {
        var _invokeMethod = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0___default()( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_7___default.a.mark(function _callee(method) {
          var params,
              option,
              pureParams,
              call,
              res,
              status,
              _args = arguments;
          return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_7___default.a.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  params = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
                  option = _args.length > 2 && _args[2] !== undefined ? _args[2] : {};
                  pureParams = omitBy(params, isFunction);

                  call = function call(obj, key) {
                    var fn = get$3(obj, key);

                    if (typeof fn === 'function') {
                      fn(res);
                    }
                  };

                  _context.next = 6;
                  return this.invokeNative(method, pureParams);

                case 6:
                  res = _context.sent;
                  res.errMsg = res.errMsg || "".concat(method, ":ok");
                  status = res.errMsg.startsWith("".concat(method, ":ok")) ? 'ok' : res.errMsg.startsWith("".concat(method, ":cancel")) ? 'cancel' : 'fail';

                  if (status === 'ok') {
                    call(option, 'beforeSuccess');
                    call(params, 'success');
                    call(option, 'afterSuccess');
                  } else if (status === 'cancel') {
                    // FIXME: 这里在 cancel 中调用 fail 是为了兼容老逻辑
                    // 未来重构会去掉在基础库内部使用 invokeMethod 的逻辑`
                    call(params, 'fail');
                    call(option, 'cancel');
                  } else if (status === 'fail') {
                    call(option, 'beforeFail');
                    call(params, 'fail');
                    call(option, 'beforeFail');
                  }

                  call(params, 'complete');
                  call(option, 'afterAll');

                case 12:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        function invokeMethod(_x) {
          return _invokeMethod.apply(this, arguments);
        }

        return invokeMethod;
      }()
    }, {
      key: "triggerEvent",
      value: function triggerEvent(eventName) {
        var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // 这个api用来触发组件自己独有的事件，比如swiper的change，input的focus，
        var e = new CustomEvent(eventName, {
          detail: detail,
          bubbles: false,
          // 微信的做法，这些事件都不会冒泡
          composed: false
        });
        this.dispatchEvent(e);
      }
    }, {
      key: "parentCustomComponent",
      value: function parentCustomComponent() {
        // find parent custom component
        var cc = isInCustomComponent(this);

        if (!cc) {
          return null;
        }

        return cc._id;
      }
    }, {
      key: "_deserializeValue",
      value: function _deserializeValue(value, type) {
        if (type === Boolean) {
          return !!value;
        }

        if (type === String) {
          if (value === undefined || value === null) {
            return '';
          } // compiler会把value=""编译成value: true, 兼容一下


          if (typeof value === 'boolean' && value) {
            return '';
          }

          return value.toString();
        }

        return _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3___default()(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(BaseMixin.prototype), "_deserializeValue", this).call(this, value, type);
      }
    }], [{
      key: "properties",
      get: function get() {
        return {
          hidden: {
            type: Boolean,
            reflectToAttribute: true
          },
          __fields: {
            type: Object
          }
        };
      }
    }]);

    return BaseMixin;
  }(SuperClass);

  return BaseMixin;
}

/***/ }),

/***/ "./src/web-components/common/hover.js":
/*!********************************************!*\
  !*** ./src/web-components/common/hover.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Hover; });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/get.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__);







function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

function Hover(SuperClass) {
  var HoverMixin = /*#__PURE__*/function (_SuperClass) {
    _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default()(HoverMixin, _SuperClass);

    var _super = _createSuper(HoverMixin);

    function HoverMixin() {
      var _this;

      _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, HoverMixin);

      _this = _super.call(this);
      _this._hoverClass = [];
      return _this;
    }

    _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(HoverMixin, [{
      key: "hasBehavior",
      value: function hasBehavior(type) {
        // simple mock of hasBehavior method
        if (type === 'hover') {
          return true;
        }

        if (_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_2___default()(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(HoverMixin.prototype), "hasBehavior", this)) {
          return _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_2___default()(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(HoverMixin.prototype), "hasBehavior", this).call(this, type);
        }
      }
    }, {
      key: "bindHover",
      value: function bindHover() {
        if (!this._bindHover) {
          this._bindHover = true;
          this._hoverTouchStartId = this.hoverTouchStart.bind(this);
          this._hoverTouchEndId = this.hoverTouchEnd.bind(this);
          this._hoverCancelId = this.hoverCancel.bind(this);
          this.addEventListener('touchstart', this._hoverTouchStartId, PASSIVE_TOUCH);
          this.addEventListener('touchend', this._hoverTouchEndId);
          this.addEventListener('touchcancel', this._hoverCancelId);
          this.addEventListener('touchmove', this._hoverCancelId, PASSIVE_TOUCH);
        }
      }
    }, {
      key: "unbindHover",
      value: function unbindHover() {
        if (this._bindHover) {
          this._bindHover = false;
          this.removeEventListener('touchstart', this._hoverTouchStartId);
          this.removeEventListener('touchend', this._hoverTouchEndId);
          this.removeEventListener('touchcancel', this._hoverCancelId);
          this.removeEventListener('touchmove', this._hoverCancelId);
        }
      }
    }, {
      key: "hoverTouchStart",
      value: function hoverTouchStart(e) {
        var _this2 = this;

        if (!e._hoverPropagationStopped) {
          if (this.hoverStopPropagation) {
            e._hoverPropagationStopped = true;
          }

          if (this._hoverTouch && e.touches.length > 1 && !this._hovering) {
            this.hoverCancel();
            return;
          }

          this._hoverTouch = true;

          if (this.hoverClass === 'none' || this.disabled) {
            return;
          }

          this._hoverStyleTimeId = setTimeout(function () {
            _this2._hovering = true;

            if (_this2._hoverClass.length > 0) {
              for (var _e = 0; _e < _this2._hoverClass.length; _e++) {
                _this2.classList.toggle(_this2._hoverClass[_e], true);
              }
            }

            if (!_this2._hoverTouch) {
              window.requestAnimationFrame(function () {
                clearTimeout(_this2._hoverStayTimeId);
                _this2._hoverStayTimeId = setTimeout(function () {
                  _this2._hoverReset();
                }, _this2.hoverStayTime);
              });
            }
          }, this.hoverStartTime);
        }
      }
    }, {
      key: "hoverTouchEnd",
      value: function hoverTouchEnd() {
        var _this3 = this;

        this._hoverTouch = false;

        if (this._hovering) {
          window.requestAnimationFrame(function () {
            clearTimeout(_this3._hoverStayTimeId);
            _this3._hoverStayTimeId = setTimeout(function () {
              _this3._hoverReset();
            }, _this3.hoverStayTime);
          });
        }
      }
    }, {
      key: "hoverCancel",
      value: function hoverCancel() {
        this._hoverTouch = false;
        clearTimeout(this._hoverStyleTimeId);

        this._hoverReset();
      }
    }, {
      key: "_hoverClassChange",
      value: function _hoverClassChange(targetClassName) {
        if (!targetClassName) {
          return;
        }

        var classes = targetClassName.split(/\s/);
        this._hoverClass = []; // remove hover effects

        if (targetClassName === 'none' && !this.hoverStopPropagation) {
          return this.unbindHover();
        }

        for (var n = 0; n < classes.length; n++) {
          classes[n] && this._hoverClass.push(classes[n]);
        }

        this.bindHover();
      }
    }, {
      key: "_hoverStopChange",
      value: function _hoverStopChange(e) {
        if (this.hoverClass === 'none' && !e) {
          return this.unbindHover();
        }

        this.bindHover();
      }
    }, {
      key: "_hoverReset",
      value: function _hoverReset() {
        if (this._hovering) {
          this._hovering = false;

          if (this.hoverClass !== 'none' && this._hoverClass.length > 0) {
            for (var e = 0; e < this._hoverClass.length; e++) {
              if (this.classList.contains(this._hoverClass[e])) {
                this.classList.toggle(this._hoverClass[e], false);
              }
            }
          }
        }
      }
    }], [{
      key: "properties",
      get: function get() {
        return {
          hoverStartTime: {
            type: Number,
            value: 50
          },
          hoverStayTime: {
            type: Number,
            value: 400
          },
          hoverClass: {
            type: String,
            observer: '_hoverClassChange'
          },
          hoverStopPropagation: {
            type: Boolean,
            observer: '_hoverStopChange'
          }
        };
      }
    }]);

    return HoverMixin;
  }(SuperClass);

  return HoverMixin;
}

/***/ }),

/***/ "./src/web-components/index.js":
/*!*************************************!*\
  !*** ./src/web-components/index.js ***!
  \*************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./view */ "./src/web-components/view.js");
/* harmony import */ var _label__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./label */ "./src/web-components/label.js");



/***/ }),

/***/ "./src/web-components/label.js":
/*!*************************************!*\
  !*** ./src/web-components/label.js ***!
  \*************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/taggedTemplateLiteral */ "./node_modules/@babel/runtime/helpers/taggedTemplateLiteral.js");
/* harmony import */ var _babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _polymer_polymer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @polymer/polymer */ "./node_modules/@polymer/polymer/polymer-element.js");
/* harmony import */ var _common_base__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./common/base */ "./src/web-components/common/base.js");
/* harmony import */ var _utils_config__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utils/config */ "./src/web-components/utils/config.js");







var _templateObject;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }





var Label = /*#__PURE__*/function (_Base) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default()(Label, _Base);

  var _super = _createSuper(Label);

  function Label() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, Label);

    return _super.apply(this, arguments);
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(Label, [{
    key: "listeners",
    get: function get() {
      return {
        tap: 'onTap'
      };
    }
  }, {
    key: "_dfs",
    value: function _dfs(parent) {
      // 查找子节点中isLabelTarget为true的结点
      if (parent.isLabelTarget) {
        return parent;
      }

      var children = Array.from(parent.children);

      for (var i = 0; i < children.length; i += 1) {
        var target = this._dfs(children[i]);

        if (target) {
          return target;
        }
      }
    }
  }, {
    key: "onTap",
    value: function onTap(e) {
      var labelTarget;
      var labelFor = this.htmlFor; // tma-html-compiler会把for输出到htmlFor

      if (labelFor) {
        labelTarget = this.querySelector("#".concat(labelFor)) || document.getElementById(labelFor);
      } else {
        labelTarget = this._dfs(this);
      }

      if (labelTarget && labelTarget.handleLabelTap && e.target !== labelTarget) {
        labelTarget.handleLabelTap(e);
      }
    }
  }], [{
    key: "is",
    get: function get() {
      return "".concat(_utils_config__WEBPACK_IMPORTED_MODULE_8__["perfix"], "-label");
    }
  }, {
    key: "properties",
    get: function get() {
      return {};
    }
  }, {
    key: "template",
    get: function get() {
      return Object(_polymer_polymer__WEBPACK_IMPORTED_MODULE_6__["html"])(_templateObject || (_templateObject = _babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0___default()(["\n      <style>\n        :host {\n          -webkit-tap-highlight-color: rgba(0,0,0,0);\n        }     \n      </style>     \n      <slot></slot>\n    "])));
    }
  }]);

  return Label;
}(Object(_common_base__WEBPACK_IMPORTED_MODULE_7__["default"])(_polymer_polymer__WEBPACK_IMPORTED_MODULE_6__["PolymerElement"]));

window.customElements.define(Label.is, Label);

/***/ }),

/***/ "./src/web-components/utils/config.js":
/*!********************************************!*\
  !*** ./src/web-components/utils/config.js ***!
  \********************************************/
/*! exports provided: perfix */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "perfix", function() { return perfix; });
var perfix = 'mp';

/***/ }),

/***/ "./src/web-components/utils/tools.js":
/*!*******************************************!*\
  !*** ./src/web-components/utils/tools.js ***!
  \*******************************************/
/*! exports provided: IS_IOS_11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IS_IOS_11", function() { return IS_IOS_11; });
var IS_IOS_11 = window.navigator.userAgent.match(/iPhone OS 11_[34]/);

/***/ }),

/***/ "./src/web-components/view.js":
/*!************************************!*\
  !*** ./src/web-components/view.js ***!
  \************************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/taggedTemplateLiteral */ "./node_modules/@babel/runtime/helpers/taggedTemplateLiteral.js");
/* harmony import */ var _babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/get */ "./node_modules/@babel/runtime/helpers/get.js");
/* harmony import */ var _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _polymer_polymer__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @polymer/polymer */ "./node_modules/@polymer/polymer/polymer-element.js");
/* harmony import */ var _common_base__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./common/base */ "./src/web-components/common/base.js");
/* harmony import */ var _common_hover__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./common/hover */ "./src/web-components/common/hover.js");
/* harmony import */ var _utils_config__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utils/config */ "./src/web-components/utils/config.js");
/* harmony import */ var _utils_tools__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./utils/tools */ "./src/web-components/utils/tools.js");








var _templateObject;

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_5___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }







var View = /*#__PURE__*/function (_Hover) {
  _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_4___default()(View, _Hover);

  var _super = _createSuper(View);

  function View() {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, View);

    return _super.apply(this, arguments);
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(View, [{
    key: "ready",
    value: function ready() {
      _babel_runtime_helpers_get__WEBPACK_IMPORTED_MODULE_3___default()(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_6___default()(View.prototype), "ready", this).call(this);

      if (_utils_tools__WEBPACK_IMPORTED_MODULE_11__["IS_IOS_11"]) {
        // ios 11.4或者11.3的兼容问题, 文本节点的text-decoration没了
        this.$.main.style.textDecoration = 'inherit';
      }
    }
  }], [{
    key: "is",
    get: function get() {
      return "".concat(_utils_config__WEBPACK_IMPORTED_MODULE_10__["perfix"], "-view");
    }
  }, {
    key: "template",
    get: function get() {
      return Object(_polymer_polymer__WEBPACK_IMPORTED_MODULE_7__["html"])(_templateObject || (_templateObject = _babel_runtime_helpers_taggedTemplateLiteral__WEBPACK_IMPORTED_MODULE_0___default()(["\n      <style>      \n        :host {        \n          display: block;        \n          white-space: normal;      \n        }      \n        :host[hidden] {        \n          display: none !important;\n        }      \n        #main {        \n          /* ios12 special */        \n          text-decoration: inherit;      \n        }    \n      </style>\n      <slot id=\"main\"></slot>\n    "])));
    }
  }]);

  return View;
}(Object(_common_hover__WEBPACK_IMPORTED_MODULE_9__["default"])(Object(_common_base__WEBPACK_IMPORTED_MODULE_8__["default"])(_polymer_polymer__WEBPACK_IMPORTED_MODULE_7__["PolymerElement"])));

window.customElements.define(View.is, View);

/***/ }),

/***/ "./src/xml-runtime/EmptyComponent.js":
/*!*******************************************!*\
  !*** ./src/xml-runtime/EmptyComponent.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return EmptyComponent; });
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");

function EmptyComponent(props) {
  var _ref = props || {},
      _ref$children = _ref.children,
      children = _ref$children === void 0 ? null : _ref$children;

  return children;
}

/***/ }),

/***/ "./src/xml-runtime/EmptyComponentFactory.js":
/*!**************************************************!*\
  !*** ./src/xml-runtime/EmptyComponentFactory.js ***!
  \**************************************************/
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

/***/ "./src/xml-runtime/createBlock.js":
/*!****************************************!*\
  !*** ./src/xml-runtime/createBlock.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createBlock; });
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");

function createBlock(element, props) {
  var arrayElements = element;

  if (!Array.isArray(arrayElements)) {
    arrayElements = [arrayElements];
  }

  if (_nerv__WEBPACK_IMPORTED_MODULE_0__["Fragment"]) {
    return _nerv__WEBPACK_IMPORTED_MODULE_0__["default"].createElement(_nerv__WEBPACK_IMPORTED_MODULE_0__["Fragment"], props, arrayElements);
  } else {
    return arrayElements;
  }
}

/***/ }),

/***/ "./src/xml-runtime/createRoot.js":
/*!***************************************!*\
  !*** ./src/xml-runtime/createRoot.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createRoot; });
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");

function createRoot(element) {
  if (Array.isArray(element) && _nerv__WEBPACK_IMPORTED_MODULE_0__["Fragment"]) {
    return _nerv__WEBPACK_IMPORTED_MODULE_0__["default"].createElement(_nerv__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null, element);
  }

  return element;
}

/***/ }),

/***/ "./src/xml-runtime/createTemplate.js":
/*!*******************************************!*\
  !*** ./src/xml-runtime/createTemplate.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/inherits */ "./node_modules/@babel/runtime/helpers/inherits.js");
/* harmony import */ var _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/possibleConstructorReturn */ "./node_modules/@babel/runtime/helpers/possibleConstructorReturn.js");
/* harmony import */ var _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/getPrototypeOf */ "./node_modules/@babel/runtime/helpers/getPrototypeOf.js");
/* harmony import */ var _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");







function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _babel_runtime_helpers_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5___default()(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _babel_runtime_helpers_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4___default()(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }



function transformChildrenToSlots(children) {
  var slots = {};
  _nerv__WEBPACK_IMPORTED_MODULE_6__["default"].Children.forEach(children, function (c) {
    var slot = c && c.props && c.props.slot || '$default';
    var holder = slots[slot] || [];
    holder.push(c);
    slots[slot] = holder;
  });
  return slots;
}

/* harmony default export */ __webpack_exports__["default"] = (function (name, elementFactory) {
  var RMLTemplate = /*#__PURE__*/function (_PureComponent) {
    _babel_runtime_helpers_inherits__WEBPACK_IMPORTED_MODULE_3___default()(RMLTemplate, _PureComponent);

    var _super = _createSuper(RMLTemplate);

    function RMLTemplate() {
      _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, RMLTemplate);

      return _super.apply(this, arguments);
    }

    _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(RMLTemplate, [{
      key: "render",
      value: function render() {
        var _this$props = this.props,
            $context = _this$props.$context,
            slot = _this$props.slot,
            children = _this$props.children,
            props = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default()(_this$props, ["$context", "slot", "children"]);

        props.$slots = transformChildrenToSlots(children);
        var renderChildren = elementFactory.call($context, props);
        return renderChildren;
      }
    }]);

    return RMLTemplate;
  }(_nerv__WEBPACK_IMPORTED_MODULE_6__["PureComponent"]);

  RMLTemplate.displayName = name;
  return RMLTemplate;
});

/***/ }),

/***/ "./src/xml-runtime/getLooseDataMember.js":
/*!***********************************************!*\
  !*** ./src/xml-runtime/getLooseDataMember.js ***!
  \***********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/types */ "./src/utils/types.js");

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
      return _utils_types__WEBPACK_IMPORTED_MODULE_0__["noop"];
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
      return _utils_types__WEBPACK_IMPORTED_MODULE_0__["noop"];
    }

    return ret.bind(lastArg);
  }

  if (danger(ret)) {
    return _utils_types__WEBPACK_IMPORTED_MODULE_0__["noop"];
  }

  return ret;
});

/***/ }),

/***/ "./src/xml-runtime/getSJSMember.js":
/*!*****************************************!*\
  !*** ./src/xml-runtime/getSJSMember.js ***!
  \*****************************************/
/*! exports provided: prefix, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "prefix", function() { return prefix; });
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/types */ "./src/utils/types.js");

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
      return _utils_types__WEBPACK_IMPORTED_MODULE_0__["noop"];
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

/***/ "./src/xml-runtime/index.js":
/*!**********************************!*\
  !*** ./src/xml-runtime/index.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _createBlock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createBlock */ "./src/xml-runtime/createBlock.js");
/* harmony import */ var _createRoot__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createRoot */ "./src/xml-runtime/createRoot.js");
/* harmony import */ var _createTemplate__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./createTemplate */ "./src/xml-runtime/createTemplate.js");
/* harmony import */ var _EmptyComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./EmptyComponent */ "./src/xml-runtime/EmptyComponent.js");
/* harmony import */ var _EmptyComponentFactory__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./EmptyComponentFactory */ "./src/xml-runtime/EmptyComponentFactory.js");
/* harmony import */ var _getLooseDataMember__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./getLooseDataMember */ "./src/xml-runtime/getLooseDataMember.js");
/* harmony import */ var _getSJSMember__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./getSJSMember */ "./src/xml-runtime/getSJSMember.js");
/* harmony import */ var _iterate__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./iterate */ "./src/xml-runtime/iterate.js");
/* harmony import */ var _renderSlot__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./renderSlot */ "./src/xml-runtime/renderSlot.js");
/* harmony import */ var _resolveScopedSlots__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./resolveScopedSlots */ "./src/xml-runtime/resolveScopedSlots.js");
/* harmony import */ var _toString__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./toString */ "./src/xml-runtime/toString.js");
/* harmony import */ var _useTemplate__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./useTemplate */ "./src/xml-runtime/useTemplate.js");












/* harmony default export */ __webpack_exports__["default"] = ({
  createBlock: _createBlock__WEBPACK_IMPORTED_MODULE_0__["default"],
  createRoot: _createRoot__WEBPACK_IMPORTED_MODULE_1__["default"],
  createTemplate: _createTemplate__WEBPACK_IMPORTED_MODULE_2__["default"],
  EmptyComponent: _EmptyComponent__WEBPACK_IMPORTED_MODULE_3__["default"],
  EmptyComponentFactory: _EmptyComponentFactory__WEBPACK_IMPORTED_MODULE_4__["default"],
  getLooseDataMember: _getLooseDataMember__WEBPACK_IMPORTED_MODULE_5__["default"],
  getSJSMember: _getSJSMember__WEBPACK_IMPORTED_MODULE_6__["default"],
  iterate: _iterate__WEBPACK_IMPORTED_MODULE_7__["default"],
  renderSlot: _renderSlot__WEBPACK_IMPORTED_MODULE_8__["default"],
  resolveScopedSlots: _resolveScopedSlots__WEBPACK_IMPORTED_MODULE_9__["default"],
  toString: _toString__WEBPACK_IMPORTED_MODULE_10__["default"],
  useTemplate: _useTemplate__WEBPACK_IMPORTED_MODULE_11__["default"]
});

/***/ }),

/***/ "./src/xml-runtime/iterate.js":
/*!************************************!*\
  !*** ./src/xml-runtime/iterate.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return iterate; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);

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
    } else if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(items) === 'object') {
      Object.keys(items).forEach(function (key) {
        ret.push(fn(items[key], key));
      });
    }
  }

  return ret;
}

/***/ }),

/***/ "./src/xml-runtime/renderSlot.js":
/*!***************************************!*\
  !*** ./src/xml-runtime/renderSlot.js ***!
  \***************************************/
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

/***/ "./src/xml-runtime/resolveScopedSlots.js":
/*!***********************************************!*\
  !*** ./src/xml-runtime/resolveScopedSlots.js ***!
  \***********************************************/
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

/***/ "./src/xml-runtime/toString.js":
/*!*************************************!*\
  !*** ./src/xml-runtime/toString.js ***!
  \*************************************/
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

/***/ "./src/xml-runtime/useTemplate.js":
/*!****************************************!*\
  !*** ./src/xml-runtime/useTemplate.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return useTemplate; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _nerv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/nerv */ "./src/nerv/index.ts");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


function useTemplate(template, data, key, context) {
  var Component = template && template.Component;
  return Component ? _nerv__WEBPACK_IMPORTED_MODULE_1__["default"].createElement(Component, _objectSpread(_objectSpread({}, data), {}, {
    $context: context,
    key: key
  })) : null;
}

/***/ })

/******/ });
//# sourceMappingURL=mp.js.map