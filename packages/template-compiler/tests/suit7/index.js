/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-06-26 17:18:59
 */
const path = require('path');

const testSuit = {
  name: 'suit7',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index.wxml'
    ]
  },
  units: [
    {
      name: './index.wxml',
      renderPath: './index.wxml',
      renderData: function () {
        let env = {
          defaultSize: 'default',
          primarySize: 'default',
          warnSize: 'default',
          disabled: false,
          plain: false,
          loading: false
        };
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