
const { Page } = self.MP;


Page(
{
  pagePath: 'pages/add-todo/add-todo',
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
  render: function() { return require('./add-todo.wxml'); },
  stylesheet: function() { return require('./add-todo.wxss'); },
});
