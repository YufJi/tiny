
const { Component: $Component } = self.MP;

var Component = $Component || function(){};

Component(
{
  is: "/components/add-button/add-button",
  usingComponents: {"add-button":"/components/add-button/add-button"},
  render: function() { return require('./add-button.axml'); },
  stylesheet: function() { return require('./add-button.acss'); },
});
