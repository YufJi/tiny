/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-06-27 23:21:38
 */
const path = require('path');

const testSuit = {
  name: 'suit1',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index.wxml'
    ]
  },
  units:[
    {
      name: './index.wxml',
      renderPath: './index.wxml',
      renderData: function(){
        let env = {
          arr: [{
            key: 'key1',
            value: 'value1'
          }, {
            key: 'key2',
            value: 'value2'
          }, {
            key: 'key3',
            value: 'value3'
          }, {
            key: 'key4',
            value: 'value4'
          }],
          hello: 'i am good',
          name: '250',
          good: 'good'
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