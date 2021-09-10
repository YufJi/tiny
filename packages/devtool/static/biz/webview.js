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
/******/ 	return __webpack_require__(__webpack_require__.s = "./todo/.cache/index.webview.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../packages/compiler/node_modules/webpack/buildin/global.js":
/*!*******************************************************************!*\
  !*** ../packages/compiler/node_modules/webpack/buildin/global.js ***!
  \*******************************************************************/
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

/***/ "../packages/compiler/src/sjsEnvInit.js":
/*!**********************************************!*\
  !*** ../packages/compiler/src/sjsEnvInit.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/* eslint-disable no-extend-native */
const g = typeof global !== 'undefined' ? global : self;

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
if (!g.__sjsEnvInited) {
  g.__sjsEnvInited = true;

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

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/global.js */ "../packages/compiler/node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./todo/.cache/appConfig.json":
/*!************************************!*\
  !*** ./todo/.cache/appConfig.json ***!
  \************************************/
/*! exports provided: window, pages, launchParams, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"window\":{\"backgroundTextStyle\":\"light\",\"navigationBarBackgroundColor\":16777215,\"navigationBarTitleText\":\"WeChat\",\"navigationBarTextStyle\":\"black\"},\"pages\":[\"pages/index/index\"],\"launchParams\":{\"pages/index/index\":{\"backgroundTextStyle\":\"light\",\"navigationBarBackgroundColor\":16777215,\"navigationBarTitleText\":\"TODO List\",\"navigationBarTextStyle\":\"black\"}}}");

/***/ }),

/***/ "./todo/.cache/config.js":
/*!*******************************!*\
  !*** ./todo/.cache/config.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
const g = typeof global !== 'undefined' ? global : self;
const appConfig = __webpack_require__(/*! ./appConfig.json */ "./todo/.cache/appConfig.json");
g.TinyConfig = appConfig;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../packages/compiler/node_modules/webpack/buildin/global.js */ "../packages/compiler/node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "./todo/.cache/index.webview.js":
/*!**************************************!*\
  !*** ./todo/.cache/index.webview.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(/*! tiny-compiler/sjsEnvInit */ "../packages/compiler/src/sjsEnvInit.js");
__webpack_require__(/*! ./config */ "./todo/.cache/config.js");
__webpack_require__(/*! ../comp?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 */ "./todo/comp.js?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6");
__webpack_require__(/*! ../custom-wrapper?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 */ "./todo/custom-wrapper.js?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6");
__webpack_require__(/*! ../pages/index/index?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24 */ "./todo/pages/index/index.js?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24");


/***/ }),

/***/ "./todo/app.wxss":
/*!***********************!*\
  !*** ./todo/app.wxss ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const { TinyStyleSheet } = self;
const stylesheet = new TinyStyleSheet({ stylePath: 'app.wxss' });
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`tiny-html, tiny-body {
    margin: 0;
    padding: 0;
  }
  tiny-button {
    margin: 0;
    padding: 0;
    border: 0;
    vertical-align: baseline;
    font-family: inherit;
    font-weight: inherit;
    color: inherit;
  }
  tiny-body, tiny-page {
    font: 28rpx 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: #f5f5f5;
    color: #4d4d4d;
    margin: 0 auto;
    font-weight: 300;
  }
  :focus {
    outline: 0;
  }
  .hidden {
    display: none;
  }
  .todoapp {
    background: #fff;
    margin: 210rpx 0 40rpx 0;
    position: relative;
  }
  tiny-input::-webkit-input-placeholder {
    font-style: italic;
    font-weight: 300;
    color: #e6e6e6;
  }
  tiny-input::-moz-placeholder {
    font-style: italic;
    font-weight: 300;
    color: #e6e6e6;
  }
  .info {
    margin: 130rpx auto 0;
    color: #bfbfbf;
    text-shadow: 0 2rpx 0 rgba(255, 255, 255, 0.5);
  }
  .info tiny-p {
    line-height: 1;
  }
  .info tiny-a {
    color: inherit;
    text-decoration: none;
    font-weight: 400;
  }
  .info tiny-a:hover {
    text-decoration: underline;
  }
  .weui-cells_checkbox {
    margin-right: 10rpx;
  }`));

/***/ }),

/***/ "./todo/base.wxml":
/*!************************!*\
  !*** ./todo/base.wxml ***!
  \************************/
/*! exports provided: $ownTemplates, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "$ownTemplates", function() { return $ownTemplates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return render; });
/* harmony import */ var _utils_wxs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils.wxs */ "./todo/utils.wxs");
/* harmony import */ var _utils_wxs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_utils_wxs__WEBPACK_IMPORTED_MODULE_0__);
var Nerv = self.Nerv;
var $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;

var $iterate = self.XMLRuntime.iterate;
var $createRoot = self.XMLRuntime.createRoot;
var $createBlock = self.XMLRuntime.createBlock;
var $useTemplate = self.XMLRuntime.useTemplate;
var $createTemplate = self.XMLRuntime.createTemplate;
var $renderSlot = self.XMLRuntime.renderSlot;
var $getSJSMember = self.XMLRuntime.getSJSMember;
var $toString = self.XMLRuntime.toString;
var $getLooseDataMember = self.XMLRuntime.getLooseDataMember;
var $template;
var $ownTemplates = {};

