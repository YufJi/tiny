Component({
  options: { virtualHost: true },
  properties: {
    label: { type: String, value: '' },
  },
  data: { innerSeen: 'idle' },
  methods: {
    onInner(event) {
      this.setData({ innerSeen: 'tap' })
      this.triggerEvent('inner', { id: event.currentTarget.id }, { bubbles: true, composed: true })
    },
  },
})
