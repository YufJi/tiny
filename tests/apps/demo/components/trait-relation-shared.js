const ParentFeature = Behavior.trait(function (impl) {
  return {
    name: impl.name,
    upperName: function () {
      return impl.name.toUpperCase()
    },
  }
})

const ChildFeature = Behavior.trait(function (impl) {
  return {
    name: impl.name,
    upperName: function () {
      return impl.name.toUpperCase()
    },
  }
})

module.exports = {
  ParentFeature,
  ChildFeature,
}
