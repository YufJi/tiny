function createKey() {
  return 'a:' + Date.now() + ':' + Math.random()
}

Page({
  data: {
    pageKey: '',
    eventStatus: 'idle'
  },

  onLoad() {
    this.setData({ pageKey: createKey() })
  },

  recordEventState(value) {
    this.setData({ eventStatus: String(value) })
  },

  toB() {
    wx.navigateTo({ url: '/pages/b/b' })
  },

  toFlow() {
    getApp().globalData.lifecycle = []
    wx.navigateTo({ url: '/pages/flow/flow' })
  },

  relaunch() {
    wx.reLaunch({ url: '/pages/a/a' })
  }
})
