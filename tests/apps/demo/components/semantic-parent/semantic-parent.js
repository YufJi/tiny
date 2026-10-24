Component({
  data: {
    linked: 0,
  },
  relations: {
    '../semantic-child/semantic-child': {
      type: 'child',
      linked() {
        this.setData({ linked: this.data.linked + 1 })
      },
      unlinked() {
        this.setData({ linked: Math.max(0, this.data.linked - 1) })
      },
    },
  },
})