$template = $ownTemplates["taro_tmpl"] = function (data) {
  var _ctx = data._ctx;
  return $iterate($getLooseDataMember([data['root'], "cn"]), function (item, index) {
    return $useTemplate($templates['tmpl_0_container'], {
      i: item,
      l: ''
    }, undefined, _ctx);
  });
};

$template.Component = $createTemplate("taro_tmpl", $template);

$template = $ownTemplates["tmpl_0_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_catch-view", $template);

$template = $ownTemplates["tmpl_0_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_static-view", $template);

$template = $ownTemplates["tmpl_0_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_pure-view", $template);

$template = $ownTemplates["tmpl_0_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_view", $template);

$template = $ownTemplates["tmpl_0_static-text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_static-text", $template);

$template = $ownTemplates["tmpl_0_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_text", $template);

$template = $ownTemplates["tmpl_0_checkbox"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-checkbox", {
    value: $getLooseDataMember([data['i'], "value"]),
    disabled: $getLooseDataMember([data['i'], "disabled"]),
    checked: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "checked"]), false),
    color: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "color"]), '#09BB07'),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_checkbox", $template);

$template = $ownTemplates["tmpl_0_checkbox-group"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-checkbox-group", {
    bindchange: _ctx.$$eventBinder('eh'),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_checkbox-group", $template);

$template = $ownTemplates["tmpl_0_input"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "c"], 1)(data['i'], 'tmpl_0_')], {
    i: data['i']
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_0_input", $template);

$template = $ownTemplates["tmpl_0_input_focus"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-input", {
    value: $getLooseDataMember([data['i'], "value"]),
    type: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "type"]), ''),
    password: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "password"]), false),
    placeholder: $getLooseDataMember([data['i'], "placeholder"]),
    "placeholder-style": $getLooseDataMember([data['i'], "placeholderStyle"]),
    "placeholder-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "placeholderClass"]), 'input-placeholder'),
    disabled: $getLooseDataMember([data['i'], "disabled"]),
    maxlength: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "maxlength"]), 140),
    "cursor-spacing": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "cursorSpacing"]), 0),
    focus: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "focus"]), false),
    "confirm-type": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "confirmType"]), 'done'),
    "confirm-hold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "confirmHold"]), false),
    cursor: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "cursor"]), $getLooseDataMember([data['i'], "value", "length"])),
    "selection-start": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectionStart"]), -1),
    "selection-end": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectionEnd"]), -1),
    bindinput: _ctx.$$eventBinder('eh'),
    bindfocus: _ctx.$$eventBinder('eh'),
    bindblur: _ctx.$$eventBinder('eh'),
    bindconfirm: _ctx.$$eventBinder('eh'),
    name: $getLooseDataMember([data['i'], "name"]),
    "auto-focus": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "autoFocus"]), false),
    "always-embed": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "alwaysEmbed"]), false),
    "adjust-position": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "adjustPosition"]), true),
    "hold-keyboard": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "holdKeyboard"]), false),
    bindkeyboardheightchange: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  });
};

$template.Component = $createTemplate("tmpl_0_input_focus", $template);

$template = $ownTemplates["tmpl_0_input_blur"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-input", {
    value: $getLooseDataMember([data['i'], "value"]),
    type: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "type"]), ''),
    password: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "password"]), false),
    placeholder: $getLooseDataMember([data['i'], "placeholder"]),
    "placeholder-style": $getLooseDataMember([data['i'], "placeholderStyle"]),
    "placeholder-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "placeholderClass"]), 'input-placeholder'),
    disabled: $getLooseDataMember([data['i'], "disabled"]),
    maxlength: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "maxlength"]), 140),
    "cursor-spacing": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "cursorSpacing"]), 0),
    "confirm-type": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "confirmType"]), 'done'),
    "confirm-hold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "confirmHold"]), false),
    cursor: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "cursor"]), $getLooseDataMember([data['i'], "value", "length"])),
    "selection-start": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectionStart"]), -1),
    "selection-end": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectionEnd"]), -1),
    bindinput: _ctx.$$eventBinder('eh'),
    bindfocus: _ctx.$$eventBinder('eh'),
    bindblur: _ctx.$$eventBinder('eh'),
    bindconfirm: _ctx.$$eventBinder('eh'),
    name: $getLooseDataMember([data['i'], "name"]),
    "auto-focus": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "autoFocus"]), false),
    "always-embed": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "alwaysEmbed"]), false),
    "adjust-position": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "adjustPosition"]), true),
    "hold-keyboard": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "holdKeyboard"]), false),
    bindkeyboardheightchange: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  });
};

$template.Component = $createTemplate("tmpl_0_input_blur", $template);

