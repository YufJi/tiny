const COMPUTED_STYLE_PROPS = [
  'display',
  'width',
  'height',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'font-size',
  'font-family',
  'font-weight',
  'line-height',
  'color',
  'background-color',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-top-color',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'box-sizing',
  'text-align',
  'white-space',
  'overflow',
]

Page({
  onReady() {
    setTimeout(() => {
      this.createSelectorQuery()
        .selectAll('.case')
        .fields({
          dataset: true,
          size: true,
          rect: true,
          computedStyle: COMPUTED_STYLE_PROPS,
        })
        .exec((result) => {
          const styles = Array.isArray(result?.[0]) ? result[0] : []
          getApp().globalData.buttonStyles = styles
          this.setData({ measured: styles.length })
        })
    }, 50)
  },
})
