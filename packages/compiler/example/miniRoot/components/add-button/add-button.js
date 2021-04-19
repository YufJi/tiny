Component({
  properties: {
    text: '我是text',
  },

  methods: {
    onClickMe() {
      console.log('button click');
      // this.props.onClickMe();
      // this.triggerEvent('clickme')
    },
  },
});
