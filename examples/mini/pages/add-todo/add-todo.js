const app = getApp();

Component({
  data: {
    inputValue: '',
    info: { name: 'test', age: 11 },
    xxx: 'xxx'
  },

  methods: {
    onBlur(e) {
      console.log('onBlur');
      this.setData({
        inputValue: e.detail.value,
      });
    },

    onInput(e) {
      console.log(e, 'onInput');

      this.setData({
        inputValue: e.detail.value,
      });
    },

    add() {
      app.todos = app.todos.concat([
        {
          text: this.data.inputValue,
          compeleted: false,
        },
      ]);

      wx.navigateBack();
    },
    xxxx() {
      console.log('xxxx');
    },

    cad() {
      console.log('cad');
    },
  },

});
