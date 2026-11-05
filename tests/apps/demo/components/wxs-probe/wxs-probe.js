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
  },

  methods: {
    record(value) {
      this.setData({ seen: String(value) })
    },

    fire() {
      this.triggerEvent('probe', { value: this.data.label }, { bubbles: true, composed: true })
    },
  },
})
