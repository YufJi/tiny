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
