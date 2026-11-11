App({
  globalData: {
    lifecycle: []
  },

  recordLifecycle(entry) {
    this.globalData.lifecycle.push(entry)
    const pages = getCurrentPages()
    const page = pages[pages.length - 1]
    if (page && typeof page.flushLifecycle === 'function') {
      page.flushLifecycle()
    }
  }
})
