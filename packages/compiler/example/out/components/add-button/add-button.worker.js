
var globalThis = undefined;
var global = undefined;
var fetch = undefined;
var self = undefined;
var window = undefined;
var document = undefined;
var location = undefined;
var XMLHttpRequest = undefined;

$global.currentComponentConfig = 
{
  is: "/components/add-button/add-button",
  usingComponents: {"add-button":"/components/add-button/add-button"},
};

Component({
  props: {
    text: 'Button',
    onClickMe: () => {},
  },

  methods: {
    onClickMe() {
      // this.props.onClickMe();
      this.triggerEvent('clickme')
    },
  },
});

  