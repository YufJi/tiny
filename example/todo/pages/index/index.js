(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push([["pages/index/index"],{

/***/ "./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./src/pages/index/index.js":
/*!***************************************************************************************************!*\
  !*** ./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!./src/pages/index/index.js ***!
  \***************************************************************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _containers_Header_Header__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../containers/Header/Header */ "./src/containers/Header/Header.js");
/* harmony import */ var _containers_MainSection_MainSection__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../../containers/MainSection/MainSection */ "./src/containers/MainSection/MainSection.js");
/* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./index.scss */ "./src/pages/index/index.scss");
/* harmony import */ var _index_scss__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_index_scss__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);












var Index = /*#__PURE__*/function (_Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(Index, _Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(Index);

  function Index() {
    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, Index);

    return _super.apply(this, arguments);
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Index, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      console.log(this.props, nextProps);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
  }, {
    key: "componentDidShow",
    value: function componentDidShow() {}
  }, {
    key: "componentDidHide",
    value: function componentDidHide() {}
  }, {
    key: "render",
    value: function render() {
      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__["jsxs"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_5__[/* View */ "f"], {
        className: "todaoapp",
        children: [/*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__["jsx"])(_containers_Header_Header__WEBPACK_IMPORTED_MODULE_6__[/* default */ "a"], {}), /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__["jsx"])(_containers_MainSection_MainSection__WEBPACK_IMPORTED_MODULE_7__[/* default */ "a"], {})]
      });
    }
  }]);

  return Index;
}(react__WEBPACK_IMPORTED_MODULE_4__["Component"]);

/* harmony default export */ __webpack_exports__["a"] = (Index);

/***/ }),

/***/ "./node_modules/classnames/index.js":
/*!******************************************!*\
  !*** ./node_modules/classnames/index.js ***!
  \******************************************/
/*! no static exports found */
/*! exports used: default */
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

/***/ "./node_modules/reselect/es/index.js":
/*!*******************************************!*\
  !*** ./node_modules/reselect/es/index.js ***!
  \*******************************************/
/*! exports provided: defaultMemoize, createSelectorCreator, createSelector, createStructuredSelector */
/*! exports used: createSelector */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export defaultMemoize */
/* unused harmony export createSelectorCreator */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return createSelector; });
/* unused harmony export createStructuredSelector */
function defaultEqualityCheck(a, b) {
  return a === b;
}

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  var length = prev.length;
  for (var i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

function defaultMemoize(func) {
  var equalityCheck = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultEqualityCheck;

  var lastArgs = null;
  var lastResult = null;
  // we reference arguments instead of spreading them for performance reasons
  return function () {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, arguments);
    }

    lastArgs = arguments;
    return lastResult;
  };
}

function getDependencies(funcs) {
  var dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs;

  if (!dependencies.every(function (dep) {
    return typeof dep === 'function';
  })) {
    var dependencyTypes = dependencies.map(function (dep) {
      return typeof dep;
    }).join(', ');
    throw new Error('Selector creators expect all input-selectors to be functions, ' + ('instead received the following types: [' + dependencyTypes + ']'));
  }

  return dependencies;
}

function createSelectorCreator(memoize) {
  for (var _len = arguments.length, memoizeOptions = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    memoizeOptions[_key - 1] = arguments[_key];
  }

  return function () {
    for (var _len2 = arguments.length, funcs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      funcs[_key2] = arguments[_key2];
    }

    var recomputations = 0;
    var resultFunc = funcs.pop();
    var dependencies = getDependencies(funcs);

    var memoizedResultFunc = memoize.apply(undefined, [function () {
      recomputations++;
      // apply arguments instead of spreading for performance.
      return resultFunc.apply(null, arguments);
    }].concat(memoizeOptions));

    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    var selector = memoize(function () {
      var params = [];
      var length = dependencies.length;

      for (var i = 0; i < length; i++) {
        // apply arguments instead of spreading and mutate a local list of params for performance.
        params.push(dependencies[i].apply(null, arguments));
      }

      // apply arguments instead of spreading for performance.
      return memoizedResultFunc.apply(null, params);
    });

    selector.resultFunc = resultFunc;
    selector.dependencies = dependencies;
    selector.recomputations = function () {
      return recomputations;
    };
    selector.resetRecomputations = function () {
      return recomputations = 0;
    };
    return selector;
  };
}

