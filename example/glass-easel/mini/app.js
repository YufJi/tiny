App({
  onLaunch() {
    if (wx.getStorageSync('todoMarker') === undefined) {
      wx.setStorageSync('todoMarker', 'fresh')
    }
  },
  onShow() {},
  onHide() {},
})
