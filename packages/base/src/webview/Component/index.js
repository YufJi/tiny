import { define, WeElement, h } from 'omi';
import { isEqual, mapValues, forOwn, hasIn, kebabCase, memoize, camelCase, isPlainObject, isObject } from 'lodash';
import { CustomEvent, getType, TemplateTag } from 'shared';

import { mergeData } from '../util';
import transformRpx from '../util/transformRpx';

const { PageEvent, ComponentEvent, ComponentDataChange } = CustomEvent;

export default function registryCustomComponent(provide) {
  const { config } = provide;
  const { __allConfig__, route, customComponents } = config;
  const { usingComponents } = __allConfig__[route];
  const registryedMap = new Map();

  const loop = (usingComponents) => {
    for (let i = 0; i < Object.entries(usingComponents).length; i+=1) {
      const [name, is] = Object.entries(usingComponents)[i];

      if (registryedMap.has(name)) {
        continue;
      }

      /* 自定义组件初始config */
      const customComponentConfig = customComponents[is];
      // 自定义组件名
      defineCustomComponent(`${TemplateTag.LowerCasePrefix}-${name}`, is, customComponentConfig, provide);

      registryedMap.set(name, true);

      /* 自定义组件下的组件引用 */
      const using = __allConfig__[is].usingComponents;

      for (const name in using) {
        if (Object.hasOwnProperty.call(using, name)) {
          if (using[name] === is) {
            delete using[name];
          }
        }
      }

      loop(using);
    }
  };

  loop(usingComponents);
}

function defineCustomComponent(name, is, componentConfig, provide) {
  const { properties = {}, data = {} } = componentConfig;
  const { render: vdom, stylesheet } = window.app[is];

  const { bridge, config, componentHub } = provide;

  define(name, class extends WeElement {
    static css = transformRpx(stylesheet.toString())

    static properties = properties

    constructor() {
      super();
      this.data = data;

      const { publish } = bridge;

      componentHub.instances.set(this.elementId, this);

      publish(ComponentEvent, { route: is, nodeId: this.elementId, eventName: 'created' });
    }

    attached() {
      const { publish } = bridge;
      // 同步组件信息
      this.syncInfo({
        id: this.id,
        className: this.className,
      });
      // 同步props
      this.syncProps(normalizeProps(this.props, this.constructor.properties));
      // 同步dataset
      this.syncDataset(this._dataset);

      publish(ComponentEvent, { route: is, nodeId: this.elementId, eventName: 'attached' });
    }

    ready() {
      const { publish } = bridge;

      publish(ComponentEvent, { route: is, nodeId: this.elementId, eventName: 'ready' });
    }

    detached() {
      const { publish } = bridge;
      componentHub.instances.remove(this.elementId);
      publish(ComponentEvent, { route: is, nodeId: this.elementId, eventName: 'detached' });
    }

    receiveProps(newProps, oldProps) {
      const _props = normalizeProps(newProps, this.constructor.properties);

      const changedProps = {};
      forOwn(_props, (val, key) => {
        if (!isEqual(oldProps[key], val)) {
          changedProps[key] = val;
        }
      });

      this.syncDataset(this._dataset);

      if (Object.keys(changedProps).length) {
        this.syncProps(changedProps);
        return true;
      }

      return false;
    }

    syncInfo(info) {
      const { publish } = bridge;
      const { id, className } = info;

      publish(ComponentDataChange, {
        datatype: 'instance',
        data: {
          id: id || '',
          className: className || '',
        },
        nodeId: this.elementId,
      });
    }

    // 当props变化后发送通知
    syncProps(props) {
      const { publish } = bridge;

      mergeData(this.data, props);

      publish(ComponentDataChange, {
        datatype: 'properties',
        data: props,
        nodeId: this.elementId,
      });
    }

    // 当dataset变化后发送通知
    syncDataset(dataset) {
      const { publish } = bridge;

      publish(ComponentDataChange, {
        datatype: 'dataset',
        data: dataset,
        nodeId: this.elementId,
      });
    }

    eventBinder(methodName) {
      const { publish } = bridge;
      const { elementId: nodeId } = this;

      const handler = function (data) {
        return publish(PageEvent, { type: methodName, data, nodeId });
      };
      handler.displayName = methodName;
      return handler;
    }

    render() {
      const { data } = this;

      return vdom(data, {
        $$class(cls) {
          return `${String(cls)}`;
        },
        $$eventBinder: this.eventBinder.bind(this),
      });
    }
  });
}

const blackPropList = [];
function normalizeProps(props, properties) {
  const obj = {};
  for (let i = 0; i < Object.entries(properties).length; i+=1) {
    const [key, value] = Object.entries(properties)[i];
    // eslint-disable-next-line no-continue
    if (blackPropList.indexOf(key) !== -1) continue;
    // eslint-disable-next-line no-loop-func
    [key, kebabCase(key)].forEach((k) => {
      if (hasIn(props, k)) {
        obj[key] = normalizeValue(value.type, props[k]);
      }
    });
  }

  return obj;
}

const ValidateStrategy = {
  String(o) {
    return isPlainObject(o) ? '[object Object]' : o ? String(o) : '';
  },
  Number(o) {
    return isNaN(Number(o)) ? 0 : Number(o);
  },
  Object(o) {
    return Array.isArray(o) ? o : isObject(o) ? {} : null;
  },
  Boolean(o) {
    return !!o;
  },
  Array(o) {
    return [];
  },
  Null(o) {
    return o;
  },
};
function normalizeValue(type, value) {
  return getType(value) === type
    ? value
    : ValidateStrategy[type] && ValidateStrategy[type].call(ValidateStrategy, value) || null;
}
