const path = require('path')

const compiler = require('../../lib');

const root = path.join(__dirname, '../oa')
const outPath = path.join(__dirname, '../../../devtool/assets/biz')
const baseDir = path.join(__dirname, '../oa')

compiler({
  src: root,
  out: outPath,
  baseDir,

  bridgeName: 'wx',
  templateExtname: '.wxml',
  styleExtname: '.wxss',
  templateNamespace: 'wx',

  runtimeConfig: {
    
  }
})