var createSelector = createSelectorCreator(defaultMemoize);

function createStructuredSelector(selectors) {
  var selectorCreator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : createSelector;

  if (typeof selectors !== 'object') {
    throw new Error('createStructuredSelector expects first argument to be an object ' + ('where each property is a selector, instead received a ' + typeof selectors));
  }
  var objectKeys = Object.keys(selectors);
  return selectorCreator(objectKeys.map(function (key) {
    return selectors[key];
  }), function () {
    for (var _len3 = arguments.length, values = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      values[_key3] = arguments[_key3];
    }

    return values.reduce(function (composition, value, index) {
      composition[objectKeys[index]] = value;
      return composition;
    }, {});
  });
}

/***/ }),

/***/ "./src/actions/index.js":
/*!******************************!*\
  !*** ./src/actions/index.js ***!
  \******************************/
/*! exports provided: addTodo, deleteTodo, editTodo, completeTodo, completeAllTodos, clearCompleted, setVisibilityFilter */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addTodo", function() { return addTodo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteTodo", function() { return deleteTodo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "editTodo", function() { return editTodo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "completeTodo", function() { return completeTodo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "completeAllTodos", function() { return completeAllTodos; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearCompleted", function() { return clearCompleted; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setVisibilityFilter", function() { return setVisibilityFilter; });
/* harmony import */ var _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants/ActionTypes */ "./src/constants/ActionTypes.js");

var addTodo = function addTodo(text) {
  return {
    type: _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__[/* ADD_TODO */ "a"],
    text: text
  };
};
var deleteTodo = function deleteTodo(id) {
  return {
    type: _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__[/* DELETE_TODO */ "e"],
    id: id
  };
};
var editTodo = function editTodo(id, text) {
  return {
    type: _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__[/* EDIT_TODO */ "f"],
    id: id,
    text: text
  };
};
var completeTodo = function completeTodo(id) {
  return {
    type: _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__[/* COMPLETE_TODO */ "d"],
    id: id
  };
};
var completeAllTodos = function completeAllTodos() {
  return {
    type: _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__[/* COMPLETE_ALL_TODOS */ "c"]
  };
};
var clearCompleted = function clearCompleted() {
  return {
    type: _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__[/* CLEAR_COMPLETED */ "b"]
  };
};
var setVisibilityFilter = function setVisibilityFilter(filter) {
  return {
    type: _constants_ActionTypes__WEBPACK_IMPORTED_MODULE_0__[/* SET_VISIBILITY_FILTER */ "g"],
    filter: filter
  };
};

/***/ }),

/***/ "./src/components/Footer/Footer.js":
/*!*****************************************!*\
  !*** ./src/components/Footer/Footer.js ***!
  \*****************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Footer; });
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _Footer_scss__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./Footer.scss */ "./src/components/Footer/Footer.scss");
/* harmony import */ var _Footer_scss__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_Footer_scss__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);












var Footer = /*#__PURE__*/function (_React$Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(Footer, _React$Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__[/* default */ "a"])(Footer);

  function Footer() {
    var _this;

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, Footer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "onClearCompleted", function () {
      console.log('onClearCompleted');

      _this.props.onClearCompleted();
    });

    return _this;
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Footer, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          activeCount = _this$props.activeCount,
          completedCount = _this$props.completedCount;
      var itemWord = activeCount === 1 ? 'item' : 'items';
      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
        className: "footer",
        children: /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__["jsxs"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
          className: "footer-content",
          children: [/*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__["jsxs"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* Text */ "e"], {
            className: "todo-count",
            children: [activeCount || 'No', ' ', itemWord, " left"]
          }), !!completedCount && /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* Text */ "e"], {
            className: "clear-completed-text",
            onClick: this.onClearCompleted,
            children: "Clear completed"
          })]
        })
      });
    }
  }]);

  return Footer;
}(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component);



/***/ }),

