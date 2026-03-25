const path = require('path');

const testSuit = {
  name: 'suit35',
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
      let env = {"items":[{"name":"USA","value":"美国"},{"name":"CHN","value":"中国","checked":"true"},{"name":"BRA","value":"巴西"},{"name":"JPN","value":"日本"},{"name":"ENG","value":"英国"},{"name":"TUR","value":"法国"}]};
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