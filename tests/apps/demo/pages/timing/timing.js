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
    copyStatus: 'idle',
    groupStatus: 'idle',
    animStatus: 'idle',
    animationData: {},
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

  onAnimate() {
    const animation = wx.createAnimation({
      duration: 0,
      timingFunction: 'linear',
    })
    animation.scale(2, 2).rotate(90).step()
    this.setData({ animationData: animation.export(), animStatus: 'running' })
  },

  onCopy() {
    // The caller mutates its object after setData; the view data must keep the
    // value it was given (WeChat's dataDeepCopy: simple).
    const shared = { nested: { n: 1 } }
    this.setData({ copyValue: shared })
    shared.nested.n = 2
    const date = new Date(0)
    this.setData({ copyDate: date })
    const outer = this
    this.groupSetData(function () {
      this.setData({
        copyStatus: [
          this.data.copyValue.nested.n,
          this.data.copyDate instanceof Date,
          this === outer,
        ].join('/'),
        groupStatus: 'ok',
      })
    })
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
