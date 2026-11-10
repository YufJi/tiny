Page({
  data: { title: 'Custom Tab home' },
  onShow() {
    this.getTabBar()?.setData({ selected: 0 })
  },
})
