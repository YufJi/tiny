// not allow {{x:{y:1}}}
// or use complex parser
// const util = require('util');

const babylon = require('babylon');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const expressionTagReg = /\{\{([^}]+)\}\}/g;
const fullExpressionTagReg = /^\{\{([^}]+)\}\}$/;
const spreadReg = /^\.\.\.[\w$_]/;
const objReg = /^[\w$_](?:[\w$_\d\s]+)?:/;
const es2015ObjReg = /^[\w$_](?:[\w$_\d\s]+)?,/;

function isObject(str_) {
  const str = str_.trim();
  return str.match(spreadReg) || str.match(objReg) || str.match(es2015ObjReg);
}

const babylonConfig = {
  plugins: ['objectRestSpread'],
};

function findScope(scope, name) {
  if (scope) {
    return scope.some((s) => {
      return s[name];
    });
  }
  return false;
}

function escapeString(str) {
  return str.replace(/[\\']/g, '\\$&');
}

const visitor = {
  noScope: true,
  ReferencedIdentifier(path) {
    const { parent, node } = path;

    if (node.__xmlSkipped) {
      return;
    }

    const nameScope = findScope(this.xmlScope, node.name);
    if (nameScope === 'sjs') {
      const parentType = parent && parent.type;
      if (node.type === 'Identifier' && !(parentType === 'MemberExpression' && parent.object === node)) {
        const args = [t.arrayExpression([node])];
        if (parentType === 'CallExpression' && parent.callee === node) {
          args.push(t.numericLiteral(1));
        }
        const newNode = t.callExpression(t.identifier('$getSJSMember'), args);
        newNode.callee.__xmlSkipped = true;
        path.replaceWith(newNode);
        path.skip();
      }
      return;
    }
    if (!nameScope) {
      node.name = `data['${node.name}']`;
    }
  },
  MemberExpression(path) {
    const { parent, node } = path;

    const parentType = parent && parent.type;
    // do not transform function call
    // skip call callee x[y.q]
    /* root member node */
    if (parentType !== 'MemberExpression') {
      // allow {{x.y.z}} even x is undefined
      const members = [node];
      let root = node.object;

      while (root.type === 'MemberExpression') {
        members.push(root);
        root = root.object;
      }

      const isSJS = findScope(this.xmlScope, root.name) === 'sjs';

      if (!isSJS && this.strictDataMember) {
        return;
      }

      // TODO. use https://www.npmjs.com/package/babel-plugin-transform-optional-chaining
      const memberFn = isSJS ? '$getSJSMember' : '$getLooseDataMember';
      members.reverse();
      const args = [root];

      if (isSJS) {
        root.__xmlSkipped = true;
      }

      if (root.type === 'ThisExpression') {
        args.pop();
        args.push(members.shift());
      }

      if (!members.length) {
        return;
      }

      members.forEach((m) => {
        // x[y]
        if (m.computed) {
          args.push(m.property);
        } else {
          // x.y
          args.push(t.stringLiteral(m.property.name));
        }
      });

      const callArgs = [t.arrayExpression(args)];
      if (parent.callee === node) {
        callArgs.push(t.numericLiteral(1));
      }

      const newNode = t.callExpression(t.identifier(memberFn), callArgs);
      newNode.callee.__xmlSkipped = true;
      // will process a.v of x.y[a.v]
      path.replaceWith(newNode);
      // path.skip();
    }
  },
};

function transformCode(code_, xmlScope, config) {
  let codeStr = code_;

  if (config.forceObject || isObject(codeStr)) {
    codeStr = `{${codeStr}}`;
  }

  const ast = babylon.parse(`(${codeStr})`, babylonConfig);

  traverse(ast, visitor, undefined, {
    xmlScope,
    strictDataMember: !!config.strictDataMember,
  });

  let { code } = generate(ast);

  if (code.charAt(code.length - 1) === ';') {
    code = code.slice(0, -1);
  }
  return `(${code})`;
}

function transformExpressionByPart(str_, scope, config) {
  if (typeof str_ !== 'string') {
    return [str_];
  }
  const str = str_.trim();
  if (!str.match(expressionTagReg)) {
    return [`'${escapeString(str_)}'`];
  }

  let match = str.match(fullExpressionTagReg);
  if (match) {
    return [transformCode(match[1], scope, config)];
  }

  const totalLength = str.length;
  let lastIndex = 0;
  const gen = [];
  /* eslint no-cond-assign:0 */
  while (match = expressionTagReg.exec(str)) {
    const code = match[1];
    if (match.index !== lastIndex) {
      gen.push(`'${escapeString(str.slice(lastIndex, match.index))}'`);
    }
    gen.push(transformCode(code, scope, config));
    lastIndex = expressionTagReg.lastIndex;
  }

  if (lastIndex < totalLength) {
    gen.push(`'${escapeString(str.slice(lastIndex))}'`);
  }

  return gen;
}

function transformExpression(str_, scope, config = {}) {
  const ret = transformExpressionByPart(str_, scope, config);
  if ('text' in config) {
    return ret.length > 1 ? `[${ret.join(', ')}]` : ret[0];
  }
  return ret.join(' + ');
}

function hasExpression(str) {
  return str.match(expressionTagReg);
}

exports.transformExpression = transformExpression;
exports.hasExpression = hasExpression;