/***/ "./src/components/Footer/Footer.scss":
/*!*******************************************!*\
  !*** ./src/components/Footer/Footer.scss ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/components/TodoItem/TodoItem.js":
/*!*********************************************!*\
  !*** ./src/components/TodoItem/TodoItem.js ***!
  \*********************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TodoItem; });
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _TodoTextInput_TodoTextInput__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../TodoTextInput/TodoTextInput */ "./src/components/TodoTextInput/TodoTextInput.js");
/* harmony import */ var _TodoItem_scss__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./TodoItem.scss */ "./src/components/TodoItem/TodoItem.scss");
/* harmony import */ var _TodoItem_scss__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_TodoItem_scss__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);














var TodoItem = /*#__PURE__*/function (_React$Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(TodoItem, _React$Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__[/* default */ "a"])(TodoItem);

  function TodoItem() {
    var _this;

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, TodoItem);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "state", {
      editing: false
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleSubmit", function () {
      var val = _this.state.editText.trim();

      if (val) {
        _this.props.onSave(val);

        _this.setState({
          editText: val
        });
      } else {
        _this.props.onDestroy();
      }
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleDoubleClick", function () {
      _this.setState({
        editing: true
      });
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleSave", function (id, text) {
      if (text.length === 0) {
        _this.props.onDeleteTodo(id);
      } else {
        _this.props.onEditTodo(id, text);
      }

      _this.setState({
        editing: false
      });
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleCompleteTodo", function (todo) {
      console.log('handleCompleteTodo');

      _this.props.onCompleteTodo(todo.id);
    });

    return _this;
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(TodoItem, [{
    key: "render",
    value: function render() {
      var todo = this.props.todo;
      var element;

      if (this.state.editing) {
        element = /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsx"])(_TodoTextInput_TodoTextInput__WEBPACK_IMPORTED_MODULE_9__[/* default */ "a"], {
          text: todo.text,
          editing: this.state.editing,
          onSave: this.handleSave.bind(this, todo.id)
        });
      } else {
        element = /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
          className: "view",
          children: /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* CheckboxGroup */ "b"], {
            onChange: this.handleCompleteTodo.bind(this, todo),
            children: /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsxs"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* Label */ "d"], {
              className: "checkbox-label",
              children: [/*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* Checkbox */ "a"], {
                className: "checkbox",
                checked: todo.completed
              }), /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* Text */ "e"], {
                style: {
                  color: 'red'
                },
                children: todo.text
              })]
            })
          })
        });
      }

      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
        className: classnames__WEBPACK_IMPORTED_MODULE_8___default()({
          'list-item': true,
          completed: todo.completed,
          editing: this.state.editing
        }),
        children: element
      });
    }
  }]);

  return TodoItem;
}(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component);

Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(TodoItem, "defaultProps", {
  todo: {}
});



/***/ }),

/***/ "./src/components/TodoItem/TodoItem.scss":
/*!***********************************************!*\
  !*** ./src/components/TodoItem/TodoItem.scss ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/components/TodoTextInput/TodoTextInput.js":
/*!*******************************************************!*\
  !*** ./src/components/TodoTextInput/TodoTextInput.js ***!
  \*******************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return TodoTextInput; });
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/taro */ "./node_modules/@tarojs/taro/index.js");
/* harmony import */ var _tarojs_taro__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_tarojs_taro__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var _TodoTextInput_scss__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./TodoTextInput.scss */ "./src/components/TodoTextInput/TodoTextInput.scss");
/* harmony import */ var _TodoTextInput_scss__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_TodoTextInput_scss__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);













