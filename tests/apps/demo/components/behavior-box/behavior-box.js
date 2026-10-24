const behavior = Behavior({
  data: {
    behaviorData: 'from-behavior',
    behaviorAttached: false,
    behaviorObserved: '',
  },
  methods: {
    behaviorMethod() {
      return `behavior:${this.data.value}`
    },
  },
  lifetimes: {
    attached() {
      this.setData({ behaviorAttached: true })
    },
  },
  observers: {
    value(value) {
      this.setData({ behaviorObserved: `behavior-obs:${value}` })
    },
  },
})

Component({
  behaviors: [behavior],
  properties: {
    value: {
      type: String,
      value: '',
      observer: 'onValueChanged',
    },
  },
  data: {
    propertyObserved: '',
    boxObserved: '',
  },
  observers: {
    value(value) {
      this.setData({ boxObserved: `box-obs:${value}` })
    },
  },
  methods: {
    onValueChanged(value, oldValue) {
      this.setData({ propertyObserved: `${value}:${oldValue}` })
    },
    probe() {
      return 'probe-ok'
    },
  },
})
