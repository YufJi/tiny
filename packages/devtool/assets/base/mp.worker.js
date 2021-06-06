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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/arrayLikeToArray.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/arrayWithHoles.js":
/*!***************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/arrayWithHoles.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;
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

/***/ "./node_modules/@babel/runtime/helpers/iterableToArray.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/iterableToArray.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

module.exports = _iterableToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/iterableToArrayLimit.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/iterableToArrayLimit.js ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _iterableToArrayLimit(arr, i) {
  var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/nonIterableRest.js":
/*!****************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/nonIterableRest.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/nonIterableSpread.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/nonIterableSpread.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;
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

/***/ "./node_modules/@babel/runtime/helpers/slicedToArray.js":
/*!**************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/slicedToArray.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayWithHoles = __webpack_require__(/*! ./arrayWithHoles.js */ "./node_modules/@babel/runtime/helpers/arrayWithHoles.js");

var iterableToArrayLimit = __webpack_require__(/*! ./iterableToArrayLimit.js */ "./node_modules/@babel/runtime/helpers/iterableToArrayLimit.js");

var unsupportedIterableToArray = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js");

var nonIterableRest = __webpack_require__(/*! ./nonIterableRest.js */ "./node_modules/@babel/runtime/helpers/nonIterableRest.js");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;
module.exports["default"] = module.exports, module.exports.__esModule = true;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/toConsumableArray.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/toConsumableArray.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayWithoutHoles = __webpack_require__(/*! ./arrayWithoutHoles.js */ "./node_modules/@babel/runtime/helpers/arrayWithoutHoles.js");

var iterableToArray = __webpack_require__(/*! ./iterableToArray.js */ "./node_modules/@babel/runtime/helpers/iterableToArray.js");

var unsupportedIterableToArray = __webpack_require__(/*! ./unsupportedIterableToArray.js */ "./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js");

var nonIterableSpread = __webpack_require__(/*! ./nonIterableSpread.js */ "./node_modules/@babel/runtime/helpers/nonIterableSpread.js");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;
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

/***/ "./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/unsupportedIterableToArray.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var arrayLikeToArray = __webpack_require__(/*! ./arrayLikeToArray.js */ "./node_modules/@babel/runtime/helpers/arrayLikeToArray.js");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;
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

/***/ "./node_modules/call-bind/callBound.js":
/*!*********************************************!*\
  !*** ./node_modules/call-bind/callBound.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var callBind = __webpack_require__(/*! ./ */ "./node_modules/call-bind/index.js");

var $indexOf = callBind(GetIntrinsic('String.prototype.indexOf'));

module.exports = function callBoundIntrinsic(name, allowMissing) {
  var intrinsic = GetIntrinsic(name, !!allowMissing);

  if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
    return callBind(intrinsic);
  }

  return intrinsic;
};

/***/ }),

/***/ "./node_modules/call-bind/index.js":
/*!*****************************************!*\
  !*** ./node_modules/call-bind/index.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");

var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var $apply = GetIntrinsic('%Function.prototype.apply%');
var $call = GetIntrinsic('%Function.prototype.call%');
var $reflectApply = GetIntrinsic('%Reflect.apply%', true) || bind.call($call, $apply);
var $gOPD = GetIntrinsic('%Object.getOwnPropertyDescriptor%', true);
var $defineProperty = GetIntrinsic('%Object.defineProperty%', true);
var $max = GetIntrinsic('%Math.max%');

if ($defineProperty) {
  try {
    $defineProperty({}, 'a', {
      value: 1
    });
  } catch (e) {
    // IE 8 has a broken defineProperty
    $defineProperty = null;
  }
}

module.exports = function callBind(originalFunction) {
  var func = $reflectApply(bind, $call, arguments);

  if ($gOPD && $defineProperty) {
    var desc = $gOPD(func, 'length');

    if (desc.configurable) {
      // original length, plus the receiver, minus any additional arguments (after the receiver)
      $defineProperty(func, 'length', {
        value: 1 + $max(0, originalFunction.length - (arguments.length - 1))
      });
    }
  }

  return func;
};

var applyBind = function applyBind() {
  return $reflectApply(bind, $apply, arguments);
};

if ($defineProperty) {
  $defineProperty(module.exports, 'apply', {
    value: applyBind
  });
} else {
  module.exports.apply = applyBind;
}

/***/ }),

/***/ "./node_modules/eventemitter3/index.js":
/*!*********************************************!*\
  !*** ./node_modules/eventemitter3/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var has = Object.prototype.hasOwnProperty,
    prefix = '~';
/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */

function Events() {} //
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//


if (Object.create) {
  Events.prototype = Object.create(null); //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //

  if (!new Events().__proto__) prefix = false;
}
/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */


function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}
/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */


function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once),
      evt = prefix ? prefix + event : event;
  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
  return emitter;
}
/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */


function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
}
/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */


function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}
/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */


EventEmitter.prototype.eventNames = function eventNames() {
  var names = [],
      events,
      name;
  if (this._eventsCount === 0) return names;

  for (name in events = this._events) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};
/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */


EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event,
      handlers = this._events[evt];
  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};
/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */


EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event,
      listeners = this._events[evt];
  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};
/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */


EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;
  if (!this._events[evt]) return false;
  var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1:
        return listeners.fn.call(listeners.context), true;

      case 2:
        return listeners.fn.call(listeners.context, a1), true;

      case 3:
        return listeners.fn.call(listeners.context, a1, a2), true;

      case 4:
        return listeners.fn.call(listeners.context, a1, a2, a3), true;

      case 5:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;

      case 6:
        return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len - 1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length,
        j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1:
          listeners[i].fn.call(listeners[i].context);
          break;

        case 2:
          listeners[i].fn.call(listeners[i].context, a1);
          break;

        case 3:
          listeners[i].fn.call(listeners[i].context, a1, a2);
          break;

        case 4:
          listeners[i].fn.call(listeners[i].context, a1, a2, a3);
          break;

        default:
          if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
            args[j - 1] = arguments[j];
          }
          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};
/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */


EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};
/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */


EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};
/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */


EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;
  if (!this._events[evt]) return this;

  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
        events.push(listeners[i]);
      }
    } //
    // Reset the array, or remove it completely if we have no more listeners.
    //


    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
  }

  return this;
};
/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */


EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
}; //
// Alias methods names because people roll like that.
//


EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on; //
// Expose the prefix.
//

EventEmitter.prefixed = prefix; //
// Allow `EventEmitter` to be imported as module namespace.
//

EventEmitter.EventEmitter = EventEmitter; //
// Expose the module.
//

if (true) {
  module.exports = EventEmitter;
}

/***/ }),

/***/ "./node_modules/function-bind/implementation.js":
/*!******************************************************!*\
  !*** ./node_modules/function-bind/implementation.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
  var target = this;

  if (typeof target !== 'function' || toStr.call(target) !== funcType) {
    throw new TypeError(ERROR_MESSAGE + target);
  }

  var args = slice.call(arguments, 1);
  var bound;

  var binder = function () {
    if (this instanceof bound) {
      var result = target.apply(this, args.concat(slice.call(arguments)));

      if (Object(result) === result) {
        return result;
      }

      return this;
    } else {
      return target.apply(that, args.concat(slice.call(arguments)));
    }
  };

  var boundLength = Math.max(0, target.length - args.length);
  var boundArgs = [];

  for (var i = 0; i < boundLength; i++) {
    boundArgs.push('$' + i);
  }

  bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

  if (target.prototype) {
    var Empty = function Empty() {};

    Empty.prototype = target.prototype;
    bound.prototype = new Empty();
    Empty.prototype = null;
  }

  return bound;
};

/***/ }),

/***/ "./node_modules/function-bind/index.js":
/*!*********************************************!*\
  !*** ./node_modules/function-bind/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var implementation = __webpack_require__(/*! ./implementation */ "./node_modules/function-bind/implementation.js");

module.exports = Function.prototype.bind || implementation;

/***/ }),

/***/ "./node_modules/get-intrinsic/index.js":
/*!*********************************************!*\
  !*** ./node_modules/get-intrinsic/index.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var undefined;
var $SyntaxError = SyntaxError;
var $Function = Function;
var $TypeError = TypeError; // eslint-disable-next-line consistent-return

var getEvalledConstructor = function (expressionSyntax) {
  try {
    return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
  } catch (e) {}
};

var $gOPD = Object.getOwnPropertyDescriptor;

if ($gOPD) {
  try {
    $gOPD({}, '');
  } catch (e) {
    $gOPD = null; // this is IE 8, which has a broken gOPD
  }
}

var throwTypeError = function () {
  throw new $TypeError();
};

var ThrowTypeError = $gOPD ? function () {
  try {
    // eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
    arguments.callee; // IE 8 does not throw here

    return throwTypeError;
  } catch (calleeThrows) {
    try {
      // IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
      return $gOPD(arguments, 'callee').get;
    } catch (gOPDthrows) {
      return throwTypeError;
    }
  }
}() : throwTypeError;

var hasSymbols = __webpack_require__(/*! has-symbols */ "./node_modules/has-symbols/index.js")();

var getProto = Object.getPrototypeOf || function (x) {
  return x.__proto__;
}; // eslint-disable-line no-proto


var needsEval = {};
var TypedArray = typeof Uint8Array === 'undefined' ? undefined : getProto(Uint8Array);
var INTRINSICS = {
  '%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
  '%Array%': Array,
  '%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
  '%ArrayIteratorPrototype%': hasSymbols ? getProto([][Symbol.iterator]()) : undefined,
  '%AsyncFromSyncIteratorPrototype%': undefined,
  '%AsyncFunction%': needsEval,
  '%AsyncGenerator%': needsEval,
  '%AsyncGeneratorFunction%': needsEval,
  '%AsyncIteratorPrototype%': needsEval,
  '%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
  '%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
  '%Boolean%': Boolean,
  '%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
  '%Date%': Date,
  '%decodeURI%': decodeURI,
  '%decodeURIComponent%': decodeURIComponent,
  '%encodeURI%': encodeURI,
  '%encodeURIComponent%': encodeURIComponent,
  '%Error%': Error,
  '%eval%': eval,
  // eslint-disable-line no-eval
  '%EvalError%': EvalError,
  '%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
  '%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
  '%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
  '%Function%': $Function,
  '%GeneratorFunction%': needsEval,
  '%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
  '%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
  '%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
  '%isFinite%': isFinite,
  '%isNaN%': isNaN,
  '%IteratorPrototype%': hasSymbols ? getProto(getProto([][Symbol.iterator]())) : undefined,
  '%JSON%': typeof JSON === 'object' ? JSON : undefined,
  '%Map%': typeof Map === 'undefined' ? undefined : Map,
  '%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols ? undefined : getProto(new Map()[Symbol.iterator]()),
  '%Math%': Math,
  '%Number%': Number,
  '%Object%': Object,
  '%parseFloat%': parseFloat,
  '%parseInt%': parseInt,
  '%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
  '%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
  '%RangeError%': RangeError,
  '%ReferenceError%': ReferenceError,
  '%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
  '%RegExp%': RegExp,
  '%Set%': typeof Set === 'undefined' ? undefined : Set,
  '%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols ? undefined : getProto(new Set()[Symbol.iterator]()),
  '%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
  '%String%': String,
  '%StringIteratorPrototype%': hasSymbols ? getProto(''[Symbol.iterator]()) : undefined,
  '%Symbol%': hasSymbols ? Symbol : undefined,
  '%SyntaxError%': $SyntaxError,
  '%ThrowTypeError%': ThrowTypeError,
  '%TypedArray%': TypedArray,
  '%TypeError%': $TypeError,
  '%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
  '%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
  '%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
  '%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
  '%URIError%': URIError,
  '%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
  '%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
  '%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet
};

var doEval = function doEval(name) {
  var value;

  if (name === '%AsyncFunction%') {
    value = getEvalledConstructor('async function () {}');
  } else if (name === '%GeneratorFunction%') {
    value = getEvalledConstructor('function* () {}');
  } else if (name === '%AsyncGeneratorFunction%') {
    value = getEvalledConstructor('async function* () {}');
  } else if (name === '%AsyncGenerator%') {
    var fn = doEval('%AsyncGeneratorFunction%');

    if (fn) {
      value = fn.prototype;
    }
  } else if (name === '%AsyncIteratorPrototype%') {
    var gen = doEval('%AsyncGenerator%');

    if (gen) {
      value = getProto(gen.prototype);
    }
  }

  INTRINSICS[name] = value;
  return value;
};

var LEGACY_ALIASES = {
  '%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
  '%ArrayPrototype%': ['Array', 'prototype'],
  '%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
  '%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
  '%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
  '%ArrayProto_values%': ['Array', 'prototype', 'values'],
  '%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
  '%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
  '%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
  '%BooleanPrototype%': ['Boolean', 'prototype'],
  '%DataViewPrototype%': ['DataView', 'prototype'],
  '%DatePrototype%': ['Date', 'prototype'],
  '%ErrorPrototype%': ['Error', 'prototype'],
  '%EvalErrorPrototype%': ['EvalError', 'prototype'],
  '%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
  '%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
  '%FunctionPrototype%': ['Function', 'prototype'],
  '%Generator%': ['GeneratorFunction', 'prototype'],
  '%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
  '%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
  '%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
  '%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
  '%JSONParse%': ['JSON', 'parse'],
  '%JSONStringify%': ['JSON', 'stringify'],
  '%MapPrototype%': ['Map', 'prototype'],
  '%NumberPrototype%': ['Number', 'prototype'],
  '%ObjectPrototype%': ['Object', 'prototype'],
  '%ObjProto_toString%': ['Object', 'prototype', 'toString'],
  '%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
  '%PromisePrototype%': ['Promise', 'prototype'],
  '%PromiseProto_then%': ['Promise', 'prototype', 'then'],
  '%Promise_all%': ['Promise', 'all'],
  '%Promise_reject%': ['Promise', 'reject'],
  '%Promise_resolve%': ['Promise', 'resolve'],
  '%RangeErrorPrototype%': ['RangeError', 'prototype'],
  '%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
  '%RegExpPrototype%': ['RegExp', 'prototype'],
  '%SetPrototype%': ['Set', 'prototype'],
  '%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
  '%StringPrototype%': ['String', 'prototype'],
  '%SymbolPrototype%': ['Symbol', 'prototype'],
  '%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
  '%TypedArrayPrototype%': ['TypedArray', 'prototype'],
  '%TypeErrorPrototype%': ['TypeError', 'prototype'],
  '%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
  '%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
  '%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
  '%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
  '%URIErrorPrototype%': ['URIError', 'prototype'],
  '%WeakMapPrototype%': ['WeakMap', 'prototype'],
  '%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");

var hasOwn = __webpack_require__(/*! has */ "./node_modules/has/src/index.js");

var $concat = bind.call(Function.call, Array.prototype.concat);
var $spliceApply = bind.call(Function.apply, Array.prototype.splice);
var $replace = bind.call(Function.call, String.prototype.replace);
var $strSlice = bind.call(Function.call, String.prototype.slice);
/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */

var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g;
/** Used to match backslashes in property paths. */

var stringToPath = function stringToPath(string) {
  var first = $strSlice(string, 0, 1);
  var last = $strSlice(string, -1);

  if (first === '%' && last !== '%') {
    throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
  } else if (last === '%' && first !== '%') {
    throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
  }

  var result = [];
  $replace(string, rePropName, function (match, number, quote, subString) {
    result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
  });
  return result;
};
/* end adaptation */


var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
  var intrinsicName = name;
  var alias;

  if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
    alias = LEGACY_ALIASES[intrinsicName];
    intrinsicName = '%' + alias[0] + '%';
  }

  if (hasOwn(INTRINSICS, intrinsicName)) {
    var value = INTRINSICS[intrinsicName];

    if (value === needsEval) {
      value = doEval(intrinsicName);
    }

    if (typeof value === 'undefined' && !allowMissing) {
      throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
    }

    return {
      alias: alias,
      name: intrinsicName,
      value: value
    };
  }

  throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
  if (typeof name !== 'string' || name.length === 0) {
    throw new $TypeError('intrinsic name must be a non-empty string');
  }

  if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
    throw new $TypeError('"allowMissing" argument must be a boolean');
  }

  var parts = stringToPath(name);
  var intrinsicBaseName = parts.length > 0 ? parts[0] : '';
  var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
  var intrinsicRealName = intrinsic.name;
  var value = intrinsic.value;
  var skipFurtherCaching = false;
  var alias = intrinsic.alias;

  if (alias) {
    intrinsicBaseName = alias[0];
    $spliceApply(parts, $concat([0, 1], alias));
  }

  for (var i = 1, isOwn = true; i < parts.length; i += 1) {
    var part = parts[i];
    var first = $strSlice(part, 0, 1);
    var last = $strSlice(part, -1);

    if ((first === '"' || first === "'" || first === '`' || last === '"' || last === "'" || last === '`') && first !== last) {
      throw new $SyntaxError('property names with quotes must have matching quotes');
    }

    if (part === 'constructor' || !isOwn) {
      skipFurtherCaching = true;
    }

    intrinsicBaseName += '.' + part;
    intrinsicRealName = '%' + intrinsicBaseName + '%';

    if (hasOwn(INTRINSICS, intrinsicRealName)) {
      value = INTRINSICS[intrinsicRealName];
    } else if (value != null) {
      if (!(part in value)) {
        if (!allowMissing) {
          throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
        }

        return void undefined;
      }

      if ($gOPD && i + 1 >= parts.length) {
        var desc = $gOPD(value, part);
        isOwn = !!desc; // By convention, when a data property is converted to an accessor
        // property to emulate a data property that does not suffer from
        // the override mistake, that accessor's getter is marked with
        // an `originalValue` property. Here, when we detect this, we
        // uphold the illusion by pretending to see that original data
        // property, i.e., returning the value rather than the getter
        // itself.

        if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
          value = desc.get;
        } else {
          value = value[part];
        }
      } else {
        isOwn = hasOwn(value, part);
        value = value[part];
      }

      if (isOwn && !skipFurtherCaching) {
        INTRINSICS[intrinsicRealName] = value;
      }
    }
  }

  return value;
};

/***/ }),

/***/ "./node_modules/has-symbols/index.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var origSymbol = typeof Symbol !== 'undefined' && Symbol;

var hasSymbolSham = __webpack_require__(/*! ./shams */ "./node_modules/has-symbols/shams.js");

module.exports = function hasNativeSymbols() {
  if (typeof origSymbol !== 'function') {
    return false;
  }

  if (typeof Symbol !== 'function') {
    return false;
  }

  if (typeof origSymbol('foo') !== 'symbol') {
    return false;
  }

  if (typeof Symbol('bar') !== 'symbol') {
    return false;
  }

  return hasSymbolSham();
};

/***/ }),

/***/ "./node_modules/has-symbols/shams.js":
/*!*******************************************!*\
  !*** ./node_modules/has-symbols/shams.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* eslint complexity: [2, 18], max-statements: [2, 33] */

module.exports = function hasSymbols() {
  if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') {
    return false;
  }

  if (typeof Symbol.iterator === 'symbol') {
    return true;
  }

  var obj = {};
  var sym = Symbol('test');
  var symObj = Object(sym);

  if (typeof sym === 'string') {
    return false;
  }

  if (Object.prototype.toString.call(sym) !== '[object Symbol]') {
    return false;
  }

  if (Object.prototype.toString.call(symObj) !== '[object Symbol]') {
    return false;
  } // temp disabled per https://github.com/ljharb/object.assign/issues/17
  // if (sym instanceof Symbol) { return false; }
  // temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
  // if (!(symObj instanceof Symbol)) { return false; }
  // if (typeof Symbol.prototype.toString !== 'function') { return false; }
  // if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }


  var symVal = 42;
  obj[sym] = symVal;

  for (sym in obj) {
    return false;
  } // eslint-disable-line no-restricted-syntax, no-unreachable-loop


  if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) {
    return false;
  }

  if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) {
    return false;
  }

  var syms = Object.getOwnPropertySymbols(obj);

  if (syms.length !== 1 || syms[0] !== sym) {
    return false;
  }

  if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
    return false;
  }

  if (typeof Object.getOwnPropertyDescriptor === 'function') {
    var descriptor = Object.getOwnPropertyDescriptor(obj, sym);

    if (descriptor.value !== symVal || descriptor.enumerable !== true) {
      return false;
    }
  }

  return true;
};

/***/ }),

/***/ "./node_modules/has/src/index.js":
/*!***************************************!*\
  !*** ./node_modules/has/src/index.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bind = __webpack_require__(/*! function-bind */ "./node_modules/function-bind/index.js");

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

/***/ }),

/***/ "./node_modules/lodash.defaults/index.js":
/*!***********************************************!*\
  !*** ./node_modules/lodash.defaults/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;
/** `Object#toString` result references. */

var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';
/** Used to detect unsigned integer values. */

var reIsUint = /^(?:0|[1-9]\d*)$/;
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */

function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);

    case 1:
      return func.call(thisArg, args[0]);

    case 2:
      return func.call(thisArg, args[0], args[1]);

    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }

  return func.apply(thisArg, args);
}
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */


function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }

  return result;
}
/** Used for built-in method references. */


var objectProto = Object.prototype;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var objectToString = objectProto.toString;
/** Built-in value references. */

var propertyIsEnumerable = objectProto.propertyIsEnumerable;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeMax = Math.max;
/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */

function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }

  return result;
}
/**
 * Used by `_.defaults` to customize its `_.assignIn` use.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to assign.
 * @param {Object} object The parent object of `objValue`.
 * @returns {*} Returns the value to assign.
 */


function assignInDefaults(objValue, srcValue, key, object) {
  if (objValue === undefined || eq(objValue, objectProto[key]) && !hasOwnProperty.call(object, key)) {
    return srcValue;
  }

  return objValue;
}
/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function assignValue(object, key, value) {
  var objValue = object[key];

  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    object[key] = value;
  }
}
/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */


function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }

  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }

  return result;
}
/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */


function baseRest(func, start) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }

    index = -1;
    var otherArgs = Array(start + 1);

    while (++index < start) {
      otherArgs[index] = args[index];
    }

    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */


function copyObject(source, props, object, customizer) {
  object || (object = {});
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }

  return object;
}
/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */


function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }

    object = Object(object);

    while (++index < length) {
      var source = sources[index];

      if (source) {
        assigner(object, source, index, customizer);
      }
    }

    return object;
  });
}
/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */


function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}
/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */


function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }

  var type = typeof index;

  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }

  return false;
}
/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */


function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
  return value === proto;
}
/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */


function nativeKeysIn(object) {
  var result = [];

  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }

  return result;
}
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */


function eq(value, other) {
  return value === other || value !== value && other !== other;
}
/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */


function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */


var isArray = Array.isArray;
/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */


function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */


function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}
/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */


function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */


function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */


function isObjectLike(value) {
  return !!value && typeof value == 'object';
}
/**
 * This method is like `_.assignIn` except that it accepts `customizer`
 * which is invoked to produce the assigned values. If `customizer` returns
 * `undefined`, assignment is handled by the method instead. The `customizer`
 * is invoked with five arguments: (objValue, srcValue, key, object, source).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @alias extendWith
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} [customizer] The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @see _.assignWith
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   return _.isUndefined(objValue) ? srcValue : objValue;
 * }
 *
 * var defaults = _.partialRight(_.assignInWith, customizer);
 *
 * defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */


var assignInWith = createAssigner(function (object, source, srcIndex, customizer) {
  copyObject(source, keysIn(source), object, customizer);
});
/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */

var defaults = baseRest(function (args) {
  args.push(undefined, assignInDefaults);
  return apply(assignInWith, undefined, args);
});
/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */

function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}

module.exports = defaults;

/***/ }),

/***/ "./node_modules/lodash.defaultsdeep/index.js":
/*!***************************************************!*\
  !*** ./node_modules/lodash.defaultsdeep/index.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * Lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;
/** Used to stand-in for `undefined` hash values. */

var HASH_UNDEFINED = '__lodash_hash_undefined__';
/** Used to detect hot functions by number of calls within a span of milliseconds. */

var HOT_COUNT = 800,
    HOT_SPAN = 16;
/** Used as references for various `Number` constants. */

var MAX_SAFE_INTEGER = 9007199254740991;
/** `Object#toString` result references. */

var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    asyncTag = '[object AsyncFunction]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    nullTag = '[object Null]',
    objectTag = '[object Object]',
    proxyTag = '[object Proxy]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    undefinedTag = '[object Undefined]',
    weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
/** Used to detect host constructors (Safari). */

var reIsHostCtor = /^\[object .+?Constructor\]$/;
/** Used to detect unsigned integer values. */

var reIsUint = /^(?:0|[1-9]\d*)$/;
/** Used to identify `toStringTag` values of typed arrays. */

var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
/** Detect free variable `global` from Node.js. */

var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
/** Detect free variable `self`. */

var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
/** Used as a reference to the global object. */

var root = freeGlobal || freeSelf || Function('return this')();
/** Detect free variable `exports`. */

var freeExports =  true && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Detect free variable `process` from Node.js. */

var freeProcess = moduleExports && freeGlobal.process;
/** Used to access faster Node.js helpers. */

var nodeUtil = function () {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    } // Legacy `process.binding('util')` for Node.js < 10.


    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}();
/* Node.js helper references. */


var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */

function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);

    case 1:
      return func.call(thisArg, args[0]);

    case 2:
      return func.call(thisArg, args[0], args[1]);

    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }

  return func.apply(thisArg, args);
}
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */


function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }

  return result;
}
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */


function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */


function getValue(object, key) {
  return object == null ? undefined : object[key];
}
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */


function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}
/** Used for built-in method references. */


var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;
/** Used to detect overreaching core-js shims. */

var coreJsData = root['__core-js_shared__'];
/** Used to resolve the decompiled source of functions. */

var funcToString = funcProto.toString;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/** Used to detect methods masquerading as native. */

var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */


var nativeObjectToString = objectProto.toString;
/** Used to infer the `Object` constructor. */

var objectCtorString = funcToString.call(Object);
/** Used to detect if a method is native. */

var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
/** Built-in value references. */

var Buffer = moduleExports ? root.Buffer : undefined,
    Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined,
    getPrototype = overArg(Object.getPrototypeOf, Object),
    objectCreate = Object.create,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice,
    symToStringTag = Symbol ? Symbol.toStringTag : undefined;

var defineProperty = function () {
  try {
    var func = getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}();
/* Built-in method references for those with the same name as other `lodash` methods. */


var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
    nativeMax = Math.max,
    nativeNow = Date.now;
/* Built-in method references that are verified to be native. */

var Map = getNative(root, 'Map'),
    nativeCreate = getNative(Object, 'create');
/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */

var baseCreate = function () {
  function object() {}

  return function (proto) {
    if (!isObject(proto)) {
      return {};
    }

    if (objectCreate) {
      return objectCreate(proto);
    }

    object.prototype = proto;
    var result = new object();
    object.prototype = undefined;
    return result;
  };
}();
/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */


function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */


function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function hashGet(key) {
  var data = this.__data__;

  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }

  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}
/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}
/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */


function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
} // Add methods to `Hash`.


Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */

function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */


function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }

  var lastIndex = data.length - 1;

  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }

  --this.size;
  return true;
}
/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}
/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */


function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }

  return this;
} // Add methods to `ListCache`.


ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */

function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */


function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}
/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}
/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */


function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
} // Add methods to `MapCache`.


MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */

function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */


function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);
  this.size = data.size;
  return result;
}
/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function stackGet(key) {
  return this.__data__.get(key);
}
/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function stackHas(key) {
  return this.__data__.has(key);
}
/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */


function stackSet(key, value) {
  var data = this.__data__;

  if (data instanceof ListCache) {
    var pairs = data.__data__;

    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }

    data = this.__data__ = new MapCache(pairs);
  }

  data.set(key, value);
  this.size = data.size;
  return this;
} // Add methods to `Stack`.


Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */

function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && ( // Safari 9 has enumerable `arguments.length` in strict mode.
    key == 'length' || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == 'offset' || key == 'parent') || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }

  return result;
}
/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function assignMergeValue(object, key, value) {
  if (value !== undefined && !eq(object[key], value) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}
/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function assignValue(object, key, value) {
  var objValue = object[key];

  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === undefined && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}
/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function assocIndexOf(array, key) {
  var length = array.length;

  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }

  return -1;
}
/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */


function baseAssignValue(object, key, value) {
  if (key == '__proto__' && defineProperty) {
    defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}
/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */


var baseFor = createBaseFor();
/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */

function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }

  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */


function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}
/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */


function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }

  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */


function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */


function baseKeysIn(object) {
  if (!isObject(object)) {
    return nativeKeysIn(object);
  }

  var isProto = isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }

  return result;
}
/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */


function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }

  baseFor(source, function (srcValue, key) {
    stack || (stack = new Stack());

    if (isObject(srcValue)) {
      baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    } else {
      var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + '', object, source, stack) : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }

      assignMergeValue(object, key, newValue);
    }
  }, keysIn);
}
/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */


function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = safeGet(object, key),
      srcValue = safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    assignMergeValue(object, key, stacked);
    return;
  }

  var newValue = customizer ? customizer(objValue, srcValue, key + '', object, source, stack) : undefined;
  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray(srcValue),
        isBuff = !isArr && isBuffer(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray(srcValue);
    newValue = srcValue;

    if (isArr || isBuff || isTyped) {
      if (isArray(objValue)) {
        newValue = objValue;
      } else if (isArrayLikeObject(objValue)) {
        newValue = copyArray(objValue);
      } else if (isBuff) {
        isCommon = false;
        newValue = cloneBuffer(srcValue, true);
      } else if (isTyped) {
        isCommon = false;
        newValue = cloneTypedArray(srcValue, true);
      } else {
        newValue = [];
      }
    } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
      newValue = objValue;

      if (isArguments(objValue)) {
        newValue = toPlainObject(objValue);
      } else if (!isObject(objValue) || isFunction(objValue)) {
        newValue = initCloneObject(srcValue);
      }
    } else {
      isCommon = false;
    }
  }

  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }

  assignMergeValue(object, key, newValue);
}
/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */


function baseRest(func, start) {
  return setToString(overRest(func, start, identity), func + '');
}
/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var baseSetToString = !defineProperty ? identity : function (func, string) {
  return defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant(string),
    'writable': true
  });
};
/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */

function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }

  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
  buffer.copy(result);
  return result;
}
/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */


function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
  return result;
}
/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */


function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */


function copyArray(source, array) {
  var index = -1,
      length = source.length;
  array || (array = Array(length));

  while (++index < length) {
    array[index] = source[index];
  }

  return array;
}
/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */


function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});
  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];
    var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }

    if (isNew) {
      baseAssignValue(object, key, newValue);
    } else {
      assignValue(object, key, newValue);
    }
  }

  return object;
}
/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */


function createAssigner(assigner) {
  return baseRest(function (object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;
    customizer = assigner.length > 3 && typeof customizer == 'function' ? (length--, customizer) : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }

    object = Object(object);

    while (++index < length) {
      var source = sources[index];

      if (source) {
        assigner(object, source, index, customizer);
      }
    }

    return object;
  });
}
/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */


