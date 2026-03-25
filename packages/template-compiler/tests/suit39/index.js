const path = require('path');

const testSuit = {
  name: 'suit39',
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
      let env = {"checkboxItems":[{"name":"USA","value":"美国"},{"name":"CHN","value":"中国","checked":"true"},{"name":"BRA","value":"巴西"},{"name":"JPN","value":"日本","checked":"true"},{"name":"ENG","value":"英国"},{"name":"TUR","value":"法国"}],"radioItems":[{"name":"USA","value":"美国"},{"name":"CHN","value":"中国","checked":"true"},{"name":"BRA","value":"巴西"},{"name":"JPN","value":"日本"},{"name":"ENG","value":"英国"},{"name":"TUR","value":"法国"}],"hidden":false};
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
      let env = {"checkboxItems":[{"name":"USA","value":"美国","checked":false},{"name":"CHN","value":"中国","checked":true},{"name":"BRA","value":"巴西","checked":false},{"name":"JPN","value":"日本","checked":true},{"name":"ENG","value":"英国","checked":true},{"name":"TUR","value":"法国","checked":true}],"radioItems":[{"name":"USA","value":"美国","checked":{"__value__":false,"__wxspec__":true}},{"name":"CHN","value":"中国","checked":{"__value__":false,"__wxspec__":true}},{"name":"BRA","value":"巴西","checked":{"__value__":false,"__wxspec__":true}},{"name":"JPN","value":"日本","checked":{"__value__":true,"__wxspec__":true}},{"name":"ENG","value":"英国","checked":{"__value__":false,"__wxspec__":true}},{"name":"TUR","value":"法国","checked":{"__value__":false,"__wxspec__":true}}],"hidden":false};
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