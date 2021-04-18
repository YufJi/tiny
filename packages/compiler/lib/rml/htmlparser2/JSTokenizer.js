function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// // 用于调试词法解析器状态
// var stateMap = {
//   "0": 'TEXT',
//   // 检测到js插值的开始标签
//   "1": 'BEFORE_START_JS_RAW',
//   // js插值的开始标签检测完成
//   "2": 'AFTER_START_JS_RAW',
//   // 处于js解析中（{{）
//   "3": 'JS_TEXT',
//   // 处于js字符串解析中 （" '）
//   "4": 'IN_JS_STRING',
//   // 处于js作用域解析中 （{）
//   "5": 'IN_JS_SCOPE',
//   // 处于js模板字符串解析中 （'）
//   "6": 'IN_JS_TEMPLATE_STRING',
//   // 检测到js插值的结束标签
//   "7": 'BEFORE_END_JS_RAW',
//   // js插值的结束标签检测完成
//   "8": 'AFTER_END_JS_RAW',
// }

var AST_TYPE_TEXT = 'TEXT';
var AST_TYPE_JS_RAW = 'JS_RAW';

let i = 0;

// 解析普通文本
const TEXT = i++;

// 检测到js插值的开始标签
const BEFORE_START_JS_RAW = i++;

// js插值的开始标签检测完成
const AFTER_START_JS_RAW = i++;

// 处于js解析中（{{）
const JS_TEXT = i++;

// 处于js字符串解析中 （" '）
const IN_JS_STRING = i++;

// 处于js作用域解析中 （{）
const IN_JS_SCOPE = i++;

// 处于js模板字符串解析中 （'）
const IN_JS_TEMPLATE_STRING = i++;

// 检测到js插值的结束标签
const BEFORE_END_JS_RAW = i++;

// js插值的结束标签检测完成
const AFTER_END_JS_RAW = i++;

/**
 * 带js插值的内容词法分析器，可以从text提取js表达式
 * 暂不考虑多次\\情况，在不考虑正则表达式
 */
