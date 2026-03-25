const path = require('path');

const testSuit = {
  name: 'suit32',
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
      let env = {"html":"<div class=\"div_class\" style=\"line-height: 60px; color: red;\">Hello&nbsp;World!</div>","nodes":[{"name":"div","attrs":{"class":"div_class","style":"line-height: 60px; color: red;"},"children":[{"type":"text","text":"Hello&nbsp;World!"}]}]};
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