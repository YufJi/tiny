Component({
  data: {
    linked: 0,
  },
  relations: {
    '../semantic-parent/semantic-parent': {
      type: 'parent',
      linked() {
        this.setData({ linked: 1 })
      },
      unlinked() {
        this.setData({ linked: 0 })
      },
    },
  },
})
