const path = require('path');

const testSuit = {
  name: 'suit48',
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
    name: './index/index.wxml',
    renderPath: './index/index.wxml',
    renderData: function () {
      let env = {"src":{"__value__":"http://tmp/1108100302.285025525.XPEWj638DP4Q39c7c378cd4802ab557a1b7f60361194.jpg","__wxspec__":true}};
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
      let env = {"src":{"__value__":"http://tmp/1108100302.285025525.N5nS4v0tKi8K4ba9165fa85cdf083c21f08025321b3e.jpg","__wxspec__":true},"videoSrc":{"__value__":"http://tmp/1108100302.285025525.C4YkNBXxNFTS51fd0eeca02ee9e9e3fef90bd1c774d0.webm","__wxspec__":true}};
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