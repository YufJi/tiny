const themeListeners = []

const systemInfo = wx.getSystemInfoSync()

App({
  globalData: {
    theme: 'light',
    system: 'devtools',
    statusBarHeight: 20,
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    hasLogin: false,
    openid: null,
    systemInfo: {},
  },

  onLaunch() {},
  onShow() {},
  onHide() {},

  onThemeChange({ theme }) {
    this.globalData.theme = theme
    themeListeners.forEach((listener) => listener(theme))
  },
  watchThemeChange(listener) {
    if (themeListeners.indexOf(listener) < 0) themeListeners.push(listener)
  },
  unWatchThemeChange(listener) {
    const index = themeListeners.indexOf(listener)
    if (index > -1) themeListeners.splice(index, 1)
  },
})