function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];

      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }

    return object;
  };
}
/**
 * Used by `_.defaultsDeep` to customize its `_.merge` use to merge source
 * objects into destination objects that are passed thru.
 *
 * @private
 * @param {*} objValue The destination value.
 * @param {*} srcValue The source value.
 * @param {string} key The key of the property to merge.
 * @param {Object} object The parent object of `objValue`.
 * @param {Object} source The parent object of `srcValue`.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 * @returns {*} Returns the value to assign.
 */


function customDefaultsMerge(objValue, srcValue, key, object, source, stack) {
  if (isObject(objValue) && isObject(srcValue)) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, objValue);
    baseMerge(objValue, srcValue, undefined, customDefaultsMerge, stack);
    stack['delete'](srcValue);
  }

  return objValue;
}
/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */


function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}
/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */


function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}
/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */


function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);

  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }

  return result;
}
/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */


function initCloneObject(object) {
  return typeof object.constructor == 'function' && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
}
/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */


function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (type == 'number' || type != 'symbol' && reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}
/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */


function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }

  var type = typeof index;

  if (type == 'number' ? isArrayLike(object) && isIndex(index, object.length) : type == 'string' && index in object) {
    return eq(object[index], value);
  }

  return false;
}
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */


function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}
/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */


function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */


function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
  return value === proto;
}
/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */


function nativeKeysIn(object) {
  var result = [];

  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }

  return result;
}
/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */


function objectToString(value) {
  return nativeObjectToString.call(value);
}
/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */


function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? func.length - 1 : start, 0);
  return function () {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }

    index = -1;
    var otherArgs = Array(start + 1);

    while (++index < start) {
      otherArgs[index] = args[index];
    }

    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}
/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */


function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}
/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */


var setToString = shortOut(baseSetToString);
/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */

function shortOut(func) {
  var count = 0,
      lastCalled = 0;
  return function () {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;

    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }

    return func.apply(undefined, arguments);
  };
}
/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */


function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}

    try {
      return func + '';
    } catch (e) {}
  }

  return '';
}
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */


function eq(value, other) {
  return value === other || value !== value && other !== other;
}
/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */


var isArguments = baseIsArguments(function () {
  return arguments;
}()) ? baseIsArguments : function (value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
};
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */

var isArray = Array.isArray;
/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */


function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}
/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */


var isBuffer = nativeIsBuffer || stubFalse;
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  } // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.


  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */


function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */


function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */


function isObjectLike(value) {
  return value != null && typeof value == 'object';
}
/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */


function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }

  var proto = getPrototype(value);

  if (proto === null) {
    return true;
  }

  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */


var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */

function toPlainObject(value) {
  return copyObject(value, keysIn(value));
}
/**
 * This method is like `_.defaults` except that it recursively assigns
 * default properties.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 3.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaults
 * @example
 *
 * _.defaultsDeep({ 'a': { 'b': 2 } }, { 'a': { 'b': 1, 'c': 3 } });
 * // => { 'a': { 'b': 2, 'c': 3 } }
 */


var defaultsDeep = baseRest(function (args) {
  args.push(undefined, customDefaultsMerge);
  return apply(mergeWith, undefined, args);
});
/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */

function keysIn(object) {
  return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
}
/**
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */


var mergeWith = createAssigner(function (object, source, srcIndex, customizer) {
  baseMerge(object, source, srcIndex, customizer);
});
/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */

function constant(value) {
  return function () {
    return value;
  };
}
/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */


function identity(value) {
  return value;
}
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */


function stubFalse() {
  return false;
}

module.exports = defaultsDeep;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/lodash.mapvalues/index.js":
/*!************************************************!*\
  !*** ./node_modules/lodash.mapvalues/index.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, module) {/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;
/** Used as the `TypeError` message for "Functions" methods. */

var FUNC_ERROR_TEXT = 'Expected a function';
/** Used to stand-in for `undefined` hash values. */

var HASH_UNDEFINED = '__lodash_hash_undefined__';
/** Used to compose bitmasks for comparison styles. */

var UNORDERED_COMPARE_FLAG = 1,
    PARTIAL_COMPARE_FLAG = 2;
/** Used as references for various `Number` constants. */

var INFINITY = 1 / 0,
    MAX_SAFE_INTEGER = 9007199254740991;
/** `Object#toString` result references. */

var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';
var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';
/** Used to match property names within property paths. */

var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/,
    reLeadingDot = /^\./,
    rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */

var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
/** Used to match backslashes in property paths. */

var reEscapeChar = /\\(\\)?/g;
/** Used to detect host constructors (Safari). */

var reIsHostCtor = /^\[object .+?Constructor\]$/;
/** Used to detect unsigned integer values. */

var reIsUint = /^(?:0|[1-9]\d*)$/;
/** Used to identify `toStringTag` values of typed arrays. */

var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
/** Detect free variable `global` from Node.js. */

var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
/** Detect free variable `self`. */

var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
/** Used as a reference to the global object. */

var root = freeGlobal || freeSelf || Function('return this')();
/** Detect free variable `exports`. */

var freeExports =  true && exports && !exports.nodeType && exports;
/** Detect free variable `module`. */

var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
/** Detect the popular CommonJS extension `module.exports`. */

var moduleExports = freeModule && freeModule.exports === freeExports;
/** Detect free variable `process` from Node.js. */

var freeProcess = moduleExports && freeGlobal.process;
/** Used to access faster Node.js helpers. */

var nodeUtil = function () {
  try {
    return freeProcess && freeProcess.binding('util');
  } catch (e) {}
}();
/* Node.js helper references. */


var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */

function arraySome(array, predicate) {
  var index = -1,
      length = array ? array.length : 0;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }

  return false;
}
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */


function baseProperty(key) {
  return function (object) {
    return object == null ? undefined : object[key];
  };
}
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */


function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }

  return result;
}
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */


function baseUnary(func) {
  return function (value) {
    return func(value);
  };
}
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */


function getValue(object, key) {
  return object == null ? undefined : object[key];
}
/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */


function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;

  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }

  return result;
}
/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */


function mapToArray(map) {
  var index = -1,
      result = Array(map.size);
  map.forEach(function (value, key) {
    result[++index] = [key, value];
  });
  return result;
}
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */


function overArg(func, transform) {
  return function (arg) {
    return func(transform(arg));
  };
}
/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */


function setToArray(set) {
  var index = -1,
      result = Array(set.size);
  set.forEach(function (value) {
    result[++index] = value;
  });
  return result;
}
/** Used for built-in method references. */


var arrayProto = Array.prototype,
    funcProto = Function.prototype,
    objectProto = Object.prototype;
/** Used to detect overreaching core-js shims. */

var coreJsData = root['__core-js_shared__'];
/** Used to detect methods masquerading as native. */

var maskSrcKey = function () {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? 'Symbol(src)_1.' + uid : '';
}();
/** Used to resolve the decompiled source of functions. */


var funcToString = funcProto.toString;
/** Used to check objects for own properties. */

var hasOwnProperty = objectProto.hasOwnProperty;
/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */

var objectToString = objectProto.toString;
/** Used to detect if a method is native. */

var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
/** Built-in value references. */

var Symbol = root.Symbol,
    Uint8Array = root.Uint8Array,
    propertyIsEnumerable = objectProto.propertyIsEnumerable,
    splice = arrayProto.splice;
/* Built-in method references for those with the same name as other `lodash` methods. */

var nativeKeys = overArg(Object.keys, Object);
/* Built-in method references that are verified to be native. */

var DataView = getNative(root, 'DataView'),
    Map = getNative(root, 'Map'),
    Promise = getNative(root, 'Promise'),
    Set = getNative(root, 'Set'),
    WeakMap = getNative(root, 'WeakMap'),
    nativeCreate = getNative(Object, 'create');
/** Used to detect maps, sets, and weakmaps. */

var dataViewCtorString = toSource(DataView),
    mapCtorString = toSource(Map),
    promiseCtorString = toSource(Promise),
    setCtorString = toSource(Set),
    weakMapCtorString = toSource(WeakMap);
/** Used to convert symbols to primitives and strings. */

var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;
/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */

function Hash(entries) {
  var index = -1,
      length = entries ? entries.length : 0;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */


function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
}
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function hashDelete(key) {
  return this.has(key) && delete this.__data__[key];
}
/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function hashGet(key) {
  var data = this.__data__;

  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }

  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}
/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
}
/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */


function hashSet(key, value) {
  var data = this.__data__;
  data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
  return this;
} // Add methods to `Hash`.


Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */

function ListCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */


function listCacheClear() {
  this.__data__ = [];
}
/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }

  var lastIndex = data.length - 1;

  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }

  return true;
}
/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);
  return index < 0 ? undefined : data[index][1];
}
/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */


function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }

  return this;
} // Add methods to `ListCache`.


ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */

function MapCache(entries) {
  var index = -1,
      length = entries ? entries.length : 0;
  this.clear();

  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */


function mapCacheClear() {
  this.__data__ = {
    'hash': new Hash(),
    'map': new (Map || ListCache)(),
    'string': new Hash()
  };
}
/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function mapCacheDelete(key) {
  return getMapData(this, key)['delete'](key);
}
/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */


function mapCacheSet(key, value) {
  getMapData(this, key).set(key, value);
  return this;
} // Add methods to `MapCache`.


MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */

function SetCache(values) {
  var index = -1,
      length = values ? values.length : 0;
  this.__data__ = new MapCache();

  while (++index < length) {
    this.add(values[index]);
  }
}
/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */


function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);

  return this;
}
/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */


function setCacheHas(value) {
  return this.__data__.has(value);
} // Add methods to `SetCache`.


SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */

function Stack(entries) {
  this.__data__ = new ListCache(entries);
}
/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */


function stackClear() {
  this.__data__ = new ListCache();
}
/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */


function stackDelete(key) {
  return this.__data__['delete'](key);
}
/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */


function stackGet(key) {
  return this.__data__.get(key);
}
/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */


function stackHas(key) {
  return this.__data__.has(key);
}
/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */


function stackSet(key, value) {
  var cache = this.__data__;

  if (cache instanceof ListCache) {
    var pairs = cache.__data__;

    if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      return this;
    }

    cache = this.__data__ = new MapCache(pairs);
  }

  cache.set(key, value);
  return this;
} // Add methods to `Stack`.


Stack.prototype.clear = stackClear;
Stack.prototype['delete'] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */

function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = isArray(value) || isArguments(value) ? baseTimes(value.length, String) : [];
  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }

  return result;
}
/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */


function assocIndexOf(array, key) {
  var length = array.length;

  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }

  return -1;
}
/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */


var baseFor = createBaseFor();
/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */

function baseForOwn(object, iteratee) {
  return object && baseFor(object, iteratee, keys);
}
/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */


function baseGet(object, path) {
  path = isKey(path, object) ? [path] : castPath(path);
  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }

  return index && index == length ? object : undefined;
}
/**
 * The base implementation of `getTag`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */


function baseGetTag(value) {
  return objectToString.call(value);
}
/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */


function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {boolean} [bitmask] The bitmask of comparison flags.
 *  The bitmask may be composed of the following flags:
 *     1 - Unordered comparison
 *     2 - Partial comparison
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */


function baseIsEqual(value, other, customizer, bitmask, stack) {
  if (value === other) {
    return true;
  }

  if (value == null || other == null || !isObject(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }

  return baseIsEqualDeep(value, other, baseIsEqual, customizer, bitmask, stack);
}
/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {number} [bitmask] The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */


function baseIsEqualDeep(object, other, equalFunc, customizer, bitmask, stack) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = getTag(object);
    objTag = objTag == argsTag ? objectTag : objTag;
  }

  if (!othIsArr) {
    othTag = getTag(other);
    othTag = othTag == argsTag ? objectTag : othTag;
  }

  var objIsObj = objTag == objectTag && !isHostObject(object),
      othIsObj = othTag == objectTag && !isHostObject(other),
      isSameTag = objTag == othTag;

  if (isSameTag && !objIsObj) {
    stack || (stack = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, equalFunc, customizer, bitmask, stack) : equalByTag(object, other, objTag, equalFunc, customizer, bitmask, stack);
  }

  if (!(bitmask & PARTIAL_COMPARE_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;
      stack || (stack = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, customizer, bitmask, stack);
    }
  }

  if (!isSameTag) {
    return false;
  }

  stack || (stack = new Stack());
  return equalObjects(object, other, equalFunc, customizer, bitmask, stack);
}
/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */


function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }

  object = Object(object);

  while (index--) {
    var data = matchData[index];

    if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
      return false;
    }
  }

  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new Stack();

      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }

      if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG, stack) : result)) {
        return false;
      }
    }
  }

  return true;
}
/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */


function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }

  var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */


function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}
/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */


function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }

  if (value == null) {
    return identity;
  }

  if (typeof value == 'object') {
    return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
  }

  return property(value);
}
/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */


function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }

  var result = [];

  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }

  return result;
}
/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */


function baseMatches(source) {
  var matchData = getMatchData(source);

  if (matchData.length == 1 && matchData[0][2]) {
    return matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }

  return function (object) {
    return object === source || baseIsMatch(object, source, matchData);
  };
}
/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */


function baseMatchesProperty(path, srcValue) {
  if (isKey(path) && isStrictComparable(srcValue)) {
    return matchesStrictComparable(toKey(path), srcValue);
  }

  return function (object) {
    var objValue = get(object, path);
    return objValue === undefined && objValue === srcValue ? hasIn(object, path) : baseIsEqual(srcValue, objValue, undefined, UNORDERED_COMPARE_FLAG | PARTIAL_COMPARE_FLAG);
  };
}
/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */


function basePropertyDeep(path) {
  return function (object) {
    return baseGet(object, path);
  };
}
/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */


function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }

  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}
/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Array} Returns the cast property path array.
 */


function castPath(value) {
  return isArray(value) ? value : stringToPath(value);
}
/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */


function createBaseFor(fromRight) {
  return function (object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];

      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }

    return object;
  };
}
/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */


function equalArrays(array, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  } // Assume cyclic values are equal.


  var stacked = stack.get(array);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var index = -1,
      result = true,
      seen = bitmask & UNORDERED_COMPARE_FLAG ? new SetCache() : undefined;
  stack.set(array, other);
  stack.set(other, array); // Ignore non-index properties.

  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
    }

    if (compared !== undefined) {
      if (compared) {
        continue;
      }

      result = false;
      break;
    } // Recursively compare arrays (susceptible to call stack limits).


    if (seen) {
      if (!arraySome(other, function (othValue, othIndex) {
        if (!seen.has(othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
          return seen.add(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, bitmask, stack))) {
      result = false;
      break;
    }
  }

  stack['delete'](array);
  stack['delete'](other);
  return result;
}
/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */


function equalByTag(object, other, tag, equalFunc, customizer, bitmask, stack) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }

      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }

      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return eq(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == other + '';

    case mapTag:
      var convert = mapToArray;

    case setTag:
      var isPartial = bitmask & PARTIAL_COMPARE_FLAG;
      convert || (convert = setToArray);

      if (object.size != other.size && !isPartial) {
        return false;
      } // Assume cyclic values are equal.


      var stacked = stack.get(object);

      if (stacked) {
        return stacked == other;
      }

      bitmask |= UNORDERED_COMPARE_FLAG; // Recursively compare objects (susceptible to call stack limits).

      stack.set(object, other);
      var result = equalArrays(convert(object), convert(other), equalFunc, customizer, bitmask, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }

  }

  return false;
}
/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} customizer The function to customize comparisons.
 * @param {number} bitmask The bitmask of comparison flags. See `baseIsEqual`
 *  for more details.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */


function equalObjects(object, other, equalFunc, customizer, bitmask, stack) {
  var isPartial = bitmask & PARTIAL_COMPARE_FLAG,
      objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }

  var index = objLength;

  while (index--) {
    var key = objProps[index];

    if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  } // Assume cyclic values are equal.


  var stacked = stack.get(object);

  if (stacked && stack.get(other)) {
    return stacked == other;
  }

  var result = true;
  stack.set(object, other);
  stack.set(other, object);
  var skipCtor = isPartial;

  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
    } // Recursively compare objects (susceptible to call stack limits).


    if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, customizer, bitmask, stack) : compared)) {
      result = false;
      break;
    }

    skipCtor || (skipCtor = key == 'constructor');
  }

  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor; // Non `Object` object instances with different constructors are not equal.

    if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }

  stack['delete'](object);
  stack['delete'](other);
  return result;
}
/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */


function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
}
/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */


function getMatchData(object) {
  var result = keys(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];
    result[length] = [key, value, isStrictComparable(value)];
  }

  return result;
}
/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */


function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}
/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */


var getTag = baseGetTag; // Fallback for data views, maps, sets, and weak maps in IE 11,
// for data views in Edge < 14, and promises in Node.js.

if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
  getTag = function (value) {
    var result = objectToString.call(value),
        Ctor = result == objectTag ? value.constructor : undefined,
        ctorString = Ctor ? toSource(Ctor) : undefined;

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag;

        case mapCtorString:
          return mapTag;

        case promiseCtorString:
          return promiseTag;

        case setCtorString:
          return setTag;

        case weakMapCtorString:
          return weakMapTag;
      }
    }

    return result;
  };
}
/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */


function hasPath(object, path, hasFunc) {
  path = isKey(path, object) ? [path] : castPath(path);
  var result,
      index = -1,
      length = path.length;

  while (++index < length) {
    var key = toKey(path[index]);

    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }

    object = object[key];
  }

  if (result) {
    return result;
  }

  var length = object ? object.length : 0;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}
/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */


function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
}
/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */


function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }

  var type = typeof value;

  if (type == 'number' || type == 'symbol' || type == 'boolean' || value == null || isSymbol(value)) {
    return true;
  }

  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */


function isKeyable(value) {
  var type = typeof value;
  return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
}
/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */


function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */


function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;
  return value === proto;
}
/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */


function isStrictComparable(value) {
  return value === value && !isObject(value);
}
/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */


function matchesStrictComparable(key, srcValue) {
  return function (object) {
    if (object == null) {
      return false;
    }

    return object[key] === srcValue && (srcValue !== undefined || key in Object(object));
  };
}
/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */


var stringToPath = memoize(function (string) {
  string = toString(string);
  var result = [];

  if (reLeadingDot.test(string)) {
    result.push('');
  }

  string.replace(rePropName, function (match, number, quote, string) {
    result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
  });
  return result;
});
/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */

function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }

  var result = value + '';
  return result == '0' && 1 / value == -INFINITY ? '-0' : result;
}
/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to process.
 * @returns {string} Returns the source code.
 */


function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}

    try {
      return func + '';
    } catch (e) {}
  }

  return '';
}
/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */


function memoize(func, resolver) {
  if (typeof func != 'function' || resolver && typeof resolver != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }

  var memoized = function () {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }

    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result);
    return result;
  };

  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
} // Assign cache to `_.memoize`.


memoize.Cache = MapCache;
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */

function eq(value, other) {
  return value === other || value !== value && other !== other;
}
/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */


function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') && (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */


var isArray = Array.isArray;
/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */

function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */


function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}
/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */


function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}
/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */


function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */


function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */


function isObjectLike(value) {
  return !!value && typeof value == 'object';
}
/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */


function isSymbol(value) {
  return typeof value == 'symbol' || isObjectLike(value) && objectToString.call(value) == symbolTag;
}
/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */


var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */

function toString(value) {
  return value == null ? '' : baseToString(value);
}
/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */


function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}
/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */


function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}
/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */


function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see _.mapKeys
 * @example
 *
 * var users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * };
 *
 * _.mapValues(users, function(o) { return o.age; });
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 *
 * // The `_.property` iteratee shorthand.
 * _.mapValues(users, 'age');
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */


function mapValues(object, iteratee) {
  var result = {};
  iteratee = baseIteratee(iteratee, 3);
  baseForOwn(object, function (value, key, object) {
    result[key] = iteratee(value, key, object);
  });
  return result;
}
/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */


function identity(value) {
  return value;
}
/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */


function property(path) {
  return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
}

module.exports = mapValues;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js"), __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/object-inspect/index.js":
/*!**********************************************!*\
  !*** ./node_modules/object-inspect/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var match = String.prototype.match;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
var isEnumerable = Object.prototype.propertyIsEnumerable;
var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype // eslint-disable-line no-proto
? function (O) {
  return O.__proto__; // eslint-disable-line no-proto
} : null);

var inspectCustom = __webpack_require__(/*! ./util.inspect */ 0).custom;

var inspectSymbol = inspectCustom && isSymbol(inspectCustom) ? inspectCustom : null;
var toStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag !== 'undefined' ? Symbol.toStringTag : null;

module.exports = function inspect_(obj, options, depth, seen) {
  var opts = options || {};

  if (has(opts, 'quoteStyle') && opts.quoteStyle !== 'single' && opts.quoteStyle !== 'double') {
    throw new TypeError('option "quoteStyle" must be "single" or "double"');
  }

  if (has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number' ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
    throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
  }

  var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;

  if (typeof customInspect !== 'boolean') {
    throw new TypeError('option "customInspect", if provided, must be `true` or `false`');
  }

  if (has(opts, 'indent') && opts.indent !== null && opts.indent !== '\t' && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
    throw new TypeError('options "indent" must be "\\t", an integer > 0, or `null`');
  }

  if (typeof obj === 'undefined') {
    return 'undefined';
  }

  if (obj === null) {
    return 'null';
  }

  if (typeof obj === 'boolean') {
    return obj ? 'true' : 'false';
  }

  if (typeof obj === 'string') {
    return inspectString(obj, opts);
  }

  if (typeof obj === 'number') {
    if (obj === 0) {
      return Infinity / obj > 0 ? '0' : '-0';
    }

    return String(obj);
  }

  if (typeof obj === 'bigint') {
    return String(obj) + 'n';
  }

  var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;

  if (typeof depth === 'undefined') {
    depth = 0;
  }

  if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
    return isArray(obj) ? '[Array]' : '[Object]';
  }

  var indent = getIndent(opts, depth);

  if (typeof seen === 'undefined') {
    seen = [];
  } else if (indexOf(seen, obj) >= 0) {
    return '[Circular]';
  }

  function inspect(value, from, noIndent) {
    if (from) {
      seen = seen.slice();
      seen.push(from);
    }

    if (noIndent) {
      var newOpts = {
        depth: opts.depth
      };

      if (has(opts, 'quoteStyle')) {
        newOpts.quoteStyle = opts.quoteStyle;
      }

      return inspect_(value, newOpts, depth + 1, seen);
    }

    return inspect_(value, opts, depth + 1, seen);
  }

  if (typeof obj === 'function') {
    var name = nameOf(obj);
    var keys = arrObjKeys(obj, inspect);
    return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + keys.join(', ') + ' }' : '');
  }

  if (isSymbol(obj)) {
    var symString = hasShammedSymbols ? String(obj).replace(/^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
    return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
  }

  if (isElement(obj)) {
    var s = '<' + String(obj.nodeName).toLowerCase();
    var attrs = obj.attributes || [];

    for (var i = 0; i < attrs.length; i++) {
      s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
    }

    s += '>';

    if (obj.childNodes && obj.childNodes.length) {
      s += '...';
    }

    s += '</' + String(obj.nodeName).toLowerCase() + '>';
    return s;
  }

  if (isArray(obj)) {
    if (obj.length === 0) {
      return '[]';
    }

    var xs = arrObjKeys(obj, inspect);

    if (indent && !singleLineValues(xs)) {
      return '[' + indentedJoin(xs, indent) + ']';
    }

    return '[ ' + xs.join(', ') + ' ]';
  }

  if (isError(obj)) {
    var parts = arrObjKeys(obj, inspect);

    if (parts.length === 0) {
      return '[' + String(obj) + ']';
    }

    return '{ [' + String(obj) + '] ' + parts.join(', ') + ' }';
  }

  if (typeof obj === 'object' && customInspect) {
    if (inspectSymbol && typeof obj[inspectSymbol] === 'function') {
      return obj[inspectSymbol]();
    } else if (typeof obj.inspect === 'function') {
      return obj.inspect();
    }
  }

  if (isMap(obj)) {
    var mapParts = [];
    mapForEach.call(obj, function (value, key) {
      mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
    });
    return collectionOf('Map', mapSize.call(obj), mapParts, indent);
  }

  if (isSet(obj)) {
    var setParts = [];
    setForEach.call(obj, function (value) {
      setParts.push(inspect(value, obj));
    });
    return collectionOf('Set', setSize.call(obj), setParts, indent);
  }

  if (isWeakMap(obj)) {
    return weakCollectionOf('WeakMap');
  }

  if (isWeakSet(obj)) {
    return weakCollectionOf('WeakSet');
  }

  if (isWeakRef(obj)) {
    return weakCollectionOf('WeakRef');
  }

  if (isNumber(obj)) {
    return markBoxed(inspect(Number(obj)));
  }

  if (isBigInt(obj)) {
    return markBoxed(inspect(bigIntValueOf.call(obj)));
  }

  if (isBoolean(obj)) {
    return markBoxed(booleanValueOf.call(obj));
  }

  if (isString(obj)) {
    return markBoxed(inspect(String(obj)));
  }

  if (!isDate(obj) && !isRegExp(obj)) {
    var ys = arrObjKeys(obj, inspect);
    var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
    var protoTag = obj instanceof Object ? '' : 'null prototype';
    var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? toStr(obj).slice(8, -1) : protoTag ? 'Object' : '';
    var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
    var tag = constructorTag + (stringTag || protoTag ? '[' + [].concat(stringTag || [], protoTag || []).join(': ') + '] ' : '');

    if (ys.length === 0) {
      return tag + '{}';
    }

    if (indent) {
      return tag + '{' + indentedJoin(ys, indent) + '}';
    }

    return tag + '{ ' + ys.join(', ') + ' }';
  }

  return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
  var quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : "'";
  return quoteChar + s + quoteChar;
}

function quote(s) {
  return String(s).replace(/"/g, '&quot;');
}

function isArray(obj) {
  return toStr(obj) === '[object Array]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}

function isDate(obj) {
  return toStr(obj) === '[object Date]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}

function isRegExp(obj) {
  return toStr(obj) === '[object RegExp]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}

function isError(obj) {
  return toStr(obj) === '[object Error]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}

function isString(obj) {
  return toStr(obj) === '[object String]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}

function isNumber(obj) {
  return toStr(obj) === '[object Number]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
}

function isBoolean(obj) {
  return toStr(obj) === '[object Boolean]' && (!toStringTag || !(typeof obj === 'object' && toStringTag in obj));
} // Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives


function isSymbol(obj) {
  if (hasShammedSymbols) {
    return obj && typeof obj === 'object' && obj instanceof Symbol;
  }

  if (typeof obj === 'symbol') {
    return true;
  }

  if (!obj || typeof obj !== 'object' || !symToString) {
    return false;
  }

  try {
    symToString.call(obj);
    return true;
  } catch (e) {}

  return false;
}

function isBigInt(obj) {
  if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
    return false;
  }

  try {
    bigIntValueOf.call(obj);
    return true;
  } catch (e) {}

  return false;
}

var hasOwn = Object.prototype.hasOwnProperty || function (key) {
  return key in this;
};

function has(obj, key) {
  return hasOwn.call(obj, key);
}

function toStr(obj) {
  return objectToString.call(obj);
}

function nameOf(f) {
  if (f.name) {
    return f.name;
  }

  var m = match.call(functionToString.call(f), /^function\s*([\w$]+)/);

  if (m) {
    return m[1];
  }

  return null;
}

function indexOf(xs, x) {
  if (xs.indexOf) {
    return xs.indexOf(x);
  }

  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) {
      return i;
    }
  }

  return -1;
}

function isMap(x) {
  if (!mapSize || !x || typeof x !== 'object') {
    return false;
  }

  try {
    mapSize.call(x);

    try {
      setSize.call(x);
    } catch (s) {
      return true;
    }

    return x instanceof Map; // core-js workaround, pre-v2.5.0
  } catch (e) {}

  return false;
}

function isWeakMap(x) {
  if (!weakMapHas || !x || typeof x !== 'object') {
    return false;
  }

  try {
    weakMapHas.call(x, weakMapHas);

    try {
      weakSetHas.call(x, weakSetHas);
    } catch (s) {
      return true;
    }

    return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
  } catch (e) {}

  return false;
}

function isWeakRef(x) {
  if (!weakRefDeref || !x || typeof x !== 'object') {
    return false;
  }

  try {
    weakRefDeref.call(x);
    return true;
  } catch (e) {}

  return false;
}

function isSet(x) {
  if (!setSize || !x || typeof x !== 'object') {
    return false;
  }

  try {
    setSize.call(x);

    try {
      mapSize.call(x);
    } catch (m) {
      return true;
    }

    return x instanceof Set; // core-js workaround, pre-v2.5.0
  } catch (e) {}

  return false;
}

function isWeakSet(x) {
  if (!weakSetHas || !x || typeof x !== 'object') {
    return false;
  }

  try {
    weakSetHas.call(x, weakSetHas);

    try {
      weakMapHas.call(x, weakMapHas);
    } catch (s) {
      return true;
    }

    return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
  } catch (e) {}

  return false;
}

function isElement(x) {
  if (!x || typeof x !== 'object') {
    return false;
  }

  if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
    return true;
  }

  return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
  if (str.length > opts.maxStringLength) {
    var remaining = str.length - opts.maxStringLength;
    var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
    return inspectString(str.slice(0, opts.maxStringLength), opts) + trailer;
  } // eslint-disable-next-line no-control-regex


  var s = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
  return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
  var n = c.charCodeAt(0);
  var x = {
    8: 'b',
    9: 't',
    10: 'n',
    12: 'f',
    13: 'r'
  }[n];

  if (x) {
    return '\\' + x;
  }

  return '\\x' + (n < 0x10 ? '0' : '') + n.toString(16).toUpperCase();
}

function markBoxed(str) {
  return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
  return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
  var joinedEntries = indent ? indentedJoin(entries, indent) : entries.join(', ');
  return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
  for (var i = 0; i < xs.length; i++) {
    if (indexOf(xs[i], '\n') >= 0) {
      return false;
    }
  }

  return true;
}

function getIndent(opts, depth) {
  var baseIndent;

  if (opts.indent === '\t') {
    baseIndent = '\t';
  } else if (typeof opts.indent === 'number' && opts.indent > 0) {
    baseIndent = Array(opts.indent + 1).join(' ');
  } else {
    return null;
  }

  return {
    base: baseIndent,
    prev: Array(depth + 1).join(baseIndent)
  };
}

function indentedJoin(xs, indent) {
  if (xs.length === 0) {
    return '';
  }

  var lineJoiner = '\n' + indent.prev + indent.base;
  return lineJoiner + xs.join(',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
  var isArr = isArray(obj);
  var xs = [];

  if (isArr) {
    xs.length = obj.length;

    for (var i = 0; i < obj.length; i++) {
      xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
    }
  }

  var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
  var symMap;

  if (hasShammedSymbols) {
    symMap = {};

    for (var k = 0; k < syms.length; k++) {
      symMap['$' + syms[k]] = syms[k];
    }
  }

  for (var key in obj) {
    // eslint-disable-line no-restricted-syntax
    if (!has(obj, key)) {
      continue;
    } // eslint-disable-line no-restricted-syntax, no-continue


    if (isArr && String(Number(key)) === key && key < obj.length) {
      continue;
    } // eslint-disable-line no-restricted-syntax, no-continue


    if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
      // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
      continue; // eslint-disable-line no-restricted-syntax, no-continue
    } else if (/[^\w$]/.test(key)) {
      xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
    } else {
      xs.push(key + ': ' + inspect(obj[key], obj));
    }
  }

  if (typeof gOPS === 'function') {
    for (var j = 0; j < syms.length; j++) {
      if (isEnumerable.call(obj, syms[j])) {
        xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
      }
    }
  }

  return xs;
}

/***/ }),

