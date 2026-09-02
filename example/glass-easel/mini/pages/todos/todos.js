Page({
  data: {
    marker: 'fresh',
    customDetail: '',
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

  openAddTodo() {
    wx.navigateTo({ url: '../add-todo/add-todo?from=todos' })
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
})
