// 获取全局 app 实例
const app = getApp();

Page({
  // 声明页面数据
  data: {
    text: 'abc',
    fn: 'addTodo',
  },
  // 监听生命周期回调 onLoad
  onLoad() {
    // 获取用户信息并存储数据
    app.getUserInfo().then(
      (user) => {
        this.setData({
          user,
        });
      },
      () => {
        // 获取用户信息失败
      },
    );
  },
  // 监听生命周期回调 onShow
  onShow() {
    // 设置全局数据到当前页面数据
    this.setData({ todos: app.todos });
    console.log('page show');
  },
  onHide() {
    console.log('page hide');
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

  addTodo(e) {
    console.log(e, 'eeexxxxxx')
    this.setData({
      text: 'chi',
      fn: 'captureClickChild'
    })
    console.log('准备进行页面跳转');
    // 进行页面跳转
    wx.navigateTo({
      url: '../add-todo/add-todo',
    });
  },
  clickParent() {
    console.log('clickParent');
  },
  clickChild() {
    console.log('clickChild');
  },
  captureClickChild() {
    console.log('captureClickChild');
  },
  clickCom(e) {
    console.log(e, 'eeex')
    this.setData({
      text: 'def',
    });
    console.log('clickCom');
  },
});
