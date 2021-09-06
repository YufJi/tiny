let traverse = require('@babel/traverse');
let parser = require('@babel/parser');

parser = parser.default || parser;
traverse = traverse.default || traverse;

const refVisitor = {
  ReferencedIdentifier(path) {
    const { node, scope } = path;
    const { name } = node;
    if (
      (name === 'module' || name === 'exports')
      && !scope.hasBinding(name, true)
    ) {
      path.stop();
      this.ret.cjs = 1;
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
    traverse(ast, refVisitor, undefined, { ret });
    return !!ret.cjs;
  } catch (e) {
    return false;
  }
};