$template = $ownTemplates["tmpl_0_label"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-label", {
    "for": $getLooseDataMember([data['i'], "for"]),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_label", $template);

$template = $ownTemplates["tmpl_0_scroll-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-scroll-view", {
    "scroll-x": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollX"]), false),
    "scroll-y": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollY"]), false),
    "upper-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "upperThreshold"]), 50),
    "lower-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "lowerThreshold"]), 50),
    "scroll-top": $getLooseDataMember([data['i'], "scrollTop"]),
    "scroll-left": $getLooseDataMember([data['i'], "scrollLeft"]),
    "scroll-into-view": $getLooseDataMember([data['i'], "scrollIntoView"]),
    "scroll-with-animation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollWithAnimation"]), false),
    "enable-back-to-top": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableBackToTop"]), false),
    bindscrolltoupper: _ctx.$$eventBinder('eh'),
    bindscrolltolower: _ctx.$$eventBinder('eh'),
    bindscroll: _ctx.$$eventBinder('eh'),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    "enable-flex": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableFlex"]), false),
    "scroll-anchoring": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollAnchoring"]), false),
    "refresher-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherEnabled"]), false),
    "refresher-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherThreshold"]), 45),
    "refresher-default-style": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherDefaultStyle"]), 'black'),
    "refresher-background": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherBackground"]), '#FFF'),
    "refresher-triggered": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherTriggered"]), false),
    enhanced: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enhanced"]), false),
    bounces: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "bounces"]), true),
    "show-scrollbar": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "showScrollbar"]), true),
    "paging-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "pagingEnabled"]), false),
    "fast-deceleration": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "fastDeceleration"]), false),
    binddragstart: _ctx.$$eventBinder('eh'),
    binddragging: _ctx.$$eventBinder('eh'),
    binddragend: _ctx.$$eventBinder('eh'),
    bindrefresherpulling: _ctx.$$eventBinder('eh'),
    bindrefresherrefresh: _ctx.$$eventBinder('eh'),
    bindrefresherrestore: _ctx.$$eventBinder('eh'),
    bindrefresherabort: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_scroll-view", $template);

$template = $ownTemplates["tmpl_0_static-image"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-image", {
    src: $getLooseDataMember([data['i'], "src"]),
    mode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "mode"]), 'scaleToFill'),
    "lazy-load": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "lazyLoad"]), false),
    webp: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "webp"]), false),
    "show-menu-by-longpress": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "showMenuByLongpress"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_static-image", $template);

$template = $ownTemplates["tmpl_0_image"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-image", {
    src: $getLooseDataMember([data['i'], "src"]),
    mode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "mode"]), 'scaleToFill'),
    "lazy-load": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "lazyLoad"]), false),
    binderror: _ctx.$$eventBinder('eh'),
    bindload: _ctx.$$eventBinder('eh'),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    webp: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "webp"]), false),
    "show-menu-by-longpress": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "showMenuByLongpress"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_0_image", $template);

$template = $ownTemplates["tmpl_0_#text"] = function (data) {
  var _ctx = data._ctx;
  return $getLooseDataMember([data['i'], "v"]);
};

$template.Component = $createTemplate("tmpl_0_#text", $template);

$template = $ownTemplates["tmpl_0_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(0, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 0,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_0_container", $template);

$template = $ownTemplates["tmpl_1_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_catch-view", $template);

$template = $ownTemplates["tmpl_1_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_static-view", $template);

$template = $ownTemplates["tmpl_1_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_pure-view", $template);

$template = $ownTemplates["tmpl_1_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_view", $template);

$template = $ownTemplates["tmpl_1_static-text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_static-text", $template);

$template = $ownTemplates["tmpl_1_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_text", $template);

$template = $ownTemplates["tmpl_1_label"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-label", {
    "for": $getLooseDataMember([data['i'], "for"]),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_label", $template);

$template = $ownTemplates["tmpl_1_scroll-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-scroll-view", {
    "scroll-x": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollX"]), false),
    "scroll-y": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollY"]), false),
    "upper-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "upperThreshold"]), 50),
    "lower-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "lowerThreshold"]), 50),
    "scroll-top": $getLooseDataMember([data['i'], "scrollTop"]),
    "scroll-left": $getLooseDataMember([data['i'], "scrollLeft"]),
    "scroll-into-view": $getLooseDataMember([data['i'], "scrollIntoView"]),
    "scroll-with-animation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollWithAnimation"]), false),
    "enable-back-to-top": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableBackToTop"]), false),
    bindscrolltoupper: _ctx.$$eventBinder('eh'),
    bindscrolltolower: _ctx.$$eventBinder('eh'),
    bindscroll: _ctx.$$eventBinder('eh'),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    "enable-flex": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableFlex"]), false),
    "scroll-anchoring": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollAnchoring"]), false),
    "refresher-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherEnabled"]), false),
    "refresher-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherThreshold"]), 45),
    "refresher-default-style": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherDefaultStyle"]), 'black'),
    "refresher-background": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherBackground"]), '#FFF'),
    "refresher-triggered": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherTriggered"]), false),
    enhanced: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enhanced"]), false),
    bounces: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "bounces"]), true),
    "show-scrollbar": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "showScrollbar"]), true),
    "paging-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "pagingEnabled"]), false),
    "fast-deceleration": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "fastDeceleration"]), false),
    binddragstart: _ctx.$$eventBinder('eh'),
    binddragging: _ctx.$$eventBinder('eh'),
    binddragend: _ctx.$$eventBinder('eh'),
    bindrefresherpulling: _ctx.$$eventBinder('eh'),
    bindrefresherrefresh: _ctx.$$eventBinder('eh'),
    bindrefresherrestore: _ctx.$$eventBinder('eh'),
    bindrefresherabort: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_1_scroll-view", $template);

