Component({
  data: {
    from: '',
    inputValue: '',
    opener: '',
  },
  lifetimes: {
    onLoad(query) {
      this.setData({ from: query.from })
      // Pages opened by navigateTo get a working EventChannel; any other route
      // yields an empty object, so feature-detect like a real mini program.
      const channel = this.getOpenerEventChannel()
      if (channel && channel.on) {
        channel.on('fromOpener', (payload) => this.setData({ opener: `marker:${payload.marker}` }))
        channel.on('fromProbe', (payload) => this.setData({ opener: `probe:${payload.probe}` }))
      }
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
      const text = this.data.inputValue || 'saved'
      wx.setStorageSync('todoMarker', text)
      // Page -> opener half of the channel; the opener's `events` handler runs
      // in the service realm even though this page is about to unload.
      const channel = this.getOpenerEventChannel()
      if (channel && channel.emit) channel.emit('todoSaved', { text })
      wx.showToast({ title: 'Saved' })
      wx.navigateBack()
    },
  },
})
