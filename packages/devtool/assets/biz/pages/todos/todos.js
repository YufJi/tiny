
var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

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
