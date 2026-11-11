function record(entry) {
  getApp().recordLifecycle(entry)
}

Component({
  properties: {
    relationTag: {
      type: String,
      value: 'unknown'
    }
  },

  relations: {
    '../flow-host/flow-host': {
      type: 'ancestor',
      linked() {
        record('C+' + this.data.relationTag)
      },
      unlinked() {
        record('C-' + this.data.relationTag)
      }
    }
  },

  lifetimes: {
    created() {
      record('C.created')
    },
    attached() {
      record('C.' + this.data.relationTag + '.attached')
    },
    ready() {
      record('C.ready')
    },
    moved() {
      record('C.' + this.data.relationTag + '.moved')
    },
    detached() {
      record('C.' + this.data.relationTag + '.detached')
    }
  }
})