$template = $ownTemplates["tmpl_1_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(1, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 1,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_1_container", $template);

$template = $ownTemplates["tmpl_2_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_catch-view", $template);

$template = $ownTemplates["tmpl_2_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_static-view", $template);

$template = $ownTemplates["tmpl_2_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_pure-view", $template);

$template = $ownTemplates["tmpl_2_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_view", $template);

$template = $ownTemplates["tmpl_2_static-text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_static-text", $template);

$template = $ownTemplates["tmpl_2_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_text", $template);

$template = $ownTemplates["tmpl_2_label"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-label", {
    "for": $getLooseDataMember([data['i'], "for"]),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_label", $template);

$template = $ownTemplates["tmpl_2_scroll-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-scroll-view", {
    "scroll-x": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollX"]), false),
    "scroll-y": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollY"]), false),
    "upper-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "upperThreshold"]), 50),
    "lower-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "lowerThreshold"]), 50),
    "scroll-top": $getLooseDataMember([data['i'], "scrollTop"]),
    "scroll-left": $getLooseDataMember([data['i'], "scrollLeft"]),
    "scroll-into-view": $getLooseDataMember([data['i'], "scrollIntoView"]),
    "scroll-with-animation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollWithAnimation"]), false),
    "enable-back-to-top": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableBackToTop"]), false),
    bindscrolltoupper: _ctx.$$eventBinder('eh'),
    bindscrolltolower: _ctx.$$eventBinder('eh'),
    bindscroll: _ctx.$$eventBinder('eh'),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    "enable-flex": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableFlex"]), false),
    "scroll-anchoring": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollAnchoring"]), false),
    "refresher-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherEnabled"]), false),
    "refresher-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherThreshold"]), 45),
    "refresher-default-style": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherDefaultStyle"]), 'black'),
    "refresher-background": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherBackground"]), '#FFF'),
    "refresher-triggered": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherTriggered"]), false),
    enhanced: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enhanced"]), false),
    bounces: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "bounces"]), true),
    "show-scrollbar": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "showScrollbar"]), true),
    "paging-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "pagingEnabled"]), false),
    "fast-deceleration": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "fastDeceleration"]), false),
    binddragstart: _ctx.$$eventBinder('eh'),
    binddragging: _ctx.$$eventBinder('eh'),
    binddragend: _ctx.$$eventBinder('eh'),
    bindrefresherpulling: _ctx.$$eventBinder('eh'),
    bindrefresherrefresh: _ctx.$$eventBinder('eh'),
    bindrefresherrestore: _ctx.$$eventBinder('eh'),
    bindrefresherabort: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_2_scroll-view", $template);

$template = $ownTemplates["tmpl_2_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(2, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 2,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_2_container", $template);

$template = $ownTemplates["tmpl_3_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_catch-view", $template);

$template = $ownTemplates["tmpl_3_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_static-view", $template);

$template = $ownTemplates["tmpl_3_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_pure-view", $template);

$template = $ownTemplates["tmpl_3_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_view", $template);

$template = $ownTemplates["tmpl_3_static-text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_static-text", $template);

$template = $ownTemplates["tmpl_3_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_text", $template);

$template = $ownTemplates["tmpl_3_label"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-label", {
    "for": $getLooseDataMember([data['i'], "for"]),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_label", $template);

$template = $ownTemplates["tmpl_3_scroll-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-scroll-view", {
    "scroll-x": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollX"]), false),
    "scroll-y": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollY"]), false),
    "upper-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "upperThreshold"]), 50),
    "lower-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "lowerThreshold"]), 50),
    "scroll-top": $getLooseDataMember([data['i'], "scrollTop"]),
    "scroll-left": $getLooseDataMember([data['i'], "scrollLeft"]),
    "scroll-into-view": $getLooseDataMember([data['i'], "scrollIntoView"]),
    "scroll-with-animation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollWithAnimation"]), false),
    "enable-back-to-top": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableBackToTop"]), false),
    bindscrolltoupper: _ctx.$$eventBinder('eh'),
    bindscrolltolower: _ctx.$$eventBinder('eh'),
    bindscroll: _ctx.$$eventBinder('eh'),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    "enable-flex": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enableFlex"]), false),
    "scroll-anchoring": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "scrollAnchoring"]), false),
    "refresher-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherEnabled"]), false),
    "refresher-threshold": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherThreshold"]), 45),
    "refresher-default-style": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherDefaultStyle"]), 'black'),
    "refresher-background": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherBackground"]), '#FFF'),
    "refresher-triggered": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "refresherTriggered"]), false),
    enhanced: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "enhanced"]), false),
    bounces: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "bounces"]), true),
    "show-scrollbar": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "showScrollbar"]), true),
    "paging-enabled": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "pagingEnabled"]), false),
    "fast-deceleration": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "fastDeceleration"]), false),
    binddragstart: _ctx.$$eventBinder('eh'),
    binddragging: _ctx.$$eventBinder('eh'),
    binddragend: _ctx.$$eventBinder('eh'),
    bindrefresherpulling: _ctx.$$eventBinder('eh'),
    bindrefresherrefresh: _ctx.$$eventBinder('eh'),
    bindrefresherrestore: _ctx.$$eventBinder('eh'),
    bindrefresherabort: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_3_scroll-view", $template);

