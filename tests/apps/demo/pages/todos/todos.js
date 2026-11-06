Page({
  data: {
    marker: 'fresh',
    customDetail: '',
    savedText: '',
    system: {},
    todos: [
      { text: 'Learn glass-easel', completed: true },
      { text: 'Run P0 acceptance', completed: false },
    ],
    sliderValue: 20,
    switchChecked: false,
    background: ['first', 'second'],
  },

  onLoad() {
    this.setData({
      marker: wx.getStorageSync('todoMarker'),
      system: wx.getSystemInfoSync(),
    })
  },

  onShow() {
    const marker = wx.getStorageSync('todoMarker')
    if (marker) this.setData({ marker })
  },

  openAddTodo() {
    // `pageRouter` keeps the base at this page; the `events` handler receives
    // what the opened page emits, and `success` gets the opener channel side.
    this.pageRouter.navigateTo({
      url: '../add-todo/add-todo?from=todos',
      events: {
        todoSaved: (payload) => {
          this.setData({ savedText: payload.text })
        },
      },
      success: (result) => {
        result.eventChannel.emit('fromOpener', { marker: this.data.marker })
      },
    })
  },

  openRouterPage() {
    this.pageRouter.navigateTo({ url: '../router/router?from=page-router' })
  },

  openScrollPage() {
    wx.navigateTo({ url: '../scroll/scroll' })
  },

  openTouchLock() {
    wx.navigateTo({ url: '../touch-lock/touch-lock' })
  },

  openWxsRuntime() {
    wx.navigateTo({ url: '../wxs-runtime/wxs-runtime' })
  },

  onCustom(event) {
    this.setData({ customDetail: event.detail.text })
  },

  onCheckboxChange(event) {
    this.setData({ checkedValues: event.detail.value })
  },

  onSliderChange(event) {
    this.setData({ sliderValue: event.detail.value })
  },

  onSwitchChange(event) {
    this.setData({ switchChecked: event.detail.value })
  },

  showToast() {
    wx.showToast({ title: 'P0 ready' })
  },

  openSemantics() {
    wx.navigateTo({ url: '../semantics/semantics' })
  },
})
