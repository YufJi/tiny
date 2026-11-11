const app = getApp();
let exitStateAtLoad = '';

Component({
  data: {
    inputValue: '',
    exitStateDraft: '',
  },

  methods: {
    onLoad() {
      const draft = this.exitState && this.exitState.draft;
      exitStateAtLoad = typeof draft === 'string' ? draft : '';
      if (typeof draft === 'string' && draft) {
        this.setData({
          inputValue: draft,
          exitStateDraft: draft,
        });
      }
    },

    showExitStateAtLoad() {
      this.setData({
        exitStateDraft: exitStateAtLoad,
      });
    },

    onSaveExitState() {
      return {
        draft: this.data.inputValue,
      };
    },

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
  },

});
