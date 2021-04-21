Component({
  properties: {
    text: {
      type: String,
      value: 'sdas'
    }

  },

  data: {
    text: 'jyf',
    name: 'xxxxx',
  },

  methods: {
    onClickMe() {
      this.setData({
        text: 'xhq'
      })
      console.log('properties',this.properties);
      this.triggerEvent('clickme')
    },
  },
});
