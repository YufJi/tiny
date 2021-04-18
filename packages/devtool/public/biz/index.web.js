
console.log('我是 index.web.js');

const g = typeof global !== 'undefined' ? global : self;
g.mpAppJson = {
  app: {
    $homepage: 'pages/index/index',
  },
};

const { getComponentClass } = self.MP;
const $getComponentEventHandler = (instance, name) => instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);
const $getEventHandler = (instance, name) => instance.$getEventHandler(name);
const $getRefHandler = (instance, name) => instance.$getRefHandler(name);
const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);
const $getComponentClass = (name) => getComponentClass && getComponentClass(name);

self.MP.Component({
  is: '/components/add-button/add-button',
  usingComponents: {},
  render() {
    return function (data) {
      return self.React.createElement('div', {
        className: 'add-button',
        onClick: () => $getEventHandler(this, 'onClick')(),
      }, `${data.text}`);
    };
  },
});

const AddButton = $getComponentClass('/components/add-button/add-button');

// render registry page
self.MP.Page({
  pagePath: 'pages/index/index',
  usingComponents: { 'add-button': '/components/add-button/add-button' },
  render() {
    return function (data) {
      return self.React.createElement('div', {
        className: data.xx,
      },
      'Hello MiniProgram',
      self.React.createElement('div', {},
        self.React.createElement('div', {
        }, '^我是一个canvas'),
        self.React.createElement(AddButton, {
          text: 'i am a component',
          onClickMe: $getComponentEventHandler(this, 'addTodo'),
          $isCustomComponent: this.$isCustomComponent,
          __tag: 'add-button',
        }),
        self.React.createElement('input', {
          value: data.value,
          onInput: $getEventHandler(this, 'onInput'),
        }),
        self.React.createElement('input', {
        }),
        self.React.createElement('div', {
          onClick: () => $getEventHandler(this, 'onMinus')(),
        }, '-'),
        `${data.xx}`,
        self.React.createElement('div', {
          onClick: () => $getEventHandler(this, 'onPlus')(),
        }, '+')));
    };
  },
  stylesheet() { return ''; },
});
