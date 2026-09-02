Component({
  data: {
    from: '',
    inputValue: '',
  },
  lifetimes: {
    onLoad(query) {
      this.setData({ from: query.from })
    },
    attached() {},
    ready() {},
  },
  pageLifetimes: {
    show() {},
    hide() {},
  },
  methods: {
    onInput(event) {
      this.setData({ inputValue: event.detail.value })
    },
    save() {
      wx.setStorageSync('todoMarker', this.data.inputValue || 'saved')
      wx.showToast({ title: 'Saved' })
      wx.navigateBack()
    },
  },
})
