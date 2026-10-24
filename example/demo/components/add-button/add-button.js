Component({
  properties: {
    text: { type: String, value: 'Add' },
  },
  methods: {
    onClickMe() {
      this.triggerEvent('custom', { text: this.data.text }, { bubbles: true, composed: true })
    },
  },
})
