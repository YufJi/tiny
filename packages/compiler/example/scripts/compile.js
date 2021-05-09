const path = require('path');

const compiler = require('../../src');

const root = path.join(__dirname, '../miniRoot');
const baseDir = path.join(__dirname, '../miniRoot');

// const root = path.join(__dirname, '../oa')
// const baseDir = path.join(__dirname, '../oa')

const outPath = path.join(__dirname, '../../../devtool/assets/biz');

compiler({
  src: root,
  out: outPath,
  baseDir,

  bridgeName: 'wx',
  templateExtname: '.wxml',
  styleExtname: '.wxss',
  templateNamespace: 'wx',

  runtimeConfig: {

  },
});
