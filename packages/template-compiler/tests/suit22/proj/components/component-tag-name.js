// components/component-tag-name.js
var myBehavior = require('my-behavior')
Component({
  behaviors: [myBehavior],
  properties: {
    myProperty: {
      type: String
    }
  },
  data: {
    myData: {}
  },
  attached: function () { },
  methods: {
    myMethod: function () { },
  }
})
