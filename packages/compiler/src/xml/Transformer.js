const assign = require('object-assign');
const { DomHandler, Parser: HtmlParser } = require('htmlparser2');
const { transformExpression, hasExpression } = require('./expression');
const {
  toLiteralString,
  checkImport,
  getDepCode,
  getRawJSXAttributeFromJson,
  getRawJson,
  validKeyName,
  validVariableName,
  reportError,
} = require('./utils');
const { processSJSImport } = require('./processImport');

const IMPORT = 'import';
const cwd = process.cwd();
const TOP_LEVEL = 4;
const HEADER = 'export default function render(data, _ctx) {';

function defaultImportComponent() {
  return false;
}

function isJsx(c) {
  if (c.type === 'script') return false;

  const tag = c.type === 'tag' && c.name;
  return tag !== 'import';
}

function isTopLevel(level) {
  return level === TOP_LEVEL;
}

/* 是否为多个children */
function isRenderChildrenArray(children = [], considerFor) {
  const totalCount = children.reduce((count, c) => {
    if (
      c.type === 'script'
      || c.type === 'text' && !c.data.trim()
      || c.type === 'comment'
    ) {
      return count;
    }

    const tag = c.type === 'tag' && c.name;
    if (tag) {
      const attrs = c.attribs || {};
      // for is array....
      if (considerFor && attrs[this.FOR_ATTR_NAME]) {
        return count + 2;
      }
      // elseif else not count
      if (attrs[this.ELIF_ATTR_NAME] || this.ELSE_ATTR_NAME in attrs) {
        return count;
      }
      if (tag === 'template' && !attrs.is || tag === 'import') {
        return count;
      }
    }

    return count + 1;
  }, 0);

  return totalCount > 1;
}

function isFor(c, forAttrName) {
  const attrs = c.attribs;
  return attrs && attrs[forAttrName];
}

function MLTransformer(template, _config) {
  const config = { ..._config };
  this.config = config;

  /* 如果useFragment不存在，默认ture */
  if (!('useFragment' in config)) {
    this.config.useFragment = true;
  }

  config.omitEndTag = !!config.omitEndTag;
  // config.templateExtname = config.templateExtname;
  config.projectRoot = config.projectRoot || cwd;
  config.usingComponents = config.usingComponents || {};

  const { templateNamespace } = config;

  this.templateRenderHelpers = config.templateRenderHelpers;

  this.IF_ATTR_NAME = `${templateNamespace}:if`;
  this.ELIF_ATTR_NAME = `${templateNamespace}:elif`;
  this.ELSE_ATTR_NAME = `${templateNamespace}:else`;

  this.FOR_ATTR_NAME = `${templateNamespace}:for`;
  this.FOR_INDEX_ATTR_NAME = `${templateNamespace}:for-index`;
  this.FOR_ITEM_ATTR_NAME = `${templateNamespace}:for-item`;
  this.FOR_KEY_ATTR_NAME = `${templateNamespace}:key`;

  this.IF_ATTRS = [this.IF_ATTR_NAME, this.ELIF_ATTR_NAME, this.ELSE_ATTR_NAME];
  this.SPECIAL_ATTRS = this.IF_ATTRS.concat([this.FOR_ATTR_NAME, this.FOR_INDEX_ATTR_NAME, this.FOR_ITEM_ATTR_NAME, this.FOR_KEY_ATTR_NAME]);

  this.componentDeps = {};
  this.importTplDeps = {};
  this.includeTplDeps = {};
  this.template = template;
  this.header = [
    'const Nerv = self.Nerv;',
  ];
  this.subTemplatesCode = {};
  this.code = [];
  this.state = [];
  this.rootScope = this._makeScope();
  this.scope = [this.rootScope];
  this.importIncludeIndex = 1;
  this.codeDepth = [0];
  this.cKey = 0;
}

