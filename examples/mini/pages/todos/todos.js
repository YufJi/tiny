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

    animationData: {},

    array: ['美国', '中国', '巴西', '日本'],
    objectArray: [
      {
        id: 0,
        name: '美国',
      },
      {
        id: 1,
        name: '中国',
      },
      {
        id: 2,
        name: '巴西',
      },
      {
        id: 3,
        name: '日本',
      },
    ],
    index: 0,
    multiArray: [['无脊柱动物', '脊柱动物'], ['扁性动物', '线形动物', '环节动物', '软体动物', '节肢动物'], ['猪肉绦虫', '吸血虫']],
    objectMultiArray: [
      [
        {
          id: 0,
          name: '无脊柱动物',
        },
        {
          id: 1,
          name: '脊柱动物',
        },
      ], [
        {
          id: 0,
          name: '扁性动物',
        },
        {
          id: 1,
          name: '线形动物',
        },
        {
          id: 2,
          name: '环节动物',
        },
        {
          id: 3,
          name: '软体动物',
        },
        {
          id: 3,
          name: '节肢动物',
        },
      ], [
        {
          id: 0,
          name: '猪肉绦虫',
        },
        {
          id: 1,
          name: '吸血虫',
        },
      ],
    ],
    multiIndex: [0, 0, 0],
    date: '2016-09-01',
    time: '12:01',
    region: ['广东省', '广州市', '海珠区'],
    customItem: '全部',
  },
  // 监听生命周期回调 onLoad
  onLoad() {
    console.log('page load');
    // 获取用户信息并存储数据

    const value = wx.getStorageSync('tinyName');

    console.log('getStorageSync', value);
    const animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease-in',
    });

    animation.scale(5, 5).rotate(120).step();

    this.setData({
      text: 'load',
      animationData: animation.export(),
    });
  },
  // 监听生命周期回调 onShow
  onShow() {
    // 设置全局数据到当前页面数据
    console.log('page show');

    const animation = wx.createAnimation({
      duration: 3000,
      timingFunction: 'ease-in',
    });

    animation.scale(1.5, 1.5).rotate(20).step();

    this.setData({
      todos: app.todos,
      text: 'show',
      animationData: animation.export(),
    });
  },
  onReady() {
    console.log('page ready');

    const id = setTimeout(() => {
      console.log('setTimeout');
      this.showToast();
    }, 5000);

    const animation = wx.createAnimation({
      duration: 3000,
      timingFunction: 'ease-in',
    });

    animation.scale(0.5, 0.5).rotate(90).step();
    this.setData({
      animationData: animation.export(),
      // text: 'xxxxxxxxxx',
    });

    const ctx = wx.createCanvasContext('canvas');
    ctx.setFillStyle('red');
    ctx.fillRect(10, 10, 150, 75);
    ctx.draw();
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
      title: '是的发送到发的发生发的啊的',
      icon: 'error',
      duration: 2000,
    });

    setTimeout(() => {
      wx.hideToast();
    }, 500);
  },

  tapSlot(e) {
    console.log('tapSlot', e);
  },
  nav() {
    wx.navigateTo({
      url: '../bar/index',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataFromOpenedPage(data) {
          console.log('acceptDataFromOpenedPage', data);
        },
        someEvent(data) {
          console.log('someEvent', data);
        },
      },
      success(res) {
        console.log('navigateTo success', res);
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' });
      },
    });
  },
  ani1() {
    const animation = wx.createAnimation({
      duration: 2000,
      timingFunction: 'ease',
    });

    animation.scale(2, 2).rotate(45).step();
    animation.scale(3, 3).rotate(60).step();
    this.setData({
      animationData: animation.export(),
    });
  },
});
