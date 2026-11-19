const CONTROL_IDS = [
  'switch-basic',
  'switch-checked',
  'switch-disabled',
  'checkbox-basic',
  'checkbox-checked',
  'checkbox-disabled',
  'radio-basic',
  'radio-checked',
  'radio-disabled',
  'slider-basic',
  'slider-checked',
  'slider-disabled',
]

const PROPS = [
  'display',
  'width',
  'height',
  'background-color',
  'border-top-width',
  'border-top-color',
  'border-top-left-radius',
  'color',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'position',
  'transform',
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
        getApp().globalData.formControlHosts = CONTROL_IDS.map((id, index) => ({
          key: id,
          ...(results?.[index] ?? {}),
        }))
        this.setData({ measured: CONTROL_IDS.length })
      })
    }, 50)
  },
})