assign(MLTransformer.prototype, {
  // fix mp/mp-compiler#22
  _makeScope(content) {
    if (content) {
      return assign(Object.create(null), content);
    } else {
      return Object.create(null);
    }
  },
  /* 获取条件属性 */
  getConditionalKey() {
    return `$c${++this.cKey}`;
  },
  /* 是否开始代码段落 */
  isStartOfCodeSection(level, preCalculate, justCheck) {
    if (justCheck) {
      return this.codeDepth[this.codeDepth.length - 1] + 1 === 1 && !isTopLevel(level);
    }
    if (preCalculate) {
      return ++this.codeDepth[this.codeDepth.length - 1] === 1 && !isTopLevel(level);
    }
    return !isTopLevel(level) && ++this.codeDepth[this.codeDepth.length - 1] === 1;
  },
  /* 是否结尾代码段落 */
  isEndOfCodeSection(level, preCalculate, justCheck) {
    if (justCheck) {
      return this.codeDepth[this.codeDepth.length - 1] - 1 === 0 && !isTopLevel(level);
    }
    if (preCalculate) {
      return --this.codeDepth[this.codeDepth.length - 1] === 0 && !isTopLevel(level);
    }
    return !isTopLevel(level) && --this.codeDepth[this.codeDepth.length - 1] === 0;
  },
  pushCodeSection() {
    this.codeDepth.push(0);
  },
  popCodeSection() {
    this.codeDepth.pop();
  },
  pushState() {
    this.state.push({
      code: this.code,
      scope: this.scope,
    });
    this.code = [];
    this.scope = [this.rootScope];
  },
  protectGenerateCode(level, fn) {
    const before = this.code.length;
    fn();
    if (this.code.length === before) {
      this.pushCode('null');
    }
  },
  popState() {
    const state = {
      code: this.code,
      scope: this.scope,
    };
    const pop = this.state.pop();
    this.code = pop.code;
    this.scope = pop.scope;
    return state;
  },
  pushCode(str) {
    const index = this.code.length;
    const content = str;
    this.code.push(content);
    return (fn) => {
      this.code[index] = fn(content);
    };
  },
  pushHeaderCode(str) {
    this.header.push(str);
  },
  throwParseError(config, originalError) {
    const { node, text, attrName, reason } = config;

    let { endIndex } = node;
    const { startIndex } = node;
    const code = this.template.substring(startIndex, endIndex + 1);
    let error;

    if (!text) {
      // 如果是属性错误，则将整个标签的开始标签提取出来，进行标记
      if (node.children && node.children[0]) {
        endIndex = node.children[0].startIndex - 1;
      } else {
        // 如果没有children，如果存在结束标签，因为结束标签不存在插值，较好匹配。正则取出其并计算结束位置
        const endTag = /<\/((?:[a-zA-Z_][\-\.0-9a-zA-Z_]*\:)?[a-zA-Z_][\-\.0-9a-zA-Z_]*)[^>]*>$/;
        const match = code.match(endTag);
        if (match) {
          endIndex = startIndex + match.index - 1;
        }
      }
    }

    const str = reportError(this.template, [startIndex, endIndex], 0);
    if (attrName) {
      error = `parse tag's attribute ${toLiteralString(attrName)} error: \n${str}`;
    } else if (text) {
      error = `parse text error: ${text} : \n${str}`;
    } else {
      error = `parse error: ${reason} : \n${str}`;
    }
    const oe = new Error(error);
    assign(oe, config, {
      startIndex,
      endIndex,
      originalError,
    });
    throw oe;
  },
  processExpression(exp, config) {
    try {
      return transformExpression(exp, this.scope, assign({
        strictDataMember: this.config.strictDataMember,
      }, config));
    } catch (e) {
      this.throwParseError(config, e);
    }
  },
  generateCodeForIfTag(c, attrName, children, indexHolder, level, inFor) {
    const attrs = c.attribs;

    if (attrs && attrName in attrs) {
      const ifValue = attrs[attrName];
      if (attrName === this.IF_ATTR_NAME && this.isStartOfCodeSection(level)) {
        this.pushCode('{');
      }
      let ifExp;
      if (ifValue && ifValue !== true) {
        ifExp = this.processExpression(ifValue, {
          node: c,
          attrName,
        });
      }
      this.pushCode('(');
      if (ifExp) {
        this.pushCode(`(${ifExp}) ?`);
      }
      this.pushCode('(');
      if (attrs[attrName]) {
        delete attrs[attrName];
      }
      if (this.config.useFragment && !attrs.key && !inFor) {
        attrs.key = this.getConditionalKey();
      }
      this.protectGenerateCode(level, () => {
        this.generateCodeForTag(c, level);
      });
      this.pushCode(')');
      const nextChild = children && children[indexHolder.i + 1];
      let transformed;
      if (ifExp) {
        this.pushCode(':');
      }
      if (nextChild) {
        const childAttrs = nextChild.attribs || {};
        [this.ELIF_ATTR_NAME, this.ELSE_ATTR_NAME].forEach((condition) => {
          if (condition in childAttrs) {
            indexHolder.i += 1;
            this.generateCodeForIfTag(nextChild, condition, children, indexHolder, level);
            transformed = true;
          }
        });
      }
      if (!transformed && ifExp) {
        this.pushCode('null');
      }
      this.pushCode(')');
      if (attrName === this.IF_ATTR_NAME && this.isEndOfCodeSection(level)) {
        this.pushCode('}');
      }
      return true;
    }
    return false;
  },
  generateCodeForTags(children, level, arrayForm) {
    arrayForm = arrayForm || isRenderChildrenArray.call(this, children);
    if (children && children.length) {
      children = children.filter((c) => {
        if (c.type === 'comment') {
          return false;
        }
        if (c.type === 'text' && !c.data.trim()) {
          return false;
        }
        return true;
      });

      const l = children.length;
      if (!l) {
        return;
      }

      if (arrayForm) {
        if (this.isStartOfCodeSection(level, true)) {
          this.pushCode('{');
        }
        this.pushCode('[');
      }
      for (let i = 0; i < l; i += 1) {
        const child = children[i];
        const currentCodeLength = this.code.length;
        const indexHolder = { i };
        // for has higher priority than if
        if (isFor(child, this.FOR_ATTR_NAME) || !this.generateCodeForIfTag(child, this.IF_ATTR_NAME, children, indexHolder, level)) {
          this.generateCodeForTag(child, level);
        }
        i = indexHolder.i;
        if (arrayForm && isJsx(child)) {
          if (this.code.length === currentCodeLength) {
            this.pushCode('null,');
          } else {
            this.pushCode(',');
          }
        }
      }

      if (arrayForm) {
        this.pushCode(']');
        if (this.isEndOfCodeSection(level, true)) {
          this.pushCode('}');
        }
      }
    }
  },
  getTemplateProps(node, attrs) {
    const data = attrs.data ? this.processExpression(attrs.data, {
      forceObject: true,
      node,
      attrName: 'data',
    }) || 'null' : 'null';
    let key;
    if (attrs.key) {
      key = this.processExpression(attrs.key, {
        node,
        attrName: 'data',
      });
    }
    return { data, key };
  },
  getJsonCode(json) {
    const code = ['({'];
    Object.keys(json).forEach((key) => {
      code.push(`${key}: ${json[key]},`);
    });
    code.push('})');
    return code.join('\n');
  },
  getTransformedAttrs(transformedAttrs, node, attributeProcessor, jsx = true) {
    const attrs = node.attribs || {};
    Object.keys(attrs).forEach((attrName) => {
      if (this.SPECIAL_ATTRS.indexOf(attrName) !== -1) {
        return;
      }
      let attrValue = attrs[attrName];
      let transformedAttrValue = attrValue;
      if (attrValue === null) {
        return;
      }
      const info = {
        attrValue,
        attrName,
        attrKey: attrName,
        node,
        attrs,
        transformedAttrs,
        transformer: this,
      };
      if (attributeProcessor && attributeProcessor(info) === false) {
        return;
      }
      attrValue = info.attrValue;
      if (typeof attrValue === 'string') {
        if (jsx) {
          transformedAttrValue = '{';
        } else {
          transformedAttrValue = '';
        }

        transformedAttrValue += this.processExpression(attrValue, {
          node,
          attrName,
        });
        if (jsx) {
          transformedAttrValue += '}';
        }
      } else {
        transformedAttrValue = null;
      }
      if (attrName === 'class') {
        attrName = 'className';
      }
      if ((attrName === 'className' || attrName === 'style') && !transformedAttrValue) {
        return;
      }
      if (transformedAttrValue !== undefined) {
        transformedAttrs[attrName] = transformedAttrValue;
      }
    });
    return transformedAttrs;
  },
  generateCodeForTag(node, level) {
    const { importTplDeps, subTemplatesCode, componentDeps, includeTplDeps } = this;
    const { attributeProcessor, tagProcessor, allowScript, useFragment } = this.config;
    level = level || 0;

    if (node.type === 'text') {
      const text = node.data.trim();
      if (text) {
        const codeText = `${this.isStartOfCodeSection(level) ? '{' : ''}${this.processExpression(text, {
          node,
          text,
        })}${this.isEndOfCodeSection(level) ? '}' : ''}`;
        this.pushCode(codeText);
      }
      return;
    }

    if (node.type === 'script' && allowScript) {
      let { children } = node;

      children = children && children[0];
      const script = children && children.data;
      if (script) {
        this.header.push(script.trim());
      }
    }

    let tag = node.type === 'tag' && node.name;
    if (!tag) {
      return;
    }

    const attrs = node.attribs || {};

    if (attrs[this.ELIF_ATTR_NAME] || attrs[this.ELSE_ATTR_NAME]) {
      this.throwParseError({
        node,
        reason: `can not use ${this.ELIF_ATTR_NAME}|${this.ELSE_ATTR_NAME} without ${this.IF_ATTR_NAME}`,
      });
    }

    const hasChildren = node.children && node.children.length;

    // define slot and default content
    if (tag === 'slot') {
      if (this.isStartOfCodeSection(level)) {
        this.pushCode('{');
      }
      const transformedAttrs = this.getTransformedAttrs({}, node, null, false);
      const _slot = transformedAttrs.name || '"$default"';
      delete transformedAttrs.name;
      this.pushCode(`$renderSlot(_ctx, ${_slot}`);
      if (hasChildren) {
        // do not push code section, still inside
        // {_ctx.$slots.x || <view/>}
        this.pushCode(', (');
        this.protectGenerateCode(level, () => {
          this.generateCodeForTags(node.children, level + 2);
        });
        this.pushCode(')');
      } else {
        this.pushCode(', null');
      }
      if (Object.keys(transformedAttrs).length) {
        this.pushCode(`, ${this.getJsonCode(transformedAttrs)}`);
      }
      this.pushCode(')');
      if (this.isEndOfCodeSection(level)) {
        this.pushCode('}');
      }
      return;
    }

    const { tag: sjsTag, module: sjsModule, src: sjsSrc } = this.config.sjsTemplate;
    if (tag === sjsTag) {
      if (attrs[sjsModule]) {
        if (attrs[sjsSrc] == null) {
          this.throwParseError({
            node,
            reason: `"${sjsSrc}" expected in ${sjsTag} tag`,
          });
        }
      }

      const depCode = getDepCode.call(this, node, sjsTag, processSJSImport);
      if (depCode) {
        this.header.push(`import ${depCode} from ${toLiteralString(`${checkImport(attrs[sjsSrc], this.config.sjsExtname, this.config)}`)};`);
      }
      return;
    }

    let inFor = false;
    let inForIf = false;
    let forKey;
    let forStartCodeLength;
    if (this.FOR_ATTR_NAME in attrs) {
      inFor = true;
      if (this.isStartOfCodeSection(level, true)) {
        this.pushCode('{');
      }
      const forExp = this.processExpression(attrs[this.FOR_ATTR_NAME], {
        node,
        attrName: this.FOR_ATTR_NAME,
      });
      const indexName = attrs[this.FOR_INDEX_ATTR_NAME] || 'index';
      const itemName = attrs[this.FOR_ITEM_ATTR_NAME] || 'item';
      const keyName = attrs[this.FOR_KEY_ATTR_NAME];

      if (keyName && !hasExpression(keyName) && validKeyName(keyName)) {
        forKey = keyName === '*this' ? itemName : `${itemName}.${keyName}`;
      }

      if (!validVariableName(indexName) || !validVariableName(itemName)) {
        this.throwParseError({
          node,
          reason: `invalid ${this.FOR_INDEX_ATTR_NAME}|${this.FOR_ITEM_ATTR_NAME}`,
        });
      }

      this.scope.push(this._makeScope({
        [indexName]: 1,
        [itemName]: 1,
      }));
      this.pushCode(`$iterate(${forExp}, (${itemName}, ${indexName}) => {`);
      level += 2;
      this.pushCode('return (');
      level += 2;
      delete attrs[this.FOR_ATTR_NAME];
      forStartCodeLength = this.code.length;
      inForIf = this.generateCodeForIfTag(node, this.IF_ATTR_NAME, null, null, level, true);
    }

    if (!inForIf) {
      if (tag === 'block') {
        const _transformedAttrs = {};
        if (forKey) {
          _transformedAttrs.key = `${forKey}`;
        }
        this.getTransformedAttrs(_transformedAttrs, node, attributeProcessor, false);
        if (this.isStartOfCodeSection(level)) {
          this.pushCode('{');
        }
        const hasKeyAttr = useFragment && 'key' in _transformedAttrs;
        if (useFragment) {
          this.pushCode('$createBlock(');
        } else {
          this.pushCode('(');
        }
        this.protectGenerateCode(level, () => {
          if (hasChildren) {
            this.generateCodeForTags(node.children, level);
          }
        });
        if (hasKeyAttr) {
          this.pushCode(',');
          this.pushCode(getRawJson({ key: _transformedAttrs.key }));
        }
        this.pushCode(')');
        if (this.isEndOfCodeSection(level)) {
          this.pushCode('}');
        }
      } else if (tag === 'template') {
        // use
        if (attrs.is) {
          const data = this.getTemplateProps(node, attrs);
          const is = this.processExpression(attrs.is, {
            node,
            attrName: 'is',
          });
          this.pushCode(`${this.isStartOfCodeSection(level) ? '{ ' : ''}$useTemplate($templates[${is}], ${data.data}, _ctx)${this.isEndOfCodeSection(level) ? ' }' : ''}`);
        } else {
          // define
          this.pushState();
          const { name } = attrs;

          this.generateCodeForTags(node.children, TOP_LEVEL);
          subTemplatesCode[name] = { code: this.popState().code, node };
        }
      } else if (tag === 'import') {
        const importPath = checkImport(attrs.src, this.config.templateExtname, this.config);
        importTplDeps[importPath] = importTplDeps[importPath] || this.importIncludeIndex++;
      } else if (tag === 'include') {
        const includePath = checkImport(attrs.src, this.config.templateExtname, this.config);
        includeTplDeps[includePath] = includeTplDeps[includePath] || this.importIncludeIndex++;
        this.pushCode(`${this.isStartOfCodeSection(level) ? '{ ' : ''}$render$${includeTplDeps[includePath]}.apply(this, arguments)${this.isEndOfCodeSection(level) ? ' }' : ''}`);
      } else {
        let _transformedAttrs = {};
        if (forKey) {
          _transformedAttrs.key = `{${forKey}}`;
        }
        this.getTransformedAttrs(_transformedAttrs, node, attributeProcessor);
        const originalTag = tag;
        if (tagProcessor) {
          const tagProcessRet = tagProcessor({
            attrs,
            transformedAttrs: _transformedAttrs,
            node,
            tag,
          });
          if (tagProcessRet === false) {
            return;
          }
          if (tagProcessRet) {
            tag = tagProcessRet.tag || tag;
            _transformedAttrs = tagProcessRet.transformedAttrs || _transformedAttrs;
          }
        }
        componentDeps[originalTag] = 1;
        const nextLevel = level + 2;

        if (Object.keys(_transformedAttrs).length) {
          this.pushCode(`<${tag} `);
          this.pushCode(getRawJSXAttributeFromJson(_transformedAttrs));
          this.pushCode('>');
        } else {
          this.pushCode(`<${tag}>`);
        }
        // built-in components
        if (hasChildren) {
          // new code section start
          // <view>{}</view>
          this.pushCodeSection();
          this.generateCodeForTags(node.children, nextLevel, false);
          this.popCodeSection();
        }

        this.pushCode(`</${tag}>`);
      }
    }

    if (inFor) {
      // protect for empty
      if (forStartCodeLength === this.code.length) {
        this.pushCode('null');
      }
      level -= 2;
      this.pushCode(');');
      if (this.scope.length > 1) {
        this.scope.pop();
      }
      level -= 2;
      this.pushCode('})');
      if (this.isEndOfCodeSection(level, true)) {
        this.pushCode('}');
      }
    }
  },
  transform(done) {
    const { code, importTplDeps, componentDeps, subTemplatesCode, includeTplDeps, templateRenderHelpers } = this;
    let { header } = this;
    const { importComponent = defaultImportComponent, strictDataMember } = this.config;

    const handlerCallback = (error, children) => {
      if (error) {
        return done(error);
      }

      try {
        this.generateCodeForTags(children, TOP_LEVEL);
      } catch (e) {
        return done(e);
      }

      if (!code.length) {
        code.push('null');
      }

      header.push(
        `const $iterate = ${templateRenderHelpers}.iterate;`,
        `const $createRoot = ${templateRenderHelpers}.createRoot;`,
        `const $createBlock = ${templateRenderHelpers}.createBlock;`,
        `const $useTemplate = ${templateRenderHelpers}.useTemplate;`,
        `const $renderSlot = ${templateRenderHelpers}.renderSlot;`,
        `const $getSJSMember = ${templateRenderHelpers}.getSJSMember;`,
        `const $toString = ${templateRenderHelpers}.toString;`,
      );

      if (strictDataMember === false) {
        header.push(
          `const $getLooseDataMember = ${templateRenderHelpers}.getLooseDataMember;`,
        );
      }

      const subTemplatesName = [];
      Object.keys(importTplDeps).forEach((dep) => {
        const index = importTplDeps[dep];
        header.push(`${IMPORT} { $ownTemplates as $ownTemplates${index} } from ${toLiteralString(dep)};`);
        subTemplatesName.push(`$ownTemplates${index}`);
      });
      Object.keys(includeTplDeps).forEach((dep) => {
        const index = includeTplDeps[dep];
        header.push(`${IMPORT} $render$${index} from ${toLiteralString(dep)};`);
      });

      header.push(''); // empty line

      const hasOwnTemplates = Object.keys(subTemplatesCode).length;
      if (hasOwnTemplates) {
        header.push('export const $ownTemplates = {};');
      }
      Object.keys(subTemplatesCode).forEach((name) => {
        const { code: templateCode } = subTemplatesCode[name];

        header.push(`$ownTemplates[${toLiteralString(name)}] = function (data, _ctx) {`);
        this.pushHeaderCode('return (');
        header = this.header = header.concat(templateCode.length ? templateCode : ['null']);
        this.pushHeaderCode(');');
        header.push('};');
      });
      header.push('let $templates = {};');
      if (subTemplatesName.length) {
        header.push('$templates = {');
        subTemplatesName.forEach((name) => {
          this.pushHeaderCode(`...${name},`);
        });
        if (hasOwnTemplates) {
          this.pushHeaderCode('...$ownTemplates,');
        }
        header.push('};');
      } else if (hasOwnTemplates) {
        header.push('$templates = $ownTemplates;');
      }
      header.push(HEADER);

      try {
        Object.keys(componentDeps).forEach((dep) => {
          const importStatement = importComponent(dep);
          if (importStatement !== false) {
            header.push(importStatement);
          }
        });
      } catch (e) {
        return done(e);
      }

      this.pushHeaderCode('return $createRoot(');
      this.pushCode(');');
      code.push('};');
      this.code = header.concat(code);
      let retCode = this.code.join('\n');
      if (this.config.formatCode) {
        retCode = this.config.formatCode(retCode);
      }
      done(null, retCode);
    };

    const handler = new DomHandler(handlerCallback, {
      normalizeWhitespace: false,
      withStartIndices: true,
      withEndIndices: true,
    });

    const parser = new HtmlParser(handler, {
      omitEndTag: this.config.omitEndTag,
      xmlMode: true,
    });

    try {
      parser.write(this.template);
      parser.end();
    } catch (e) {
      let { message = '' } = e;
      const { _index = 0 } = e;

      message += ` : \n${reportError(this.template, _index)}`;
      const newError = new Error(message);
      assign(newError, {
        startIndex: _index,
        endIndex: _index,
      });
      done(newError);
    }
  },
});

module.exports = MLTransformer;