$template = $ownTemplates["tmpl_3_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(3, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 3,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_3_container", $template);

$template = $ownTemplates["tmpl_4_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_4_catch-view", $template);

$template = $ownTemplates["tmpl_4_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_4_static-view", $template);

$template = $ownTemplates["tmpl_4_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_4_pure-view", $template);

$template = $ownTemplates["tmpl_4_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_4_view", $template);

$template = $ownTemplates["tmpl_4_static-text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_4_static-text", $template);

$template = $ownTemplates["tmpl_4_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_4_text", $template);

$template = $ownTemplates["tmpl_4_label"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-label", {
    "for": $getLooseDataMember([data['i'], "for"]),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_4_label", $template);

$template = $ownTemplates["tmpl_4_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(4, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 4,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_4_container", $template);

$template = $ownTemplates["tmpl_5_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_5_catch-view", $template);

$template = $ownTemplates["tmpl_5_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_5_static-view", $template);

$template = $ownTemplates["tmpl_5_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_5_pure-view", $template);

$template = $ownTemplates["tmpl_5_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_5_view", $template);

$template = $ownTemplates["tmpl_5_static-text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_5_static-text", $template);

$template = $ownTemplates["tmpl_5_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_5_text", $template);

$template = $ownTemplates["tmpl_5_label"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-label", {
    "for": $getLooseDataMember([data['i'], "for"]),
    name: $getLooseDataMember([data['i'], "name"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_5_label", $template);

$template = $ownTemplates["tmpl_5_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(5, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 5,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_5_container", $template);

$template = $ownTemplates["tmpl_6_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_6_catch-view", $template);

$template = $ownTemplates["tmpl_6_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_6_static-view", $template);

$template = $ownTemplates["tmpl_6_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_6_pure-view", $template);

$template = $ownTemplates["tmpl_6_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_6_view", $template);

$template = $ownTemplates["tmpl_6_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_6_text", $template);

$template = $ownTemplates["tmpl_6_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(6, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 6,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_6_container", $template);

$template = $ownTemplates["tmpl_7_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_7_catch-view", $template);

$template = $ownTemplates["tmpl_7_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_7_static-view", $template);

$template = $ownTemplates["tmpl_7_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_7_pure-view", $template);

$template = $ownTemplates["tmpl_7_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_7_view", $template);

$template = $ownTemplates["tmpl_7_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_7_text", $template);

$template = $ownTemplates["tmpl_7_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(7, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 7,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_7_container", $template);

$template = $ownTemplates["tmpl_8_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_8_catch-view", $template);

$template = $ownTemplates["tmpl_8_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_8_static-view", $template);

$template = $ownTemplates["tmpl_8_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_8_pure-view", $template);

$template = $ownTemplates["tmpl_8_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_8_view", $template);

$template = $ownTemplates["tmpl_8_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_8_text", $template);

$template = $ownTemplates["tmpl_8_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(8, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 8,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_8_container", $template);

$template = $ownTemplates["tmpl_9_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_9_catch-view", $template);

$template = $ownTemplates["tmpl_9_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_9_static-view", $template);

$template = $ownTemplates["tmpl_9_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_9_pure-view", $template);

$template = $ownTemplates["tmpl_9_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_9_view", $template);

$template = $ownTemplates["tmpl_9_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_9_text", $template);

$template = $ownTemplates["tmpl_9_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(9, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 9,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_9_container", $template);

$template = $ownTemplates["tmpl_10_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_10_catch-view", $template);

$template = $ownTemplates["tmpl_10_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_10_static-view", $template);

$template = $ownTemplates["tmpl_10_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_10_pure-view", $template);

$template = $ownTemplates["tmpl_10_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_10_view", $template);

$template = $ownTemplates["tmpl_10_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_10_text", $template);

$template = $ownTemplates["tmpl_10_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(10, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 10,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_10_container", $template);

$template = $ownTemplates["tmpl_11_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_11_catch-view", $template);

$template = $ownTemplates["tmpl_11_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_11_static-view", $template);

$template = $ownTemplates["tmpl_11_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_11_pure-view", $template);

$template = $ownTemplates["tmpl_11_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_11_view", $template);

$template = $ownTemplates["tmpl_11_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_11_text", $template);

$template = $ownTemplates["tmpl_11_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(11, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 11,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_11_container", $template);

$template = $ownTemplates["tmpl_12_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_12_catch-view", $template);

$template = $ownTemplates["tmpl_12_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_12_static-view", $template);

$template = $ownTemplates["tmpl_12_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_12_pure-view", $template);

$template = $ownTemplates["tmpl_12_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_12_view", $template);

$template = $ownTemplates["tmpl_12_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_12_text", $template);

$template = $ownTemplates["tmpl_12_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(12, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 12,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_12_container", $template);

$template = $ownTemplates["tmpl_13_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_13_catch-view", $template);

$template = $ownTemplates["tmpl_13_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_13_static-view", $template);

$template = $ownTemplates["tmpl_13_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_13_pure-view", $template);

$template = $ownTemplates["tmpl_13_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_13_view", $template);

$template = $ownTemplates["tmpl_13_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_13_text", $template);

$template = $ownTemplates["tmpl_13_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(13, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 13,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_13_container", $template);

$template = $ownTemplates["tmpl_14_catch-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    catchtouchmove: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_14_catch-view", $template);

$template = $ownTemplates["tmpl_14_static-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_14_static-view", $template);

$template = $ownTemplates["tmpl_14_pure-view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_14_pure-view", $template);

$template = $ownTemplates["tmpl_14_view"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-view", {
    "hover-class": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverClass"]), 'none'),
    "hover-stop-propagation": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStopPropagation"]), false),
    "hover-start-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStartTime"]), 50),
    "hover-stay-time": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "hoverStayTime"]), 400),
    animation: $getLooseDataMember([data['i'], "animation"]),
    bindtouchstart: _ctx.$$eventBinder('eh'),
    bindtouchmove: _ctx.$$eventBinder('eh'),
    bindtouchend: _ctx.$$eventBinder('eh'),
    bindtouchcancel: _ctx.$$eventBinder('eh'),
    bindlongpress: _ctx.$$eventBinder('eh'),
    bindanimationstart: _ctx.$$eventBinder('eh'),
    bindanimationiteration: _ctx.$$eventBinder('eh'),
    bindanimationend: _ctx.$$eventBinder('eh'),
    bindtransitionend: _ctx.$$eventBinder('eh'),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_14_view", $template);

