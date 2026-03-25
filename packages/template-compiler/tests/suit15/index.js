/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-06-26 17:19:48
 */
 const path = require('path');

 const testSuit = {
   name: 'suit15',
   compilerConfig: {
     cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
     'FILESBASE': path.join(__dirname, './proj'),
     outputDir: path.join(__dirname, './out'),
     'FILES': [
       './page/index/index.wxml'
     ]
   },
   units: [{
     name: './page/index/index.wxml',
     renderPath: './page/index/index.wxml',
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
     global: {},
     console: {
       log: true,
       error: true,
       warn: true
     },
     silentLog: true
 
   }
 ]
 };
 
 module.exports = testSuit;