/***/ "./node_modules/qs/lib/formats.js":
/*!****************************************!*\
  !*** ./node_modules/qs/lib/formats.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var replace = String.prototype.replace;
var percentTwenties = /%20/g;
var Format = {
  RFC1738: 'RFC1738',
  RFC3986: 'RFC3986'
};
module.exports = {
  'default': Format.RFC3986,
  formatters: {
    RFC1738: function (value) {
      return replace.call(value, percentTwenties, '+');
    },
    RFC3986: function (value) {
      return String(value);
    }
  },
  RFC1738: Format.RFC1738,
  RFC3986: Format.RFC3986
};

/***/ }),

/***/ "./node_modules/qs/lib/index.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var stringify = __webpack_require__(/*! ./stringify */ "./node_modules/qs/lib/stringify.js");

var parse = __webpack_require__(/*! ./parse */ "./node_modules/qs/lib/parse.js");

var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");

module.exports = {
  formats: formats,
  parse: parse,
  stringify: stringify
};

/***/ }),

/***/ "./node_modules/qs/lib/parse.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/parse.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var utils = __webpack_require__(/*! ./utils */ "./node_modules/qs/lib/utils.js");

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;
var defaults = {
  allowDots: false,
  allowPrototypes: false,
  allowSparse: false,
  arrayLimit: 20,
  charset: 'utf-8',
  charsetSentinel: false,
  comma: false,
  decoder: utils.decode,
  delimiter: '&',
  depth: 5,
  ignoreQueryPrefix: false,
  interpretNumericEntities: false,
  parameterLimit: 1000,
  parseArrays: true,
  plainObjects: false,
  strictNullHandling: false
};

var interpretNumericEntities = function (str) {
  return str.replace(/&#(\d+);/g, function ($0, numberStr) {
    return String.fromCharCode(parseInt(numberStr, 10));
  });
};

var parseArrayValue = function (val, options) {
  if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
    return val.split(',');
  }

  return val;
}; // This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.


var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')
// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.

var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
  var obj = {};
  var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
  var limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
  var parts = cleanStr.split(options.delimiter, limit);
  var skipIndex = -1; // Keep track of where the utf8 sentinel was found

  var i;
  var charset = options.charset;

  if (options.charsetSentinel) {
    for (i = 0; i < parts.length; ++i) {
      if (parts[i].indexOf('utf8=') === 0) {
        if (parts[i] === charsetSentinel) {
          charset = 'utf-8';
        } else if (parts[i] === isoSentinel) {
          charset = 'iso-8859-1';
        }

        skipIndex = i;
        i = parts.length; // The eslint settings do not allow break;
      }
    }
  }

  for (i = 0; i < parts.length; ++i) {
    if (i === skipIndex) {
      continue;
    }

    var part = parts[i];
    var bracketEqualsPos = part.indexOf(']=');
    var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;
    var key, val;

    if (pos === -1) {
      key = options.decoder(part, defaults.decoder, charset, 'key');
      val = options.strictNullHandling ? null : '';
    } else {
      key = options.decoder(part.slice(0, pos), defaults.decoder, charset, 'key');
      val = utils.maybeMap(parseArrayValue(part.slice(pos + 1), options), function (encodedVal) {
        return options.decoder(encodedVal, defaults.decoder, charset, 'value');
      });
    }

    if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
      val = interpretNumericEntities(val);
    }

    if (part.indexOf('[]=') > -1) {
      val = isArray(val) ? [val] : val;
    }

    if (has.call(obj, key)) {
      obj[key] = utils.combine(obj[key], val);
    } else {
      obj[key] = val;
    }
  }

  return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
  var leaf = valuesParsed ? val : parseArrayValue(val, options);

  for (var i = chain.length - 1; i >= 0; --i) {
    var obj;
    var root = chain[i];

    if (root === '[]' && options.parseArrays) {
      obj = [].concat(leaf);
    } else {
      obj = options.plainObjects ? Object.create(null) : {};
      var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
      var index = parseInt(cleanRoot, 10);

      if (!options.parseArrays && cleanRoot === '') {
        obj = {
          0: leaf
        };
      } else if (!isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit) {
        obj = [];
        obj[index] = leaf;
      } else {
        obj[cleanRoot] = leaf;
      }
    }

    leaf = obj;
  }

  return leaf;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
  if (!givenKey) {
    return;
  } // Transform dot notation to bracket notation


  var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey; // The regex chunks

  var brackets = /(\[[^[\]]*])/;
  var child = /(\[[^[\]]*])/g; // Get the parent

  var segment = options.depth > 0 && brackets.exec(key);
  var parent = segment ? key.slice(0, segment.index) : key; // Stash the parent if it exists

  var keys = [];

  if (parent) {
    // If we aren't using plain objects, optionally prefix keys that would overwrite object prototype properties
    if (!options.plainObjects && has.call(Object.prototype, parent)) {
      if (!options.allowPrototypes) {
        return;
      }
    }

    keys.push(parent);
  } // Loop through children appending to the array until we hit depth


  var i = 0;

  while (options.depth > 0 && (segment = child.exec(key)) !== null && i < options.depth) {
    i += 1;

    if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
      if (!options.allowPrototypes) {
        return;
      }
    }

    keys.push(segment[1]);
  } // If there's a remainder, just add whatever is left


  if (segment) {
    keys.push('[' + key.slice(segment.index) + ']');
  }

  return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
  if (!opts) {
    return defaults;
  }

  if (opts.decoder !== null && opts.decoder !== undefined && typeof opts.decoder !== 'function') {
    throw new TypeError('Decoder has to be a function.');
  }

  if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
    throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
  }

  var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;
  return {
    allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
    allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
    allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
    arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
    charset: charset,
    charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
    comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
    decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
    delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
    // eslint-disable-next-line no-implicit-coercion, no-extra-parens
    depth: typeof opts.depth === 'number' || opts.depth === false ? +opts.depth : defaults.depth,
    ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
    interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
    parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
    parseArrays: opts.parseArrays !== false,
    plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
    strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
  };
};

module.exports = function (str, opts) {
  var options = normalizeParseOptions(opts);

  if (str === '' || str === null || typeof str === 'undefined') {
    return options.plainObjects ? Object.create(null) : {};
  }

  var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
  var obj = options.plainObjects ? Object.create(null) : {}; // Iterate over the keys and setup the new object

  var keys = Object.keys(tempObj);

  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    var newObj = parseKeys(key, tempObj[key], options, typeof str === 'string');
    obj = utils.merge(obj, newObj, options);
  }

  if (options.allowSparse === true) {
    return obj;
  }

  return utils.compact(obj);
};

/***/ }),

/***/ "./node_modules/qs/lib/stringify.js":
/*!******************************************!*\
  !*** ./node_modules/qs/lib/stringify.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var getSideChannel = __webpack_require__(/*! side-channel */ "./node_modules/side-channel/index.js");

var utils = __webpack_require__(/*! ./utils */ "./node_modules/qs/lib/utils.js");

var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");

var has = Object.prototype.hasOwnProperty;
var arrayPrefixGenerators = {
  brackets: function brackets(prefix) {
    return prefix + '[]';
  },
  comma: 'comma',
  indices: function indices(prefix, key) {
    return prefix + '[' + key + ']';
  },
  repeat: function repeat(prefix) {
    return prefix;
  }
};
var isArray = Array.isArray;
var push = Array.prototype.push;

var pushToArray = function (arr, valueOrArray) {
  push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
};

var toISO = Date.prototype.toISOString;
var defaultFormat = formats['default'];
var defaults = {
  addQueryPrefix: false,
  allowDots: false,
  charset: 'utf-8',
  charsetSentinel: false,
  delimiter: '&',
  encode: true,
  encoder: utils.encode,
  encodeValuesOnly: false,
  format: defaultFormat,
  formatter: formats.formatters[defaultFormat],
  // deprecated
  indices: false,
  serializeDate: function serializeDate(date) {
    return toISO.call(date);
  },
  skipNulls: false,
  strictNullHandling: false
};

var isNonNullishPrimitive = function isNonNullishPrimitive(v) {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'symbol' || typeof v === 'bigint';
};

var stringify = function stringify(object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  var obj = object;

  if (sideChannel.has(object)) {
    throw new RangeError('Cyclic object value');
  }

  if (typeof filter === 'function') {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate(obj);
  } else if (generateArrayPrefix === 'comma' && isArray(obj)) {
    obj = utils.maybeMap(obj, function (value) {
      if (value instanceof Date) {
        return serializeDate(value);
      }

      return value;
    });
  }

  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset, 'key', format) : prefix;
    }

    obj = '';
  }

  if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
    if (encoder) {
      var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, 'key', format);
      return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset, 'value', format))];
    }

    return [formatter(prefix) + '=' + formatter(String(obj))];
  }

  var values = [];

  if (typeof obj === 'undefined') {
    return values;
  }

  var objKeys;

  if (generateArrayPrefix === 'comma' && isArray(obj)) {
    // we need to join elements in
    objKeys = [{
      value: obj.length > 0 ? obj.join(',') || null : undefined
    }];
  } else if (isArray(filter)) {
    objKeys = filter;
  } else {
    var keys = Object.keys(obj);
    objKeys = sort ? keys.sort(sort) : keys;
  }

  for (var i = 0; i < objKeys.length; ++i) {
    var key = objKeys[i];
    var value = typeof key === 'object' && key.value !== undefined ? key.value : obj[key];

    if (skipNulls && value === null) {
      continue;
    }

    var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === 'function' ? generateArrayPrefix(prefix, key) : prefix : prefix + (allowDots ? '.' + key : '[' + key + ']');
    sideChannel.set(object, true);
    var valueSideChannel = getSideChannel();
    pushToArray(values, stringify(value, keyPrefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, valueSideChannel));
  }

  return values;
};

var normalizeStringifyOptions = function normalizeStringifyOptions(opts) {
  if (!opts) {
    return defaults;
  }

  if (opts.encoder !== null && opts.encoder !== undefined && typeof opts.encoder !== 'function') {
    throw new TypeError('Encoder has to be a function.');
  }

  var charset = opts.charset || defaults.charset;

  if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
    throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
  }

  var format = formats['default'];

  if (typeof opts.format !== 'undefined') {
    if (!has.call(formats.formatters, opts.format)) {
      throw new TypeError('Unknown format option provided.');
    }

    format = opts.format;
  }

  var formatter = formats.formatters[format];
  var filter = defaults.filter;

  if (typeof opts.filter === 'function' || isArray(opts.filter)) {
    filter = opts.filter;
  }

  return {
    addQueryPrefix: typeof opts.addQueryPrefix === 'boolean' ? opts.addQueryPrefix : defaults.addQueryPrefix,
    allowDots: typeof opts.allowDots === 'undefined' ? defaults.allowDots : !!opts.allowDots,
    charset: charset,
    charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
    delimiter: typeof opts.delimiter === 'undefined' ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === 'boolean' ? opts.encode : defaults.encode,
    encoder: typeof opts.encoder === 'function' ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === 'boolean' ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter: filter,
    format: format,
    formatter: formatter,
    serializeDate: typeof opts.serializeDate === 'function' ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === 'boolean' ? opts.skipNulls : defaults.skipNulls,
    sort: typeof opts.sort === 'function' ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling
  };
};

module.exports = function (object, opts) {
  var obj = object;
  var options = normalizeStringifyOptions(opts);
  var objKeys;
  var filter;

  if (typeof options.filter === 'function') {
    filter = options.filter;
    obj = filter('', obj);
  } else if (isArray(options.filter)) {
    filter = options.filter;
    objKeys = filter;
  }

  var keys = [];

  if (typeof obj !== 'object' || obj === null) {
    return '';
  }

  var arrayFormat;

  if (opts && opts.arrayFormat in arrayPrefixGenerators) {
    arrayFormat = opts.arrayFormat;
  } else if (opts && 'indices' in opts) {
    arrayFormat = opts.indices ? 'indices' : 'repeat';
  } else {
    arrayFormat = 'indices';
  }

  var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

  if (!objKeys) {
    objKeys = Object.keys(obj);
  }

  if (options.sort) {
    objKeys.sort(options.sort);
  }

  var sideChannel = getSideChannel();

  for (var i = 0; i < objKeys.length; ++i) {
    var key = objKeys[i];

    if (options.skipNulls && obj[key] === null) {
      continue;
    }

    pushToArray(keys, stringify(obj[key], key, generateArrayPrefix, options.strictNullHandling, options.skipNulls, options.encode ? options.encoder : null, options.filter, options.sort, options.allowDots, options.serializeDate, options.format, options.formatter, options.encodeValuesOnly, options.charset, sideChannel));
  }

  var joined = keys.join(options.delimiter);
  var prefix = options.addQueryPrefix === true ? '?' : '';

  if (options.charsetSentinel) {
    if (options.charset === 'iso-8859-1') {
      // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
      prefix += 'utf8=%26%2310003%3B&';
    } else {
      // encodeURIComponent('✓')
      prefix += 'utf8=%E2%9C%93&';
    }
  }

  return joined.length > 0 ? prefix + joined : '';
};

/***/ }),

/***/ "./node_modules/qs/lib/utils.js":
/*!**************************************!*\
  !*** ./node_modules/qs/lib/utils.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var formats = __webpack_require__(/*! ./formats */ "./node_modules/qs/lib/formats.js");

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var hexTable = function () {
  var array = [];

  for (var i = 0; i < 256; ++i) {
    array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
  }

  return array;
}();

var compactQueue = function compactQueue(queue) {
  while (queue.length > 1) {
    var item = queue.pop();
    var obj = item.obj[item.prop];

    if (isArray(obj)) {
      var compacted = [];

      for (var j = 0; j < obj.length; ++j) {
        if (typeof obj[j] !== 'undefined') {
          compacted.push(obj[j]);
        }
      }

      item.obj[item.prop] = compacted;
    }
  }
};

var arrayToObject = function arrayToObject(source, options) {
  var obj = options && options.plainObjects ? Object.create(null) : {};

  for (var i = 0; i < source.length; ++i) {
    if (typeof source[i] !== 'undefined') {
      obj[i] = source[i];
    }
  }

  return obj;
};

var merge = function merge(target, source, options) {
  /* eslint no-param-reassign: 0 */
  if (!source) {
    return target;
  }

  if (typeof source !== 'object') {
    if (isArray(target)) {
      target.push(source);
    } else if (target && typeof target === 'object') {
      if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
        target[source] = true;
      }
    } else {
      return [target, source];
    }

    return target;
  }

  if (!target || typeof target !== 'object') {
    return [target].concat(source);
  }

  var mergeTarget = target;

  if (isArray(target) && !isArray(source)) {
    mergeTarget = arrayToObject(target, options);
  }

  if (isArray(target) && isArray(source)) {
    source.forEach(function (item, i) {
      if (has.call(target, i)) {
        var targetItem = target[i];

        if (targetItem && typeof targetItem === 'object' && item && typeof item === 'object') {
          target[i] = merge(targetItem, item, options);
        } else {
          target.push(item);
        }
      } else {
        target[i] = item;
      }
    });
    return target;
  }

  return Object.keys(source).reduce(function (acc, key) {
    var value = source[key];

    if (has.call(acc, key)) {
      acc[key] = merge(acc[key], value, options);
    } else {
      acc[key] = value;
    }

    return acc;
  }, mergeTarget);
};

var assign = function assignSingleSource(target, source) {
  return Object.keys(source).reduce(function (acc, key) {
    acc[key] = source[key];
    return acc;
  }, target);
};

var decode = function (str, decoder, charset) {
  var strWithoutPlus = str.replace(/\+/g, ' ');

  if (charset === 'iso-8859-1') {
    // unescape never throws, no try...catch needed:
    return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
  } // utf-8


  try {
    return decodeURIComponent(strWithoutPlus);
  } catch (e) {
    return strWithoutPlus;
  }
};

var encode = function encode(str, defaultEncoder, charset, kind, format) {
  // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
  // It has been adapted here for stricter adherence to RFC 3986
  if (str.length === 0) {
    return str;
  }

  var string = str;

  if (typeof str === 'symbol') {
    string = Symbol.prototype.toString.call(str);
  } else if (typeof str !== 'string') {
    string = String(str);
  }

  if (charset === 'iso-8859-1') {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
      return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
    });
  }

  var out = '';

  for (var i = 0; i < string.length; ++i) {
    var c = string.charCodeAt(i);

    if (c === 0x2D // -
    || c === 0x2E // .
    || c === 0x5F // _
    || c === 0x7E // ~
    || c >= 0x30 && c <= 0x39 // 0-9
    || c >= 0x41 && c <= 0x5A // a-z
    || c >= 0x61 && c <= 0x7A // A-Z
    || format === formats.RFC1738 && (c === 0x28 || c === 0x29) // ( )
    ) {
        out += string.charAt(i);
        continue;
      }

    if (c < 0x80) {
      out = out + hexTable[c];
      continue;
    }

    if (c < 0x800) {
      out = out + (hexTable[0xC0 | c >> 6] + hexTable[0x80 | c & 0x3F]);
      continue;
    }

    if (c < 0xD800 || c >= 0xE000) {
      out = out + (hexTable[0xE0 | c >> 12] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F]);
      continue;
    }

    i += 1;
    c = 0x10000 + ((c & 0x3FF) << 10 | string.charCodeAt(i) & 0x3FF);
    out += hexTable[0xF0 | c >> 18] + hexTable[0x80 | c >> 12 & 0x3F] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F];
  }

  return out;
};

var compact = function compact(value) {
  var queue = [{
    obj: {
      o: value
    },
    prop: 'o'
  }];
  var refs = [];

  for (var i = 0; i < queue.length; ++i) {
    var item = queue[i];
    var obj = item.obj[item.prop];
    var keys = Object.keys(obj);

    for (var j = 0; j < keys.length; ++j) {
      var key = keys[j];
      var val = obj[key];

      if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
        queue.push({
          obj: obj,
          prop: key
        });
        refs.push(val);
      }
    }
  }

  compactQueue(queue);
  return value;
};

var isRegExp = function isRegExp(obj) {
  return Object.prototype.toString.call(obj) === '[object RegExp]';
};

var isBuffer = function isBuffer(obj) {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
};

var combine = function combine(a, b) {
  return [].concat(a, b);
};

var maybeMap = function maybeMap(val, fn) {
  if (isArray(val)) {
    var mapped = [];

    for (var i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }

    return mapped;
  }

  return fn(val);
};

module.exports = {
  arrayToObject: arrayToObject,
  assign: assign,
  combine: combine,
  compact: compact,
  decode: decode,
  encode: encode,
  isBuffer: isBuffer,
  isRegExp: isRegExp,
  maybeMap: maybeMap,
  merge: merge
};

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

/***/ "./node_modules/side-channel/index.js":
/*!********************************************!*\
  !*** ./node_modules/side-channel/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var GetIntrinsic = __webpack_require__(/*! get-intrinsic */ "./node_modules/get-intrinsic/index.js");

var callBound = __webpack_require__(/*! call-bind/callBound */ "./node_modules/call-bind/callBound.js");

var inspect = __webpack_require__(/*! object-inspect */ "./node_modules/object-inspect/index.js");

var $TypeError = GetIntrinsic('%TypeError%');
var $WeakMap = GetIntrinsic('%WeakMap%', true);
var $Map = GetIntrinsic('%Map%', true);
var $weakMapGet = callBound('WeakMap.prototype.get', true);
var $weakMapSet = callBound('WeakMap.prototype.set', true);
var $weakMapHas = callBound('WeakMap.prototype.has', true);
var $mapGet = callBound('Map.prototype.get', true);
var $mapSet = callBound('Map.prototype.set', true);
var $mapHas = callBound('Map.prototype.has', true);
/*
 * This function traverses the list returning the node corresponding to the
 * given key.
 *
 * That node is also moved to the head of the list, so that if it's accessed
 * again we don't need to traverse the whole list. By doing so, all the recently
 * used nodes can be accessed relatively quickly.
 */

var listGetNode = function (list, key) {
  // eslint-disable-line consistent-return
  for (var prev = list, curr; (curr = prev.next) !== null; prev = curr) {
    if (curr.key === key) {
      prev.next = curr.next;
      curr.next = list.next;
      list.next = curr; // eslint-disable-line no-param-reassign

      return curr;
    }
  }
};

var listGet = function (objects, key) {
  var node = listGetNode(objects, key);
  return node && node.value;
};

var listSet = function (objects, key, value) {
  var node = listGetNode(objects, key);

  if (node) {
    node.value = value;
  } else {
    // Prepend the new node to the beginning of the list
    objects.next = {
      // eslint-disable-line no-param-reassign
      key: key,
      next: objects.next,
      value: value
    };
  }
};

var listHas = function (objects, key) {
  return !!listGetNode(objects, key);
};

module.exports = function getSideChannel() {
  var $wm;
  var $m;
  var $o;
  var channel = {
    assert: function (key) {
      if (!channel.has(key)) {
        throw new $TypeError('Side channel does not contain ' + inspect(key));
      }
    },
    get: function (key) {
      // eslint-disable-line consistent-return
      if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
        if ($wm) {
          return $weakMapGet($wm, key);
        }
      } else if ($Map) {
        if ($m) {
          return $mapGet($m, key);
        }
      } else {
        if ($o) {
          // eslint-disable-line no-lonely-if
          return listGet($o, key);
        }
      }
    },
    has: function (key) {
      if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
        if ($wm) {
          return $weakMapHas($wm, key);
        }
      } else if ($Map) {
        if ($m) {
          return $mapHas($m, key);
        }
      } else {
        if ($o) {
          // eslint-disable-line no-lonely-if
          return listHas($o, key);
        }
      }

      return false;
    },
    set: function (key, value) {
      if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
        if (!$wm) {
          $wm = new $WeakMap();
        }

        $weakMapSet($wm, key, value);
      } else if ($Map) {
        if (!$m) {
          $m = new $Map();
        }

        $mapSet($m, key, value);
      } else {
        if (!$o) {
          /*
           * Initialize the linked list as an empty node, so that we don't have
           * to special-case handling of the first node: we can always refer to
           * it as (previous node).next, instead of something like (list).head
           */
          $o = {
            key: {},
            next: null
          };
        }

        listSet($o, key, value);
      }
    }
  };
  return channel;
};

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

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function (module) {
  if (!module.webpackPolyfill) {
    module.deprecate = function () {};

    module.paths = []; // module.parent = undefined by default

    if (!module.children) module.children = [];
    Object.defineProperty(module, "loaded", {
      enumerable: true,
      get: function () {
        return module.l;
      }
    });
    Object.defineProperty(module, "id", {
      enumerable: true,
      get: function () {
        return module.i;
      }
    });
    module.webpackPolyfill = 1;
  }

  return module;
};

/***/ }),

/***/ "./src/apis/NavigationAPI.worker.js":
/*!******************************************!*\
  !*** ./src/apis/NavigationAPI.worker.js ***!
  \******************************************/
/*! exports provided: getNavigationAPI, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNavigationAPI", function() { return getNavigationAPI; });
/* harmony import */ var _framework_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/App */ "./src/framework/App/index.worker.js");
/* harmony import */ var _utils_getCurrentViewId__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/getCurrentViewId */ "./src/utils/getCurrentViewId.js");
/* harmony import */ var _invalidNavigateTo__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./invalidNavigateTo */ "./src/apis/invalidNavigateTo.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util */ "./src/apis/util.js");
/* harmony import */ var _ap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ap */ "./src/apis/ap.worker.js");





function getNavigationAPI(ap) {
  var callBridge = ap.callBridge;

  function doSwitch(_ref, recreate) {
    var pagePath = _ref.pagePath;
    callBridge('switchTab', {
      tag: pagePath,
      recreate: recreate
    });
  }

  function doPush(_ref2, param) {
    var url = _ref2.url,
        pagePath = _ref2.pagePath,
        viewId = _ref2.viewId;
    callBridge('pushWindow', {
      url: url,
      viewId: viewId,
      launchParamsTag: pagePath,
      param: param
    });
  }

  return {
    reLaunch: function reLaunch(params) {
      Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getAppImpl"])().reLaunch({
        url: params.url
      }, {
        pushWindow: function pushWindow(param) {
          return doPush(param, {
            closeAllWindow: true,
            animationType: 'none'
          });
        },
        switchTab: function switchTab(param) {
          return doSwitch(param, true);
        }
      });
      Object(_util__WEBPACK_IMPORTED_MODULE_3__["handleResultCallback"])(params);
    },
    navigateTo: function navigateTo(params) {
      if (Object(_invalidNavigateTo__WEBPACK_IMPORTED_MODULE_2__["default"])(params)) {
        return;
      }

      Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getAppImpl"])().navigateTo({
        url: params.url,
        viewId: params.viewId
      }, {
        pushWindow: doPush
      });
      Object(_util__WEBPACK_IMPORTED_MODULE_3__["handleResultCallback"])(params);
    },
    switchTab: function switchTab(params) {
      Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getAppImpl"])().switchTab({
        url: params.url
      }, {
        doSwitch: doSwitch
      });
      Object(_util__WEBPACK_IMPORTED_MODULE_3__["handleResultCallback"])(params);
    },
    redirectTo: function redirectTo(params) {
      Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getAppImpl"])().redirectTo({
        url: params.url
      }, {
        pushWindow: function pushWindow(param) {
          doPush(param, {
            closeCurrentWindow: true,
            animationType: 'none'
          });
        }
      });
      Object(_util__WEBPACK_IMPORTED_MODULE_3__["handleResultCallback"])(params);
    },
    navigateBack: function navigateBack() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var error = Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getAppImpl"])().navigateBack({
        delta: params.delta
      }, function (_ref3) {
        var delta = _ref3.delta;
        callBridge('popTo', {
          delta: delta
        });
      });

      if (error) {
        Object(_util__WEBPACK_IMPORTED_MODULE_3__["handleResultCallback"])(params, {
          error: error
        });
      } else {
        Object(_util__WEBPACK_IMPORTED_MODULE_3__["handleResultCallback"])(params);
      }
    }
  };
}
/* harmony default export */ __webpack_exports__["default"] = (getNavigationAPI(_ap__WEBPACK_IMPORTED_MODULE_4__["default"]));

/***/ }),

/***/ "./src/apis/ap.worker.js":
/*!*******************************!*\
  !*** ./src/apis/ap.worker.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/startupParams */ "./src/utils/startupParams/index.worker.js");
/* harmony import */ var _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/EventEmitter */ "./src/utils/EventEmitter.js");
/* harmony import */ var _utils_isDebug__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/isDebug */ "./src/utils/isDebug.js");
/* harmony import */ var _callRender__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./callRender */ "./src/apis/callRender.worker.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }






var g = self;
var globalEmitter = new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_4__["default"]();

function log() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // debug.apply(undefined, ['framework'].concat(args));
  _utils_log__WEBPACK_IMPORTED_MODULE_2__["debug"].apply(void 0, ['framework'].concat(args));
}

function getUserEventName(name) {
  return "_$".concat(name);
}

function getUserEventDataName(name) {
  return "_data_$".concat(name);
}

function cleanEventData(userEventData) {
  if (userEventData && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_1___default()(userEventData) === 'object' && 'NBPageUrl' in userEventData) {
    userEventData = _objectSpread({}, userEventData);
    delete userEventData.NBPageUrl;
  }

  return userEventData;
}

function doEventCallback(options) {
  var name = options.eventName;
  var userEventName = getUserEventName(name);
  var userEventDataName = getUserEventDataName(name);
  var hasSysEvent = globalEmitter.listenerCount(name);
  var hasUserEvent = globalEmitter.listenerCount(userEventName);
  var hasUserEventData = globalEmitter.listenerCount(userEventDataName);

  if (hasUserEvent || hasSysEvent || hasUserEventData) {
    var evt = {
      name: name,
      type: name,
      data: options.param,
      viewId: options.viewId
    };
    globalEmitter.emit(name, evt);

    if (hasUserEvent) {
      var userEvent = _objectSpread({}, evt);

      delete userEvent.viewId;
      userEvent.data = cleanEventData(userEvent.data);
      globalEmitter.emit(userEventName, userEvent);
    }

    if (hasUserEventData) {
      var userEventData = cleanEventData(evt.data);
      globalEmitter.emit(userEventDataName, userEventData);
    }
  }
}

var JSBridge = g.JSBridge;
g.callRender = _callRender__WEBPACK_IMPORTED_MODULE_6__["default"];
g.__trigger__ = doEventCallback;
/* native事件触发 */

g.document.addEventListener('push', function (evt) {
  /**
   * param
   * viewId
   * eventName
   */
  var data = evt.data;
  doEventCallback(data);
});
var API = {};
var ap = {
  injectAPI: function injectAPI(_API) {
    API = _API;
  },
  getAPI: function getAPI() {
    return API;
  },
  emitUserEvent: function emitUserEvent(type) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    return globalEmitter.emit.apply(globalEmitter, [getUserEventName(type)].concat(args));
  },
  emitUserEventData: function emitUserEventData(type) {
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    return globalEmitter.emit.apply(globalEmitter, [getUserEventDataName(type)].concat(args));
  },
  onUserEvent: function onUserEvent(name, callback) {
    return globalEmitter.on(getUserEventName(name), callback);
  },
  offUserEvent: function offUserEvent(name, callback) {
    return globalEmitter.off(getUserEventName(name), callback);
  },
  onUserEventData: function onUserEventData(name, callback) {
    return globalEmitter.on(getUserEventDataName(name), callback);
  },
  offUserEventData: function offUserEventData(name, callback) {
    return globalEmitter.off(getUserEventDataName(name), callback);
  },
  on: function on() {
    var _globalEmitter$on;

    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    return (_globalEmitter$on = globalEmitter.on).call.apply(_globalEmitter$on, [globalEmitter].concat(args));
  },
  off: function off() {
    var _globalEmitter$off;

    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    return (_globalEmitter$off = globalEmitter.off).call.apply(_globalEmitter$off, [globalEmitter].concat(args));
  },
  emit: function emit() {
    var _globalEmitter$emit;

    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    return (_globalEmitter$emit = globalEmitter.emit).call.apply(_globalEmitter$emit, [globalEmitter].concat(args));
  },
  callBridge: function callBridge(method, params, callback) {
    // 这里调用bridge的方法
    JSBridge.call(method, params, callback);
  },
  callBridgeSync: function callBridgeSync(method, params) {
    var res = JSBridge.callSync(method, params);

    if (res && res.error) {
      log('callBridgeSync error:', method, params, res);
    }

    return res;
  }
};
var ddOrAp = true;
/* param must be a object... */

ap.callInternalAPI = function (method) {
  var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var callback = arguments.length > 2 ? arguments[2] : undefined;

  if (ddOrAp && !Object(_utils_startupParams__WEBPACK_IMPORTED_MODULE_3__["getStartupParams"])().isInternalApp) {
    var internalParams = {
      method: method,
      param: param
    };

    if ('viewId' in param) {
      internalParams.viewId = param.viewId;
    }

    ap.callBridge('internalAPI', internalParams, callback);
  } else {
    ap.callBridge(method, param, callback);
  }
};

