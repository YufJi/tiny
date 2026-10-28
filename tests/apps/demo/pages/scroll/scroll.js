Page({
  data: {
    scrollTop: 0,
    rows: Array.from({ length: 24 }, (_, index) => index + 1),
  },

  onPageScroll(event) {
    this.setData({ scrollTop: event.scrollTop })
  },
})
