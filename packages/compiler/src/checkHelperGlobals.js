const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const codeFrameColumns = require('@babel/code-frame');

const { Hub, NodePath } = traverse;

const refVisitor = {
  ReferencedIdentifier(path) {
    const { node, scope } = path;
    const { name } = node;
    if (!scope.hasBinding(name, true) && !this.globals[name]) {
      throw path.buildCodeFrameError(`Can not use ${name}`);
    }
  },
};

const globals = {
  Date: 1,
  String: 1,
  RegExp: 1,
  NaN: 1,
  Infinity: 1,
  undefined: 1,
  parseInt: 1,
  parseFloat: 1,
  isNaN: 1,
  isFinite: 1,
  escape: 1,
  Math: 1,
  unescape: 1,
  JSON: 1,
  decodeURI: 1,
  decodeURIComponent: 1,
  encodeURI: 1,
  encodeURIComponent: 1,
};

module.exports = function check(code, file) {
  const hub = new Hub({
    buildCodeFrameError(node, msg, Error) {
      const { loc } = node;

      msg = `${file}: ${msg}`;

      if (loc) {
        msg += '\n';
        msg += codeFrameColumns(code, loc.line, loc.column + 1);
      }

      return new Error(msg);
    },
  });
  const babylonConfig = {
    sourceType: 'module',
    sourceFilename: file,
    plugins: ['objectRestSpread', 'asyncGenerators'],
  };

  const ast = parser.parse(code, babylonConfig);
  const path = NodePath.get({
    hub,
    parentPath: null,
    parent: ast,
    container: ast,
    key: 'program',
  }).setContext();
  const { scope } = path;
  traverse(ast, refVisitor, scope, { globals });
};
