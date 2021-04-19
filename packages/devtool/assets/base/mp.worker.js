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

/***/ "./node_modules/decode-uri-component/index.js":
/*!****************************************************!*\
  !*** ./node_modules/decode-uri-component/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
  try {
    // Try to decode the entire string first
    return decodeURIComponent(components.join(''));
  } catch (err) {// Do nothing
  }

  if (components.length === 1) {
    return components;
  }

  split = split || 1; // Split the array in 2 parts

  var left = components.slice(0, split);
  var right = components.slice(split);
  return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
  try {
    return decodeURIComponent(input);
  } catch (err) {
    var tokens = input.match(singleMatcher);

    for (var i = 1; i < tokens.length; i++) {
      input = decodeComponents(tokens, i).join('');
      tokens = input.match(singleMatcher);
    }

    return input;
  }
}

function customDecodeURIComponent(input) {
  // Keep track of all the replacements and prefill the map with the `BOM`
  var replaceMap = {
    '%FE%FF': '\uFFFD\uFFFD',
    '%FF%FE': '\uFFFD\uFFFD'
  };
  var match = multiMatcher.exec(input);

  while (match) {
    try {
      // Decode as big chunks as possible
      replaceMap[match[0]] = decodeURIComponent(match[0]);
    } catch (err) {
      var result = decode(match[0]);

      if (result !== match[0]) {
        replaceMap[match[0]] = result;
      }
    }

    match = multiMatcher.exec(input);
  } // Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else


  replaceMap['%C2'] = '\uFFFD';
  var entries = Object.keys(replaceMap);

  for (var i = 0; i < entries.length; i++) {
    // Replace all decoded components
    var key = entries[i];
    input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
  }

  return input;
}

module.exports = function (encodedURI) {
  if (typeof encodedURI !== 'string') {
    throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
  }

  try {
    encodedURI = encodedURI.replace(/\+/g, ' '); // Try the built in decoder first

    return decodeURIComponent(encodedURI);
  } catch (err) {
    // Fallback to a more advanced decoder
    return customDecodeURIComponent(encodedURI);
  }
};

/***/ }),

/***/ "./node_modules/filter-obj/index.js":
/*!******************************************!*\
  !*** ./node_modules/filter-obj/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (obj, predicate) {
  var ret = {};
  var keys = Object.keys(obj);
  var isArr = Array.isArray(predicate);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = obj[key];

    if (isArr ? predicate.indexOf(key) !== -1 : predicate(key, val, obj)) {
      ret[key] = val;
    }
  }

  return ret;
};

/***/ }),

/***/ "./node_modules/query-string/index.js":
/*!********************************************!*\
  !*** ./node_modules/query-string/index.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const strictUriEncode = __webpack_require__(/*! strict-uri-encode */ "./node_modules/strict-uri-encode/index.js");

const decodeComponent = __webpack_require__(/*! decode-uri-component */ "./node_modules/decode-uri-component/index.js");

const splitOnFirst = __webpack_require__(/*! split-on-first */ "./node_modules/split-on-first/index.js");

const filterObject = __webpack_require__(/*! filter-obj */ "./node_modules/filter-obj/index.js");

const isNullOrUndefined = value => value === null || value === undefined;

function encoderForArrayFormat(options) {
  switch (options.arrayFormat) {
    case 'index':
      return key => (result, value) => {
        const index = result.length;

        if (value === undefined || options.skipNull && value === null || options.skipEmptyString && value === '') {
          return result;
        }

        if (value === null) {
          return [...result, [encode(key, options), '[', index, ']'].join('')];
        }

        return [...result, [encode(key, options), '[', encode(index, options), ']=', encode(value, options)].join('')];
      };

    case 'bracket':
      return key => (result, value) => {
        if (value === undefined || options.skipNull && value === null || options.skipEmptyString && value === '') {
          return result;
        }

        if (value === null) {
          return [...result, [encode(key, options), '[]'].join('')];
        }

        return [...result, [encode(key, options), '[]=', encode(value, options)].join('')];
      };

    case 'comma':
    case 'separator':
      return key => (result, value) => {
        if (value === null || value === undefined || value.length === 0) {
          return result;
        }

        if (result.length === 0) {
          return [[encode(key, options), '=', encode(value, options)].join('')];
        }

        return [[result, encode(value, options)].join(options.arrayFormatSeparator)];
      };

    default:
      return key => (result, value) => {
        if (value === undefined || options.skipNull && value === null || options.skipEmptyString && value === '') {
          return result;
        }

        if (value === null) {
          return [...result, encode(key, options)];
        }

        return [...result, [encode(key, options), '=', encode(value, options)].join('')];
      };
  }
}

function parserForArrayFormat(options) {
  let result;

  switch (options.arrayFormat) {
    case 'index':
      return (key, value, accumulator) => {
        result = /\[(\d*)\]$/.exec(key);
        key = key.replace(/\[\d*\]$/, '');

        if (!result) {
          accumulator[key] = value;
          return;
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = {};
        }

        accumulator[key][result[1]] = value;
      };

    case 'bracket':
      return (key, value, accumulator) => {
        result = /(\[\])$/.exec(key);
        key = key.replace(/\[\]$/, '');

        if (!result) {
          accumulator[key] = value;
          return;
        }

        if (accumulator[key] === undefined) {
          accumulator[key] = [value];
          return;
        }

        accumulator[key] = [].concat(accumulator[key], value);
      };

    case 'comma':
    case 'separator':
      return (key, value, accumulator) => {
        const isArray = typeof value === 'string' && value.includes(options.arrayFormatSeparator);
        const isEncodedArray = typeof value === 'string' && !isArray && decode(value, options).includes(options.arrayFormatSeparator);
        value = isEncodedArray ? decode(value, options) : value;
        const newValue = isArray || isEncodedArray ? value.split(options.arrayFormatSeparator).map(item => decode(item, options)) : value === null ? value : decode(value, options);
        accumulator[key] = newValue;
      };

    default:
      return (key, value, accumulator) => {
        if (accumulator[key] === undefined) {
          accumulator[key] = value;
          return;
        }

        accumulator[key] = [].concat(accumulator[key], value);
      };
  }
}

function validateArrayFormatSeparator(value) {
  if (typeof value !== 'string' || value.length !== 1) {
    throw new TypeError('arrayFormatSeparator must be single character string');
  }
}

function encode(value, options) {
  if (options.encode) {
    return options.strict ? strictUriEncode(value) : encodeURIComponent(value);
  }

  return value;
}

function decode(value, options) {
  if (options.decode) {
    return decodeComponent(value);
  }

  return value;
}

function keysSorter(input) {
  if (Array.isArray(input)) {
    return input.sort();
  }

  if (typeof input === 'object') {
    return keysSorter(Object.keys(input)).sort((a, b) => Number(a) - Number(b)).map(key => input[key]);
  }

  return input;
}

function removeHash(input) {
  const hashStart = input.indexOf('#');

  if (hashStart !== -1) {
    input = input.slice(0, hashStart);
  }

  return input;
}

function getHash(url) {
  let hash = '';
  const hashStart = url.indexOf('#');

  if (hashStart !== -1) {
    hash = url.slice(hashStart);
  }

  return hash;
}

function extract(input) {
  input = removeHash(input);
  const queryStart = input.indexOf('?');

  if (queryStart === -1) {
    return '';
  }

  return input.slice(queryStart + 1);
}

function parseValue(value, options) {
  if (options.parseNumbers && !Number.isNaN(Number(value)) && typeof value === 'string' && value.trim() !== '') {
    value = Number(value);
  } else if (options.parseBooleans && value !== null && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
    value = value.toLowerCase() === 'true';
  }

  return value;
}

