
    window.app = window.app || {};
    window.app['pages/todos/todos'] = {
      usingComponents: {"add-button":"/components/add-button/add-button"},
      
      get render() {
        return require('./todos.wxml');
      },
      // render: function() { return require('./todos.wxml'); },
      // stylesheet: function() { return require('./todos.wxss'); },
      get stylesheet() { return require('./todos.wxss'); },
    };

    window['generateFunc'] = window['generateFunc'] || {};
    window['generateFunc']['pages/todos/todos'] = function() {
      const generateFunc = window.app['pages/todos/todos'];

      document.dispatchEvent(new CustomEvent("generateFuncReady", {
        detail: {
          generateFunc
        }
      }))
    };
  