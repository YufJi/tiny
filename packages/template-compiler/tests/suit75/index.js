const path = require('path');

const testSuit = {
  name: 'suit75',
  compilerConfig: {
    cmd: ['-d', '-cc', '-ds', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index.wxml'
    ]
  },
  units: [{
    name: './index.wxml',
    renderPath: './index.wxml',
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
  }]
};

module.exports = testSuit;