function parse(query, options) {
  options = Object.assign({
    decode: true,
    sort: true,
    arrayFormat: 'none',
    arrayFormatSeparator: ',',
    parseNumbers: false,
    parseBooleans: false
  }, options);
  validateArrayFormatSeparator(options.arrayFormatSeparator);
  const formatter = parserForArrayFormat(options); // Create an object with no prototype

  const ret = Object.create(null);

  if (typeof query !== 'string') {
    return ret;
  }

  query = query.trim().replace(/^[?#&]/, '');

  if (!query) {
    return ret;
  }

  for (const param of query.split('&')) {
    if (param === '') {
      continue;
    }

    let [key, value] = splitOnFirst(options.decode ? param.replace(/\+/g, ' ') : param, '='); // Missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters

    value = value === undefined ? null : ['comma', 'separator'].includes(options.arrayFormat) ? value : decode(value, options);
    formatter(decode(key, options), value, ret);
  }

  for (const key of Object.keys(ret)) {
    const value = ret[key];

    if (typeof value === 'object' && value !== null) {
      for (const k of Object.keys(value)) {
        value[k] = parseValue(value[k], options);
      }
    } else {
      ret[key] = parseValue(value, options);
    }
  }

  if (options.sort === false) {
    return ret;
  }

  return (options.sort === true ? Object.keys(ret).sort() : Object.keys(ret).sort(options.sort)).reduce((result, key) => {
    const value = ret[key];

    if (Boolean(value) && typeof value === 'object' && !Array.isArray(value)) {
      // Sort object keys, not values
      result[key] = keysSorter(value);
    } else {
      result[key] = value;
    }

    return result;
  }, Object.create(null));
}

exports.extract = extract;
exports.parse = parse;

exports.stringify = (object, options) => {
  if (!object) {
    return '';
  }

  options = Object.assign({
    encode: true,
    strict: true,
    arrayFormat: 'none',
    arrayFormatSeparator: ','
  }, options);
  validateArrayFormatSeparator(options.arrayFormatSeparator);

  const shouldFilter = key => options.skipNull && isNullOrUndefined(object[key]) || options.skipEmptyString && object[key] === '';

  const formatter = encoderForArrayFormat(options);
  const objectCopy = {};

  for (const key of Object.keys(object)) {
    if (!shouldFilter(key)) {
      objectCopy[key] = object[key];
    }
  }

  const keys = Object.keys(objectCopy);

  if (options.sort !== false) {
    keys.sort(options.sort);
  }

  return keys.map(key => {
    const value = object[key];

    if (value === undefined) {
      return '';
    }

    if (value === null) {
      return encode(key, options);
    }

    if (Array.isArray(value)) {
      return value.reduce(formatter(key), []).join('&');
    }

    return encode(key, options) + '=' + encode(value, options);
  }).filter(x => x.length > 0).join('&');
};

exports.parseUrl = (url, options) => {
  options = Object.assign({
    decode: true
  }, options);
  const [url_, hash] = splitOnFirst(url, '#');
  return Object.assign({
    url: url_.split('?')[0] || '',
    query: parse(extract(url), options)
  }, options && options.parseFragmentIdentifier && hash ? {
    fragmentIdentifier: decode(hash, options)
  } : {});
};

exports.stringifyUrl = (object, options) => {
  options = Object.assign({
    encode: true,
    strict: true
  }, options);
  const url = removeHash(object.url).split('?')[0] || '';
  const queryFromUrl = exports.extract(object.url);
  const parsedQueryFromUrl = exports.parse(queryFromUrl, {
    sort: false
  });
  const query = Object.assign(parsedQueryFromUrl, object.query);
  let queryString = exports.stringify(query, options);

  if (queryString) {
    queryString = `?${queryString}`;
  }

  let hash = getHash(object.url);

  if (object.fragmentIdentifier) {
    hash = `#${encode(object.fragmentIdentifier, options)}`;
  }

  return `${url}${queryString}${hash}`;
};

exports.pick = (input, filter, options) => {
  options = Object.assign({
    parseFragmentIdentifier: true
  }, options);
  const {
    url,
    query,
    fragmentIdentifier
  } = exports.parseUrl(input, options);
  return exports.stringifyUrl({
    url,
    query: filterObject(query, filter),
    fragmentIdentifier
  }, options);
};

exports.exclude = (input, filter, options) => {
  const exclusionFilter = Array.isArray(filter) ? key => !filter.includes(key) : (key, value) => !filter(key, value);
  return exports.pick(input, exclusionFilter, options);
};

/***/ }),

/***/ "./node_modules/split-on-first/index.js":
/*!**********************************************!*\
  !*** ./node_modules/split-on-first/index.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = (string, separator) => {
  if (!(typeof string === 'string' && typeof separator === 'string')) {
    throw new TypeError('Expected the arguments to be of type `string`');
  }

  if (separator === '') {
    return [string];
  }

  const separatorIndex = string.indexOf(separator);

  if (separatorIndex === -1) {
    return [string];
  }

  return [string.slice(0, separatorIndex), string.slice(separatorIndex + separator.length)];
};

/***/ }),

/***/ "./node_modules/strict-uri-encode/index.js":
/*!*************************************************!*\
  !*** ./node_modules/strict-uri-encode/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = str => encodeURIComponent(str).replace(/[!'()*]/g, x => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);

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
        viewId: params.viewId || Object(_utils_getCurrentViewId__WEBPACK_IMPORTED_MODULE_1__["default"])()
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
          index: -delta
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
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _callRender__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./callRender */ "./src/apis/callRender.worker.js");
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/startupParams */ "./src/utils/startupParams/index.worker.js");
/* harmony import */ var _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/EventEmitter */ "./src/utils/EventEmitter.js");
/* harmony import */ var _utils_isDebug__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/isDebug */ "./src/utils/isDebug.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }






var g = self;
var globalEmitter = new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_3__["default"]();

function log() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // debug.apply(undefined, ['framework'].concat(args));
  _utils_log__WEBPACK_IMPORTED_MODULE_0__["debug"].apply(void 0, ['framework'].concat(args));
}

function getUserEventName(name) {
  return "_$".concat(name);
}

function getUserEventDataName(name) {
  return "_data_$".concat(name);
}

function cleanEventData(userEventData) {
  if (userEventData && _typeof(userEventData) === 'object' && 'NBPageUrl' in userEventData) {
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
g.callRender = _callRender__WEBPACK_IMPORTED_MODULE_1__["default"];
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

  if (ddOrAp && !Object(_utils_startupParams__WEBPACK_IMPORTED_MODULE_2__["getStartupParams"])().isInternalApp) {
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

  if (ddOrAp && !Object(_utils_startupParams__WEBPACK_IMPORTED_MODULE_2__["getStartupParams"])().isInternalApp) {
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
/* harmony import */ var _framework_App__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/App */ "./src/framework/App/index.worker.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }


function callRender(method) {
  var _page$callRemote;

  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _params$homepage = params.homepage,
      homepage = _params$homepage === void 0 ? false : _params$homepage,
      _params$args = params.args,
      innerArgs = _params$args === void 0 ? [] : _params$args,
      _params$caller = params.caller,
      caller = _params$caller === void 0 ? 'bridge' : _params$caller;
  var pages = Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getCurrentPagesImpl"])();
  var page = params.page || (homepage ? pages && pages[0] : Object(_framework_App__WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])());

  if (!page) {
    console.warn('Can not getCurrentPage for callBridge.worker!', method, params);
    return;
  }

  var args = [caller, method].concat(innerArgs);
  var lastArg = args[args.length - 1];

  if (lastArg) {
    if (_typeof(lastArg) === 'object') {
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

  (_page$callRemote = page.callRemote).call.apply(_page$callRemote, [page].concat(_toConsumableArray(args)));
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
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/upperFirstChar */ "./src/utils/upperFirstChar.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/extraAPIMap */ "./src/utils/extraAPIMap.js");
/* harmony import */ var _utils_loadExtraRes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/loadExtraRes */ "./src/utils/loadExtraRes.js");
/* harmony import */ var _utils_errorCodes__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/errorCodes */ "./src/utils/errorCodes.js");
/* harmony import */ var _utils_reportError__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/reportError */ "./src/utils/reportError.worker.js");
/* harmony import */ var _utils_bridge__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @/utils/bridge */ "./src/utils/bridge.js");
/* harmony import */ var _NavigationAPI__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./NavigationAPI */ "./src/apis/NavigationAPI.worker.js");
/* harmony import */ var _listen__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./listen */ "./src/apis/listen.worker.js");
/* harmony import */ var _callRender__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./callRender */ "./src/apis/callRender.worker.js");
/* harmony import */ var _ap__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ap */ "./src/apis/ap.worker.js");
/* harmony import */ var _worker_canIUse__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./worker/canIUse */ "./src/apis/worker/canIUse.js");
/* harmony import */ var _worker_createSelectorQuery__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./worker/createSelectorQuery */ "./src/apis/worker/createSelectorQuery.js");
/* harmony import */ var _worker_canvas_CanvasAPI__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./worker/canvas/CanvasAPI */ "./src/apis/worker/canvas/CanvasAPI.js");
/* harmony import */ var _worker_Animation__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./worker/Animation */ "./src/apis/worker/Animation.js");
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


















var callBridge = _ap__WEBPACK_IMPORTED_MODULE_12__["default"].callBridge,
    callBridgeSync = _ap__WEBPACK_IMPORTED_MODULE_12__["default"].callBridgeSync,
    callInternalAPI = _ap__WEBPACK_IMPORTED_MODULE_12__["default"].callInternalAPI,
    callInternalAPISync = _ap__WEBPACK_IMPORTED_MODULE_12__["default"].callInternalAPISync;
