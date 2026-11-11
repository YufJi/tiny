Page({
  data: {
    showHost: true,
    showChild: true,
    showInner: true,
    lifecycle: ''
  },

  onLoad() {
    this._flushScheduled = false
  },

  flushLifecycle() {
    if (this._flushScheduled) return
    this._flushScheduled = true
    setTimeout(() => {
      this._flushScheduled = false
      this.setData({
        lifecycle: getApp().globalData.lifecycle.join('|')
      })
    }, 0)
  },

  toggleChild() {
    this.setData({ showChild: !this.data.showChild })
  },

  toggleInner() {
    this.setData({ showInner: !this.data.showInner })
  },

  toggleHost() {
    this.setData({ showHost: !this.data.showHost })
  },

  back() {
    wx.navigateBack()
  }
})
