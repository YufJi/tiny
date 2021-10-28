const path = require('path');
const argv = require('./minimist')(process.argv.slice(2));
const compiler = require('../../packages/compiler/src');

const cwd = process.cwd();
const outPath = path.join(__dirname, '../../packages/devtool/static/biz');
const root = path.join(cwd, argv.root);

compiler({
  src: root,
  out: outPath,
  watch: argv.watch,

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
