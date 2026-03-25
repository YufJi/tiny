const path = require('path');

const testSuit = {
  name: 'suit28',
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
      let env = {"background":["demo-text-1","demo-text-2","demo-text-3"],"indicatorDots":true,"vertical":false,"autoplay":false,"circular":false,"interval":2000,"duration":500,"previousMargin":0,"nextMargin":0};
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
      let env = {"background":["demo-text-1","demo-text-2","demo-text-3"],"indicatorDots":true,"vertical":true,"autoplay":true,"circular":true,"interval":2000,"duration":{"__value__":1023,"__wxspec__":true},"previousMargin":0,"nextMargin":0};
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
      let env = {"background":["demo-text-1","demo-text-2","demo-text-3"],"indicatorDots":true,"vertical":true,"autoplay":true,"circular":true,"interval":{"__value__":7712,"__wxspec__":true},"duration":1023,"previousMargin":0,"nextMargin":0};
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