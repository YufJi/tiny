Page({
  data: {
    value: 2,
    status: 'idle',
  },

  record(value) {
    this.setData({ status: String(value) })
  },

  back() {
    wx.navigateBack()
  },
})
