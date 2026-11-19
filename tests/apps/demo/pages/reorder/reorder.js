Page({
  data: {
    items: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
    status: 'idle',
  },

  onTap(event) {
    this.setData({
      status: `${event.target.id}:${event.target.dataset.id}:${event.currentTarget.dataset.index}`,
    })
  },

  rotate() {
    const items = this.data.items
    this.setData({ items: items.slice(1).concat(items[0]) })
  },

  back() {
    wx.navigateBack()
  },
})
