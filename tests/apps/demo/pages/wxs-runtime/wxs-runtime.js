Page({
  data: {
    value: 2,
    status: 'idle',
    useWxs: true,
    dynamicStatus: 'idle',
    childStatus: 'idle',
    parentStatus: 'idle',
    stopStatus: 'idle',
    stopParentStatus: 'idle',
    captureStatus: 'idle',
    captureParentStatus: 'idle',
    counterStatus: 'idle',
    stateStatus: 'idle',
    computedStatus: 'idle',
    useCounter: true,
  },

  record(value) {
    this.setData({ status: String(value) })
  },

  recordDynamic(value) {
    this.setData({ dynamicStatus: String(value) })
  },

  serviceTap() {
    this.setData({ dynamicStatus: 'service' })
  },

  onParentTap() {
    this.setData({ parentStatus: 'parent' })
  },

  recordChild(value) {
    this.setData({ childStatus: String(value) })
  },

  onStopParentTap() {
    this.setData({ stopParentStatus: 'parent' })
  },

  recordStop(value) {
    this.setData({ stopStatus: String(value) })
  },

  recordCaptureParent(value) {
    this.setData({ captureParentStatus: String(value) })
  },

  recordCapture(value) {
    this.setData({ captureStatus: String(value) })
  },

  recordCounter(value) {
    this.setData({ counterStatus: String(value) })
  },

  serviceCounter() {
    this.setData({ counterStatus: 'service' })
  },

  toggleCounterHandler() {
    this.setData({ useCounter: !this.data.useCounter })
  },

  recordState(value) {
    this.setData({ stateStatus: String(value) })
  },

  recordComputed(value) {
    this.setData({ computedStatus: String(value) })
  },

  toggleUseWxs() {
    this.setData({ useWxs: !this.data.useWxs })
  },

  back() {
    wx.navigateBack()
  },
})