var TodoTextInput = /*#__PURE__*/function (_React$Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(TodoTextInput, _React$Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__[/* default */ "a"])(TodoTextInput);

  function TodoTextInput() {
    var _this;

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, TodoTextInput);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "state", {
      todoText: _this.props.text || ''
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleSubmit", function (e) {
      console.log('handleSubmit', e);
      var text = e.target.value.trim();

      _this.props.onSave(text);

      if (_this.props.newTodo) {
        _this.setState({
          todoText: ''
        });
      }
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleSubmitKey", function (e) {
      console.log('handleSubmitKey', e);
      var text = e.target.value.trim();

      if (e.which === 13) {
        _this.props.onSave(text);

        if (_this.props.newTodo) {
          _this.setState({
            todoText: ''
          });
        }
      }
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleChange", function (e) {
      if (_tarojs_taro__WEBPACK_IMPORTED_MODULE_6___default.a.getEnv() === _tarojs_taro__WEBPACK_IMPORTED_MODULE_6___default.a.ENV_TYPE.WEAPP) return;
      console.log('handleChange', e);

      _this.setState({
        todoText: e.target.value
      });
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleInput", function (e) {
      console.log('handleChange', e);

      _this.setState({
        todoText: e.target.value
      });
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "handleBlur", function (e) {
      console.log('handleBlur', e);

      if (!_this.props.newTodo) {
        _this.props.onSave(e.target.value);
      }
    });

    return _this;
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(TodoTextInput, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_9__[/* Input */ "c"], {
        className: classnames__WEBPACK_IMPORTED_MODULE_8___default()({
          edit: this.props.editing,
          'new-todo': this.props.newTodo
        }),
        placeholderTextColor: "#e6e6e6",
        type: "text",
        placeholder: this.props.placeholder,
        autoFocus: "true",
        confirmType: "done",
        value: this.state.todoText,
        onBlur: this.handleBlur,
        onChange: this.handleChange,
        onInput: this.handleInput,
        onKeyDown: this.handleSubmitKey,
        onConfirm: this.handleSubmit
      });
    }
  }]);

  return TodoTextInput;
}(react__WEBPACK_IMPORTED_MODULE_7___default.a.Component);



/***/ }),

/***/ "./src/components/TodoTextInput/TodoTextInput.scss":
/*!*********************************************************!*\
  !*** ./src/components/TodoTextInput/TodoTextInput.scss ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/containers/FilterLink/FilterLink.js":
/*!*************************************************!*\
  !*** ./src/containers/FilterLink/FilterLink.js ***!
  \*************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! classnames */ "./node_modules/classnames/index.js");
/* harmony import */ var classnames__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(classnames__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../actions */ "./src/actions/index.js");
/* harmony import */ var _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../constants/TodoFilters */ "./src/constants/TodoFilters.js");
/* harmony import */ var _FilterLink_scss__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./FilterLink.scss */ "./src/containers/FilterLink/FilterLink.scss");
/* harmony import */ var _FilterLink_scss__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_FilterLink_scss__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__);







var _FILTER_TITLES, _dec, _class;









var FILTER_TITLES = (_FILTER_TITLES = {}, Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(_FILTER_TITLES, _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_11__[/* SHOW_ALL */ "b"], 'All'), Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(_FILTER_TITLES, _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_11__[/* SHOW_ACTIVE */ "a"], 'Active'), Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(_FILTER_TITLES, _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_11__[/* SHOW_COMPLETED */ "c"], 'Completed'), _FILTER_TITLES);

var mapStateToProps = function mapStateToProps(_ref) {
  var visibilityFilter = _ref.visibilityFilter;
  return {
    visibilityFilter: visibilityFilter
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    setFilter: function setFilter(filter) {
      dispatch(Object(_actions__WEBPACK_IMPORTED_MODULE_10__["setVisibilityFilter"])(filter));
    }
  };
};

var FilterLink = (_dec = Object(react_redux__WEBPACK_IMPORTED_MODULE_6__[/* connect */ "b"])(mapStateToProps, mapDispatchToProps), _dec(_class = /*#__PURE__*/function (_React$Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(FilterLink, _React$Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__[/* default */ "a"])(FilterLink);

  function FilterLink() {
    var _this;

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, FilterLink);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "onClickHandler", function () {
      console.log('onClickHandler', _this.props.filter);

      _this.props.setFilter(_this.props.filter);
    });

    return _this;
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(FilterLink, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          filter = _this$props.filter,
          visibilityFilter = _this$props.visibilityFilter;
      var text = FILTER_TITLES[filter];
      var active = visibilityFilter === filter;
      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_13__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_8__[/* Text */ "e"], {
        className: classnames__WEBPACK_IMPORTED_MODULE_9___default()({
          'filters-link': true,
          'selected': active
        }),
        onClick: this.onClickHandler,
        children: text
      });
    }
  }]);

  return FilterLink;
}(react__WEBPACK_IMPORTED_MODULE_7___default.a.Component)) || _class);
/* harmony default export */ __webpack_exports__["a"] = (FilterLink);

/***/ }),

