const assign = require('object-assign');
const path = require('path');
const resolve = require('resolve');
const fs = require('fs');
const { Transformer } = require('./xml');
const defaultLib = require('./defaultLib');
const { toComponentName } = require('./utils');
const {
  getPluginPath,
  PLUGIN_PRIVATE_PREFIX,
  PLUGIN_PREFIX,
} = require('./pluginUtils');

const tagAttrName = '__tag';
const ownerAttrName = '__owner';
const pageAttrName = '__page';
const ATTR_NAME_REG = /^[\w-:]+$/;

function getComponentInfo({ pluginId, componentInfo, isWorker }) {
  if (isWorker) {
    return componentInfo;
  }
  const startWithPlugin = componentInfo.startsWith(PLUGIN_PREFIX)
    || componentInfo.startsWith(PLUGIN_PRIVATE_PREFIX);
  return pluginId && !startWithPlugin
    ? getPluginPath(pluginId, componentInfo.slice(1))
    : componentInfo;
}

class TemplateTransformer extends Transformer {
  constructor(template, _config) {
    _config = assign({}, _config);
    _config.nodeModules = {
      path,
      resolve,
      fs,
    };
    _config.useFragment = false;
    _config.templateExtname = _config.templateExtname;
    _config.templateRuntimeModule = defaultLib.templateRuntimeModule;

    super(template, _config);

    const { config, header } = this;
    header.push('');
    header.push('const $createReactElement = Nerv && Nerv.createElement;');
    header.push(
      'const $getEventHandler = (instance, name) => instance.$getEventHandler(name);',
    );
    header.push(
      'const $getRefHandler = (instance, name) => instance.$getRefHandler(name);',
    );
    header.push(
      'const $getComRefHandler = (instance, name) => instance.$getComRefHandler && instance.$getComRefHandler(name);',
    );
    header.push('');
    const {
      library = defaultLib.tinyBaseModule,
      UILibrary = defaultLib.tinyUIModule,
      usingComponents,
      pluginId,
      isWorker,
      supportSjsHandler,
    } = config;

    const depUIPkg = (dep) => `${UILibrary}['${dep}']`;

    let { placeholderFactory } = config;
    if (!placeholderFactory) {
      placeholderFactory = '$EmptyComponentFactory';
      header.push(
        `const $EmptyComponentFactory = ${_config.templateRuntimeModule}.EmptyComponentFactory;`,
      );
    }

    if (usingComponents && Object.keys(usingComponents).length) {
      header.push(`const { getComponentClass } = ${library};`);
      header.push('const $getComponentClass = (name) => getComponentClass && getComponentClass(name);');
      header.push('');
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

          const handleFn = '$getEventHandler';

          transformedAttrs[attrName] = `{${handleFn}(this, ${handlerFn})}`;
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
        // custom component does not need to be
        const componentInfo = usingComponents && usingComponents[tag];
        /* 自定义组件 */
        if (componentInfo || tag === 'component') {
          // for devtools inspect
          transformedAttrs[tagAttrName] = `"${tag}"`;
          transformedAttrs[ownerAttrName] = '{this}';
          transformedAttrs[pageAttrName] = `{this.$isCustomComponent ? this.props['${pageAttrName}'] : this}`;
        } else if (this.config.pluginId || supportSjsHandler) {
          // for plugin auth
          transformedAttrs[ownerAttrName] = '{this}';
        }
        Object.keys(attrs).forEach((attrName) => {
          if (attrName === 'ref') {
            if (componentInfo || tag === 'component') {
              const handlerFn = this.processExpression(attrs[attrName], {
                node,
                attrName,
              });

              transformedAttrs.ref = `{$getComRefHandler(this, ${handlerFn})}`;
            } else if (!attrs.id) {
              delete transformedAttrs.ref;
            }
          } else if (!componentInfo && attrName === 'id') {
            const handlerFn = this.processExpression(attrs[attrName], {
              node,
              attrName,
            });
            transformedAttrs.ref = `{$getRefHandler(this, ${handlerFn})}`;
          }
        });
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
        const componentInfo = usingComponents && usingComponents[dep];
        const componentName = toComponentName(dep);

        const tmpComponentName = `${componentName}_`;
        const depName = tmpComponentName;

        return [
          componentInfo
            ? `const ${tmpComponentName} = $getComponentClass(${JSON.stringify(
              getComponentInfo({
                pluginId,
                componentInfo,
                isWorker,
              }),
            )})`
            : `const ${depName} = ${depUIPkg(dep)};`,

          `const ${componentName} = ${tmpComponentName} || ${`${placeholderFactory}(${JSON.stringify(
            dep,
          )})`};`,

        ].join('\n');
      },
    });
  }
}

module.exports = TemplateTransformer;
