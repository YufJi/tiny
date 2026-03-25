const path = require('path');

const testSuit = {
  name: 'suit16',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './page/comm.wxs',
      './page/index/index.wxml'
    ]
  },
  units: [{
    name: './page/index/index.wxml',
    renderPath: './page/index/index.wxml',
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
    global: {},
    console: {
      log: true,
      error: true,
      warn: true
    },
    silentLog: true

  }]
};

module.exports = testSuit;