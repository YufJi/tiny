Component({
  properties: {
    text: {
      type: String,
      value: 'oooooo',
    },
  },

  data: {
    name: 'xxxxx',
  },

  lifetimes: {
    created() {
      console.log('created', this, this.data);
    },
    attached() {
      console.log('attached', this, this.data);
    },
    ready() {
      console.log('ready', this, this.data);

      console.log(this.properties)

      // this.setData({
      //   text: 'jjjjjjjjj'
      // })


      setTimeout(() => {
        console.log(this.properties)
      }, 2000)
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