/***/ "./src/containers/FilterLink/FilterLink.scss":
/*!***************************************************!*\
  !*** ./src/containers/FilterLink/FilterLink.scss ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/containers/Header/Header.js":
/*!*****************************************!*\
  !*** ./src/containers/Header/Header.js ***!
  \*****************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _components_TodoTextInput_TodoTextInput__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../components/TodoTextInput/TodoTextInput */ "./src/components/TodoTextInput/TodoTextInput.js");
/* harmony import */ var _FilterLink_FilterLink__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../FilterLink/FilterLink */ "./src/containers/FilterLink/FilterLink.js");
/* harmony import */ var _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../../constants/TodoFilters */ "./src/constants/TodoFilters.js");
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../actions */ "./src/actions/index.js");
/* harmony import */ var _Header_scss__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./Header.scss */ "./src/containers/Header/Header.scss");
/* harmony import */ var _Header_scss__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_Header_scss__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__);







var _FILTER_TITLES, _dec, _class;












var FILTER_TITLES = (_FILTER_TITLES = {}, Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(_FILTER_TITLES, _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_12__[/* SHOW_ALL */ "b"], 'All'), Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(_FILTER_TITLES, _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_12__[/* SHOW_ACTIVE */ "a"], 'Active'), Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(_FILTER_TITLES, _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_12__[/* SHOW_COMPLETED */ "c"], 'Completed'), _FILTER_TITLES);

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    actions: Object(redux__WEBPACK_IMPORTED_MODULE_9__["bindActionCreators"])(_actions__WEBPACK_IMPORTED_MODULE_13__, dispatch)
  };
};

var Header = (_dec = Object(react_redux__WEBPACK_IMPORTED_MODULE_8__[/* connect */ "b"])(function () {
  return {};
}, mapDispatchToProps), _dec(_class = /*#__PURE__*/function (_React$Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(Header, _React$Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__[/* default */ "a"])(Header);

  function Header() {
    var _this;

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, Header);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "onCheckClickHandler", function () {
      console.log('onCheckClickHandler');
      var actions = _this.props.actions;
      actions.completeAllTodos();
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "onSaveHandler", function (text) {
      if (text.length !== 0) {
        _this.props.actions.addTodo(text);
      }
    });

    return _this;
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(Header, [{
    key: "render",
    value: function render() {
      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsxs"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
        className: "header",
        children: [/*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
          className: "header-title-wrap",
          children: /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* Text */ "e"], {
            className: "title",
            children: "todos"
          })
        }), /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
          className: "filters",
          children: Object.keys(FILTER_TITLES).map(function (filter, index) {
            return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
              className: "filters-item",
              children: /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_FilterLink_FilterLink__WEBPACK_IMPORTED_MODULE_11__[/* default */ "a"], {
                filter: filter
              })
            }, index);
          })
        }), /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsxs"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
          className: "textinput-wrap",
          children: [/*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* Text */ "e"], {
            className: "textinput-wrap-icon",
            onClick: this.onCheckClickHandler,
            children: "\u276F"
          }), /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
            className: "textinput-wrap-input",
            children: /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_components_TodoTextInput_TodoTextInput__WEBPACK_IMPORTED_MODULE_10__[/* default */ "a"], {
              className: "textinput-wrap-input",
              newTodo: true,
              onSave: this.onSaveHandler,
              placeholder: "What needs to be done?"
            })
          })]
        })]
      });
    }
  }]);

  return Header;
}(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component)) || _class);
/* harmony default export */ __webpack_exports__["a"] = (Header);

/***/ }),

/***/ "./src/containers/Header/Header.scss":
/*!*******************************************!*\
  !*** ./src/containers/Header/Header.scss ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/containers/MainSection/MainSection.js":
/*!***************************************************!*\
  !*** ./src/containers/MainSection/MainSection.js ***!
  \***************************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/defineProperty.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../actions */ "./src/actions/index.js");
/* harmony import */ var _components_Footer_Footer__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../../components/Footer/Footer */ "./src/components/Footer/Footer.js");
/* harmony import */ var _TodoList_TodoList__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../TodoList/TodoList */ "./src/containers/TodoList/TodoList.js");
/* harmony import */ var _selectors__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ../../selectors */ "./src/selectors/index.js");
/* harmony import */ var _MainSection_scss__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./MainSection.scss */ "./src/containers/MainSection/MainSection.scss");
/* harmony import */ var _MainSection_scss__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_MainSection_scss__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__);







var _dec, _class;













