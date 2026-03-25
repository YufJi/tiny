const path = require('path');

const testSuit = {
  name: 'suit22',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index/index.wxml',
      './components/component-tag-name.wxml',
    ]
  },
  units: [{
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {}
  },
  {
    name: './components/component-tag-name.wxml',
    renderPath: './components/component-tag-name.wxml',
    renderData: function () {
      let env = {"myBehaviorData":{},"myData":{},"myBehaviorProperty":{"__value__":"behavior-property","__wxspec__":true},"myProperty":{"__value__":"my-property","__wxspec__":true}};
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    global: {}
  }
]
};

module.exports = testSuit;