
    window.app = window.app || {};
    window.app['pages/add-todo/add-todo'] = {
      usingComponents: {"add-button":"/components/add-button/add-button"},
      
      get render() {
        return require('./add-todo.wxml');
      },
      // render: function() { return require('./add-todo.wxml'); },
      // stylesheet: function() { return require('./add-todo.wxss'); },
      get stylesheet() { return require('./add-todo.wxss'); },
    };

    window['generateFunc'] = window['generateFunc'] || {};
    window['generateFunc']['pages/add-todo/add-todo'] = function() {
      const generateFunc = window.app['pages/add-todo/add-todo'];

      document.dispatchEvent(new CustomEvent("generateFuncReady", {
        detail: {
          generateFunc
        }
      }))
    };
  