var mapStateToProps = function mapStateToProps(state) {
  return {
    todosCount: state.todos.length,
    completedCount: Object(_selectors__WEBPACK_IMPORTED_MODULE_13__[/* getCompletedTodoCount */ "a"])(state)
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    actions: Object(redux__WEBPACK_IMPORTED_MODULE_9__["bindActionCreators"])(_actions__WEBPACK_IMPORTED_MODULE_10__, dispatch)
  };
};

var MainSection = (_dec = Object(react_redux__WEBPACK_IMPORTED_MODULE_8__[/* connect */ "b"])(mapStateToProps, mapDispatchToProps), _dec(_class = /*#__PURE__*/function (_React$Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(MainSection, _React$Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_4__[/* default */ "a"])(MainSection);

  function MainSection() {
    var _this;

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, MainSection);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "onCheckClickHandler", function () {
      var actions = _this.props.actions;
      actions.completeAllTodos();
    });

    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_5__[/* default */ "a"])(Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_assertThisInitialized__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(_this), "onChangeHandler", function () {});

    return _this;
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(MainSection, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          todosCount = _this$props.todosCount,
          completedCount = _this$props.completedCount,
          actions = _this$props.actions;
      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsxs"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_7__[/* View */ "f"], {
        className: "main",
        children: [/*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_TodoList_TodoList__WEBPACK_IMPORTED_MODULE_12__[/* default */ "a"], {}), !!todosCount && /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_15__["jsx"])(_components_Footer_Footer__WEBPACK_IMPORTED_MODULE_11__[/* default */ "a"], {
          completedCount: completedCount,
          activeCount: todosCount - completedCount,
          onClearCompleted: actions.clearCompleted
        })]
      });
    }
  }]);

  return MainSection;
}(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component)) || _class);
/* harmony default export */ __webpack_exports__["a"] = (MainSection);

/***/ }),

/***/ "./src/containers/MainSection/MainSection.scss":
/*!*****************************************************!*\
  !*** ./src/containers/MainSection/MainSection.scss ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/containers/TodoList/TodoList.js":
/*!*********************************************!*\
  !*** ./src/containers/TodoList/TodoList.js ***!
  \*********************************************/
/*! exports provided: default */
/*! exports used: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/classCallCheck.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createClass.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/inherits.js");
/* harmony import */ var _Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper */ "./node_modules/babel-preset-taro/node_modules/@babel/runtime/helpers/esm/createSuper.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react */ "./node_modules/react/cjs/react.production.min.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react-redux */ "./node_modules/react-redux/es/index.js");
/* harmony import */ var _tarojs_components__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @tarojs/components */ "./node_modules/@tarojs/plugin-platform-weapp/dist/components-react.js");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! redux */ "./node_modules/redux/es/redux.js");
/* harmony import */ var _components_TodoItem_TodoItem__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../../components/TodoItem/TodoItem */ "./src/components/TodoItem/TodoItem.js");
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../actions */ "./src/actions/index.js");
/* harmony import */ var _selectors__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../selectors */ "./src/selectors/index.js");
/* harmony import */ var _TodoList_scss__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./TodoList.scss */ "./src/containers/TodoList/TodoList.scss");
/* harmony import */ var _TodoList_scss__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_TodoList_scss__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/cjs/react-jsx-runtime.production.min.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__);





var _dec, _class;











var mapStateToProps = function mapStateToProps(state) {
  return {
    filteredTodos: Object(_selectors__WEBPACK_IMPORTED_MODULE_10__[/* getVisibleTodos */ "b"])(state)
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    actions: Object(redux__WEBPACK_IMPORTED_MODULE_7__["bindActionCreators"])(_actions__WEBPACK_IMPORTED_MODULE_9__, dispatch)
  };
};

