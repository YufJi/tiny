/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-06-26 17:18:29
 */
const path = require('path');


const testSuit = {
  name: 'suit3',
  compilerConfig: {
    // cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    // cmd: ['-cc', '0', '-gn', '$gwx'],
    // cmd: ['-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './index.wxml',
      './log.wxml',
      './page.wxml',
      './template.wxml',
      './test1.wxml',
      './test2.wxml'
    ]
  },
  units: [
    {
      name: './index.wxml',
      renderPath: './index.wxml',
      renderData: function () {
        let env = {
          showOuterView: 1,
          innerView: 'innerView',
          innerTxt: '123',
          showOuterView1: 1,
          innerTxt1: 'innerTxt1',
          showOuterView2: 1,
          innerTxt2: 'innerTxt2',
          showOuterView3: 1,
          innerTxt3: 'innerTxt3',
          showOuterView4: 1,
          innerTxt4: 'innerTxt4',
          foo1: 1,
          foo2: 1,
          foo3: 1,
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