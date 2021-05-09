
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
  properties: {
    text: {
      type: String,
      value: 'sdas',
    },
  },

  data: {
    // text: 'jyf',
    name: 'xxxxx',
  },

  lifetimes: {
    created() {
      console.log(1, this.properties, this.data);
    },
    attached() {
      console.log(2, this.properties, this.data);
    },
    ready() {
      console.log(3, this.properties, this.data);
    },
    moved() {
      console.log(4, this.properties);
    },
    detached() {
      console.log(5, this.properties);
    },
  },

  methods: {
    xx() {
      console.log('properties', this.properties, this.data);
    },
    onClickMe() {
      this.setData({
        // text: 'xhq',
        name: 'ooo',
      });
      console.log('properties', this.properties, this.data);
      this.triggerEvent('click_me', { xx: 'xxxx' }, { bubbles: true });
    },
  },
});

  