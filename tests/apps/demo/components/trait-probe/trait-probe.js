const Feature = Behavior.trait(function (impl) {
  return {
    name: impl.name,
    upperName: function () {
      return impl.name.toUpperCase()
    },
    value: impl.value,
  }
})

const featureBehavior = Behavior({
  data: {
    behaviorValue: 1,
  },
}).implement(Feature, {
  name: 'probe',
  value: 7,
})

Component({
  behaviors: [featureBehavior],

  data: {
    traitText: 'idle',
  },

  lifetimes: {
    attached() {
      const impl = this.traitBehavior(Feature)
      this.setData({
        traitText: `trait:${impl.upperName()}:${impl.value}:${this.hasBehavior(Feature)}:${this.data.behaviorValue}`,
      })
    },
  },
})