ap.callInternalAPISync = function (method) {
  var param = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (ddOrAp && !Object(_utils_startupParams__WEBPACK_IMPORTED_MODULE_3__["getStartupParams"])().isInternalApp) {
    var internalParams = {
      method: method,
      param: param
    };

    if ('viewId' in param) {
      internalParams.viewId = param.viewId;
    }

    return ap.callBridgeSync('internalAPI', internalParams);
  } else {
    return ap.callBridgeSync(method, param);
  }
};

/* harmony default export */ __webpack_exports__["default"] = (ap);

/***/ }),

/***/ "./src/apis/callRender.worker.js":
/*!***************************************!*\
  !*** ./src/apis/callRender.worker.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return callRender; });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _framework_App__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/App */ "./src/framework/App/index.worker.js");




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


function callRender(method) {
  var _page$callRemote;

  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _params$homepage = params.homepage,
      homepage = _params$homepage === void 0 ? false : _params$homepage,
      _params$args = params.args,
      innerArgs = _params$args === void 0 ? [] : _params$args,
      _params$caller = params.caller,
      caller = _params$caller === void 0 ? 'bridge' : _params$caller;
  var pages = Object(_framework_App__WEBPACK_IMPORTED_MODULE_3__["getCurrentPagesImpl"])();
  var page = params.page || (homepage ? pages && pages[0] : Object(_framework_App__WEBPACK_IMPORTED_MODULE_3__["getCurrentPageImpl"])());

  if (!page) {
    console.warn('Can not getCurrentPage for callBridge.worker!', method, params);
    return;
  }

  var args = [caller, method].concat(innerArgs);
  var lastArg = args[args.length - 1];

  if (lastArg) {
    if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_2___default()(lastArg) === 'object') {
      var _lastArg = lastArg,
          success = _lastArg.success,
          fail = _lastArg.fail,
          complete = _lastArg.complete;

      if (success || fail || complete) {
        args[args.length - 1] = lastArg = _objectSpread({}, lastArg);
        delete lastArg.success;
        delete lastArg.fail;
        delete lastArg.complete;
        args.push(function () {
          if (success) {
            success.apply(void 0, arguments);
          }

          if (complete) {
            complete.apply(void 0, arguments);
          }
        });
        args.push(function () {
          if (fail) {
            fail.apply(void 0, arguments);
          }

          if (complete) {
            complete.apply(void 0, arguments);
          }
        });
      }
    } else if (typeof lastArg === 'function') {
      args.push(lastArg);
    }
  }

  (_page$callRemote = page.callRemote).call.apply(_page$callRemote, [page].concat(_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(args)));
}

/***/ }),

/***/ "./src/apis/index.worker.js":
/*!**********************************!*\
  !*** ./src/apis/index.worker.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/upperFirstChar */ "./src/utils/upperFirstChar.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/extraAPIMap */ "./src/utils/extraAPIMap.js");
/* harmony import */ var _utils_loadExtraRes__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/loadExtraRes */ "./src/utils/loadExtraRes.js");
/* harmony import */ var _utils_errorCodes__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/errorCodes */ "./src/utils/errorCodes.js");
/* harmony import */ var _utils_reportError__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/utils/reportError */ "./src/utils/reportError.worker.js");
/* harmony import */ var _utils_bridge__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @/utils/bridge */ "./src/utils/bridge.js");
/* harmony import */ var _NavigationAPI__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./NavigationAPI */ "./src/apis/NavigationAPI.worker.js");
/* harmony import */ var _listen__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./listen */ "./src/apis/listen.worker.js");
/* harmony import */ var _callRender__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./callRender */ "./src/apis/callRender.worker.js");
/* harmony import */ var _ap__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./ap */ "./src/apis/ap.worker.js");
/* harmony import */ var _worker_canIUse__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./worker/canIUse */ "./src/apis/worker/canIUse.js");
/* harmony import */ var _worker_createSelectorQuery__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./worker/createSelectorQuery */ "./src/apis/worker/createSelectorQuery.js");
/* harmony import */ var _worker_canvas_CanvasAPI__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./worker/canvas/CanvasAPI */ "./src/apis/worker/canvas/CanvasAPI.js");
/* harmony import */ var _worker_Animation__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./worker/Animation */ "./src/apis/worker/Animation.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }


















var callBridge = _ap__WEBPACK_IMPORTED_MODULE_14__["default"].callBridge,
    callBridgeSync = _ap__WEBPACK_IMPORTED_MODULE_14__["default"].callBridgeSync,
    callInternalAPI = _ap__WEBPACK_IMPORTED_MODULE_14__["default"].callInternalAPI,
    callInternalAPISync = _ap__WEBPACK_IMPORTED_MODULE_14__["default"].callInternalAPISync;
var g = self;

var bridge = _objectSpread(_objectSpread({
  renderTarget: 'web',
  on: function on(name, fn) {
    _ap__WEBPACK_IMPORTED_MODULE_14__["default"].onUserEvent(name, fn);
    return {
      remove: function remove() {
        _ap__WEBPACK_IMPORTED_MODULE_14__["default"].offUserEvent(name, fn);
      }
    };
  },
  // for test
  emit: function emit() {
    var _ap$emitUserEvent;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (_ap$emitUserEvent = _ap__WEBPACK_IMPORTED_MODULE_14__["default"].emitUserEvent).call.apply(_ap$emitUserEvent, [_ap__WEBPACK_IMPORTED_MODULE_14__["default"]].concat(args));
  },
  call: function call() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    callBridge.call.apply(callBridge, [_ap__WEBPACK_IMPORTED_MODULE_14__["default"]].concat(args));
  },
  callSync: function callSync() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    callBridgeSync.call.apply(callBridgeSync, [_ap__WEBPACK_IMPORTED_MODULE_14__["default"]].concat(args));
  }
}, _NavigationAPI__WEBPACK_IMPORTED_MODULE_11__["default"]), {}, {
  // for internal call render
  postMessage: function postMessage(data) {
    Object(_callRender__WEBPACK_IMPORTED_MODULE_13__["default"])('fireMessage', {
      args: [data]
    });
  },
  createAnimation: function createAnimation() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return new _worker_Animation__WEBPACK_IMPORTED_MODULE_18__["default"](config);
  },
  pageScrollTo: function pageScrollTo() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    Object(_callRender__WEBPACK_IMPORTED_MODULE_13__["default"])('pageScrollTo', {
      args: args
    });
  },
  SDKVersion: _utils_system__WEBPACK_IMPORTED_MODULE_3__["SDKVersion"],
  // for canvas web
  __emit: function __emit() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    _ap__WEBPACK_IMPORTED_MODULE_14__["default"].emit.apply(_ap__WEBPACK_IMPORTED_MODULE_14__["default"], args);
  },
  preloadResource: function preloadResource(res) {
    if (typeof fetch === 'function' && res.indexOf('alipay.kylinbridge') === -1) {
      fetch(res);
    }
  },
  getExtConfigSync: function getExtConfigSync() {
    return g.mpAppJson && g.mpAppJson.app && g.mpAppJson.app.ext;
  },
  canIUse: function canIUse(name) {
    return Object(_worker_canIUse__WEBPACK_IMPORTED_MODULE_15__["default"])(bridge, name);
  },
  createSelectorQuery: _worker_createSelectorQuery__WEBPACK_IMPORTED_MODULE_16__["default"],
  loadFontFace: function loadFontFace(params) {
    var page = params.page;

    var success = params.success,
        fail = params.fail,
        complete = params.complete,
        data = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default()(params, ["success", "fail", "complete"]);

    (page || Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])()).callRemote('bridge', 'loadFontFace', data, function (res) {
      success && success(res);
      complete && complete(res);
    }, function (error) {
      fail && fail(error);
      complete && complete(error);
    });
  },
  stopPullDownRefresh: function stopPullDownRefresh() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var config;
    var page = params.page;

    if (page) {
      config = {
        viewId: page.$viewId
      };
    }

    callBridge('restorePullToRefresh', config);
    Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_10__["apCallback"])(params);
  },
  hideKeyboard: function hideKeyboard() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var config;
    var page = params.page;

    if (page) {
      config = {
        viewId: page.$viewId
      };
    } // custom keyboard


    callInternalAPI('hideCustomKeyBoard', config);
    (page || Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])()).callRemote('bridge', 'hideKeyboard');
  },
  reportCustomError: function reportCustomError(error) {
    Object(_utils_reportError__WEBPACK_IMPORTED_MODULE_9__["default"])(_utils_errorCodes__WEBPACK_IMPORTED_MODULE_8__["CUSTOM_WORKER_ERROR"], {
      col: error.column,
      line: error.line,
      msg: error.message,
      url: error.sourceURL,
      error: {
        column: error.column,
        line: error.line,
        message: error.message,
        sourceURL: error.sourceURL
      }
    });
  }
}, _worker_canvas_CanvasAPI__WEBPACK_IMPORTED_MODULE_17__["default"]);

Object(_listen__WEBPACK_IMPORTED_MODULE_12__["default"])(_ap__WEBPACK_IMPORTED_MODULE_14__["default"], bridge);
Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(_utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_6__["default"]).forEach(function (item) {
  var APIName = item.split('.');
  var ns = APIName.length === 2 ? APIName[0] : undefined;
  var realAPIName = APIName.length === 2 ? APIName[1] : APIName[0];
  var targetBridge = bridge;

  if (ns) {
    targetBridge = bridge[ns] || {};
  }

  Object.defineProperty(targetBridge, realAPIName, {
    enumerable: true,
    value: function value(params) {
      var extraAPIName = Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_4__["default"])(realAPIName);

      if (g["MP".concat(extraAPIName)]) {
        g["MP".concat(extraAPIName)](params, {
          callBridge: callBridge,
          callBridgeSync: callBridgeSync
        });
      } else {
        Object(_utils_loadExtraRes__WEBPACK_IMPORTED_MODULE_7__["default"])(_utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_6__["default"][item]);

        if (g["MP".concat(extraAPIName)]) {
          g["MP".concat(extraAPIName)](params, {
            callBridge: callBridge,
            callBridgeSync: callBridgeSync
          });
        } else {
          console.error("API mp.".concat(item, " not found"));
        }
      }
    }
  });
});
Object(_utils_system__WEBPACK_IMPORTED_MODULE_3__["logSystemInfo"])();
_framework___WEBPACK_IMPORTED_MODULE_2__["$global"].bridge = bridge;
/* harmony default export */ __webpack_exports__["default"] = (bridge);

/***/ }),

/***/ "./src/apis/invalidNavigateTo.js":
/*!***************************************!*\
  !*** ./src/apis/invalidNavigateTo.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return invalidNavigateTo; });
/* harmony import */ var _framework_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/App */ "./src/framework/App/index.worker.js");

function invalidNavigateTo() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _self = self,
      mpRuntimeConfig = _self.mpRuntimeConfig;
  var limit = mpRuntimeConfig && mpRuntimeConfig.navigationStackLimits || 10;

  if (Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getCurrentPagesImpl"])().length >= limit) {
    var fail = params.fail;
    var complete = params.complete;
    var error = {
      error: 1,
      errorMessage: "depth can not be more than ".concat(limit)
    };

    if (fail) {
      fail(error);
    }

    if (complete) {
      complete(error);
    }

    return true;
  }

  return false;
}

/***/ }),

/***/ "./src/apis/listen.worker.js":
/*!***********************************!*\
  !*** ./src/apis/listen.worker.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return listen; });
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
/* harmony import */ var _framework_App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/App */ "./src/framework/App/index.worker.js");
/* harmony import */ var _framework_EventHub__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/framework/EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _utils_getScene__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/getScene */ "./src/utils/getScene.js");
/* harmony import */ var _utils_isMiniAppPage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/isMiniAppPage */ "./src/utils/isMiniAppPage.js");
/* harmony import */ var _framework_startupParams__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/framework/startupParams */ "./src/framework/startupParams/index.js");
/* harmony import */ var _utils_gerror__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/gerror */ "./src/utils/gerror.js");








var g = self;
function listen(ap, bridge) {
  var isCli = Object(_framework_startupParams__WEBPACK_IMPORTED_MODULE_6__["getStartupParams"])().mpCli;

  if (!isCli) {
    var _self = self;
    var mpAppJson = _self.mpAppJson;
    var preloadRule = mpAppJson && mpAppJson.app.preloadRule;

    if (preloadRule) {
      _framework_EventHub__WEBPACK_IMPORTED_MODULE_3__["default"].addListener('pageLoad', function (_ref) {
        var page = _ref.page;
        var pagePath = page.getPagePath();
        var rule = preloadRule[pagePath];

        if (rule) {
          bridge.call('loadSubPackage', rule);
        }
      });
    }
  }

  ap.on('appResume', function (e) {
    var _e$data = e.data,
        query = _e$data.query,
        page = _e$data.page,
        referrerInfo = _e$data.referrerInfo,
        shouldNotReLaunch = _e$data.shouldNotReLaunch,
        NBPageUrl = _e$data.NBPageUrl;
    var options = {};
    var pageName;

    if (page) {
      if (page.charAt(0) === '/') {
        page = page.slice(1);
      }

      pageName = page;
      var index = page.indexOf('?');

      if (index !== -1) {
        pageName = page.slice(0, index);
      }

      options.path = pageName;

      if (!_framework___WEBPACK_IMPORTED_MODULE_1__["$global"].pagesConfig[pageName]) {
        ap.call('toast', {
          content: '页面已失效!',
          type: 'exception'
        });

        var _e = new Error("Page ".concat(pageName, " Not Found when appResume"));

        Object(_utils_gerror__WEBPACK_IMPORTED_MODULE_7__["default"])(_e);
        query = null;
        page = null;
        options = {};
      }
    }

    if (query) {
      query = qs__WEBPACK_IMPORTED_MODULE_0___default.a.parse(query);
      options.query = query;
    }

    if (referrerInfo) {
      options.referrerInfo = JSON.parse(referrerInfo);
    }

    options.scene = Object(_utils_getScene__WEBPACK_IMPORTED_MODULE_4__["default"])(e.data);
    Object(_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"])().show(options, Object(_utils_isMiniAppPage__WEBPACK_IMPORTED_MODULE_5__["default"])(NBPageUrl));

    if (shouldNotReLaunch) {
      Object(_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"])().clearAllPages();
    } else if (options.path) {
      if (page.charAt(0) !== '/') {
        page = "/".concat(page);
      }

      bridge.reLaunch({
        url: page
      });
    }
  });

  function hideApp(hidePage) {
    Object(_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"])().hide(hidePage);
  }

  ap.on('appPause', function (e) {
    var NBPageUrl = e.data.NBPageUrl;
    hideApp(Object(_utils_isMiniAppPage__WEBPACK_IMPORTED_MODULE_5__["default"])(NBPageUrl));
  });
  ap.on('beforeDestroy', function (e) {
    var NBPageUrl = e.data.NBPageUrl;

    if (!Object(_utils_isMiniAppPage__WEBPACK_IMPORTED_MODULE_5__["default"])(NBPageUrl)) {
      return;
    }

    var app = Object(_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"])();

    if (app) {
      app.destroyPageByUrl(NBPageUrl);
    }
  });
  ap.on('pagePause', function (e) {
    var NBPageUrl = e.data.NBPageUrl;

    if (!Object(_utils_isMiniAppPage__WEBPACK_IMPORTED_MODULE_5__["default"])(NBPageUrl)) {
      return;
    }

    Object(_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"])().pausePageByUrl(NBPageUrl);
  });
  ap.on('pageResume', function (e) {
    var NBPageUrl = e.data.NBPageUrl;

    if (!Object(_utils_isMiniAppPage__WEBPACK_IMPORTED_MODULE_5__["default"])(NBPageUrl)) {
      return;
    }

    Object(_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"])().resumePageByUrl(NBPageUrl);
  });
  ap.on('tabClick', function (e) {
    var _e$data2 = e.data,
        tag = _e$data2.tag,
        _e$data2$from = _e$data2.from,
        from = _e$data2$from === void 0 ? 'user' : _e$data2$from,
        text = _e$data2.text,
        index = _e$data2.index;
    Object(_framework_App__WEBPACK_IMPORTED_MODULE_2__["getAppImpl"])().switchTab({
      url: "/".concat(tag),
      from: from,
      pagePath: tag,
      text: text,
      index: index
    });
  });
}

/***/ }),

/***/ "./src/apis/util.js":
/*!**************************!*\
  !*** ./src/apis/util.js ***!
  \**************************/
/*! exports provided: getAutoTrackerConfig, handleCallbackParams, needBackHome, handleResultCallback */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAutoTrackerConfig", function() { return getAutoTrackerConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handleCallbackParams", function() { return handleCallbackParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "needBackHome", function() { return needBackHome; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "handleResultCallback", function() { return handleResultCallback; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
/* harmony import */ var _utils_getHomePage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/getHomePage */ "./src/utils/getHomePage.js");
/* harmony import */ var _utils_LogBizType__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/LogBizType */ "./src/utils/LogBizType.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/types */ "./src/utils/types.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }







function escapeDot(str) {
  return str.replace(/\./g, '_DOT_');
}

function getAutoTrackerConfig(_pagePath) {
  var pagePath = _pagePath || '';

  if (!pagePath && Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])()) {
    pagePath = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])().getPagePath();
  }

  var _getStartupParams = Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getStartupParams"])();

  var appId = _getStartupParams.appId;
  return {
    spmId: "MiniApp_".concat(appId, ".").concat(escapeDot(pagePath)),
    bizType: Object(_utils_LogBizType__WEBPACK_IMPORTED_MODULE_4__["APP_BIZ"])()
  };
}
function handleCallbackParams(params, resolve, reject) {
  var _params$success = params.success,
      success = _params$success === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_6__["noop"] : _params$success,
      _params$fail = params.fail,
      fail = _params$fail === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_6__["noop"] : _params$fail,
      _params$complete = params.complete,
      complete = _params$complete === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_6__["noop"] : _params$complete,
      rest = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(params, ["success", "fail", "complete"]);

  var newSuccess = function newSuccess(ret) {
    success(ret);

    if (resolve) {
      resolve(ret);
    }

    complete(ret);
  };

  var newFail = function newFail(ret) {
    fail(ret);

    if (reject) {
      reject(ret);
    }

    complete(ret);
  };

  return _objectSpread({
    success: newSuccess,
    fail: newFail
  }, rest);
}
function needBackHome() {
  var homepage = Object(_utils_getHomePage__WEBPACK_IMPORTED_MODULE_3__["default"])();
  var tabs = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(_framework___WEBPACK_IMPORTED_MODULE_2__["$global"].tabsConfig); // 页面堆栈第一个元素

  var currentStackTop = getCurrentPagesImpl()[0].getPagePath();
  var notHomePage = homepage && currentStackTop !== homepage;
  return notHomePage && tabs.indexOf(currentStackTop) === -1;
}
function handleResultCallback() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var res = arguments.length > 1 ? arguments[1] : undefined;
  var complete = params.complete,
      success = params.success,
      fail = params.fail;

  if (res && res.error) {
    if (fail) {
      fail(res);
    }
  } else if (success) {
    success(res);
  }

  if (complete) {
    complete(res);
  }
}

/***/ }),

/***/ "./src/apis/worker/Animation.js":
/*!**************************************!*\
  !*** ./src/apis/worker/Animation.js ***!
  \**************************************/
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




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var Animation = /*#__PURE__*/function () {
  function Animation(config) {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_1___default()(this, Animation);

    this.config = _objectSpread({}, config);
    this.config.duration = this.config.duration || 400;
    this.config.timeFunction = this.config.timeFunction || 'linear';
    this.config.transformOrigin = this.config.transformOrigin || '50% 50% 0';
    this.animations = [];
    this.currentAnimation = [];
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_2___default()(Animation, [{
    key: "step",
    value: function step(config) {
      this.animations.push({
        config: _objectSpread(_objectSpread({}, this.config), config),
        animation: this.currentAnimation
      });
      this.currentAnimation = [];
      return this;
    }
  }, {
    key: "export",
    value: function _export() {
      var animations = this.animations;
      this.animations = [];
      return animations;
    }
  }]);

  return Animation;
}();

var methods = ['opacity', 'backgroundColor', 'width', 'height', 'top', 'left', 'bottom', 'right', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'rotate3d', 'skew', 'skewX', 'skewY', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'scale3d', 'translate', 'translateX', 'translateY', 'translateZ', 'translate3d'];
var proto = Animation.prototype;
methods.forEach(function (m) {
  proto[m] = function run() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.currentAnimation.push([m, args]);
    return this;
  };
});
/* harmony default export */ __webpack_exports__["default"] = (Animation);

/***/ }),

/***/ "./src/apis/worker/canIUse.js":
/*!************************************!*\
  !*** ./src/apis/worker/canIUse.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/upperFirstChar */ "./src/utils/upperFirstChar.js");
/* harmony import */ var _utils_loadExtraRes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/loadExtraRes */ "./src/utils/loadExtraRes.js");
/* harmony import */ var _utils_extraComponentMap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/extraComponentMap */ "./src/utils/extraComponentMap.js");
/* harmony import */ var _utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/extraAPIMap */ "./src/utils/extraAPIMap.js");






var g10135 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_0__["compareSystemVersion"])('10.1.35') >= 0;
var g10138 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_0__["compareSystemVersion"])('10.1.38') >= 0;
var g10150 = Object(_utils_system__WEBPACK_IMPORTED_MODULE_0__["compareSystemVersion"])('10.1.50') >= 0;
var uses = {
  alert: {
    object: {
      confirmColor: g10138
    }
  },
  confirm: {
    object: {
      cancelColor: g10138,
      confirmColor: g10138
    }
  },
  prompt: {
    object: {
      cancelColor: g10138,
      confirmColor: g10138
    }
  },
  navigateToMiniProgram: {
    object: {
      envVersion: 1,
      version: g10135
    }
  },
  navigateToMiniService: {
    object: {
      servicePage: 1
    }
  },
  showActionSheet: {
    object: {
      badges: 1
    }
  },
  camera: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
  createCanvasContext: {
    "return": {
      measureText: 1,
      getImageData: 1,
      putImageData: 1,
      globalCompositeOperation: 1,
      draw: {
        callback: 1
      }
    }
  },
  createVideoContext: {
    "return": {
      mute: 1,
      stop: 1
    }
  },
  chooseImage: {
    object: {
      sizeType: 1
    },
    "return": {
      tempFiles: 1
    }
  },
  component: 1,
  cdp: _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
  page: {
    onOptionMenuClick: 1,
    setData: {
      callback: 1
    },
    $spliceData: 1,
    onPopMenuClick: g10135,
    onTabItemTap: g10135
  },
  getLocation: {
    object: {
      type: 1
    }
  },
  button: {
    'open-type': {
      share: 1,
      lifestyle: g10135,
      launchApp: g10135,
      getAuthorize: g10135,
      contactShare: g10135
    }
  },
  datePicker: {
    object: {
      format: {
        yyyy: 1,
        'yyyy-MM': 1
      }
    }
  },
  getImageInfo: {
    "return": {
      orientation: 1,
      type: 1
    }
  },
  getSystemInfo: {
    "return": {
      storage: 1,
      currentBattery: 1,
      brand: 1,
      fontSizeSetting: 1
    }
  },
  getRecorderManager: {
    onFrameRecorded: g10138,
    offFrameRecorded: g10138,
    pause: g10150,
    resume: g10150,
    onPause: g10150,
    offPause: g10150,
    onResume: g10150,
    offResume: g10150
  },
  favorite: 1,
  form: {
    'report-submit': 1
  },
  lifestyle: 1,
  'live-player': g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
  'live-pusher': g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
  lottie: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
  connectSocket: {
    object: {
      protocols: 1,
      multiple: g10135
    },
    "return": {
      send: g10135,
      close: g10135,
      onMessage: g10135,
      onOpen: g10135,
      onClose: g10135,
      onError: g10135,
      offMessage: g10135,
      offOpen: g10135,
      offClose: g10135,
      offError: g10135
    }
  },
  closeSocket: {
    object: {
      code: 1,
      reason: 1
    }
  },
  scan: {
    object: {
      hideAlbum: 1
    }
  },
  'contact-button': {
    'ext-info': 1,
    size: 1,
    color: 1,
    icon: 1
  },
  'web-view': {
    'app-id': 1
  },
  input: {
    controlled: 1,
    'random-number': 1,
    'confirm-type': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    'confirm-hold': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    cursor: _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    'selection-start': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    'selection-end': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"]
  },
  "switch": {
    controlled: 1
  },
  textarea: {
    controlled: 1,
    fixed: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    cursorSpacing: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    cursor: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    showConfirmBar: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    selectionStart: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    selectionEnd: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    adjustPosition: g10135 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"]
  },
  checkbox: {
    controlled: 1
  },
  video: {
    'initial-time': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    loop: _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    muted: _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    'show-fullscreen-btn': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    'show-center-play-btn': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    onLoading: _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    onStop: _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    direction: g10138 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
    onFullScreenChange: g10138 && _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"]
  },
  view: {
    onTransitionEnd: 1,
    onAnimationStart: 1,
    onAnimationIteration: 1,
    onAnimationEnd: 1,
    onAppear: 1,
    onDisappear: 1,
    onFirstAppear: 1
  },
  'scroll-view': {
    'enable-back-to-top': g10135
  },
  'cover-view': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
  'cover-image': _utils_system__WEBPACK_IMPORTED_MODULE_0__["isNativeComponent"],
  createWorker: g10135,
  downloadFile: {
    "return": {
      abort: g10135,
      onProgressUpdate: g10135
    }
  },
  uploadFile: {
    "return": {
      abort: g10135,
      onProgressUpdate: g10135
    }
  },
  'rich-text': 1
};

function canIUse(bridge, name) {
  var parts = name.split('.');

  if (parts.length === 1 && bridge[parts[0]]) {
    return true;
  }

  var end = uses; // 动态挂载二方组件caniuse配置

  if (!uses[parts[0]] && Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(_utils_extraComponentMap__WEBPACK_IMPORTED_MODULE_4__["default"]).indexOf(parts[0]) > -1) {
    Object(_utils_loadExtraRes__WEBPACK_IMPORTED_MODULE_3__["default"])(_utils_extraComponentMap__WEBPACK_IMPORTED_MODULE_4__["default"][parts[0]]);
    var extraComponentName = parts[0].split('-').map(function (item) {
      return Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__["default"])(item);
    }).join(''); // 挂载到global下

    if (global["MP".concat(extraComponentName)]) {
      uses[parts[0]] = global["MP".concat(extraComponentName)].canIUse;
    } else {
      console.error("component ".concat(parts[0], "'s canIUse is invalid"));
    }
  } // 动态加载二方API的caniuse配置
  // 还需要考虑ns，目前只考虑ap这个命名空间


  var extraAPIName = parts[0];
  var needLoadExtraAPICanIUse = false;

  if (['ap'].indexOf(parts[0]) > -1 && parts.length > 1) {
    uses[parts[0]] = uses[parts[0]] || {};
    extraAPIName = "".concat(parts[0], ".").concat(parts[1]);
    needLoadExtraAPICanIUse = !uses[parts[0]][parts[1]];
  } else {
    needLoadExtraAPICanIUse = !uses[parts[0]];
  }

  if (needLoadExtraAPICanIUse && Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(_utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_5__["default"]).indexOf(extraAPIName) > -1) {
    Object(_utils_loadExtraRes__WEBPACK_IMPORTED_MODULE_3__["default"])(_utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_5__["default"][extraAPIName]);
    var realExtraAPIName = extraAPIName.split('.')[extraAPIName.split('.').length - 1]; // 挂载到global下

    var realExtraAPI = global["MP".concat(Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__["default"])(realExtraAPIName))];

    if (realExtraAPI) {
      if (parts.length > 1) {
        uses[parts[0]][parts[1]] = realExtraAPI.canIUse;
      } else {
        uses[parts[0]] = realExtraAPI.canIUse;
      }
    } else {
      console.error("API ".concat(extraAPIName, "'s canIUse is invalid"));
    }
  }

  for (var i = 0; i < parts.length; i++) {
    end = end[parts[i]];

    if (!end) {
      return false;
    }
  }

  return true;
}

/* harmony default export */ __webpack_exports__["default"] = (canIUse);
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/apis/worker/canvas/CanvasAPI.js":
/*!*********************************************!*\
  !*** ./src/apis/worker/canvas/CanvasAPI.js ***!
  \*********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _apis_callRender_worker__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/apis/callRender.worker */ "./src/apis/callRender.worker.js");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
/* harmony import */ var _apis_ap__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/apis/ap */ "./src/apis/ap.worker.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/EventEmitter */ "./src/utils/EventEmitter.js");
/* harmony import */ var _utils_resolvePath__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/utils/resolvePath */ "./src/utils/resolvePath.js");
/* harmony import */ var _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @/utils/upperFirstChar */ "./src/utils/upperFirstChar.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../util */ "./src/apis/util.js");
/* harmony import */ var _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./CanvasProtocolEncoder */ "./src/apis/worker/canvas/CanvasProtocolEncoder.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./bridge */ "./src/apis/worker/canvas/bridge.js");




function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_2___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }












var styleProperties = ['fillStyle', 'strokeStyle', 'globalAlpha', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'textBaseline', 'lineDashOffset', 'textAlign', 'globalCompositeOperation'];

function getSetUpperName(name) {
  return "set".concat(Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_10__["default"])(name));
}

function clean(obj) {
  var ret = _objectSpread({}, obj);

  delete ret.success;
  delete ret.error;
  delete ret.complete;
  return ret;
}

var allSetProperties = [].concat(styleProperties, ['shadow', 'fontSize', 'font']);

function Context(id, _ref) {
  var page = _ref.page,
      enableNative = _ref.enableNative;
  this.callBackMap = {};
  this.actions = [];
  this.callId = 0;
  this.id = id;
  this.emitter = new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_8__["default"]();
  this.page = page;
  this.enableNative = enableNative !== false && _utils_system__WEBPACK_IMPORTED_MODULE_6__["isNativeComponent"] && Object(_framework___WEBPACK_IMPORTED_MODULE_4__["getStartupParams"])().hasNativeCanvas;
  this.state = {
    font: '10px Arial',
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: 'Arial'
  }; // 以下为compact协议中使用字段
  // 是否开启字符协议, 用于调试
  // 开启条件(需都满足)：
  // 1.选择使用native canvas
  // 2.android平台, 且客户端通过动态推包获取到native canvas bundle
  // 3.启动参数中nativeCanvasCompactProtocol标记位为true

  if (this.enableNative) {
    this.enableCompactProtocol = Object(_framework___WEBPACK_IMPORTED_MODULE_4__["getStartupParams"])().nativeCanvasCompactProtocol;
    this.protocolVersion = '1'; // 前端管理图片的异步加载，包括已加载图片buffer, 正在加载的图片buffer, 等待加载的frame buffer的图片buffer, 防止重复调用
    // 图片buffer只有compact协议中才使用

    this.localImageBuffer = {}; // 正在loading的图片buffer

    this.localImageLoadingBuffer = {};
    this.actionsShouldLoadImage = false;
  }

  var ctx = this;
  allSetProperties.forEach(function (style) {
    Object.defineProperty(ctx, style, {
      configurable: true,
      set: function set(value) {
        ctx[getSetUpperName(style)](value);
      }
    });
  });
}

