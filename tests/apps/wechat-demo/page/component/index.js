Page({
  onLoad() {
    this.setData({
      theme: wx.getSystemInfoSync().theme || 'light'
    })

    if (wx.onThemeChange) {
      wx.onThemeChange(({ theme }) => {
        this.setData({ theme })
      })
    }
  },
  onShow() {
    wx.reportAnalytics('enter_home_programmatically', {})
  },
  onUnload() {
    if (wx.offThemeChange) {
      wx.offThemeChange()
    }
  },
  onShareAppMessage() {
    return {
      title: '小程序官方组件展示',
      path: 'page/component/index'
    }
  },
  onShareTimeline() {
    '小程序官方组件展示'
  },

  data: {
    list: [
      {
        id: 'view',
        name: '视图容器',
        open: false,
        pages: ['view', 'swiper', 'scroll-view', 'movable-view', 'cover-view']
      }, {
        id: 'content',
        name: '基础内容',
        open: false,
        pages: ['text', 'icon', 'progress', 'rich-text', 'selection']
      }, {
        id: 'form',
        name: '表单组件',
        open: false,
        pages: ['button', 'checkbox', 'form', 'input', 'label', 'picker', 'picker-view', 'radio', 'slider', 'switch', 'textarea', 'editor']
      }, {
        id: 'nav',
        name: '导航',
        open: false,
        pages: ['navigator']
      }, {
        id: 'media',
        name: '媒体组件',
        open: false,
        pages: ['image', 'video', 'camera', 'live-pusher', 'live-player', 'channel-live', 'channel-video']
      }, {
        id: 'map',
        name: '地图',
        open: false,
        pages: ['map', { appid: 'wxe3f314db2e921db0', name: '腾讯位置服务示例中心' }]
      }, {
        id: 'canvas',
        name: '画布',
        open: false,
        pages: ['canvas-2d', 'webgl']
      }, {
        id: 'open',
        name: '开放能力',
        open: false,
        pages: ['ad', 'open-data', 'web-view']
      }, {
        id: 'obstacle-free',
        name: '无障碍访问',
        open: false,
        pages: ['aria-component']
      }
    ],
    theme: 'light'
  },

  kindToggle(e) {
    const id = e.currentTarget.id
    const list = this.data.list
    for (let i = 0, len = list.length; i < len; ++i) {
      if (list[i].id === id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list
    })
    wx.reportAnalytics('click_view_programmatically', {})
  },

  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    if (url) wx.navigateTo({ url })
  },

  navToDoc(e) {
    wx.navigateTo({
      url: '/packageComponent/pages/doc-web-view/doc-web-view',
    })
  },

})
