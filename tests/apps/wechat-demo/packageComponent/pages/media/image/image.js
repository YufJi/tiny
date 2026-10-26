Page({
  onShareAppMessage() {
    return {
      title: 'image',
      path: 'packageComponent/pages/media/image/image'
    }
  },
  onUnload() {
    if (wx.offThemeChange) {
      wx.offThemeChange()
    }
  },
  onLoad() {
    this.setData({
      theme: getApp().globalData.theme || 'light'
    })

    if (wx.onThemeChange) {
      wx.onThemeChange(({ theme }) => {
        this.setData({ theme })
      })
    }
  },
  data: {
    theme: 'light',
    imageUrl: 'cloud://release-b86096.7265-release-b86096-1258211818/demo.jpg',
    webpImageUrl: 'https://res.wx.qq.com/wxdoc/dist/assets/img/0.4cb08bb4.jpg',
  }
})
