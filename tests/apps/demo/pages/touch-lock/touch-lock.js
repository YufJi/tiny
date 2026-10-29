Page({
  data: {
    innerTop: 0,
    rows: Array.from({ length: 40 }, (_, index) => index + 1),
    innerRows: Array.from({ length: 20 }, (_, index) => index + 1),
  },

  noop() {},

  onInnerScroll(event) {
    this.setData({ innerTop: Math.round(event.detail.scrollTop) })
  },
})