$template = $ownTemplates["tmpl_14_text"] = function (data) {
  var _ctx = data._ctx;
  return Nerv.createElement("tiny-text", {
    selectable: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "selectable"]), false),
    space: $getLooseDataMember([data['i'], "space"]),
    decode: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "decode"]), false),
    "user-select": $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "b"], 1)($getLooseDataMember([data['i'], "userSelect"]), false),
    style: $getLooseDataMember([data['i'], "st"]),
    className: $getLooseDataMember([data['i'], "cl"]),
    bindtap: _ctx.$$eventBinder('eh'),
    id: $getLooseDataMember([data['i'], "uid"])
  }, $iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "e"], 1)(data['cid'] + 1)], {
      i: item,
      l: data['l']
    }, undefined, _ctx);
  }));
};

$template.Component = $createTemplate("tmpl_14_text", $template);

$template = $ownTemplates["tmpl_14_container"] = function (data) {
  var _ctx = data._ctx;
  return $useTemplate($templates[$getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "a"], 1)(14, $getLooseDataMember([data['i'], "nn"]), data['l'])], {
    i: data['i'],
    cid: 14,
    l: $getSJSMember([_utils_wxs__WEBPACK_IMPORTED_MODULE_0___default.a, "f"], 1)(data['l'], $getLooseDataMember([data['i'], "nn"]))
  }, undefined, _ctx);
};

$template.Component = $createTemplate("tmpl_14_container", $template);

$template = $ownTemplates["tmpl_15_container"] = function (data) {
  var _ctx = data._ctx;
  return $getLooseDataMember([data['i'], "nn"]) === '#text' ? $useTemplate($templates['tmpl_0_#text'], {
    i: data['i']
  }, undefined, _ctx) : Nerv.createElement(Comp, {
    i: data['i'],
    l: data['l']
  });
};

$template.Component = $createTemplate("tmpl_15_container", $template);
var $templates = {};
$templates = $ownTemplates;
function render(data, _ctx) {
  return $createRoot(null);
}
;

/***/ }),

/***/ "./todo/comp.js?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6":
/*!********************************************************************!*\
  !*** ./todo/comp.js?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


  window.app = window.app || {};
  window.app['/comp'] = {
    // is: "/comp",
    usingComponents: {"comp":"/comp","custom-wrapper":"/custom-wrapper"},
    get render() { 
      const fn = __webpack_require__(/*! ./comp.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 */ "./todo/comp.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6"); 
      return fn.default || fn;
    },
    
  };
  

/***/ }),

/***/ "./todo/comp.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6":
/*!**********************************************************************!*\
  !*** ./todo/comp.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 ***!
  \**********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return render; });
/* harmony import */ var _base_wxml__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.wxml */ "./todo/base.wxml");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Nerv = self.Nerv;
var $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;
var $iterate = self.XMLRuntime.iterate;
var $createRoot = self.XMLRuntime.createRoot;
var $createBlock = self.XMLRuntime.createBlock;
var $useTemplate = self.XMLRuntime.useTemplate;
var $createTemplate = self.XMLRuntime.createTemplate;
var $renderSlot = self.XMLRuntime.renderSlot;
var $getSJSMember = self.XMLRuntime.getSJSMember;
var $toString = self.XMLRuntime.toString;
var $getLooseDataMember = self.XMLRuntime.getLooseDataMember;

var $templates = {};
$templates = _objectSpread({}, _base_wxml__WEBPACK_IMPORTED_MODULE_0__["$ownTemplates"]);
function render(data, _ctx) {
  return $createRoot($useTemplate($templates['tmpl_0_container'], {
    i: data['i'],
    l: data['l']
  }, undefined, _ctx));
}
;

/***/ }),

