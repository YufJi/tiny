Component({
  properties: {
    text: String
  },

  methods: {
    onClickMe() {
      this.triggerEvent('clickme')
    },
  },
});