var g = self;

var bridge = _objectSpread(_objectSpread({
  renderTarget: 'web',
  on: function on(name, fn) {
    _ap__WEBPACK_IMPORTED_MODULE_12__["default"].onUserEvent(name, fn);
    return {
      remove: function remove() {
        _ap__WEBPACK_IMPORTED_MODULE_12__["default"].offUserEvent(name, fn);
      }
    };
  },
  // for test
  emit: function emit() {
    var _ap$emitUserEvent;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    (_ap$emitUserEvent = _ap__WEBPACK_IMPORTED_MODULE_12__["default"].emitUserEvent).call.apply(_ap$emitUserEvent, [_ap__WEBPACK_IMPORTED_MODULE_12__["default"]].concat(args));
  },
  call: function call() {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    callBridge.call.apply(callBridge, [_ap__WEBPACK_IMPORTED_MODULE_12__["default"]].concat(args));
  },
  callSync: function callSync() {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    callBridgeSync.call.apply(callBridgeSync, [_ap__WEBPACK_IMPORTED_MODULE_12__["default"]].concat(args));
  }
}, _NavigationAPI__WEBPACK_IMPORTED_MODULE_9__["default"]), {}, {
  // for internal call render
  postMessage: function postMessage(data) {
    Object(_callRender__WEBPACK_IMPORTED_MODULE_11__["default"])('fireMessage', {
      args: [data]
    });
  },
  createAnimation: function createAnimation() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return new _worker_Animation__WEBPACK_IMPORTED_MODULE_16__["default"](config);
  },
  pageScrollTo: function pageScrollTo() {
    for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    Object(_callRender__WEBPACK_IMPORTED_MODULE_11__["default"])('pageScrollTo', {
      args: args
    });
  },
  SDKVersion: _utils_system__WEBPACK_IMPORTED_MODULE_1__["SDKVersion"],
  // for canvas web
  __emit: function __emit() {
    for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      args[_key5] = arguments[_key5];
    }

    _ap__WEBPACK_IMPORTED_MODULE_12__["default"].emit.apply(_ap__WEBPACK_IMPORTED_MODULE_12__["default"], args);
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
    return Object(_worker_canIUse__WEBPACK_IMPORTED_MODULE_13__["default"])(bridge, name);
  },
  createSelectorQuery: _worker_createSelectorQuery__WEBPACK_IMPORTED_MODULE_14__["default"],
  loadFontFace: function loadFontFace(params) {
    var page = params.page;
    var config;

    if (page) {
      config = {
        viewId: page.$viewId
      };
    }

    var success = params.success,
        fail = params.fail,
        complete = params.complete,
        data = _objectWithoutProperties(params, ["success", "fail", "complete"]);

    (page || Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])()).callRemote('bridge', 'loadFontFace', data, function (res) {
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
    Object(_utils_bridge__WEBPACK_IMPORTED_MODULE_8__["apCallback"])(params);
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
    (page || Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])()).callRemote('bridge', 'hideKeyboard');
  },
  reportCustomError: function reportCustomError(error) {
    Object(_utils_reportError__WEBPACK_IMPORTED_MODULE_7__["default"])(_utils_errorCodes__WEBPACK_IMPORTED_MODULE_6__["CUSTOM_WORKER_ERROR"], {
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
}, _worker_canvas_CanvasAPI__WEBPACK_IMPORTED_MODULE_15__["default"]);

Object(_listen__WEBPACK_IMPORTED_MODULE_10__["default"])(_ap__WEBPACK_IMPORTED_MODULE_12__["default"], bridge);
Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(_utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_4__["default"]).forEach(function (item) {
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
      var extraAPIName = Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_2__["default"])(realAPIName);

      if (g["MP".concat(extraAPIName)]) {
        g["MP".concat(extraAPIName)](params, {
          callBridge: callBridge,
          callBridgeSync: callBridgeSync
        });
      } else {
        Object(_utils_loadExtraRes__WEBPACK_IMPORTED_MODULE_5__["default"])(_utils_extraAPIMap__WEBPACK_IMPORTED_MODULE_4__["default"][item]);

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
Object(_utils_system__WEBPACK_IMPORTED_MODULE_1__["logSystemInfo"])();
_framework___WEBPACK_IMPORTED_MODULE_0__["$global"].bridge = bridge;
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
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(query_string__WEBPACK_IMPORTED_MODULE_0__);
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
      query = query_string__WEBPACK_IMPORTED_MODULE_0___default.a.parse(query);
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
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
/* harmony import */ var _utils_getHomePage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/getHomePage */ "./src/utils/getHomePage.js");
/* harmony import */ var _utils_LogBizType__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/LogBizType */ "./src/utils/LogBizType.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }






function escapeDot(str) {
  return str.replace(/\./g, '_DOT_');
}

function getAutoTrackerConfig(_pagePath) {
  var pagePath = _pagePath || '';

  if (!pagePath && Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])()) {
    pagePath = Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])().getPagePath();
  }

  var _getStartupParams = Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getStartupParams"])();

  var appId = _getStartupParams.appId;
  return {
    spmId: "MiniApp_".concat(appId, ".").concat(escapeDot(pagePath)),
    bizType: Object(_utils_LogBizType__WEBPACK_IMPORTED_MODULE_2__["APP_BIZ"])()
  };
}

var noop = function noop() {};

function handleCallbackParams(params, resolve, reject) {
  var _params$success = params.success,
      success = _params$success === void 0 ? noop : _params$success,
      _params$fail = params.fail,
      fail = _params$fail === void 0 ? noop : _params$fail,
      _params$complete = params.complete,
      complete = _params$complete === void 0 ? noop : _params$complete,
      rest = _objectWithoutProperties(params, ["success", "fail", "complete"]);

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
  var homepage = Object(_utils_getHomePage__WEBPACK_IMPORTED_MODULE_1__["default"])();
  var tabs = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(_framework___WEBPACK_IMPORTED_MODULE_0__["$global"].tabsConfig); // 页面堆栈第一个元素

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
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Animation = /*#__PURE__*/function () {
  function Animation(config) {
    _classCallCheck(this, Animation);

    this.config = _objectSpread({}, config);
    this.config.duration = this.config.duration || 400;
    this.config.timeFunction = this.config.timeFunction || 'linear';
    this.config.transformOrigin = this.config.transformOrigin || '50% 50% 0';
    this.animations = [];
    this.currentAnimation = [];
  }

  _createClass(Animation, [{
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
/* harmony import */ var _apis_callRender_worker__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/apis/callRender.worker */ "./src/apis/callRender.worker.js");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
/* harmony import */ var _apis_ap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/apis/ap */ "./src/apis/ap.worker.js");
/* harmony import */ var _utils_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/system */ "./src/utils/system.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/EventEmitter */ "./src/utils/EventEmitter.js");
/* harmony import */ var _utils_resolvePath__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/resolvePath */ "./src/utils/resolvePath.js");
/* harmony import */ var _utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/upperFirstChar */ "./src/utils/upperFirstChar.js");
/* harmony import */ var _util__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../util */ "./src/apis/util.js");
/* harmony import */ var _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./CanvasProtocolEncoder */ "./src/apis/worker/canvas/CanvasProtocolEncoder.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./bridge */ "./src/apis/worker/canvas/bridge.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }












var styleProperties = ['fillStyle', 'strokeStyle', 'globalAlpha', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'textBaseline', 'lineDashOffset', 'textAlign', 'globalCompositeOperation'];