var imageDataAPI = {
  getImageData: {
    v: function v(opt) {
      if ((Number(opt.width) || 0) === 0) {
        return {
          message: 'the source width is 0'
        };
      }

      if ((Number(opt.height) || 0) === 0) {
        return {
          message: 'the source height is 0'
        };
      }
    },
    b: function b(opt) {
      opt.x = Number(opt.x) || 0;
      opt.y = Number(opt.y) || 0;
      opt.width = Number(opt.width) || 0;
      opt.height = Number(opt.height) || 0;
    },
    a: function a(res) {
      res.data = new Uint8ClampedArray(res.data);
    }
  },
  putImageData: {
    v: function v(opt) {
      if (typeof opt.width !== 'number') {
        return {
          message: 'width argument must be an Number'
        };
      }

      if (Object.prototype.toString.call(opt.data) !== '[object Uint8ClampedArray]') {
        return {
          message: 'data argument must be an Uint8ClampedArray'
        };
      }
    },
    b: function b(opt) {
      opt.x = Number(opt.x) || 0;
      opt.y = Number(opt.y) || 0;
      opt.height = typeof opt.height === 'number' ? opt.height : opt.data.length / opt.width / 4 | 0;
      opt.data = Array.prototype.slice.call(opt.data);
    }
  }
};
var contextPrototype = Context.prototype = {
  _getPage: function _getPage() {
    return this.page || Object(_framework___WEBPACK_IMPORTED_MODULE_4__["getCurrentPageImpl"])();
  },
  _listen: function _listen(type, callback) {
    var _this = this;

    var emitter = this.emitter;
    emitter.on(type, callback);

    if (emitter.listenerCount(type) === 1 && !this.callBackMap[type]) {
      var listener = this.callBackMap[type] = function (e) {
        if (e.viewId === _this._getPage().getViewId() && e.data.element === _this.id) {
          var data = _objectSpread({}, e.data);

          delete data.NBPageUrl;
          data.type = data.eventType;
          delete data.eventType;
          emitter.emit(type, data);
        }
      };

      _apis_ap__WEBPACK_IMPORTED_MODULE_5__["default"].on(type, listener);
    }
  },
  _unListen: function _unListen(type, callback) {
    var emitter = this.emitter;
    emitter.off(type, callback);

    if (emitter.listenerCount(type) === 0) {
      var listener = this.callBackMap[type];

      if (listener) {
        _apis_ap__WEBPACK_IMPORTED_MODULE_5__["default"].off(type, listener);
        delete this.callBackMap[type];
      }
    }
  },
  _commitDrawFrame: function _commitDrawFrame(reserve, actions, callback) {
    var actionsEncoded = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeDrawActions(this, actions);

    if (this.enableNative) {
      var data = {
        timeStamp: Date.now(),
        actions: actionsEncoded,
        reserve: reserve
      }; // 告诉客户端传输数据所采用的协议版本, 让客户端采用对应方式解析
      // 升级版本时需注意客户端兼容情况

      if (this.enableCompactProtocol) {
        data.protocolVersion = this.protocolVersion;
      }

      Object(_bridge__WEBPACK_IMPORTED_MODULE_13__["callCanvasBridge"])('NBComponent.sendMessage', {
        actionType: 'draw',
        element: this.id,
        viewId: this._getPage().getViewId(),
        data: data
      }, callback);
    } else {
      // console.log("draw for web:", actionsEncoded);
      this._getPage().callRemote("refComponents.".concat(this.id), 'draw', actionsEncoded, reserve, function (res) {
        if (typeof callback === 'function') {
          callback(res);
        }
      });
    }
  },
  addEventListener: function addEventListener(type, callback) {
    this._listen("nbcomponent.canvas.on".concat(Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_10__["default"])(type)), callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    this._unListen("nbcomponent.canvas.on".concat(Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_10__["default"])(type)), callback);
  },
  destroy: function destroy() {
    var _this2 = this;

    Object.keys(this.callBackMap).forEach(function (k) {
      _apis_ap__WEBPACK_IMPORTED_MODULE_5__["default"].off(k, _this2.callBackMap[k]);
    });
  },
  draw: function draw(reserve, callback) {
    var that = this;
    var encoder = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"];

    if (this.enableCompactProtocol) {
      // 需要加载的图片url
      var toLoadImgUrls = [];

      if (this.actionsShouldLoadImage) {
        // 检测当前actions是否需要加载图片(含drawImage/fillStyle=pattern等)
        for (var i = 0; i < this.actions.length; i++) {
          var action = this.actions[i];
          var url = encoder.getNotLoadingImageUrlFromAction(this, action);

          if (url && toLoadImgUrls.indexOf(url) < 0) {
            toLoadImgUrls.push(url);
          }
        }
      }

      if (toLoadImgUrls.length > 0) {
        var frameData = {
          reserve: reserve,
          actions: this.actions,
          callback: callback
        };
        encoder.performLoadImage(this, toLoadImgUrls, function () {
          encoder.onImageLoadComplete(that, frameData);
        });
      } // 需要等待图片加载完，才触发渲染


      if (toLoadImgUrls != null && toLoadImgUrls.length > 0 || this.localImageLoadingBuffer.length > 0) {
        // 重置图片加载状态,为下一帧重置状态
        this.actionsShouldLoadImage = false;
        this.actions = [];
        return;
      }
    } // 重置图片加载状态


    this.actionsShouldLoadImage = false; // debug('framework', `drawCanvas:reserve:${reserve}`, this.actions);

    this._commitDrawFrame(reserve, this.actions, callback); // 清空actions


    this.actions = [];
  },
  toDataURL: function toDataURL(params) {
    var _this3 = this;

    if (this.enableNative) {// todo
    } else {
      return new Promise(function (resolve, reject) {
        Object(_apis_callRender_worker__WEBPACK_IMPORTED_MODULE_3__["default"])('toDataURL', {
          page: _this3._getPage(),
          caller: "refComponents.".concat(_this3.id),
          args: [_objectSpread(_objectSpread({}, params), {}, {
            success: function success(res) {
              resolve(res);

              if (params.success) {
                params.success(res);
              }
            },
            fail: function fail(res) {
              reject(res);

              if (params.fail) {
                params.fail(res);
              }
            },
            complete: function complete(res) {
              if (params.complete) {
                params.complete(res);
              }
            }
          })]
        });
      });
    }
  },
  toTempFilePath: function toTempFilePath(params) {
    var _this4 = this;

    if (this.enableNative) {
      return Object(_bridge__WEBPACK_IMPORTED_MODULE_13__["callBridgeAPI"])(this, 'toTempFilePath', clean(params), params);
    } else {
      return new Promise(function (resolve, reject) {
        Object(_apis_callRender_worker__WEBPACK_IMPORTED_MODULE_3__["default"])('toTempFilePath', {
          page: _this4._getPage(),
          caller: "refComponents.".concat(_this4.id),
          args: [_objectSpread(_objectSpread({}, params), {}, {
            success: function success(res) {
              resolve(res);

              if (params.success) {
                params.success(res);
              }
            },
            fail: function fail(res) {
              reject(res);

              if (params.fail) {
                params.fail(res);
              }
            },
            complete: function complete(res) {
              if (params.complete) {
                params.complete(res);
              }
            }
          })]
        });
      });
    }
  },
  setShadow: function setShadow() {
    var offsetX = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var offsetY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var blur = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var color = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'black';
    this.actions = this.actions.concat(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeProperties(this, [{
      property: 'shadowOffsetX',
      value: offsetX
    }, {
      property: 'shadowOffsetY',
      value: offsetY
    }, {
      property: 'shadowBlur',
      value: blur
    }, {
      property: 'shadowColor',
      value: color
    }]));
  },
  setFontSize: function setFontSize(value) {
    this.state.font = this.state.font.replace(/\d+\.?\d*px/, "".concat(value, "px"));
    this.state.fontSize = value;
    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeProperty(this, {
      property: 'font',
      value: this.state.font
    }));
  },
  setFont: function setFont(value) {
    var _this5 = this;

    this.state.font = value;
    var matches = value.match(/^(([\w\-]+\s)*)(\d+px)(\/(\d+\.?\d*(px)?))?\s+(.*)/);

    if (matches) {
      var fontStyles = matches[1].trim().split(/\s/);
      this.state.fontSize = parseFloat(matches[3]);
      this.state.fontFamily = matches[7];
      fontStyles.forEach(function (s) {
        if (['italic', 'oblique', 'normal'].indexOf(s) > -1) {
          _this5.state.fontStyle = s;
        } else if (['bold', 'normal'].indexOf(s) > -1) {
          _this5.state.fontWeight = s;
        }
      });
    }

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeProperty(this, {
      property: 'font',
      value: value
    }));
  },
  createPattern: function createPattern() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    if (this.enableCompactProtocol) {
      return {
        "class": 'pattern',
        action: 'createPattern',
        args: args
      };
    } else {
      this.actions.push({
        action: 'createPattern',
        callId: ++this.callId,
        args: args
      });
      return {
        $callId: this.callId
      };
    }
  }
};
Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_7__["default"])(imageDataAPI).forEach(function (apiName) {
  var apiConfig = imageDataAPI[apiName] || {};

  contextPrototype[apiName] = function (param) {
    var _this6 = this;

    var _a = Object(_util__WEBPACK_IMPORTED_MODULE_11__["handleCallbackParams"])(param);

    var success = _a.success,
        fail = _a.fail,
        rest = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_1___default()(_a, ["success", "fail"]);

    if (apiConfig && apiConfig.v) {
      var error = apiConfig.v(rest);

      if (error) {
        fail({
          errorMessage: error.message,
          error: error.message
        });
        return;
      }
    }

    if (apiConfig && apiConfig.b) {
      apiConfig.b(rest);
    }

    if (this.enableNative) {
      return Object(_bridge__WEBPACK_IMPORTED_MODULE_13__["callBridgeAPI"])(this, apiName, rest, param);
    }

    return new Promise(function (resolve, reject) {
      var _getPage2;

      var args = ["refComponents.".concat(_this6.id), apiName];

      var newSuccess = function newSuccess(originRes) {
        var res = originRes;

        if (apiConfig.a) {
          apiConfig.a(res);
        }

        resolve(res);

        if (success) {
          success(res);
        }
      };

      var newFail = function newFail(res) {
        reject(res);

        if (fail) {
          fail(res);
        }
      };

      args.push(rest, newSuccess, newFail);

      (_getPage2 = _this6._getPage()).callRemote.apply(_getPage2, args);
    });
  };
});
styleProperties.forEach(function (property) {
  contextPrototype[getSetUpperName(property)] = function set(value) {
    var that = this;

    if (this.enableCompactProtocol) {
      // pattern涉及图片异步load,提前处理
      if ((property === 'fillStyle' || property === 'strokeStyle') && value != null && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(value) === 'object' && value["class"] === 'pattern') {
        var firstArg = value.args[0];

        if (typeof firstArg === 'string' && firstArg) {
          var imgInfo = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].getLoadedImage(that, firstArg);

          if (imgInfo) {
            if (_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].isValidImageInfo(imgInfo)) {
              value.args = [imgInfo.id, imgInfo.width, imgInfo.height, value.args[1]];
            } else {
              // 无效图片，不计入最终actions
              return;
            }
          } else {
            that.actionsShouldLoadImage = true; // 未在本地加载的图片，action格式为未转化

            that.actions.push({
              property: property,
              // value格式：{class:xx, args:[]}
              value: value
            });
            return;
          }
        } else if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(firstArg) === 'object' && _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].isValidImageInfo(firstArg)) {
          value.args = [firstArg.id, firstArg.width, firstArg.height, value.args[1]];
        }
      }
    }

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeProperty(this, {
      property: property,
      value: value
    }));
  };
});
['createLinearGradient', 'createRadialGradient', 'createCircularGradient'].forEach(function (_action) {
  contextPrototype[_action] = function pushAction() {
    for (var _len2 = arguments.length, _args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      _args[_key2] = arguments[_key2];
    }

    var args = _args;
    var action = _action;

    if (action === 'createCircularGradient') {
      action = 'createRadialGradient';
      args = [args[0], args[1], 0, args[0], args[1], args[2]];
    }

    var className = '';

    if (action === 'createLinearGradient') {
      className = 'linearGradient';
    } else {
      className = 'radialGradient';
    }

    if (this.enableCompactProtocol) {
      return {
        "class": className,
        positions: [],
        colors: [],
        args: args,
        addColorStop: function addColorStop(pos, color) {
          this.positions.push(pos);
          this.colors.push(color);
        }
      };
    } else {
      var nested = [];
      this.actions.push({
        action: action,
        nested: nested,
        callId: ++this.callId,
        args: args
      });
      return {
        $callId: this.callId,
        addColorStop: function addColorStop() {
          for (var _len3 = arguments.length, innerArgs = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            innerArgs[_key3] = arguments[_key3];
          }

          nested.push({
            action: 'addColorStop',
            args: innerArgs
          });
        }
      };
    }
  };
});
['clip', 'fill', 'rect', 'fillRect', 'strokeRect', 'stroke', 'scale', 'rotate', 'translate', 'save', 'restore', 'clearRect', 'fillText', 'moveTo', 'lineTo', 'arcTo', 'arc', 'transform', 'setTransform', 'stroke', 'beginPath', 'closePath', 'quadraticCurveTo', 'bezierCurveTo', 'setLineDash', 'strokeText'].forEach(function (action) {
  contextPrototype[action] = function pushAction() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeDrawApi(this, {
      action: action,
      args: args
    }));
  };
});
contextPrototype.isCanvasContext = 1;

contextPrototype.drawImage = function (img_) {
  var img = img_;

  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  if (typeof img === 'string') {
    if (this._getPage()) {
      img = Object(_utils_resolvePath__WEBPACK_IMPORTED_MODULE_9__["default"])(img_, "/".concat(this._getPage().getPagePath()));
    }

    if (this.enableCompactProtocol) {
      // compact协议会将drawImage尝试转化为draw本地cache格式
      var imgInfo = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].getLoadedImage(this, img);
      var finalArgs;

      if (imgInfo) {
        // 扩展为全参数格式
        if (_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].isValidImageInfo(imgInfo)) {
          finalArgs = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].formatDrawImageArgs(imgInfo, args);
        } else {
          // 无效图片, 不计入actions
          return;
        }
      } else {
        this.actionsShouldLoadImage = true;
        finalArgs = [img].concat(args); // 未在本地加载的图片，action格式为未转化

        this.actions.push({
          action: 'drawImage',
          args: finalArgs
        });
        return;
      }
    } else {
      finalArgs = [img].concat(args);
    }

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeDrawApi(this, {
      action: 'drawImage',
      args: finalArgs
    }));
  } else if (img && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(img) === 'object' && _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].isValidImageInfo(img)) {
    // 有效的图片对象格式
    if (this.enableCompactProtocol) {
      var fArgs = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].formatDrawImageArgs(img, args);
      this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeDrawApi(this, {
        action: 'drawImage',
        args: fArgs
      }));
    }
  } else if (img && img.isCanvasContext) {
    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_12__["default"].encodeDrawApi(this, {
      action: 'drawCanvas',
      args: [img.id].concat(args)
    }));
  }
};

contextPrototype.measureText = function measureText(value) {
  if (this.enableNative) {
    var result = Object(_bridge__WEBPACK_IMPORTED_MODULE_13__["callBridgeAPI"])(this, 'measureText', {
      text: value,
      font: this.state.font
    }, undefined, true);

    if (!result) {
      result = {};
    }

    return result;
  }

  var _this$state = this.state,
      fontSize = _this$state.fontSize,
      fontFamily = _this$state.fontFamily,
      fontWeight = _this$state.fontWeight,
      fontStyle = _this$state.fontStyle;
  return _apis_ap__WEBPACK_IMPORTED_MODULE_5__["default"].callSync('measureText', {
    text: value,
    fontSize: fontSize,
    fontFamily: fontFamily,
    fontWeight: fontWeight,
    fontStyle: fontStyle
  });
};

/* harmony default export */ __webpack_exports__["default"] = ({
  canvasToTempFilePath: function canvasToTempFilePath() {
    for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
      args[_key6] = arguments[_key6];
    }

    Object(_apis_callRender_worker__WEBPACK_IMPORTED_MODULE_3__["default"])('toTempFilePath', {
      caller: "refComponents.".concat(args[0].canvasId),
      args: args
    });
  },
  createCanvasContext: function createCanvasContext(id, options) {
    return new Context(id, _objectSpread(_objectSpread({}, options), {}, {
      page: Object(_framework___WEBPACK_IMPORTED_MODULE_4__["getCurrentPageImpl"])()
    }));
  }
});

/***/ }),

/***/ "./src/apis/worker/canvas/CanvasProtocolEncoder.js":
/*!*********************************************************!*\
  !*** ./src/apis/worker/canvas/CanvasProtocolEncoder.js ***!
  \*********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _apis_ap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/apis/ap */ "./src/apis/ap.worker.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./bridge */ "./src/apis/worker/canvas/bridge.js");



var callBridge = _apis_ap__WEBPACK_IMPORTED_MODULE_1__["default"].callBridge;
var g10150 = false; // compareSystemVersion('10.1.50') >= 0;
// ////////////////////////////////////////////////////////////////////////
//
// canvas私有拼串协议实现
// 协议目前只影响draw()接口的action
// 单独调用的接口不受影响
// 有：measureText, getImageData, putImageData, toTempFilePath
//
// ////////////////////////////////////////////////////////////////////////

var CanvasProtocolEncoder = {
  textMaxWidth: '100000000',
  gcanvasCommandMap: {
    clip: 'p',
    fill: 'L',
    rect: 'w',
    fillRect: 'n',
    strokeRect: 's',
    clearRect: 'c',
    stroke: 'x',
    scale: 'k',
    rotate: 'r',
    translate: 'l',
    save: 'v',
    restore: 'e',
    fillText: 'T',
    moveTo: 'g',
    lineTo: 'i',
    arcTo: 'h',
    arc: 'y',
    transform: 'f',
    setTransform: 't',
    beginPath: 'b',
    closePath: 'o',
    quadraticCurveTo: 'u',
    bezierCurveTo: 'z',
    setLineDash: 'I',
    strokeText: 'U',
    drawImage: 'd',
    // property
    strokeStyle: 'S',
    shadowBlur: 'Z',
    shadowColor: 'K',
    shadowOffsetX: 'X',
    shadowOffsetY: 'Y',
    lineCap: 'C',
    lineWidth: 'W',
    lineJoin: 'J',
    miterLimit: 'M',
    font: 'j',
    textAlign: 'A',
    textBaseline: 'E',
    lineDashOffset: 'N',
    globalAlpha: 'a',
    globalCompositeOperation: 'V',
    pattern: 'G',
    fillStyle: 'F',
    linearGradient: 'D',
    radialGradient: 'H'
  },
  replaceToken: function replaceToken(text) {
    if (typeof text === 'string') {
      text = text.replace(/!/g, '!!');
      text = text.replace(/,/g, '!,');
      text = text.replace(/;/g, '!;');
    }

    return text;
  },
  reverseReplaceToken: function reverseReplaceToken(text) {
    if (typeof text === 'string') {
      text = text.replace(/!!/g, '!');
      text = text.replace(/!,/g, ',');
      text = text.replace(/!;/g, ';');
    }

    return text;
  },
  valueToStr: function valueToStr(v) {
    // console.log("typeof v: ", typeof v, "value=", v)
    if (typeof v === 'boolean') {
      v = v ? '1' : '0';
    }

    return v;
  },
  formatValue: function formatValue(args) {
    if (!args) {
      // 空参数，直接转为空串
      return '';
    }

    if (Array.isArray(args)) {
      for (var i = 0; i < args.length; i += 1) {
        var item = args[i];

        if (typeof item === 'number') {// 浮点数缩减
          // args[i] = Number(args[i]).toFixed(6);
        } else {
          args[i] = this.valueToStr(item);
        }
      }
    } else if (typeof args === 'string') {
      if (args === 'null' || !args) {
        args = '';
      }
    } else if (typeof args === 'boolean') {
      args = this.valueToStr(args);
    }

    return args;
  },
  isArgsValidArray: function isArgsValidArray(args) {
    return args && Array.isArray(args);
  },
  formatDrawImageArgs: function formatDrawImageArgs(imgInfo, args) {
    var w = imgInfo.width;
    var h = imgInfo.height; // 扩展为全参数格式

    if (args.length === 2) {
      args = [w, h, 0, 0, w, h, args[0], args[1], w, h];
    } else if (args.length === 4) {
      args = [w, h, 0, 0, w, h, args[0], args[1], args[2], args[3]];
    } else if (args.length === 8) {
      args = [w, h].concat(args);
    }

    return [imgInfo.id].concat(args);
  },
  _encodeDrawActions: function _encodeDrawActions(actions) {
    var str = '';

    for (var i = 0; i < actions.length; i += 1) {
      if (typeof actions[i] === 'string') {
        str += actions[i];
      }
    }

    return str;
  },
  _encodeDrawApi: function _encodeDrawApi(params) {
    params.args = this.formatValue(params.args); // 前置处理

    if (params.action === 'fillText') {
      // 文本加'!'前缀
      if (this.isArgsValidArray(params.args)) {
        params.args[0] = this.replaceToken(params.args[0]);

        if (params.args.length === 3) {
          params.args.push(this.textMaxWidth);
        }
      }
    } else if (params.action === 'strokeText') {
      // 文本加'!'前缀
      if (this.isArgsValidArray(params.args)) {
        params.args[0] = this.replaceToken(params.args[0]);

        if (params.args.length === 3) {
          params.args.push(this.textMaxWidth);
        }
      }
    } else if (params.action === 'setLineDash') {
      // 拼接长度
      if (params.args && Array.isArray(params.args[0])) {
        params.args = [params.args[0].length].concat(params.args[0]);
      }
    }

    var realName = this.gcanvasCommandMap[params.action];

    if (realName) {
      var v = '';

      if (Array.isArray(params.args)) {
        v = params.args.join(',');
      } else {
        v = params.args;
      }

      return "".concat(realName + v, ";");
    } else {
      // 未提供映射的，直接返回原值
      return '';
    }
  },
  _encodeProperty: function _encodeProperty(params) {
    var that = this;
    params.value = this.formatValue(params.value); // pattern／gradient前置处理

    if (params.property === 'fillStyle' || params.property === 'strokeStyle') {
      if (params.value && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(params.value) === 'object') {
        // dict类型，可能是pattern/gradient这些
        var obj = params.value;
        var args = [];

        if (obj && obj["class"]) {
          var isStroke = params.property === 'strokeStyle'; // 使用class替换原property name, 将fillStyle/strokeStyle转化为gradient命令

          params.property = obj["class"]; // 拷贝obj.args数组元素，避免改变原数组

          if (obj["class"] === 'pattern' || obj["class"] === 'linearGradient' || obj["class"] === 'radialGradient') {
            for (var i = 0; i < obj.args.length; i += 1) {
              args[i] = obj.args[i];
            }

            if (obj["class"] === 'pattern') {// ignore [id,width,height,mode]
            } else if (obj["class"] === 'linearGradient') {
              if (obj.positions && obj.positions.length > 0) {
                args.push(obj.positions.length);

                for (var k in obj.positions) {
                  args.push(obj.positions[k]);
                }

                for (var _k in obj.colors) {
                  args.push(obj.colors[_k]);
                }
              }
            } else if (obj["class"] === 'radialGradient') {
              if (obj.positions && obj.positions.length > 0) {
                args.push(obj.positions.length);

                for (var _k2 in obj.positions) {
                  args.push(obj.positions[_k2]);
                }

                for (var _k3 in obj.colors) {
                  args.push(obj.colors[_k3]);
                }
              }
            } // 如果为stroke, 在最后添加stroke标记参数(fill无需添加)


            if (isStroke) {
              args.push('1');
            }
          }
        } // 无效格式
        // console.log(obj);


        params.value = args;
      } else if (params.value && typeof params.value === 'string') {
        if (params.value.length > 64) {
          params.value = '';
        }
      }
    } else if (params.property === 'textAlign') {
      params.value = this._encodeTextAlignValue(params.value);
    } else if (params.property === 'textBaseline') {
      params.value = this._encodeTextBaseline(params.value);
    }

    var realName = this.gcanvasCommandMap[params.property];

    if (realName) {
      var v = '';

      if (Array.isArray(params.value)) {
        v = params.value.join(',');
      } else {
        v = params.value;
      }

      return "".concat(realName + v, ";");
    } else {
      // 未提供映射的，说明不支持此操作，返回空
      return '';
    }
  },
  _encodeTextAlignValue: function _encodeTextAlignValue(value) {
    var align = 0;

    switch (value) {
      case 'start':
        align = 0;
        break;

      case 'end':
        align = 1;
        break;

      case 'left':
        align = 2;
        break;

      case 'center':
        align = 3;
        break;

      case 'right':
        align = 4;
        break;

      default:
        align = 0;
    }

    return align;
  },
  _encodeTextBaseline: function _encodeTextBaseline(value) {
    var baseline = 0;

    switch (value) {
      case 'alphabetic':
        baseline = 0;
        break;

      case 'middle':
        baseline = 1;
        break;

      case 'top':
        baseline = 2;
        break;

      case 'hanging':
        baseline = 3;
        break;

      case 'bottom':
        baseline = 4;
        break;

      case 'ideographic':
        baseline = 5;
        break;

      default:
        baseline = 0;
        break;
    }

    return baseline;
  },
  encodeDrawActions: function encodeDrawActions(ctx, actions) {
    if (this.checkUseCompactProtocal(ctx)) {
      return this._encodeDrawActions(actions);
    } else {
      return actions;
    }
  },
  encodeDrawApi: function encodeDrawApi(ctx, value) {
    if (this.checkUseCompactProtocal(ctx)) {
      return this._encodeDrawApi(value);
    } else {
      return value;
    }
  },

  /**
     * value格式：{property: $pname, value: $value}
     */
  encodeProperty: function encodeProperty(ctx, value) {
    if (this.checkUseCompactProtocal(ctx)) {
      return this._encodeProperty(value);
    } else {
      return value;
    }
  },
  encodeProperties: function encodeProperties(ctx, setPropertyArr) {
    if (this.checkUseCompactProtocal(ctx)) {
      var arr = [];

      for (var key in setPropertyArr) {
        arr.push(this._encodeProperty(setPropertyArr[key]));
      }

      return arr;
    } else {
      return setPropertyArr;
    }
  },
  putLoadedImage: function putLoadedImage(ctx, url, imgInfo) {
    ctx.localImageBuffer[url] = imgInfo;
  },
  getLoadedImage: function getLoadedImage(ctx, url) {
    // console.log("getLoadedImage: ", this.localImageLoadingBuffer);
    if (ctx.localImageBuffer[url]) {
      return ctx.localImageBuffer[url];
    } else {
      return null;
    }
  },
  putLoadingImage: function putLoadingImage(ctx, url) {
    ctx.localImageLoadingBuffer[url] = 1;
  },
  getLoadingImage: function getLoadingImage(ctx, url) {
    if (ctx.localImageLoadingBuffer[url]) {
      return ctx.localImageLoadingBuffer[url];
    } else {
      return null;
    }
  },
  isValidImageInfo: function isValidImageInfo(imgInfo) {
    return imgInfo != null && imgInfo.id !== '' && imgInfo.id >= 0 && imgInfo.width > 0 && imgInfo.height > 0;
  },
  removeLoadingImage: function removeLoadingImage(ctx, url) {
    delete ctx.localImageLoadingBuffer[url];
  },
  // 批量加载图片
  performLoadImage: function performLoadImage(ctx, urls, cb) {
    // 过滤正在loading的图片
    for (var i = 0; i < urls.length; i += 1) {
      this.putLoadingImage(ctx, urls[i]);
    }

    var that = this;

    var processImageCallback = function processImageCallback(res) {
      if (res.data) {
        var imgList = res.data;

        for (var _i = 0; _i < imgList.length; _i += 1) {
          var item = imgList[_i];
          that.putLoadedImage(ctx, item.url, item);
          that.removeLoadingImage(ctx, item.url);
        }
      }
    }; // 版本判断: 50版本以下走NBComponent.sendMessage(action=loadImage), 高版本使用my.preloadCanvasImage jsapi


    if (g10150) {
      // console.log("start performLoadImage::preloadCanvasImage", urls);
      callBridge('preloadCanvasImage', {
        urls: urls
      }, function (res) {
        processImageCallback(res);
        cb();
      });
    } else {
      Object(_bridge__WEBPACK_IMPORTED_MODULE_2__["callBridgeAPI"])(ctx, 'loadImage', {
        urls: urls
      }, {
        success: function success(res) {
          processImageCallback(res);
        },
        fail: function fail(res) {
          // 所有图片加载失败时返回
          processImageCallback(res);
        },
        complete: function complete() {
          cb();
        }
      }, false);
    }
  },
  // 判断是否图片加载相关的action
  isWaitImageLoadAction: function isWaitImageLoadAction(action) {
    if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(action) === 'object' && action) {
      if (action.action === 'drawImage' || action.property && (action.property === 'fillStyle' || action.property === 'strokeStyle') && action.value != null && _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(action.value) === 'object' && action.value["class"] === 'pattern') {
        return true;
      }
    }

    return false;
  },
  parseImageUrlFromActionUrl: function parseImageUrlFromActionUrl(action) {
    if (!action) {
      return '';
    }

    var args = action.args ? action.args : action.value.args;
    return args[0];
  },
  getNotLoadingImageUrlFromAction: function getNotLoadingImageUrlFromAction(ctx, action) {
    if (this.isWaitImageLoadAction(action)) {
      var url = this.parseImageUrlFromActionUrl(action);

      if (url && isNaN(url) && !this.getLoadingImage(ctx, url)) {
        return url;
      }
    }

    return '';
  },
  replaceImageLoadActions: function replaceImageLoadActions(action, imgInfo) {
    var newAction = '';
    var actionName = action.action ? action.action : action.property; // replace img action url and img infos

    if (actionName === 'drawImage') {
      newAction = this._encodeDrawApi({
        action: actionName,
        args: this.formatDrawImageArgs(imgInfo, action.args.slice(1))
      });
    } else if (actionName === 'fillStyle' || actionName === 'strokeStyle') {
      var value = {
        "class": 'pattern',
        args: [imgInfo.id, imgInfo.width, imgInfo.height].concat(action.value.args.slice(1))
      };
      newAction = this._encodeProperty({
        property: actionName,
        value: value
      });
    }

    return newAction;
  },
  onImageLoadComplete: function onImageLoadComplete(ctx, frameData) {
    for (var j = 0; j < frameData.actions.length; j += 1) {
      var action = frameData.actions[j];
      var url = this.getNotLoadingImageUrlFromAction(ctx, action);

      if (url) {
        var imgInfo = this.getLoadedImage(ctx, url);

        if (!this.isValidImageInfo(imgInfo)) {
          // 图片加载失败情况下无效掉命令
          // console.log("loadImagefail,replace frame with emtpy: ", frameData.actions);
          frameData.actions[j] = ''; // continue;
        } else {
          // replace img action url and img infos
          frameData.actions[j] = this.replaceImageLoadActions(action, imgInfo);
        }
      }
    }

    this.flushDrawFrame(ctx, frameData);
  },
  flushDrawFrame: function flushDrawFrame(ctx, frameData) {
    // 重置图片加载状态
    ctx.actionsShouldLoadImage = false;

    ctx._commitDrawFrame(frameData.reserve, frameData.actions, frameData.callback);
  },
  checkUseCompactProtocal: function checkUseCompactProtocal(ctx) {
    return ctx.enableCompactProtocol;
  }
};
/* harmony default export */ __webpack_exports__["default"] = (CanvasProtocolEncoder);

