const path = require('path')

const compiler = require('../../lib');

const outPath = path.join(__dirname, '../out')

compiler({
  src: path.join(__dirname, '../miniRoot'),
  out: outPath,
  baseDir: '../miniRoot',

  templateExtname: '.axml',
  styleExtname: '.acss',
  templateNamespace: 'a',
  templateRuntimeModule: '',
  css2: true,
})