/***/ "./todo/custom-wrapper.js?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6":
/*!******************************************************************************!*\
  !*** ./todo/custom-wrapper.js?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


  window.app = window.app || {};
  window.app['/custom-wrapper'] = {
    // is: "/custom-wrapper",
    usingComponents: {"comp":"/comp","custom-wrapper":"/custom-wrapper"},
    get render() { 
      const fn = __webpack_require__(/*! ./custom-wrapper.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 */ "./todo/custom-wrapper.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6"); 
      return fn.default || fn;
    },
    
  };
  

/***/ }),

/***/ "./todo/custom-wrapper.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6":
/*!********************************************************************************!*\
  !*** ./todo/custom-wrapper.wxml?hash=20e859dc304e591d1ed540e3b5edbe5ebe750fd6 ***!
  \********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return render; });
/* harmony import */ var _base_wxml__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.wxml */ "./todo/base.wxml");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Nerv = self.Nerv;
var $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;
var $iterate = self.XMLRuntime.iterate;
var $createRoot = self.XMLRuntime.createRoot;
var $createBlock = self.XMLRuntime.createBlock;
var $useTemplate = self.XMLRuntime.useTemplate;
var $createTemplate = self.XMLRuntime.createTemplate;
var $renderSlot = self.XMLRuntime.renderSlot;
var $getSJSMember = self.XMLRuntime.getSJSMember;
var $toString = self.XMLRuntime.toString;
var $getLooseDataMember = self.XMLRuntime.getLooseDataMember;

var $templates = {};
$templates = _objectSpread({}, _base_wxml__WEBPACK_IMPORTED_MODULE_0__["$ownTemplates"]);
function render(data, _ctx) {
  return $createRoot($iterate($getLooseDataMember([data['i'], "cn"]), function (item, index) {
    return $useTemplate($templates['tmpl_0_container'], {
      i: item,
      l: ''
    }, undefined, _ctx);
  }));
}
;

/***/ }),

/***/ "./todo/pages/index/index.js?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24":
/*!************************************************************************!*\
  !*** ./todo/pages/index?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24 ***!
  \************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


    window.app = window.app || {};
    window.app['pages/index/index'] = {
      usingComponents: {"custom-wrapper":"/custom-wrapper","comp":"/comp"},
      
      get render() {
        const fn = __webpack_require__(/*! ./index.wxml?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24 */ "./todo/pages/index/index.wxml?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24")
        return fn.default || fn;
      },
      get stylesheet() { 
        const fn = __webpack_require__(/*! ./index.wxss?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24 */ "./todo/pages/index/index.wxss?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24"); 
        return fn.default || fn; 
      },
    };

    if (!window['generateFunc']) {
      window['generateFunc'] = {}
    }
    window['generateFunc']['pages/index/index'] = function() {
      const generateFunc = window.app['pages/index/index'];

      document.dispatchEvent(new CustomEvent("generateFuncReady", {
        detail: {
          generateFunc
        }
      }))
    };
  

/***/ }),

/***/ "./todo/pages/index/index.wxml?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24":
/*!***********************************************************************************!*\
  !*** ./todo/pages/index/index.wxml?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24 ***!
  \***********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return render; });
/* harmony import */ var _base_wxml__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../base.wxml */ "./todo/base.wxml");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Nerv = self.Nerv;
var $EmptyComponentFactory = self.XMLRuntime.EmptyComponentFactory;
var $iterate = self.XMLRuntime.iterate;
var $createRoot = self.XMLRuntime.createRoot;
var $createBlock = self.XMLRuntime.createBlock;
var $useTemplate = self.XMLRuntime.useTemplate;
var $createTemplate = self.XMLRuntime.createTemplate;
var $renderSlot = self.XMLRuntime.renderSlot;
var $getSJSMember = self.XMLRuntime.getSJSMember;
var $toString = self.XMLRuntime.toString;
var $getLooseDataMember = self.XMLRuntime.getLooseDataMember;

var $templates = {};
$templates = _objectSpread({}, _base_wxml__WEBPACK_IMPORTED_MODULE_0__["$ownTemplates"]);
function render(data, _ctx) {
  return $createRoot($useTemplate($templates['taro_tmpl'], {
    root: data['root']
  }, undefined, _ctx));
}
;

/***/ }),

/***/ "./todo/pages/index/index.wxss?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24":
/*!***********************************************************************************!*\
  !*** ./todo/pages/index/index.wxss?hash=d9740d61a4468ab1489217bf8b30ac7e199f3c24 ***!
  \***********************************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _app_wxss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../app.wxss */ "./todo/app.wxss");
const { TinyStyleSheet } = self;
const stylesheet = new TinyStyleSheet({ stylePath: 'pages/index/index.wxss' });

