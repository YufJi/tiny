const path = require('path')

const compiler = require('../../lib');

const root = path.join(__dirname, '../miniRoot')
const outPath = path.join(__dirname, '../../../devtool/assets/biz')
const baseDir = path.join(__dirname, '../miniRoot')

compiler({
  src: root,
  out: outPath,
  baseDir,

  templateExtname: '.wxml',
  styleExtname: '.wxss',
  templateNamespace: 'wx',

  runtimeConfig: {
    
  }
})
