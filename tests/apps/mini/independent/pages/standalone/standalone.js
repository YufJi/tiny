Page({
  data: {
    app: 'unknown',
  },
  onLoad() {
    this.setData({
      app: getApp() ? 'app' : 'no-app',
    })
  },
})
