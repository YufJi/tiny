let traverse = require('@babel/traverse');
let generate = require('@babel/generator');
const t = require('@babel/types');
const codeFrameColumns = require('@babel/code-frame');
let template = require('@babel/template');
// let babylon = require('./xml/babylon');
let babylon = require('babylon');
const { checkImport } = require('./utils');

babylon = babylon.default || babylon;
traverse = traverse.default || traverse;
generate = generate.default || generate;
template = template.default || template;

const { Hub, NodePath } = traverse;

const identifierPrefix = '$sjs_';

const props = ['NaN', 'Infinity', 'undefined'];
// eslint-disable-next-line
const methods = [
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
];

const reservedWords = [
  'delete',
  'void',
  'typeof',

  'null',
  'undefined',
  'NaN',
  'Infinity',
  'var',

  'if',
  'else',

  'true',
  'false',

  'require',

  'this',
  'function',
  'arguments',
  'return',

  'for',
  'while',
  'do',
  'break',
  'continue',
  'switch',
  'switch',
  'case',
  'default',

  // 这三个不转译
  'Number',
  'Date',
  'Math',
];

function isPrimitive(val) {
  return val == null || /^[sbn]/.test(typeof val);
}

function looksLike(a, b) {
  return (
    a
    && b
    && Object.keys(b).every((bKey) => {
      const bVal = b[bKey];
      const aVal = a[bKey];
      if (typeof bVal === 'function') {
        return bVal(aVal);
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
    })
  );
}

function isMemberExpressionProperty(path) {
  return looksLike(path, {
    parent: { type: 'MemberExpression', property: { name: path.node.name } },
  });
}

function isObjectPropertyKey(path) {
  return looksLike(path, {
    parent: { type: 'ObjectProperty', key: { name: path.node.name } },
  });
}

function isVariableDeclaratorId(path) {
  return looksLike(path, {
    parent: { type: 'VariableDeclarator', id: { name: path.node.name } },
  });
}

function isFunctionDeclarationId(path) {
  return looksLike(path, {
    parent: { type: 'FunctionDeclaration', id: { name: path.node.name } },
  });
}

const Identifier = (path) => {
  if (
    looksLike(path, {
      node: { name: (name) => reservedWords.indexOf(name) !== -1 },
    })
  ) {
    if (
      isMemberExpressionProperty(path)
      || isObjectPropertyKey(path)
      || isVariableDeclaratorId(path)
      || isFunctionDeclarationId(path)
    ) {
      throw path.buildCodeFrameError('Error: Unexpected token');
    }
  }
  if (['Number', 'Date', 'Math'].indexOf(path.node.name) !== -1) {
    return;
  }
  if (looksLike(path, { node: { name: (name) => props.indexOf(name) !== -1 } })) {
    return;
  }
  if (looksLike(path, { node: { name: 'arguments' } })) {
    const funcParent = path.getFunctionParent();
    if (looksLike(funcParent, { type: 'Program' })) {
      throw path.buildCodeFrameError('Error: Illegal arguments statement');
    }
    return;
  }
  if (
    looksLike(path, {
      node: { name: 'length' },
      parent: { type: 'MemberExpression', object: { name: 'arguments' } },
    })
  ) {
    return;
  }
  path.node.name = identifierPrefix + path.node.name;
};

const ObjectProperty = {
  exit(path) {
    const { key, value, computed, shorthand, decorators } = path.node;
    if (key.type === 'NumericLiteral') {
      throw path.buildCodeFrameError('Error: Expected string or variable');
    }
    if (computed) {
      throw path.buildCodeFrameError('Error: Unexpected token');
    }
    if (key.type !== 'StringLiteral') {
      return;
    }
    path.replaceWith(
      t.objectProperty(
        t.stringLiteral(identifierPrefix + key.value),
        value,
        computed,
        shorthand,
        decorators,
      ),
    );
    path.skip();
  },
};

const memberExpTemplate = template(`
  OBJECT[_${identifierPrefix}p(PROPERTY)]
`);
const MemberExpression = {
  exit(path) {
    if (
      looksLike(path, {
        node: { computed: true, property: { type: 'NumericLiteral' } },
      })
    ) {
      return;
    }
    if (!path.node.computed) {
      return;
    }

    path.replaceWith(
      memberExpTemplate({
        OBJECT: path.node.object,
        PROPERTY: path.node.property,
      }),
    );
    path.skip();
  },
};
const NewExpression = (path) => {
  throw path.buildCodeFrameError('Error: not supported syntax');
};

const RegExpLiteral = (path) => {
  throw path.buildCodeFrameError('Error: Unexpected token /');
};

const NumericLiteral = (path) => {
  const {
    extra: { raw },
  } = path.node;
  if (raw.startsWith('0x') || raw.startsWith('0o') || raw.startsWith('0b')) {
    throw path.buildCodeFrameError('Error: Unexpected token');
  }
};

const BinaryExpression = (path) => {
  const { operator } = path.node;
  if (operator === '**' || operator === 'in') {
    throw path.buildCodeFrameError(`Error: Unexpected token ${operator}`);
  }
};

const AssignmentExpression = (path) => {
  const { operator } = path.node;
  if (operator === '**=') {
    throw path.buildCodeFrameError('Error: Unexpected token');
  }
};

const FunctionExpression = (path) => {
  const {
    node: { generator, async },
  } = path;
  if (!generator && !async) {
    return;
  }
  throw path.buildCodeFrameError('Error: Unexpected token /');
};

const createImportDeclaration = (config) => (path) => {
  const {
    source: { value, type },
  } = path.node;
  if (type !== 'StringLiteral') {
    return;
  }
  const { projectRoot, renderPath } = config;

  try {
    path.node.source.value = checkImport(
      value,
      '.sjs',
      renderPath,
      projectRoot,
    );
  } catch (e) {
    // throw e;
    throw path.buildCodeFrameError(e.message);
  }
};

const es6 = [
  'ClassDeclaration',
  'ClassExpression',
  'Super',
  'TaggedTemplateExpression',
  'ForOfStatement',
];

const es5 = ['TryStatement', 'ForInStatement'];

const visitor = {
  Identifier,
  ObjectProperty,
  MemberExpression,
  NewExpression,
  RegExpLiteral,
  NumericLiteral,
  BinaryExpression,
  AssignmentExpression,
  FunctionExpression,
  FunctionDeclaration: FunctionExpression,
};

es6.concat(es5).forEach((key) => {
  visitor[key] = (path) => {
    throw path.buildCodeFrameError(`Error: Unexpected token ${key}`);
  };
});

function transpiler(code, config = {}) {
  const hub = new Hub({
    buildCodeFrameError(node, msg, Error) {
      const { loc } = node;

      if (loc) {
        msg += '\n';
        msg += codeFrameColumns(code, loc.line, loc.column);
      }

      return new Error(msg);
    },
  });

  const ast = babylon.parse(code, {
    sourceType: 'module',
    plugins: ['objectRestSpread'],
  });

  const path = NodePath.get({
    hub,
    parentPath: null,
    parent: ast,
    container: ast,
    key: 'program',
  }).setContext();

  const { scope } = path;

  traverse(
    ast,
    {
      ImportDeclaration: createImportDeclaration(config),
      ...visitor,
    },
    scope,
  );
  code = generate(ast).code;
  return code;
}

module.exports = transpiler;
