/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-06-26 17:18:40
 */
const path = require('path');

const testSuit = {
  name: 'suit4',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index.wxml',
      './template.wxml',
      './test.wxml',
      './log.wxml'
    ]
  },
  units: [
    {
      name: './index.wxml',
      renderPath: './index.wxml',
      renderData: function () {
        let env = {
          item: {
            index: 0,
            msg: 'this is a template',
            time: '2016-09-15'
          },
          log: {
            name: 'test'
          }
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