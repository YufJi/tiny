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
/******/ 	return __webpack_require__(__webpack_require__.s = "../devtool/assets/biz/.cache/index$.worker.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../devtool/assets/biz/.cache/appConfig.json":
/*!***************************************************!*\
  !*** ../devtool/assets/biz/.cache/appConfig.json ***!
  \***************************************************/
/*! exports provided: window, pages, launchParams, prerenderPage, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"window\":{\"navigationBarTitleText\":\"哈哈哈\"},\"pages\":[\"pages/todos/todos\",\"pages/add-todo/add-todo\"],\"launchParams\":{\"pages/todos/todos\":{\"navigationBarTitleText\":\"Index\"},\"pages/add-todo/add-todo\":{\"navigationBarTitleText\":\"哈哈哈\"}},\"prerenderPage\":\"render.html\"}");

/***/ }),

/***/ "../devtool/assets/biz/.cache/config$.js":
/*!***********************************************!*\
  !*** ../devtool/assets/biz/.cache/config$.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
const g = typeof global !== 'undefined' ? global : self;
g.mpAppJson = {
  "app": {
    "$homepage": "pages/todos/todos"
  }
};

const appConfig = __webpack_require__(/*! ./appConfig.json */ "../devtool/assets/biz/.cache/appConfig.json");
g.TinyConfig = appConfig;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../../../compiler/node_modules/webpack/buildin/global.js */ "./node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../devtool/assets/biz/.cache/index$.worker.js":
/*!*****************************************************!*\
  !*** ../devtool/assets/biz/.cache/index$.worker.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

if(!self.__TinyInited__) {
self.__TinyInited__ = true;
__webpack_require__(/*! ./config$ */ "../devtool/assets/biz/.cache/config$.js");

function success() {
__webpack_require__(/*! ./example/miniRoot/app */ "./example/miniRoot/app.js");
__webpack_require__(/*! ./example/miniRoot/components/add-button/add-button?hash=ea9fd3845ae66c309dbd89c5d58c2c7c2940f3bc */ "./example/miniRoot/components/add-button/add-button.js?hash=ea9fd3845ae66c309dbd89c5d58c2c7c2940f3bc");
__webpack_require__(/*! ./example/miniRoot/pages/todos/todos?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219 */ "./example/miniRoot/pages/todos/todos.js?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219");
__webpack_require__(/*! ./example/miniRoot/pages/add-todo/add-todo?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219 */ "./example/miniRoot/pages/add-todo/add-todo.js?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219");
}
success();
}

/***/ }),

/***/ "./example/miniRoot/app.js":
/*!*********************************!*\
  !*** ./example/miniRoot/app.js ***!
  \*********************************/
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

App({
  todos: [
    { text: 'Learning Javascript', completed: true },
    { text: 'Learning ES2016', completed: true },
    { text: 'Learning 小程序', completed: false },
  ],

  userInfo: null,

  onLaunch(options) {
    // Do something initial when launch.
    console.log('app onLaunch');

    wx.setStorageSync('tinyName', '测试小程序');
  },
  onShow(options) {
    // Do something when show.
    console.log('app onShow');
  },
  onHide() {
    // Do something when hide.
    console.log('app onHide');
  },

});


/***/ }),

/***/ "./example/miniRoot/components/add-button/add-button.js?hash=ea9fd3845ae66c309dbd89c5d58c2c7c2940f3bc":
/*!************************************************************************************************************!*\
  !*** ./example/miniRoot/components/add-button/add-button.js?hash=ea9fd3845ae66c309dbd89c5d58c2c7c2940f3bc ***!
  \************************************************************************************************************/
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
  is: "/components/add-button/add-button",
  usingComponents: {"add-button":"/components/add-button/add-button"},
};

Component({
  properties: {
    text: {
      type: String,
      value: 'sdas',
    },
  },

  data: {
    // text: 'jyf',
    name: 'xxxxx',
  },

  lifetimes: {
    created() {
      console.log('created', this.properties, this.data);
    },
    attached() {
      console.log('attached', this.properties, this.data);
    },
    ready() {
      console.log('ready', this.properties, this.data);
    },
    moved() {
      console.log('moved', this.properties);
    },
    detached() {
      console.log('detached', this.properties);
    },
  },

  methods: {
    xx() {
      console.log('properties', this.properties, this.data);
    },
    onClickMe() {
      this.setData({
        // text: 'xhq',
        name: 'ooo',
      });
      console.log('properties', this.properties, this.data);
      this.triggerEvent('click_me', { xx: 'xxxx' }, { bubbles: true });
    },
  },
});

  

/***/ }),

