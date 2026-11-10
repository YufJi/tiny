Page({
  data: { title: 'Custom Tab settings' },
  onShow() {
    this.getTabBar()?.setData({ selected: 1 })
  },
})
