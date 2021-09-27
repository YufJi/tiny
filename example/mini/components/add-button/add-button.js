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
      console.log('created', this.properties, this.data);
    },
    attached() {
      console.log('attached', this.properties, this.data);
    },
    ready() {
      console.log('ready', this.properties, this.data);
    },
    moved() {
      console.log('moved', this.properties);
    },
    detached() {
      console.log('detached', this.properties);
    },
  },

  pageLifetimes: {
    show: function() {
      // 页面显示时触发
      console.log('pageLifetimes show');
    },
    hide: function() {
      // 页面隐藏时触发
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