stylesheet.imports(_app_wxss__WEBPACK_IMPORTED_MODULE_0__["default"]);
/* harmony default export */ __webpack_exports__["default"] = (stylesheet.exports(`.new-todo {
    padding: 32rpx;
    font-size: 48rpx;
    font-style: italic;
    font-weight: 300;
    color: black;
    box-shadow: none;
    background: rgba(0, 0, 0, 0.003);
  }
  .filters-link {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    padding: 6rpx 14rpx;
    border-width: 2rpx;
    border-style: solid;
    border-color: transparent;
    border-radius: 6rpx;
  }
  .filters-link:hover {
    border-color: #efd5d5;
  }
  .selected {
    border-color: #efd5d5;
    border-width: 2rpx;
  }
  .title {
    width: 100%;
    font-size: 100rpx;
    font-weight: 100;
    text-align: center;
    color: rgba(175, 47, 47, 0.55);
  }
  .header-title-wrap {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    background-color: #F5F5F5;
  }
  .textinput-wrap {
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
    border: 1rpx solid #e6e6e6;
  }
  .textinput-wrap-icon {
    font-size: 44rpx;
    color: #e6e6e6;
    padding: 20rpx 54rpx 20rpx 54rpx;
    -webkit-transform: rotate(90deg);
            transform: rotate(90deg);
  }
  .todo-text-input {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
  }
  .textinput-wrap-input {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
  }
  .filters {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    font-weight: 400;
    margin: 0;
    padding: 0;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    background-color: #F5F5F5;
  }
  .filters-item {
    margin: 6rpx;
  }
  .footer:before {
    content: '';
    position: absolute;
    z-index: -1;
    right: 0;
    bottom: 0;
    left: 0;
    height: 100rpx;
    overflow: hidden;
    box-shadow: 0 1rpx 1rpx rgba(0, 0, 0, 0.2), 0 8rpx 0 -3rpx #f6f6f6, 0 9rpx 1rpx -3rpx rgba(0, 0, 0, 0.2), 0 16rpx 0 -6rpx #f6f6f6, 0 17rpx 2rpx -6rpx rgba(0, 0, 0, 0.2);
  }
  .footer {
    padding: 20rpx 30rpx;
    border-top-width: 2rpx;
    border-top-color: #e6e6e6;
    border-style: solid;
    border-bottom-width: 0;
    border-left-width: 0;
    border-right-width: 0;
  }
  .footer-content {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
  }
  .todo-count {
    -webkit-box-flex: 1;
    -webkit-flex: 1;
            flex: 1;
    color: #777;
  }
  .todo-count tiny-strong {
    font-weight: 300;
  }
  .clear-completed-text {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    color: #777;
    -webkit-box-pack: end;
    -webkit-justify-content: flex-end;
            justify-content: flex-end;
  }
@media (max-width: 430px) {
  .footer {
    height: 50rpx;
  }
}
  .checkbox-label {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    margin: 10rpx;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -webkit-flex-direction: row;
            flex-direction: row;
    -webkit-box-align: center;
    -webkit-align-items: center;
            align-items: center;
  }
  .checkbox {
    margin-right: 10rpx;
  }
  .todo-list {
    margin: 0;
    padding: 0;
  }
  .main {
    position: relative;
    z-index: 2;
    border-top-width: 1rpx;
    border-style: solid;
    border-top-color: #e6e6e6;
    border-bottom-width: 0;
    border-left-width: 0;
    border-right-width: 0;
  }
  .checkbox-group {
    margin-bottom: 10rpx;
  }
  .todaoapp {
    background-color: white;
  }`));

/***/ }),

/***/ "./todo/utils.wxs":
/*!************************!*\
  !*** ./todo/utils.wxs ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = {
  $sjs_a: function ($sjs_l, $sjs_n, $sjs_s) {
    var $sjs_a = ["view", "catch-view", "cover-view", "static-view", "pure-view", "block", "text", "static-text", "slot", "slot-view", "label", "form", "scroll-view", "swiper", "swiper-item"];
    var $sjs_b = ["static-text", "slot", "slot-view", "label", "form", "scroll-view", "swiper", "swiper-item"];

    if ($sjs_a.$sjs_indexOf($sjs_n) === -1) {
      $sjs_l = 0;
    }

    if ($sjs_b.$sjs_indexOf($sjs_n) > -1) {
      var $sjs_u = $sjs_s.$sjs_split(',');
      var $sjs_depth = 0;

      for (var $sjs_i = 0; $sjs_i < $sjs_u.$sjs_length; $sjs_i++) {
        if ($sjs_u[_$sjs_p($sjs_i)] === $sjs_n) $sjs_depth++;
      }

      $sjs_l = $sjs_depth;
    }

    return 'tmpl_' + $sjs_l + '_' + $sjs_n;
  },
  $sjs_b: function ($sjs_a, $sjs_b) {
    return $sjs_a === undefined ? $sjs_b : $sjs_a;
  },
  $sjs_c: function ($sjs_i, $sjs_prefix) {
    var $sjs_s = $sjs_i.$sjs_focus !== undefined ? 'focus' : 'blur';
    return $sjs_prefix + $sjs_i.$sjs_nn + '_' + $sjs_s;
  },
  $sjs_d: function ($sjs_i, $sjs_v) {
    return $sjs_i === undefined ? $sjs_v : $sjs_i;
  },
  $sjs_e: function ($sjs_n) {
    return 'tmpl_' + $sjs_n + '_container';
  },
  $sjs_f: function ($sjs_l, $sjs_n) {
    var $sjs_b = ["static-text", "slot", "slot-view", "label", "form", "scroll-view", "swiper", "swiper-item"];

    if ($sjs_b.$sjs_indexOf($sjs_n) > -1) {
      if ($sjs_l) $sjs_l += ',';
      $sjs_l += $sjs_n;
    }

    return $sjs_l;
  }
};

/***/ })

/******/ });