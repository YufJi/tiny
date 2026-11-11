function createKey() {
  return 'b:' + Date.now() + ':' + Math.random()
}

Page({
  data: {
    pageKey: ''
  },

  onLoad() {
    this.setData({ pageKey: createKey() })
  },

  back() {
    wx.navigateBack()
  }
})
