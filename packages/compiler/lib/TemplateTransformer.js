const assign = require('object-assign');
const { Transformer } = require('./rml');
const path = require('path');
const resolve = require('resolve');
const fs = require('fs');
const defaultLib = require('./defaultLib');
const { toComponentName } = require('./utils');
const {
  getPluginPath,
  PLUGIN_PRIVATE_PREFIX,
  PLUGIN_PREFIX,
} = require('./pluginUtils');

const tagAttrName = '__tag';
const ownerAttrName = '__owner';
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
    header.push('const $createReactElement = React && React.createElement;');
    header.push(
      'const $getComponentEventHandler = (instance, name) => instance.$getComponentEventHandler && instance.$getComponentEventHandler(name);',
    );
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

    const depUIPkg = (dep) => `'${UILibrary}/${dep}'`;

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
        const eventReg = /^(bind:?|catch:?|capture-bind:|capture-catch:)([A-Za-z_]+)/;
        const isEvent = attrName.match(eventReg);

        if (isEvent) {
          attrName = attrName.replace(eventReg, ($0, $1, $2) => {
            if (/^bind:?$/.test($1)) {
              return `on${$2}`;
            } else if (/^catch:?$/.test($1)) {
              return `catch${$2}`;
            } else if (/^capture-bind:$/.test($1)) {
              return `on${$2}capture`;
            } else if (/^capture-catch:$/.test($1)) {
              return `catch${$2}capture`;
            } else {
              return $0;
            }
          });

          const handlerFn = this.processExpression(attrValue, {
            node,
            attrName,
          });

          const handleFn = (usingComponents && usingComponents[node.name])
            || node.name === 'component'
            ? '$getComponentEventHandler'
            : '$getEventHandler';

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
        // IDE的构建统计，容器需要
        if (
          typeof global !== 'undefined'
          && typeof global.miniComponentSet !== 'undefined'
        ) {
          global.miniComponentSet.add(tag);
        }
        // custom component does not need to be
        const componentInfo = usingComponents && usingComponents[tag];
        if (componentInfo || tag === 'component') {
          // prevent 'babel-plugin-transform-react-constant-elements'
          transformedAttrs.$isCustomComponent = '{this.$isCustomComponent}';
          // for devtools inspect
          transformedAttrs[tagAttrName] = `"${tag}"`;
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
            : `import ${depName} from ${depUIPkg(dep)};`,

          `const ${componentName} = ${tmpComponentName} || ${`${placeholderFactory}(${JSON.stringify(
            dep,
          )})`};`,

        ].join('\n');
      },
    });
  }
}

module.exports = TemplateTransformer;