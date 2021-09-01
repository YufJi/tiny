const traverse = require('@babel/traverse').default;
const { parse } = require('babylon');

const { startsWith } = require('./utils');

const PREFIX = '$sjs_';

function processComponentImport(dep) {
  if (startsWith(dep, '{')) {
    const ret = [];
    const visitor = {
      noScope: 1,
      enter: function enter(path) {
        const { node } = path;

        if (node.type === 'ObjectProperty' && node.key && node.key.name) {
          const info = {
            name: node.key.name,
          };
          if (node.value && node.value.name && node.value.name !== node.key.name) {
            info.as = node.value.name;
          }
          ret.push(info);
        }
      },
    };
    const ast = parse(`(${dep})`);
    traverse(ast, visitor);
    return ret;
  }

  return dep;
}

function processSJSImport(dep) {
  if (startsWith(dep, '{')) {
    const ret = [];
    const visitor = {
      noScope: 1,
      enter: function enter(path) {
        const { node } = path;

        if (node.type === 'ObjectProperty' && node.key && node.key.name) {
          const info = {
            name: `${PREFIX}${node.key.name}`,
            as: node.key.name,
          };
          if (node.value && node.value.name && node.value.name !== node.key.name) {
            info.as = node.value.name;
          }
          ret.push(info);
        }
      },
    };
    const ast = parse(`(${dep})`);
    traverse(ast, visitor);
    return ret;
  }
  return dep;
}

exports.processComponentImport = processComponentImport;
exports.processSJSImport = processSJSImport;
