const initialItems = [
  { key: 'a' },
  { key: 'b' },
  { key: 'c' }
]

Page({
  data: {
    items: initialItems,
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

  reverse() {
    this.setData({ items: [...this.data.items].reverse() })
  },

  rotate() {
    const items = [...this.data.items]
    const first = items.shift()
    if (first) items.push(first)
    this.setData({ items })
  },

  back() {
    wx.navigateBack()
  }
})
