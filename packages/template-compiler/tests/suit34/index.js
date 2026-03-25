const path = require('path');

const testSuit = {
  name: 'suit34',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index/index.wxml'
    ]
  },
  units: [{
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {"defaultSize":"default","primarySize":"default","warnSize":"default","disabled":false,"plain":false,"loading":false};
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
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {"defaultSize":"default","primarySize":"mini","warnSize":"default","disabled":false,"plain":false,"loading":{"__value__":true,"__wxspec__":true}};
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
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {"defaultSize":"default","primarySize":"mini","warnSize":"default","disabled":false,"plain":{"__value__":true,"__wxspec__":true},"loading":true};
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
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {"defaultSize":"default","primarySize":"mini","warnSize":"default","disabled":{"__value__":true,"__wxspec__":true},"plain":true,"loading":true};
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