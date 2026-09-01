Component({
  properties: {
    text: { type: String, value: '' },
  },
  methods: {
    select() {
      this.triggerEvent('select', { text: this.data.text })
    },
  },
})
