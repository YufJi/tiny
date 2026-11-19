Page({
  data: {
    vhInnerEvent: 'idle',
  },

  onVhInnerEvent(event) {
    this.setData({ vhInnerEvent: event.detail.id })
  },

  back() {
    wx.navigateBack()
  },
})
