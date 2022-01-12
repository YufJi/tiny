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

      this._type_ = 'component';

      this.data = data;

      this.subscriber = this.listenDataChange();

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
      this.syncProps(this.normalizeProps(this.props, this.constructor.properties));
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
      this.subscriber.remove();

      publish(ComponentEvent, { route: is, nodeId: this.elementId, eventName: 'detached' });
    }

    receiveProps(newProps, oldProps) {
      const changedData = {};

      Object.keys(properties).forEach((key) => {
        const { type } = properties[key];

        const val = newProps[key] || newProps[kebabCase(key)];
        const oldVal = oldProps[key] || oldProps[kebabCase(key)];

        if (!isEqual(val, oldVal)) {
          changedData[camelCase(key)] = this.normalizeValue(type, val);
        }
      });

      this.syncDataset(this._dataset);

      if (Object.keys(changedData).length) {
        this.syncProps(changedData);
        return true;
      }

      return false;
    }

    listenDataChange() {
      const { elementId: nodeId } = this;

      return componentHub.events.subscribe(ComponentDataChange, nodeId, (e) => {
        const { data } = e;

        this.setData(data);
      });
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
