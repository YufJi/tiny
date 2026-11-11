function record(entry) {
  getApp().recordLifecycle(entry)
}

Component({
  properties: {
    inner: {
      type: Boolean,
      value: true
    }
  },

  relations: {
    '../flow-child/flow-child': {
      type: 'descendant',
      linked(target) {
        record('H+' + target.data.relationTag)
      },
      unlinked(target) {
        record('H-' + target.data.relationTag)
      }
    }
  },

  lifetimes: {
    created() {
      record('H.created')
    },
    attached() {
      record('H.attached')
    },
    ready() {
      record('H.ready')
    },
    detached() {
      record('H.detached')
    }
  }
})
