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
  },
})
