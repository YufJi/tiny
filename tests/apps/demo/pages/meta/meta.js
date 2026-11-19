Page({
  data: {
    loading: false,
  },

  toggleLoading() {
    this.setData({ loading: !this.data.loading })
  },

  back() {
    wx.navigateBack()
  },
})
