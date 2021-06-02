const paddingCache = {};

function padding(level, str = '') {
  if (!paddingCache[level]) {
    paddingCache[level] = Array(level + 1).join(' ');
  }
  return paddingCache[level] + str;
}

function startsWith(str, prefix) {
  return str.slice(0, prefix.length) === prefix;
}

function endsWith(str, prefix) {
  return str.slice(-prefix.length) === prefix;
}

function camelCase(name) {
  return name.replace(/-(\w)/g, (w, g) => {
    return g.toUpperCase();
  });
}

function toLiteralString(str) {
  return JSON.stringify(str);
}

function checkImport(moduleName, suffix, config) {
  let from = moduleName;
  if (!from.endsWith(suffix)) {
    from += suffix;
  }
  if (config.nodeModules) {
    const { renderPath } = config;
    const { projectRoot } = config;
    const _config$nodeModules = config.nodeModules;
    const { fs } = _config$nodeModules;
    const { path } = _config$nodeModules;
    const { resolve } = _config$nodeModules;

    if (fs) {
      let fullPath = void 0;
      if (from.startsWith('/')) {
        fullPath = path.join(projectRoot, from);
      } else if (from.startsWith('./') || from.startsWith('../')) {
        fullPath = path.join(path.dirname(renderPath), from);
      } else {
        fullPath = resolve.sync(from, { basedir: path.dirname(renderPath) }) || from;
      }
      if (!fullPath.endsWith(suffix)) {
        fullPath += suffix;
      }
      if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
        throw new Error(`${fullPath.slice(projectRoot.length)} not exists!`);
      }
    }
  }
  return from;
}

function isUnHandleAttr(str) {
  return true;
  // if (startsWith(str, 'data-') || startsWith(str, 'aria-') || startsWith(str, 'capture-')) {
  //   return true;
  // }
  // return false;
}

function getRawJson(obj) {
  const code = [];
  Object.keys(obj).forEach((k) => {
    code.push(`'${isUnHandleAttr(k) ? k : camelCase(k)}' : ${obj[k] ? ` ${obj[k]}` : 'true'}`);
  });
  return `{${code.join(',')}}`;
}

function getRawJSXAttributeFromJson(transformedAttrs) {
  const code = [];
  Object.keys(transformedAttrs).forEach((k) => {
    code.push(`${isUnHandleAttr(k) ? k : camelCase(k)}${transformedAttrs[k] ? ` = ${transformedAttrs[k]}` : ''}`);
  });
  return `${code.join(' ')}`;
}

function getDepCode(node, scopeType, processImport) {
  let deps = void 0;
  const { attribs } = node;

  try {
    deps = attribs.name && processImport(attribs.name);
  } catch (e) {
    if (this.config.consoleError) {
      console.error(e);
    }
    this.throwParseError({
      node,
      attrName: 'name',
    }, e);
  }

  let depCode = '';
  if (Array.isArray(deps)) {
    depCode = deps.map((d) => {
      const variableName = d.as ? d.as : d.name;
      this.rootScope[variableName] = scopeType;
      return `${d.name}${d.as ? ` as ${d.as}` : ''}`;
    }).join(', ');
    depCode = `{ ${depCode} }`;
  } else {
    depCode = deps;
    this.rootScope[deps] = scopeType;
  }
  return depCode;
}

function filter(fn, obj) {
  return Object.keys(obj).reduce((a, c) => {
    if (fn(c)) {
      a[c] = obj[c];
    }
    return a;
  }, {});
}

const AKEY_REG = /^[\w.$]+$/;

const V_REG = /^[$\w]+$/;

function validAKeyName(str) {
  return str === '*this' || !!str.match(AKEY_REG);
}

function validVariableName(str) {
  return !!str.match(V_REG);
}

function clampStrIndex(index, str) {
  const startIndex = index - 10;
  const endIndex = index + 10;
  return clampStr(startIndex, endIndex, str);
}

function clampStr(startIndex, endIndex, str) {
  if (startIndex < 0) {
    startIndex = 0;
  }
  if (typeof endIndex !== 'number' || endIndex > str.length) {
    endIndex = str.length;
  }
  return { startIndex, endIndex, str: str.slice(startIndex, endIndex) };
}

/**
 * 格式化错误信息，显示上参考@babel/code-frame的codeFrameColumns函数
 * @param {string} sourceCode                 源代码
 * @param {number | [numner, number]} index   错误位置在源码中的位置，可以是个数组，表示从index[0]到index[1]是错误的区间
 * @param {number} showMoreLineCount          显示的更多行
 * @returns                                   格式化后的错误字符串
 */
