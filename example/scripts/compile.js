const path = require('path');
const argv = require('./minimist')(process.argv.slice(2));
const compiler = require('../../packages/compiler/src');

const outPath = path.join(__dirname, '../../packages/devtool/static/biz');
const root = path.join(__dirname, `../${argv.name}`);

compiler({
  src: root,
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

  },
});
