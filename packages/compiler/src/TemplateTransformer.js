const path = require('path');
const fs = require('fs');
const resolve = require('resolve');
const assign = require('object-assign');

const { Transformer } = require('./xml');
const defaultLib = require('./defaultLib');
const { toComponentName, supportedWebComponents, supportedH5Tags } = require('./utils');

/* 属性名正则 */
const ATTR_NAME_REG = /^[\w-:]+$/;

class TemplateTransformer extends Transformer {
  constructor(template, _config) {
    _config = assign({}, _config);
    /* 缓存node模块 */
    _config.nodeModules = {
      path,
      resolve,
      fs,
    };
    _config.useFragment = false;
    /* 模版运行时helpers */
    _config.templateRenderHelpers = defaultLib.templateRenderHelpers;

    super(template, _config);

    const { config, header } = this;

    header.push('');

    const {
      usingComponents,
    } = config;

    assign(config, {
      attributeProcessor: ({ attrValue, attrName, transformedAttrs, node }) => {
        if (!attrName.match(ATTR_NAME_REG)) {
          return false;
        }

        /* 处理事件绑定模版 */
        const xmlEventReg = /^(bind:?|catch:?|capture-bind:|capture-catch:)([A-Za-z_]+)/;

        const isEvent = xmlEventReg.test(attrName);

        if (isEvent) {
          /* 处理一下方便jsx中正则匹配 */
          // attrName = attrName.replace(xmlEventReg, (match, $1, $2) => {
          //   if (/^bind:?$/.test($1)) {
          //     return `bind${$2}`;
          //   } else if (/^catch:?$/.test($1)) {
          //     return `catch${$2}`;
          //   } else if (/^capture-bind:$/.test($1)) {
          //     return `capture-bind${$2}`;
          //   } else if (/^capture-catch:$/.test($1)) {
          //     return `capture-catch${$2}`;
          //   } else {
          //     return match;
          //   }
          // });

          const handlerFn = this.processExpression(attrValue, {
            node,
            attrName,
          });

          const handleFn = '_ctx.$$eventBinder';

          transformedAttrs[attrName] = `{${handleFn}(${handlerFn})}`;
          return false;
        } else if (attrName === 'children') {
          throw new Error(
            `${node.name} can not have children prop, please change prop name!`,
          );
        }
        return undefined;
      },
      tagProcessor: ({ tag }) => {
        return {
          tag: toComponentName(tag),
        };
      },
      importComponent(dep) {
        if (supportedWebComponents.indexOf(dep) !== -1 || supportedH5Tags.indexOf(dep) !== -1) {
          return;
        }

        const componentInfo = usingComponents && usingComponents[dep];

        if (!componentInfo) return;

        const componentName = toComponentName(dep);

        return [
          `const ${componentName} = _ctx.$$resolveComponent(${JSON.stringify(dep)})`,
        ].join('\n');
      },
    });
  }
}

module.exports = TemplateTransformer;
