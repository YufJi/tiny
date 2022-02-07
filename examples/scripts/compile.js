const path = require('path');
const compiler = require('../../packages/compiler/src');

const outPath = path.join(__dirname, '../../packages/devtool/static/biz');

compiler({
  out: outPath,

  templateNamespace: 'wx',
  sjsTemplate: {
    tag: 'wxs',
    module: 'module',
    src: 'src',
  },
  templateExtname: '.wxml',
  styleExtname: '.wxss',
  sjsExtname: '.wxs',

  runtimeConfig: {
    // context: 'biz/'
  },
});