const JSScopeStack = (function () {
  function JSScopeStack() {
    const callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
    const errorHandle = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

    _classCallCheck(this, JSScopeStack);

    // js检测结束的回调
    this._cb = callback;
    this._onerror = errorHandle;

    this._state = TEXT;

    // 处于js字符串解析中时，支付串在字符
    this._jsRawStrStack = null;

    // 插值时的作用域栈。这是一个二维栈（数字的数组）。
    // 数组长度表示字符串模板的插值作用域数，数组中的数值表示对模板作用域的“{}”作用域数。
    // 如：插值代码是{a: {}}，因为没有字符串模板，解析到“{a: {”时，栈值最大，长度是2，该属性值是[2]。
    // 如果有字符串插值，插值字符串会再数组中增加1位。
    // 如：插值代码是{a: {b: `${ {} }`}}，解析到“{a: {b: `”时，因为有模板字符串，则数组加一位，该属性值是[2, 0]；解析到“{a: {b: `${ {”，栈值最大，值是[2, 1]。
    this._scopeStack = [0];

    // 缓存代码
    this._buffer = '';

    // 解析到的位置
    this._index = 0;

    // 已经解析完成的位置
    this._sectionStart = 0;

    // 保存匹配出的ast。如xxx{{a}}，解析的ast是[{type: 'TEXT', text: 'xxx'}, {type: 'JS_RAW', text: '{{a}}'}]
    this._ast = [];

    // 是否有js插值字符串
    this._hasJSRaw = false;
  }

  /**
   * 向已换成的代码后面增加代码
   * @param {string} buffer     添加的代码
   */
  JSScopeStack.prototype.append = function append(buffer) {
    this._buffer += buffer;
    this._parse();
  };

  /**
   * 清空缓存的代码
   */
  JSScopeStack.prototype.clear = function clear() {
    this._jsRawStrStack = null;
    this._scopeStack = [0];
    this._buffer = '';
    this._index = 0;
    this._sectionStart = 0;
    this._state = TEXT;
    this._sectionStart = 0;
    this._ast = [];
    this._hasJSRaw = false;
  };

  /**
   * 已缓存是否正处于js插值中
   * 如append('{{')后，因为解析到了{{，因此此时处于js插值的表达式中，该值为true；然后ppend('}}')后，js表达式结束，该值为false。
   */
  JSScopeStack.prototype.stateInJS = function stateInJS() {
    return this._state !== TEXT;
  };

  /**
   * 返回已缓存的代码解析出的ast。是一个数组
   * 如缓存的代码是“xxx{{a}}”，解析的ast是[{type: 'TEXT', text: 'xxx'}, {type: 'JS_RAW', text: '{{a}}'}]
   * @readonly
   */
  JSScopeStack.prototype.getAst = function getAst() {
    const section = this._getSection();
    if (section) {
      return [].concat(this._ast, [{
        type: this.stateInJS() ? AST_TYPE_JS_RAW : AST_TYPE_TEXT,
        text: section,
      }]);
    } else {
      return [].concat(this._ast);
    }
  };

  /**
   * 已经缓存的代码是否有js插值
   * @readonly
   */
  JSScopeStack.prototype.hasJSRaw = function hasJSRaw() {
    return this._hasJSRaw;
  };

  // 作用域相关，包括{}作用域和模板字符串插值作用域
  JSScopeStack.prototype._pushTmplScope = function _pushTmplScope() {
    this._scopeStack.push(0);
  };

  JSScopeStack.prototype._popTmplScope = function _popTmplScope() {
    this._scopeStack.pop();
  };

  JSScopeStack.prototype._getTmplScope = function _getTmplScope() {
    return this._scopeStack.length - 1;
  };

  JSScopeStack.prototype._pushScope = function _pushScope() {
    this._scopeStack[this._getTmplScope()]++;
  };

  JSScopeStack.prototype._popScope = function _popScope() {
    this._scopeStack[this._getTmplScope()]--;
  };

  JSScopeStack.prototype._getScope = function _getScope() {
    return this._scopeStack[this._getTmplScope()];
  };

  // 普通文本
  JSScopeStack.prototype._text = function _text(c) {
    if (c === '{' && this._buffer[this._index - 1] === '{') {
      let section = this._getSection();
      section = section.substr(0, section.length - 1);
      if (section) {
        this._ast.push({
          type: this.stateInJS() ? AST_TYPE_JS_RAW : AST_TYPE_TEXT,
          text: section,
        });
      }
      this._index--;
      this._sectionStart = this._index;
      this._state = BEFORE_START_JS_RAW;
    }
  };

  // 找到js插值开始符号前
  JSScopeStack.prototype._beforeStartJSRaw = function _beforeStartJSRaw(c) {
    // 识别结束，进入“{{”检测完成的状态
    this._state = AFTER_START_JS_RAW;
    this._index--;
  };

  // 找到js插值开始符号后
  JSScopeStack.prototype._afterStartJSRaw = function _afterStartJSRaw(c) {
    // 进入插值的状态
    this._state = JS_TEXT;
    this._hasJSRaw = true;
  };

  // js插值中，js普通代码
  JSScopeStack.prototype._inJSRaw = function _inJSRaw(c) {
    if (c === '{') {
      // 如果识别出{，进入作用域状态
      this._pushScope();
      this._state = IN_JS_SCOPE;
    } else if ({ '"': 1, "'": 1 }[c]) {
      // 如果有字符串，进入字符串状态
      this._jsRawStrStack = c;
      this._state = IN_JS_STRING;
    } else if (c === '`') {
      // 进入模板串状态
      this._state = IN_JS_TEMPLATE_STRING;
    } else if (c === '}') {
      if (this._getTmplScope() > 0) {
        // 存在模板字符串插值，退出模板插值作用域
        this._popTmplScope();
        this._state = IN_JS_TEMPLATE_STRING;
      } else {
        // 识别到插值结束符号
        this._state = BEFORE_END_JS_RAW;
      }
    }
  };

  // js插值中，js的字符串代码
  JSScopeStack.prototype._inJSString = function _inJSString(c) {
    // 排除'\''中转义字符影响，暂不考虑\\转义的影响，如\\${}
    if (this._jsRawStrStack === c && this._buffer.charAt(this._index - 1) !== '\\') {
      this._jsRawStrStack = null;
      if (this._getScope() > 0) {
        this._state = IN_JS_SCOPE;
      } else {
        this._state = JS_TEXT;
      }
    } else if (c === '\n') {
      this._onerror(new Error('line feed error'));
    }
  };

  JSScopeStack.prototype._getSection = function _getSection() {
    return this._buffer.substring(this._sectionStart, this._index);
  };

  JSScopeStack.prototype._inJSScope = function _inJSScope(c) {
    if ({ '"': 1, "'": 1 }[c]) {
      this._jsRawStrStack = c;
      this._state = IN_JS_STRING;
    } else if (c === '`') {
      this._state = IN_JS_TEMPLATE_STRING;
    } else if (c === '{') {
      this._pushScope();
    } else if (c === '}') {
      if (this._getScope() <= 0) {
        this._onerror(new Error('parse js error: scope "}"'));
      } else {
        this._popScope();

        if (this._getScope() <= 0) {
          this._state = JS_TEXT;
        }
      }
    }
  };

  JSScopeStack.prototype._inJSTemplateString = function _inJSTemplateString(c) {
    // 排除'\${'转义字符影响，暂不考虑\\转义的影响，如\\${
    if (c === '{' && this._buffer[this._index - 1] === '$' && this._buffer[this._index - 2] !== '\\') {
      this._pushTmplScope();
      this._state = JS_TEXT;
    } else if (c === '`' && this._buffer[this._index - 1] !== '\\') {
      if (this._getScope() <= 0) {
        this._state = JS_TEXT;
      } else {
        this._state = IN_JS_SCOPE;
      }
    }
  };

  JSScopeStack.prototype._beforeEndJSRaw = function _beforeEndJSRaw(c) {
    if (c === '}') {
      this._state = AFTER_END_JS_RAW;
      this._index--;
    } else {
      this._onerror(new Error('parse js error: missing }'));
    }
  };

  JSScopeStack.prototype._afterEndJSRaw = function _afterEndJSRaw(c) {
    this._cb(this._getSection() + c);
    this._ast.push({
      text: this._getSection() + c,
      type: AST_TYPE_JS_RAW,
    });
    this._sectionStart = this._index + 1;
    this._state = TEXT;
  };

  JSScopeStack.prototype._parse = function _parse() {
    while (this._index < this._buffer.length) {
      const c = this._buffer.charAt(this._index);
      // console.log(c, this._state, stateMap[this._state])

      if (this._state === TEXT) {
        this._text(c);
      } else if (this._state === BEFORE_START_JS_RAW) {
        this._beforeStartJSRaw(c);
      } else if (this._state === AFTER_START_JS_RAW) {
        this._afterStartJSRaw(c);
      } else if (this._state === JS_TEXT) {
        this._inJSRaw(c);
      } else if (this._state === IN_JS_SCOPE) {
        this._inJSScope(c);
      } else if (this._state === IN_JS_STRING) {
        this._inJSString(c);
      } else if (this._state === IN_JS_TEMPLATE_STRING) {
        this._inJSTemplateString(c);
        // } else if (this._state === IN_JS_TEMPLATE_REGEXP) {
        // this._inJSString(c);
      } else if (this._state === BEFORE_END_JS_RAW) {
        this._beforeEndJSRaw(c);
      } else if (this._state === AFTER_END_JS_RAW) {
        this._afterEndJSRaw(c);
      } else {
        this._onerror(new Error('unknown _state'), this._state);
      }

      this._index++;
    }
  };

  return JSScopeStack;
})();

module.exports = JSScopeStack;
exports.AST_TYPE_TEXT = AST_TYPE_TEXT
exports.AST_TYPE_JS_RAW = AST_TYPE_JS_RAW