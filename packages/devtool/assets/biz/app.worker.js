
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
