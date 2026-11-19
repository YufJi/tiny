const CONTROL_IDS = [
  'input-placeholder',
  'input-value',
  'input-password',
  'input-disabled',
  'input-style',
  'textarea-placeholder',
  'textarea-value',
  'textarea-auto',
  'textarea-disabled',
]

const PROPS = [
  'display',
  'width',
  'height',
  'min-height',
  'font-family',
  'font-size',
  'line-height',
  'color',
  'background-color',
  'border-top-width',
  'border-top-color',
  'box-sizing',
  'overflow',
  'white-space',
  'position',
  'padding-top',
  'padding-left',
]

Page({
  onReady() {
    setTimeout(() => {
      const query = this.createSelectorQuery()
      for (const id of CONTROL_IDS) {
        query.select(`#${id}`).fields({
          dataset: true,
          size: true,
          rect: true,
          computedStyle: PROPS,
        })
      }
      query.exec((results) => {
        getApp().globalData.inputStyles = CONTROL_IDS.map((id, index) => ({
          key: id,
          ...(results?.[index] ?? {}),
        }))
        this.setData({ measured: CONTROL_IDS.length })
      })
    }, 50)
  },
})
