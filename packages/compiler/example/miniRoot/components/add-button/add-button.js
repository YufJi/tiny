Component({
  properties: {
    text: {
      type: String,
      value: 'sdas'
    }

  },

  data: {
    // text: 'jyf',
    name: 'xxxxx',
  },

  methods: {
    onClickMe() {
      this.triggerEvent('clickme')
    },
  },
});
