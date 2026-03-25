/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-06-26 21:15:26
 */
const path = require('path');

const testSuit = {
  name: 'suit71',
  compilerConfig: {
    cmd: ['-d', '-cc', '-ds', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index.wxml',
      './tools.wxs',
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