function getSetUpperName(name) {
  return "set".concat(Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_7__["default"])(name));
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
  this.emitter = new _utils_EventEmitter__WEBPACK_IMPORTED_MODULE_5__["default"]();
  this.page = page;
  this.enableNative = enableNative !== false && _utils_system__WEBPACK_IMPORTED_MODULE_3__["isNativeComponent"] && Object(_framework___WEBPACK_IMPORTED_MODULE_1__["getStartupParams"])().hasNativeCanvas;
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
    this.enableCompactProtocol = Object(_framework___WEBPACK_IMPORTED_MODULE_1__["getStartupParams"])().nativeCanvasCompactProtocol;
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
    return this.page || Object(_framework___WEBPACK_IMPORTED_MODULE_1__["getCurrentPageImpl"])();
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

      _apis_ap__WEBPACK_IMPORTED_MODULE_2__["default"].on(type, listener);
    }
  },
  _unListen: function _unListen(type, callback) {
    var emitter = this.emitter;
    emitter.off(type, callback);

    if (emitter.listenerCount(type) === 0) {
      var listener = this.callBackMap[type];

      if (listener) {
        _apis_ap__WEBPACK_IMPORTED_MODULE_2__["default"].off(type, listener);
        delete this.callBackMap[type];
      }
    }
  },
  _commitDrawFrame: function _commitDrawFrame(reserve, actions, callback) {
    var actionsEncoded = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeDrawActions(this, actions);

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

      Object(_bridge__WEBPACK_IMPORTED_MODULE_10__["callCanvasBridge"])('NBComponent.sendMessage', {
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
    this._listen("nbcomponent.canvas.on".concat(Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_7__["default"])(type)), callback);
  },
  removeEventListener: function removeEventListener(type, callback) {
    this._unListen("nbcomponent.canvas.on".concat(Object(_utils_upperFirstChar__WEBPACK_IMPORTED_MODULE_7__["default"])(type)), callback);
  },
  destroy: function destroy() {
    var _this2 = this;

    Object.keys(this.callBackMap).forEach(function (k) {
      _apis_ap__WEBPACK_IMPORTED_MODULE_2__["default"].off(k, _this2.callBackMap[k]);
    });
  },
  draw: function draw(reserve, callback) {
    var that = this;
    var encoder = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"];

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
        Object(_apis_callRender_worker__WEBPACK_IMPORTED_MODULE_0__["default"])('toDataURL', {
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
      return Object(_bridge__WEBPACK_IMPORTED_MODULE_10__["callBridgeAPI"])(this, 'toTempFilePath', clean(params), params);
    } else {
      return new Promise(function (resolve, reject) {
        Object(_apis_callRender_worker__WEBPACK_IMPORTED_MODULE_0__["default"])('toTempFilePath', {
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
    this.actions = this.actions.concat(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeProperties(this, [{
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
    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeProperty(this, {
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

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeProperty(this, {
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
Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_4__["default"])(imageDataAPI).forEach(function (apiName) {
  var apiConfig = imageDataAPI[apiName] || {};

  contextPrototype[apiName] = function (param) {
    var _this6 = this;

    var _a = Object(_util__WEBPACK_IMPORTED_MODULE_8__["handleCallbackParams"])(param);

    var success = _a.success,
        fail = _a.fail,
        rest = _objectWithoutProperties(_a, ["success", "fail"]);

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
      return Object(_bridge__WEBPACK_IMPORTED_MODULE_10__["callBridgeAPI"])(this, apiName, rest, param);
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
      if ((property === 'fillStyle' || property === 'strokeStyle') && value != null && _typeof(value) === 'object' && value["class"] === 'pattern') {
        var firstArg = value.args[0];

        if (typeof firstArg === 'string' && firstArg) {
          var imgInfo = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].getLoadedImage(that, firstArg);

          if (imgInfo) {
            if (_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].isValidImageInfo(imgInfo)) {
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
        } else if (_typeof(firstArg) === 'object' && _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].isValidImageInfo(firstArg)) {
          value.args = [firstArg.id, firstArg.width, firstArg.height, value.args[1]];
        }
      }
    }

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeProperty(this, {
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

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeDrawApi(this, {
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
      img = Object(_utils_resolvePath__WEBPACK_IMPORTED_MODULE_6__["default"])(img_, "/".concat(this._getPage().getPagePath()));
    }

    if (this.enableCompactProtocol) {
      // compact协议会将drawImage尝试转化为draw本地cache格式
      var imgInfo = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].getLoadedImage(this, img);
      var finalArgs;

      if (imgInfo) {
        // 扩展为全参数格式
        if (_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].isValidImageInfo(imgInfo)) {
          finalArgs = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].formatDrawImageArgs(imgInfo, args);
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

    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeDrawApi(this, {
      action: 'drawImage',
      args: finalArgs
    }));
  } else if (img && _typeof(img) === 'object' && _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].isValidImageInfo(img)) {
    // 有效的图片对象格式
    if (this.enableCompactProtocol) {
      var fArgs = _CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].formatDrawImageArgs(img, args);
      this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeDrawApi(this, {
        action: 'drawImage',
        args: fArgs
      }));
    }
  } else if (img && img.isCanvasContext) {
    this.actions.push(_CanvasProtocolEncoder__WEBPACK_IMPORTED_MODULE_9__["default"].encodeDrawApi(this, {
      action: 'drawCanvas',
      args: [img.id].concat(args)
    }));
  }
};

contextPrototype.measureText = function measureText(value) {
  if (this.enableNative) {
    var result = Object(_bridge__WEBPACK_IMPORTED_MODULE_10__["callBridgeAPI"])(this, 'measureText', {
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
  return _apis_ap__WEBPACK_IMPORTED_MODULE_2__["default"].callSync('measureText', {
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

    Object(_apis_callRender_worker__WEBPACK_IMPORTED_MODULE_0__["default"])('toTempFilePath', {
      caller: "refComponents.".concat(args[0].canvasId),
      args: args
    });
  },
  createCanvasContext: function createCanvasContext(id, options) {
    return new Context(id, _objectSpread(_objectSpread({}, options), {}, {
      page: Object(_framework___WEBPACK_IMPORTED_MODULE_1__["getCurrentPageImpl"])()
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
/* harmony import */ var _apis_ap__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/apis/ap */ "./src/apis/ap.worker.js");
/* harmony import */ var _bridge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./bridge */ "./src/apis/worker/canvas/bridge.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



var callBridge = _apis_ap__WEBPACK_IMPORTED_MODULE_0__["default"].callBridge;
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
      if (params.value && _typeof(params.value) === 'object') {
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
      Object(_bridge__WEBPACK_IMPORTED_MODULE_1__["callBridgeAPI"])(ctx, 'loadImage', {
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
    if (_typeof(action) === 'object' && action) {
      if (action.action === 'drawImage' || action.property && (action.property === 'fillStyle' || action.property === 'strokeStyle') && action.value != null && _typeof(action.value) === 'object' && action.value["class"] === 'pattern') {
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
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/framework/ */ "./src/framework/index.worker.js");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }


var SelectorQuery = /*#__PURE__*/function () {
  function SelectorQuery(page) {
    _classCallCheck(this, SelectorQuery);

    this.actions = [];
    this.page = page;
  }

  _createClass(SelectorQuery, [{
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
      var page = this.page || Object(_framework___WEBPACK_IMPORTED_MODULE_0__["getCurrentPageImpl"])();

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
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _mixins_AppMixin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../mixins/AppMixin */ "./src/framework/mixins/AppMixin.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_appImpl__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/appImpl */ "./src/framework/utils/appImpl.js");
/* harmony import */ var _utils_pageUtils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/pageUtils */ "./src/framework/utils/pageUtils.js");
/* harmony import */ var _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/invokeWithGuardAndReThrow */ "./src/utils/invokeWithGuardAndReThrow.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }








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
  Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(tabCaches).forEach(function (k) {
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

  app = publicInstance;
  appImpl = new AppImpl(publicInstance);
  Object(_utils_appImpl__WEBPACK_IMPORTED_MODULE_4__["setAppImpl"])(appImpl);
  _EventHub__WEBPACK_IMPORTED_MODULE_1__["default"].emit('appCreated', appImpl);
  return app;
}

function AppImpl(publicInstance) {
  this._tabCaches = {};
  this._currentTabPath = '';
  this.publicInstance = publicInstance; // app status is unstable

  this.shown = true;
}

AppImpl.prototype = _objectSpread(_objectSpread({}, _mixins_AppMixin__WEBPACK_IMPORTED_MODULE_2__["default"]), {}, {
  pushPage: pushPage,
  popPage: popPage,
  getAllPages: function getAllPages() {
    var pages = [];
    var tabCaches = this._tabCaches;
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(tabCaches).forEach(function (k) {
      var tabPages = tabCaches[k];

      if (tabPages) {
        pages = pages.concat(tabPages);
      }
    });
    return pages;
  },
  isTabShow: function isTabShow() {
    var tabCaches = appImpl._tabCaches; // filter destroyed/empty tabs

    var tabKeys = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(tabCaches).filter(function (k) {
      return !!tabCaches[k].length;
    });

    if (!tabKeys.length) {
      return false;
    } // if all invalid tab page


    return tabKeys.every(function (k) {
      return Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_5__["isTabPage"])(tabCaches[k][0]);
    });
  },
  clearAllPages: function clearAllPages() {
    var nowTabCaches = this._tabCaches;
    this._tabCaches = {}; // clear tab caches and page stack

    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(nowTabCaches).forEach(function (k) {
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
    _EventHub__WEBPACK_IMPORTED_MODULE_1__["default"].emit('launch', options);
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_0__["default"])('framework: App onLaunch');
    var publicInstance = this.publicInstance;
    var onLaunch = publicInstance.onLaunch;
    var onShow = publicInstance.onShow;
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_6__["default"])(onLaunch, publicInstance, options);
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_6__["default"])(onShow, publicInstance, options);
    this.shown = true;
  },
  hide: function hide() {
    var hidePage = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    this.shown = false;
    _EventHub__WEBPACK_IMPORTED_MODULE_1__["default"].emit('background');
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_0__["default"])('framework: App onHide');

    if (hidePage) {
      var page = getCurrentPageImpl();

      if (page) {
        page.hide();
      }
    }

    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_6__["default"])(this.publicInstance.onHide, this.publicInstance);
  },
  show: function show(o) {
    var showPage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    this.shown = true;
    var options = o || {};
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_0__["default"])('framework: App onShow');
    _EventHub__WEBPACK_IMPORTED_MODULE_1__["default"].emit('foreground', options);
    var prePage = getCurrentPageImpl();
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_6__["default"])(this.publicInstance.onShow, this.publicInstance, options); // if relaunch, do not invoke previous page show

    if (showPage && !options.path) {
      var page = getCurrentPageImpl();

      if (page && page === prePage) {
        page.show();
      }
    }
  },
  error: function error(e) {
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_6__["default"])(this.publicInstance.onError, this.publicInstance, e);
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

_EventHub__WEBPACK_IMPORTED_MODULE_1__["default"].addListener('pageUnload', function (_ref) {
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

/***/ "./src/framework/AppRegistry/index.js":
/*!********************************************!*\
  !*** ./src/framework/AppRegistry/index.js ***!
  \********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
// app注册page
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

/***/ "./src/framework/Component/index.worker.js":
/*!*************************************************!*\
  !*** ./src/framework/Component/index.worker.js ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Component; });
/* harmony import */ var _ComponentRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ComponentRegistry */ "./src/framework/ComponentRegistry/index.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../legacy/CustomComponent */ "./src/framework/legacy/CustomComponent.worker.js");



function Component(setupConfig) {
  // $global.currentComponentConfig 会在转译后的代码里设置
  if (!_common_global__WEBPACK_IMPORTED_MODULE_1__["default"].currentComponentConfig) {
    throw new Error('invalid Component usage!');
  }

  var currentComponentConfig = _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].currentComponentConfig;
  _common_global__WEBPACK_IMPORTED_MODULE_1__["default"].currentComponentConfig = null;
  var is = currentComponentConfig.is;
  _ComponentRegistry__WEBPACK_IMPORTED_MODULE_0__["default"].registerComponent(is, function () {
    return Object(_legacy_CustomComponent__WEBPACK_IMPORTED_MODULE_2__["default"])(setupConfig, currentComponentConfig);
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
/* harmony import */ var _AppRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../AppRegistry */ "./src/framework/AppRegistry/index.js");
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

  _AppRegistry__WEBPACK_IMPORTED_MODULE_0__["default"].registerComponent(pagePath, function () {
    return _legacy_PageComponent__WEBPACK_IMPORTED_MODULE_2__["default"];
  });
}

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
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _utils_startsWith__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/startsWith */ "./src/utils/startsWith.js");
/* harmony import */ var _utils_startupParams__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/startupParams */ "./src/utils/startupParams/index.worker.js");



var g = self;

function getSubPackageByPage(page) {
  var mpAppJson = g.mpAppJson;

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
/*! exports provided: EventHub, getStartupParams, setStartupParams, getCurrentPageImpl, getCurrentPagesImpl, Component, Page, App, getApp, getAppImpl, getCurrentPages, $global */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/env */ "./src/framework/utils/env.js");
/* harmony import */ var _utils_env__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_utils_env__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _worker_bootstrap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./worker/bootstrap */ "./src/framework/worker/bootstrap.js");
/* harmony import */ var _common_commonLogic__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./common/commonLogic */ "./src/framework/common/commonLogic.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_2__["Component"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_2__["Page"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "App", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_2__["App"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getApp", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_2__["getApp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPages", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_2__["getCurrentPages"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "$global", function() { return _common_commonLogic__WEBPACK_IMPORTED_MODULE_2__["$global"]; });

/* harmony import */ var _utils_securityPatch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/securityPatch */ "./src/utils/securityPatch.js");
/* harmony import */ var _utils_getApplicationId__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/getApplicationId */ "./src/utils/getApplicationId.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./EventHub */ "./src/framework/EventHub.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EventHub", function() { return _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./startupParams */ "./src/framework/startupParams/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStartupParams", function() { return _startupParams__WEBPACK_IMPORTED_MODULE_6__["getStartupParams"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setStartupParams", function() { return _startupParams__WEBPACK_IMPORTED_MODULE_6__["setStartupParams"]; });

/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./App */ "./src/framework/App/index.worker.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPageImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_7__["getCurrentPageImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getCurrentPagesImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_7__["getCurrentPagesImpl"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getAppImpl", function() { return _App__WEBPACK_IMPORTED_MODULE_7__["getAppImpl"]; });









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
    Object(_utils_securityPatch__WEBPACK_IMPORTED_MODULE_3__["default"])(); // success是worker代码

    success();
  }

  Object(_worker_bootstrap__WEBPACK_IMPORTED_MODULE_1__["pauseApp"])();
  Object(_utils_getApplicationId__WEBPACK_IMPORTED_MODULE_4__["default"])(function (applicationId) {
    start();
    Object(_worker_bootstrap__WEBPACK_IMPORTED_MODULE_1__["default"])();
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
/* harmony import */ var _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../ComponentRegistry/getComponentClass */ "./src/framework/ComponentRegistry/getComponentClass.js");
/* harmony import */ var _utils_mergeArray__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/mergeArray */ "./src/utils/mergeArray.js");
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/setData */ "./src/utils/setData.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/invokeWithGuardAndReThrow */ "./src/utils/invokeWithGuardAndReThrow.js");
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @/utils/consts */ "./src/utils/consts.js");
/* harmony import */ var _utils_getComponentProp__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/getComponentProp */ "./src/framework/utils/getComponentProp.js");
/* harmony import */ var _utils_fireComponentLifecycle__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/fireComponentLifecycle */ "./src/framework/utils/fireComponentLifecycle.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }









var eventReg = /^on[a-zA-Z]/;
function Component(setupConfig, currentComponentConfig) {
  var is = currentComponentConfig.is,
      usingComponents = currentComponentConfig.usingComponents;
  var propsCache = {};

  function getProps(prop) {
    var useCache = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return Object(_utils_getComponentProp__WEBPACK_IMPORTED_MODULE_6__["default"])(setupConfig, prop, useCache ? propsCache : useCache);
  }

  function ComponentClass(page, id, componentConfig) {
    this.is = is;
    this.id = id;
    this.page = page;
    this.triggerEventHandlers = {};
    var self = this;
    var publicInstance = this.publicInstance = Object.create(getProps('methods'), {
      setData: {
        value: function value(a, b) {
          return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_2__["default"], a, b);
        }
      },
      $spliceData: {
        value: function value(a, b) {
          return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_2__["spliceData"], a, b);
        }
      }
    });
    publicInstance.is = is;
    publicInstance.$id = id;
    publicInstance.$page = page.publicInstance;
    publicInstance.data = getProps('data', false);
    this.computedDeps = _objectSpread({}, ComponentClass.computedDeps);
    this.prevData = publicInstance.data;
    publicInstance.props = getProps('properties') || getProps('props');
    this.setComponentConfig(componentConfig, true);
  }

  ;
  ComponentClass.data = getProps('data');
  ComponentClass.props = getProps('properties') || getProps('props');

  ComponentClass.getAllComponents = function () {
    var allComponents = [is];
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(usingComponents).forEach(function (c) {
      /* 忽略当前自定义组件本身，防止死循环 */
      if (usingComponents[c] !== is) {
        var subUsingComponents = Object(_ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_0__["default"])(usingComponents[c]).getAllComponents();
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
      publicInstance.data = op(publicInstance.data, diffData);
      var data = (_data = {}, _defineProperty(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_5__["PendingKeyType"], _utils_consts__WEBPACK_IMPORTED_MODULE_5__["PendingValueComponent"]), _defineProperty(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_5__["PendingKeyId"], id), _defineProperty(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_5__["PendingKeyOp"], Object(_utils_setData__WEBPACK_IMPORTED_MODULE_2__["getOpStr"])(op)), _defineProperty(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_5__["PendingKeyData"], diffData), _data);
      var options = options_ || {};

      if (typeof options_ === 'function') {
        options = {
          complete: options_
        };
      }

      this.page.setRemoteData(data, options);
    },
    setComponentConfig: function setComponentConfig(c, init) {
      var ownerId = c[_utils_consts__WEBPACK_IMPORTED_MODULE_5__["ComponentKeyOwnerId"]];
      var diffProps = c[_utils_consts__WEBPACK_IMPORTED_MODULE_5__["ComponentKeyDiffProps"]];

      if (ownerId) {
        this.ownerId = ownerId;
      }

      var publicInstance = this.publicInstance;
      var prevProps = publicInstance.props;

      if (diffProps) {
        var deleted = diffProps[_utils_consts__WEBPACK_IMPORTED_MODULE_5__["DiffKeyDeleted"]];
        var updated = diffProps[_utils_consts__WEBPACK_IMPORTED_MODULE_5__["DiffKeyUpdated"]];

        if (deleted && deleted.length || updated && Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(updated).length) {
          publicInstance.props = _objectSpread({}, publicInstance.props);
        }

        if (deleted) {
          deleted.forEach(function (d) {
            delete publicInstance.props[d];
          });
        }

        if (updated) {
          Object.assign(publicInstance.props, this.normalizeProps(updated));
        }
      }

      if (!init && (prevProps !== publicInstance.props || this.prevData !== publicInstance.data)) {
        this.update(prevProps, this.prevData);
        this.prevData = publicInstance.data;
      }
    },
    normalizeProps: function normalizeProps(oldProps) {
      var _this = this;

      var newProps = _objectSpread({}, oldProps);

      Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_3__["default"])(oldProps).forEach(function (p) {
        if (p.match(eventReg)) {
          newProps[p] = _this.getTriggerEventHandler(p, oldProps[p]);
        }
      });
      return newProps;
    },
    getTriggerEventHandler: function getTriggerEventHandler(type, method) {
      var _this2 = this;

      if (!method) {
        return method;
      }

      var triggerEventHandlers = this.triggerEventHandlers;
      var handleFn = triggerEventHandlers[type];

      if (!handleFn) {
        handleFn = triggerEventHandlers[type] = function () {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this2.triggerEvent.apply(_this2, [handleFn.method].concat(args));
        };
      } // method may change for onXX type


      handleFn.method = method;
      return handleFn;
    },
    triggerEvent: function triggerEvent(method) {
      /* todo 发送triggerComponentEvent type, detail, options */
      // tricky, page is also a component
      var ownerComponent = this.page.getComponentInstance(this.ownerId);

      if (ownerComponent) {
        var publicInstance = ownerComponent.publicInstance;

        if (!publicInstance[method]) {
          console.warn("".concat(ownerComponent.is, ": can not find event handle method: ").concat(method));
        }

        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        return _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_4__["default"].apply(void 0, [publicInstance[method], publicInstance].concat(args));
      }
    },
    ready: function ready() {
      Object(_utils_fireComponentLifecycle__WEBPACK_IMPORTED_MODULE_7__["default"])(setupConfig, this.publicInstance, 'didMount');
    },
    update: function update() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      Object(_utils_fireComponentLifecycle__WEBPACK_IMPORTED_MODULE_7__["default"])(setupConfig, this.publicInstance, 'didUpdate', args);
    },
    unload: function unload() {
      this.unloaded = true;
      Object(_utils_fireComponentLifecycle__WEBPACK_IMPORTED_MODULE_7__["default"])(setupConfig, this.publicInstance, 'didUnmount');
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
/* harmony import */ var _utils_setData__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/setData */ "./src/utils/setData.js");
/* harmony import */ var _utils_objectKeys__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/utils/objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../ComponentRegistry/getComponentClass */ "./src/framework/ComponentRegistry/getComponentClass.js");
/* harmony import */ var _ComponentRegistry__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../ComponentRegistry */ "./src/framework/ComponentRegistry/index.js");
/* harmony import */ var _utils_mergeArray__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/utils/mergeArray */ "./src/utils/mergeArray.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @/utils/invokeWithGuardAndReThrow */ "./src/utils/invokeWithGuardAndReThrow.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.worker.js");
/* harmony import */ var _utils_consts__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @/utils/consts */ "./src/utils/consts.js");
/* harmony import */ var _common_global__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../common/global */ "./src/framework/common/global.js");
/* harmony import */ var _mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../mixins/MessageHandleMixin */ "./src/framework/mixins/MessageHandleMixin.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }













var publicInstanceMethods = ['onShareAppMessage', 'onReachBottom', 'onPageScroll'];

function noop() {}

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
    bridge: _common_global__WEBPACK_IMPORTED_MODULE_10__["default"].bridge,
    pendingData: [],
    pendingCallbacks: [],
    initialCallbacks: [],
    self: this,
    query: query,
    pageType: 'WORKER'
  });
  var self = this;
  /* 设置publicInstance */

  var publicInstance = this.publicInstance = Object.create(_objectSpread({
    route: pagePath
  }, _common_global__WEBPACK_IMPORTED_MODULE_10__["default"].pagesConfig[pagePath].user), {
    setData: {
      value: function value(a, b) {
        return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_0__["default"], a, b);
      }
    },
    $spliceData: {
      value: function value(a, b) {
        return self.setData(_utils_setData__WEBPACK_IMPORTED_MODULE_0__["spliceData"], a, b);
      }
    },
    $getComponentBy: {
      value: this.getComponentBy.bind(this)
    }
  });

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
  var usingComponents = _common_global__WEBPACK_IMPORTED_MODULE_10__["default"].pagesConfig[pagePath].system.usingComponents;

  if (usingComponents) {
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(usingComponents).forEach(function (c) {
      var cs = Object(_ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__["default"])(usingComponents[c]).getAllComponents();
      Object(_utils_mergeArray__WEBPACK_IMPORTED_MODULE_4__["default"])(allUsingComponents, cs);
    });
    allUsingComponentsCache[pagePath] = allUsingComponents;
  }

  return allUsingComponents;
}

PageComponent.prototype = _objectSpread(_objectSpread({}, _mixins_MessageHandleMixin__WEBPACK_IMPORTED_MODULE_11__["default"]), {}, {
  load: function load() {
    // in case pageResume following appResume, tab page??
    if (!this.$loadTime) {
      this.$loadTime = Date.now(); // setData will be merged with startRender

      this._disableRemoteData = true;
      Object(_utils_log__WEBPACK_IMPORTED_MODULE_6__["default"])('framework: page onLoad', this.pagePath);
      _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('pageLoad', {
        page: this
      });
      Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_7__["default"])(this.publicInstance.onLoad, this.publicInstance, this.query); // depend app status!! maybe unstable

      if (Object(_App__WEBPACK_IMPORTED_MODULE_8__["getAppImpl"])().shown) {
        this.show();
      }

      if (this._fromTabItemTap) {
        this.onTabItemTap(this.tabProps);
      }

      this._disableRemoteData = false;
    }

    this.startRender();
  },
  refresh: function refresh() {
    this.unmountAllComponents();
    this.startRender(true);
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
    _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('enterPage', {
      page: this
    });
    this.executeUserMethod('onShow');
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_6__["default"])('framework: page onShow', this.pagePath);
  },
  pullDownRefresh: function pullDownRefresh(e) {
    _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('pullDownRefresh', {
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
    _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('leavePage', {
      page: this
    });
    _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('pageHide', {
      page: this
    });
    this.executeUserMethod('onHide');
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_6__["default"])('framework: page onHide', this.pagePath);
  },
  unload: function unload() {
    Object(_utils_log__WEBPACK_IMPORTED_MODULE_6__["default"])('framework: page onUnload', this.pagePath);

    if (this.unloaded || !this.$loadTime) {
      // remove from page stack
      _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('pageUnload', {
        page: this
      });
      return;
    }

    this.unloaded = true;
    this.unmountAllComponents();
    Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_7__["default"])(this.publicInstance.onUnload, this.publicInstance);
    _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('leavePage', {
      page: this
    });
    _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('pageUnload', {
      page: this
    });
  },
  unmountAllComponents: function unmountAllComponents() {
    var oldComponentInstances = this.componentInstances;
    this.componentInstances = {};
    Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(oldComponentInstances).forEach(function (k) {
      oldComponentInstances[k].unload();
    });
  },
  isLoaded: function isLoaded() {
    return !!this.$loadTime && !this.unloaded;
  },
  startRender: function startRender(isRefresh) {
    var publicInstance = this.publicInstance,
        id = this.id;
    var config = {};
    publicInstanceMethods.forEach(function (k) {
      var hookFn = publicInstance[k];

      if (typeof hookFn === 'function' && hookFn !== noop) {
        config[k] = true;
      }
    });
    var componentsConfig = {};
    getAllUsingComponents(this.pagePath).forEach(function (component) {
      var ComponentClass = Object(_ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__["default"])(component);
      componentsConfig[component] = {
        props: ComponentClass.props,
        data: _objectSpread({}, ComponentClass.data)
      };
    }); // 此时发消息给bridge触发render的渲染，并且带了firstData过去

    this.callRemote('self', 'startRender', {
      id: id,
      isRefresh: isRefresh,
      publicInstance: config,
      componentsConfig: componentsConfig,
      data: _objectSpread({}, publicInstance.data)
    });
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
      var keys = Object(_utils_objectKeys__WEBPACK_IMPORTED_MODULE_1__["default"])(componentInstances);

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
  triggerComponentEvent: function triggerComponentEvent(componentId, eventName, eventObject) {
    var componentInstance = this.getComponentInstance(componentId);

    if (componentInstance) {
      this.batchedUpdates(function () {
        Object(_utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_7__["default"])(componentInstance.publicInstance[eventName], componentInstance.publicInstance, eventObject);
      });
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
    var _this = this;

    if (!payload) {
      return;
    }

    var componentInstances = this.componentInstances;
    var mountedComponents = payload[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["PayloadKeyMountedComponents"]] || [];
    var unmountedComponents = payload[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["PayloadKeyUnmountedComponents"]] || []; // from bottom to top

    mountedComponents.forEach(function (componentConfig) {
      var id = componentConfig[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyId"]];

      if (componentInstances[id]) {
        componentInstances[id].setComponentConfig(componentConfig);
      } else if (componentConfig[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyIs"]]) {
        // incase update after unmount
        var ComponentClass = Object(_ComponentRegistry_getComponentClass__WEBPACK_IMPORTED_MODULE_2__["default"])(componentConfig[_utils_consts__WEBPACK_IMPORTED_MODULE_9__["ComponentKeyIs"]]);
        componentInstances[id] = new ComponentClass(_this, id, componentConfig);
        componentInstances[id].ready();
      }
    });
    var unmountedKeys = unmountedComponents.concat().reverse();
    this.unmountComponents(unmountedKeys);
  },
  ready: function ready(payload) {
    var _this2 = this;

    if (this.unloaded) {
      return;
    }

    if (this.readied) {
      return;
    }

    this.batchedUpdates(function () {
      _this2.readied = true;

      _this2.update(payload);

      _EventHub__WEBPACK_IMPORTED_MODULE_5__["default"].emit('pageReady', {
        page: _this2
      });

      _this2.initialCallbacks.forEach(function (fn) {
        return fn();
      });

      _this2.executeUserMethod('onReady');

      Object(_utils_log__WEBPACK_IMPORTED_MODULE_6__["default"])('framework: page onReady', _this2.pagePath);
    });
  },
  update: function update(payload) {
    var _this3 = this;

    this.batchedUpdates(function () {
      _this3.updateComponents(payload);
    });
  },
  postMessage: function postMessage(data) {
    if (this.unloaded) {
      return;
    }

    Object(_utils_log__WEBPACK_IMPORTED_MODULE_6__["debug"])('framework', "[WORKER] Page ".concat(this.pagePath, " postMessage"), data);
    this.bridge.call('postMessage', _objectSpread(_objectSpread({}, data), {}, {
      pageType: this.pageType,
      msgType: 'endpoint',
      $viewId: this.getViewId()
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

      var data = (_data = {}, _defineProperty(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyType"], _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingValuePage"]), _defineProperty(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyData"], diffData), _defineProperty(_data, _utils_consts__WEBPACK_IMPORTED_MODULE_9__["PendingKeyOp"], Object(_utils_setData__WEBPACK_IMPORTED_MODULE_0__["getOpStr"])(op)), _data);
      this.setRemoteData(data, options);
    }
  },
  executeUserMethod: function executeUserMethod(method) {
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    var _this = this;

    this.batchedUpdates(function () {
      _utils_invokeWithGuardAndReThrow__WEBPACK_IMPORTED_MODULE_7__["default"].apply(void 0, [_this.publicInstance[method], _this.publicInstance].concat(_toConsumableArray(args)));
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
  onRenderEvent: function onRenderEvent(name) {
    var publicInstance = this.publicInstance;

    if (!publicInstance[name]) {
      console.warn("".concat(this.getPagePath(), ": can not find event handle method: ").concat(name));
      return;
    }

    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    this.executeUserMethod(name, args);
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
        componentInstances = this.componentInstances,
        pendingCallbacks = this.pendingCallbacks;
    this.pendingData = [];
    this.pendingCallbacks = []; // prevent invalid json pass through

    this.callRemote('self', 'receiveData', pendingData, function () {
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
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(query_string__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _AppRegistry__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../AppRegistry */ "./src/framework/AppRegistry/index.js");
/* harmony import */ var _EventHub__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../EventHub */ "./src/framework/EventHub.js");
/* harmony import */ var _utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/pageInfoAndUrl */ "./src/framework/utils/pageInfoAndUrl.js");
/* harmony import */ var _utils_pageUtils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/pageUtils */ "./src/framework/utils/pageUtils.js");
/* harmony import */ var _utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/resolvePageUrl */ "./src/framework/utils/resolvePageUrl.js");
/* harmony import */ var _utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/checkInvalidPage */ "./src/framework/utils/checkInvalidPage.js");
/* harmony import */ var _SubPackage__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../SubPackage */ "./src/framework/SubPackage/index.js");
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }










function newPage(_ref) {
  var pagePath = _ref.pagePath,
      pageId = _ref.pageId,
      queryString = _ref.queryString;
  // 对于通过navigate跳转的页面，直接返回已经存在的实例
  var page = this.getPageById(pageId);

  if (page) {
    return page;
  }

  var Page = _AppRegistry__WEBPACK_IMPORTED_MODULE_1__["default"].getComponent(pagePath);

  if (!Page) {
    throw new Error("[WORKER] page '".concat(pagePath, "' not found!"));
  }

  var query = {};

  if (queryString) {
    query = query_string__WEBPACK_IMPORTED_MODULE_0___default.a.parse(queryString);
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


  var pageId = Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_4__["getPageId"])();
  var page = newPage.call(this, {
    pagePath: pagePath,
    pageId: pageId,
    queryString: queryString
  }); // in case invalid queryString

  var safeQueryString = query_string__WEBPACK_IMPORTED_MODULE_0___default.a.stringify(page.query); // 这里的doPush由bridge提供，集体实现根据不同的平台，不同的实现

  doPush({
    url: Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_3__["getUrlFromPageInfo"])({
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
      pageId: Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_4__["getPageId"])(pagePath, 1),
      queryString: queryString
    });
    page.fromPage = currentPage;
  } // from non-tab pages


  if (!this.isTabShow()) {
    this.clearAllPages();
    _EventHub__WEBPACK_IMPORTED_MODULE_2__["default"].emit('switchTab', {
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

  _EventHub__WEBPACK_IMPORTED_MODULE_2__["default"].emit('switchTab', {
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
    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_5__["default"])(url, currentPage);
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_7__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_6__["default"])(pageUrl)) {
        return;
      }

      _this.clearAllPages();

      var nextPage;

      var _getPageObject3 = _this.getPageObject(pageUrl);

      var pagePath = _getPageObject3.pagePath;

      if (Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_4__["getPageId"])(pagePath, 1)) {
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
    var url = _ref5.url,
        viewId = _ref5.viewId;
    var pushWindow = _ref6.pushWindow;

    var _this = this;

    var currentPage = this.getCurrentPageImpl();
    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_5__["default"])(url, currentPage);
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_7__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_6__["default"])(pageUrl)) {
        return;
      }

      currentPage.hide();
      var nextPage = doPushWindow.call(_this, pushWindow, {
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
    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_5__["default"])(url, currentPage);
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_7__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_6__["default"])(pageUrl)) {
        return;
      }

      if (Object(_utils_pageUtils__WEBPACK_IMPORTED_MODULE_4__["isTabPage"])(currentPage)) {
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
        tabProps = _objectWithoutProperties(_ref9, ["url"]);

    var _ref10 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        doSwitch = _ref10.doSwitch,
        currentPage = _ref10.currentPage;

    var _this = this;

    var pageUrl = Object(_utils_resolvePageUrl__WEBPACK_IMPORTED_MODULE_5__["default"])(url, this.getCurrentPageImpl());
    Object(_SubPackage__WEBPACK_IMPORTED_MODULE_7__["loadPage"])(pageUrl, function () {
      if (Object(_utils_checkInvalidPage__WEBPACK_IMPORTED_MODULE_6__["default"])(pageUrl)) {
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
    var _getPageInfoFromUrl = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_3__["getPageInfoFromUrl"])(pageUrl),
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
    var _getPageInfoFromUrl2 = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_3__["getPageInfoFromUrl"])(url),
        id = _getPageInfoFromUrl2.id;

    var page = this.getPageById(id);

    if (page) {
      page.hide();
    }
  },
  resumePageByUrl: function resumePageByUrl(url) {
    var _getPageInfoFromUrl3 = Object(_utils_pageInfoAndUrl__WEBPACK_IMPORTED_MODULE_3__["getPageInfoFromUrl"])(url),
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
/* harmony import */ var _AppRegistry__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../AppRegistry */ "./src/framework/AppRegistry/index.js");

function checkInvalidPage(pageUrl) {
  var page = pageUrl;

  if (page.charAt(0) === '/') {
    page = pageUrl.slice(1);
  }

  var index = page.indexOf('?');

  if (index !== -1) {
    page = page.slice(0, index);
  }

  if (!_AppRegistry__WEBPACK_IMPORTED_MODULE_0__["default"].getRunnable(page)) {
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

  var _this = this;

  if (caches && caches[prop]) {
    return caches[prop];
  }

  var _componentConfig$mixi = componentConfig.mixins;
  var mixins = _componentConfig$mixi === undefined ? [] : _componentConfig$mixi;
  var ret = {};
  mixins.forEach(function (m) {
    var v = m[prop];

    if (typeof v === 'function') {
      v = v.apply(_this, args);
    }

    safeAssign(ret, v, prop);
  });
  {
    var v = componentConfig[prop];

    if (typeof v === 'function') {
      v = v.apply(this, args);
    }

    safeAssign(ret, v, prop);
  }

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
/* harmony import */ var _polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./polyfill */ "./src/framework/worker/polyfill.js");
/* harmony import */ var _polyfill__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_polyfill__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(query_string__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utils_log__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/log */ "./src/utils/log.js");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../App */ "./src/framework/App/index.worker.js");
/* harmony import */ var _startupParams__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../startupParams */ "./src/framework/startupParams/index.js");
/* harmony import */ var _SubPackage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../SubPackage */ "./src/framework/SubPackage/index.js");
/* harmony import */ var _utils_getScene__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @/utils/getScene */ "./src/utils/getScene.js");







var appLaunched;
var g = self;
var started = true;
var queue = [];

function processLoadPage(event) {
  var pagePath = event.data.pagePath;
  Object(_SubPackage__WEBPACK_IMPORTED_MODULE_5__["loadPage"])(pagePath, function () {
    var appImpl = Object(_App__WEBPACK_IMPORTED_MODULE_3__["getAppImpl"])();
    var _event$data = event.data,
        queryString = _event$data.queryString,
        pageId = _event$data.id,
        viewId = _event$data.viewId;
    var page = appImpl.newPage({
      pagePath: pagePath,
      queryString: queryString,
      pageId: pageId
    });
    page.setViewId(viewId); // refresh page

    if (page.$loadTime) {
      page.refresh();
      return;
    }

    if (!appLaunched) {
      var launchOptions = {
        path: pagePath
      };

      var _getStartupParams = Object(_startupParams__WEBPACK_IMPORTED_MODULE_4__["getStartupParams"])(),
          query = _getStartupParams.query,
          referrerInfo = _getStartupParams.referrerInfo;

      if (query) {
        launchOptions.query = query_string__WEBPACK_IMPORTED_MODULE_1___default.a.parse(query);
      }

      launchOptions.scene = Object(_utils_getScene__WEBPACK_IMPORTED_MODULE_6__["default"])(Object(_startupParams__WEBPACK_IMPORTED_MODULE_4__["getStartupParams"])());

      if (referrerInfo) {
        launchOptions.referrerInfo = JSON.parse(referrerInfo);
      }

      appLaunched = true;
      appImpl.launch(launchOptions);
    }

    var pages = Object(_App__WEBPACK_IMPORTED_MODULE_3__["getCurrentPagesImpl"])(); // tab a -> tab b quickly change to -> tab a
    // or redirect/reLaunch/navigateTo on App.onLaunch

    if (pages && pages[pages.length - 1] === page) {
      page.load();
    }
  });
}

function processEndpoint(event) {
  var pageId = event.data.id;
  var appImpl = Object(_App__WEBPACK_IMPORTED_MODULE_3__["getAppImpl"])();
  var page = appImpl.getPageById(pageId);
  page.onMessage(event);
}

function processMessage(event) {
  var msgType = event.data.msgType;

  if (msgType === 'DOMContentLoaded') {
    processLoadPage(event);
  }

  if (msgType === 'endpoint') {
    processEndpoint(event);
  }
}

g.send = function (event) {
  Object(_utils_log__WEBPACK_IMPORTED_MODULE_2__["debug"])('framework', '[WORKER] App Received Message:', event.data);

  if (started) {
    processMessage(event);
  } else {
    queue.push(event);
  }
};

g.addEventListener('message', g.send);
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
/* harmony import */ var _apis___WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/apis/ */ "./src/apis/index.worker.js");
/* harmony import */ var _framework___WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./framework/ */ "./src/framework/index.worker.js");



var __mpStartTime = Date.now();

self.MP = {
  bridge: _apis___WEBPACK_IMPORTED_MODULE_0__["default"],
  EventHub: _framework___WEBPACK_IMPORTED_MODULE_1__["EventHub"],
  getStartupParams: _framework___WEBPACK_IMPORTED_MODULE_1__["getStartupParams"],
  setStartupParams: _framework___WEBPACK_IMPORTED_MODULE_1__["setStartupParams"],
  getApp: _framework___WEBPACK_IMPORTED_MODULE_1__["getApp"],
  App: _framework___WEBPACK_IMPORTED_MODULE_1__["App"],
  getCurrentPagesImpl: _framework___WEBPACK_IMPORTED_MODULE_1__["getCurrentPagesImpl"],
  getCurrentPageImpl: _framework___WEBPACK_IMPORTED_MODULE_1__["getCurrentPageImpl"],
  getCurrentPages: _framework___WEBPACK_IMPORTED_MODULE_1__["getCurrentPages"],
  getAppImpl: _framework___WEBPACK_IMPORTED_MODULE_1__["getAppImpl"],
  Component: _framework___WEBPACK_IMPORTED_MODULE_1__["Component"],
  Page: _framework___WEBPACK_IMPORTED_MODULE_1__["Page"],
  $global: _framework___WEBPACK_IMPORTED_MODULE_1__["$global"]
};

var __mpCosts = Date.now() - __mpStartTime;

console.log("framework: worker bundle costs ".concat(__mpCosts, " ms"));

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
/* harmony import */ var _gerror__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./gerror */ "./src/utils/gerror.js");
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
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }


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

  if (_typeof(content) === 'object') {
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
  Object(_objectKeys__WEBPACK_IMPORTED_MODULE_0__["default"])(map).forEach(function (sKey) {
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
var ComponentKeyName = 'n';

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
/* harmony import */ var _endsWith__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./endsWith */ "./src/utils/endsWith.js");
/* harmony import */ var _apis_ap__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/apis/ap */ "./src/apis/ap.worker.js");


/* harmony default export */ __webpack_exports__["default"] = (function (extraAppId) {
  var Loaded = false;
  var res = _apis_ap__WEBPACK_IMPORTED_MODULE_1__["default"].callInternalAPISync('addPkgRes', {
    resAppId: extraAppId
  });
  res && res.urls && res.urls.forEach(function (item) {
    if (!Loaded && Object(_endsWith__WEBPACK_IMPORTED_MODULE_0__["default"])(item, 'index.worker.js')) {
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
function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function objectKeys(obj) {
  if (obj && _typeof(obj) === 'object') {
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
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");
/* harmony import */ var _stringToPath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./stringToPath */ "./src/utils/stringToPath.js");
/* harmony import */ var _shallowEqual__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shallowEqual */ "./src/utils/shallowEqual.js");
/* harmony import */ var _consts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./consts */ "./src/utils/consts.js");
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

/***/ "./src/utils/shallowEqual.js":
/*!***********************************!*\
  !*** ./src/utils/shallowEqual.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return shallowEqual; });
/* harmony import */ var _objectKeys__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./objectKeys */ "./src/utils/objectKeys.js");
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
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! query-string */ "./node_modules/query-string/index.js");
/* harmony import */ var query_string__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(query_string__WEBPACK_IMPORTED_MODULE_0__);
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
  } // if (Platform.browser === 'android' && !Platform.ide) {
  //   console.error('framework: can not call getStartupParams() at the top of code!');
  // }


  var _location = location,
      href = _location.href;
  var queryIndex = href.indexOf('?');
  startupParams = {};

  if (queryIndex !== -1) {
    var queryString = href.slice(queryIndex + 1);
    startupParams = Object(query_string__WEBPACK_IMPORTED_MODULE_0__["parse"])(queryString);
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

/***/ })

/******/ });
//# sourceMappingURL=mp.worker.js.map