/***/ }),

/***/ "./src/apis/worker/canvas/bridge.js":
/*!******************************************!*\
  !*** ./src/apis/worker/canvas/bridge.js ***!
  \******************************************/
/*! exports provided: callCanvasBridge, callCanvasBridgeSync, callBridgeAPI */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "callCanvasBridge", function() { return callCanvasBridge; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "callCanvasBridgeSync", function() { return callCanvasBridgeSync; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "callBridgeAPI", function() { return callBridgeAPI; });
/* harmony import */ var _apis_ap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/apis/ap */ "./src/apis/ap.worker.js");

var callBridge = _apis_ap__WEBPACK_IMPORTED_MODULE_0__["default"].callBridge,
    callBridgeSync = _apis_ap__WEBPACK_IMPORTED_MODULE_0__["default"].callBridgeSync;
var g = self;
function callCanvasBridge(name, params, callback) {
  callBridge(name, params, callback);
}
function callCanvasBridgeSync(name, params) {
  if (g.callMPCanvasBridgeSync) {
    return g.callMPCanvasBridgeSync(params);
  } else {
    return callBridgeSync(name, params);
  }
}
function callBridgeAPI(context, actionType, data) {
  var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var sync = arguments.length > 4 ? arguments[4] : undefined;
  var args = ['NBComponent.sendMessage', {
    actionType: actionType,
    element: context.id,
    viewId: context._getPage().getViewId(),
    data: data
  }];
  return sync ? callCanvasBridgeSync.apply(void 0, args) : new Promise(function (resolve, reject) {
    args.push(function (res) {
      if (res.error) {
        reject(res);

        if (params.fail) {
          params.fail(res);
        }
      } else {
        resolve(res);

        if (params.success) {
          params.success(res);
        }
      }

      if (params.complete) {
        params.complete(res);
      }
    });
    callCanvasBridge.apply(void 0, args);
  });
}

/***/ }),

/***/ "./src/apis/worker/createSelectorQuery.js":
/*!************************************************!*\
  !*** ./src/apis/worker/createSelectorQuery.js ***!
  \************************************************/
/*! exports provided: SelectorQuery, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SelectorQuery", function() { return SelectorQuery; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createSelectorQuery; });
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/classCallCheck */ "./node_modules/@babel/runtime/helpers/classCallCheck.js");
/* harmony import */ var _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/createClass */ "./node_modules/@babel/runtime/helpers/createClass.js");
/* harmony import */ var _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");



var SelectorQuery = /*#__PURE__*/function () {
  function SelectorQuery(page) {
    _babel_runtime_helpers_classCallCheck__WEBPACK_IMPORTED_MODULE_0___default()(this, SelectorQuery);

    this.actions = [];
    this.page = page;
  }

  _babel_runtime_helpers_createClass__WEBPACK_IMPORTED_MODULE_1___default()(SelectorQuery, [{
    key: "select",
    value: function select(selector) {
      this.selector = {
        value: selector
      };
      return this;
    }
  }, {
    key: "selectAll",
    value: function selectAll(selector) {
      this.selector = {
        value: selector,
        type: 'all'
      };
      return this;
    }
  }, {
    key: "selectViewport",
    value: function selectViewport() {
      this.selector = {
        value: 'viewport'
      };
      return this;
    }
  }, {
    key: "boundingClientRect",
    value: function boundingClientRect() {
      if (this.selector) {
        this.actions.push({
          selector: this.selector,
          type: 'rect'
        });
        this.selector = null;
      }

      return this;
    }
  }, {
    key: "scrollOffset",
    value: function scrollOffset() {
      if (this.selector) {
        this.actions.push({
          selector: this.selector,
          type: 'scroll'
        });
        this.selector = null;
      }

      return this;
    }
  }, {
    key: "exec",
    value: function exec(callback) {
      var page = this.page || Object(_framework___WEBPACK_IMPORTED_MODULE_2__["getCurrentPageImpl"])();

      if (page) {
        page.callRemote('bridge', 'createSelectorQuery', this.actions, callback);
      }
    }
  }]);

  return SelectorQuery;
}();
function createSelectorQuery() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      page = _ref.page;

  return new SelectorQuery(page);
}

/***/ }),

/***/ "./src/bridge/const.js":
/*!*****************************!*\
  !*** ./src/bridge/const.js ***!
  \*****************************/
/*! exports provided: CUSTOM_EVENT */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CUSTOM_EVENT", function() { return CUSTOM_EVENT; });
/** render/worker 相互监听事件前缀 */
var CUSTOM_EVENT = 'custom_event_';

/***/ }),

/***/ "./src/bridge/createBridge.js":
/*!************************************!*\
  !*** ./src/bridge/createBridge.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createBridge; });
/* harmony import */ var _createSubscribe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createSubscribe */ "./src/bridge/createSubscribe.js");
/* harmony import */ var _createPublish__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./createPublish */ "./src/bridge/createPublish.js");
/* harmony import */ var _createInvoke__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./createInvoke */ "./src/bridge/createInvoke.js");



function createBridge(jsCore) {
  var _createSubscribe = Object(_createSubscribe__WEBPACK_IMPORTED_MODULE_0__["default"])(),
      subscribeHandler = _createSubscribe.subscribeHandler,
      onNative = _createSubscribe.onNative,
      offNative = _createSubscribe.offNative,
      subscribe = _createSubscribe.subscribe,
      unsubscribe = _createSubscribe.unsubscribe;

  var _createInvoke = Object(_createInvoke__WEBPACK_IMPORTED_MODULE_2__["default"])(jsCore, onNative),
      invokeNative = _createInvoke.invokeNative,
      invokeHandler = _createInvoke.invokeHandler;

  var _createPublish = Object(_createPublish__WEBPACK_IMPORTED_MODULE_1__["default"])(jsCore),
      publish = _createPublish.publish;

  return {
    // 宿主调用
    invokeHandler: invokeHandler,
    subscribeHandler: subscribeHandler,
    // 内部方法
    publish: publish,
    invokeNative: invokeNative,
    onNative: onNative,
    offNative: offNative,
    subscribe: subscribe,
    unsubscribe: unsubscribe
  };
}

/***/ }),

/***/ "./src/bridge/createInvoke.js":
/*!************************************!*\
  !*** ./src/bridge/createInvoke.js ***!
  \************************************/
/*! exports provided: Deferred, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Deferred", function() { return Deferred; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createInvoke; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);

function Deferred() {
  var _this = this;

  this.promise = undefined;
  this.resolve = undefined;
  this.reject = undefined;
  this.promise = new Promise(function (resolve, reject) {
    _this.resolve = resolve;
    _this.reject = reject;
  });
}
function createInvoke(jsCore) {
  var resolveId = 0;
  var resolveMap = new Map();

  var invokeHandler = function invokeHandler(resolveId, data) {
    var resolve = resolveMap.get(Number(resolveId));
    if (!resolve) return;
    var response;

    if (typeof data === 'string') {
      try {
        response = JSON.parse(data);
      } catch (e) {
        response = {};
      }
    }

    if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(data) !== 'object') {
      response = {};
    }

    resolve(response);
  };

  var invokeNative = function invokeNative(method, params) {
    var webviewId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : self.WEBVIEWID;
    resolveId += 1;
    var deferred = new Deferred();
    resolveMap.set(resolveId, deferred.resolve);
    params.from = self.__IS_WORKER__ ? 'WORKER' : 'RENDER';
    var webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    var response = jsCore.call({
      event: method,
      paramsString: JSON.stringify(params),
      webviewIds: JSON.stringify(webviewIds),
      callbackId: resolveId
    }); // 同步事件

    if (response) {
      try {
        response = JSON.parse(response);
      } catch (e) {
        console.error(e);
      }

      resolveMap["delete"](resolveId);
      return response;
    } else {
      return deferred.promise;
    }
  };

  return {
    invokeNative: invokeNative,
    invokeHandler: invokeHandler
  };
}

/***/ }),

/***/ "./src/bridge/createPublish.js":
/*!*************************************!*\
  !*** ./src/bridge/createPublish.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createPublish; });
/* harmony import */ var _const__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./const */ "./src/bridge/const.js");

function createPublish(jsCore) {
  var publish = function publish(event, data) {
    var webviewId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : self.WEBVIEWID;
    data.from = self.__IS_WORKER__ ? 'WORKER' : 'RENDER';
    var paramsString = JSON.stringify(data);
    var webviewIds = Array.isArray(webviewId) ? webviewId : [webviewId];
    var webviewIdsString = JSON.stringify(webviewIds);
    var params = {
      event: _const__WEBPACK_IMPORTED_MODULE_0__["CUSTOM_EVENT"] + event,
      paramsString: paramsString,
      webviewIds: webviewIdsString
    };
    jsCore.call(params);
  };

  return {
    publish: publish
  };
}

/***/ }),

/***/ "./src/bridge/createSubscribe.js":
/*!***************************************!*\
  !*** ./src/bridge/createSubscribe.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return createSubscribe; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/EventEmitter */ "./src/utils/EventEmitter.js");
/* harmony import */ var _const__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./const */ "./src/bridge/const.js");



function createSubscribe() {
  var customEmitter = new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__["default"]();
  var nativeEmitter = new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_1__["default"]();
  return {
    onNative: nativeEmitter.on,
    offNative: nativeEmitter.off,
    subscribe: function subscribe(event, listener) {
      customEmitter.on(_const__WEBPACK_IMPORTED_MODULE_2__["CUSTOM_EVENT"] + event, listener);
    },
    unsubscribe: function unsubscribe(event, listener) {
      customEmitter.off(_const__WEBPACK_IMPORTED_MODULE_2__["CUSTOM_EVENT"] + event, listener);
    },
    // 监听消息
    subscribeHandler: function subscribeHandler(event, data, webviewId) {
      var params;

      if (typeof data === 'string') {
        try {
          params = JSON.parse(data);
        } catch (e) {
          params = {};
        }
      }

      if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(params) !== 'object') {
        params = {};
      }

      if (event.startsWith(_const__WEBPACK_IMPORTED_MODULE_2__["CUSTOM_EVENT"])) {
        customEmitter.emit(event, params, webviewId);
      } else {
        nativeEmitter.emit(event, params, webviewId);
      }
    }
  };
}

/***/ }),

/***/ "./src/bridge/index.js":
/*!*****************************!*\
  !*** ./src/bridge/index.js ***!
  \*****************************/
/*! exports provided: invokeHandler, subscribeHandler, publish, subscribe, unsubscribe, invokeNative, onNative, offNative */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invokeHandler", function() { return invokeHandler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subscribeHandler", function() { return subscribeHandler; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "publish", function() { return publish; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subscribe", function() { return subscribe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unsubscribe", function() { return unsubscribe; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "invokeNative", function() { return invokeNative; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "onNative", function() { return onNative; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "offNative", function() { return offNative; });
/* harmony import */ var _createBridge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./createBridge */ "./src/bridge/createBridge.js");
 // 宿主提供的bridge

var jsCore = self.JSCore;

var _createBridge = Object(_createBridge__WEBPACK_IMPORTED_MODULE_0__["default"])(jsCore),
    invokeHandler = _createBridge.invokeHandler,
    subscribeHandler = _createBridge.subscribeHandler,
    publish = _createBridge.publish,
    invokeNative = _createBridge.invokeNative,
    onNative = _createBridge.onNative,
    offNative = _createBridge.offNative,
    subscribe = _createBridge.subscribe,
    unsubscribe = _createBridge.unsubscribe;



/***/ }),

/***/ "./src/framework/App/index.worker.js":
/*!*******************************************!*\
  !*** ./src/framework/App/index.worker.js ***!
  \*******************************************/
/*! exports provided: getApp, App, getCurrentPagesImpl, getCurrentPageImpl, getCurrentPages, getAppImpl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return getApp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "App", function() { return App; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCurrentPagesImpl", function() { return getCurrentPagesImpl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCurrentPageImpl", function() { return getCurrentPageImpl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return getCurrentPages; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAppImpl", function() { return getAppImpl; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_getScene__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/getScene */ "./src/utils/getScene.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/invokeWithGuardAndReThrow */ "./src/utils/invokeWithGuardAndReThrow.js");
/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../startupParams */ "./src/framework/startupParams/index.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _mixins_AppMixin__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../mixins/AppMixin */ "./src/framework/mixins/AppMixin.js");
/* harmony import */ var _utils_appImpl__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/appImpl */ "./src/framework/utils/appImpl.js");
/* harmony import */ var _utils_pageUtils__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../utils/pageUtils */ "./src/framework/utils/pageUtils.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }











var appImpl;
var app;

function pushPage(page) {
  var pages = getCurrentPagesImpl();

  if (!pages.length) {
    var tabPath = appImpl._currentTabPath = page.getPagePath();
    pages = appImpl._tabCaches[tabPath] = [];
  }

  pages.push(page);
}

function popPage(page) {
  var tabCaches = appImpl._tabCaches;
  Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(tabCaches).forEach(function (k) {
    var tabPages = tabCaches[k];

    if (tabPages) {
      for (var i = tabPages.length - 1; i >= 0; i -= 1) {
        if (tabPages[i] === page) {
          tabPages.splice(i, 1);
          return;
        }
      }
    }
  });
}

function getApp() {
  return app;
}
function App() {
  var publicInstance = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (appImpl) {
    throw new Error('App() can only be called once');
  }

  var _getStartupParams = Object(_startupParams__WEBPACK_IMPORTED_MODULE_6__["getStartupParams"])(),
      query = _getStartupParams.query,
      referrerInfo = _getStartupParams.referrerInfo,
      pagePath = _getStartupParams.pagePath;

  var launchOptions = {
    path: pagePath
  };

  if (query) {
    launchOptions.query = qs__WEBPACK_IMPORTED_MODULE_1___default.a.parse(query);
  }

  launchOptions.scene = Object(_utils_getScene__WEBPACK_IMPORTED_MODULE_2__["default"])(Object(_startupParams__WEBPACK_IMPORTED_MODULE_6__["getStartupParams"])());

  if (referrerInfo) {
    launchOptions.referrerInfo = JSON.parse(referrerInfo);
  }

  app = publicInstance;
  appImpl = new AppImpl(publicInstance);
  Object(_utils_appImpl__WEBPACK_IMPORTED_MODULE_9__["setAppImpl"])(appImpl);
  _EventHub__WEBPACK_IMPORTED_MODULE_7__["default"].emit('appCreated', appImpl);
  appImpl.launch(launchOptions);
  return app;
}

function AppImpl(publicInstance) {
  this._tabCaches = {};
  this._currentTabPath = '';
  this.publicInstance = publicInstance; // app status is unstable

  this.shown = true;
}

AppImpl.prototype = _objectSpread(_objectSpread({}, _mixins_AppMixin__WEBPACK_IMPORTED_MODULE_8__["default"]), {}, {
  pushPage: pushPage,
  popPage: popPage,
  getAllPages: function getAllPages() {
    var pages = [];
    var tabCaches = this._tabCaches;
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(tabCaches).forEach(function (k) {
      var tabPages = tabCaches[k];

      if (tabPages) {
        pages = pages.concat(tabPages);
      }
    });
    return pages;
  },
  isTabShow: function isTabShow() {
    var tabCaches = appImpl._tabCaches; // filter destroyed/empty tabs

    var tabKeys = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(tabCaches).filter(function (k) {
      return !!tabCaches[k].length;
    });

    if (!tabKeys.length) {
      return false;
    } // if all invalid tab page


    return tabKeys.every(function (k) {
      return Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_10__["isTabPage"])(tabCaches[k][0]);
    });
  },
  clearAllPages: function clearAllPages() {
    var nowTabCaches = this._tabCaches;
    this._tabCaches = {}; // clear tab caches and page stack

    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(nowTabCaches).forEach(function (k) {
      var tabPages = nowTabCaches[k];

      if (tabPages) {
        tabPages.concat().reverse().forEach(function (page) {
          return page.unload();
        });
      }
    });
    this._currentTabPath = '';
  },
  getPagesByTabPath: function getPagesByTabPath(tabPath) {
    return this._tabCaches[tabPath] || [];
  },
  getPageById: function getPageById(id) {
    return this.getPageBy(function (page) {
      return page.getId() === id;
    });
  },
  getPageByViewId: function getPageByViewId(id) {
    return this.getPageBy(function (page) {
      return page.getViewId() === id;
    });
  },
  getPageObject: function getPageObject(url) {
    var queryIndex = url.indexOf('?');
    var queryString = '';
    var pagePath = url;

    if (queryIndex !== -1) {
      queryString = url.slice(queryIndex + 1);
      pagePath = pagePath.slice(0, queryIndex);
    }

    if (pagePath.charAt(0) === '/') {
      pagePath = pagePath.slice(1);
    }

    return {
      queryString: queryString,
      pagePath: pagePath
    };
  },
  getPageBy: function getPageBy(same) {
    var tabCaches = appImpl._tabCaches;

    for (var k in tabCaches) {
      if (tabCaches.hasOwnProperty(k)) {
        var tabPages = tabCaches[k];

        if (tabPages) {
          for (var i = tabPages.length - 1; i >= 0; i -= 1) {
            if (same(tabPages[i])) {
              return tabPages[i];
            }
          }
        }
      }
    }

    return null;
  },
  launch: function launch() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    this.$launchTime = Date.now();
    this.launchOptions = options;
    _EventHub__WEBPACK_IMPORTED_MODULE_7__["default"].emit('launch', options);
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_3__["debug"])('framework', 'App onLaunch');
    var publicInstance = this.publicInstance;
    var onLaunch = publicInstance.onLaunch;
    var onShow = publicInstance.onShow;
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_5__["default"])(onLaunch, publicInstance, options);
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_5__["default"])(onShow, publicInstance, options);
    this.shown = true;
  },
  hide: function hide() {
    var hidePage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    this.shown = false;
    _EventHub__WEBPACK_IMPORTED_MODULE_7__["default"].emit('background');
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_3__["debug"])('framework', 'App onHide');

    if (hidePage) {
      var page = getCurrentPageImpl();

      if (page) {
        page.hide();
      }
    }

    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_5__["default"])(this.publicInstance.onHide, this.publicInstance);
  },
  show: function show(o) {
    var showPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    this.shown = true;
    var options = o || {};
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_3__["debug"])('framework', 'App onShow');
    _EventHub__WEBPACK_IMPORTED_MODULE_7__["default"].emit('foreground', options);
    var prePage = getCurrentPageImpl();
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_5__["default"])(this.publicInstance.onShow, this.publicInstance, options); // if relaunch, do not invoke previous page show

    if (showPage && !options.path) {
      var page = getCurrentPageImpl();

      if (page && page === prePage) {
        page.show();
      }
    }
  },
  error: function error(e) {
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_5__["default"])(this.publicInstance.onError, this.publicInstance, e);
  },
  navigateBack: function navigateBack() {
    var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var fn = arguments.length > 1 ? arguments[1] : undefined;
    var _params$delta = params.delta,
        delta = _params$delta === void 0 ? 1 : _params$delta;

    if (typeof delta !== 'number') {
      return 'delta must be number!';
    }

    var pages = this.getCurrentPagesImpl();
    var len = pages.length;

    if (len === 1) {
      return 'already top of navigation';
    }

    if (delta >= len) {
      delta = len - 1;
    }

    fn({
      delta: delta
    });
  },
  setCurrentPagesImpl: function setCurrentPagesImpl(pages, _tabPath) {
    var tabPath = _tabPath || this._currentTabPath;

    if (pages.length) {
      tabPath = pages[0].getPagePath();
    }

    this._currentTabPath = tabPath;
    this._tabCaches[tabPath] = pages;
  },
  getCurrentPagesImpl: getCurrentPagesImpl,
  getCurrentPageImpl: getCurrentPageImpl
}); // remove from page stack

_EventHub__WEBPACK_IMPORTED_MODULE_7__["default"].addListener('pageUnload', function (_ref) {
  var page = _ref.page;
  popPage(page);
});
var empty = [];
function getCurrentPagesImpl() {
  if (!appImpl) {
    return [];
  }

  var tabCaches = appImpl._tabCaches;
  var currentTabPath = appImpl._currentTabPath;

  if (!currentTabPath) {
    return empty;
  }

  tabCaches[currentTabPath] = tabCaches[currentTabPath] || [];
  return tabCaches[currentTabPath];
}
function getCurrentPageImpl() {
  var pages = getCurrentPagesImpl();
  return pages[pages.length - 1];
}
function getCurrentPages() {
  return getCurrentPagesImpl().map(function (p) {
    return p.publicInstance;
  });
}
function getAppImpl() {
  return appImpl;
}

/***/ }),

/***/ "./src/framework/Behavior/index.js":
/*!*****************************************!*\
  !*** ./src/framework/Behavior/index.js ***!
  \*****************************************/
/*! exports provided: BehaviorId, behaviorBookmarks, createBehavior, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BehaviorId", function() { return BehaviorId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "behaviorBookmarks", function() { return behaviorBookmarks; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createBehavior", function() { return createBehavior; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/slicedToArray */ "./node_modules/@babel/runtime/helpers/slicedToArray.js");
/* harmony import */ var _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_defaults__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash.defaults */ "./node_modules/lodash.defaults/index.js");
/* harmony import */ var lodash_defaults__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_defaults__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lodash.defaultsdeep */ "./node_modules/lodash.defaultsdeep/index.js");
/* harmony import */ var lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utils_forEachRight__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/forEachRight */ "./src/utils/forEachRight.js");
/* harmony import */ var _utils_Map__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/Map */ "./src/utils/Map.js");
/* harmony import */ var lodash_mapvalues__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! lodash.mapvalues */ "./node_modules/lodash.mapvalues/index.js");
/* harmony import */ var lodash_mapvalues__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(lodash_mapvalues__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/types */ "./src/utils/types.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }







var BehaviorId = 1;
var behaviorBookmarks = new _utils_Map__WEBPACK_IMPORTED_MODULE_5__["default"]();
var COMPONENT_LIFETIMES = ['created', 'attached', 'ready', 'moved', 'detached', 'error'];
var PAGE_LIFETIMES = ['show', 'hide', 'resize'];
/**
 * types helper
 * @param target
 */

function isPropertyType(target) {
  var constructors = [String, Boolean, Number, Array, Object, null];
  return constructors.includes(target);
}
/**
 * types helper
 * @param target
 */


function isStandardProperty(target) {
  if (!Object(_utils_types__WEBPACK_IMPORTED_MODULE_7__["isObject"])(target)) return false;
  return isPropertyType(target.type);
}
/**
 * 根据 Property type 获取默认值
 * @param type
 */


function getConstructorDefaultValue(type) {
  switch (type) {
    case String:
      return '';

    case Number:
      return 0;

    case Boolean:
      return false;

    case Array:
      return [];

    case Object:
      // TODO(yingchen: 确认原来的设计是否合理？
      return null;

    case null:
      return null;

    default:
      warn('incorrect property type');
  }
}
/**
 * 规范化 properties
 * @param behavior
 */


function normalizeProperties(properties) {
  if (!Object(_utils_types__WEBPACK_IMPORTED_MODULE_7__["isObject"])(properties)) {
    throw new Error("expect properties to be object, but it is ".concat(Object(_utils_types__WEBPACK_IMPORTED_MODULE_7__["getType"])(properties)));
  }

  var result = {};
  var entries = Object.entries(properties);

  for (var i = 0; i < entries.length; i += 1) {
    var _entries$i = _babel_runtime_helpers_slicedToArray__WEBPACK_IMPORTED_MODULE_1___default()(entries[i], 2),
        key = _entries$i[0],
        prop = _entries$i[1];

    if (isPropertyType(prop)) {
      result[key] = {
        type: prop,
        value: getConstructorDefaultValue(prop)
      };
    } else if (isStandardProperty(prop)) {
      result[key] = {
        type: prop.type,
        value: prop.value || getConstructorDefaultValue(prop.type)
      };
    }
  }

  return result;
}

function getBehaviorBookmark(is) {
  var bookmark = behaviorBookmarks.get(is);

  if (!bookmark) {
    error("".concat(is, " Behavior not found"));
  }

  return bookmark;
}
/**
 * 根据 behaviors 获取 它的 definitionFilter
 * @param behaviors
 */


function getFilters(behaviors) {
  return behaviors.map(function (is) {
    var bookmark = getBehaviorBookmark(is);

    if (bookmark) {
      return bookmark.init.definitionFilter ? bookmark : _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"];
    }

    return _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"];
  });
}

function mixinBehaviors(instance) {
  var lifeQueue = {
    created: [instance.lifetimes.created],
    attached: [instance.lifetimes.attached],
    ready: [instance.lifetimes.ready],
    moved: [instance.lifetimes.moved],
    detached: [instance.lifetimes.detached],
    error: [instance.lifetimes.error]
  };
  var pageLifeQueue = {
    load: [instance.pageLifetimes.load],
    show: [instance.pageLifetimes.show],
    hide: [instance.pageLifetimes.hide],
    unload: [instance.pageLifetimes.unload],
    resize: [instance.pageLifetimes.resize]
  };
  Object(_utils_forEachRight__WEBPACK_IMPORTED_MODULE_4__["default"])(instance.behaviors, function (is) {
    var bookmark = getBehaviorBookmark(is);
    if (!bookmark) return;
    var child = bookmark.init;
    lodash_defaults__WEBPACK_IMPORTED_MODULE_2___default()(instance.data, child.data); // 合并 data

    lodash_defaults__WEBPACK_IMPORTED_MODULE_2___default()(instance.properties, child.properties); // 合并 properties

    lodash_defaults__WEBPACK_IMPORTED_MODULE_2___default()(instance.methods, child.methods); // 合并 methods

    child.definitionFilter(instance, getFilters(child.behaviors));
    COMPONENT_LIFETIMES.forEach(function (life) {
      lifeQueue[life].push(child.lifetimes[life]);
    });
    PAGE_LIFETIMES.forEach(function (life) {
      pageLifeQueue[life].push(child.pageLifetimes[life]);
    });
  });
  COMPONENT_LIFETIMES.forEach(function (life) {
    // 确保此处是一个 function 而不是 array function
    // 因为需要依赖调用处的 this
    instance.lifetimes[life] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _this = this;

      lifeQueue[life].forEach(function (cb) {
        return cb.apply(_this, args);
      });
    };
  });
  PAGE_LIFETIMES.forEach(function (life) {
    // 确保此处是一个 function 而不是 array function
    // 因为需要依赖调用处的 this
    instance.pageLifetimes[life] = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      var _this = this;

      pageLifeQueue[life].forEach(function (cb) {
        return cb.apply(_this, args);
      });
    };
  });
  lodash_defaults__WEBPACK_IMPORTED_MODULE_2___default()(instance.data, lodash_mapvalues__WEBPACK_IMPORTED_MODULE_6___default()(instance.properties, 'value'));
}
/**
 * 创建 Behavior
 * @param is 唯一标识(Component 则为 文件路径)
 * @param options 用户输入参数
 * @param name 实例名字, 为了细化报错信息
 */


function createBehavior(is, options) {
  var _options2 = options,
      _options2$data = _options2.data,
      data = _options2$data === void 0 ? {} : _options2$data;
  var _options3 = options,
      _options3$created = _options3.created,
      created = _options3$created === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"] : _options3$created,
      _options3$attached = _options3.attached,
      attached = _options3$attached === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"] : _options3$attached,
      _options3$ready = _options3.ready,
      ready = _options3$ready === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"] : _options3$ready,
      _options3$moved = _options3.moved,
      moved = _options3$moved === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"] : _options3$moved,
      _options3$detached = _options3.detached,
      detached = _options3$detached === void 0 ? _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"] : _options3$detached;

  try {
    data = JSON.parse(JSON.stringify(data));
  } catch (e) {
    data = {};
  }

  options = _objectSpread({}, options);

  var _options = lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_3___default()(options, {
    properties: {},
    methods: {},
    behaviors: [],
    definitionFilter: _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"],
    lifetimes: {
      created: created,
      attached: attached,
      ready: ready,
      moved: moved,
      detached: detached
    },
    pageLifetimes: {
      load: _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"],
      show: _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"],
      hide: _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"],
      unload: _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"],
      resize: _utils_types__WEBPACK_IMPORTED_MODULE_7__["noop"]
    }
  });

  var ancestors = new Set(); // 初始化给parent的值

  var init = _objectSpread(_objectSpread({}, _options), {}, {
    is: is,
    data: data,
    properties: normalizeProperties(_options.properties),
    hasBehavior: function hasBehavior(is) {
      return ancestors.has(is);
    }
  });

  ancestors.add(is);
  init.behaviors.forEach(function (i) {
    ancestors.add(i);
    behaviorBookmarks.get(i) && behaviorBookmarks.get(i).ancestors.forEach(function (j) {
      ancestors.add(j);
    });
  });
  mixinBehaviors(init);
  return {
    init: init,
    ancestors: ancestors
  };
}
/**
 * 创建 Behavior, 即全局 Behavior 构造函数
 * @param options
 * @returns Behavior 唯一标识
 */

function registerBehavior() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!Object(_utils_types__WEBPACK_IMPORTED_MODULE_7__["isObject"])(options)) {
    throw new Error('Behavior.options is not a object');
  }

  var is = "behavior-".concat(BehaviorId++);
  var bookmark = createBehavior(is, options);
  behaviorBookmarks.set(is, bookmark);
  return is;
}

/* harmony default export */ __webpack_exports__["default"] = (registerBehavior);

/***/ }),

/***/ "./src/framework/Component/index.worker.js":
/*!*************************************************!*\
  !*** ./src/framework/Component/index.worker.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Component; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _ComponentRegistry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../ComponentRegistry */ "./src/framework/ComponentRegistry/index.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../legacy/CustomComponent */ "./src/framework/legacy/CustomComponent.worker.js");
/* harmony import */ var _Behavior__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../Behavior */ "./src/framework/Behavior/index.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }





var uid = 0;
function Component(setupConfig) {
  // $global.currentComponentConfig 会在转译后的代码里设置
  if (!_common_global__WEBPACK_IMPORTED_MODULE_2__["default"].currentComponentConfig) {
    throw new Error('invalid Component usage!');
  }

  var currentComponentConfig = _common_global__WEBPACK_IMPORTED_MODULE_2__["default"].currentComponentConfig;
  _common_global__WEBPACK_IMPORTED_MODULE_2__["default"].currentComponentConfig = null;
  var is = currentComponentConfig.is,
      usingComponents = currentComponentConfig.usingComponents;

  if (_ComponentRegistry__WEBPACK_IMPORTED_MODULE_1__["default"].getComponent(is)) {
    throw new Error("at ".concat(is, ", Component can only register once"));
  }

  var _createBehavior = Object(_Behavior__WEBPACK_IMPORTED_MODULE_4__["createBehavior"])("component-behavior-".concat(uid++), setupConfig),
      init = _createBehavior.init,
      ancestors = _createBehavior.ancestors;

  _common_global__WEBPACK_IMPORTED_MODULE_2__["default"].componentsConfig[is] = {
    init: init,
    usingComponents: usingComponents
  };
  _ComponentRegistry__WEBPACK_IMPORTED_MODULE_1__["default"].registerComponent(is, function () {
    return Object(_legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_3__["default"])(_objectSpread({
      init: init,
      ancestors: ancestors
    }, currentComponentConfig));
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

/***/ "./src/framework/Page/index.worker.js":
/*!********************************************!*\
  !*** ./src/framework/Page/index.worker.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Page; });
/* harmony import */ var _PageRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PageRegistry */ "./src/framework/PageRegistry/index.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _legacy_PageComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../legacy/PageComponent */ "./src/framework/legacy/PageComponent.worker.js");



function Page() {
  var userConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!_common_global__WEBPACK_IMPORTED_MODULE_1__["default"].currentPageConfig) {
    throw new Error('invalid Page usage!');
  }

  var tabsConfig = _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].tabsConfig;
  var currentPageConfig = _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].currentPageConfig;
  var pagesConfig = _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].pagesConfig;
  _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].currentPageConfig = null;
  var pagePath = currentPageConfig.pagePath;
  var tabIndex = currentPageConfig.tabIndex;

  if (tabIndex) {
    tabsConfig[pagePath] = tabIndex;
  }

  pagesConfig[pagePath] = {
    system: currentPageConfig,
    user: userConfig
  }; // do not use registerPage, all worker modules run at once
  // if use registerPage, need to do full ast parse(error prone)

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
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/startupParams */ "./src/utils/startupParams/index.worker.js");
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

