const IDS = ['image-default', 'image-fill', 'image-fit', 'image-width-fix']

Page({
  onReady() {
    setTimeout(() => {
      const query = this.createSelectorQuery()
      for (const id of IDS) query.select(`#${id}`).fields({ size: true, rect: true })
      query.exec((results) => {
        getApp().globalData.iconImageStyles = IDS.map((id, index) => ({
          key: id,
          ...(results?.[index] ?? {}),
        }))
        this.setData({ measured: IDS.length })
      })
    }, 100)
  },
})
