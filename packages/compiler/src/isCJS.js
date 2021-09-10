const traverse = require('@babel/traverse').default;
const parser = require('@babel/parser');

const visitor = {
  ReferencedIdentifier(path) {
    const { node, scope } = path;
    const { name } = node;
    if ((name === 'module' || name === 'exports') && !scope.hasBinding(name, true)) {
      path.stop();
      this.ret.cjs = true;
    }
  },
};

const reg = /\b(exports)\b/;

module.exports = function isCJS(code) {
  if (!code.match(reg)) {
    return false;
  }
  try {
    const babylonConfig = {
      sourceType: 'module',
      plugins: ['objectRestSpread', 'asyncGenerators'],
    };
    const ast = parser.parse(code, babylonConfig);
    const ret = {};
    traverse(ast, visitor, undefined, { ret });
    return !!ret.cjs;
  } catch (e) {
    return false;
  }
};
