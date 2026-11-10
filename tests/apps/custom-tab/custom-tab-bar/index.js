Component({
  data: { selected: 0 },
  methods: {
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index)
      this.setData({ selected: index })
      wx.switchTab({ url: index === 0 ? '/pages/home/home' : '/pages/settings/settings' })
    },
  },
})
