
## 待完成事项

- 运行时

- 编译时
 - render端输出结构调整
  ```js
    // before
    Page(
      {
        pagePath: 'pages/todos/todos',
        usingComponents: { 'add-button': '/components/add-button/add-button' },

        render() { return require('./todos.wxml'); },
        stylesheet() { return require('./todos.wxss'); },
      },
    );

    // todo
    window.app['pages/todos/todos'] = {
      get render() {
        return require('./todos.wxml');
      },
      get stylesheet() {
        return require('./todos.wxss');
      },
    };
  ```

  ```js
    // before
    const AddButton_ = $getComponentClass("/components/add-button/add-button")
    const AddButton = AddButton_ || $EmptyComponentFactory("add-button");

    // todo
    function render(_data, _ctx) {
      const AddButton = _ctx.$$resolveComponent('add-button');
      ...
    }
  ```