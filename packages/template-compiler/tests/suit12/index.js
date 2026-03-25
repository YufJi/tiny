/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-06-26 17:19:31
 */
const path = require('path');

const testSuit = {
  name: 'suit12',
  compilerConfig: {
    cmd: ['-d', '-cc', '0', '-gn', '$gwx'],
    'FILESBASE': path.join(__dirname, './proj'),
    outputDir: path.join(__dirname, './out'),
    'FILES': [
      './page/tools.wxs',
      './page/logic.wxs',
      './page/index/index.wxml',
      './page/index/index1.wxml',
      './page/index/index2.wxml',
      './page/index/index3.wxml',
      './page/statement.wxs',
      './page/index/index4.wxml',
      './page/operator.wxs',
      './page/dataType.wxs',
      './page/lib.wxs',
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

    },
    {
      name: './page/index/index1.wxml',
      renderPath: './page/index/index1.wxml',
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
    },
    {
      name: './page/index/index2.wxml',
      renderPath: './page/index/index2.wxml',
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
    },
    {
      name: './page/index/index3.wxml',
      renderPath: './page/index/index3.wxml',
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
    },
    {
      name: './page/index/index4.wxml',
      renderPath: './page/index/index4.wxml',
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