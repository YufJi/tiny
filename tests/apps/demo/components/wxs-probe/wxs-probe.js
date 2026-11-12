Component({
  properties: {
    label: {
      type: String,
      value: '',
    },
  },

  data: {
    local: 'component-data',
    seen: 'idle',
    targetSeen: 'idle',
  },

  methods: {
    record(value) {
      this.setData({ seen: String(value) })
    },

    recordTarget(event) {
      this.setData({
        targetSeen: `${event.target.id}/${event.target.dataset.role}->${event.currentTarget.id}/${event.currentTarget.dataset.role}`,
      })
    },

    fire() {
      this.triggerEvent('probe', { value: this.data.label }, { bubbles: true, composed: true })
    },
  },
})
