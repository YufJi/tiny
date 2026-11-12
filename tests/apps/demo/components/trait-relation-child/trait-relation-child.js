const { ParentFeature, ChildFeature } = require('../trait-relation-shared')

const childBehavior = Behavior({
  relations: {
    parent: {
      type: 'ancestor',
      target: ParentFeature,
    },
  },
}).implement(ChildFeature, {
  name: 'child',
})

Component({
  behaviors: [childBehavior],
})
