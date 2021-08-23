
  window.app = window.app || {};
  window.app['/components/add-button/add-button'] = {
    // is: "/components/add-button/add-button",
    usingComponents: {"add-button":"/components/add-button/add-button"},
    get render() { 
      const fn = require('./add-button.wxml'); 
      return fn.default || fn;
    },
    
  };
  