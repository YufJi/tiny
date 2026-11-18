Page({
  data: {
    width: 40,
    status: 'idle',
    onLoadReady: -1,
    probeReady: 0,
    probeWidth: 0,
    rpxWidth: 100,
    markStatus: 'idle',
    slowStatus: 'idle',
    longStatus: 'idle',
  },

  onLoad() {
    // `ready` is deferred until the pageframe mounted the page, so onLoad must
    // still observe the component before its ready callback ran.
    const probe = this.selectComponent('#probe')
    this.setData({ onLoadReady: probe?.data?.readyCount ?? 0 })
  },

  onMark(event) {
    this.setData({
      markStatus: `${event.mark?.from ?? '-'}/${event.mark?.role ?? '-'}`,
    })
  },

  onSlowTap() {
    this.setData({ slowStatus: 'tap' })
  },

  onLongPress() {
    this.setData({ longStatus: 'press' })
  },

  onProbeReady(event) {
    this.setData({
      probeReady: event.detail.count,
      probeWidth: event.detail.width,
    })
  },

  bump() {
    this.setData({ width: 120 }, () => {
      this.createSelectorQuery()
        .select('#box')
        .boundingClientRect((rect) => {
          this.setData({ status: `width:${Math.round(rect?.width ?? 0)}` })
        })
        .exec()
    })
  },

  back() {
    wx.navigateBack()
  },
})
