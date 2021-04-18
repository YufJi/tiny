const path = require('path')

const compiler = require('../../lib');

const outPath = path.join(__dirname, '../../../devtool/assets/biz')
const baseDir = path.join(__dirname, '../miniRoot')

compiler({
  src: path.join(__dirname, '../miniRoot'),
  out: outPath,
  baseDir,

  templateExtname: '.axml',
  styleExtname: '.acss',
  templateNamespace: 'a',
  templateRuntimeModule: '',
})
