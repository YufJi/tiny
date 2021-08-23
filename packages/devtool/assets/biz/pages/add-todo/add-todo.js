
var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

const app = getApp();

Page({
  data: {
    inputValue: '',
  },

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
});
