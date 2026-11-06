Page({
  data: {
    route: '',
    options: '',
    sameRouter: '',
  },

  onLoad() {
    // WeChat exposes the page path and query on the page instance; the router
    // pair is one object per page, so `this.router === this.pageRouter` here.
    this.setData({
      route: this.route,
      options: JSON.stringify(this.options),
      sameRouter: String(this.router === this.pageRouter),
    })
  },

  goBack() {
    this.router.navigateBack()
  },
})