var TodoList = (_dec = Object(react_redux__WEBPACK_IMPORTED_MODULE_5__[/* connect */ "b"])(mapStateToProps, mapDispatchToProps), _dec(_class = /*#__PURE__*/function (_React$Component) {
  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__[/* default */ "a"])(TodoList, _React$Component);

  var _super = Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createSuper__WEBPACK_IMPORTED_MODULE_3__[/* default */ "a"])(TodoList);

  function TodoList() {
    Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[/* default */ "a"])(this, TodoList);

    return _super.apply(this, arguments);
  }

  Object(_Users_jiyufeng_Documents_demo_TodoMVC_node_modules_babel_preset_taro_node_modules_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"])(TodoList, [{
    key: "render",
    value: function render() {
      var _this = this;

      var filteredTodos = this.props.filteredTodos;
      console.log(filteredTodos);
      return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__["jsx"])(_tarojs_components__WEBPACK_IMPORTED_MODULE_6__[/* View */ "f"], {
        className: "todo-list",
        children: filteredTodos.map(function (todo) {
          return /*#__PURE__*/Object(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_12__["jsx"])(_components_TodoItem_TodoItem__WEBPACK_IMPORTED_MODULE_8__[/* default */ "a"], {
            todo: todo,
            onDeleteTodo: _this.props.actions.deleteTodo,
            onEditTodo: _this.props.actions.editTodo,
            onCompleteTodo: _this.props.actions.completeTodo
          }, todo.id);
        })
      });
    }
  }]);

  return TodoList;
}(react__WEBPACK_IMPORTED_MODULE_4___default.a.Component)) || _class);
/* harmony default export */ __webpack_exports__["a"] = (TodoList);

/***/ }),

/***/ "./src/containers/TodoList/TodoList.scss":
/*!***********************************************!*\
  !*** ./src/containers/TodoList/TodoList.scss ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/pages/index/index.js":
/*!**********************************!*\
  !*** ./src/pages/index/index.js ***!
  \**********************************/
/*! no exports provided */
/*! all exports used */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tarojs/runtime */ "./node_modules/@tarojs/runtime/dist/runtime.esm.js");
/* harmony import */ var _node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib!./index.js */ "./node_modules/@tarojs/mini-runner/node_modules/babel-loader/lib/index.js!./src/pages/index/index.js");


var config = {"navigationBarTitleText":"TODO List"};


var inst = Page(Object(_tarojs_runtime__WEBPACK_IMPORTED_MODULE_0__["createPageConfig"])(_node_modules_tarojs_mini_runner_node_modules_babel_loader_lib_index_js_index_js__WEBPACK_IMPORTED_MODULE_1__[/* default */ "a"], 'pages/index/index', {root:{cn:[]}}, config || {}))



/***/ }),

/***/ "./src/pages/index/index.scss":
/*!************************************!*\
  !*** ./src/pages/index/index.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// extracted by mini-css-extract-plugin

/***/ }),

/***/ "./src/selectors/index.js":
/*!********************************!*\
  !*** ./src/selectors/index.js ***!
  \********************************/
/*! exports provided: getVisibleTodos, getCompletedTodoCount */
/*! exports used: getCompletedTodoCount, getVisibleTodos */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return getVisibleTodos; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return getCompletedTodoCount; });
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! reselect */ "./node_modules/reselect/es/index.js");
/* harmony import */ var _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants/TodoFilters */ "./src/constants/TodoFilters.js");



var getVisibilityFilter = function getVisibilityFilter(state) {
  return state.visibilityFilter;
};

var getTodos = function getTodos(state) {
  return state.todos;
};

var getVisibleTodos = Object(reselect__WEBPACK_IMPORTED_MODULE_0__[/* createSelector */ "a"])([getVisibilityFilter, getTodos], function (visibilityFilter, todos) {
  switch (visibilityFilter) {
    case _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_1__[/* SHOW_ALL */ "b"]:
      return todos;

    case _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_1__[/* SHOW_COMPLETED */ "c"]:
      return todos.filter(function (t) {
        return t.completed;
      });

    case _constants_TodoFilters__WEBPACK_IMPORTED_MODULE_1__[/* SHOW_ACTIVE */ "a"]:
      return todos.filter(function (t) {
        return !t.completed;
      });

    default:
      throw new Error('Unknown filter: ' + visibilityFilter);
  }
});
var getCompletedTodoCount = Object(reselect__WEBPACK_IMPORTED_MODULE_0__[/* createSelector */ "a"])([getTodos], function (todos) {
  return todos.reduce(function (count, todo) {
    return todo.completed ? count + 1 : count;
  }, 0);
});

/***/ })

},[["./src/pages/index/index.js","runtime","taro","vendors","common"]]]);
//# sourceMappingURL=index.js.map