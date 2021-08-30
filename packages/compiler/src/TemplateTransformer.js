const assign = require('object-assign');
const path = require('path');
const resolve = require('resolve');
const fs = require('fs');
const { Transformer } = require('./xml');
const defaultLib = require('./defaultLib');
const { toComponentName, supportedWebcomponents } = require('./utils');

const ATTR_NAME_REG = /^[\w-:]+$/;

class TemplateTransformer extends Transformer {
  constructor(template, _config) {
    _config = assign({}, _config);
    _config.nodeModules = {
      path,
      resolve,
      fs,
    };
    _config.useFragment = false;
    _config.templateRuntimeModule = defaultLib.templateRuntimeModule;

    super(template, _config);

    const { config, header } = this;

    header.push('');
    const {
      usingComponents,
      pluginId,
      isWorker,
      supportSjsHandler,
    } = config;

    let { placeholderFactory } = config;
    if (!placeholderFactory) {
      placeholderFactory = '$EmptyComponentFactory';
      header.push(
        `const $EmptyComponentFactory = ${_config.templateRuntimeModule}.EmptyComponentFactory;`,
      );
    }

    assign(config, {
      attributeProcessor: ({ attrValue, attrName, transformedAttrs, node }) => {
        if (!attrName.match(ATTR_NAME_REG)) {
          return false;
        }

        /* 处理事件绑定模版 */
        const xmlEventReg = /^(bind:?|catch:?|capture-bind:|capture-catch:)([A-Za-z_]+)/;

        const isEvent = xmlEventReg.test(attrName);

        if (isEvent) {
          attrName = attrName.replace(xmlEventReg, (match, $1, $2) => {
            if (/^bind:?$/.test($1)) {
              return `bind${$2}`;
            } else if (/^catch:?$/.test($1)) {
              return `catch${$2}`;
            } else if (/^capture-bind:$/.test($1)) {
              return `capture-bind${$2}`;
            } else if (/^capture-catch:$/.test($1)) {
              return `capture-catch${$2}`;
            } else {
              return match;
            }
          });

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
      tagProcessor: ({ node, tag, attrs, transformedAttrs }) => {
        if (
          typeof global !== 'undefined'
          && typeof global.miniComponentSet !== 'undefined'
        ) {
          global.miniComponentSet.add(tag);
        }

        if (tag.toLowerCase() !== tag) {
          throw new Error(
            `parse <${tag}> error: Custom Component'name should be form of my-component, not myComponent or MyComponent`,
          );
        }

        return {
          tag: toComponentName(tag),
        };
      },
      importComponent(dep) {
        if (supportedWebcomponents.indexOf(dep) !== -1) {
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