/***/ "./example/miniRoot/pages/add-todo/add-todo.js?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219":
/*!***************************************************************************************************!*\
  !*** ./example/miniRoot/pages/add-todo/add-todo.js?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219 ***!
  \***************************************************************************************************/
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
  is: 'pages/add-todo/add-todo',
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
};

const app = getApp();

Component({
  data: {
    inputValue: '',
  },

  methods: {
    onBlur(e) {
      console.log('onBlur');
      this.setData({
        inputValue: e.detail.value,
      });
    },

    onInput(e) {
      console.log(e, 'onInput');

      this.setData({
        inputValue: e.detail.value,
      });
    },

    add() {
      app.todos = app.todos.concat([
        {
          text: this.data.inputValue,
          compeleted: false,
        },
      ]);

      wx.navigateBack();
    },
    xxxx() {
      console.log('xxxx');
    },
  },

});



/***/ }),

/***/ "./example/miniRoot/pages/todos/todos.js?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219":
/*!*********************************************************************************************!*\
  !*** ./example/miniRoot/pages/todos/todos.js?hash=05b57513280a5d6b34d9a8da01f5b7553f53e219 ***!
  \*********************************************************************************************/
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
  is: 'pages/todos/todos',
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
};

// 获取全局 app 实例
const app = getApp();

Page({
  // 声明页面数据
  data: {
    text: 'abc',
    fn: 'addTodo',

    haha: 'xxxx',
    switchChecked: false,

    background: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 4000,
    duration: 500,
  },
  // 监听生命周期回调 onLoad
  onLoad() {
    console.log('page load');
    // 获取用户信息并存储数据

    const value = wx.getStorageSync('tinyName');

    console.log('getStorageSync', value);
  },
  // 监听生命周期回调 onShow
  onShow() {
    // 设置全局数据到当前页面数据
    this.setData({
      todos: app.todos,
    });
    this.setData({
      text: 'onshow',
    });
    console.log('page show');
  },
  onReady() {
    this.setData({
      text: 'ready',
    });
    console.log('page ready');

    const id = setTimeout(() => {
      console.log('setTimeout');
    }, 3000);
  },

  onHide() {
    console.log('page hide');
  },
  // 事件处理函数
  onTodoChanged(e) {
    console.log('e', e);
    // 修改全局数据
    const checkedTodos = e.detail.value;
    app.todos = app.todos.map((todo) => ({
      ...todo,
      completed: checkedTodos.indexOf(todo.text) > -1,
    }));
    this.setData({ todos: app.todos });
  },

  addTodo(e) {
    console.log(e, 'eeexxxxxx');
    this.setData({
      text: 'chi',
      // fn: 'captureClickChild',
    });
    console.log('准备进行页面跳转');
    // 进行页面跳转
    wx.navigateTo({
      url: '../add-todo/add-todo',
    });
  },
  clickParent(e) {
    console.log('clickParent', e);
  },
  clickChild(e) {
    console.log('clickChild', e);
    this.setData({
      haha: 'ooooo',
    });
  },
  captureClickChild() {
    console.log('captureClickChild');
  },
  clickCom(e) {
    console.log(e, 'eeex');
    this.setData({
      text: 'def',
    });
    console.log('clickCom');
  },
  clicklabel() {
    console.log('clicklabel');
  },
  sliderChange(e) {
    console.log('slider发生change事件，携带值为', e.detail.value);
  },
  switchChange(e) {
    console.log('switch发生change事件，携带值为', e.detail.value);
    this.setData({
      switchChecked: e.detail.value,
    });
  },

  changeIndicatorDots() {
    this.setData({
      indicatorDots: !this.data.indicatorDots,
    });
  },

  changeAutoplay() {
    this.setData({
      autoplay: !this.data.autoplay,
    });
  },

  intervalChange(e) {
    console.log('intervalChange', e.detail.value);
    this.setData({
      interval: e.detail.value,
    });
  },

  durationChange(e) {
    console.log('durationChange', e.detail.value);
    this.setData({
      duration: e.detail.value,
    });
  },

  pct() {
    console.log('parent capture tap', Date.now());
  },
  pt() {
    console.log('parent tap', Date.now());
  },
  plp() {
    console.log('parent longpress', Date.now());
  },
  pts() {
    console.log('parent touchstart');
  },
  ptm() {
    console.log('parent touchmove');
  },
  cct() {
    console.log('child capture tap');
  },
  ct() {
    console.log('child catch tap');
  },
  cts() {
    console.log('child touchstart');
  },
  ctm() {
    console.log('child touchmove');
  },

  showToast() {
    wx.showToast({
      title: '成功',
      icon: 'success',
      duration: 2000,
    });
  },

  tapSlot(e) {
    console.log('tapSlot', e);
  },
});



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