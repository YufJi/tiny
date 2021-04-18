
const { Page } = self.MP;


Page(
{
  pagePath: 'pages/add-todo/add-todo',
  usingComponents: {"add-button":"/components/add-button/add-button"},
  
  render: function() { return require('./add-todo.axml'); },
  stylesheet: function() { return require('./add-todo.acss'); },
});
