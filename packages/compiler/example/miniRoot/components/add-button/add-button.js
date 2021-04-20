Component({
  properties: {
    text: String
  },

  data: {
    text: 'jyf',
    name: 'xxxxx',
  },

  methods: {
    onClickMe() {
      console.log(this.properties, this.data)
      this.triggerEvent('clickme')
      // this.properties.onclickme();
    },
  },
});
