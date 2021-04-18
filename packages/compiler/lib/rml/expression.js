
const traverse = require('babel-traverse').default;
const generate = require('babel-generator').default;
const t = require('babel-types');

const { parseExpression } = require('./babylon');
const { toLiteralString, startsWith, endsWith } = require('./utils');
const JSTokenizer = require('./htmlparser2/JSTokenizer');

// not allow {{x:{y:1}}}
// or use complex parser
const expressionTagTokenizer = new JSTokenizer();
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
    for (let i = 0; i < scope.length; i++) {
      const s = scope[i];
      if (s[name]) {
        return s[name];
      }
    }
  }
  return false;
}

const visitor = {
  noScope: true,
  ReferencedIdentifier(path) {
    const { node } = path;
    const { parent } = path;

    if (node.__rmlSkipped) {
      return;
    }
    const nameScope = findScope(this.rmlScope, node.name);
    if (nameScope === 'sjs') {
      const parentType = parent && parent.type;
      if (node.type === 'Identifier' && !(parentType === 'MemberExpression' && parent.object === node)) {
        const args = [t.arrayExpression([node])];
        if (parentType === 'CallExpression' && parent.callee === node) {
          args.push(t.numericLiteral(1));
        }
        const newNode = t.callExpression(t.identifier('$getSJSMember'), args);
        newNode.callee.__rmlSkipped = 1;
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
    const { parent } = path;
    const { node } = path;

    const parentType = parent && parent.type;
    // do not transform function call
    // skip call callee x[y.q]
    if (/* root member node */ parentType !== 'MemberExpression') {
      // allow {{x.y.z}} even x is undefined
      const members = [node];
      let root = node.object;

      while (root.type === 'MemberExpression') {
        members.push(root);
        root = root.object;
      }

      const isSJS = findScope(this.rmlScope, root.name) === 'sjs';

      if (!isSJS && this.strictDataMember) {
        return;
      }

      // TODO. use https://www.npmjs.com/package/babel-plugin-transform-optional-chaining
      const memberFn = isSJS ? '$getSJSMember' : '$getLooseDataMember';
      members.reverse();
      const args = [root];

      if (isSJS) {
        root.__rmlSkipped = 1;
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
      newNode.callee.__rmlSkipped = 1;
      // will process a.v of x.y[a.v]
      path.replaceWith(newNode);
      // path.skip();
    }
  },
};

function transformCode(code_, rmlScope, config) {
  let codeStr = code_;

  if (config.forceObject || isObject(codeStr)) {
    codeStr = `{${codeStr}}`;
  }

  const expression = parseExpression(codeStr, babylonConfig);
  const { start } = expression;
  const { end } = expression;
  const ast = {
    type: 'File',
    start,
    end,
    program: {
      start,
      end,
      type: 'Program',
      body: [{
        start,
        end,
        type: 'ExpressionStatement',
        expression,
      }],
    },
  };
  
  traverse(ast, visitor, undefined, {
    rmlScope,
    strictDataMember: !!config.strictDataMember,
  });

  const _generate = generate(ast);
  let { code } = _generate;

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
  expressionTagTokenizer.clear();
  expressionTagTokenizer.append(str);
  if (!expressionTagTokenizer.hasJSRaw()) {
    return [toLiteralString(str_)];
  }
  const ast = expressionTagTokenizer.getAst();

  return ast.map((subAst) => {
    const { text } = subAst;

    if (subAst.type === JSTokenizer.AST_TYPE_TEXT) {
      return toLiteralString(text);
    } else if (startsWith(text, '{{') && endsWith(text, '}}')) {
      const exp = text.slice(2, -2);
      if (exp.length > 0) {
        return transformCode(exp, scope, config);
      } else {
        return toLiteralString(exp);
      }
    } else {
      return toLiteralString(text);
    }
  });
}

function transformExpression(_str, scope, config = {}) {
  let ret = transformExpressionByPart(_str, scope, config);

  if ('text' in config) {
    ret = ret.map((r) => {
      return `$toString(${r})`;
    });
    
    return ret.length > 1 ? `[${ret.join(', ')}]` : ret[0];
  }
  return ret.join(' + ');
}

function hasExpression(str) {
  expressionTagTokenizer.clear();
  expressionTagTokenizer.append(str);
  return expressionTagTokenizer.hasJSRaw();
}

exports.transformExpression = transformExpression
exports.hasExpression = hasExpression