/* harmony import */ var _Page__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Page */ "./src/framework/Page/index.worker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _Page__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.worker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _App__WEBPACK_IMPORTED_MODULE_2__["getCurrentPages"]; });

/* harmony import */ var _Component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Component */ "./src/framework/Component/index.worker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _Component__WEBPACK_IMPORTED_MODULE_3__["default"]; });







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

/***/ "./src/framework/index.worker.js":
/*!***************************************!*\
  !*** ./src/framework/index.worker.js ***!
  \***************************************/
/*! exports provided: EventHub, getStartupParams, setStartupParams, getCurrentPageImpl, getCurrentPagesImpl, Component, Page, App, getApp, getAppImpl, getCurrentPages, registerBehavior, $global */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/env */ "./src/framework/utils/env.js");
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_utils_env__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_securityPatch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/securityPatch */ "./src/utils/securityPatch.js");
/* harmony import */ var _utils_getApplicationId__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/getApplicationId */ "./src/utils/getApplicationId.js");
/* harmony import */ var _worker_bootstrap__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./worker/bootstrap */ "./src/framework/worker/bootstrap.js");
/* harmony import */ var _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./common/commonLogic */ "./src/framework/common/commonLogic.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["Component"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["Page"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["getCurrentPages"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_4__["$global"]; });

/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./EventHub */ "./src/framework/EventHub.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EventHub", function() { return _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./startupParams */ "./src/framework/startupParams/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return _startupParams__WEBPACK_IMPORTED_MODULE_6__["getStartupParams"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return _startupParams__WEBPACK_IMPORTED_MODULE_6__["setStartupParams"]; });

/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./App */ "./src/framework/App/index.worker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPageImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_7__["getCurrentPageImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPagesImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_7__["getCurrentPagesImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getAppImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_7__["getAppImpl"]; });

/* harmony import */ var _Behavior__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Behavior */ "./src/framework/Behavior/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "registerBehavior", function() { return _Behavior__WEBPACK_IMPORTED_MODULE_8__["default"]; });










var g = self;

g.onerror = function (msg, url, line, col, error) {
  var args = [msg, url, line, col, error];

  try {
    var app = Object(_App__WEBPACK_IMPORTED_MODULE_7__["getAppImpl"])();

    if (app) {
      app.error(msg);
    }

    var stack = [];

    try {
      stack = JSON.stringify(error.stack).split('\\n').splice(0, 3);
    } catch (e) {}
  } catch (ee) {
    console.error('[WORKER] report catch error', ee);
  }

  console.error('[WORKER] onerror', args);
};

g.bootstrapApp = function (_ref) {
  var success = _ref.success;

  function start() {
    Object(_utils_securityPatch__WEBPACK_IMPORTED_MODULE_1__["default"])(); // success是worker代码

    success();
  }

  Object(_worker_bootstrap__WEBPACK_IMPORTED_MODULE_3__["pauseApp"])();
  Object(_utils_getApplicationId__WEBPACK_IMPORTED_MODULE_2__["default"])(function (applicationId) {
    start();
    Object(_worker_bootstrap__WEBPACK_IMPORTED_MODULE_3__["default"])();
  });
};



/***/ }),

/***/ "./src/framework/legacy/CustomComponent.worker.js":
/*!********************************************************!*\
  !*** ./src/framework/legacy/CustomComponent.worker.js ***!
  \********************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Component; });
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_mergeArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/mergeArray */ "./src/utils/mergeArray.js");
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/setData */ "./src/utils/setData.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var lodash_mapvalues__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lodash.mapvalues */ "./node_modules/lodash.mapvalues/index.js");
/* harmony import */ var lodash_mapvalues__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(lodash_mapvalues__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! lodash.defaultsdeep */ "./node_modules/lodash.defaultsdeep/index.js");
/* harmony import */ var lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/consts */ "./src/utils/consts.js");
/* harmony import */ var _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../ComponentRegistry/getComponentClass */ "./src/framework/ComponentRegistry/getComponentClass.js");
/* harmony import */ var _utils_getComponentProp__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/getComponentProp */ "./src/framework/utils/getComponentProp.js");
/* harmony import */ var _utils_fireComponentLifecycle__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../utils/fireComponentLifecycle */ "./src/framework/utils/fireComponentLifecycle.js");


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }










function Component(config) {
  var init = config.init,
      ancestors = config.ancestors,
      is = config.is,
      usingComponents = config.usingComponents;
  var propsCache = {};

  function getProps(prop) {
    var useCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return Object(_utils_getComponentProp__WEBPACK_IMPORTED_MODULE_8__["default"])(init, prop, useCache ? propsCache : useCache);
  }

  function ComponentClass(page, id) {
    this.is = is;
    this.id = id;
    this.page = page;
    this.triggerEventHandlers = {};
    var self = this;
    this.publicInstance = Object.create(_objectSpread(_objectSpread({}, init), getProps('methods')), {
      setData: {
        value: function value(a, b) {
          return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_2__["default"], a, b);
        }
      },
      $spliceData: {
        value: function value(a, b) {
          return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_2__["spliceData"], a, b);
        }
      },
      triggerEvent: {
        value: function value(eventName) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          self.page.callRemote.apply(self.page, ['self', 'triggerComponentCustomEvent', self.id, eventName].concat(args));
        }
      },
      getPageId: {
        value: function value() {
          return self.page.id;
        }
      }
    });
    var publicInstance = this.publicInstance;
    publicInstance.is = is;
    publicInstance.$id = id;
    publicInstance.$page = page.publicInstance;
    var initialData = lodash_defaultsdeep__WEBPACK_IMPORTED_MODULE_5___default()(lodash_mapvalues__WEBPACK_IMPORTED_MODULE_4___default()(publicInstance.properties, 'value'), publicInstance.data);
    publicInstance.properties = initialData;
    publicInstance.data = initialData;
    this.prevData = publicInstance.data;
  }

  ComponentClass.getAllComponents = function () {
    var allComponents = [is];
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(usingComponents).forEach(function (c) {
      /* 忽略当前自定义组件本身，防止死循环 */
      if (usingComponents[c] !== is) {
        var subUsingComponents = Object(_ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_7__["default"])(usingComponents[c]).getAllComponents();
        Object(_utils_mergeArray__WEBPACK_IMPORTED_MODULE_1__["default"])(allComponents, subUsingComponents);
      }
    });
    return allComponents;
  };

  ComponentClass.prototype = {
    setData: function setData(op, diffData, options_) {
      var _data;

      var id = this.id,
          publicInstance = this.publicInstance;

      if (this.unloaded) {
        console.log("".concat('setData(...) can only update a mounted component. ' + 'This usually means you called setData() on a unmounted component. ') + "Please check the code for the \"".concat(this.is, "\" component of \"").concat(this.page.getPagePath(), "\" page."));
        return;
      }

      this.prevData = publicInstance.data;
      publicInstance.properties = publicInstance.data = op(publicInstance.data, diffData);
      var data = (_data = {}, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["PendingKeyType"], _utils_consts__WEBPACK_IMPORTED_MODULE_6__["PendingValueComponent"]), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["PendingKeyId"], id), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["PendingKeyOp"], Object(_utils_setData__WEBPACK_IMPORTED_MODULE_2__["getOpStr"])(op)), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_0___default()(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_6__["PendingKeyData"], diffData), _data);
      var options = options_ || {};

      if (typeof options_ === 'function') {
        options = {
          complete: options_
        };
      }

      this.page.setRemoteData(data, options);
    },
    setComponentConfig: function setComponentConfig(c, init) {
      var diffProps = c[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["ComponentKeyDiffProps"]];
      var id = c[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["ComponentPropsId"]];
      var publicInstance = this.publicInstance;
      var prevProps = publicInstance.properties;

      if (diffProps) {
        var deleted = diffProps[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyDeleted"]];
        var updated = diffProps[_utils_consts__WEBPACK_IMPORTED_MODULE_6__["DiffKeyUpdated"]];

        if (deleted && deleted.length || updated && Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(updated).length) {
          publicInstance.properties = _objectSpread({}, publicInstance.properties);
        }

        if (deleted) {
          deleted.forEach(function (d) {
            delete publicInstance.properties[d];
          });
        }

        if (updated) {
          Object.assign(publicInstance.properties, updated);
        }

        Object.assign(publicInstance.data, publicInstance.properties);
      }

      publicInstance.id = id;

      if (!init && (prevProps !== publicInstance.properties || this.prevData !== publicInstance.data)) {
        this.prevData = publicInstance.data;
      }
    },
    // const COMPONENT_LIFETIMES = ['created', 'attached', 'ready', 'moved', 'detached', 'error'];
    created: function created(info) {
      this.setComponentConfig(info, true);
      this.publicInstance.lifetimes.created.call(this.publicInstance);
    },
    attached: function attached(info) {
      this.setComponentConfig(info);
      this.publicInstance.lifetimes.attached.call(this.publicInstance);
      this.page.callRemote.apply(this.page, ['self', 'onComponentAttached', this.id]);
    },
    ready: function ready(info) {
      this.setComponentConfig(info);
      this.publicInstance.lifetimes.ready.call(this.publicInstance);
    },
    unload: function unload() {
      this.unloaded = true;
      this.publicInstance.lifetimes.detached.call(this.publicInstance);
    }
  };
  return ComponentClass;
}

/***/ }),

/***/ "./src/framework/legacy/PageComponent.worker.js":
/*!******************************************************!*\
  !*** ./src/framework/legacy/PageComponent.worker.js ***!
  \******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return PageComponent; });
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/toConsumableArray */ "./node_modules/@babel/runtime/helpers/toConsumableArray.js");
/* harmony import */ var _babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/defineProperty */ "./node_modules/@babel/runtime/helpers/defineProperty.js");
/* harmony import */ var _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_mapvalues__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash.mapvalues */ "./node_modules/lodash.mapvalues/index.js");
/* harmony import */ var lodash_mapvalues__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_mapvalues__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/bridge */ "./src/bridge/index.js");
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/setData */ "./src/utils/setData.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_mergeArray__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/mergeArray */ "./src/utils/mergeArray.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/invokeWithGuardAndReThrow */ "./src/utils/invokeWithGuardAndReThrow.js");
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/utils/consts */ "./src/utils/consts.js");
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @/utils/types */ "./src/utils/types.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.worker.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../ComponentRegistry/getComponentClass */ "./src/framework/ComponentRegistry/getComponentClass.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ../mixins/MessageHandleMixin */ "./src/framework/mixins/MessageHandleMixin.js");



function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }















var publicInstanceMethods = ['onShareAppMessage', 'onReachBottom', 'onPageScroll'];
function PageComponent(_ref) {
  var id = _ref.id,
      query = _ref.query,
      pagePath = _ref.pagePath;

  if (!(this instanceof PageComponent)) {
    return new PageComponent({
      id: id,
      query: query,
      pagePath: pagePath
    });
  }

  this.$startTime = Date.now();
  this.onMessage = this.onMessage.bind(this);
  this.componentInstances = {};
  Object.assign(this, {
    pagePath: pagePath,
    id: id,
    bridge: _common_global__WEBPACK_IMPORTED_MODULE_14__["default"].bridge,
    pendingData: [],
    pendingCallbacks: [],
    initialCallbacks: [],
    self: this,
    query: query,
    pageType: 'WORKER'
  });
  var self = this;
  /* 设置publicInstance */

  this.publicInstance = Object.create(_objectSpread({
    route: pagePath
  }, _common_global__WEBPACK_IMPORTED_MODULE_14__["default"].pagesConfig[pagePath].user), {
    setData: {
      value: function value(a, b) {
        return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_4__["default"], a, b);
      }
    },
    $spliceData: {
      value: function value(a, b) {
        return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_4__["spliceData"], a, b);
      }
    },
    $getComponentBy: {
      value: this.getComponentBy.bind(this)
    }
  });
  var publicInstance = this.publicInstance;

  if (typeof publicInstance.data === 'function') {
    publicInstance.data = publicInstance.data() || {};
  }
}
var allUsingComponentsCache = {};

function getAllUsingComponents(pagePath) {
  if (pagePath in allUsingComponentsCache) {
    return allUsingComponentsCache[pagePath];
  }

  var allUsingComponents = [];
  var usingComponents = _common_global__WEBPACK_IMPORTED_MODULE_14__["default"].pagesConfig[pagePath].system.usingComponents;

  var getComponents = function getComponents(is) {
    var components = [is];
    var usingComponents = _common_global__WEBPACK_IMPORTED_MODULE_14__["default"].componentsConfig[is].usingComponents;

    if (usingComponents) {
      Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(usingComponents).forEach(function (name) {
        if (usingComponents[name] !== is) {
          Object(_utils_mergeArray__WEBPACK_IMPORTED_MODULE_6__["default"])(components, getComponents(usingComponents[name]));
        }
      });
    }

    return components;
  };

  if (usingComponents) {
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(usingComponents).forEach(function (c) {
      Object(_utils_mergeArray__WEBPACK_IMPORTED_MODULE_6__["default"])(allUsingComponents, getComponents(usingComponents[c]));
    });
    allUsingComponentsCache[pagePath] = allUsingComponents;
  }

  return allUsingComponents;
}

PageComponent.prototype = _objectSpread(_objectSpread({}, _mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_15__["default"]), {}, {
  init: function init() {
    var isRefresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var publicInstance = this.publicInstance,
        id = this.id;
    var config = {};
    publicInstanceMethods.forEach(function (k) {
      var hookFn = publicInstance[k];

      if (typeof hookFn === 'function' && hookFn !== _utils_types__WEBPACK_IMPORTED_MODULE_10__["noop"]) {
        config[k] = true;
      }
    });
    Object(_bridge__WEBPACK_IMPORTED_MODULE_3__["publish"])('onInitDataReady', {
      id: id,
      isRefresh: isRefresh,
      publicInstance: _objectSpread({
        data: publicInstance.data
      }, config),
      customComponents: this.getCustomComponents()
    }, this.getViewId());
  },
  load: function load() {
    // in case pageResume following appResume, tab page??
    if (!this.$loadTime) {
      this.$loadTime = Date.now();
      this._disableRemoteData = true;
      Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', ' page onLoad', this.pagePath);
      _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pageLoad', {
        page: this
      });
      Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_8__["default"])(this.publicInstance.onLoad, this.publicInstance, this.query);
      this._disableRemoteData = false; // depend app status!! maybe unstable

      if (Object(_App__WEBPACK_IMPORTED_MODULE_11__["getAppImpl"])().shown) {
        this.show();
      }

      if (this._fromTabItemTap) {
        this.onTabItemTap(this.tabProps);
      }

      Object(_bridge__WEBPACK_IMPORTED_MODULE_3__["publish"])('onRenderPageLoad', {}, this.getViewId());
    }
  },
  refresh: function refresh() {
    this.unmountAllComponents();
    this.init(true);
  },
  show: function show() {
    if (this.unloaded) {
      return;
    } // in case navigateTo inside App.onLaunch


    if (!this.$loadTime) {
      this.load();
      return;
    }

    if (this.shown) {
      return;
    }

    this.shown = true;
    _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('enterPage', {
      page: this
    });
    this.executeUserMethod('onShow');
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', 'page onShow', this.pagePath);
  },
  ready: function ready(payload) {
    var _this = this;

    if (this.unloaded) {
      return;
    }

    if (this.readied) {
      return;
    }

    this.batchedUpdates(function () {
      _this.readied = true;

      _this.update(payload);

      _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pageReady', {
        page: _this
      });

      _this.initialCallbacks.forEach(function (fn) {
        return fn();
      });

      _this.executeUserMethod('onReady');

      Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', 'page onReady', _this.pagePath);
    });
  },
  pullDownRefresh: function pullDownRefresh(e) {
    _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pullDownRefresh', {
      page: this
    });
    this.executeUserMethod('onPullDownRefresh', [e]);
  },
  hide: function hide() {
    if (this.unloaded) {
      return;
    }

    if (!this.$loadTime) {
      return;
    }

    if (!this.shown) {
      return;
    }

    this.shown = false;
    _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('leavePage', {
      page: this
    });
    _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pageHide', {
      page: this
    });
    this.executeUserMethod('onHide');
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', ' page onHide', this.pagePath);
  },
  unload: function unload() {
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', ' page onUnload', this.pagePath);

    if (this.unloaded || !this.$loadTime) {
      // remove from page stack
      _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pageUnload', {
        page: this
      });
      return;
    }

    this.unloaded = true;
    this.unmountAllComponents();
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_8__["default"])(this.publicInstance.onUnload, this.publicInstance);
    _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('leavePage', {
      page: this
    });
    _EventHub__WEBPACK_IMPORTED_MODULE_12__["default"].emit('pageUnload', {
      page: this
    });
  },
  unmountAllComponents: function unmountAllComponents() {
    var oldComponentInstances = this.componentInstances;
    this.componentInstances = {};
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(oldComponentInstances).forEach(function (k) {
      oldComponentInstances[k].unload();
    });
  },
  getCustomComponents: function getCustomComponents() {
    var customComponents = {};
    getAllUsingComponents(this.pagePath).forEach(function (is) {
      var init = _common_global__WEBPACK_IMPORTED_MODULE_14__["default"].componentsConfig[is].init;
      customComponents[is] = {
        properties: lodash_mapvalues__WEBPACK_IMPORTED_MODULE_2___default()(init.properties, function (item) {
          return {
            type: item.type.name,
            value: item.value
          };
        }),
        data: init.data
      };
    });
    return customComponents;
  },
  isLoaded: function isLoaded() {
    return !!this.$loadTime && !this.unloaded;
  },
  getViewId: function getViewId() {
    return this.publicInstance.$viewId;
  },
  setViewId: function setViewId(viewId) {
    this.publicInstance.$viewId = viewId;
  },
  getComponentInstance: function getComponentInstance(id) {
    if (String(id) === '1') {
      return this;
    }

    return this.componentInstances[id];
  },
  getComponentBy: function getComponentBy(by) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var instances = [];
    var componentInstances = this.componentInstances;

    if (componentInstances) {
      var keys = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_5__["default"])(componentInstances);

      for (var i = 0; i < keys.length; i += 1) {
        var publicInstance = componentInstances[keys[i]].publicInstance;

        if (by(publicInstance)) {
          instances.push(publicInstance);

          if (config.returnOnFirstMatch) {
            return instances;
          }
        }
      }
    }

    return instances;
  },

  /* 自定义组件绑定事件触发通 */
  triggerComponentEvent: function triggerComponentEvent(componentId, eventName, eventObject) {
    var componentInstance = this.getComponentInstance(componentId);

    if (componentInstance) {
      this.batchedUpdates(function () {
        Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_8__["default"])(componentInstance.publicInstance[eventName], componentInstance.publicInstance, eventObject);
      });
    }
  },

  /* 自定义组件生命周期触发 */
  fireComponentLifecycle: function fireComponentLifecycle(info, type) {
    var is = info[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyIs"]];
    var id = info[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyId"]];
    var componentInstance = this.getComponentInstance(id);

    if (!componentInstance) {
      var componentInstances = this.componentInstances;
      var ComponentClass = Object(_ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_13__["default"])(is);
      componentInstance = new ComponentClass(this, id);
      componentInstances[id] = componentInstance;
    }

    if (typeof componentInstance[type] === 'function') {
      componentInstance[type](info);
    }
  },
  onTabItemTap: function onTabItemTap(tabProps) {
    this.executeUserMethod('onTabItemTap', [tabProps]);
  },
  unmountComponents: function unmountComponents(unmountedKeys) {
    var componentInstances = this.componentInstances;
    unmountedKeys.forEach(function (id) {
      if (componentInstances[id]) {
        componentInstances[id].unload();
        delete componentInstances[id];
      }
    });
  },
  updateComponents: function updateComponents(payload) {
    if (!payload) {
      return;
    }

    var componentInstances = this.componentInstances;
    var mountedComponents = payload[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["PayloadKeyMountedComponents"]] || []; // const unmountedComponents = payload[PayloadKeyUnmountedComponents] || [];
    // from bottom to top

    mountedComponents.forEach(function (componentConfig) {
      var id = componentConfig[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyId"]];

      if (componentInstances[id]) {
        componentInstances[id].setComponentConfig(componentConfig);
      }
    }); // const unmountedKeys = unmountedComponents.concat().reverse();
    // this.unmountComponents(unmountedKeys);
  },
  update: function update(payload) {
    var _this2 = this;

    this.batchedUpdates(function () {
      _this2.updateComponents(payload);
    });
  },
  postMessage: function postMessage(data) {
    if (this.unloaded) {
      return;
    }

    Object(_utils_log__WEBPACK_IMPORTED_MODULE_7__["debug"])('framework', "[WORKER] Page ".concat(this.pagePath, " postMessage"), data);
    this.bridge.call('postMessage', _objectSpread(_objectSpread({}, data), {}, {
      pageType: this.pageType,
      msgType: 'endpoint',
      viewId: this.getViewId() // 渲染层frameId

    }));
  },
  console: function (_console) {
    function console(_x2) {
      return _console.apply(this, arguments);
    }

    console.toString = function () {
      return _console.toString();
    };

    return console;
  }(function (type) {
    // make compiled code
    console[type].apply(console, [].slice.call(arguments, 1, -2));
  }),
  setData: function setData(op, diffData, options_) {
    if (this.unloaded) {
      console.log("".concat('setData(...) can only update a loaded page. ' + 'This usually means you called setData() on a unloaded page. ') + "Please check the code for the \"".concat(this.pagePath, "\" page."));
      return;
    }

    if (!diffData) {
      return;
    } // no need to create immutable data


    this.publicInstance.data = op(this.publicInstance.data, diffData);
    var options = options_ || {};
    var callback;

    if (typeof options_ === 'function') {
      callback = options_;
      options = {
        complete: callback
      };
    }

    if (this._disableRemoteData) {
      if (callback) {
        this.initialCallbacks.push(callback);
      }
    } else {
      var _data;

      var data = (_data = {}, _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyType"], _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingValuePage"]), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyData"], diffData), _babel_runtime_helpers_defineProperty__WEBPACK_IMPORTED_MODULE_1___default()(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyOp"], Object(_utils_setData__WEBPACK_IMPORTED_MODULE_4__["getOpStr"])(op)), _data);
      this.setRemoteData(data, options);
    }
  },
  executeUserMethod: function executeUserMethod(method) {
    var _this3 = this;

    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    this.batchedUpdates(function () {
      _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_8__["default"].apply(void 0, [_this3.publicInstance[method], _this3.publicInstance].concat(_babel_runtime_helpers_toConsumableArray__WEBPACK_IMPORTED_MODULE_0___default()(args)));
    });
  },
  onPageScroll: function onPageScroll() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    this.executeUserMethod('onPageScroll', args);
  },
  onReachBottom: function onReachBottom() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    this.executeUserMethod('onReachBottom', args);
  },
  batchedUpdates: function batchedUpdates(fn) {
    if (this.isBatching) {
      return fn();
    }

    this.isBatching = true;

    try {
      fn();
    } finally {
      this.isBatching = false;
    }

    this.flushData();
  },
  setRemoteData: function setRemoteData(data) {
    var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        complete = _ref2.complete;

    this.pendingData.push(data);

    if (complete) {
      this.pendingCallbacks.push(complete);
    }

    if (this.isBatching) {// do nothing
    } else {
      this.flushData();
    }
  },
  flushData: function flushData() {
    if (this.unloaded || !this.pendingData.length) {
      return;
    }

    var pendingData = this.pendingData,
        pendingCallbacks = this.pendingCallbacks;
    this.pendingData = [];
    this.pendingCallbacks = []; // prevent invalid json pass through
    // this.callRemote('self', 'receiveData', pendingData, () => {
    //   pendingCallbacks.forEach((fn) => {
    //     return fn();
    //   });
    // });

    Object(_bridge__WEBPACK_IMPORTED_MODULE_3__["publish"])('onReceiveData', {
      data: pendingData
    }, this.getViewId(), function () {
      pendingCallbacks.forEach(function (fn) {
        return fn();
      });
    });
  }
});

/***/ }),

/***/ "./src/framework/mixins/AppMixin.js":
/*!******************************************!*\
  !*** ./src/framework/mixins/AppMixin.js ***!
  \******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/objectWithoutProperties */ "./node_modules/@babel/runtime/helpers/objectWithoutProperties.js");
/* harmony import */ var _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _PageRegistry__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../PageRegistry */ "./src/framework/PageRegistry/index.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/pageInfoAndUrl */ "./src/framework/utils/pageInfoAndUrl.js");
/* harmony import */ var _utils_pageUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/pageUtils */ "./src/framework/utils/pageUtils.js");
/* harmony import */ var _utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/resolvePageUrl */ "./src/framework/utils/resolvePageUrl.js");
/* harmony import */ var _utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/checkInvalidPage */ "./src/framework/utils/checkInvalidPage.js");
/* harmony import */ var _SubPackage__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../SubPackage */ "./src/framework/SubPackage/index.js");










function newPage(_ref) {
  var pagePath = _ref.pagePath,
      pageId = _ref.pageId,
      queryString = _ref.queryString;
  // 对于通过navigate跳转的页面，直接返回已经存在的实例
  var page = this.getPageById(pageId);

  if (page) {
    return page;
  }

  var Page = _PageRegistry__WEBPACK_IMPORTED_MODULE_2__["default"].getComponent(pagePath);

  if (!Page) {
    throw new Error("[WORKER] page '".concat(pagePath, "' not found!"));
  }

  var query = {};

  if (queryString) {
    query = qs__WEBPACK_IMPORTED_MODULE_1___default.a.parse(queryString);
  }

  page = Page({
    id: pageId,
    query: query,
    pagePath: pagePath
  });
  this.pushPage(page);
  return page;
}

function doPushWindow(doPush, _ref2) {
  var pageUrl = _ref2.pageUrl,
      viewId = _ref2.viewId;

  var _this$getPageObject = this.getPageObject(pageUrl),
      pagePath = _this$getPageObject.pagePath,
      queryString = _this$getPageObject.queryString; // 创建新的pageId


  var pageId = Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_5__["getPageId"])();
  var page = newPage.call(this, {
    pagePath: pagePath,
    pageId: pageId,
    queryString: queryString
  }); // in case invalid queryString

  var safeQueryString = qs__WEBPACK_IMPORTED_MODULE_1___default.a.stringify(page.query); // 这里的doPush由bridge提供，集体实现根据不同的平台，不同的实现

  doPush({
    url: Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__["getUrlFromPageInfo"])({
      pagePath: pagePath,
      pageId: pageId,
      queryString: safeQueryString
    }),
    viewId: viewId,
    pagePath: pagePath
  });
  return page;
}

function onTabSwitch(config) {
  var _this = this;

  var url = config.url;
  var currentPage = config.currentPage || this.getCurrentPageImpl();

  var _this$getPageObject2 = this.getPageObject(url),
      pagePath = _this$getPageObject2.pagePath,
      queryString = _this$getPageObject2.queryString;

  function newTab() {
    var page = newPage.call(_this, {
      pagePath: pagePath,
      pageId: Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_5__["getPageId"])(pagePath, 1),
      queryString: queryString
    });
    page.fromPage = currentPage;
  } // from non-tab pages


  if (!this.isTabShow()) {
    this.clearAllPages();
    _EventHub__WEBPACK_IMPORTED_MODULE_3__["default"].emit('switchTab', {
      page: currentPage
    });
    newTab();
    return;
  }

  var currentPages = this.getCurrentPagesImpl();
  var nextPages = this.getPagesByTabPath(pagePath);

  if (!currentPages.length && !nextPages.length) {
    return;
  } // switch to current page


  if (currentPages === nextPages && currentPages.length === 1) {
    return;
  }

  _EventHub__WEBPACK_IMPORTED_MODULE_3__["default"].emit('switchTab', {
    page: currentPage
  });
  var pagesLoop = currentPages.concat();

  for (var i = pagesLoop.length - 1; i >= 1; i -= 1) {
    pagesLoop[i].unload();
  }

  if (currentPages === nextPages) {
    pagesLoop[0].show();
  } else {
    // only onHide if current tab's stack is 1
    if (pagesLoop.length === 1) {
      pagesLoop[0].hide();
    }

    this.setCurrentPagesImpl(nextPages, pagePath);
    var nextPage = nextPages[0];

    if (nextPage) {
      nextPage.fromPage = currentPage;
      nextPage.show();
    } else {
      newTab();
    }
  }
}

