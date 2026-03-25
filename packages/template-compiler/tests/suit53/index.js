const path = require('path');

const testSuit = {
  name: 'suit53',
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
      let env = {"latitude":23.099994,"longitude":113.32452,"markers":[{"id":1,"latitude":23.099994,"longitude":113.32452,"name":"T.I.T 创意园"}],"covers":[{"latitude":23.099994,"longitude":113.34452,"iconPath":"/image/location.png"},{"latitude":23.099994,"longitude":113.30452,"iconPath":"/image/location.png"}]};
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