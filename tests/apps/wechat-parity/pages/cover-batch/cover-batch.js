Page({
  onReady() {
    setTimeout(() => {
      const query = this.createSelectorQuery()
      for (const id of ['cover-view', 'cover-image', 'match-yes', 'match-no', 'root-portal', 'portal-content']) {
        query.select(`#${id}`).fields({ size: true, rect: true })
      }
      query.exec((results) => {
        getApp().globalData.coverBatchStyles = ['cover-view', 'cover-image', 'match-yes', 'match-no', 'root-portal', 'portal-content']
          .map((id, index) => ({ key: id, ...(results?.[index] ?? {}) }))
        this.setData({ measured: results?.length ?? 0 })
      })
    }, 100)
  },
})
