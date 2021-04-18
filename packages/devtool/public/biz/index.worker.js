const __mpStartTime = Date.now();

console.log('我是 index.worker.js');
if (!self.__mpInited) {
  self.__mpInited = 1;

  const g = typeof global !== 'undefined' ? global : self;
  g.mpAppJson = {
    app: {
      $homepage: 'pages/todos/todos',
    },
  };

  const { MP } = self;
  self.getCurrentPages = MP.getCurrentPages;
  self.getApp = MP.getApp;
  self.Page = MP.Page;
  self.App = MP.App;
  self.my = MP.bridge || MP.abridge;
  self.abridge = self.my;
  self.Component = MP.Component || function () {};
  self.$global = MP.$global;
  self.requirePlugin = MP.requirePlugin;

  if (MP.registerApp) {
    MP.registerApp({
      appJSON: mpAppJson,
    });
  }

  function success() {
    const globalThis = undefined;
    const global = undefined;
    const AlipayJSBridge = undefined;
    const fetch = undefined;
    const self = undefined;
    const window = undefined;
    const document = undefined;
    const location = undefined;
    const XMLHttpRequest = undefined;

    App({
      todos: [
        { text: 'Learning Javascript', completed: true },
        { text: 'Learning ES2016', completed: true },
        { text: 'Learning 支付宝小程序', completed: false },
      ],
      userInfo: null,
      onLaunch() {
        console.log('app onLaunch');
      },
      getUserInfo() {
        return new Promise((resolve, reject) => {
          if (this.userInfo) resolve(this.userInfo);

          my.getAuthCode({
            scopes: ['auth_user'],
            success: (authcode) => {
              console.info(authcode);

              my.getAuthUserInfo({
                success: (res) => {
                  this.userInfo = res;
                  resolve(this.userInfo);
                },
                fail: () => {
                  reject({});
                },
              });
            },
            fail: () => {
              reject({});
            },
          });
        });
      },
    });

    // component start
    $global.currentComponentConfig = {
      is: '/components/add-button/add-button',
      usingComponents: {},
    };

    console.log('加载我了！');

    Component({
      props: {
        text: 'Button',
        onClickMe: () => {},
      },

      methods: {
        onClick() {
          console.log('com worker onClick');

          console.log(this.props, 'props');
          this.props.onClickMe();

          // this.triggerEvent('onClickMe');
        },
      },
    });
    // component end

    // pageA start
    $global.currentPageConfig = {
      pagePath: 'pages/index/index',
      usingComponents: { 'add-button': '/components/add-button/add-button' },
    };

    const app = getApp();
    // workers registry page
    Page({
      // 声明页面数据
      data: {
        xx: 0,
        value: '123',
      },
      onPlus() {
        console.log('self', self);

        // my.showToast({
        //   type: 'done',
        //   content: '操作成功',
        //   duration: 3000,
        //   success: (res) => {
        //     console.log('success', res);
        //   },
        //   fail: (e) => {
        //     console.log('fail', e);
        //   },
        //   complete: (res) => {
        //     console.log('complete', res);
        //   },
        // });

        this.setData({
          xx: this.data.xx + 1,
        });
      },
      onMinus() {
        console.log('self', self);
        // my.hideToast();
        this.setData({
          xx: this.data.xx - 1,
        });
      },
      addTodo() {
        console.log('addTodo');
      },
      // 监听生命周期回调 onLoad
      onLoad() {
        // 获取用户信息并存储数据
        console.log('page onLoad');
      },
      // 监听生命周期回调 onShow
      onShow() {
        // 设置全局数据到当前页面数据
        this.setData({
          todos: app.todos,
          aa: 'click me',
        });
        console.log('page onShow');
      },
      onReady() {
        console.log('page onReady');

        const context = my.createCanvasContext('canvas', {
          enableNative: false,
        });

        context.setStrokeStyle('#00ff00');
        context.setLineWidth(5);
        context.rect(0, 0, 200, 200);
        context.stroke();
        context.setStrokeStyle('#ff0000');
        context.setLineWidth(2);
        context.moveTo(160, 100);
        context.arc(100, 100, 60, 0, 2 * Math.PI, true);
        context.moveTo(140, 100);
        context.arc(100, 100, 40, 0, Math.PI, false);
        context.moveTo(85, 80);
        context.arc(80, 80, 5, 0, 2 * Math.PI, true);
        context.moveTo(125, 80);
        context.arc(120, 80, 5, 0, 2 * Math.PI, true);
        context.stroke();
        context.draw();
      },
      onInput() {
        this.setData({
          value: '123',
        });
      },
      // 事件处理函数
      onTodoChanged(e) {
        // 修改全局数据
        const checkedTodos = e.detail.value;
        app.todos = app.todos.map((todo) => ({
          ...todo,
          completed: checkedTodos.indexOf(todo.text) > -1,
        }));
        this.setData({ todos: app.todos });
      },
    });
    // pageA end

    // ...

  }
  
  self.bootstrapApp ? self.bootstrapApp({ success }) : success();
}

const __mpCosts = Date.now() - __mpStartTime;

console.log(`framework: index.worker bundle costs ${__mpCosts} ms`);
