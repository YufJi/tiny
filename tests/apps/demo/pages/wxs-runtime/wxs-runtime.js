Page({
  data: {
    value: 2,
    status: 'idle',
    useWxs: true,
    dynamicStatus: 'idle',
  },

  record(value) {
    this.setData({ status: String(value) })
  },

  recordDynamic(value) {
    this.setData({ dynamicStatus: String(value) })
  },

  serviceTap() {
    this.setData({ dynamicStatus: 'service' })
  },

  toggleUseWxs() {
    this.setData({ useWxs: !this.data.useWxs })
  },

  back() {
    wx.navigateBack()
  },
})