var App = {
  newPage: newPage,
  reLaunch: function reLaunch(_ref3, _ref4) {
    var url = _ref3.url;
    var pushWindow = _ref4.pushWindow,
        switchTab = _ref4.switchTab;

    var _this = this;

    var currentPage = this.getCurrentPageImpl();
    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_6__["default"])(url, currentPage);
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_8__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_7__["default"])(pageUrl)) {
        return;
      }

      _this.clearAllPages();

      var nextPage;

      var _getPageObject3 = _this.getPageObject(pageUrl);

      var pagePath = _getPageObject3.pagePath;

      if (Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_5__["getPageId"])(pagePath, 1)) {
        // already clear all pages, need pass currentPage to switchTab
        _this.switchTab({
          url: "/".concat(pageUrl)
        }, {
          doSwitch: switchTab,
          currentPage: currentPage
        });
      } else {
        nextPage = doPushWindow.call(_this, pushWindow, {
          pageUrl: pageUrl
        });
        nextPage.fromPage = currentPage;
      }
    });
  },
  navigateTo: function navigateTo(_ref5, _ref6) {
    var _this2 = this;

    var url = _ref5.url,
        viewId = _ref5.viewId;
    var pushWindow = _ref6.pushWindow;
    var currentPage = this.getCurrentPageImpl();
    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_6__["default"])(url, currentPage);
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_8__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_7__["default"])(pageUrl)) {
        return;
      }
      /* 这里稍微有些不妥，万一pushWindow失败呢 */


      currentPage.hide();
      var nextPage = doPushWindow.call(_this2, pushWindow, {
        pageUrl: pageUrl,
        viewId: viewId
      });
      nextPage.fromPage = currentPage;
    });
  },
  redirectTo: function redirectTo(_ref7, _ref8) {
    var url = _ref7.url;
    var pushWindow = _ref8.pushWindow;

    var _this = this;

    var currentPage = this.getCurrentPageImpl();
    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_6__["default"])(url, currentPage);
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_8__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_7__["default"])(pageUrl)) {
        return;
      }

      if (Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_5__["isTabPage"])(currentPage)) {
        _this.clearAllPages();
      } else {
        currentPage.unload();
      }

      var nextPage = doPushWindow.call(_this, pushWindow, {
        pageUrl: pageUrl
      });
      nextPage.fromPage = currentPage;
    });
  },
  switchTab: function switchTab(_ref9) {
    var url = _ref9.url,
        tabProps = _babel_runtime_helpers_objectWithoutProperties__WEBPACK_IMPORTED_MODULE_0___default()(_ref9, ["url"]);

    var _ref10 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        doSwitch = _ref10.doSwitch,
        currentPage = _ref10.currentPage;

    var _this = this;

    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_6__["default"])(url, this.getCurrentPageImpl());
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_8__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_7__["default"])(pageUrl)) {
        return;
      }

      var _this$getPageObject3 = _this.getPageObject(pageUrl),
          pagePath = _this$getPageObject3.pagePath;

      onTabSwitch.call(_this, {
        url: pageUrl,
        currentPage: currentPage
      });

      if (doSwitch) {
        doSwitch({
          pagePath: pagePath
        });
      } else {
        // click tab. bug: switchTab api will also trigger native tabClick event
        var page = _this.getCurrentPageImpl();

        if (page) {
          if (page.isLoaded()) {
            page.onTabItemTap(tabProps);
          } else {
            page.tabProps = tabProps;
            page._fromTabItemTap = 1;
          }
        }
      }
    });
  },
  destroyPageByUrl: function destroyPageByUrl(pageUrl) {
    var _getPageInfoFromUrl = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__["getPageInfoFromUrl"])(pageUrl),
        id = _getPageInfoFromUrl.id;

    var allPages = this.getAllPages(); // after reLaunch the same tab....

    if (allPages.length === 1 && allPages[0].getId() === id) {
      return;
    }

    var page = this.getPageById(id);

    if (page) {
      page.unload();
    }
  },
  pausePageByUrl: function pausePageByUrl(url) {
    var _getPageInfoFromUrl2 = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__["getPageInfoFromUrl"])(url),
        id = _getPageInfoFromUrl2.id;

    var page = this.getPageById(id);

    if (page) {
      page.hide();
    }
  },
  resumePageByUrl: function resumePageByUrl(url) {
    var _getPageInfoFromUrl3 = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_4__["getPageInfoFromUrl"])(url),
        id = _getPageInfoFromUrl3.id;

    var page = this.getPageById(id);

    if (page) {
      page.show();
    }
  }
};
/* harmony default export */ __webpack_exports__["default"] = (App);

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

/***/ "./src/framework/startupParams/index.js":
/*!**********************************************!*\
  !*** ./src/framework/startupParams/index.js ***!
  \**********************************************/
/*! exports provided: getStartupParams, setStartupParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/startupParams */ "./src/utils/startupParams/index.worker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return _utils_startupParams__WEBPACK_IMPORTED_MODULE_0__["setStartupParams"]; });




/***/ }),

/***/ "./src/framework/utils/appImpl.js":
/*!****************************************!*\
  !*** ./src/framework/utils/appImpl.js ***!
  \****************************************/
/*! exports provided: setAppImpl, getAppImpl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setAppImpl", function() { return setAppImpl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getAppImpl", function() { return getAppImpl; });
var appImpl;
var g = self;
function setAppImpl(app) {
  appImpl = app;
  g.__appImpl = appImpl;
}
function getAppImpl() {
  return appImpl;
}

/***/ }),

/***/ "./src/framework/utils/checkInvalidPage.js":
/*!*************************************************!*\
  !*** ./src/framework/utils/checkInvalidPage.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return checkInvalidPage; });
/* harmony import */ var _PageRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../PageRegistry */ "./src/framework/PageRegistry/index.js");

function checkInvalidPage(pageUrl) {
  var page = pageUrl;

  if (page.charAt(0) === '/') {
    page = pageUrl.slice(1);
  }

  var index = page.indexOf('?');

  if (index !== -1) {
    page = page.slice(0, index);
  }

  if (!_PageRegistry__WEBPACK_IMPORTED_MODULE_0__["default"].getRunnable(page)) {
    console.error("framework error: can not find page: ".concat(pageUrl));
    return true;
  }
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

/***/ "./src/framework/utils/fireComponentLifecycle.js":
/*!*******************************************************!*\
  !*** ./src/framework/utils/fireComponentLifecycle.js ***!
  \*******************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return fireComponentLifecycle; });
/* harmony import */ var _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/invokeWithGuardAndReThrow */ "./src/utils/invokeWithGuardAndReThrow.js");

function fireComponentLifecycle(componentConfig, context, method) {
  var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var _componentConfig$mixi = componentConfig.mixins,
      mixins = _componentConfig$mixi === void 0 ? [] : _componentConfig$mixi;
  mixins.forEach(function (m) {
    if (m[method]) {
      _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_0__["default"].apply(undefined, [m[method], context].concat(args));
    }
  });

  if (componentConfig[method]) {
    _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_0__["default"].apply(undefined, [componentConfig[method], context].concat(args));
  }
}

/***/ }),

/***/ "./src/framework/utils/getComponentProp.js":
/*!*************************************************!*\
  !*** ./src/framework/utils/getComponentProp.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getComponentProp; });
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");


function safeAssign(to, from, prop) {
  if (from) {
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(from).forEach(function (key) {
      if (key in to) {
        throw new Error("Tried to merge two objects with the same key: `".concat(key, "`. This conflict is due to `").concat(prop, "` of a component mixin."));
      }

      to[key] = from[key];
    });
  }
}

function getComponentProp(componentConfig, prop) {
  var caches = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];

  if (caches && caches[prop]) {
    return caches[prop];
  }

  var ret = {};
  var v = componentConfig[prop];

  if (typeof v === 'function') {
    v = v.apply(this, args);
  }

  safeAssign(ret, v, prop);

  if (caches) {
    caches[prop] = ret;
  }

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

/***/ "./src/framework/utils/pageUtils.js":
/*!******************************************!*\
  !*** ./src/framework/utils/pageUtils.js ***!
  \******************************************/
/*! exports provided: getPageId, isTabPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPageId", function() { return getPageId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTabPage", function() { return isTabPage; });
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");

var START_TAB_ID = 10;
var END_TAB_ID = 100; // 0-100 reserved for tab pages

var globalPageId = END_TAB_ID;
function getPageId(pagePath, useTab) {
  if (useTab) {
    return _common_global__WEBPACK_IMPORTED_MODULE_0__["default"].tabsConfig[pagePath];
  }

  return ++globalPageId;
}
function isTabPage(page) {
  var id = page.getId();
  return id >= START_TAB_ID && id <= END_TAB_ID;
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

/***/ "./src/framework/worker/bootstrap.js":
/*!*******************************************!*\
  !*** ./src/framework/worker/bootstrap.js ***!
  \*******************************************/
/*! exports provided: pauseApp, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pauseApp", function() { return pauseApp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return bootstrap; });
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _polyfill__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./polyfill */ "./src/framework/worker/polyfill.js");
/* harmony import */ var _polyfill__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_polyfill__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/bridge */ "./src/bridge/index.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.worker.js");
/* harmony import */ var _SubPackage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../SubPackage */ "./src/framework/SubPackage/index.js");







var g = self;
var started = true;
var queue = [];

function processEndpoint(event) {
  var pageId = event.data.id;
  var appImpl = Object(_App__WEBPACK_IMPORTED_MODULE_5__["getAppImpl"])();
  var page = appImpl.getPageById(pageId);
  page && page.onMessage(event);
}

function processMessage(event) {
  var msgType = event.data.msgType;

  if (msgType === 'endpoint') {
    processEndpoint(event);
  }
}

g.send = function (event) {
  Object(_utils_log__WEBPACK_IMPORTED_MODULE_4__["debug"])('framework', '[WORKER] App Received Message:', event.data);

  if (started) {
    queue.forEach(processMessage);
    processMessage(event);
  } else {
    queue.push(event);
  }
};

g.addEventListener('message', g.send);

function processContentLoad(params, webviewId) {
  var pagePath = params.pagePath,
      queryString = params.queryString,
      pageId = params.id;
  Object(_SubPackage__WEBPACK_IMPORTED_MODULE_6__["loadPage"])(pagePath, function () {
    var appImpl = Object(_App__WEBPACK_IMPORTED_MODULE_5__["getAppImpl"])();
    var page = appImpl.newPage({
      pagePath: pagePath,
      queryString: queryString,
      pageId: pageId
    });
    page.setViewId(webviewId); // refresh page

    if (page.$loadTime) {
      page.refresh();
    } else {
      page.init();
    }
  });
}

var callbackId = 0;
var callbackMap = new Map(); // eslint-disable-next-line @typescript-eslint/promise-function-async

function invokeWebview(method, params, webviewId) {
  return new Promise(function (resolve, reject) {
    callbackId += 1;
    callbackMap.set(callbackId, {
      resolve: resolve,
      reject: reject
    });
    publish('invokeWebviewMethod', {
      method: method,
      params: params,
      extra: {
        callbackId: callbackId,
        timestamp: Date.now()
      }
    }, webviewId);
  });
}

Object(_bridge__WEBPACK_IMPORTED_MODULE_3__["subscribe"])('callbackWebviewMethod', function (response) {
  var error = response.error,
      result = response.result,
      extra = response.extra;
  var currentId = extra.callbackId;
  var executor = callbackMap.get(currentId);

  if (!executor) {
    var info = JSON.stringify(response);
    throw new InvokeError("Executor(".concat(currentId, ") in service not found.\nresponse: ").concat(info));
  }

  if (error) {
    error.env = 'WEBVIEW';
    executor.reject(error);
  } else {
    executor.resolve(result);
  }

  callbackMap["delete"](currentId);
});
Object(_bridge__WEBPACK_IMPORTED_MODULE_3__["subscribe"])('invokeServiceMethod', /*#__PURE__*/function () {
  var _ref = _babel_runtime_helpers_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0___default()( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.mark(function _callee(data, webviewId) {
    var webviewIds, scene, method, extra, params, result;
    return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default.a.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            webviewIds = [webviewId];
            scene = data.scene;
            method = data.method;
            extra = data.extra;
            params = data.params; // api 调用

            result = {};
            publish('callbackServiceMethod', {
              method: method,
              result: result,
              extra: extra
            }, webviewIds);

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());
Object(_bridge__WEBPACK_IMPORTED_MODULE_3__["subscribe"])('DOMContentLoaded', function (params, webviewId) {
  if (started) {
    queue.forEach(function (_ref2) {
      var params = _ref2.params,
          webviewId = _ref2.webviewId;
      return processContentLoad(params, webviewId);
    });
    processContentLoad(params, webviewId);
  } else {
    queue.push({
      params: params,
      webviewId: webviewId
    });
  }
});
Object(_bridge__WEBPACK_IMPORTED_MODULE_3__["subscribe"])('onRenderPageEvent', function (params, webviewId) {
  var method = params.method,
      args = params.args;
  var appImpl = Object(_App__WEBPACK_IMPORTED_MODULE_5__["getAppImpl"])();
  var page = appImpl.getPageByViewId(webviewId);
  page && page.executeUserMethod(method, args);
});
function pauseApp() {
  started = false;
}
function bootstrap() {
  started = true;
  queue.forEach(processMessage);
  queue = [];
}

/***/ }),

/***/ "./src/framework/worker/polyfill.js":
/*!******************************************!*\
  !*** ./src/framework/worker/polyfill.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var g = self;
/* 实现worker中的importScripts */

var importScriptsPolyfill = function importScriptsPolyfill() {
  for (var _len = arguments.length, urls = new Array(_len), _key = 0; _key < _len; _key++) {
    urls[_key] = arguments[_key];
  }

  if (!urls.length) {
    return;
  }

  urls.forEach(function (url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();
      var contentType = xhr.getResponseHeader('content-type');

      if (/(java|ecma)script/.test(contentType)) {
        eval(xhr.responseText);
      }
    } catch (err) {
      console.error(err);
    }
  });
};

g.importScripts = g.importScripts || importScriptsPolyfill;

/***/ }),

/***/ "./src/index.worker.js":
/*!*****************************!*\
  !*** ./src/index.worker.js ***!
  \*****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/bridge */ "./src/bridge/index.js");
/* harmony import */ var _apis___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/apis/ */ "./src/apis/index.worker.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./framework/index.worker */ "./src/framework/index.worker.js");





var __mpStartTime = Date.now();

self.__IS_WORKER__ = true; // 全局注册对象, 提供给宿主调用

self.JSBridgeHandler = {
  /* 调用的回调 */
  invokeHandler: _bridge__WEBPACK_IMPORTED_MODULE_0__["invokeHandler"],

  /* 监听的回调 */
  subscribeHandler: _bridge__WEBPACK_IMPORTED_MODULE_0__["subscribeHandler"]
};
self.MP = {
  bridge: _apis___WEBPACK_IMPORTED_MODULE_1__["default"],
  EventHub: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["EventHub"],
  getStartupParams: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["getStartupParams"],
  setStartupParams: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["setStartupParams"],
  getApp: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["getApp"],
  App: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["App"],
  getCurrentPagesImpl: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["getCurrentPagesImpl"],
  getCurrentPageImpl: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["getCurrentPageImpl"],
  getCurrentPages: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["getCurrentPages"],
  getAppImpl: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["getAppImpl"],
  Component: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["Component"],
  Page: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["Page"],
  Behavior: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["registerBehavior"],
  $global: _framework_index_worker__WEBPACK_IMPORTED_MODULE_3__["$global"]
};

var __mpCosts = Date.now() - __mpStartTime;

Object(_utils_log__WEBPACK_IMPORTED_MODULE_2__["debug"])('framework', "worker bundle costs ".concat(__mpCosts, " ms"));

/***/ }),

/***/ "./src/utils/EventEmitter.js":
/*!***********************************!*\
  !*** ./src/utils/EventEmitter.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! eventemitter3 */ "./node_modules/eventemitter3/index.js");
/* harmony import */ var eventemitter3__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(eventemitter3__WEBPACK_IMPORTED_MODULE_0__);

/* harmony default export */ __webpack_exports__["default"] = (eventemitter3__WEBPACK_IMPORTED_MODULE_0___default.a);

/***/ }),

/***/ "./src/utils/LogBizType.js":
/*!*********************************!*\
  !*** ./src/utils/LogBizType.js ***!
  \*********************************/
/*! exports provided: TAC, APP_BIZ */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TAC", function() { return TAC; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "APP_BIZ", function() { return APP_BIZ; });
/* harmony import */ var _framework_startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/startupParams */ "./src/framework/startupParams/index.js");

var TAC = 'TAC';
function APP_BIZ() {
  return "TinyAppBiz-".concat(Object(_framework_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])().appId);
}

/***/ }),

/***/ "./src/utils/Map.js":
/*!**************************!*\
  !*** ./src/utils/Map.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function getFastKey(key) {
  if (key == null) {
    return "^".concat(String(key));
  } else if (typeof key === 'string') {
    return "$".concat(key);
  } else if (typeof key === 'number') {
    return "n".concat(key);
  } else if (typeof key === 'boolean') {
    return "b".concat(key);
  }

  return null;
}

function Map() {
  this.clear();
}

Map.prototype = {
  constructor: Map,
  _getEntry: function _getEntry(key) {
    var entries = this._entries;

    for (var i = 0, l = entries.length; i < l; i++) {
      if (entries[i][0] === key) {
        return {
          index: i,
          value: entries[i]
        };
      }
    }

    return undefined;
  },
  get: function get(key) {
    var fastKey = getFastKey(key);

    if (fastKey !== null) {
      return this._store[fastKey];
    }

    var entry = this._getEntry(key);

    return entry && entry.value[1];
  },
  entries: function entries() {
    var _this = this;

    var entries = [];
    Object.keys(this._store).forEach(function (k) {
      entries.push([k, _this._store[k]]);
    });
    return entries.concat(this._entries);
  },
  forEach: function forEach(callback, thisArg) {
    var _this = this;

    this.entries().forEach(function (item) {
      callback.call(thisArg, item[1], item[0], _this);
    });
  },
  set: function set(key, value) {
    var fastKey = getFastKey(key);

    if (fastKey !== null) {
      this._store[fastKey] = value;
      return;
    }

    var entry = this._getEntry(key);

    if (entry) {
      entry.value[1] = value;
      return;
    }

    this._entries.push([key, value]);
  },
  "delete": function _delete(key) {
    var fastKey = getFastKey(key);

    if (fastKey !== null) {
      delete this._store[fastKey];
      return;
    }

    var entry = this._getEntry(key);

    if (entry) {
      this._entries.splice(entry.index, 1);
    }
  },
  clear: function clear() {
    this._store = {};
    this._entries = [];
  }
};
/* harmony default export */ __webpack_exports__["default"] = (Map);

/***/ }),

/***/ "./src/utils/bridge.js":
/*!*****************************!*\
  !*** ./src/utils/bridge.js ***!
  \*****************************/
/*! exports provided: toType, mapping, apCallback */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toType", function() { return toType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapping", function() { return mapping; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "apCallback", function() { return apCallback; });
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/typeof */ "./node_modules/@babel/runtime/helpers/typeof.js");
/* harmony import */ var _babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");


/**
 * 拆分类型键名里真正的 key 和对应的 type
 * @method _separateTypeKey
 * @param  {String}         key 带类型标识的键名
 * @return {Object}             返回键名和类型标识两个字段，
 *                              如{k: 'content', t: '%s'}
 */

function _separateTypeKey(key) {
  var matches = (key || '').match(/(\w+)(%\w)$/i);
  var tk = {
    k: key
  };

  if (matches) {
    tk.k = matches[1];
    tk.t = matches[2];
  }

  return tk;
}
/**
 * 超级字符串转换
 */


function __superToString(content) {
  var str = content;

  if (_babel_runtime_helpers_typeof__WEBPACK_IMPORTED_MODULE_0___default()(content) === 'object') {
    str = JSON.stringify(content);
  } else {
    str = "".concat(content);
  }

  return str;
}
/**
 * 16进制颜色转成10进制数字
 * @method __h2dColor
 * @param  {String}   hex 16进制颜色字符串
 * @return {Number}       10进制数字
 */


function __h2dColor(hex) {
  var dec = "".concat(hex); // 如果加了#号，去掉

  if (dec.indexOf('#') === 0) {
    dec = dec.substr(1);
  } // 如果是3位简写，补全成6位


  if (dec.length === 3) {
    dec = dec.replace(/(.)/g, '$1$1');
  }

  dec = parseInt(dec, 16);

  if (isNaN(dec)) {
    console.error("".concat(hex, " is invalid hex color."));
  }

  return dec;
}
/**
 * 移除 base64 数据头，native 接口不需要传入头部
 * @method __removeBase64Head
 * @param  {String}           base64 有头数据
 * @return {String}                  无头数据
 */


function __removeBase64Head(base64) {
  if (typeof base64 === 'string') {
    base64 = base64.replace(/^data:(\/|\w|\-|\.)+;base64,/i, '');
  }

  return base64;
}
/**
 * 把值转换成相应类型
 * @method toType
 * @param  {String} type  类型标识，目前支持
 *                        %s(字符串)
 *                        %c(16转10进制颜色)
 *                        %h(10转16进制颜色)
 *                        %b(移除 base64 数据格式头)
 *                        %a{mimeType}(添加 base64 数据头)
 *                        %d(整数)
 *                        %f(浮点数)
 * @param  {any} value 待转换值，类型未知
 * @return {any}       转换好的相应类型的
 */


function toType(type, value) {
  if (type === '%s') {
    value = __superToString(value);
  } else if (type === '%c') {
    value = __h2dColor(value);
  } else if (type === '%b') {
    value = __removeBase64Head(value);
  } else if (type === '%d') {
    value = parseInt(value, 10);
  } else if (type === '%f') {
    value = parseFloat(value);
  }

  return value;
}
/**
 * 处理对象映射关系
 * @method _mapping
 * @param  {Object}  tObj 原始目标对象
 * @param  {Object}  map 映射关系，如{content: 'text'}，
 *                       即把 sObj.content 的值赋给 tObj.text，
 *                       并删除 tObj 的 content 属性，
 *                       所以 content 就是 sKey，text 就是 tKey。
 *                       可以把 map 对象中的冒号(:)理解成 to，
 *                       即 {content to text}。
 *                       其中 tKey 的值的最后可以加 %s 等类型标识转换成相应类型，
 *                       注意：要加到 最后赋值给 tObj 的 那个 tKey 的后面。
 *                       这么做的目的是因为：
 *                       有些接口的入参字段直接传入 非字符串 值时，接口完全无响应，
 *                       比如 JSBridge.call('alert',{message: 12345})
 *
 * @param  {Object} sObj 参照来源对象
 * @return {Object}     处理映射后的 tObj
 */

function mapping(tObj, map, sObj) {
  var typeKey;
  sObj = sObj || {};
  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(map).forEach(function (sKey) {
    var tKey = map[sKey];
    typeKey = _separateTypeKey(tKey); // 目标 key

    tKey = typeKey.k; // 映射条件，否则不赋值，避免添加 value 为 undefined 的 key

    if (tKey !== undefined && ( // 目标 key 定义过
    sKey in tObj || sKey in sObj) // 源数据至少有一个有效
    && tObj[tKey] === undefined // 目标数据空缺待赋值
    ) {
        // sKey 既可以是 sObj 的，也可以是 tObj 自己的，但sObj 优先级高于原始 tObj
        // 即 sObj[sKey]的值 会覆盖 tObj[sKey]的值
        // 并且要根据 type 占位符做相应类型转换
        tObj[tKey] = toType(typeKey.t, sObj[sKey] === undefined ? tObj[sKey] : sObj[sKey]); // 删除原始 tObj 中的 sKey，tKey 和 sKey 同名时不做删除

        if (tKey !== sKey) {
          delete tObj[sKey];
        }
      }
  });
  return tObj;
}
function apCallback() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var res = arguments.length > 1 ? arguments[1] : undefined;
  var complete = params.complete;
  var success = params.success;
  var fail = params.fail;

  if (res && res.error) {
    if (fail) {
      fail(res);
    }
  } else if (success) {
    success(res);
  }

  if (complete) {
    complete(res);
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

/***/ "./src/utils/endsWith.js":
/*!*******************************!*\
  !*** ./src/utils/endsWith.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return endsWith; });
function endsWith(str, suffix) {
  return str && str.slice(0 - suffix.length) === suffix;
}

/***/ }),

/***/ "./src/utils/errorCodes.js":
/*!*********************************!*\
  !*** ./src/utils/errorCodes.js ***!
  \*********************************/
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

/***/ "./src/utils/extraAPIMap.js":
/*!**********************************!*\
  !*** ./src/utils/extraAPIMap.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./src/utils/extraComponentMap.js":
/*!****************************************!*\
  !*** ./src/utils/extraComponentMap.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({
  'zm-evaluation': '63300045'
});

/***/ }),

/***/ "./src/utils/forEachRight.js":
/*!***********************************!*\
  !*** ./src/utils/forEachRight.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return forEachRight; });
function forEachRight() {
  var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var cb = arguments.length > 1 ? arguments[1] : undefined;
  var len = list.length;

  for (var index = len - 1; index > -1; index--) {
    var item = list[index];
    cb(item);
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

/***/ "./src/utils/getApplicationId.js":
/*!***************************************!*\
  !*** ./src/utils/getApplicationId.js ***!
  \***************************************/
/*! exports provided: getCachedApplicationId, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCachedApplicationId", function() { return getCachedApplicationId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getApplicationId; });
var g = self;
var applicationId = 1000000;
function getCachedApplicationId() {
  return applicationId;
}
function getApplicationId(callback) {
  if (applicationId) {
    return callback(applicationId);
  } // g.registration.pushManager.getSubscription().then(function (subscription) {
  //     if (subscription && subscription.applicationId) {
  //         applicationId = subscription.applicationId;
  //         callback(applicationId);
  //     } else {
  //         setTimeout(function () {
  //             getApplicationId(callback);
  //         }, 150);
  //     }
  // }).catch(function (e) {
  //     Object(_gerror__WEBPACK_IMPORTED_MODULE_1__["default"])(e);
  // });

}

/***/ }),

/***/ "./src/utils/getCurrentViewId.js":
/*!***************************************!*\
  !*** ./src/utils/getCurrentViewId.js ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getCurrentViewId; });
/* harmony import */ var _framework_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/App */ "./src/framework/App/index.worker.js");

function getCurrentViewId() {
  var page = Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])();
  return page && page.getViewId();
}

/***/ }),

/***/ "./src/utils/getHomePage.js":
/*!**********************************!*\
  !*** ./src/utils/getHomePage.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return getHomePage; });
var g = global;
function getHomePage() {
  var mpAppJson = g.mpAppJson;

  var _ref = mpAppJson && mpAppJson.app || {},
      $homepage = _ref.$homepage;

  return $homepage;
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./src/utils/getScene.js":
/*!*******************************!*\
  !*** ./src/utils/getScene.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function getScene(startupParams) {
  return startupParams.ap_framework_sceneId;
}

/* harmony default export */ __webpack_exports__["default"] = (getScene);

/***/ }),

/***/ "./src/utils/invokeWithGuardAndReThrow.js":
/*!************************************************!*\
  !*** ./src/utils/invokeWithGuardAndReThrow.js ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return invokeWithGuardAndReThrow; });
/* harmony import */ var _gerror__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gerror */ "./src/utils/gerror.js");

var g = self;
function invokeWithGuardAndReThrow(fn) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

  if (!fn) {
    return;
  }

  try {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return fn.apply(context, args);
  } catch (e) {
    Object(_gerror__WEBPACK_IMPORTED_MODULE_0__["default"])(e);
  }
}

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
/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startupParams */ "./src/utils/startupParams/index.worker.js");

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

/***/ "./src/utils/isMiniAppPage.js":
/*!************************************!*\
  !*** ./src/utils/isMiniAppPage.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return isMiniAppPage; });
/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startupParams */ "./src/utils/startupParams/index.worker.js");


function getPagePath(url) {
  var index = url.indexOf('#');

  if (index !== -1) {
    url = url.slice(0, index);
  }

  index = url.indexOf('?');

  if (index !== -1) {
    url = url.slice(0, index);
  }

  return url;
} // pushWindow https://m.taobao.com


function isMiniAppPage(pageUrl) {
  var _getStartupParams = Object(_startupParams__WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])();

  var url = _getStartupParams.url;

  if (pageUrl && url) {
    return getPagePath(url) === getPagePath(pageUrl);
  }

  return true;
}

/***/ }),

/***/ "./src/utils/loadExtraRes.js":
/*!***********************************!*\
  !*** ./src/utils/loadExtraRes.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _apis_ap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/apis/ap */ "./src/apis/ap.worker.js");
/* harmony import */ var _endsWith__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./endsWith */ "./src/utils/endsWith.js");


/* harmony default export */ __webpack_exports__["default"] = (function (extraAppId) {
  var Loaded = false;
  var res = _apis_ap__WEBPACK_IMPORTED_MODULE_0__["default"].callInternalAPISync('addPkgRes', {
    resAppId: extraAppId
  });
  res && res.urls && res.urls.forEach(function (item) {
    if (!Loaded && Object(_endsWith__WEBPACK_IMPORTED_MODULE_1__["default"])(item, 'index.worker.js')) {
      importScripts(item);
      Loaded = true;
    }
  });
});

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

/***/ "./src/utils/reportError.worker.js":
/*!*****************************************!*\
  !*** ./src/utils/reportError.worker.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return reportError; });
/* harmony import */ var _framework_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/App */ "./src/framework/App/index.worker.js");

function reportError(code, e) {
  var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (count === 10) {
    return;
  }

  var page = Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])();

  if (page) {
    page.callRemote('bridge', 'reportError', code, e);
  } else {
    setTimeout(function () {
      reportError(code, e, count + 1);
    }, 100);
  }
}

/***/ }),

/***/ "./src/utils/resolvePath.js":
/*!**********************************!*\
  !*** ./src/utils/resolvePath.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return resolvePath; });
/* harmony import */ var _startsWith__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./startsWith */ "./src/utils/startsWith.js");

function resolvePath(path, refered) {
  if (!Object(_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(path, './') && !Object(_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(path, '../')) {
    return path;
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
  var ret = res.join('/');

  if (Object(_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(refered, '/') && !Object(_startsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(ret, '/')) {
    ret = "/".concat(ret);
  }

  return ret;
}

/***/ }),

/***/ "./src/utils/securityPatch.js":
/*!************************************!*\
  !*** ./src/utils/securityPatch.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return securityPatch; });
function securityPatch() {
  var g = self;

  if (typeof Function !== 'undefined') {
    // make sure function t(){} instanceof Function === true
    var empty = {};

    var FakeFunction = function FakeFunction() {
      if (arguments.length > 0 && arguments[arguments.length - 1] === 'return this') {
        return function () {
          return empty;
        };
      }
    };

    FakeFunction.prototype = Function.prototype;
    FakeFunction.prototype.constructor = FakeFunction;
    g.Function = FakeFunction;
  } // g.eval = null;


  var originalSetTimeout = setTimeout;
  var originalSetInterval = setInterval;

  g.setTimeout = function (fn, time) {
    if (typeof fn !== 'function') {
      return;
    }

    return originalSetTimeout(fn, time);
  };

  g.setInterval = function (fn, time) {
    if (typeof fn !== 'function') {
      return;
    }

    return originalSetInterval(fn, time);
  };
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

/***/ "./src/utils/startupParams/index.worker.js":
/*!*************************************************!*\
  !*** ./src/utils/startupParams/index.worker.js ***!
  \*************************************************/
/*! exports provided: setStartupParams, getStartupParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return setStartupParams; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return getStartupParams; });
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! qs */ "./node_modules/qs/lib/index.js");
/* harmony import */ var qs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(qs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _startupParamsHolder__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./startupParamsHolder */ "./src/utils/startupParams/startupParamsHolder.js");


var g = self;
function setStartupParams(v) {
  g.__mpStartupParams = v;
  Object(_startupParamsHolder__WEBPACK_IMPORTED_MODULE_1__["setValue"])(v);
}
function getStartupParams() {
  if (g.__mpStartupParams) {
    return g.__mpStartupParams;
  }

  var startupParams = Object(_startupParamsHolder__WEBPACK_IMPORTED_MODULE_1__["getValue"])();

  if (startupParams) {
    return startupParams;
  }

  var _location = location,
      href = _location.href;
  var queryIndex = href.indexOf('?');
  startupParams = {};

  if (queryIndex !== -1) {
    var queryString = href.slice(queryIndex + 1);
    startupParams = Object(qs__WEBPACK_IMPORTED_MODULE_0__["parse"])(queryString);
    setStartupParams(startupParams);
  }

  return startupParams;
}

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

/***/ "./src/utils/system.js":
/*!*****************************!*\
  !*** ./src/utils/system.js ***!
  \*****************************/
/*! exports provided: systemVersion, UCVersion, isAndroid, isIOS, isIDE, SDKVersion, isUC, isNativeComponent, compareVersion, logSystemInfo, compareSystemVersion, compareUCVersion, iOSVersion */
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
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iOSVersion", function() { return iOSVersion; });
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
var iOSVersion = /iPhone OS (\d{2})/.exec(ua);

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

/***/ "./src/utils/upperFirstChar.js":
/*!*************************************!*\
  !*** ./src/utils/upperFirstChar.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return upperFirstChar; });
function upperFirstChar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/***/ }),

/***/ 0:
/*!********************************!*\
  !*** ./util.inspect (ignored) ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })

/******/ });
//# sourceMappingURL=mp.worker.js.map