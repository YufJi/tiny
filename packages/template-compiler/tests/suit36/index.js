const path = require('path');

const testSuit = {
  name: 'suit36',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './editor/editor.wxml',
      './common/foot.wxml',
      './common/head.wxml'
    ]
  },
  units: [{
    name: './editor/editor.wxml',
    renderPath: './editor/editor.wxml',
    renderData: function () {
      let env = {"formats":{},"bottom":0,"readOnly":false,"placeholder":"开始输入...","_focus":false};
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