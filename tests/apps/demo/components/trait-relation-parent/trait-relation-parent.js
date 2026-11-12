const { ParentFeature, ChildFeature } = require('../trait-relation-shared')

const parentBehavior = Behavior({
  relations: {
    child: {
      type: 'descendant',
      target: ChildFeature,
      linked(target) {
        const impl = target.traitBehavior(ChildFeature)
        this.setData({ relationText: `relation:${impl.upperName()}` })
      },
    },
  },
}).implement(ParentFeature, {
  name: 'parent',
})

Component({
  behaviors: [parentBehavior],

  data: {
    relationText: 'idle',
  },
})
