const path = require('path');

const testSuit = {
  name: 'suit24',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index/custom-checkbox.wxml',
      './index/custom-radio.wxml',
      './index/index.wxml',
      './index/selectable-group.wxml'
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
    name: './index/selectable-group.wxml',
    renderPath: './index/selectable-group.wxml',
    renderData: function () {
      let env = {"labels":[1,2,3],"selected":[false,false,false]};
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
    name: './index/selectable-group.wxml',
    renderPath: './index/selectable-group.wxml',
    renderData: function () {
      let env = {"labels":[1,2,3],"selected":{"__value__":[false,false,true],"__wxspec__":true}};
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