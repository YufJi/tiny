
const { Page } = self.MP;


Page(
{
  pagePath: 'pages/todos/todos',
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
  render: function() { return require('./todos.wxml'); },
  stylesheet: function() { return require('./todos.wxss'); },
});
