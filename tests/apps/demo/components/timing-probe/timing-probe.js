Component({
  data: {
    readyCount: 0,
    rectWidth: 0,
  },

  ready() {
    // `ready` must run after the pageframe rendered the page: the selector
    // query below only sees layout when the first render pass already happened.
    this.createSelectorQuery()
      .select('#probe-box')
      .boundingClientRect((rect) => {
        const width = Math.round(rect?.width ?? 0)
        this.setData({ readyCount: 1, rectWidth: width })
        // Report through the page so the acceptance assertion reads page text
        // (component shadow text is not part of the page frame's innerText).
        this.triggerEvent('ready-rect', { count: 1, width })
      })
      .exec()
  },
})