function reportError(sourceCode, index, showMoreLineCount = 2) {
  // 源代码行字符串数组
  const lines = sourceCode.split('\n');

  let indexs = [];
  if (typeof index === 'number') {
    indexs = [index, index];
  } else if (Array.isArray(index) && typeof index[0] === 'number' && typeof index[1] === 'number') {
    indexs = index;
  } else {
    throw new Error('type of "index" must be Array of Number');
  }

  if (indexs[0] < 0) {
    indexs[0] = 0;
  }
  if (indexs[1] > sourceCode.length - 1) {
    indexs[1] = sourceCode.length - 1;
  }
  if (indexs[1] < index[0]) {
    indexs[1] = index[0];
  }

  // 错误开始的行号，从1开始计数
  let startLineNumber = 1;
  // 错误开始的列号，从1开始计数
  let startColumnNumber = indexs[0];
  // 错误结束的行号，从1开始计数
  let endLineNumber = 1;
  // 错误结束的列号，从1开始计数
  let endColumnNumber = indexs[1];

  for (var _iterator = lines, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator](); ;) {
    var _ref;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref = _i.value;
    }

    const code = _ref;

    if (code.length + 1 > startColumnNumber) {
      startColumnNumber += 1;
      break;
    } else {
      startColumnNumber -= code.length + 1;
      startLineNumber++;
    }
  }
  for (var _iterator2 = lines, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator](); ;) {
    var _ref2;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref2 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref2 = _i2.value;
    }

    const _code = _ref2;

    if (_code.length + 1 > endColumnNumber) {
      endColumnNumber += 1;
      break;
    } else {
      endColumnNumber -= _code.length + 1;
      endLineNumber++;
    }
  }

  // 错误信息字符串数组，最终join生成错误信息
  const error = [];

  // 显示的第一行的行号，从1开始计数
  const firstLineNumber = Math.max(1, startLineNumber - showMoreLineCount);

  // 显示的最终行的行号，从1开始计数
  const lastLineNumber = Math.min(lines.length, endLineNumber + showMoreLineCount);

  // 行号显示的字符最长长度，用于确定行号占位符的数量。如最后一行的行号是三位数，就使用3个字符显示行号，其他行不足的用空格补充
  const longestLineNumberLength = (`${lastLineNumber}`).length;

  for (let i = firstLineNumber; i <= lastLineNumber; i++) {
    // 相当于showLineNumber = padStart(longestLineNumberLength, ' ')，兼容js引擎不支持padStart情况
    const _padding = Array(longestLineNumberLength - (`${i}`).length + 1).join(' ');
    const showLineNumber = _padding + i;

    if (i >= startLineNumber && i <= endLineNumber) {
      error.push(`> ${showLineNumber} | ${lines[i - 1]}`);

      // 在错误所在的位置打印“^”符号提示错误，需要注意的是如果错行存在制表位，不要替换
      let errorLineCode = lines[i - 1].replace(/[^\t]/g, '^');

      if (i === endLineNumber) {
        errorLineCode = errorLineCode.replace(/\^/g, (char, offset) => {
          return offset + 1 > endColumnNumber ? '' : char;
        });
      }

      if (i === startLineNumber) {
        errorLineCode = errorLineCode.replace(/\^/g, (char, offset) => {
          return offset + 1 < startColumnNumber ? ' ' : char;
        });

        // 对应指向换行的场景
        if (sourceCode[indexs[0]] === '\n') {
          errorLineCode += '^';
        }
      }

      error.push(`  ${Array(longestLineNumberLength + 1).join(' ')} | ${errorLineCode}`);
    } else {
      error.push(`  ${showLineNumber} | ${lines[i - 1]}`);
    }
  }

  return error.join('\n');
}

exports.padding = padding;
exports.startsWith = startsWith;
exports.endsWith = endsWith;
exports.camelCase = camelCase;
exports.toLiteralString = toLiteralString;
exports.checkImport = checkImport;
exports.getRawJson = getRawJson;
exports.getRawJSXAttributeFromJson = getRawJSXAttributeFromJson;
exports.getDepCode = getDepCode;
exports.filter = filter;
exports.validAKeyName = validAKeyName;
exports.validVariableName = validVariableName;
exports.clampStrIndex = clampStrIndex;
exports.clampStr = clampStr;
exports.reportError = reportError;
