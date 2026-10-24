Page({
  data: {
    value: 'first',
    probe: '',
    showChild: true,
  },

  onReady() {
    const box = this.selectComponent('#behavior-box')
    this.setData({
      probe: box && typeof box.probe === 'function' ? box.probe() : 'missing',
    })
  },

  changeValue() {
    this.setData({ value: this.data.value === 'first' ? 'second' : 'first' })
  },

  toggleChild() {
    this.setData({ showChild: !this.data.showChild })
  },

  back() {
    wx.navigateBack()
  },
})
